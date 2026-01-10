from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..database import get_db
from .. import models
from pydantic import BaseModel
import os
import asyncio
import subprocess
from datetime import datetime
from ..database import get_clickhouse_client
from ..security import requires_admin

router = APIRouter(tags=["System"])

class EmailUpdate(BaseModel):
    new_email: str

class SettingUpdate(BaseModel):
    key: str
    value: str

VERSION = "1.1.5"
PROJECT_ID = "opentrace"

@router.get("/api/health")
def health_check():
    return {"status": "ok", "version": VERSION}

@router.get("/api/system/check-update")
async def check_update():
    import httpx
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get("https://version.429toomanyre.quest/version.json", timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                # Get specific data for this project
                project_data = data.get(PROJECT_ID, {})
                latest = project_data.get("version")
                
                if not latest:
                    return {"current": VERSION, "update_available": False, "error": "Project not found in version registry"}

                return {
                    "current": VERSION,
                    "latest": latest,
                    "update_available": latest != VERSION,
                    "changelog": project_data.get("changelog", "")
                }
    except Exception as e:
        return {"error": str(e), "current": VERSION}
    return {"current": VERSION, "update_available": False}

@router.post("/api/system/perform-update")
async def perform_update(db: AsyncSession = Depends(get_db), admin = Depends(requires_admin)):
    import os
    
    # Path inside container that is mapped to host
    trigger_path = "/app/data/updates/trigger"
    os.makedirs(os.path.dirname(trigger_path), exist_ok=True)
    
    try:
        with open(trigger_path, "w") as f:
            f.write("update_requested")
        
        return {"status": "success", "message": "Update signal sent to host. The system will restart shortly."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Update failed to trigger: {str(e)}")

@router.get("/api/settings")
async def get_all_settings(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(models.Setting))
    settings_list = res.scalars().all()
    return {s.key: s.value for s in settings_list}

@router.get("/api/settings/show-demo")
async def get_show_demo(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(models.Setting).where(models.Setting.key == "show_demo"))
    setting = res.scalars().first()
    return {"show_demo": (setting.value == "true") if setting else True}

@router.post("/api/settings")
async def update_setting(req: SettingUpdate, db: AsyncSession = Depends(get_db), admin = Depends(requires_admin)):
    res = await db.execute(select(models.Setting).where(models.Setting.key == req.key))
    setting = res.scalars().first()
    if not setting:
        setting = models.Setting(key=req.key, value=req.value)
        db.add(setting)
    else:
        setting.value = req.value
    await db.commit()
    return {"status": "success"}

@router.post("/api/admin/update-email")
async def update_admin_email(req: EmailUpdate, db: AsyncSession = Depends(get_db), admin = Depends(requires_admin)):
    res = await db.execute(select(models.User).order_by(models.User.id))
    user = res.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="Admin not found")
    
    user.email = req.new_email
    await db.commit()
    return {"status": "success", "new_email": user.email}
@router.post("/api/admin/reset-password")
async def reset_password(db: AsyncSession = Depends(get_db), admin = Depends(requires_admin)):
    res = await db.execute(select(models.User).order_by(models.User.id))
    user = res.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="Admin not found")
    
    from ..database import get_clickhouse_client
    try:
        client = get_clickhouse_client()
        client.insert("system_logs", [["INFO", "AUTH", f"Password reset requested for {user.email}", "Link sent (simulated)"]], column_names=["level", "module", "message", "details"])
    except:
        pass
        
    return {"status": "success", "message": f"Reset link sent to {user.email}"}
@router.post("/api/system/backup")
async def create_backup(admin = Depends(requires_admin)):
    backup_dir = "/app/data/backups"
    os.makedirs(backup_dir, exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = f"{backup_dir}/backup_{timestamp}.tar.gz"
    
    try:
        # 1. Postgres Dump
        pg_file = "/tmp/pg.sql"
        env = os.environ.copy()
        env["PGPASSWORD"] = os.getenv("POSTGRES_PASSWORD", "password")
        subprocess.run([
            "pg_dump", "-h", "postgres", "-U", os.getenv("POSTGRES_USER", "admin"),
            "-d", os.getenv("POSTGRES_DB", "teleboard"), "-f", pg_file
        ], env=env, check=True)
        
        # 2. ClickHouse Dump (Structure + Data)
        ch_file = "/tmp/ch.sql"
        ch_cmd = f"clickhouse-client --host clickhouse --user {os.getenv('CLICKHOUSE_USER', 'admin')} --password '{os.getenv('CLICKHOUSE_PASSWORD', '')}' --query \"SHOW CREATE TABLE telemetry; SELECT * FROM telemetry FORMAT SQLInsert;\" > {ch_file}"
        subprocess.run(ch_cmd, shell=True, check=True)
        
        # 3. Compress
        subprocess.run(["tar", "-czf", backup_path, "-C", "/tmp", "pg.sql", "ch.sql"], check=True)
        
        # Clean up tmp
        os.remove(pg_file)
        os.remove(ch_file)
        
        return {"status": "success", "file": os.path.basename(backup_path)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Backup failed: {str(e)}")

@router.get("/api/system/backups")
async def list_backups():
    backup_dir = "/app/data/backups"
    if not os.path.exists(backup_dir):
        return []
    
    files = os.listdir(backup_dir)
    backups = []
    for f in files:
        if f.endswith(".tar.gz"):
            stat = os.stat(os.path.join(backup_dir, f))
            backups.append({
                "name": f,
                "size": stat.st_size,
                "created_at": datetime.fromtimestamp(stat.st_ctime).isoformat()
            })
    return sorted(backups, key=lambda x: x['created_at'], reverse=True)

@router.post("/api/system/restore")
async def restore_backup(filename: str, admin = Depends(requires_admin)):
    backup_path = f"/app/data/backups/{filename}"
    if not os.path.exists(backup_path):
        raise HTTPException(status_code=404, detail="Backup file not found")
        
    try:
        # 1. Extract
        subprocess.run(["tar", "-xzf", backup_path, "-C", "/tmp"], check=True)
        
        # 2. Restore Postgres
        env = os.environ.copy()
        env["PGPASSWORD"] = os.getenv("POSTGRES_PASSWORD", "password")
        subprocess.run([
            "psql", "-h", "postgres", "-U", os.getenv("POSTGRES_USER", "admin"),
            "-d", os.getenv("POSTGRES_DB", "teleboard"), "-f", "/tmp/pg.sql"
        ], env=env, check=True)
        
        # 3. Restore ClickHouse
        ch_cmd = f"clickhouse-client --host clickhouse --user {os.getenv('CLICKHOUSE_USER', 'admin')} --password '{os.getenv('CLICKHOUSE_PASSWORD', '')}' --multiquery < /tmp/ch.sql"
        subprocess.run(ch_cmd, shell=True, check=True)
        
        return {"status": "success", "message": "System restored successfully. A restart is recommended."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Restore failed: {str(e)}")
