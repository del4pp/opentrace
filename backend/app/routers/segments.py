from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
import json
from .. import models
from ..database import get_db, get_clickhouse_client
from pydantic import BaseModel
from ..segmentation import generate_segment_query, generate_segment_count_query

router = APIRouter(tags=["Segments"])

class SegmentCreate(BaseModel):
    name: str
    resource_id: int
    config: dict

class SegmentResponse(BaseModel):
    id: int
    name: str
    resource_id: int
    config: dict
    created_at: str

@router.post("/api/segments", response_model=SegmentResponse)
async def create_segment(
    seg: SegmentCreate,
    db: AsyncSession = Depends(get_db)
):
    new_segment = models.Segment(
        name=seg.name,
        resource_id=seg.resource_id,
        config=json.dumps(seg.config)
    )
    db.add(new_segment)
    await db.commit()
    await db.refresh(new_segment)
    
    return {
        "id": new_segment.id,
        "name": new_segment.name,
        "resource_id": new_segment.resource_id,
        "config": seg.config,
        "created_at": new_segment.created_at.isoformat()
    }

@router.get("/api/segments", response_model=List[SegmentResponse])
async def get_segments(
    resource_id: int,
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(models.Segment).where(models.Segment.resource_id == resource_id))
    segments = res.scalars().all()
    
    return [
        {
            "id": s.id,
            "name": s.name,
            "resource_id": s.resource_id,
            "config": json.loads(s.config),
            "created_at": s.created_at.isoformat()
        }
        for s in segments
    ]

@router.get("/api/segments/{id}/preview")
async def preview_segment(
    id: int,
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(models.Segment).where(models.Segment.id == id))
    segment = res.scalars().first()
    if not segment:
        raise HTTPException(status_code=404, detail="Segment not found")
    
    res_obj = await db.execute(select(models.Resource).where(models.Resource.id == segment.resource_id))
    resource = res_obj.scalars().first()
    
    config = json.loads(segment.config)
    rid = resource.uid
    ch = get_clickhouse_client()
    
    count_query = generate_segment_count_query(rid, config)
    preview_query = generate_segment_query(rid, config, limit=10)
    
    count = ch.query(count_query).result_rows[0][0]
    samples = ch.query(preview_query).result_rows
    
    return {
        "count": count,
        "samples": [s[0] for s in samples]
    }

@router.delete("/api/segments/{id}")
async def delete_segment(
    id: int,
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(models.Segment).where(models.Segment.id == id))
    segment = res.scalars().first()
    if not segment:
        raise HTTPException(status_code=404, detail="Segment not found")
    
    await db.delete(segment)
    await db.commit()
    return {"status": "deleted"}
