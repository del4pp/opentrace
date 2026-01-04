"use client";
import { useState, useEffect } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { useResource } from '../../context/ResourceContext';
import HelpButton from '../../components/HelpButton';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}`;

const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return num.toLocaleString();
};

export default function AnalyticsPage() {
    const { t } = useTranslation();
    const { selectedResource } = useResource();

    const [dateRange, setDateRange] = useState('7d');
    const [customDates, setCustomDates] = useState({ start: '', end: '' });
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchAnalytics = async () => {
        if (!selectedResource) return;
        setLoading(true);
        try {
            let start = new Date();
            let end = new Date();

            if (dateRange === '24h') {
                start.setDate(start.getDate() - 1);
            } else if (dateRange === '7d') {
                start.setDate(start.getDate() - 7);
            } else if (dateRange === '30d') {
                start.setDate(start.getDate() - 30);
            } else if (dateRange === 'custom') {
                start = new Date(customDates.start);
                end = new Date(customDates.end);
            }

            const startStr = start.toISOString().split('T')[0];
            const endStr = end.toISOString().split('T')[0];

            const res = await fetch(`${API_URL}/analytics/explore?resource_id=${selectedResource.uid}&start=${startStr}&end=${endStr}`);
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (dateRange !== 'custom' || (customDates.start && customDates.end)) {
            fetchAnalytics();
        }
    }, [selectedResource, dateRange, customDates]);

    return (
        <div className="fade-in">
            <div style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <h1>{t('analytics.title')}</h1>
                    <HelpButton title={t('analytics.help.title')} content={t('analytics.help.content')} />
                </div>
                <p className="subtitle">{t('analytics.subtitle')}</p>
            </div>

            <div className="card-stat" style={{ marginBottom: '32px', padding: '24px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div className="form-field" style={{ marginBottom: 0 }}>
                        <label>{t('analytics.dateRange')}</label>
                        <select
                            className="select-lux"
                            value={dateRange}
                            onChange={e => setDateRange(e.target.value)}
                            style={{ minWidth: '200px' }}
                        >
                            <option value="24h">Last 24 Hours</option>
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                            <option value="custom">Custom Range</option>
                        </select>
                    </div>

                    {dateRange === 'custom' && (
                        <>
                            <div className="form-field" style={{ marginBottom: 0 }}>
                                <label>{t('analytics.startDate')}</label>
                                <input
                                    type="date"
                                    className="input-lux"
                                    value={customDates.start}
                                    onChange={e => setCustomDates({ ...customDates, start: e.target.value })}
                                    style={{ marginBottom: 0 }}
                                />
                            </div>
                            <div className="form-field" style={{ marginBottom: 0 }}>
                                <label>{t('analytics.endDate')}</label>
                                <input
                                    type="date"
                                    className="input-lux"
                                    value={customDates.end}
                                    onChange={e => setCustomDates({ ...customDates, end: e.target.value })}
                                    style={{ marginBottom: 0 }}
                                />
                            </div>
                        </>
                    )}

                    <button onClick={fetchAnalytics} className="btn-premium" style={{ height: '42px', marginLeft: 'auto' }}>
                        {loading ? 'Refreshing...' : t('analytics.apply')}
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                {[
                    { key: 'visitors', label: t('analytics.metrics.visitors'), val: stats?.metrics?.visitors || 0 },
                    { key: 'views', label: t('analytics.metrics.views'), val: stats?.metrics?.views || 0 },
                    { key: 'bounce', label: t('dashboard.stats.bounce'), val: (stats?.metrics?.bounce_rate || 0) + '%' },
                ].map((m) => (
                    <div key={m.key} className="card-stat" style={{ padding: '24px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
                            {m.label}
                        </div>
                        <div style={{ fontSize: '28px', fontWeight: 800 }}>{m.val}</div>
                    </div>
                ))}
            </div>

            {/* Row 1: Traffic Sources & Events */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px', marginBottom: '32px' }}>
                <div className="card-stat" style={{ padding: '32px' }}>
                    <h3 style={{ marginBottom: '24px', fontSize: '18px' }}>{t('analytics.trafficSources')}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {!stats?.sources?.length ? (
                            <div style={{ color: '#94a3b8' }}>No data available.</div>
                        ) : (
                            stats.sources.map((ch, i) => (
                                <div key={i}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
                                        <span style={{ fontWeight: 600 }}>{ch.name}</span>
                                        <span style={{ color: '#64748b', fontWeight: 700 }}>{ch.pct}% <span style={{ fontSize: '12px', fontWeight: 400 }}>({ch.val})</span></span>
                                    </div>
                                    <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', background: i === 0 ? '#2563eb' : '#cbd5e1', width: `${ch.pct}%` }}></div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="card-stat" style={{ padding: '32px' }}>
                    <h3 style={{ marginBottom: '24px', fontSize: '18px' }}>{t('analytics.trackedEvents.title')}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {!stats?.events?.length ? (
                            <div style={{ color: '#94a3b8' }}>{t('analytics.trackedEvents.empty')}</div>
                        ) : (
                            stats.events.map((ev, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f8fafc', borderRadius: '10px' }}>
                                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{ev.name}</span>
                                    <span style={{ fontWeight: 800, color: '#2563eb', background: '#eff6ff', padding: '4px 12px', borderRadius: '6px', fontSize: '14px' }}>{formatNumber(ev.val)}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Row 2: OS & Browsers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px', marginBottom: '32px' }}>
                <div className="card-stat" style={{ padding: '32px' }}>
                    <h3 style={{ marginBottom: '24px', fontSize: '18px' }}>{t('analytics.osBreakdown')}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {!stats?.os?.length ? (
                            <div style={{ color: '#94a3b8' }}>No data available.</div>
                        ) : (
                            stats.os.map((item, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: '#64748b', fontSize: '14px' }}>{item.name}</span>
                                    <span style={{ fontWeight: 700 }}>{formatNumber(item.val)}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="card-stat" style={{ padding: '32px' }}>
                    <h3 style={{ marginBottom: '24px', fontSize: '18px' }}>{t('analytics.browserBreakdown')}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {!stats?.browsers?.length ? (
                            <div style={{ color: '#94a3b8' }}>No data available.</div>
                        ) : (
                            stats.browsers.map((item, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: '#64748b', fontSize: '14px' }}>{item.name}</span>
                                    <span style={{ fontWeight: 700 }}>{formatNumber(item.val)}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Row 3: Devices & Referrers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
                <div className="card-stat" style={{ padding: '32px' }}>
                    <h3 style={{ marginBottom: '24px', fontSize: '18px' }}>{t('analytics.deviceBreakdown')}</h3>
                    <div style={{ display: 'flex', gap: '32px' }}>
                        {!stats?.devices?.length ? (
                            <div style={{ color: '#94a3b8' }}>No data available.</div>
                        ) : (
                            stats.devices.map((item, i) => (
                                <div key={i} style={{ textAlign: 'center', flex: 1 }}>
                                    <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, marginBottom: '8px' }}>{item.name}</div>
                                    <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>{formatNumber(item.val)}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="card-stat" style={{ padding: '32px' }}>
                    <h3 style={{ marginBottom: '24px', fontSize: '18px' }}>{t('analytics.topReferrers')}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {!stats?.referrers?.length ? (
                            <div style={{ color: '#94a3b8' }}>No referrers detected.</div>
                        ) : (
                            stats.referrers.map((item, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                    <span style={{ color: '#2563eb', fontWeight: 600 }}>{item.name}</span>
                                    <span style={{ color: '#64748b' }}>{formatNumber(item.val)}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
