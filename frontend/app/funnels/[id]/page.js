"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslation } from '../../../context/LanguageContext';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}`;

export default function FunnelStats() {
    const { id } = useParams();
    const { t } = useTranslation();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch(`${API_URL}/funnels/${id}/stats`);
                if (res.ok) setData(await res.json());
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchStats();
    }, [id]);

    const formatTime = (seconds) => {
        if (seconds < 60) return `${seconds}s`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
        return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}>Calibrating funnel physics...</div>;
    if (!data) return <div style={{ textAlign: 'center', padding: '100px' }}>Funnel data unavailable</div>;
    if (data.total_sessions === 0) return (
        <div style={{ textAlign: 'center', padding: '100px', background: 'var(--bg-subtle)', borderRadius: '24px', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '48px', marginBottom: '24px', display: 'block' }}>📉</span>
            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>No funnel data detected yet</h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto' }}>We haven't recorded any sessions that match the starting step of this funnel in the last 30 days.</p>
        </div>
    );

    return (
        <div>
            <div style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: 800 }}>{data.funnel_name}</h1>
                <p className="subtitle">Conversion Performance (Last 30 Days)</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '48px' }}>
                <div className="card-stat">
                    <div className="stat-label">{t('funnels.stats.sessions')}</div>
                    <div className="stat-value">{data.total_sessions}</div>
                </div>
                <div className="card-stat">
                    <div className="stat-label">{t('funnels.stats.conversion')}</div>
                    <div className="stat-value" style={{ color: '#2563eb' }}>{data.overall_conversion}%</div>
                </div>
                <div className="card-stat">
                    <div className="stat-label">{t('funnels.stats.ttc')}</div>
                    <div className="stat-value">{formatTime(data.avg_ttc)}</div>
                </div>
            </div>

            <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '40px' }}>
                <h3 style={{ marginBottom: '40px', fontSize: '20px', fontWeight: 800 }}>Drop-off Analysis</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {data.steps.map((step, idx) => (
                        <div key={idx}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ width: '32px', height: '32px', background: '#0f172a', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 800 }}>{idx + 1}</div>
                                    <div>
                                        <div style={{ fontWeight: 800 }}>{step.name}</div>
                                        <div style={{ fontSize: '12px', color: '#64748b' }}>{step.count} users reached</div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '16px', fontWeight: 800 }}>{step.conversion}%</div>
                                    <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Total Conv.</div>
                                </div>
                            </div>

                            <div style={{ height: '12px', width: '100%', background: '#f1f5f9', borderRadius: '100px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${step.conversion}%`, background: 'linear-gradient(90deg, #2563eb, #3b82f6)', borderRadius: '100px', transition: 'width 1s cubic-bezier(0.34, 1.56, 0.64, 1)' }}></div>
                            </div>

                            {idx < data.steps.length - 1 && (
                                <div style={{ padding: '16px 0 0 48px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f43f5e', fontSize: '13px', fontWeight: 700 }}>
                                        <span>↓ {step.dropoff}% drop-off</span>
                                        <div style={{ height: '1px', flex: 1, background: '#fee2e2' }}></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
