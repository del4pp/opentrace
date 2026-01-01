(function () {
    // OpenTrace Lightweight Tracker v1.0
    const script = document.currentScript;
    const resourceId = script.getAttribute('data-id');
    const apiEndpoint = script.getAttribute('data-host') || 'http://localhost:8000/api/v1/collect';

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
        }).catch(() => { }); // Silent fail for privacy/network issues
    };

    // Auto-track page view
    if (document.readyState === 'complete') {
        collect();
    } else {
        window.addEventListener('load', () => collect());
    }

    // Global access for custom events
    window.ot = {
        track: (name, data) => collect(name, data)
    };

    // Auto-track defined rules
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

                // Use delegation for dynamic elements
                const targetEvent = rule.trigger === 'submit' ? 'submit' : 'click';
                document.addEventListener(targetEvent, handler, true);
            });

            // Page View rules (based on path)
            rules.filter(r => r.trigger === 'visit').forEach(rule => {
                if (window.location.pathname.includes(rule.selector) || rule.selector === '*') {
                    collect(rule.name);
                }
            });
        } catch (e) { }
    };

    initRules();
})();
