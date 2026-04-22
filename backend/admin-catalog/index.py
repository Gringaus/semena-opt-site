import json
import os
import base64
import re
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
    """CRUD для каталога товаров: категории с фото (upload или URL) и списком сортов."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    try:
        if method == 'GET':
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT id, name, count, img, items, sort_order FROM catalog_items ORDER BY sort_order, id"
                )
                rows = cur.fetchall()
            data = [
                {
                    'id': r[0], 'name': r[1], 'count': r[2], 'img': r[3],
                    'items': [x.strip() for x in (r[4] or '').split(',') if x.strip()],
                    'sort': r[5],
                }
                for r in rows
            ]
            return _json(200, {'items': data})

        if not _check_auth(event, conn):
            return _json(401, {'error': 'unauthorized'})

        body = json.loads(event.get('body') or '{}')
        img_url = _resolve_img(body)

        if method == 'POST':
            items_str = body.get('items', '')
            if isinstance(items_str, list):
                items_str = ','.join(items_str)
            with conn.cursor() as cur:
                cur.execute(
                    """INSERT INTO catalog_items (name, count, img, items, sort_order)
                       VALUES (%s, %s, %s, %s, %s) RETURNING id""",
                    (
                        body.get('name', ''), int(body.get('count') or 0),
                        img_url, items_str, int(body.get('sort') or 0),
                    ),
                )
                new_id = cur.fetchone()[0]
                conn.commit()
            return _json(200, {'id': new_id, 'img': img_url})

        if method == 'PUT':
            item_id = body.get('id')
            if not item_id:
                return _json(400, {'error': 'id required'})
            items_str = body.get('items', '')
            if isinstance(items_str, list):
                items_str = ','.join(items_str)
            with conn.cursor() as cur:
                cur.execute(
                    """UPDATE catalog_items SET name=%s, count=%s, img=%s, items=%s, sort_order=%s
                       WHERE id=%s""",
                    (
                        body.get('name', ''), int(body.get('count') or 0),
                        img_url, items_str, int(body.get('sort') or 0),
                        int(item_id),
                    ),
                )
                conn.commit()
            return _json(200, {'ok': True, 'img': img_url})

        if method == 'DELETE':
            item_id = body.get('id') or (event.get('queryStringParameters') or {}).get('id')
            if not item_id:
                return _json(400, {'error': 'id required'})
            with conn.cursor() as cur:
                cur.execute("DELETE FROM catalog_items WHERE id=%s", (int(item_id),))
                conn.commit()
            return _json(200, {'ok': True})

        return _json(405, {'error': 'Method Not Allowed'})
    finally:
        conn.close()


def _resolve_img(body):
    img_b64 = body.get('imgBase64')
    if img_b64:
        filename = body.get('imgFilename') or 'cover.jpg'
        safe_name = re.sub(r'[^A-Za-z0-9._-]+', '_', filename)
        key = f'catalog/{int(datetime.utcnow().timestamp())}_{safe_name}'
        raw = base64.b64decode(img_b64)
        ctype = body.get('imgContentType') or _guess_ct(safe_name)
        s3 = boto3.client(
            's3',
            endpoint_url='https://bucket.poehali.dev',
            aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
            aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
        )
        s3.put_object(Bucket='files', Key=key, Body=raw, ContentType=ctype)
        return f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"
    return body.get('img', '')


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


def _json(status, data):
    return {
        'statusCode': status,
        'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
        'body': json.dumps(data, ensure_ascii=False),
    }
