import json
import os
import re
import io
import base64
from datetime import datetime
import psycopg2
import boto3

try:
    from PIL import Image
    _PIL_OK = True
except Exception:
    _PIL_OK = False


def _to_webp(raw_bytes, max_side=1600, quality=82):
    """Конвертирует изображение в WebP с ресайзом. При неудаче возвращает (None, None)."""
    if not _PIL_OK:
        return None, None
    try:
        img = Image.open(io.BytesIO(raw_bytes))
        if img.mode in ('RGBA', 'LA', 'P'):
            img = img.convert('RGBA')
            bg = Image.new('RGBA', img.size, (255, 255, 255, 255))
            bg.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
            img = bg.convert('RGB')
        elif img.mode != 'RGB':
            img = img.convert('RGB')
        w, h = img.size
        if max(w, h) > max_side:
            if w >= h:
                new_w = max_side
                new_h = int(h * (max_side / w))
            else:
                new_h = max_side
                new_w = int(w * (max_side / h))
            img = img.resize((new_w, new_h), Image.LANCZOS)
        buf = io.BytesIO()
        img.save(buf, format='WEBP', quality=quality, method=6)
        return buf.getvalue(), 'image/webp'
    except Exception:
        return None, None

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
    'Access-Control-Max-Age': '86400',
}


def handler(event, context):
    """CRUD для новостей и архива. ?kind=archive — работа с архивом, иначе — новости."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    qs = event.get('queryStringParameters') or {}
    kind = qs.get('kind', 'news') if qs else 'news'
    if kind not in ('news', 'archive'):
        kind = 'news'

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    try:
        if method == 'GET':
            slug_q = (qs.get('slug') if qs else None) or ''
            if slug_q:
                table = 'archive' if kind == 'archive' else 'news'
                with conn.cursor() as cur:
                    if table == 'archive':
                        cur.execute(
                            "SELECT id, slug, date_label, title, content, image, sort_order, images FROM archive WHERE slug=%s LIMIT 1",
                            (slug_q,),
                        )
                        row = cur.fetchone()
                        if not row:
                            return _json(404, {'error': 'not found'})
                        data = {
                            'id': row[0], 'slug': row[1], 'date': row[2], 'title': row[3],
                            'content': [p for p in (row[4] or '').split('\n\n') if p.strip()],
                            'image': row[5], 'sort': row[6],
                            'images': row[7] or [],
                        }
                    else:
                        cur.execute(
                            "SELECT id, slug, date_label, tag, title, text, content, image, published, images FROM news WHERE slug=%s LIMIT 1",
                            (slug_q,),
                        )
                        row = cur.fetchone()
                        if not row:
                            return _json(404, {'error': 'not found'})
                        data = {
                            'id': row[0], 'slug': row[1], 'date': row[2], 'tag': row[3],
                            'title': row[4], 'text': row[5],
                            'content': [p for p in (row[6] or '').split('\n\n') if p.strip()],
                            'image': row[7], 'published': row[8],
                            'images': row[9] or [],
                        }
                return _json(200, {'item': data}, cache_seconds=300)

            if kind == 'archive':
                with conn.cursor() as cur:
                    cur.execute(
                        "SELECT id, slug, date_label, title, content, image, sort_order, images FROM archive ORDER BY sort_order, id"
                    )
                    rows = cur.fetchall()
                data = [
                    {
                        'id': r[0], 'slug': r[1], 'date': r[2], 'title': r[3],
                        'content': [p for p in (r[4] or '').split('\n\n') if p.strip()],
                        'image': r[5], 'sort': r[6],
                        'images': r[7] or [],
                    }
                    for r in rows
                ]
                return _json(200, {'items': data})

            with conn.cursor() as cur:
                cur.execute(
                    "SELECT id, slug, date_label, tag, title, text, content, image, published, images FROM news ORDER BY id DESC"
                )
                rows = cur.fetchall()
            data = [
                {
                    'id': r[0], 'slug': r[1], 'date': r[2], 'tag': r[3],
                    'title': r[4], 'text': r[5],
                    'content': [p for p in (r[6] or '').split('\n\n') if p.strip()],
                    'image': r[7], 'published': r[8],
                    'images': r[9] or [],
                }
                for r in rows
            ]
            return _json(200, {'items': data, 'homeLimit': _get_home_limit()})

        if not _check_auth(event, conn):
            return _json(401, {'error': 'unauthorized'})

        body = json.loads(event.get('body') or '{}')
        image_url = _resolve_img(body, kind)
        images_list = _resolve_images(body, kind)

        if method == 'POST':
            slug = body.get('slug') or _slugify(body.get('title', ''))
            if kind == 'archive':
                with conn.cursor() as cur:
                    cur.execute(
                        """INSERT INTO archive (slug, date_label, title, content, image, sort_order, images)
                           VALUES (%s, %s, %s, %s, %s, %s, %s::jsonb) RETURNING id""",
                        (
                            slug, body.get('date', ''), body.get('title', ''),
                            body.get('content', ''), image_url, int(body.get('sort') or 0),
                            json.dumps(images_list, ensure_ascii=False),
                        ),
                    )
                    new_id = cur.fetchone()[0]
                    conn.commit()
                return _json(200, {'id': new_id, 'image': image_url, 'images': images_list})

            with conn.cursor() as cur:
                cur.execute(
                    """INSERT INTO news (slug, date_label, tag, title, text, content, image, published, images)
                       VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s::jsonb) RETURNING id""",
                    (
                        slug, body.get('date', ''), body.get('tag', 'Новость'),
                        body.get('title', ''), body.get('text', ''),
                        body.get('content', ''), image_url, bool(body.get('published', True)),
                        json.dumps(images_list, ensure_ascii=False),
                    ),
                )
                new_id = cur.fetchone()[0]
                conn.commit()
            _archive_overflow(conn)
            return _json(200, {'id': new_id, 'image': image_url, 'images': images_list})

        if method == 'PUT':
            item_id = body.get('id')
            if not item_id:
                return _json(400, {'error': 'id required'})
            if kind == 'archive':
                with conn.cursor() as cur:
                    cur.execute(
                        """UPDATE archive SET slug=%s, date_label=%s, title=%s, content=%s,
                           image=%s, sort_order=%s, images=%s::jsonb WHERE id=%s""",
                        (
                            body.get('slug', ''), body.get('date', ''), body.get('title', ''),
                            body.get('content', ''), image_url, int(body.get('sort') or 0),
                            json.dumps(images_list, ensure_ascii=False),
                            int(item_id),
                        ),
                    )
                    conn.commit()
                return _json(200, {'ok': True, 'image': image_url, 'images': images_list})

            with conn.cursor() as cur:
                cur.execute(
                    """UPDATE news SET slug=%s, date_label=%s, tag=%s, title=%s, text=%s,
                       content=%s, image=%s, published=%s, images=%s::jsonb WHERE id=%s""",
                    (
                        body.get('slug', ''), body.get('date', ''), body.get('tag', 'Новость'),
                        body.get('title', ''), body.get('text', ''),
                        body.get('content', ''), image_url, bool(body.get('published', True)),
                        json.dumps(images_list, ensure_ascii=False),
                        int(item_id),
                    ),
                )
                conn.commit()
            _archive_overflow(conn)
            return _json(200, {'ok': True, 'image': image_url, 'images': images_list})

        if method == 'DELETE':
            item_id = body.get('id') or (qs.get('id') if qs else None)
            if not item_id:
                return _json(400, {'error': 'id required'})
            table = 'archive' if kind == 'archive' else 'news'
            with conn.cursor() as cur:
                cur.execute(f"DELETE FROM {table} WHERE id=%s", (int(item_id),))
                conn.commit()
            return _json(200, {'ok': True})

        return _json(405, {'error': 'Method Not Allowed'})
    finally:
        conn.close()


def _get_home_limit():
    """Лимит свежих новостей на главной. Настраивается через env NEWS_HOME_LIMIT, по умолчанию 3."""
    try:
        val = int(os.environ.get('NEWS_HOME_LIMIT', '3'))
        return val if val > 0 else 3
    except (TypeError, ValueError):
        return 3


def _archive_overflow(conn):
    """Держим на главной не более NEWS_HOME_LIMIT новостей. Лишние (самые старые) переносим в archive."""
    limit = _get_home_limit()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM news WHERE published = TRUE")
            total = cur.fetchone()[0] or 0
            if total <= limit:
                return
            overflow = total - limit
            cur.execute(
                """SELECT id, slug, date_label, title, text, content, image, images
                   FROM news WHERE published = TRUE ORDER BY id ASC LIMIT %s""",
                (overflow,),
            )
            rows = cur.fetchall() or []
            cur.execute("SELECT COALESCE(MIN(sort_order), 1) FROM archive")
            min_sort = cur.fetchone()[0] or 1
            next_sort = int(min_sort) - 1
            for r in rows:
                nid, nslug, ndate, ntitle, ntext, ncontent, nimage, nimages = r
                base_content = ncontent or ''
                if ntext and ntext.strip():
                    base_content = f"{ntext.strip()}\n\n{base_content}".strip()
                images_json = json.dumps(nimages or [], ensure_ascii=False) if not isinstance(nimages, str) else (nimages or '[]')
                cur.execute(
                    """INSERT INTO archive (slug, date_label, title, content, image, sort_order, images)
                       VALUES (%s, %s, %s, %s, %s, %s, %s::jsonb)""",
                    (nslug or _slugify(ntitle or ''), ndate or '', ntitle or '',
                     base_content, nimage or '', next_sort, images_json),
                )
                next_sort -= 1
                cur.execute("DELETE FROM news WHERE id = %s", (nid,))
            conn.commit()
    except Exception:
        conn.rollback()


def _resolve_img(body, kind):
    img_b64 = body.get('imageBase64')
    if img_b64:
        filename = body.get('imageFilename') or f'{kind}.jpg'
        safe_name = re.sub(r'[^A-Za-z0-9._-]+', '_', filename)
        raw = base64.b64decode(img_b64)
        ctype = body.get('imageContentType') or _guess_ct(safe_name)
        webp_bytes, webp_ct = _to_webp(raw)
        if webp_bytes and webp_ct:
            raw = webp_bytes
            ctype = webp_ct
            safe_name = re.sub(r'\.[^.]+$', '', safe_name) + '.webp'
        key = f'{kind}/{int(datetime.utcnow().timestamp())}_{safe_name}'
        s3 = boto3.client(
            's3',
            endpoint_url='https://bucket.poehali.dev',
            aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
            aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
        )
        s3.put_object(Bucket='files', Key=key, Body=raw, ContentType=ctype)
        return f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"
    return body.get('image', '')


def _resolve_images(body, kind):
    """Принимает images: [url|str, ...] и imagesUploads: [{base64, filename, contentType}, ...] — возвращает список URL."""
    result = []
    existing = body.get('images') or []
    if isinstance(existing, list):
        for it in existing:
            if isinstance(it, str) and it and not it.startswith('data:'):
                result.append(it)
    uploads = body.get('imagesUploads') or []
    if isinstance(uploads, list) and uploads:
        s3 = boto3.client(
            's3',
            endpoint_url='https://bucket.poehali.dev',
            aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
            aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
        )
        for idx, u in enumerate(uploads):
            if not isinstance(u, dict):
                continue
            b64 = u.get('base64')
            if not b64:
                continue
            filename = u.get('filename') or f'{kind}_{idx}.jpg'
            safe_name = re.sub(r'[^A-Za-z0-9._-]+', '_', filename)
            raw = base64.b64decode(b64)
            ctype = u.get('contentType') or _guess_ct(safe_name)
            webp_bytes, webp_ct = _to_webp(raw)
            if webp_bytes and webp_ct:
                raw = webp_bytes
                ctype = webp_ct
                safe_name = re.sub(r'\.[^.]+$', '', safe_name) + '.webp'
            key = f'{kind}/{int(datetime.utcnow().timestamp())}_{idx}_{safe_name}'
            s3.put_object(Bucket='files', Key=key, Body=raw, ContentType=ctype)
            result.append(f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}")
    return result


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


def _json(status, data, cache_seconds=0):
    headers = {**CORS_HEADERS, 'Content-Type': 'application/json'}
    if cache_seconds and cache_seconds > 0:
        headers['Cache-Control'] = f'public, max-age={cache_seconds}, s-maxage={cache_seconds}'
    return {
        'statusCode': status,
        'headers': headers,
        'body': json.dumps(data, ensure_ascii=False),
    }