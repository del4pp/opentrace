import httpx
import hashlib
import uuid
import logging
import datetime
from sqlalchemy import select
from . import models
from .database import AsyncSession, engine

logger = logging.getLogger("teleboard")
TELEMETRY_URL = "https://opentrace.429toomanyre.quest/api/v1/collect"
CENTRAL_PROJECT_ID = "ot_central_telemetry"

async def send_telemetry():
    async with AsyncSession(engine) as db:
        try:
            res = await db.execute(select(models.Setting).where(models.Setting.key == "instance_id"))
            instance_setting = res.scalars().first()
            
            if not instance_setting:
                instance_id = str(uuid.uuid4())
                db.add(models.Setting(key="instance_id", value=instance_id))
                event_type = "install"
                await db.commit()
            else:
                instance_id = instance_setting.value
                event_type = "heartbeat"

            res = await db.execute(select(models.Setting).where(models.Setting.key == "last_ping"))
            last_ping_setting = res.scalars().first()
            
            now = datetime.datetime.now()
            
            if last_ping_setting:
                last_ping = datetime.datetime.fromisoformat(last_ping_setting.value)
                if (now - last_ping).days < 7 and event_type != "install":
                    return 
            
            async with httpx.AsyncClient() as client:
                data = {
                    "rid": CENTRAL_PROJECT_ID,
                    "sid": instance_id,
                    "type": event_type,
                    "meta": {
                        "version": "1.0.4",
                        "os": "linux",
                    }
                }
                await client.post(TELEMETRY_URL, json=data, timeout=5)
                
            if not last_ping_setting:
                db.add(models.Setting(key="last_ping", value=now.isoformat()))
            else:
                last_ping_setting.value = now.isoformat()
            
            await db.commit()
        except Exception as e:
            logger.debug(f"Telemetry failed: {e}")
