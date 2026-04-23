import json
import os
import hashlib
import secrets
from datetime import datetime, timedelta
import psycopg2

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
    'Access-Control-Max-Age': '86400',
}


def _hash(password: str) -> str:
    return hashlib.sha256(password.encode('utf-8')).hexdigest()


def _get_header(event, name):
    headers = event.get('headers') or {}
    return headers.get(name) or headers.get(name.lower()) or headers.get(name.upper())


def _current_login(cur) -> str:
    cur.execute("SELECT login FROM admin_credentials ORDER BY id LIMIT 1")
    row = cur.fetchone()
    if row:
        return row[0]
    return os.environ.get('ADMIN_LOGIN', 'admin')


def _check_password(cur, login: str, password: str) -> bool:
    cur.execute("SELECT login, password_hash FROM admin_credentials ORDER BY id LIMIT 1")
    row = cur.fetchone()
    if row:
        db_login, db_hash = row
        return login == db_login and _hash(password) == db_hash
    default_login = os.environ.get('ADMIN_LOGIN', 'admin')
    expected = os.environ.get('ADMIN_PASSWORD', '')
    if not expected:
        return False
    return login == default_login and password == expected


def _validate_token(cur, token: str) -> bool:
    if not token:
        return False
    cur.execute("SELECT expires_at FROM admin_sessions WHERE token = %s", (token,))
    row = cur.fetchone()
    if not row or row[0] < datetime.utcnow():
        return False
    return True


def handler(event, context):
    """Авторизация админа: вход по логину/паролю, проверка токена, смена учётных данных."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    try:
        if method == 'POST':
            body = json.loads(event.get('body') or '{}')
            password = body.get('password', '')
            login = body.get('login') or ''
            with conn.cursor() as cur:
                if not login:
                    login = _current_login(cur)
                if not _check_password(cur, login, password):
                    return _json(401, {'error': 'Неверный логин или пароль'})
                token = secrets.token_hex(32)
                expires = datetime.utcnow() + timedelta(days=7)
                cur.execute(
                    "INSERT INTO admin_sessions (token, expires_at) VALUES (%s, %s)",
                    (token, expires),
                )
                conn.commit()
            return _json(200, {'token': token, 'login': login})

        if method == 'GET':
            token = _get_header(event, 'X-Auth-Token')
            with conn.cursor() as cur:
                if not _validate_token(cur, token or ''):
                    return _json(401, {'error': 'invalid token'})
                login = _current_login(cur)
            return _json(200, {'ok': True, 'login': login})

        if method == 'PUT':
            token = _get_header(event, 'X-Auth-Token')
            body = json.loads(event.get('body') or '{}')
            current_password = body.get('currentPassword', '')
            new_login = (body.get('newLogin') or '').strip()
            new_password = body.get('newPassword', '')

            if len(new_login) < 3:
                return _json(400, {'error': 'Логин минимум 3 символа'})
            if len(new_password) < 4:
                return _json(400, {'error': 'Пароль минимум 4 символа'})

            with conn.cursor() as cur:
                if not _validate_token(cur, token or ''):
                    return _json(401, {'error': 'invalid token'})
                current_login = _current_login(cur)
                if not _check_password(cur, current_login, current_password):
                    return _json(401, {'error': 'Неверный текущий пароль'})
                new_hash = _hash(new_password)
                cur.execute("SELECT id FROM admin_credentials ORDER BY id LIMIT 1")
                row = cur.fetchone()
                if row:
                    cur.execute(
                        "UPDATE admin_credentials SET login = %s, password_hash = %s, updated_at = NOW() WHERE id = %s",
                        (new_login, new_hash, row[0]),
                    )
                else:
                    cur.execute(
                        "INSERT INTO admin_credentials (login, password_hash) VALUES (%s, %s)",
                        (new_login, new_hash),
                    )
                conn.commit()
            return _json(200, {'login': new_login})

        return _json(405, {'error': 'Method Not Allowed'})
    finally:
        conn.close()


def _json(status, data):
    return {
        'statusCode': status,
        'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
        'body': json.dumps(data, ensure_ascii=False),
    }
