import json
import os
import re
import smtplib
import ssl
from email.mime.text import MIMEText
from email.header import Header
from email.utils import formataddr
import psycopg2

def send_notification(name: str, phone: str, email: str, message: str) -> None:
    host = os.environ.get('SMTP_HOST')
    port = os.environ.get('SMTP_PORT')
    user = os.environ.get('SMTP_USER')
    password = os.environ.get('SMTP_PASSWORD')
    to_addr = os.environ.get('NOTIFY_EMAIL') or user

    if not (host and port and user and password and to_addr):
        return

    subject = f'Новая заявка с сайта: {name}'
    body_lines = [
        'Поступила новая заявка с сайта «Семена Оптом».',
        '',
        f'Имя: {name}',
        f'Телефон: {phone}',
        f'Email: {email}',
        '',
        'Сообщение:',
        message,
    ]
    body = '\n'.join(body_lines)

    msg = MIMEText(body, 'plain', 'utf-8')
    msg['Subject'] = Header(subject, 'utf-8')
    msg['From'] = formataddr((str(Header('Семена Оптом', 'utf-8')), user))
    msg['To'] = to_addr
    msg['Reply-To'] = email

    try:
        port_int = int(port)
        context = ssl.create_default_context()
        if port_int == 465:
            with smtplib.SMTP_SSL(host, port_int, context=context, timeout=15) as server:
                server.login(user, password)
                server.sendmail(user, [to_addr], msg.as_string())
        else:
            with smtplib.SMTP(host, port_int, timeout=15) as server:
                server.starttls(context=context)
                server.login(user, password)
                server.sendmail(user, [to_addr], msg.as_string())
    except Exception as e:
        print(f'SMTP error: {e}')


def handler(event: dict, context) -> dict:
    '''
    Business: Приём заявок из формы обратной связи, сохранение в БД и отправка письма на почту
    Args: event - dict с httpMethod, body (JSON с полями name, phone, email, message)
          context - объект с атрибутами request_id, function_name
    Returns: HTTP-ответ со статусом 200 при успехе или 400/500 при ошибке
    '''
    method = event.get('httpMethod', 'GET')

    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
    }

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers, 'body': ''}

    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'})
        }

    try:
        body = json.loads(event.get('body') or '{}')
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Invalid JSON'})
        }

    name = (body.get('name') or '').strip()
    phone = (body.get('phone') or '').strip()
    email = (body.get('email') or '').strip()
    message = (body.get('message') or '').strip()

    if not name or len(name) > 255:
        return {
            'statusCode': 400,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Укажите имя'})
        }

    if not phone or len(phone) > 50:
        return {
            'statusCode': 400,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Укажите телефон'})
        }

    if not email or not re.match(r'^[^@\s]+@[^@\s]+\.[^@\s]+$', email) or len(email) > 255:
        return {
            'statusCode': 400,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Укажите корректный email'})
        }

    if not message:
        return {
            'statusCode': 400,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Напишите сообщение'})
        }

    name_esc = name.replace("'", "''")
    phone_esc = phone.replace("'", "''")
    email_esc = email.replace("'", "''")
    message_esc = message.replace("'", "''")

    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    try:
        cur = conn.cursor()
        cur.execute(
            f"INSERT INTO contact_requests (name, phone, email, message) "
            f"VALUES ('{name_esc}', '{phone_esc}', '{email_esc}', '{message_esc}') "
            f"RETURNING id"
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
    finally:
        conn.close()

    send_notification(name, phone, email, message)

    return {
        'statusCode': 200,
        'headers': {**cors_headers, 'Content-Type': 'application/json'},
        'body': json.dumps({'success': True, 'id': new_id})
    }
