from fastapi import APIRouter, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from .. import models
from ..database import get_db
from ..config import settings
import json

router = APIRouter()

@router.get("/sdk/t.js")
async def get_tracking_script(id: str, db: AsyncSession = Depends(get_db)):
    """
    Returns advanced tracking SDK that handles session management,
    telemetry collection, dynamic tag injection, and event rules.
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
    
    # Get dynamic event rules
    events_res = await db.execute(
        select(models.Event).where(models.Event.resource_id == resource.id)
    )
    rules = events_res.scalars().all()
    rules_json = json.dumps([{"name": r.name, "trigger": r.trigger, "selector": r.selector} for r in rules])

    # Modern SDK logic
    js_code = f"""
(function() {{
    'use strict';
    
    var CONFIG = {{
        rid: "{id}",
        api: "{str(settings.NEXT_PUBLIC_API_URL).rstrip('/')}/v1/collect"
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
        rules: {rules_json},
        clicks: [],
        
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
            this.initRules();
            this.injectTags();
            
            // Heartbeat/Time on site tracking
            var self = this;
            window.addEventListener('beforeunload', function() {{
                self.flushHeatmap();
                self.track('page_exit', {{
                    duration: Math.round((Date.now() - self.startTime) / 1000),
                    scroll_depth: self.maxScroll
                }});
            }});
        }},
        
        flushHeatmap: function() {{
            if (this.clicks.length === 0) return;
            this.track('heatmap_batch', {{ clicks: this.clicks }});
            this.clicks = [];
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
        
        initRules: function() {{
            var self = this;
            var fired = {{}};
            this.rules.forEach(function(rule) {{
                if (rule.trigger === 'visit') {{
                    var loc = window.location.href;
                    var match = false;
                    if (rule.selector === '*') match = true;
                    else if (rule.selector.startsWith('~')) match = new RegExp(rule.selector.substring(1)).test(loc);
                    else match = loc.includes(rule.selector);

                    if (match) self.track(rule.name);
                }} else if (rule.trigger === 'click' || rule.trigger === 'submit') {{
                    var targetEvent = (rule.trigger === 'submit') ? 'submit' : 'click';
                    document.addEventListener(targetEvent, function(e) {{
                        var el = e.target.closest(rule.selector);
                        if (el) {{
                            self.track(rule.name);
                        }}
                    }}, true);
                }}
            }});
            
            // Shared scroll observer for rules and maxScroll
            window.addEventListener('scroll', function() {{
                var s = Math.round((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100);
                if (s > self.maxScroll) self.maxScroll = s;
                
                self.rules.forEach(function(rule) {{
                    if (rule.trigger === 'scroll' && !fired[rule.name] && s >= parseInt(rule.selector)) {{
                        fired[rule.name] = true;
                        self.track(rule.name, {{ depth: s }});
                    }}
                }});
            }}, {{ passive: true }});
        }},
        
        setupListeners: function() {{
            var self = this;
            document.addEventListener('click', function(e) {{
                // Heatmap logic
                self.clicks.push({{
                    x: Math.round((e.pageX / window.innerWidth) * 1000) / 1000,
                    y: e.pageY,
                    t: Date.now() - self.startTime
                }});
                if (self.clicks.length >= 10) self.flushHeatmap();

                // Event logic
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
