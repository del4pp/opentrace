from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from .. import models
from ..schemas import schemas
from ..database import get_db
from ..security import check_admin_auth

router = APIRouter(tags=["Campaigns"])

@router.get("/api/campaigns", response_model=List[schemas.Campaign])
async def get_campaigns(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Campaign).order_by(models.Campaign.created_at.desc()))
    return result.scalars().all()

@router.post("/api/campaigns", response_model=schemas.Campaign)
async def create_campaign(campaign: schemas.CampaignCreate, db: AsyncSession = Depends(get_db)):
    db_campaign = models.Campaign(**campaign.dict())
    db.add(db_campaign)
    await db.commit()
    await db.refresh(db_campaign)
    return db_campaign

@router.delete("/api/campaigns/{id}")
async def delete_campaign(id: int, req: schemas.DeleteRequest, db: AsyncSession = Depends(get_db)):
    if not await check_admin_auth(req.password, db):
        raise HTTPException(status_code=403, detail="Invalid password")
    
    result = await db.execute(select(models.Campaign).where(models.Campaign.id == id))
    obj = result.scalar_one_or_none()
    
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
        
    await db.delete(obj)
    await db.commit()
    return {"status": "deleted"}
