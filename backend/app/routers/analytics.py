from fastapi import APIRouter, Depends, HTTPException, Request, BackgroundTasks
from typing import Optional, List
import datetime
import json
import redis
import httpx
from ..database import get_clickhouse_client
from ..config import settings

router = APIRouter(tags=["Analytics"])
redis_client = redis.from_url(settings.REDIS_URL)

async def log_system(level: str, module: str, message: str, details: str = ""):
    try:
        client = get_clickhouse_client()
        client.insert("system_logs", [[level, module, message, details]], column_names=["level", "module", "message", "details"])
    except:
        pass

async def send_to_conversion_api(event_name: str, data: dict, fbclid: str = None, ttclid: str = None):
    try:
        if fbclid:
            pass
        
        if ttclid:
            pass
            
        await log_system("INFO", "CAPI", f"CAPI Triggered: {event_name}", f"FB: {fbclid}, TT: {ttclid}")
    except Exception as e:
        await log_system("ERROR", "CAPI", str(e))

@router.get("/api/dashboard/stats")
async def get_dashboard_stats(resource_id: Optional[str] = None):
    try:
        client = get_clickhouse_client()
        
        # Safe parameter handling
        params = {}
        filters = ["1=1"]
        if resource_id and resource_id not in ('null', 'undefined'):
            filters.append("resource_id = {rid:String}")
            params['rid'] = resource_id
            
        where_clause = "WHERE " + " AND ".join(filters)
        

        stats_query = f"""
        SELECT 
            uniqExact(session_id) as visitors,
            count(*) as views
        FROM telemetry 
        {where_clause} AND timestamp >= now() - INTERVAL 24 HOUR
        """
        stats_res = client.query(stats_query, parameters=params).first_row
        visitors, views = stats_res if stats_res else (0, 0)
        
        # Bounce Rate approximation
        bounce_query = f"""
        SELECT count(*) FROM (
            SELECT session_id, count(*) as c 
            FROM telemetry 
            {where_clause} AND timestamp >= now() - INTERVAL 24 HOUR 
            GROUP BY session_id HAVING c = 1
        )
        """
        bounce_count = client.query(bounce_query, parameters=params).first_row[0]
        bounce_rate = (bounce_count / visitors * 100) if visitors > 0 else 0


        chart_query = f"""
        SELECT toStartOfHour(timestamp) as h, count(*) 
        FROM telemetry 
        {where_clause} AND timestamp >= now() - INTERVAL 24 HOUR
        GROUP BY h 
        ORDER BY h
        """
        chart_res = client.query(chart_query, parameters=params).result_rows
        
        # Initialize last 24 slots
        now = datetime.datetime.now().replace(minute=0, second=0, microsecond=0)
        last_24_hours = [(now - datetime.timedelta(hours=i)) for i in range(23, -1, -1)]
        
        counts_map = {row[0].replace(minute=0, second=0, microsecond=0): row[1] for row in chart_res}
        raw_counts = [counts_map.get(hr, 0) for hr in last_24_hours]
        
        # Normalize to 100% for frontend display
        max_val = max(raw_counts) if raw_counts and max(raw_counts) > 0 else 1
        chart_data = [int((c / max_val) * 100) for c in raw_counts]
        

        session_dur_query = f"""
        SELECT avg(dur) FROM (
            SELECT session_id, dateDiff('second', min(timestamp), max(timestamp)) as dur
            FROM telemetry 
            {where_clause} AND timestamp >= now() - INTERVAL 24 HOUR
            GROUP BY session_id
        ) WHERE dur > 0
        """
        dur_res = client.query(session_dur_query, parameters=params).first_row[0]
        dur_val = int(dur_res) if dur_res else 0
        minutes = dur_val // 60
        seconds = dur_val % 60
        session_str = f"{minutes}m {seconds}s"

        return {
            "visitors": visitors,
            "views": views,
            "session": session_str, 
            "bounce": f"{int(bounce_rate)}%",
            "chart_data": chart_data,
            "retention": {
                "d7": "0.0%",
                "d30": "0.0%",
                "new_vs_returning": {
                    "new": 100,
                    "returning": 0
                }
            }
        }
    except Exception as e:
        print(f"Stats Error: {e}")
        return {
            "visitors": 0, "views": 0, "session": "-", "bounce": "-", "chart_data": [],
            "retention": {"d7": "-", "d30": "-", "new_vs_returning": {"new": 0, "returning": 0}}
        }

@router.post("/api/v1/collect")
async def collect_telemetry(request: Request, background_tasks: BackgroundTasks):
    try:
        data = await request.json()
        client = get_clickhouse_client()
        
        session_id = data.get("sid", data.get("session_id", "unknown"))
        fbclid = data.get("fbclid") or ""
        ttclid = data.get("ttclid") or ""
        event_type = data.get("type", "page_view")
        
        payload = {
            "resource_id": str(data.get("rid", "")),
            "event_type": event_type,
            "url": data.get("url", ""),
            "referrer": data.get("ref", ""),
            "user_agent": request.headers.get("user-agent", ""),
            "ip": request.client.host,
            "screen_res": data.get("res", ""),
            "lang": data.get("lang", ""),
            "utm_source": data.get("utm_s") or "",
            "utm_medium": data.get("utm_m") or "",
            "utm_campaign": data.get("utm_c") or "",
            "fbclid": fbclid,
            "ttclid": ttclid,
            "session_id": session_id,
            "payload": json.dumps(data.get("meta") or {}),
        }
        
        # Live tracking in Redis
        if payload["resource_id"] and session_id:
            redis_key = f"ot:active:{payload['resource_id']}:{session_id}"
            redis_client.setex(redis_key, 300, json.dumps({
                "ip": payload["ip"],
                "url": payload["url"],
                "ts": str(datetime.datetime.now())
            }))

        client.insert("telemetry", [list(payload.values())], column_names=list(payload.keys()))
        
        # Trigger Conversion API in background if IDs are present
        if fbclid or ttclid:
            background_tasks.add_task(send_to_conversion_api, event_type, data, fbclid, ttclid)
            
        return {"status": "success"}
    except Exception as e:
        await log_system("ERROR", "Telemetry", str(e))
        return {"status": "error", "message": str(e)}

@router.get("/api/analytics/live")
async def get_live_analytics(resource_id: Optional[str] = None):
    try:
        # Redis part
        r_pattern = resource_id if resource_id and resource_id != 'undefined' else '*'
        pattern = f"ot:active:{r_pattern}:*"
        keys = redis_client.keys(pattern)
        count = len(keys)
        
        locations = []
        if count > 0:
             locations = [{"lat": 50.45, "lng": 30.52, "city": "User", "count": count}]
        
        # Recent Events from ClickHouse
        client = get_clickhouse_client()
        params = {}
        filters = ["1=1"]
        if resource_id and resource_id != 'undefined':
             filters.append("resource_id = {rid:String}")
             params['rid'] = resource_id
             
        where_clause = "WHERE " + " AND ".join(filters)
        
        events_query = f"""
        SELECT event_type, url, ip, timestamp 
        FROM telemetry 
        {where_clause} 
        ORDER BY timestamp DESC LIMIT 20
        """
        events_res = client.query(events_query, parameters=params).result_rows
        recent_events = [
            {"type": r[0], "url": r[1], "ip": r[2], "ts": r[3]} for r in events_res
        ] if events_res else []

        return {
            "online": count,
            "locations": locations,
            "events": recent_events
        }
    except Exception as e:
        return {"online": 0, "locations": [], "error": str(e)}

@router.get("/api/logs")
async def get_logs():
    try:
        client = get_clickhouse_client()
        result = client.query("SELECT * FROM system_logs ORDER BY timestamp DESC LIMIT 50")
        return result.result_rows
    except:
        return []

@router.get("/api/analytics/explore")
async def explore_analytics(resource_id: Optional[str] = None, start: Optional[str] = None, end: Optional[str] = None):
    try:
        client = get_clickhouse_client()
        
        params = {}
        conditions = []
        if resource_id and resource_id != 'undefined':
             conditions.append("resource_id = {rid:String}")
             params['rid'] = resource_id
        
        if start:
            conditions.append("toDate(timestamp) >= {start:String}")
            params['start'] = start
        if end:
            conditions.append("toDate(timestamp) <= {end:String}")
            params['end'] = end
            
        where_clause = "WHERE " + " AND ".join(conditions) if conditions else "WHERE 1=1"
        

        simple_metrics_query = f"""
        SELECT 
            uniqExact(session_id), 
            count(*) 
        FROM telemetry 
        {where_clause}
        """
        metrics_res = client.query(simple_metrics_query, parameters=params).first_row
        visitors, views = metrics_res if metrics_res else (0, 0)
        
        # Bounce rate
        bounce_query = f"""
             SELECT count(*) FROM (
                SELECT session_id, count(*) as c 
                FROM telemetry 
                {where_clause} 
                GROUP BY session_id HAVING c = 1
            )
        """
        bounces = client.query(bounce_query, parameters=params).first_row[0]
        bounce_rate = (bounces / visitors * 100) if visitors > 0 else 0


        source_query = f"""
        SELECT utm_source, count(*) as c
        FROM telemetry
        {where_clause}
        GROUP BY utm_source
        ORDER BY c DESC
        LIMIT 5
        """
        source_res = client.query(source_query, parameters=params).result_rows
        sources = [{"name": r[0] if r[0] else "Direct / None", "val": r[1]} for r in source_res]
        
        for s in sources:
            s["pct"] = int((s["val"] / views * 100)) if views > 0 else 0


        event_query = f"""
        SELECT event_type, count(*) as c
        FROM telemetry
        {where_clause} AND event_type != 'page_view'
        GROUP BY event_type
        ORDER BY c DESC
        LIMIT 10
        """
        event_res = client.query(event_query, parameters=params).result_rows
        events = [{"name": r[0], "val": r[1]} for r in event_res]

        return {
            "metrics": {
                "visitors": visitors,
                "views": views,
                "bounce_rate": round(bounce_rate, 1)
            },
            "sources": sources,
            "events": events
        }
    except Exception as e:
        print(f"Explore Error: {e}")
        return {"metrics": {"visitors": 0, "views": 0, "bounce_rate": 0}, "sources": [], "error": str(e)}
