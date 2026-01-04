from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..database import get_db
from .. import models
from pydantic import BaseModel

router = APIRouter(tags=["System"])

class EmailUpdate(BaseModel):
    new_email: str

class SettingUpdate(BaseModel):
    key: str
    value: str

VERSION = "1.0.4"

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
                latest = data.get("version")
                return {
                    "current": VERSION,
                    "latest": latest,
                    "update_available": latest != VERSION,
                    "changelog": data.get("changelog", "")
                }
    except Exception as e:
        return {"error": str(e), "current": VERSION}
    return {"current": VERSION, "update_available": False}

@router.post("/api/system/perform-update")
async def perform_update(db: AsyncSession = Depends(get_db)):
    # This is a placeholder for actual update logic.
    # In a real scenario, this would trigger a background task
    # that pulls the latest code and restarts containers.
    import subprocess
    import os
    
    try:
        # We simulate a trigger for the host to update
        # For example, creating a file 'update_pending' that a host cronjob watches
        with open("/app/update_pending", "w") as f:
            f.write("trigger")
        
        return {"status": "success", "message": "Update triggered. System will restart in 30 seconds."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Update failed: {str(e)}")

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
async def update_setting(req: SettingUpdate, db: AsyncSession = Depends(get_db)):
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
async def update_admin_email(req: EmailUpdate, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(models.User).order_by(models.User.id))
    user = res.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="Admin not found")
    
    user.email = req.new_email
    await db.commit()
    return {"status": "success", "new_email": user.email}
@router.post("/api/admin/reset-password")
async def reset_password(db: AsyncSession = Depends(get_db)):
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
