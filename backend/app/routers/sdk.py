from fastapi import APIRouter, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from .. import models
from ..database import get_db
from ..config import settings

router = APIRouter()

@router.get("/sdk/t.js")
async def get_tracking_script(id: str, db: AsyncSession = Depends(get_db)):
    """
    Returns advanced tracking SDK that handles session management,
    telemetry collection, and dynamic tag injection.
    """
    # Fetch resource and its tags
    res = await db.execute(select(models.Resource).where(models.Resource.uid == id))
    resource = res.scalars().first()
    
    if not resource:
        return Response(content="// Resource not found", media_type="application/javascript")

    # Get active tags for this specific resource
    tags_res = await db.execute(
        select(models.Tag)
        .where(models.Tag.is_active == True, models.Tag.resource_id == resource.id)
        .order_by(models.Tag.created_at)
    )
    active_tags = tags_res.scalars().all()

    tag_injections = []
    for tag in active_tags:
        escaped_code = tag.code.replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n').replace('\r', '\\r')
        tag_injections.append(f"""
        try {{
            var content = "{escaped_code}";
            if (content.indexOf('<script') !== -1) {{
                var div = document.createElement('div');
                div.innerHTML = content;
                Array.from(div.querySelectorAll('script')).forEach(oldScript => {{
                    var newScript = document.createElement('script');
                    Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                    newScript.appendChild(document.createTextNode(oldScript.innerHTML));
                    document.head.appendChild(newScript);
                }});
            }} else {{
                var s = document.createElement('script');
                s.innerHTML = content;
                document.head.appendChild(s);
            }}
        }} catch(e) {{ console.error('OT Tag Error:', e); }}
        """)

    tag_logic = "".join(tag_injections)
    
    # Get dynamic events (rules)
    events_res = await db.execute(
        select(models.Event)
        .where(models.Event.resource_id == resource.id)
    )
    dynamic_events = events_res.scalars().all()
    rules_json = [{"name": e.name, "trigger": e.trigger, "selector": e.selector} for e in dynamic_events]
    import json
    rules_code = json.dumps(rules_json)
    
    # Modern SDK logic
    js_code = f"""
(function() {{
    'use strict';
    
    var CONFIG = {{
        rid: "{id}",
        api: "{str(settings.NEXT_PUBLIC_API_URL).rstrip('/')}/api/v1/collect"
    }};

    var utils = {{
        uuid: function() {{ return 'ot-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now(); }},
        getParams: function() {{
            var p = {{}};
            var s = window.location.search.substring(1).split('&');
            for(var i=0; i<s.length; i++) {{
                var pair = s[i].split('=');
                if(pair[0]) p[pair[0]] = decodeURIComponent(pair[1] || "");
            }}
            return p;
        }}
    }};

    var ot = {{
        sid: null,
        startTime: Date.now(),
        maxScroll: 0,
        init: function() {{
            this.sid = localStorage.getItem('_ot_sid');
            if (!this.sid) {{
                this.sid = utils.uuid();
                localStorage.setItem('_ot_sid', this.sid);
            }}
            
            // Auto capture click IDs from URL
            var p = utils.getParams();
            if (p.fbclid) localStorage.setItem('_ot_fbclid', p.fbclid);
            if (p.ttclid) localStorage.setItem('_ot_ttclid', p.ttclid);
            
            this.track('page_view');
            this.setupListeners();
            this.injectTags();
            
            // Heartbeat/Time on site tracking
            var self = this;
            window.addEventListener('beforeunload', function() {{
                self.track('page_exit', {{
                    duration: Math.round((Date.now() - self.startTime) / 1000),
                    scroll_depth: self.maxScroll
                }});
            }});
        }},
        
        track: function(event, meta) {{
            var p = utils.getParams();
            var payload = {{
                rid: CONFIG.rid,
                sid: this.sid,
                type: event,
                url: window.location.href,
                ref: document.referrer,
                res: screen.width + 'x' + screen.height,
                lang: navigator.language,
                utm_s: p.utm_source || "",
                utm_m: p.utm_medium || "",
                utm_c: p.utm_campaign || "",
                fbclid: p.fbclid || localStorage.getItem('_ot_fbclid') || "",
                ttclid: p.ttclid || localStorage.getItem('_ot_ttclid') || "",
                meta: meta || {{}}
            }};
            
            var blob = new Blob([JSON.stringify(payload)], {{type: 'application/json'}});
            if (navigator.sendBeacon) {{
                navigator.sendBeacon(CONFIG.api, blob);
            }} else {{
                fetch(CONFIG.api, {{ method: 'POST', body: JSON.stringify(payload), keepalive: true, headers: {{'Content-Type': 'application/json'}} }});
            }}
        }},
        
        injectTags: function() {{
            {tag_logic}
        }},
        
        setupListeners: function() {{
            var self = this;
            var rules = {rules_code};
            
            // Setup dynamic rules
            rules.forEach(function(rule) {{
                if (rule.trigger === 'visit') {{
                    if (window.location.pathname.includes(rule.selector) || rule.selector === '*') {{
                        self.track(rule.name);
                    }}
                }} else {{
                    document.addEventListener(rule.trigger === 'submit' ? 'submit' : 'click', function(e) {{
                        if (e.target.closest(rule.selector) || e.target.matches(rule.selector)) {{
                            self.track(rule.name);
                        }}
                    }}, true);
                }}
            }});

            document.addEventListener('click', function(e) {{
                var el = e.target.closest('a, button, [data-ot-track]');
                if (el) {{
                    self.track('click', {{
                        text: el.innerText ? el.innerText.substring(0, 50).trim() : '',
                        id: el.id,
                        tag: el.tagName
                    }});
                }}
            }}, true);
            
            document.addEventListener('submit', function(e) {{
                self.track('form_submit', {{
                    id: e.target.id,
                    action: e.target.action
                }});
            }}, true);
            
            window.addEventListener('scroll', function() {{
                var s = Math.round((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100);
                if (s > self.maxScroll) self.maxScroll = s;
            }}, {{ passive: true }});
        }}
    }};

    window.ot = ot;
    ot.init();
}})();
"""
    return Response(
        content=js_code,
        media_type="application/javascript",
        headers={"Cache-Control": "no-cache, no-store, must-revalidate"}
    )

@router.get("/ot.js")
async def get_legacy_tracking_script():
    """
    Legacy tracking script for backward compatibility.
    Uses data-id and data-host attributes from script tag.
    """
    js_code = """
(function () {
    const script = document.currentScript;
    const resourceId = script.getAttribute('data-id');
    const apiEndpoint = script.getAttribute('data-host') || window.location.origin + '/api/v1/collect';

    if (!resourceId) {
        console.warn('OpenTrace: Missing data-id attribute.');
        return;
    }

    const getSessionId = () => {
        let sid = sessionStorage.getItem('ot_sid');
        if (!sid) {
            sid = Math.random().toString(36).substring(2, 15);
            sessionStorage.setItem('ot_sid', sid);
        }
        return sid;
    };

    const collect = (type = 'page_view', meta = {}) => {
        const urlParams = new URLSearchParams(window.location.search);
        const data = {
            rid: resourceId,
            sid: getSessionId(),
            type: type,
            url: window.location.href,
            ref: document.referrer,
            res: `${window.screen.width}x${window.screen.height}`,
            lang: navigator.language,
            utm_s: urlParams.get('utm_source'),
            utm_m: urlParams.get('utm_medium'),
            utm_c: urlParams.get('utm_campaign'),
            fbclid: urlParams.get('fbclid'),
            ttclid: urlParams.get('ttclid'),
            meta: meta
        };

        fetch(apiEndpoint, {
            method: 'POST',
            mode: 'cors',
            credentials: 'omit',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).catch(() => { });
    };

    if (document.readyState === 'complete') {
        collect();
    } else {
        window.addEventListener('load', () => collect());
    }

    window.ot = {
        track: (name, data) => collect(name, data)
    };

    const initRules = async () => {
        try {
            const base = apiEndpoint.split('/api/v1/collect')[0];
            const res = await fetch(`${base}/api/v1/rules/${resourceId}`);
            if (!res.ok) return;
            const rules = await res.json();

            rules.forEach(rule => {
                const handler = (e) => {
                    if (rule.trigger === 'click' && e.target.closest(rule.selector)) {
                        collect(rule.name);
                    } else if (rule.trigger === 'submit' && e.target.matches(rule.selector)) {
                        collect(rule.name);
                    }
                };

                const targetEvent = rule.trigger === 'submit' ? 'submit' : 'click';
                document.addEventListener(targetEvent, handler, true);
            });

            rules.filter(r => r.trigger === 'visit').forEach(rule => {
                if (window.location.pathname.includes(rule.selector) || rule.selector === '*') {
                    collect(rule.name);
                }
            });
        } catch (e) { }
    };

    initRules();
})();
"""
    return Response(
        content=js_code,
        media_type="application/javascript",
        headers={"Cache-Control": "public, max-age=3600"}
    )
