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
    const [customBg, setCustomBg] = useState(null); // DataURL for custom background

    const canvasRef = useRef(null);
    const containerRef = useRef(null);

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
    }, [displayClicks, opacity, radius, intensity, viewMode, customBg]);

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
        if (customBg) return customBg;
        const cleanUrl = url.split('?')[0];
        return `https://s.wordpress.com/mshots/v1/${encodeURIComponent(cleanUrl)}?w=${width}`;
    };

    const handleBgUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setCustomBg(ev.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFullscreen = () => {
        if (containerRef.current) {
            if (containerRef.current.requestFullscreen) {
                containerRef.current.requestFullscreen();
            }
        }
    };

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }} className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: 800 }}>Heatmaps</h1>
                    <p className="subtitle">Visualizing interaction density with precision</p>
                </div>

                {selectedUrl && (
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center', background: '#fff', padding: '16px 24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <button
                                onClick={() => setViewMode('desktop')}
                                style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: viewMode === 'desktop' ? '#fff' : 'transparent', color: viewMode === 'desktop' ? '#0f172a' : '#64748b', cursor: 'pointer', fontSize: '12px', fontWeight: 700, boxShadow: viewMode === 'desktop' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none' }}
                            >
                                DESKTOP
                            </button>
                            <button
                                onClick={() => setViewMode('mobile')}
                                style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: viewMode === 'mobile' ? '#fff' : 'transparent', color: viewMode === 'mobile' ? '#0f172a' : '#64748b', cursor: 'pointer', fontSize: '12px', fontWeight: 700, boxShadow: viewMode === 'mobile' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none' }}
                            >
                                MOBILE
                            </button>
                        </div>

                        <div style={{ width: '1px', height: '30px', background: '#e2e8f0' }}></div>

                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div style={{ width: '80px' }}>
                                <label style={{ fontSize: '9px', fontWeight: 800, color: '#94a3b8' }}>OPACITY</label>
                                <input type="range" min="0.1" max="1" step="0.1" value={opacity} onChange={e => setOpacity(parseFloat(e.target.value))} style={{ width: '100%' }} />
                            </div>
                            <div style={{ width: '80px' }}>
                                <label style={{ fontSize: '9px', fontWeight: 800, color: '#94a3b8' }}>RADIUS</label>
                                <input type="range" min="10" max="100" step="5" value={radius} onChange={e => setRadius(parseInt(e.target.value))} style={{ width: '100%' }} />
                            </div>
                        </div>

                        <div style={{ width: '1px', height: '30px', background: '#e2e8f0' }}></div>

                        <label className="btn-premium" style={{ cursor: 'pointer', fontSize: '12px', padding: '8px 16px', background: '#3b82f6', color: '#fff' }}>
                            Upload BG
                            <input type="file" accept="image/*" onChange={handleBgUpload} style={{ display: 'none' }} />
                        </label>

                        <button onClick={handleFullscreen} className="btn-premium" style={{ background: '#0f172a', color: '#fff', fontSize: '12px', padding: '8px 16px' }}>
                            ⛶ Fullscreen
                        </button>
                    </div>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '32px' }}>
                <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', height: 'fit-content' }}>
                    <h3 style={{ fontSize: '11px', fontWeight: 800, marginBottom: '16px', textTransform: 'uppercase', color: '#94a3b8' }}>Captured Pages</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {urls.length === 0 ? (
                            <p style={{ fontSize: '12px', color: '#94a3b8' }}>No heatmap data found.</p>
                        ) : urls.map(u => (
                            <button
                                key={u}
                                onClick={() => { setSelectedUrl(u); setCustomBg(null); }}
                                style={{
                                    textAlign: 'left', padding: '10px 14px', borderRadius: '10px',
                                    border: '1px solid ' + (selectedUrl === u ? '#0f172a' : '#f1f5f9'),
                                    background: selectedUrl === u ? '#0f172a' : '#fff',
                                    color: selectedUrl === u ? '#fff' : '#64748b',
                                    fontSize: '12px', cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                    fontWeight: selectedUrl === u ? 700 : 500
                                }}
                            >
                                {u.split('?')[0].replace(/^https?:\/\/[^\/]+/, '') || '/'}
                            </button>
                        ))}
                    </div>
                </div>

                <div
                    ref={containerRef}
                    style={{
                        position: 'relative',
                        background: '#f8fafc',
                        borderRadius: '24px',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        justifyContent: 'center',
                        overflow: 'auto', // Allow scrolling
                        minHeight: '800px',
                        maxHeight: '85vh'
                    }}
                >
                    {!selectedUrl ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                            <div style={{ width: '64px', height: '64px', background: '#fff', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>🔥</div>
                            <p>Select a URL to visualize user interaction hotspots.</p>
                        </div>
                    ) : (
                        <div style={{ position: 'relative', width: VIEW_WIDTHS[viewMode], height: '2500px', margin: '40px 0', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
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
                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#0f172a' }}>
                                    <span className="spinner" style={{ marginRight: '10px' }}></span> ANALYZING DATA...
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <p style={{ marginTop: '24px', fontSize: '11px', color: '#94a3b8', textAlign: 'center' }}>
                Note: Standard screenshots are generated automatically. Use <b>Upload BG</b> for local/authenticated pages.
            </p>
        </div>
    );
}
