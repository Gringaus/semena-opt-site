import os
from datetime import datetime, timezone
from html import escape
import psycopg2


BASE_URL = 'https://semena37.ru'

STATIC_URLS = [
    {'loc': '/', 'changefreq': 'weekly', 'priority': '1.0'},
    {'loc': '/archive', 'changefreq': 'weekly', 'priority': '0.8'},
    {'loc': '/faq', 'changefreq': 'monthly', 'priority': '0.7'},
    {'loc': '/privacy', 'changefreq': 'yearly', 'priority': '0.3'},
]


def handler(event, context):
    """Динамический sitemap.xml — собирает все опубликованные новости и записи архива из БД."""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            'body': '',
        }

    today = datetime.now(timezone.utc).date().isoformat()
    news_items = []
    archive_items = []
    latest_news_date = None
    latest_archive_date = None

    try:
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        try:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT slug, created_at FROM news WHERE COALESCE(published, TRUE) = TRUE AND slug IS NOT NULL AND slug <> '' ORDER BY created_at DESC NULLS LAST"
                )
                for slug, created_at in cur.fetchall():
                    iso = _iso_date(created_at)
                    if iso and (latest_news_date is None or iso > latest_news_date):
                        latest_news_date = iso
                    news_items.append({
                        'loc': f'{BASE_URL}/news/{slug}',
                        'changefreq': 'monthly',
                        'priority': '0.7',
                        'lastmod': iso,
                    })
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT slug, created_at FROM archive WHERE slug IS NOT NULL AND slug <> '' ORDER BY sort_order NULLS LAST, created_at DESC NULLS LAST"
                )
                for slug, created_at in cur.fetchall():
                    iso = _iso_date(created_at)
                    if iso and (latest_archive_date is None or iso > latest_archive_date):
                        latest_archive_date = iso
                    archive_items.append({
                        'loc': f'{BASE_URL}/archive/{slug}',
                        'changefreq': 'yearly',
                        'priority': '0.5',
                        'lastmod': iso,
                    })
        finally:
            conn.close()
    except Exception:
        pass

    home_lastmod = latest_news_date or today
    archive_lastmod = latest_archive_date or latest_news_date or today

    urls = []
    for u in STATIC_URLS:
        loc = u['loc']
        if loc == '/':
            lastmod = home_lastmod
        elif loc == '/archive':
            lastmod = archive_lastmod
        elif loc == '/faq':
            lastmod = today
        else:
            lastmod = None
        urls.append({
            'loc': BASE_URL + loc,
            'changefreq': u['changefreq'],
            'priority': u['priority'],
            'lastmod': lastmod,
        })

    urls.extend(news_items)
    urls.extend(archive_items)

    xml = _build_xml(urls)
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/xml; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=3600',
        },
        'body': xml,
    }


def _iso_date(dt):
    if not dt:
        return None
    if isinstance(dt, datetime):
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.date().isoformat()
    return None


def _build_xml(urls):
    lines = ['<?xml version="1.0" encoding="UTF-8"?>']
    lines.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    for u in urls:
        lines.append('  <url>')
        lines.append(f'    <loc>{escape(u["loc"])}</loc>')
        if u.get('lastmod'):
            lines.append(f'    <lastmod>{u["lastmod"]}</lastmod>')
        if u.get('changefreq'):
            lines.append(f'    <changefreq>{u["changefreq"]}</changefreq>')
        if u.get('priority'):
            lines.append(f'    <priority>{u["priority"]}</priority>')
        lines.append('  </url>')
    lines.append('</urlset>')
    return '\n'.join(lines)