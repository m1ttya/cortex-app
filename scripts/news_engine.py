#!/usr/bin/env python3
"""
CORTEX News & Telegram Aggregator with LLM Deduplication & Summarization.
Cross-platform, zero third-party dependencies (uses Python standard library).
"""

import os
import sys
import json
import re
import urllib.request
import urllib.error
import xml.etree.ElementTree as ET
from datetime import datetime, timezone

SOURCES_FILE = os.path.join(os.path.dirname(__file__), '..', 'news_sources.json')
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), '..', 'news_digest.json')

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
}

def clean_html(raw_html):
    """Удаляет HTML теги и спецсимволы"""
    if not raw_html:
        return ""
    cleanr = re.compile(r'<.*?>')
    cleantext = re.sub(cleanr, ' ', raw_html)
    cleantext = cleantext.replace('&nbsp;', ' ').replace('&quot;', '"').replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>')
    return re.sub(r'\s+', ' ', cleantext).strip()

def fetch_rss_items(source, max_items=5):
    """Парсинг RSS-ленты через стандартный ElementTree"""
    url = source.get('url')
    name = source.get('name', 'RSS')
    category = source.get('category', 'main')
    items = []
    
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=12) as response:
            xml_data = response.read()
            root = ET.fromstring(xml_data)
            
            # Стандартный RSS 2.0: channel -> item
            channel = root.find('channel')
            raw_items = channel.findall('item') if channel is not None else root.findall('.//item')
            
            for it in raw_items[:max_items]:
                title = it.findtext('title', '').strip()
                link = it.findtext('link', '').strip()
                desc = clean_html(it.findtext('description', ''))
                pub_date = it.findtext('pubDate', '').strip()
                
                if title:
                    items.append({
                        'source': name,
                        'source_type': 'rss',
                        'category': category,
                        'url': link,
                        'title': title,
                        'text': desc.strip(),
                        'date': pub_date
                    })
    except Exception as e:
        print(f"[RSS Error] {name} ({url}): {e}")
    
    return items

def fetch_telegram_items(source, max_posts=5):
    """Парсинг постов публичного Telegram-канала через https://t.me/s/<channel>"""
    channel = source.get('url', '').replace('@', '').replace('https://t.me/', '').strip('/')
    name = source.get('name', f"@{channel}")
    category = source.get('category', 'telegram')
    items = []
    
    web_url = f"https://t.me/s/{channel}"
    try:
        req = urllib.request.Request(web_url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=12) as response:
            html = response.read().decode('utf-8', errors='ignore')
            
            # Извлекаем сообщения по шаблону tgme_widget_message_text
            post_pattern = re.compile(
                r'class="tgme_widget_message_text[^"]*"[^>]*>(.*?)</div>.*?'
                r'class="tgme_widget_message_date"[^>]*href="([^"]+)"[^>]*>.*?<time datetime="([^"]+)"',
                re.DOTALL
            )
            matches = post_pattern.findall(html)
            
            for text_html, link, dt_str in matches[-max_posts:]:
                text = clean_html(text_html)
                if len(text) > 25:
                    first_line = text.split('\n')[0][:100]
                    items.append({
                        'source': name,
                        'source_type': 'telegram',
                        'category': category,
                        'url': link,
                        'title': first_line,
                        'text': text.strip(),
                        'date': dt_str
                    })
    except Exception as e:
        print(f"[Telegram Error] {name} (@{channel}): {e}")
        
    return items

def call_gemini_api(api_key, prompt):
    """Вызов Google Gemini 2.0 Flash API (бесплатный, 1M контекст)"""
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }],
        "generationConfig": {
            "temperature": 0.2,
            "responseMimeType": "application/json"
        }
    }
    
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        res_data = json.loads(resp.read().decode('utf-8'))
        raw_text = res_data['candidates'][0]['content']['parts'][0]['text']
        return json.loads(raw_text)

def call_openai_compatible_api(api_url, api_key, model_name, prompt):
    """Универсальный вызов OpenAI / Groq / DeepSeek / Ollama"""
    payload = {
        "model": model_name,
        "messages": [
            {"role": "system", "content": "Ты — беспристрастный новостной редактор. Твой ответ должен быть строго в формате валидного JSON-массива без markdown блоков."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.2
    }
    
    headers = {'Content-Type': 'application/json'}
    if api_key:
        headers['Authorization'] = f'Bearer {api_key}'
        
    req = urllib.request.Request(
        api_url,
        data=json.dumps(payload).encode('utf-8'),
        headers=headers
    )
    with urllib.request.urlopen(req, timeout=40) as resp:
        res_data = json.loads(resp.read().decode('utf-8'))
        raw_text = res_data['choices'][0]['message']['content']
        # Удаляем возможное обрамление в ```json ... ```
        raw_text = re.sub(r'^```(?:json)?\s*', '', raw_text.strip())
        raw_text = re.sub(r'\s*```$', '', raw_text.strip())
        return json.loads(raw_text)

def mock_llm_summarize(raw_items):
    """Фолбэк-обработка без API ключа (для локального тестирования и работы с источниками)"""
    print("Используется сборка сводки новостей по источникам...")
    digest = []
    
    categories_map = {
        'main': 'Главное',
        'russia': 'Россия',
        'city': 'Город',
        'world': 'Мир',
        'tech': 'Технологии',
        'telegram': 'Telegram'
    }
    
    for idx, item in enumerate(raw_items[:12]):
        cat = item.get('category', 'main')
        raw_text = item.get('text', '').strip()
        
        sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', raw_text) if len(s.strip()) > 15]
        if len(sentences) >= 2:
            tldr = sentences[:2]
        elif sentences:
            tldr = [sentences[0]]
        else:
            tldr = [item.get('title', 'Новость')]
            
        digest.append({
            'id': f"digest-item-{idx+1}",
            'category': cat,
            'categoryName': categories_map.get(cat, 'Главное'),
            'title': item.get('title', 'Новость без заголовка'),
            'tldr': tldr,
            'fullText': raw_text,
            'importance': 'high' if idx < 3 else 'normal',
            'time': 'Свежее',
            'sources': [{
                'name': item.get('source'),
                'url': item.get('url'),
                'type': item.get('source_type')
            }]
        })
        
    return digest

def main():
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Запуск сбора новостей CORTEX...")
    
    sources = []
    if os.path.exists(SOURCES_FILE):
        try:
            with open(SOURCES_FILE, 'r', encoding='utf-8') as f:
                sources_cfg = json.load(f)
                sources.extend(sources_cfg.get('sources', []))
        except Exception as e:
            print(f"[Warning] Ошибка чтения {SOURCES_FILE}: {e}")
    else:
        print(f"Файл источников не найден: {SOURCES_FILE}")

    # Также подтягиваем пользовательские источники из cortex_db.json, если они там сохранены
    db_file = os.path.join(os.path.dirname(__file__), '..', 'cortex_db.json')
    if os.path.exists(db_file):
        try:
            with open(db_file, 'r', encoding='utf-8') as f:
                db_data = json.load(f)
                custom = db_data.get('customNewsSources', [])
                if isinstance(custom, list) and custom:
                    existing_urls = {s.get('url') for s in sources}
                    for cs in custom:
                        if cs.get('url') not in existing_urls and cs.get('enabled', True):
                            sources.append(cs)
                            print(f"[Пользовательский источник] Подключен: {cs.get('name')} ({cs.get('url')})")
        except Exception as e:
            print(f"[Notice] Проверка cortex_db.json: {e}")

    raw_news = []
    
    for s in sources:
        if not s.get('enabled', True):
            continue
        stype = s.get('type')
        if stype == 'rss':
            raw_news.extend(fetch_rss_items(s))
        elif stype == 'telegram':
            raw_news.extend(fetch_telegram_items(s))
            
    print(f"Всего собрано {len(raw_news)} новостных элементов.")
    
    # Проверяем переменные окружения для LLM
    gemini_key = os.getenv('GEMINI_API_KEY')
    groq_key = os.getenv('GROQ_API_KEY')
    deepseek_key = os.getenv('DEEPSEEK_API_KEY')
    openai_key = os.getenv('OPENAI_API_KEY')
    ollama_url = os.getenv('OLLAMA_URL', '') # например http://localhost:11434/v1/chat/completions
    
    llm_prompt = f"""
Проанализируй следующие {len(raw_news)} сырых новостей и постов из СМИ и Telegram:
{json.dumps(raw_news, ensure_ascii=False, indent=2)}

Задача:
1. Сгруппируй повторяющиеся новости об одном и том же событии в один инфоповод.
2. Удали кликбейт, эмоциональные оценки и воду. Сформулируй нейтральный, точный заголовок.
3. Выдели суть события строго в 2-3 маркированных тезисах (ключевые факты, цифры, последствия).
4. Определи категорию: "main" (Главное), "russia" (Россия), "city" (Город), "world" (Мир), "tech" (Технологии), "telegram" (Telegram).
5. Собери массив уникальных источников ("sources") с оригинальными URL.
6. Выставь важность ("importance"): "high", "medium" или "normal".

Верни строго JSON-массив объектов:
[
  {{
    "id": "digest-N",
    "category": "main|russia|city|world|tech|telegram",
    "categoryName": "Главное|Россия|Город|Мир|Технологии|Telegram",
    "title": "Точный заголовок",
    "tldr": ["Тезис 1", "Тезис 2"],
    "importance": "high|medium|normal",
    "time": "Время или дата",
    "sources": [{{"name": "...", "url": "...", "type": "rss|telegram"}}]
  }}
]
"""
    
    processed_items = []
    provider_name = "Mock / Demo Fallback"
    
    if gemini_key:
        try:
            print("Отправка в Google Gemini 2.0 Flash...")
            processed_items = call_gemini_api(gemini_key, llm_prompt)
            provider_name = "Google Gemini 2.0 Flash"
        except Exception as e:
            print("Ошибка Gemini API:", e)
    elif groq_key:
        try:
            print("Отправка в Groq (Llama 3.3 70B)...")
            processed_items = call_openai_compatible_api(
                "https://api.groq.com/openai/v1/chat/completions",
                groq_key,
                "llama-3.3-70b-versatile",
                llm_prompt
            )
            provider_name = "Groq Llama 3.3 70B"
        except Exception as e:
            print("Ошибка Groq API:", e)
    elif deepseek_key:
        try:
            print("Отправка в DeepSeek-V3...")
            processed_items = call_openai_compatible_api(
                "https://api.deepseek.com/chat/completions",
                deepseek_key,
                "deepseek-chat",
                llm_prompt
            )
            provider_name = "DeepSeek-V3"
        except Exception as e:
            print("Ошибка DeepSeek API:", e)
    elif ollama_url:
        try:
            print(f"Отправка в локальную Ollama ({ollama_url})...")
            processed_items = call_openai_compatible_api(
                ollama_url,
                "",
                "qwen2.5:7b",
                llm_prompt
            )
            provider_name = "Ollama (qwen2.5:7b)"
        except Exception as e:
            print("Ошибка Ollama:", e)
            
    if not processed_items:
        processed_items = mock_llm_summarize(raw_news)

    # Гарантируем компактный размер базы дайджеста (не более 35 самых важных сюжетов)
    if processed_items and len(processed_items) > 35:
        processed_items = processed_items[:35]

    output_data = {
        "version": "1.0",
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "provider": provider_name,
        "itemsCount": len(processed_items),
        "items": processed_items
    }
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
        
    print(f"Сводка успешно сохранена в {OUTPUT_FILE}! ({len(processed_items)} сюжетов)")

if __name__ == '__main__':
    main()
