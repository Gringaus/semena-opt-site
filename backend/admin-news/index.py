import json
import os
import re
import base64
from datetime import datetime
import psycopg2
import boto3

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
    'Access-Control-Max-Age': '86400',
}


def handler(event, context):
    """CRUD для новостей: GET — список (публичный), POST/PUT/DELETE — для админа."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    try:
        if method == 'GET':
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT id, slug, date_label, tag, title, text, content, image, published FROM news ORDER BY id DESC"
                )
                rows = cur.fetchall()
            data = [
                {
                    'id': r[0], 'slug': r[1], 'date': r[2], 'tag': r[3],
                    'title': r[4], 'text': r[5],
                    'content': [p for p in (r[6] or '').split('\n\n') if p.strip()],
                    'image': r[7], 'published': r[8],
                }
                for r in rows
            ]
            return _json(200, {'items': data})

        if not _check_auth(event, conn):
            return _json(401, {'error': 'unauthorized'})

        body = json.loads(event.get('body') or '{}')
        image_url = _resolve_img(body)

        if method == 'POST':
            slug = body.get('slug') or _slugify(body.get('title', ''))
            with conn.cursor() as cur:
                cur.execute(
                    """INSERT INTO news (slug, date_label, tag, title, text, content, image, published)
                       VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id""",
                    (
                        slug, body.get('date', ''), body.get('tag', 'Новость'),
                        body.get('title', ''), body.get('text', ''),
                        body.get('content', ''), image_url, bool(body.get('published', True)),
                    ),
                )
                new_id = cur.fetchone()[0]
                conn.commit()
            return _json(200, {'id': new_id, 'image': image_url})

        if method == 'PUT':
            item_id = body.get('id')
            if not item_id:
                return _json(400, {'error': 'id required'})
            with conn.cursor() as cur:
                cur.execute(
                    """UPDATE news SET slug=%s, date_label=%s, tag=%s, title=%s, text=%s,
                       content=%s, image=%s, published=%s WHERE id=%s""",
                    (
                        body.get('slug', ''), body.get('date', ''), body.get('tag', 'Новость'),
                        body.get('title', ''), body.get('text', ''),
                        body.get('content', ''), image_url, bool(body.get('published', True)),
                        int(item_id),
                    ),
                )
                conn.commit()
            return _json(200, {'ok': True, 'image': image_url})

        if method == 'DELETE':
            item_id = body.get('id') or (event.get('queryStringParameters') or {}).get('id')
            if not item_id:
                return _json(400, {'error': 'id required'})
            with conn.cursor() as cur:
                cur.execute("DELETE FROM news WHERE id=%s", (int(item_id),))
                conn.commit()
            return _json(200, {'ok': True})

        return _json(405, {'error': 'Method Not Allowed'})
    finally:
        conn.close()


def _resolve_img(body):
    img_b64 = body.get('imageBase64')
    if img_b64:
        filename = body.get('imageFilename') or 'news.jpg'
        safe_name = re.sub(r'[^A-Za-z0-9._-]+', '_', filename)
        key = f'news/{int(datetime.utcnow().timestamp())}_{safe_name}'
        raw = base64.b64decode(img_b64)
        ctype = body.get('imageContentType') or _guess_ct(safe_name)
        s3 = boto3.client(
            's3',
            endpoint_url='https://bucket.poehali.dev',
            aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
            aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
        )
        s3.put_object(Bucket='files', Key=key, Body=raw, ContentType=ctype)
        return f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"
    return body.get('image', '')


def _guess_ct(filename):
    low = filename.lower()
    if low.endswith('.png'):
        return 'image/png'
    if low.endswith('.webp'):
        return 'image/webp'
    if low.endswith('.gif'):
        return 'image/gif'
    if low.endswith('.svg'):
        return 'image/svg+xml'
    return 'image/jpeg'


def _check_auth(event, conn):
    headers = event.get('headers') or {}
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token')
    if not token:
        return False
    with conn.cursor() as cur:
        cur.execute("SELECT expires_at FROM admin_sessions WHERE token=%s", (token,))
        row = cur.fetchone()
    return bool(row and row[0] > datetime.utcnow())


def _slugify(title):
    t = title.lower().strip()
    translit = {
        'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'e','ж':'zh','з':'z',
        'и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r',
        'с':'s','т':'t','у':'u','ф':'f','х':'h','ц':'c','ч':'ch','ш':'sh','щ':'sch',
        'ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya',
    }
    out = ''.join(translit.get(ch, ch) for ch in t)
    out = re.sub(r'[^a-z0-9]+', '-', out).strip('-')
    return out or f'item-{int(datetime.utcnow().timestamp())}'


def _json(status, data):
    return {
        'statusCode': status,
        'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
        'body': json.dumps(data, ensure_ascii=False),
    }
