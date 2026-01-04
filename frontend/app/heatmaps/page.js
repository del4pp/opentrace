"use client";
import { useState, useEffect, useRef } from 'react';
import { useResource } from '../../context/ResourceContext';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}`;

export default function HeatmapsPage() {
    const { selectedResource } = useResource();
    const [urls, setUrls] = useState([]);
    const [selectedUrl, setSelectedUrl] = useState('');
    const [clicks, setClicks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [opacity, setOpacity] = useState(0.8);
    const [radius, setRadius] = useState(25);
    const [intensity, setIntensity] = useState(0.5);
    const canvasRef = useRef(null);

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
                    setClicks(data);
                }
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchClicks();
    }, [selectedUrl, selectedResource]);

    useEffect(() => {
        drawHeatmap();
    }, [clicks, opacity, radius, intensity]);

    const drawHeatmap = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        clicks.forEach(click => {
            const x = click.x * width;
            const y = click.y;

            const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
            gradient.addColorStop(0, `rgba(255, 0, 0, ${intensity})`);
            gradient.addColorStop(0.5, `rgba(255, 165, 0, ${intensity / 2})`);
            gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');

            ctx.fillStyle = gradient;
            ctx.globalAlpha = opacity;
            ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
        });
    };

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: 800 }}>Heatmaps <span style={{ fontSize: '12px', background: '#f59e0b', color: '#fff', padding: '2px 8px', borderRadius: '4px', verticalAlign: 'middle', marginLeft: '12px' }}>PRO</span></h1>
                    <p className="subtitle">Visualizing real-world user interaction intensity</p>
                </div>
                {selectedUrl && (
                    <div style={{ display: 'flex', gap: '24px', background: 'var(--bg-subtle)', padding: '12px 24px', borderRadius: '12px', border: '1px solid var(--border)', alignItems: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)' }}>Opacity: {Math.round(opacity * 100)}%</label>
                            <input type="range" min="0.1" max="1" step="0.1" value={opacity} onChange={e => setOpacity(parseFloat(e.target.value))} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)' }}>Radius: {radius}px</label>
                            <input type="range" min="5" max="60" step="5" value={radius} onChange={e => setRadius(parseInt(e.target.value))} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)' }}>Intensity</label>
                            <input type="range" min="0.1" max="1" step="0.1" value={intensity} onChange={e => setIntensity(parseFloat(e.target.value))} />
                        </div>
                    </div>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '32px' }}>
                <div style={{ background: 'var(--bg-subtle)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)', height: 'fit-content' }}>
                    <h3 style={{ fontSize: '11px', fontWeight: 800, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>Captured Pages</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {urls.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '20px', fontSize: '13px', color: 'var(--text-muted)' }}>
                                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔍</div>
                                No interaction data found yet.
                            </div>
                        ) : urls.map(u => (
                            <button
                                key={u}
                                onClick={() => setSelectedUrl(u)}
                                style={{
                                    textAlign: 'left',
                                    padding: '10px 14px',
                                    borderRadius: '10px',
                                    border: '1px solid ' + (selectedUrl === u ? 'var(--text)' : 'var(--border)'),
                                    background: selectedUrl === u ? 'var(--text)' : 'var(--bg)',
                                    color: selectedUrl === u ? 'var(--bg)' : 'var(--text)',
                                    fontSize: '13px',
                                    fontWeight: selectedUrl === u ? 600 : 400,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {u.split('?')[0].replace(/^https?:\/\/[^\/]+/, '') || '/'}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ position: 'relative', background: 'var(--bg-subtle)', borderRadius: '24px', border: '1px solid var(--border)', overflow: 'hidden', minHeight: '700px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)' }}>
                    {!selectedUrl ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '700px', color: 'var(--text-muted)' }}>
                            <div style={{ width: '80px', height: '80px', background: 'var(--bg)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', marginBottom: '24px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>🔥</div>
                            <h3 style={{ color: 'var(--text)', fontWeight: 700, marginBottom: '8px' }}>Visual Intelligence</h3>
                            <p style={{ maxWidth: '300px', textAlign: 'center', lineHeight: '1.5' }}>Select a page to see the exact locations where users are clicking and interacting.</p>
                        </div>
                    ) : (
                        <div>
                            {/* Browser Mockup Header */}
                            <div style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }}></div>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }}></div>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></div>
                                </div>
                                <div style={{ flex: 1, background: 'var(--bg-subtle)', borderRadius: '6px', padding: '6px 12px', fontSize: '11px', color: 'var(--text-muted)', border: '1px solid var(--border)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                                    {selectedUrl}
                                </div>
                                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>{clicks.length} CLICKS</div>
                            </div>

                            <div style={{ position: 'relative', overflow: 'auto', maxHeight: '750px', background: '#fff' }}>
                                <div style={{ position: 'relative', width: '1200px', height: '3000px' }}>
                                    <iframe
                                        src={selectedUrl}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            border: 'none',
                                            background: '#fff'
                                        }}
                                    />
                                    <canvas
                                        ref={canvasRef}
                                        width={1200}
                                        height={3000}
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
                                </div>

                                {loading && (
                                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--text)' }}>
                                        SYNCHRONIZING HOTSPOTS...
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <p style={{ marginTop: '24px', fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
                Note: Some websites may block iframe previews due to security policies (Content-Security-Policy or X-Frame-Options).
            </p>
        </div>
    );
}
