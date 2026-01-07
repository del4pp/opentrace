from fastapi import APIRouter, Depends, HTTPException
import psutil
import os
import platform
import time
from typing import Dict, List
from app.security import get_current_user
from app.database import engine, get_clickhouse_client
from sqlalchemy import text
import redis.asyncio as redis
from app.config import settings

router = APIRouter()

@router.get("/api/system/monitor")
async def get_system_stats(current_user: dict = Depends(get_current_user)):
    # Basic system info
    boot_time = psutil.boot_time()
    uptime = time.time() - boot_time
    
    # CPU info
    # interval=None returns immediately with the current utilization
    cpu_percent = psutil.cpu_percent(interval=None)
    cpu_count = psutil.cpu_count()
    
    # Memory info
    mem = psutil.virtual_memory()
    
    # Disk info
    disk = psutil.disk_usage('/')
    
    # Processes
    processes = []
    # We'll take top 5 by memory usage as it's more stable than CPU for a single snapshot
    for proc in sorted(psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent']), 
                      key=lambda x: x.info['memory_percent'], reverse=True)[:5]:
        try:
            processes.append(proc.info)
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass

    # DB Status
    db_status = {"postgres": "offline", "clickhouse": "offline", "redis": "offline"}
    
    # Check Postgres
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
            db_status["postgres"] = "online"
    except Exception as e:
        print(f"Monitor: Postgres check failed: {e}")

    # Check Clickhouse
    try:
        client = get_clickhouse_client()
        client.command("SELECT 1")
        db_status["clickhouse"] = "online"
    except Exception as e:
        print(f"Monitor: Clickhouse check failed: {e}")

    # Check Redis
    try:
        r = redis.from_url(settings.REDIS_URL)
        await r.ping()
        db_status["redis"] = "online"
        await r.close()
    except Exception as e:
        print(f"Monitor: Redis check failed: {e}")

    # Load average
    try:
        load_avg = os.getloadavg()
    except:
        load_avg = (0, 0, 0)
        
    return {
        "status": "online",
        "system": {
            "platform": platform.system(),
            "release": platform.release(),
            "arch": platform.machine(),
            "uptime_seconds": int(uptime)
        },
        "cpu": {
            "percent": cpu_percent,
            "cores": cpu_count,
            "load_avg": load_avg
        },
        "memory": {
            "total": mem.total,
            "used": mem.used,
            "percent": mem.percent
        },
        "disk": {
            "total": disk.total,
            "used": disk.used,
            "percent": disk.percent
        },
        "processes": processes,
        "databases": db_status
    }
