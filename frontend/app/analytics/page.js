"use client";
import { useState, useEffect } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { useResource } from '../../context/ResourceContext';
import HelpButton from '../../components/HelpButton';
import { exportToCSV } from '../../utils/export';

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

    const handleExport = () => {
        if (!stats) return;
        // Transform stats into a flat structure for CSV
        const exportData = stats.sources.map(s => ({
            Source: s.dim,
            Visitors: s.val,
            Total_Events: stats.summary.events
        }));
        exportToCSV(exportData, 'explorer_report');
    };

    return (
        <div className="fade-in">
            <div style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <h1>{t('analytics.title')}</h1>
                    <HelpButton section="analytics" />
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

                    <div style={{ flex: 1 }}></div>

                    <button
                        className="btn-premium"
                        style={{ background: '#fff', color: '#0f172a', border: '1px solid #e2e8f0' }}
                        onClick={handleExport}
                        disabled={!stats}
                    >
                        📤 Export (CSV)
                    </button>
                    <button className="btn-premium" onClick={fetchAnalytics} disabled={loading}>
                        {loading ? '...' : '🔄 Sync'}
                    </button>
                </div>
            </div>

            {stats && (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                        <div className="card-stat" style={{ padding: '24px' }}>
                            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
                                {t('analytics.metrics.visitors')}
                            </div>
                            <div style={{ fontSize: '28px', fontWeight: 900 }}>{formatNumber(stats.summary.visitors)}</div>
                        </div>
                        <div className="card-stat" style={{ padding: '24px' }}>
                            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
                                {t('analytics.metrics.pageviews')}
                            </div>
                            <div style={{ fontSize: '28px', fontWeight: 900 }}>{formatNumber(stats.summary.events)}</div>
                        </div>
                        <div className="card-stat" style={{ padding: '24px' }}>
                            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
                                {t('analytics.metrics.bounce')}
                            </div>
                            <div style={{ fontSize: '28px', fontWeight: 900 }}>{stats.summary.bounce_rate}%</div>
                        </div>
                        <div className="card-stat" style={{ padding: '24px' }}>
                            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
                                {t('analytics.metrics.duration')}
                            </div>
                            <div style={{ fontSize: '28px', fontWeight: 900 }}>{Math.round(stats.summary.avg_duration)}s</div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
                        {/* Traffic Sources */}
                        <div className="card-stat" style={{ padding: '0', overflow: 'hidden' }}>
                            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', fontWeight: 700 }}>{t('analytics.trafficSources')}</div>
                            <div style={{ padding: '20px 24px' }}>
                                {stats.sources.map((s, i) => (
                                    <div key={i} style={{ marginBottom: '16px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                                            <span style={{ fontWeight: 600 }}>{s.dim}</span>
                                            <span style={{ color: '#64748b' }}>{formatNumber(s.val)} ({Math.round(s.val / stats.summary.visitors * 100)}%)</span>
                                        </div>
                                        <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', background: '#3b82f6', width: `${(s.val / stats.summary.visitors * 100)}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Events */}
                        <div className="card-stat" style={{ padding: '0', overflow: 'hidden' }}>
                            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', fontWeight: 700 }}>{t('analytics.trackedEvents.title')}</div>
                            <div style={{ padding: '0' }}>
                                {stats.events.length === 0 ? (
                                    <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>{t('analytics.trackedEvents.empty')}</div>
                                ) : (
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                                            <tr>
                                                <th style={{ textAlign: 'left', padding: '12px 24px', fontSize: '11px', color: '#64748b' }}>{t('analytics.eventType')}</th>
                                                <th style={{ textAlign: 'right', padding: '12px 24px', fontSize: '11px', color: '#64748b' }}>Hits</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stats.events.map((e, i) => (
                                                <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                                                    <td style={{ padding: '12px 24px', fontSize: '13px', fontWeight: 600 }}>{e.dim}</td>
                                                    <td style={{ padding: '12px 24px', textAlign: 'right', fontSize: '13px', color: '#64748b' }}>{formatNumber(e.val)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', marginTop: '32px' }}>
                        <BreakdownCard title={t('analytics.osBreakdown')} data={stats.os} total={stats.summary.visitors} />
                        <BreakdownCard title={t('analytics.browserBreakdown')} data={stats.browsers} total={stats.summary.visitors} />
                        <BreakdownCard title={t('analytics.deviceBreakdown')} data={stats.devices} total={stats.summary.visitors} />
                    </div>
                </>
            )}
        </div>
    );
}

function BreakdownCard({ title, data, total }) {
    return (
        <div className="card-stat" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', fontWeight: 700 }}>{title}</div>
            <div style={{ padding: '20px 24px' }}>
                {data.map((d, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '10px 0', borderBottom: i === data.length - 1 ? 'none' : '1px solid #f8fafc' }}>
                        <span style={{ fontWeight: 600 }}>{d.dim}</span>
                        <span style={{ color: '#64748b' }}>{formatNumber(d.val)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
