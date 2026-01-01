"use client";
import { useState, useEffect } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { useResource } from '../../context/ResourceContext';
import HelpButton from '../../components/HelpButton';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api'}`;

export default function DashboardPage() {
    const { t } = useTranslation();
    const { selectedResource } = useResource();
    const [stats, setStats] = useState({
        visitors: 0,
        views: 0,
        session: "0m 0s",
        bounce: "0%",
        chart_data: []
    });
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        if (!selectedResource) return;
        try {
            const res = await fetch(`${API_URL}/dashboard/stats?resource_id=${selectedResource.uid}`);
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (err) {
            console.error("Failed to sync dashboard:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [selectedResource]);

    return (
        <div>
            <div style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: 800 }}>{t('dashboard.title')}</h1>
                    <HelpButton title={t('dashboard.help.title')} content={t('dashboard.help.content')} />
                </div>
                <p className="subtitle">{t('dashboard.subtitle')}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '48px' }}>
                <div className="card-stat">
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>
                        {t('dashboard.stats.visitors')}
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: 800 }}>{loading ? '...' : stats.visitors.toLocaleString()}</div>
                    <div style={{ marginTop: '8px', color: '#10b981', fontSize: '13px', fontWeight: 600 }}>↑ Dynamic</div>
                </div>
                <div className="card-stat">
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>
                        {t('dashboard.stats.views')}
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: 800 }}>{loading ? '...' : stats.views.toLocaleString()}</div>
                    <div style={{ marginTop: '8px', color: '#10b981', fontSize: '13px', fontWeight: 600 }}>↑ Syncing</div>
                </div>
                <div className="card-stat">
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>
                        {t('dashboard.stats.session')}
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: 800 }}>{loading ? '...' : stats.session}</div>
                    <div style={{ marginTop: '8px', color: '#94a3b8', fontSize: '13px' }}>Healthy</div>
                </div>
                <div className="card-stat">
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>
                        {t('dashboard.stats.bounce')}
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: 800 }}>{loading ? '...' : stats.bounce}</div>
                    <div style={{ marginTop: '8px', color: '#f43f5e', fontSize: '13px', fontWeight: 600 }}>In Tolerance</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>

                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '32px' }}>
                    <h3 style={{ marginBottom: '24px', fontSize: '18px', fontWeight: 700 }}>{t('dashboard.activityVolume')}</h3>
                    <div style={{ height: '220px', display: 'flex', alignItems: 'flex-end', gap: '8px', marginBottom: '16px' }}>
                        {loading ? (
                            <div style={{ width: '100%', textAlign: 'center', color: '#94a3b8' }}>Loading...</div>
                        ) : (
                            stats.chart_data.map((h, i) => (
                                <div
                                    key={i}
                                    title={`Volume: ${h}%`}
                                    style={{
                                        flex: 1,
                                        background: i === (stats.chart_data.length - 1) ? '#2563eb' : '#f1f5f9',
                                        height: `${Math.max(h, 2)}%`,
                                        borderRadius: '4px',
                                        transition: 'height 0.3s ease'
                                    }}
                                ></div>
                            ))
                        )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '11px', fontWeight: 600 }}>
                        <span>{t('dashboard.chartLabels.h24')}</span>
                        <span>{t('dashboard.chartLabels.h18')}</span>
                        <span>{t('dashboard.chartLabels.h12')}</span>
                        <span>{t('dashboard.chartLabels.h6')}</span>
                        <span style={{ color: '#2563eb' }}>{t('dashboard.chartLabels.now')}</span>
                    </div>
                </div>


                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Retention & Audience</h3>


                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Return 7d</div>
                            <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px' }}>{stats.retention?.d7 || '-'}</div>
                        </div>
                        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Return 30d</div>
                            <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px' }}>{stats.retention?.d30 || '-'}</div>
                        </div>
                    </div>


                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>
                            <span style={{ color: '#2563eb' }}>New ({stats.retention?.new_vs_returning?.new}%)</span>
                            <span style={{ color: '#64748b' }}>Returning ({stats.retention?.new_vs_returning?.returning}%)</span>
                        </div>
                        <div style={{ height: '8px', width: '100%', background: '#f1f5f9', borderRadius: '100px', overflow: 'hidden', display: 'flex' }}>
                            <div style={{ width: `${stats.retention?.new_vs_returning?.new}%`, background: '#2563eb' }}></div>
                            <div style={{ width: `${stats.retention?.new_vs_returning?.returning}%`, background: '#cbd5e1' }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
