from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import List, Optional
from .. import models
from ..schemas import schemas
from ..database import get_db, get_clickhouse_client
import json

router = APIRouter(tags=["Funnels"])

@router.get("/api/funnels", response_model=List[schemas.Funnel])
async def get_funnels(resource_id: Optional[int] = None, db: AsyncSession = Depends(get_db)):
    query = select(models.Funnel)
    if resource_id:
        query = query.where(models.Funnel.resource_id == resource_id)
    result = await db.execute(query.order_by(models.Funnel.created_at.desc()))
    return result.scalars().all()

@router.post("/api/funnels", response_model=schemas.Funnel)
async def create_funnel(req: schemas.FunnelCreate, db: AsyncSession = Depends(get_db)):
    funnel = models.Funnel(name=req.name, resource_id=req.resource_id)
    db.add(funnel)
    await db.commit()
    await db.refresh(funnel)
    
    for step_req in req.steps:
        step = models.FunnelStep(
            funnel_id=funnel.id,
            name=step_req.name,
            type=step_req.type,
            value=step_req.value,
            order=step_req.order
        )
        db.add(step)
    
    await db.commit()
    await db.refresh(funnel)
    return funnel

@router.get("/api/funnels/{funnel_id}", response_model=schemas.Funnel)
async def get_funnel(funnel_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Funnel).where(models.Funnel.id == funnel_id))
    funnel = result.scalars().first()
    if not funnel:
        raise HTTPException(status_code=404, detail="Funnel not found")
    return funnel

@router.delete("/api/funnels/{funnel_id}")
async def delete_funnel(funnel_id: int, db: AsyncSession = Depends(get_db)):
    await db.execute(delete(models.Funnel).where(models.Funnel.id == funnel_id))
    await db.commit()
    return {"status": "success"}

@router.get("/api/funnels/{funnel_id}/stats")
async def get_funnel_stats(funnel_id: int, db: AsyncSession = Depends(get_db)):
    # 1. Get funnel config
    result = await db.execute(select(models.Funnel).where(models.Funnel.id == funnel_id))
    funnel = result.scalars().first()
    if not funnel:
        raise HTTPException(status_code=404, detail="Funnel not found")
    
    # 2. Get resource UID
    res_obj = await db.execute(select(models.Resource).where(models.Resource.id == funnel.resource_id))
    resource = res_obj.scalars().first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    # 3. Build conditions for ClickHouse windowFunnel
    conditions = []
    for step in funnel.steps:
        if step.type == 'page_view':
            # Escape single quotes and use LIKE for flexibility
            val = step.value.replace("'", "\\'")
            conditions.append(f"(event_type = 'page_view' AND url LIKE '%{val}%')")
        else:
            val = step.value.replace("'", "\\'")
            conditions.append(f"event_type = '{val}'")
    
    if not conditions:
        return {"steps": [], "total_conversions": 0}

    cond_str = ", ".join(conditions)
    
    # 4. Query ClickHouse
    try:
        client = get_clickhouse_client()
        
        # We use a 24-hour window (86400 seconds)
        query = f"""
            SELECT
                level,
                count() AS count
            FROM (
                SELECT
                    session_id,
                    windowFunnel(86400)(
                        timestamp,
                        {cond_str}
                    ) AS level
                FROM telemetry
                WHERE resource_id = '{resource.uid}'
                GROUP BY session_id
            )
            GROUP BY level
            ORDER BY level ASC
        """
        
        results = client.query(query).result_rows
        # results looks like [(0, 100), (1, 50), (2, 30), (3, 10)]
        # level 0 means did't even complete the first condition (or session had no events matching first)
        # Actually windowFunnel returns 1 for 1st step, 2 for 2nd, etc.
        # level 0 means no steps completed.
        
        counts_map = {row[0]: row[1] for row in results}
        
        # Calculate reach at each step
        # A person at level 3 is also counted as having reached level 1 and 2.
        processed_steps = []
        total_sessions = sum(counts_map.values())
        
        reached_at_least = 0
        max_level = len(funnel.steps)
        
        # Sum from highest level down to lowest
        level_reaching = {}
        running_sum = 0
        for l in range(max_level, 0, -1):
            running_sum += counts_map.get(l, 0)
            level_reaching[l] = running_sum
            
        for i, step in enumerate(funnel.steps):
            level = i + 1
            count = level_reaching.get(level, 0)
            
            prev_count = level_reaching.get(level-1, total_sessions) if level > 1 else total_sessions
            drop_off = 0
            if prev_count > 0:
                drop_off = round((1 - (count / prev_count)) * 100, 1)
            
            processed_steps.append({
                "name": step.name,
                "count": count,
                "drop_off": drop_off,
                "percentage": round((count / total_sessions * 100), 1) if total_sessions > 0 else 0
            })

        # Calculate Time to Convert (average)
        # Only for those who reached the last level
        ttc_val = 0
        if max_level > 1 and level_reaching.get(max_level, 0) > 0:
            ttc_query = f"""
                SELECT
                    avg(dateDiff('second', min_ts, max_ts))
                FROM (
                    SELECT
                        session_id,
                        minIf(timestamp, {conditions[0]}) as min_ts,
                        maxIf(timestamp, {conditions[-1]}) as max_ts,
                        windowFunnel(86400)(timestamp, {cond_str}) as level
                    FROM telemetry
                    WHERE resource_id = '{resource.uid}'
                    GROUP BY session_id
                    HAVING level = {max_level}
                )
            """
            ttc_res = client.query(ttc_query).first_row
            ttc_val = int(ttc_res[0]) if ttc_res and ttc_res[0] else 0

        return {
            "funnel_name": funnel.name,
            "total_sessions": total_sessions,
            "steps": processed_steps,
            "time_to_convert": ttc_val, # in seconds
            "conversion_rate": processed_steps[-1]["percentage"] if processed_steps else 0
        }

    except Exception as e:
        print(f"Funnel Stats Error: {e}")
        return {"error": str(e), "steps": []}
