from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import Module
from pydantic import BaseModel
import httpx
import json

router = APIRouter(prefix="/api/modules", tags=["modules"])

class InstallModuleReq(BaseModel):
    license_key: str
    module_slug: str

CENTRAL_STORE_API = "https://store.opentrace.dev/api/verify"

@router.get("")
async def get_modules(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Module))
    return result.scalars().all()

@router.post("/install")
async def install_module(req: InstallModuleReq, request: Request, db: AsyncSession = Depends(get_db)):
    # 1. Verify with central store
    domain = request.base_url.hostname
    
    # payload = {
    #     "key": req.license_key,
    #     "domain": domain,
    #     "module": req.module_slug
    # }
    
    # For now, let's pretend it's valid if it matched some logic
    # In reality: res = await httpx.post(CENTRAL_STORE_API, json=payload)
    
    if len(req.license_key) < 10:
        raise HTTPException(status_code=400, detail="Invalid license key format")

    # 2. Check if already installed
    res = await db.execute(select(Module).where(Module.slug == req.module_slug))
    existing = res.scalars().first()
    
    if existing:
        existing.license_key = req.license_key
        existing.is_active = True
    else:
        new_module = Module(
            slug=req.module_slug,
            name=req.module_slug.replace("-", " ").title(),
            version="1.0.0",
            license_key=req.license_key,
            is_active=True
        )
        db.add(new_module)
    
    await db.commit()
    
    # 3. Here we would trigger the 'protected' code download/extraction
    # exec(obfuscated_code) or dynamic import
    
    return {"status": "success", "message": f"Module {req.module_slug} activated"}

@router.post("/{module_id}/toggle")
async def toggle_module(module_id: int, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Module).where(Module.id == module_id))
    module = res.scalars().first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    
    module.is_active = not module.is_active
    await db.commit()
    return {"status": "success", "is_active": module.is_active}
