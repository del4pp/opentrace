from fastapi import APIRouter, Depends, HTTPException
import psutil
import os
import platform
import time
from typing import Dict
from app.security import get_current_user

router = APIRouter()

@router.get("/api/system/monitor")
async def get_system_stats(current_user: dict = Depends(get_current_user)):
    # Basic system info
    boot_time = psutil.boot_time()
    uptime = time.time() - boot_time
    
    # CPU info
    cpu_percent = psutil.cpu_percent(interval=1)
    cpu_count = psutil.cpu_count()
    
    # Memory info
    mem = psutil.virtual_memory()
    memory_total = mem.total
    memory_used = mem.used
    memory_percent = mem.percent
    
    # Disk info
    disk = psutil.disk_usage('/')
    disk_total = disk.total
    disk_used = disk.used
    disk_percent = disk.percent
    
    # Load average (not available on Windows)
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
            "total": memory_total,
            "used": memory_used,
            "percent": memory_percent
        },
        "disk": {
            "total": disk_total,
            "used": disk_used,
            "percent": disk_percent
        }
    }
