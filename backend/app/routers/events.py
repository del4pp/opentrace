from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from .. import models
from ..schemas import schemas
from ..database import get_db
from ..security import check_admin_auth

router = APIRouter(tags=["Events"])

@router.get("/api/events", response_model=List[schemas.Event])
async def get_events(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Event).order_by(models.Event.created_at.desc()))
    return result.scalars().all()

@router.post("/api/events", response_model=schemas.Event)
async def create_event(event: schemas.EventCreate, db: AsyncSession = Depends(get_db)):
    db_event = models.Event(**event.dict())
    db.add(db_event)
    await db.commit()
    await db.refresh(db_event)
    return db_event

@router.delete("/api/events/{id}")
async def delete_event(id: int, req: schemas.DeleteRequest, db: AsyncSession = Depends(get_db)):
    if not await check_admin_auth(req.password, db):
        raise HTTPException(status_code=403, detail="Invalid password")
    
    result = await db.execute(select(models.Event).where(models.Event.id == id))
    obj = result.scalar_one_or_none()
    
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
        
    await db.delete(obj)
    await db.commit()
    return {"status": "deleted"}
