from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from .. import models
from ..schemas import schemas
from ..database import get_db

router = APIRouter(tags=["Event Actions"])

@router.get("/api/event-actions", response_model=List[schemas.EventAction])
async def get_event_actions(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.EventAction).order_by(models.EventAction.created_at.desc()))
    return result.scalars().all()

@router.post("/api/event-actions", response_model=schemas.EventAction)
async def create_event_action(action: schemas.EventActionCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Event).where(models.Event.id == action.event_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    db_action = models.EventAction(**action.dict())
    db.add(db_action)
    await db.commit()
    await db.refresh(db_action)
    return db_action

@router.put("/api/event-actions/{action_id}", response_model=schemas.EventAction)
async def update_event_action(action_id: int, action_update: schemas.EventActionCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.EventAction).where(models.EventAction.id == action_id))
    db_action = result.scalar_one_or_none()

    if not db_action:
        raise HTTPException(status_code=404, detail="Event action not found")

    result = await db.execute(select(models.Event).where(models.Event.id == action_update.event_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    update_data = action_update.dict()
    for field, value in update_data.items():
        setattr(db_action, field, value)

    await db.commit()
    await db.refresh(db_action)
    return db_action

@router.delete("/api/event-actions/{action_id}")
async def delete_event_action(action_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.EventAction).where(models.EventAction.id == action_id))
    db_action = result.scalar_one_or_none()

    if not db_action:
        raise HTTPException(status_code=404, detail="Event action not found")

    await db.delete(db_action)
    await db.commit()
    return {"status": "deleted"}
