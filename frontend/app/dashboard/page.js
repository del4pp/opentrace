"use client";
import { useState, useEffect } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { useResource } from '../../context/ResourceContext';
import { apiFetch } from '../../utils/api';
import HelpButton from '../../components/HelpButton';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}`;

export default function DashboardPage() {
    const { t } = useTranslation();
    const { selectedResource } = useResource();
    const [stats, setStats] = useState({
        visitors: 0,
        views: 0,
        session: "0m 0s",
        bounce: "0%",
        online: 0,
        chart_data: [],
        audience: {},
        retention: { d7: "0.0%", d30: "0.0%", new_vs_returning: { new: 100, returning: 0 } }
    });
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('24h');
    const [customDates, setCustomDates] = useState({ start: '', end: '' });

    const fetchStats = async () => {
        if (!selectedResource) return;
        try {
            let url = `/dashboard/stats?resource_id=${selectedResource.uid}`;

            if (dateRange !== '24h') {
                let start = new Date();
                let end = new Date();

                if (dateRange === 'today') {
                    start.setHours(0, 0, 0, 0);
                } else if (dateRange === 'yesterday') {
                    start.setDate(start.getDate() - 1);
                    start.setHours(0, 0, 0, 0);
                    end.setDate(end.getDate() - 1);
                    end.setHours(23, 59, 59, 999);
                } else if (dateRange === '7d') {
                    start.setDate(start.getDate() - 7);
                } else if (dateRange === '30d') {
                    start.setDate(start.getDate() - 30);
                } else if (dateRange === 'year') {
                    start.setFullYear(start.getFullYear() - 1);
                } else if (dateRange === 'custom') {
                    if (customDates.start && customDates.end) {
                        start = new Date(customDates.start);
                        end = new Date(customDates.end);
                    } else {
                        return; // Wait for both dates
                    }
                }

                const startStr = start.toISOString().split('T')[0];
                const endStr = end.toISOString().split('T')[0];
                url += `&start=${startStr}&end=${endStr}`;
            }

            const res = await apiFetch(url);
            if (res && res.ok) {
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
        // Only auto-refresh if looking at real-time (last 24h)
        if (dateRange === '24h') {
            const interval = setInterval(fetchStats, 10000);
            return () => clearInterval(interval);
        }
    }, [selectedResource, dateRange, customDates]);

    return (
        <div className="fade-in">
            <div style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <h1 style={{ fontSize: '32px', fontWeight: 800 }}>{t('dashboard.title')}</h1>
                        <HelpButton title={t('dashboard.help.title')} content={t('dashboard.help.content')} />
                        <div style={{
                            marginLeft: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            background: '#f0fdf4',
                            padding: '6px 16px',
                            borderRadius: '100px',
                            border: '1px solid #dcfce7',
                            gap: '8px'
                        }}>
                            <span style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', animation: 'pulse 2s infinite' }}></span>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#166534' }}>{stats.online} ONLINE</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        {dateRange === 'custom' && (
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input
                                    type="date"
                                    className="input-lux"
                                    style={{ margin: 0, padding: '8px' }}
                                    value={customDates.start}
                                    onChange={e => setCustomDates({ ...customDates, start: e.target.value })}
                                />
                                <span style={{ color: '#94a3b8' }}>-</span>
                                <input
                                    type="date"
                                    className="input-lux"
                                    style={{ margin: 0, padding: '8px' }}
                                    value={customDates.end}
                                    onChange={e => setCustomDates({ ...customDates, end: e.target.value })}
                                />
                            </div>
                        )}
                        <select
                            className="select-lux"
                            style={{ margin: 0, minWidth: '160px' }}
                            value={dateRange}
                            onChange={e => setDateRange(e.target.value)}
                        >
                            <option value="24h">Real-time (24h)</option>
                            <option value="today">Today</option>
                            <option value="yesterday">Yesterday</option>
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                            <option value="year">Last Year</option>
                            <option value="custom">Custom Range</option>
                        </select>
                    </div>
                </div>
                <p className="subtitle">{t('dashboard.subtitle')}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '48px' }}>
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 2fr)) 1fr', gap: '24px' }}>
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
                        {dateRange === '24h' || dateRange === 'today' ? (
                            <>
                                <span>-24h</span>
                                <span>-18h</span>
                                <span>-12h</span>
                                <span>-6h</span>
                                <span style={{ color: '#2563eb' }}>Now</span>
                            </>
                        ) : (
                            <>
                                <span>Start of period</span>
                                <span>End of period</span>
                            </>
                        )}
                    </div>
                </div>

                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Audience & Devices</h3>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>
                            <span style={{ color: '#0f172a' }}>Mobile ({stats.audience?.Mobile || 0}%)</span>
                            <span style={{ color: '#0f172a' }}>Desktop ({stats.audience?.Desktop || 0}%)</span>
                        </div>
                        <div style={{ height: '8px', width: '100%', background: '#f1f5f9', borderRadius: '100px', overflow: 'hidden', display: 'flex' }}>
                            <div style={{ width: `${stats.audience?.Mobile || 0}%`, background: '#2563eb' }}></div>
                            <div style={{ width: `${stats.audience?.Desktop || 0}%`, background: '#cbd5e1' }}></div>
                        </div>
                    </div>

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
