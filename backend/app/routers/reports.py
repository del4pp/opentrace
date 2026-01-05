from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from ..database import get_db, get_clickhouse_client
from .. import models
from pydantic import BaseModel
from ..security import get_current_user
import json
from datetime import datetime, timedelta

router = APIRouter(tags=["Reports"])

class ReportCreate(BaseModel):
    name: str
    resource_id: int
    config: str

class AdhocReportReq(BaseModel):
    resource_id: int
    metric: str # 'events', 'sessions', 'users'
    dimension: str # 'date', 'source', 'country', 'device', 'event_name'
    start_date: str
    end_date: str
    filters: Optional[List[dict]] = []

@router.get("/api/reports")
async def list_reports(resource_id: int, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    res = await db.execute(select(models.Report).where(models.Report.resource_id == resource_id))
    reports = res.scalars().all()
    # Manual mapping to avoid any weird serialization issues
    return [
        {
            "id": r.id,
            "name": r.name,
            "config": r.config,
            "created_at": r.created_at.isoformat() if r.created_at else None
        } for r in reports
    ]

@router.post("/api/reports")
async def create_report(req: ReportCreate, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    report = models.Report(
        name=req.name,
        resource_id=req.resource_id,
        config=req.config
    )
    db.add(report)
    await db.commit()
    await db.refresh(report)
    return {
        "id": report.id,
        "name": report.name,
        "config": report.config,
        "created_at": report.created_at.isoformat() if report.created_at else None
    }

@router.get("/api/reports/{report_id}")
async def get_report(report_id: int, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    res = await db.execute(select(models.Report).where(models.Report.id == report_id))
    report = res.scalars().first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return {
        "id": report.id,
        "name": report.name,
        "config": report.config,
        "created_at": report.created_at.isoformat() if report.created_at else None
    }

@router.delete("/api/reports/{report_id}")
async def delete_report(report_id: int, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    res = await db.execute(select(models.Report).where(models.Report.id == report_id))
    report = res.scalars().first()
    if report:
        await db.delete(report)
        await db.commit()
    return {"status": "success"}

@router.post("/api/reports/adhoc")
async def get_adhoc_data(req: AdhocReportReq, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # 1. Resolve resource_id to UID
    res_obj = await db.execute(select(models.Resource).where(models.Resource.id == req.resource_id))
    resource = res_obj.scalars().first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    rid = resource.uid
    
    # 2. Build ClickHouse Query
    client = get_clickhouse_client()
    
    metric_ql = "count(*)"
    if req.metric == 'users':
        metric_ql = "uniq(user_id)"
    elif req.metric == 'sessions':
        metric_ql = "uniq(session_id)"
        
    dim_ql = req.dimension
    if req.dimension == 'date':
        dim_ql = "toDate(timestamp)"
    
    where_clauses = [f"resource_id = '{rid}'", f"timestamp >= '{req.start_date} 00:00:00'", f"timestamp <= '{req.end_date} 23:59:59'"]
    
    if req.filters:
        for f in req.filters:
            key = f.get('key')
            val = f.get('value')
            if key and val:
                where_clauses.append(f"{key} = '{val}'")
                
    where_str = " AND ".join(where_clauses)
    
    query = f"""
        SELECT {dim_ql} as dim, {metric_ql} as val
        FROM telemetry
        WHERE {where_str}
        GROUP BY dim
        ORDER BY dim ASC
    """
    
    try:
        # Use result_rows for SELECT queries
        result = client.query(query).result_rows
        formatted = [{"label": str(r[0]), "value": r[1]} for r in result]
        return {"data": formatted}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
