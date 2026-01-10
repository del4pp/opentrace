from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from .. import models
from ..schemas import schemas
from ..database import get_db
from ..security import check_admin_auth, requires_admin

router = APIRouter(tags=["Campaigns"])

@router.get("/api/campaigns", response_model=List[schemas.Campaign])
async def get_campaigns(resource_id: Optional[int] = None, db: AsyncSession = Depends(get_db)):
    query = select(models.Campaign)
    if resource_id:
        query = query.where(models.Campaign.resource_id == resource_id)
    result = await db.execute(query.order_by(models.Campaign.created_at.desc()))
    return result.scalars().all()

@router.get("/api/campaigns/resolve/{param}")
async def resolve_campaign(param: str, db: AsyncSession = Depends(get_db)):
    # Clean param if it has 'utm_' prefix or similar
    clean_param = param.replace("utm_", "") if param.startswith("utm_") else param
    
    result = await db.execute(select(models.Campaign).where(models.Campaign.bot_start_param == clean_param))
    campaign = result.scalar_one_or_none()
    
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
        
    return {
        "utm_source": campaign.source,
        "utm_medium": campaign.medium,
        "utm_campaign": campaign.campaign,
        "utm_content": campaign.content,
        "utm_term": campaign.term
    }

@router.post("/api/campaigns", response_model=schemas.Campaign)
async def create_campaign(campaign: schemas.CampaignCreate, db: AsyncSession = Depends(get_db), admin = Depends(requires_admin)):
    db_campaign = models.Campaign(**campaign.dict())
    db.add(db_campaign)
    await db.commit()
    await db.refresh(db_campaign)
    return db_campaign

@router.delete("/api/campaigns/{id}")
async def delete_campaign(id: int, req: schemas.DeleteRequest, db: AsyncSession = Depends(get_db), admin = Depends(requires_admin)):
    if not await check_admin_auth(req.password, db):
        raise HTTPException(status_code=403, detail="Invalid password")
    
    result = await db.execute(select(models.Campaign).where(models.Campaign.id == id))
    obj = result.scalar_one_or_none()
    
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
        
    await db.delete(obj)
    await db.commit()
    return {"status": "deleted"}
