from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from ..database import get_db, get_clickhouse_client
from .. import models
from pydantic import BaseModel
from ..security import get_current_user
from datetime import datetime
import json
import traceback

router = APIRouter(tags=["Reports"])

class ReportCreate(BaseModel):
    name: str
    resource_id: int
    config: str

class AdhocReportReq(BaseModel):
    resource_id: int
    metric: str
    dimension: str
    start_date: str
    end_date: str
    filters: Optional[List[dict]] = []

@router.get("/api/reports")
async def list_reports(resource_id: int, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    try:
        res = await db.execute(select(models.Report).where(models.Report.resource_id == resource_id))
        reports = res.scalars().all()
        return [
            {
                "id": r.id,
                "name": r.name,
                "config": r.config,
                "created_at": r.created_at.isoformat() if r.created_at else None
            } for r in reports
        ]
    except Exception as e:
        print(f"[REPORTS] List error: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/reports")
async def create_report(req: ReportCreate, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    try:
        print(f"[REPORTS] Creating report '{req.name}' for user {current_user.id}")
        report = models.Report(
            name=req.name,
            resource_id=req.resource_id,
            config=req.config
        )
        db.add(report)
        await db.commit()
        await db.refresh(report)
        print(f"[REPORTS] Report saved with ID {report.id}")
        return {
            "id": report.id,
            "name": report.name,
            "config": report.config,
            "created_at": report.created_at.isoformat() if report.created_at else None
        }
    except Exception as e:
        print(f"[REPORTS] Creation error: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/reports/adhoc")
async def get_adhoc_data(req: AdhocReportReq, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    try:
        print(f"[REPORTS] Adhoc request: metric={req.metric}, dim={req.dimension}, resource={req.resource_id}")
        # 1. Resolve resource_id to UID
        res_obj = await db.execute(select(models.Resource).where(models.Resource.id == req.resource_id))
        resource = res_obj.scalars().first()
        if not resource:
            print(f"[REPORTS] Resource {req.resource_id} not found")
            raise HTTPException(status_code=404, detail="Resource not found")
        
        rid = resource.uid
        client = get_clickhouse_client()
        
        # 2. Build Metrics QL
        metric_ql = "count(*)"
        if req.metric == 'users':
            metric_ql = "uniqExact(session_id)"
        elif req.metric == 'sessions':
            metric_ql = "uniq(session_id)"
            
        # 3. Build Dimensions QL
        dim_map = {
            'date': "toDate(timestamp)",
            'source': "multiIf(utm_source != '', utm_source, referrer != '', domainWithoutWWW(referrer), 'Direct')",
            'country': "lang",
            'device': "multiIf(user_agent LIKE '%Mobi%', 'Mobile', 'Desktop')",
            'event_name': "event_type"
        }
        dim_ql = dim_map.get(req.dimension, "toDate(timestamp)")
        
        # 4. Filters
        where_clauses = [f"resource_id = '{rid}'", f"timestamp >= '{req.start_date} 00:00:00'", f"timestamp <= '{req.end_date} 23:59:59'"]
        
        if req.filters:
            for f in req.filters:
                key = f.get('key')
                val = f.get('value')
                if key and val:
                    col_map = {
                        'source': 'utm_source',
                        'country': 'lang',
                        'device': 'user_agent',
                        'event_name': 'event_type'
                    }
                    col = col_map.get(key, key)
                    if col == 'user_agent':
                        where_clauses.append(f"user_agent LIKE '%{val}%'")
                    else:
                        where_clauses.append(f"{col} = '{val}'")
                    
        where_str = " AND ".join(where_clauses)
        
        query = f"""
            SELECT {dim_ql} as dim, {metric_ql} as val
            FROM telemetry
            WHERE {where_str}
            GROUP BY dim
            ORDER BY val DESC
            LIMIT 100
        """
        
        print(f"[REPORTS] Executing CH query: {query}")
        result = client.query(query).result_rows
        formatted = [{"label": str(r[0]), "value": r[1]} for r in result]
        print(f"[REPORTS] Found {len(formatted)} rows")
        return {"data": formatted}
    except Exception as e:
        print(f"[REPORTS] Adhoc execution error: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/api/reports/{report_id}")
async def delete_report(report_id: int, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    try:
        res = await db.execute(select(models.Report).where(models.Report.id == report_id))
        report = res.scalars().first()
        if report:
            await db.delete(report)
            await db.commit()
        return {"status": "success"}
    except Exception as e:
        print(f"[REPORTS] Delete error: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
