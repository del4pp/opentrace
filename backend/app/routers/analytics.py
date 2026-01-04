from fastapi import APIRouter, Depends, HTTPException, Request, BackgroundTasks, Request as FastAPIRequest
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import datetime
import json
import redis
import httpx
import random
from ..database import get_clickhouse_client
from ..config import settings
from ..conversion_apis import process_event_actions
from ..database import get_db
from ..security import verify_token
from .. import models

router = APIRouter(tags=["Analytics"])
redis_client = redis.from_url(settings.REDIS_URL)

async def check_demo_mode(db: AsyncSession) -> bool:
    try:
        res = await db.execute(select(models.Setting).where(models.Setting.key == "show_demo"))
        setting = res.scalars().first()
        return (setting.value == "true") if setting else True
    except:
        return True

async def log_system(level: str, module: str, message: str, details: str = ""):
    try:
        client = get_clickhouse_client()
        client.insert("system_logs", [[level, module, message, details]], column_names=["level", "module", "message", "details"])
    except:
        pass

async def send_to_conversion_api(event_name: str, data: dict, fbclid: str = None, ttclid: str = None):
    try:
        # Check Redis for stored click IDs if not provided
        session_id = data.get("sid", data.get("session_id", "unknown"))
        resource_id = data.get("rid", "")

        if resource_id and session_id and not (fbclid or ttclid):
            redis_key = f"ot:active:{resource_id}:{session_id}"
            session_data = redis_client.get(redis_key)
            if session_data:
                try:
                    session_info = json.loads(session_data)
                    if not fbclid and session_info.get("fbclid"):
                        fbclid = session_info["fbclid"]
                    if not ttclid and session_info.get("ttclid"):
                        ttclid = session_info["ttclid"]
                except:
                    pass

        # Get event actions from database
        from ..database import engine
        from sqlalchemy.ext.asyncio import AsyncSession
        async with AsyncSession(engine) as db:
            # Resolve UID to ID if necessary
            actual_resource_id = None
            if resource_id:
                res_obj = await db.execute(select(models.Resource).where(models.Resource.uid == resource_id))
                resource = res_obj.scalars().first()
                if resource:
                    actual_resource_id = resource.id

            if not actual_resource_id:
                return

            result = await db.execute(
                select(models.EventAction)
                .join(models.Event, models.Event.id == models.EventAction.event_id)
                .where(
                    models.Event.name == event_name, 
                    models.EventAction.is_active == True,
                    models.Event.resource_id == actual_resource_id
                )
            )
            actions = result.scalars().all()

            if actions:
                # Prepare user data for conversion APIs
                user_data = {
                    'ip': data.get('ip', ''),
                    'user_agent': data.get('user_agent', ''),
                    'url': data.get('url', ''),
                    'email': data.get('email', ''),
                    'phone': data.get('phone', ''),
                    'fbclid': fbclid,
                    'ttclid': ttclid,
                    'session_id': session_id
                }

                # Process all configured actions
                results = await process_event_actions(event_name, user_data, [
                    {
                        'action_type': action.action_type,
                        'config': action.config,
                        'is_active': action.is_active
                    } for action in actions
                ])

                await log_system("INFO", "CAPI", f"CAPI processed: {event_name}", f"FB:{fbclid} TT:{ttclid} Results: {results}")
            else:
                await log_system("INFO", "CAPI", f"No actions configured for: {event_name}")

    except Exception as e:
        await log_system("ERROR", "CAPI", str(e))

@router.get("/api/dashboard/stats")
async def get_dashboard_stats(resource_id: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    try:
        client = get_clickhouse_client()
        params = {}
        filters = ["1=1"]
        if resource_id and resource_id not in ('null', 'undefined'):
            filters.append("resource_id = {rid:String}")
            params['rid'] = resource_id
        where_clause = "WHERE " + " AND ".join(filters)

        stats_query = f"SELECT uniqExact(session_id) as visitors, count(*) as views FROM telemetry {where_clause} AND timestamp >= now() - INTERVAL 24 HOUR"
        stats_res = client.query(stats_query, parameters=params).first_row
        visitors, views = stats_res if stats_res else (0, 0)
        
        # Bounce Rate approximation
        bounce_query = f"SELECT count(*) FROM (SELECT session_id, count(*) as c FROM telemetry {where_clause} AND timestamp >= now() - INTERVAL 24 HOUR GROUP BY session_id HAVING c = 1)"
        bounce_res = client.query(bounce_query, parameters=params).first_row
        bounce_count = bounce_res[0] if bounce_res else 0
        bounce_rate = (bounce_count / visitors * 100) if visitors > 0 else 0

        chart_query = f"SELECT toStartOfHour(timestamp) as h, count(*) FROM telemetry {where_clause} AND timestamp >= now() - INTERVAL 24 HOUR GROUP BY h ORDER BY h"
        chart_res = client.query(chart_query, parameters=params).result_rows
        
        now_dt_utc = datetime.datetime.now(datetime.timezone.utc).replace(minute=0, second=0, microsecond=0, tzinfo=None)
        last_24_hours = [(now_dt_utc - datetime.timedelta(hours=i)) for i in range(23, -1, -1)]
        counts_map = {row[0].replace(minute=0, second=0, microsecond=0): row[1] for row in chart_res}
        raw_counts = [counts_map.get(hr, 0) for hr in last_24_hours]
        max_val = max(raw_counts) if raw_counts and max(raw_counts) > 0 else 1
        chart_data = [int((c / max_val) * 100) for c in raw_counts]

        # Real-time online count
        r_pattern = resource_id if resource_id and resource_id != 'undefined' else '*'
        online_count = len(redis_client.keys(f"ot:active:{r_pattern}:*"))

        session_dur_query = f"SELECT avg(dur) FROM (SELECT session_id, dateDiff('second', min(timestamp), max(timestamp)) as dur FROM telemetry {where_clause} AND timestamp >= now() - INTERVAL 24 HOUR GROUP BY session_id) WHERE dur > 0"
        dur_raw = client.query(session_dur_query, parameters=params).first_row
        dur_val = int(dur_raw[0]) if dur_raw and dur_raw[0] else 0
        session_str = f"{dur_val // 60}m {dur_val % 60}s"

        # Audience Breakdown for Dashboard
        audience_query = f"SELECT multiIf(user_agent LIKE '%Mobi%', 'Mobile', 'Desktop') as dev, count(*) as c FROM telemetry {where_clause} AND timestamp >= now() - INTERVAL 24 HOUR GROUP BY dev ORDER BY c DESC"
        audience_res = client.query(audience_query, parameters=params).result_rows
        total = sum(r[1] for r in audience_res) if audience_res else 0
        audience = {r[0]: int(r[1]/total*100) if total > 0 else 0 for r in audience_res}

        return {
            "visitors": visitors, "views": views, "session": session_str, 
            "bounce": f"{int(bounce_rate)}%", "chart_data": chart_data,
            "audience": audience, "online": online_count,
            "retention": {"d7": "0.0%", "d30": "0.0%", "new_vs_returning": {"new": 100, "returning": 0}}
        }
    except Exception as e:
        print(f"Stats Error: {e}")
        return {"visitors": 0, "views": 0, "session": "-", "bounce": "-", "chart_data": [], "retention": {"d7": "-", "d30": "-", "new_vs_returning": {"new": 0, "returning": 0}}}

@router.post("/api/v1/collect")
async def collect_telemetry(request: Request, background_tasks: BackgroundTasks):
    try:
        data = await request.json()
        client = get_clickhouse_client()
        session_id = data.get("sid", data.get("session_id", "unknown"))
        fbclid, ttclid = data.get("fbclid") or "", data.get("ttclid") or ""
        event_type = data.get("type", "page_view")
        
        payload = {
            "resource_id": str(data.get("rid", "")), "event_type": event_type, "url": data.get("url", ""), "referrer": data.get("ref", ""),
            "user_agent": request.headers.get("user-agent", ""), "ip": request.client.host, "screen_res": data.get("res", ""), "lang": data.get("lang", ""),
            "utm_source": data.get("utm_s") or "", "utm_medium": data.get("utm_m") or "", "utm_campaign": data.get("utm_c") or "",
            "fbclid": fbclid, "ttclid": ttclid, "session_id": session_id, "payload": json.dumps(data.get("meta") or {}),
        }
        
        if payload["resource_id"] and session_id:
            redis_key = f"ot:active:{payload['resource_id']}:{session_id}"
            session_data = {"ip": payload["ip"], "url": payload["url"], "ts": str(datetime.datetime.now()), "fbclid": fbclid, "ttclid": ttclid}
            existing_data = redis_client.get(redis_key)
            if existing_data:
                try:
                    existing_session = json.loads(existing_data)
                    if not session_data["fbclid"] and existing_session.get("fbclid"): session_data["fbclid"] = existing_session["fbclid"]
                    if not session_data["ttclid"] and existing_session.get("ttclid"): session_data["ttclid"] = existing_session["ttclid"]
                except: pass
            redis_client.setex(redis_key, 1800, json.dumps(session_data))

        client.insert("telemetry", [list(payload.values())], column_names=list(payload.keys()))
        background_tasks.add_task(send_to_conversion_api, event_type, data, fbclid, ttclid)
        return {"status": "success"}
    except Exception as e:
        await log_system("ERROR", "Telemetry", str(e))
        return {"status": "error", "message": str(e)}

@router.get("/api/analytics/live")
async def get_live_analytics(resource_id: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    try:
        r_pattern = resource_id if resource_id and resource_id != 'undefined' else '*'
        pattern = f"ot:active:{r_pattern}:*"
        keys = redis_client.keys(pattern)
        count = len(keys)
        
        client = get_clickhouse_client()
        params = {}
        filters = ["1=1"]
        if resource_id and resource_id != 'undefined':
             filters.append("resource_id = {rid:String}")
             params['rid'] = resource_id
        where_clause = "WHERE " + " AND ".join(filters)
        
        events_query = f"SELECT event_type, url, ip, timestamp FROM telemetry {where_clause} ORDER BY timestamp DESC LIMIT 20"
        events_res = client.query(events_query, parameters=params).result_rows
        recent_events = [{"type": r[0], "url": r[1], "ip": r[2], "ts": r[3]} for r in events_res] if events_res else []

        locations = [{"lat": 50.45, "lng": 30.52, "city": "User", "count": count}] if count > 0 else []
        return {"online": count, "locations": locations, "events": recent_events}
    except Exception as e:
        return {"online": 0, "locations": [], "error": str(e)}

@router.get("/api/logs")
async def get_logs():
    try:
        client = get_clickhouse_client()
        result = client.query("SELECT * FROM system_logs ORDER BY timestamp DESC LIMIT 50")
        return result.result_rows
    except: return []

@router.get("/api/analytics/explore")
async def explore_analytics(resource_id: Optional[str] = None, start: Optional[str] = None, end: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    try:
        client = get_clickhouse_client()
        params, conditions = {}, []
        if resource_id and resource_id != 'undefined':
             conditions.append("resource_id = {rid:String}")
             params['rid'] = resource_id
        if start: conditions.append("toDate(timestamp) >= {start:String}"); params['start'] = start
        if end: conditions.append("toDate(timestamp) <= {end:String}"); params['end'] = end
        where_clause = "WHERE " + " AND ".join(conditions) if conditions else "WHERE 1=1"
        
        metrics_query = f"SELECT uniqExact(session_id), count(*) FROM telemetry {where_clause}"
        metrics_res = client.query(metrics_query, parameters=params).first_row
        visitors, views = metrics_res if metrics_res else (0, 0)
        
        bounce_query = f"SELECT count(*) FROM (SELECT session_id, count(*) as c FROM telemetry {where_clause} GROUP BY session_id HAVING c = 1)"
        bounces_res = client.query(bounce_query, parameters=params).first_row
        bounces = bounces_res[0] if bounces_res else 0
        bounce_rate = (bounces / visitors * 100) if visitors > 0 else 0

        # OS Breakdown
        os_query = f"SELECT multiIf(user_agent LIKE '%Windows%', 'Windows', user_agent LIKE '%Android%', 'Android', user_agent LIKE '%iPhone%' OR user_agent LIKE '%iPad%', 'iOS', user_agent LIKE '%Macintosh%', 'macOS', user_agent LIKE '%Linux%', 'Linux', 'Other') as os, count(*) as c FROM telemetry {where_clause} GROUP BY os ORDER BY c DESC"
        os_res = client.query(os_query, parameters=params).result_rows
        os_data = [{"name": r[0], "val": r[1]} for r in os_res]

        # Browser Breakdown
        browser_query = f"SELECT multiIf(user_agent LIKE '%Edg%', 'Edge', user_agent LIKE '%Chrome%', 'Chrome', user_agent LIKE '%Safari%' AND user_agent NOT LIKE '%Chrome%', 'Safari', user_agent LIKE '%Firefox%', 'Firefox', 'Other') as browser, count(*) as c FROM telemetry {where_clause} GROUP BY browser ORDER BY c DESC"
        browser_res = client.query(browser_query, parameters=params).result_rows
        browser_data = [{"name": r[0], "val": r[1]} for r in browser_res]

        # Device Breakdown
        device_query = f"SELECT multiIf(user_agent LIKE '%Mobi%', 'Mobile', 'Desktop') as device, count(*) as c FROM telemetry {where_clause} GROUP BY device ORDER BY c DESC"
        device_res = client.query(device_query, parameters=params).result_rows
        device_data = [{"name": r[0], "val": r[1]} for r in device_res]

        # Detailed Referrers
        # Using domain() and if parsing fails, returning full referrer or 'Other'
        ref_query = f"SELECT if(referrer='', 'Direct', domain(referrer)) as ref, count(*) as c FROM telemetry {where_clause} GROUP BY ref ORDER BY c DESC LIMIT 10"
        ref_res = client.query(ref_query, parameters=params).result_rows
        referrers = [{"name": r[0], "val": r[1]} for r in ref_res]

        # TODO: Implement sources and events breakdown
        sources = []
        events = []

        return {
            "metrics": {"visitors": visitors, "views": views, "bounce_rate": round(bounce_rate, 1)}, 
            "sources": sources, 
            "events": events,
            "os": os_data,
            "browsers": browser_data,
            "devices": device_data,
            "referrers": referrers
        }
    except Exception as e:
        print(f"Explore Error: {e}")
        return {"metrics": {"visitors": 0, "views": 0, "bounce_rate": 0}, "sources": [], "error": str(e)}
@router.get("/api/analytics/heatmap/urls")
async def get_heatmap_urls(resource_id: str):
    try:
        client = get_clickhouse_client()
        query = "SELECT DISTINCT url FROM telemetry WHERE event_type = 'heatmap_batch' AND resource_id = {rid:String}"
        res = client.query(query, parameters={"rid": resource_id}).result_rows
        return [r[0] for r in res]
    except: return []

@router.get("/api/analytics/heatmap/data")
async def get_heatmap_data(resource_id: str, url: str):
    try:
        client = get_clickhouse_client()
        query = "SELECT payload FROM telemetry WHERE event_type = 'heatmap_batch' AND resource_id = {rid:String} AND url = {url:String}"
        res = client.query(query, parameters={"rid": resource_id, "url": url}).result_rows
        
        all_clicks = []
        for row in res:
            try:
                data = json.loads(row[0])
                if "clicks" in data:
                    all_clicks.extend(data["clicks"])
            except: continue
        return all_clicks
    except: return []
