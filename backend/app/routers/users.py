from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
import json
from .. import models
from ..database import get_db, get_clickhouse_client
from ..security import get_current_user
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(tags=["Users"])

class TimelineEvent(BaseModel):
    event_type: str
    timestamp: str
    url: Optional[str] = None
    referrer: Optional[str] = None
    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    utm_campaign: Optional[str] = None
    ip: Optional[str] = None
    user_agent: Optional[str] = None
    payload: Optional[str] = None

class TimelineResponse(BaseModel):
    identity: str
    events: List[TimelineEvent]

@router.get("/api/users/timeline", response_model=TimelineResponse)
async def get_user_timeline(
    resource_id: int,
    identity: str,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    event_name: Optional[str] = None,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # 1. Resolve Resource
    res_obj = await db.execute(select(models.Resource).where(models.Resource.id == resource_id))
    resource = res_obj.scalars().first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    rid = resource.uid
    ch = get_clickhouse_client()

    # 2. Build Query for Telemetry (Web)
    # Note: If it's a bot, we'd query 'events' table instead. 
    # For now, we assume web telemetry if type is Website.
    
    table = "telemetry" if resource.type == "Website" else "events"
    id_column = "session_id" if resource.type == "Website" else "user_id"
    rid_column = "resource_id" if resource.type == "Website" else "bot_id"

    params = {
        "rid": rid,
        "identity": identity,
        "limit": limit
    }
    
    conditions = [f"{rid_column} = {{rid:String}}", f"{id_column} = {{identity:String}}"]
    
    if date_from:
        conditions.append("toDate(timestamp) >= {start:String}")
        params["start"] = date_from
    if date_to:
        conditions.append("toDate(timestamp) <= {end:String}")
        params["end"] = date_to
    if event_name:
        conditions.append("event_type = {ename:String}")
        params["ename"] = event_name

    where_clause = "WHERE " + " AND ".join(conditions)
    
    if resource.type == "Website":
        query = f"""
            SELECT 
                event_type, 
                formatDateTime(timestamp, '%Y-%m-%dT%H:%i:%sZ') as ts,
                url, 
                referrer, 
                utm_source, 
                utm_medium, 
                utm_campaign,
                ip,
                user_agent,
                payload
            FROM telemetry
            {where_clause}
            ORDER BY timestamp DESC
            LIMIT {{limit:Int32}}
        """
    else:
        # Bot events schema is simpler
        query = f"""
            SELECT 
                event_type, 
                formatDateTime(timestamp, '%Y-%m-%dT%H:%i:%sZ') as ts,
                '' as url, 
                '' as referrer, 
                '' as utm_source, 
                '' as utm_medium, 
                '' as utm_campaign,
                '' as ip,
                '' as user_agent,
                payload
            FROM events
            {where_clause}
            ORDER BY timestamp DESC
            LIMIT {{limit:Int32}}
        """

    try:
        rows = ch.query(query, parameters=params).result_rows
    except Exception as e:
        print(f"ClickHouse Timeline Error: {e}")
        return {"identity": identity, "events": []}

    events = []
    for r in rows:
        events.append({
            "event_type": r[0],
            "timestamp": r[1],
            "url": r[2],
            "referrer": r[3],
            "utm_source": r[4],
            "utm_medium": r[5],
            "utm_campaign": r[6],
            "ip": r[7],
            "user_agent": r[8],
            "payload": r[9]
        })

    return {
        "identity": identity,
        "events": events
    }
