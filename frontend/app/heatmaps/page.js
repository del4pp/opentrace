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

    // Config State
    const [viewMode, setViewMode] = useState('desktop'); // 'desktop' | 'mobile'
    const [bgMode, setBgMode] = useState('service'); // 'iframe' | 'service' | 'upload'
    const [opacity, setOpacity] = useState(0.8);
    const [radius, setRadius] = useState(25);
    const [intensity, setIntensity] = useState(0.8);
    const [customBg, setCustomBg] = useState(null);

    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const iframeRef = useRef(null);

    const VIEW_WIDTHS = {
        desktop: 1280,
        mobile: 390
    };

    const VIEW_HEIGHTS = {
        desktop: 2500, // Keep extended scroll depth
        mobile: 3500
    };

    // 1. Fetch available URLs
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

    // 2. Fetch click data for selected URL
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

    // 3. Filter data for current view specs
    useEffect(() => {
        const filtered = allClicks.filter(c => {
            if (!c.res) return viewMode === 'desktop';
            const width = parseInt(c.res.split('x')[0]);
            return viewMode === 'desktop' ? width >= 1024 : width < 1024;
        });
        setDisplayClicks(filtered);
    }, [allClicks, viewMode]);

    // 4. Draw Heatmap
    useEffect(() => {
        drawHeatmap();
    }, [displayClicks, opacity, radius, intensity, viewMode, bgMode, customBg]);

    const drawHeatmap = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const width = VIEW_WIDTHS[viewMode];
        const height = VIEW_HEIGHTS[viewMode];

        // Ensure canvas matches resolution
        canvas.width = width;
        canvas.height = height;

        ctx.clearRect(0, 0, width, height);

        // Enhance gradient for better visibility over white/complex backgrounds
        displayClicks.forEach(click => {
            // click.x is normalized 0-1. click.y is absolute pixels
            const x = click.x * width;
            const y = click.y;

            // Simple clustering/intensity boost
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
            gradient.addColorStop(0, `rgba(255, 0, 50, ${intensity})`); // Hot center
            gradient.addColorStop(0.4, `rgba(255, 100, 0, ${intensity * 0.7})`);
            gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');

            ctx.fillStyle = gradient;
            ctx.globalAlpha = opacity;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, 2 * Math.PI);
            ctx.fill();
        });
    };

    const getServiceUrl = (url) => {
        if (!url) return '';
        // High-quality full-page screenshot service (Microlink free tier)
        const cleanUrl = url.split('?')[0];
        return `https://api.microlink.io/?url=${encodeURIComponent(cleanUrl)}&screenshot=true&meta=false&embed=screenshot.url&viewport.width=${VIEW_WIDTHS[viewMode]}&viewport.height=${VIEW_HEIGHTS[viewMode]}`;
    };

    const handleBgUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setCustomBg(ev.target.result);
                setBgMode('upload');
            };
            reader.readAsDataURL(file);
        }
    };

    const toggleFullscreen = () => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(err => console.log(err));
        } else {
            document.exitFullscreen();
        }
    };

    return (
        <div className="fade-in" style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Heatmaps</h1>
                    <p className="subtitle">Interaction density analysis</p>
                </div>
                {selectedUrl && (
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: '#fff', padding: '8px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>

                        {/* Interactive Mode Switcher */}
                        <div style={{ display: 'flex', background: '#f1f5f9', padding: '2px', borderRadius: '8px' }}>
                            <button onClick={() => setBgMode('iframe')} className={`btn-toggle ${bgMode === 'iframe' ? 'active' : ''}`}>Iframe (Live)</button>
                            <button onClick={() => setBgMode('service')} className={`btn-toggle ${bgMode === 'service' ? 'active' : ''}`}>Screenshot</button>
                            <label className={`btn-toggle ${bgMode === 'upload' ? 'active' : ''}`} style={{ cursor: 'pointer', margin: 0, display: 'flex', alignItems: 'center' }}>
                                Upload
                                <input type="file" accept="image/*" onChange={handleBgUpload} style={{ display: 'none' }} />
                            </label>
                        </div>

                        <div style={{ width: '1px', height: '24px', background: '#e2e8f0' }}></div>

                        {/* View Mode Switcher */}
                        <div style={{ display: 'flex', background: '#f1f5f9', padding: '2px', borderRadius: '8px' }}>
                            <button onClick={() => setViewMode('desktop')} className={`btn-toggle ${viewMode === 'desktop' ? 'active' : ''}`}>Desktop</button>
                            <button onClick={() => setViewMode('mobile')} className={`btn-toggle ${viewMode === 'mobile' ? 'active' : ''}`}>Mobile</button>
                        </div>

                        <div style={{ width: '1px', height: '24px', background: '#e2e8f0' }}></div>

                        {/* Visual Controls */}
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <div className="range-group">
                                <label>Opacity</label>
                                <input type="range" min="0.1" max="1" step="0.1" value={opacity} onChange={e => setOpacity(parseFloat(e.target.value))} />
                            </div>
                            <div className="range-group">
                                <label>Radius</label>
                                <input type="range" min="10" max="80" step="5" value={radius} onChange={e => setRadius(parseInt(e.target.value))} />
                            </div>
                        </div>

                        <div style={{ width: '1px', height: '24px', background: '#e2e8f0' }}></div>

                        <button onClick={toggleFullscreen} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }} title="Fullscreen">⛶</button>
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', gap: '24px', flex: 1, overflow: 'hidden' }}>
                {/* Sidebar List */}
                <div style={{ width: '260px', overflowY: 'auto' }} className="thin-scrollbar">
                    <h3 style={{ fontSize: '11px', fontWeight: 800, marginBottom: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>TRACKED PAGES</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {urls.map(u => (
                            <button
                                key={u}
                                onClick={() => setSelectedUrl(u)}
                                style={{
                                    textAlign: 'left', padding: '10px 12px', borderRadius: '8px',
                                    background: selectedUrl === u ? '#f1f5f9' : 'transparent',
                                    color: selectedUrl === u ? '#0f172a' : '#64748b',
                                    border: '1px solid ' + (selectedUrl === u ? '#cbd5e1' : 'transparent'),
                                    fontSize: '13px', fontWeight: selectedUrl === u ? 700 : 500,
                                    cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                                }}
                            >
                                {u.replace(/^https?:\/\//, '')}
                            </button>
                        ))}
                        {urls.length === 0 && <div style={{ fontSize: '12px', color: '#94a3b8', padding: '12px' }}>No heatmap data recorded yet.</div>}
                    </div>
                </div>

                {/* Main Visualizer */}
                <div
                    ref={containerRef}
                    style={{
                        flex: 1,
                        background: '#e2e8f0',
                        borderRadius: '16px',
                        overflow: 'auto',
                        position: 'relative',
                        display: 'flex',
                        justifyContent: 'center',
                        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.05)'
                    }}
                >
                    {!selectedUrl ? (
                        <div style={{ alignSelf: 'center', textAlign: 'center', color: '#64748b' }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗺️</div>
                            <h3>Select a page to analyze</h3>
                        </div>
                    ) : (
                        <div
                            style={{
                                position: 'relative',
                                width: VIEW_WIDTHS[viewMode],
                                height: VIEW_HEIGHTS[viewMode],
                                background: '#fff',
                                marginTop: '40px',
                                marginBottom: '40px',
                                boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
                            }}
                        >
                            {/* 1. Background Layer */}
                            {bgMode === 'iframe' && (
                                <iframe
                                    ref={iframeRef}
                                    src={selectedUrl}
                                    style={{ width: '100%', height: '100%', border: 'none', pointerEvents: 'none' }}
                                    title="Live Preview"
                                />
                            )}

                            {(bgMode === 'service' || bgMode === 'upload') && (
                                <div
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        backgroundImage: `url(${bgMode === 'upload' ? customBg : getServiceUrl(selectedUrl)})`,
                                        backgroundSize: '100% auto',
                                        backgroundRepeat: 'no-repeat',
                                        opacity: 0.9,
                                        backgroundColor: '#fff'
                                    }}
                                />
                            )}

                            {/* 2. Heatmap Layer */}
                            <canvas
                                ref={canvasRef}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    pointerEvents: 'none',
                                    zIndex: 10
                                }}
                            />

                            {/* Loading Overlay */}
                            {loading && (
                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.8)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div className="spinner"></div>
                                </div>
                            )}

                            {bgMode === 'iframe' && (
                                <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', pointerEvents: 'none', zIndex: 100 }}>
                                    Live Iframe Mode
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .btn-toggle {
                    background: none;
                    border: none;
                    padding: 6px 12px;
                    font-size: 12px;
                    font-weight: 600;
                    color: #64748b;
                    cursor: pointer;
                    border-radius: 6px;
                    transition: all 0.2s;
                }
                .btn-toggle:hover {
                    color: #0f172a;
                    background: #e2e8f0;
                }
                .btn-toggle.active {
                    background: #fff;
                    color: #0f172a;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                }
                .range-group {
                    display: flex;
                    flex-direction: column;
                    width: 70px;
                }
                .range-group label {
                    font-size: 9px;
                    font-weight: 700;
                    color: #94a3b8;
                    text-transform: uppercase;
                }
                .spinner {
                    width: 20px; 
                    height: 20px; 
                    border: 2px solid #e2e8f0; 
                    border-top-color: #3b82f6; 
                    border-radius: 50%; 
                    animation: spin 1s linear infinite;
                }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
