"use client";
import { useState, useEffect, useRef } from 'react';
import { useResource } from '../../context/ResourceContext';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}`;

export default function HeatmapsPage() {
    const { selectedResource } = useResource();
    const [urls, setUrls] = useState([]);
    const [selectedUrl, setSelectedUrl] = useState('');
    const [allClicks, setAllClicks] = useState([]);
    const [displayClicks, setDisplayClicks] = useState([]);
    const [loading, setLoading] = useState(false);

    const [viewMode, setViewMode] = useState('desktop'); // 'desktop' or 'mobile'
    const [opacity, setOpacity] = useState(0.8);
    const [radius, setRadius] = useState(30);
    const [intensity, setIntensity] = useState(0.6);

    const canvasRef = useRef(null);

    const VIEW_WIDTHS = {
        desktop: 1200,
        mobile: 390
    };

    useEffect(() => {
        const fetchUrls = async () => {
            if (!selectedResource) return;
            try {
                const res = await fetch(`${API_URL}/analytics/heatmap/urls?resource_id=${selectedResource.uid}`);
                if (res.ok) setUrls(await res.json());
            } catch (err) { console.error(err); }
        };
        fetchUrls();
    }, [selectedResource]);

    useEffect(() => {
        const fetchClicks = async () => {
            if (!selectedUrl || !selectedResource) return;
            setLoading(true);
            try {
                const res = await fetch(`${API_URL}/analytics/heatmap/data?resource_id=${selectedResource.uid}&url=${encodeURIComponent(selectedUrl)}`);
                if (res.ok) {
                    const data = await res.json();
                    setAllClicks(data);
                }
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchClicks();
    }, [selectedUrl, selectedResource]);

    useEffect(() => {
        // Filter clicks by resolution category
        const filtered = allClicks.filter(c => {
            if (!c.res) return viewMode === 'desktop';
            const width = parseInt(c.res.split('x')[0]);
            return viewMode === 'desktop' ? width >= 1024 : width < 1024;
        });
        setDisplayClicks(filtered);
    }, [allClicks, viewMode]);

    useEffect(() => {
        drawHeatmap();
    }, [displayClicks, opacity, radius, intensity, viewMode]);

    const drawHeatmap = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        displayClicks.forEach(click => {
            // click.x is normalized (0 to 1) 
            const x = click.x * width;
            const y = click.y; // Y is absolute pixels

            const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
            gradient.addColorStop(0, `rgba(255, 0, 0, ${intensity})`);
            gradient.addColorStop(0.5, `rgba(255, 165, 0, ${intensity / 2})`);
            gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');

            ctx.fillStyle = gradient;
            ctx.globalAlpha = opacity;
            ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
        });
    };

    const getScreenshotUrl = (url, width) => {
        const cleanUrl = url.split('?')[0];
        return `https://s.wordpress.com/mshots/v1/${encodeURIComponent(cleanUrl)}?w=${width}`;
    };

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: 800 }}>Heatmaps <span style={{ fontSize: '12px', background: '#64748b', color: '#fff', padding: '2px 8px', borderRadius: '4px', verticalAlign: 'middle', marginLeft: '12px' }}>Тестова версія</span></h1>
                    <p className="subtitle">Visualizing interaction density with device-specific snapshots</p>
                </div>

                {selectedUrl && (
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center', background: 'var(--bg-subtle)', padding: '16px 24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', background: 'var(--bg)', p: '4px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                            <button
                                onClick={() => setViewMode('desktop')}
                                style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: viewMode === 'desktop' ? 'var(--text)' : 'transparent', color: viewMode === 'desktop' ? 'var(--bg)' : 'var(--text)', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}
                            >
                                DESKTOP
                            </button>
                            <button
                                onClick={() => setViewMode('mobile')}
                                style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: viewMode === 'mobile' ? 'var(--text)' : 'transparent', color: viewMode === 'mobile' ? 'var(--bg)' : 'var(--text)', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}
                            >
                                MOBILE
                            </button>
                        </div>

                        <div style={{ width: '1px', height: '30px', background: 'var(--border)' }}></div>

                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div style={{ width: '80px' }}>
                                <label style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-muted)' }}>OPACITY</label>
                                <input type="range" min="0.1" max="1" step="0.1" value={opacity} onChange={e => setOpacity(parseFloat(e.target.value))} style={{ width: '100%' }} />
                            </div>
                            <div style={{ width: '80px' }}>
                                <label style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-muted)' }}>RADIUS</label>
                                <input type="range" min="10" max="100" step="5" value={radius} onChange={e => setRadius(parseInt(e.target.value))} style={{ width: '100%' }} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '32px' }}>
                <div style={{ background: 'var(--bg-subtle)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)', height: 'fit-content' }}>
                    <h3 style={{ fontSize: '11px', fontWeight: 800, marginBottom: '16px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Captured Pages</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {urls.length === 0 ? (
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No data yet.</p>
                        ) : urls.map(u => (
                            <button
                                key={u}
                                onClick={() => setSelectedUrl(u)}
                                style={{
                                    textAlign: 'left', p: '10px 14px', borderRadius: '10px',
                                    border: '1px solid ' + (selectedUrl === u ? 'var(--text)' : 'var(--border)'),
                                    background: selectedUrl === u ? 'var(--text)' : 'var(--bg)',
                                    color: selectedUrl === u ? 'var(--bg)' : 'var(--text)',
                                    fontSize: '12px', cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                                }}
                            >
                                {u.split('?')[0].replace(/^https?:\/\/[^\/]+/, '') || '/'}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ position: 'relative', background: 'var(--bg-subtle)', borderRadius: '24px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'center', overflow: 'hidden', minHeight: '800px' }}>
                    {!selectedUrl ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '800px', color: 'var(--text-muted)' }}>
                            <div style={{ width: '64px', height: '64px', background: 'var(--bg)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '20px', border: '1px solid var(--border)' }}>📊</div>
                            <p>Select a URL to visualize user interaction hotspots.</p>
                        </div>
                    ) : (
                        <div style={{ position: 'relative', width: VIEW_WIDTHS[viewMode], height: '2500px', margin: '40px 0', boxShadow: '0 50px 100px -20px rgba(0,0,0,0.2)' }}>
                            <div
                                style={{
                                    width: '100%', height: '100%',
                                    backgroundImage: `url(${getScreenshotUrl(selectedUrl, viewMode === 'desktop' ? 1200 : 400)})`,
                                    backgroundSize: '100% auto',
                                    backgroundRepeat: 'no-repeat',
                                    backgroundColor: '#fff',
                                    zIndex: 1
                                }}
                            />
                            <canvas
                                ref={canvasRef}
                                width={VIEW_WIDTHS[viewMode]}
                                height={2500}
                                style={{
                                    position: 'absolute', top: 0, left: 0,
                                    width: '100%', height: '100%',
                                    pointerEvents: 'none', zIndex: 10
                                }}
                            />
                            {loading && (
                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                                    ANALYZING DATA...
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <p style={{ marginTop: '24px', fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
                Powered by OpenTrace Visual Intelligence. Map renders are static snapshots.
            </p>
        </div>
    );
}
