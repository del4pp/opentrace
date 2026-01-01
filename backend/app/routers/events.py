from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from .. import models
from ..schemas import schemas
from ..database import get_db
from ..security import check_admin_auth

router = APIRouter(tags=["Events"])

@router.get("/api/events")
async def get_events(db: AsyncSession = Depends(get_db)):
    from ..database import get_clickhouse_client
    

    result = await db.execute(select(models.Event).order_by(models.Event.created_at.desc()))
    rules = result.scalars().all()
    

    try:
        client = get_clickhouse_client()
        counts_res = client.query("SELECT event_type, count(*) FROM telemetry GROUP BY event_type").result_rows
        counts_map = {r[0]: r[1] for r in counts_res}
    except:
        counts_map = {}


    events_with_stats = []
    for r in rules:
        events_with_stats.append({
            "id": r.id,
            "name": r.name,
            "trigger": r.trigger,
            "selector": r.selector,
            "resource_id": r.resource_id,
            "count": counts_map.get(r.name, 0)
        })
    
    return events_with_stats

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
@router.get("/api/v1/rules/{resource_uid}")
async def get_public_rules(resource_uid: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(models.Event)
        .join(models.Resource, models.Resource.id == models.Event.resource_id)
        .where(models.Resource.uid == resource_uid)
    )
    rules = result.scalars().all()
    return [{"name": r.name, "trigger": r.trigger, "selector": r.selector} for r in rules]
