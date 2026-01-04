from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload
from typing import List, Optional
from .. import models
from ..database import get_db, get_clickhouse_client
from pydantic import BaseModel
from datetime import datetime
import json

router = APIRouter(tags=["Funnels"])

class StepCreate(BaseModel):
    name: str
    type: str
    value: str
    order: int
    conversion_value: Optional[int] = 0

class FunnelCreate(BaseModel):
    name: str
    resource_id: int
    steps: List[StepCreate]

@router.get("/api/funnels")
async def get_funnels(resource_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(models.Funnel).where(models.Funnel.resource_id == resource_id).options(selectinload(models.Funnel.steps))
    )
    funnels = result.scalars().all()
    
    return [
        {
            "id": f.id, 
            "name": f.name, 
            "created_at": f.created_at,
            "steps_count": len(f.steps)
        } for f in funnels
    ]

@router.post("/api/funnels")
async def create_funnel(req: FunnelCreate, db: AsyncSession = Depends(get_db)):
    funnel = models.Funnel(name=req.name, resource_id=req.resource_id)
    db.add(funnel)
    await db.flush()
    
    for s in req.steps:
        step = models.FunnelStep(
            funnel_id=funnel.id,
            name=s.name,
            type=s.type,
            value=s.value,
            order=s.order,
            conversion_value=s.conversion_value or 0
        )
        db.add(step)
    
    await db.commit()
    return {"status": "success", "id": funnel.id}

@router.delete("/api/funnels/{id}")
async def delete_funnel(id: int, db: AsyncSession = Depends(get_db)):
    await db.execute(delete(models.Funnel).where(models.Funnel.id == id))
    await db.commit()
    return {"status": "success"}

@router.get("/api/funnels/{id}/stats")
async def get_funnel_stats(id: int, db: AsyncSession = Depends(get_db)):
    # 1. Fetch Funnel with steps
    res = await db.execute(select(models.Funnel).where(models.Funnel.id == id).options(selectinload(models.Funnel.steps)))
    funnel = res.scalars().first()
    if not funnel:
        raise HTTPException(status_code=404, detail="Funnel not found")
        
    steps = sorted(funnel.steps, key=lambda s: s.order)
    
    if not steps:
        return {"funnel_name": funnel.name, "steps": [], "total_sessions": 0, "overall_conversion": 0, "avg_ttc": 0}

    # 2. Build ClickHouse Funnel Query
    conditions = []
    for s in steps:
        if s.type == 'page_view':
            conditions.append(f"event_type = 'page_view' AND url LIKE '%{s.value}%'")
        else:
            conditions.append(f"event_type = '{s.value}'")
            
    cond_str = ", ".join(conditions)
    
    # We need resource_uid for ClickHouse
    res_obj = await db.execute(select(models.Resource).where(models.Resource.id == funnel.resource_id))
    resource = res_obj.scalars().first()
    if not resource:
        print(f"Error: Resource not found for funnel {id}")
        return {"funnel_name": funnel.name, "steps": [], "total_sessions": 0, "overall_conversion": 0, "avg_ttc": 0, "error": "Resource not found"}
        
    rid = resource.uid

    ch = get_clickhouse_client()
    
    # Main funnel counts
    query = f"""
    SELECT 
        level, 
        count(*) as count 
    FROM (
        SELECT 
            session_id, 
            windowFunnel(86400)({cond_str}) as level 
        FROM telemetry 
        WHERE resource_id = '{rid}'
        GROUP BY session_id
    ) 
    GROUP BY level 
    ORDER BY level
    """
    
    try:
        ch_res = ch.query(query).result_rows
        print(f"Funnel {id} results: {ch_res}")
    except Exception as e:
        print(f"ClickHouse Funnel Error: {e}")
        ch_res = []
    
    level_counts = {row[0]: row[1] for row in ch_res}
    
    # Calculate step stats
    step_stats = []
    # Total unique sessions that reached at least the first step
    total_starts = sum(c for lvl, c in level_counts.items() if lvl >= 1)
    
    for i in range(len(steps)):
        step_index = i + 1
        # Count sessions that reached at least this step
        count = sum(c for lvl, c in level_counts.items() if lvl >= step_index)
        
        # Dropoff calculation (relative to previous step)
        if i == 0:
            dropoff = 0
        else:
            prev_count = sum(c for lvl, c in level_counts.items() if lvl >= i)
            dropoff = round((1 - (count / prev_count)) * 100, 1) if prev_count > 0 else 100
            
        step_stats.append({
            "name": steps[i].name,
            "count": count,
            "dropoff": dropoff,
            "conversion": round((count / total_starts * 100), 1) if total_starts > 0 else 0
        })

    # Calculate potential revenue
    total_revenue = sum((s['count'] * steps[i].conversion_value) for i, s in enumerate(step_stats) if steps[i].conversion_value > 0)

    # 3. Calculate Time to Convert (TTC) for the whole funnel
    ttc = 0
    if len(steps) > 1 and total_starts > 0 and step_stats[-1]['count'] > 0:
        ttc_query = f"""
        SELECT avg(diff) FROM (
            SELECT 
                session_id,
                minIf(timestamp, {conditions[-1]}) as end_ts,
                minIf(timestamp, {conditions[0]}) as start_ts,
                dateDiff('second', start_ts, end_ts) as diff
            FROM telemetry
            WHERE resource_id = '{rid}'
            GROUP BY session_id
            HAVING start_ts > '1970-01-01 00:00:00' AND end_ts >= start_ts
        )
        """
        try:
            ttc_res = ch.query(ttc_query).first_row
            ttc = round(ttc_res[0], 1) if ttc_res and ttc_res[0] else 0
        except Exception as e:
            print(f"TTC Error: {e}")
            ttc = 0

    return {
        "funnel_name": funnel.name,
        "steps": step_stats,
        "total_sessions": total_starts,
        "overall_conversion": step_stats[-1]['conversion'] if step_stats else 0,
        "avg_ttc": ttc,
        "total_revenue": total_revenue
    }
