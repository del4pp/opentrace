from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from .. import models
from ..database import get_db, get_clickhouse_client
from pydantic import BaseModel
from datetime import datetime, timedelta

router = APIRouter(tags=["Retention"])

class RetentionCohort(BaseModel):
    cohort_date: str
    cohort_size: int
    retention: dict

class RetentionResponse(BaseModel):
    cohorts: List[RetentionCohort]

@router.get("/api/analytics/retention", response_model=RetentionResponse)
async def get_retention(
    resource_id: int,
    date_from: str,
    date_to: str,
    event: str = "any",
    max_days: int = 30,
    source: Optional[str] = None,
    country: Optional[str] = None,
    device: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    # 1. Get Resource UID for ClickHouse
    res_obj = await db.execute(select(models.Resource).where(models.Resource.id == resource_id))
    resource = res_obj.scalars().first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    rid = resource.uid
    ch = get_clickhouse_client()

    # 2. Build Filter Clause
    filters = []
    if source: filters.append(f"AND source = '{source}'")
    if country: filters.append(f"AND country = '{country}'")
    if device: filters.append(f"AND device = '{device}'")
    filter_clause = " ".join(filters)

    event_clause = f"AND event_type = '{event}'" if event != "any" else ""

    # 3. Build Retention Conditions for 30 days
    conditions = ", ".join([f"toDate(t.timestamp) = c.first_event_date + {i}" for i in range(max_days + 1)])

    # 4. Master Query
    query = f"""
    WITH 
        cohort_users AS (
            SELECT identity, first_event_date 
            FROM user_cohorts
            WHERE resource_id = '{rid}' 
              AND first_event_date BETWEEN '{date_from}' AND '{date_to}'
              {filter_clause}
        )
    SELECT
        c.first_event_date as cohort_date,
        count(DISTINCT c.identity) as cohort_size,
        retention(
            {conditions}
        ) as stats
    FROM cohort_users c
    LEFT JOIN telemetry t ON t.session_id = c.identity AND t.resource_id = '{rid}'
    WHERE toDate(t.timestamp) <= c.first_event_date + INTERVAL {max_days} DAY
      {event_clause}
    GROUP BY cohort_date
    ORDER BY cohort_date DESC
    """

    try:
        rows = ch.query(query).result_rows
    except Exception as e:
        print(f"ClickHouse Retention Error: {e}")
        return {"cohorts": []}

    cohorts = []
    for row in rows:
        c_date, size, stats = row
        retention_values = {}
        for i, val in enumerate(stats):
            retention_values[f"day_{i}"] = val
            
        cohorts.append({
            "cohort_date": str(c_date),
            "cohort_size": size,
            "retention": retention_values
        })

    return {"cohorts": cohorts}
