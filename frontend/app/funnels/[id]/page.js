"use client";
import { useState, useEffect } from 'react';
import { useTranslation } from '../../../context/LanguageContext';
import { useResource } from '../../../context/ResourceContext';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}`;

export default function FunnelStats() {
    const { t } = useTranslation();
    const { id } = useParams();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch(`${API_URL}/funnels/${id}/stats`);
                if (res.ok) setStats(await res.json());
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchStats();
    }, [id]);

    if (loading) return <div style={{ padding: '60px', textAlign: 'center' }}>Analyzing Funnel Data...</div>;
    if (!stats || stats.error) return <div style={{ padding: '60px', textAlign: 'center', color: '#ef4444' }}>Error loading stats: {stats?.error || 'Unknown error'}</div>;

    const formatTime = (seconds) => {
        if (seconds < 60) return `${seconds}s`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
        return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    };

    return (
        <div>
            <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <Link href="/funnels" style={{ color: '#2563eb', textDecoration: 'none', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        ← Back to Funnels
                    </Link>
                    <h1 style={{ fontSize: '32px', fontWeight: 800 }}>{stats.funnel_name}</h1>
                    <p className="subtitle">{t('funnels.subtitle')}</p>
                </div>
                <div style={{ display: 'flex', gap: '24px' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{t('funnels.stats.conversion')}</div>
                        <div style={{ fontSize: '28px', fontWeight: 800, color: '#059669' }}>{stats.conversion_rate}%</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{t('funnels.stats.ttc')}</div>
                        <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a' }}>{formatTime(stats.time_to_convert)}</div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px' }}>
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '32px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                        {stats.steps.map((step, idx) => (
                            <div key={idx} style={{ position: 'relative' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={{ width: '32px', height: '32px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px' }}>{idx + 1}</div>
                                        <div style={{ fontWeight: 700, fontSize: '16px' }}>{step.name}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 800, fontSize: '18px' }}>{step.count.toLocaleString()}</div>
                                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>sessions</div>
                                    </div>
                                </div>

                                <div style={{ height: '40px', background: '#f1f5f9', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${step.percentage}%`,
                                        background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
                                        transition: 'width 1s ease-out'
                                    }}></div>
                                    <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', fontWeight: 700, color: step.percentage > 90 ? '#fff' : '#1e293b' }}>
                                        {step.percentage}%
                                    </div>
                                </div>

                                {idx < stats.steps.length - 1 && (
                                    <div style={{
                                        position: 'absolute',
                                        left: '50%',
                                        bottom: '-34px',
                                        transform: 'translateX(-50%)',
                                        background: '#fff',
                                        border: '1px solid #fee2e2',
                                        color: '#ef4444',
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontSize: '11px',
                                        fontWeight: 800,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                        zIndex: 10
                                    }}>
                                        ↓ {t('funnels.stats.dropoff')}: {stats.steps[idx + 1].drop_off}%
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ background: '#0f172a', color: '#fff', borderRadius: '16px', padding: '24px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '16px' }}>Funnel Overview</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <div style={{ fontSize: '12px', color: '#64748b' }}>{t('funnels.stats.sessions')}</div>
                                <div style={{ fontSize: '24px', fontWeight: 800 }}>{stats.total_sessions.toLocaleString()}</div>
                            </div>
                            <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                            <div>
                                <div style={{ fontSize: '12px', color: '#64748b' }}>Total Conversion</div>
                                <div style={{ fontSize: '24px', fontWeight: 800, color: '#10b981' }}>{stats.conversion_rate}%</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '16px' }}>Optimization Tip</h3>
                        <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>
                            Your biggest drop-off is at step <b>{stats.steps.findIndex(s => s.drop_off === Math.max(...stats.steps.map(x => x.drop_off))) + 1}</b>.
                            Consider analyzing the user experience on that specific page or event trigger to improve overall conversion.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
