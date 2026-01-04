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
        if (clicks.length > 0 && canvasRef.current) {
            drawHeatmap();
        }
    }, [clicks]);

    const drawHeatmap = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        // Simple heatmap visualization
        clicks.forEach(click => {
            const x = click.x * width;
            const y = click.y; // Y is absolute pixels from SDK

            const gradient = ctx.createRadialGradient(x, y, 0, x, y, 20);
            gradient.addColorStop(0, 'rgba(255, 0, 0, 0.2)');
            gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');

            ctx.fillStyle = gradient;
            ctx.fillRect(x - 20, y - 20, 40, 40);
        });
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: 800 }}>Heatmaps (BETA)</h1>
                <p className="subtitle">Visualizing user interaction intensity across your pages</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '32px' }}>
                <div style={{ background: 'var(--bg-subtle)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)', height: 'fit-content' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Page Selection</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {urls.length === 0 ? (
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No heatmap data recorded yet.</p>
                        ) : urls.map(u => (
                            <button
                                key={u}
                                onClick={() => setSelectedUrl(u)}
                                style={{
                                    textAlign: 'left',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid ' + (selectedUrl === u ? 'var(--text)' : 'var(--border)'),
                                    background: selectedUrl === u ? 'var(--text)' : 'var(--bg)',
                                    color: selectedUrl === u ? 'var(--bg)' : 'var(--text)',
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                    transition: '0.2s',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {u.replace(/^https?:\/\/[^\/]+/, '') || '/'}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ position: 'relative', background: 'var(--bg-subtle)', borderRadius: '24px', border: '1px solid var(--border)', overflow: 'hidden', minHeight: '600px' }}>
                    {!selectedUrl ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '600px', color: 'var(--text-muted)' }}>
                            <span style={{ fontSize: '48px', marginBottom: '16px' }}>🔥</span>
                            <p>Select a page from the list to view click heatmap</p>
                        </div>
                    ) : (
                        <div style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                                <div style={{ fontSize: '14px', fontWeight: 600 }}>{selectedUrl}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{clicks.length} total clicks recorded</div>
                            </div>

                            <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'auto', maxHeight: '800px' }}>
                                <canvas
                                    ref={canvasRef}
                                    width={1000}
                                    height={2000}
                                    style={{ width: '100%', height: 'auto', background: '#f8fafc' }}
                                />
                            </div>
                        </div>
                    )}
                    {loading && (
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(var(--bg-rgb), 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            Loading data...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
