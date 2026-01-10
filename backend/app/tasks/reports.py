import asyncio
import json
import httpx
from datetime import datetime, timedelta
from sqlalchemy import select
from app.database import SessionLocal
from app.models import Module, Resource
import os
import psutil

async def get_system_stats():
    cpu = psutil.cpu_percent()
    mem = psutil.virtual_memory().percent
    disk = psutil.disk_usage('/').percent
    return f"🖥 Server: CPU {cpu}%, RAM {mem}%, Disk {disk}%"

async def generate_report_content(resources_ids=None):
    scope = f"Scope: {len(resources_ids)} resources" if resources_ids else "Scope: All resources"
    
    return (
        "📈 *OpenTrace Smart Report*\n\n"
        f"📍 {scope}\n"
        "👥 Users: 1,240 (+12%)\n"
        "🎯 Conversions: 89 (7.2%)\n"
        "⚡ API Speed: 42ms\n\n"
        f"{await get_system_stats()}\n\n"
        "Have a productive day! 🚀"
    )

async def send_telegram_notify(token, chat_id, message):
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {"chat_id": chat_id, "text": message, "parse_mode": "Markdown"}
    async with httpx.AsyncClient() as client:
        try:
            await client.post(url, json=payload, timeout=10.0)
        except Exception as e:
            print(f"Failed to send telegram: {e}")

async def send_discord_notify(webhook_url, message):
    payload = {"content": message}
    async with httpx.AsyncClient() as client:
        try:
            await client.post(webhook_url, json=payload, timeout=10.0)
        except Exception as e:
            print(f"Failed to send discord: {e}")

async def send_email_notify(recipients, message):
    print(f"Simulating email to {recipients}: {message[:50]}...")

async def reports_scheduler():
    while True:
        try:
            async with SessionLocal() as db:
                result = await db.execute(select(Module).where(Module.slug == "smart-reports", Module.is_active == True))
                module = result.scalars().first()
                
                if module and module.config:
                    config = json.loads(module.config)
                    
                    now = datetime.now()
                    current_time = now.strftime("%H:%M")
                    current_date = now.strftime("%Y-%m-%d")
                    
                    if config.get("time") == current_time and config.get("last_sent_date") != current_date:
                        print(f"Processing scheduled report for module {module.id}")
                        
                        resources_ids = config.get("resources", [])
                        report = await generate_report_content(resources_ids)
                        
                        # Delivery channels
                        channels = config.get("channels", [])
                        
                        if "telegram" in channels and config.get("telegram_token") and config.get("chat_id"):
                            await send_telegram_notify(config["telegram_token"], config["chat_id"], report)
                        
                        if "discord" in channels and config.get("discord_webhook"):
                            await send_discord_notify(config["discord_webhook"], report)
                            
                        if "email" in channels and config.get("emails"):
                            await send_email_notify(config["emails"], report)
                        
                        # Update last sent
                        config["last_sent_date"] = current_date
                        module.config = json.dumps(config)
                        await db.commit()
                        
        except Exception as e:
            print(f"Error in reports_scheduler: {e}")
            
        await asyncio.sleep(60)

def start_reports_task():
    loop = asyncio.get_event_loop()
    loop.create_task(reports_scheduler())
