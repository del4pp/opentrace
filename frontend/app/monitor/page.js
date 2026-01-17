"use client";
import { useState, useEffect } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import HelpButton from '../../components/HelpButton';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}`;

export default function MonitorPage() {
    const { t } = useTranslation();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                setError("No authorization token found. Please log in.");
                setLoading(false);
                return;
            }

            const res = await fetch(`${API_URL}/system/monitor`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setStats(data);
                setError(null);
            } else if (res.status === 401) {
                setError("Session expired. Please log in again.");
            } else {
                setError("Failed to fetch system statistics.");
            }
        } catch (err) {
            console.error(err);
            setError("Connection error with backend.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 5000); // Update every 5s
        return () => clearInterval(interval);
    }, []);

    if (loading && !stats) return (
        <div style={{ padding: '80px', textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 20px' }}></div>
            <p style={{ color: '#64748b', fontWeight: 600 }}>Connecting to system node...</p>
        </div>
    );

    if (error && !stats) return (
        <div style={{ padding: '80px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
            <h3 style={{ fontWeight: 800, marginBottom: '8px' }}>Monitor Unavailable</h3>
            <p style={{ color: '#f43f5e', fontWeight: 600 }}>{error}</p>
        </div>
    );

    const formatBytes = (bytes) => {
        if (!bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getProgressColor = (percent) => {
        if (!percent) return '#3b82f6';
        if (percent > 90) return '#f43f5e';
        if (percent > 70) return '#f59e0b';
        return '#10b981';
    };

    return (
        <div className="fade-in">
            <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: 800 }}>{t('monitor.title') || 'Resource Monitor'}</h1>
                    <p className="subtitle">{t('monitor.subtitle') || 'Infrastructure health and performance metrics'}</p>
                </div>
                <HelpButton
                    title={t('monitor.help.title')}
                    content={t('monitor.help.content')}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                {/* CPU Card */}
                <div className="card-stat" style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '24px' }}>{t('monitor.cpu') || 'CPU Load'}</div>
                    <div style={{ position: 'relative', width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="160" height="160" viewBox="0 0 160 160">
                            <circle cx="80" cy="80" r="70" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                            <circle cx="80" cy="80" r="70" fill="none" stroke={getProgressColor(stats?.cpu?.percent)} strokeWidth="12"
                                strokeDasharray={2 * Math.PI * 70}
                                strokeDashoffset={2 * Math.PI * 70 * (1 - (stats?.cpu?.percent || 0) / 100)}
                                strokeLinecap="round"
                                style={{ transition: 'stroke-dashoffset 0.5s ease', transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                            />
                        </svg>
                        <div style={{ position: 'absolute', textAlign: 'center' }}>
                            <div style={{ fontSize: '32px', fontWeight: 900 }}>{stats?.cpu?.percent || 0}%</div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>{stats?.cpu?.cores || 0} Cores</div>
                        </div>
                    </div>
                    <div style={{ marginTop: '24px', fontSize: '12px', color: '#64748b' }}>
                        Load Avg: {stats?.cpu?.load_avg?.[0]?.toFixed(2) || '0.00'}, {stats?.cpu?.load_avg?.[1]?.toFixed(2) || '0.00'}, {stats?.cpu?.load_avg?.[2]?.toFixed(2) || '0.00'}
                    </div>
                </div>

                {/* Memory Card */}
                <div className="card-stat" style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '24px' }}>{t('monitor.memory') || 'Memory Usage'}</div>
                    <div style={{ position: 'relative', width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="160" height="160" viewBox="0 0 160 160">
                            <circle cx="80" cy="80" r="70" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                            <circle cx="80" cy="80" r="70" fill="none" stroke={getProgressColor(stats?.memory?.percent)} strokeWidth="12"
                                strokeDasharray={2 * Math.PI * 70}
                                strokeDashoffset={2 * Math.PI * 70 * (1 - (stats?.memory?.percent || 0) / 100)}
                                strokeLinecap="round"
                                style={{ transition: 'stroke-dashoffset 0.5s ease', transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                            />
                        </svg>
                        <div style={{ position: 'absolute', textAlign: 'center' }}>
                            <div style={{ fontSize: '32px', fontWeight: 900 }}>{stats?.memory?.percent || 0}%</div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>Used</div>
                        </div>
                    </div>
                    <div style={{ marginTop: '24px', fontSize: '12px', color: '#64748b', textAlign: 'center' }}>
                        <div>{formatBytes(stats?.memory?.used)} / {formatBytes(stats?.memory?.total)}</div>
                    </div>
                </div>

                {/* Disk Card */}
                <div className="card-stat" style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '24px' }}>{t('monitor.disk') || 'Disk Usage'}</div>
                    <div style={{ position: 'relative', width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="160" height="160" viewBox="0 0 160 160">
                            <circle cx="80" cy="80" r="70" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                            <circle cx="80" cy="80" r="70" fill="none" stroke={getProgressColor(stats?.disk?.percent)} strokeWidth="12"
                                strokeDasharray={2 * Math.PI * 70}
                                strokeDashoffset={2 * Math.PI * 70 * (1 - (stats?.disk?.percent || 0) / 100)}
                                strokeLinecap="round"
                                style={{ transition: 'stroke-dashoffset 0.5s ease', transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                            />
                        </svg>
                        <div style={{ position: 'absolute', textAlign: 'center' }}>
                            <div style={{ fontSize: '32px', fontWeight: 900 }}>{stats?.disk?.percent || 0}%</div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>Full</div>
                        </div>
                    </div>
                    <div style={{ marginTop: '24px', fontSize: '12px', color: '#64748b', textAlign: 'center' }}>
                        <div>{formatBytes(stats?.disk?.used)} / {formatBytes(stats?.disk?.total)}</div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px', marginBottom: '40px' }}>
                {/* Processes */}
                <div className="card-stat" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        Top Processes
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {stats?.processes?.map((proc, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: 700, fontSize: '13px' }}>{proc.name}</span>
                                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>PID: {proc.pid}</span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 800, color: '#3b82f6', fontSize: '13px' }}>{proc.memory_percent?.toFixed(1)}% RAM</div>
                                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{proc.cpu_percent?.toFixed(1)}% CPU</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Databases */}
                <div className="card-stat" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        Connected Services
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {Object.entries(stats?.databases || {}).map(([name, status]) => (
                            <div key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '10px', height: '100%', padding: '20px 0', background: status === 'online' ? '#10b981' : '#f43f5e', borderRadius: '4px' }}></div>
                                    <span style={{ fontWeight: 700, textTransform: 'capitalize' }}>{name}</span>
                                </div>
                                <span style={{
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    fontSize: '11px',
                                    fontWeight: 800,
                                    background: status === 'online' ? '#ecfdf5' : '#fef2f2',
                                    color: status === 'online' ? '#059669' : '#dc2626',
                                    textTransform: 'uppercase'
                                }}>
                                    {status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="card-stat" style={{ padding: '32px' }}>
                <h3 style={{ marginBottom: '24px', fontSize: '18px', fontWeight: 800 }}>System Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px' }}>
                    <div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, marginBottom: '4px' }}>{t('monitor.uptime') || 'Uptime'}</div>
                        <div style={{ fontWeight: 700, fontSize: '15px' }}>{Math.floor((stats?.system?.uptime_seconds || 0) / 3600)}h {Math.floor(((stats?.system?.uptime_seconds || 0) % 3600) / 60)}m</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, marginBottom: '4px' }}>{t('monitor.os') || 'Distro'}</div>
                        <div style={{ fontWeight: 700, fontSize: '15px' }}>{stats?.system?.platform} {stats?.system?.release}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, marginBottom: '4px' }}>{t('monitor.arch') || 'Arch'}</div>
                        <div style={{ fontWeight: 700, fontSize: '15px' }}>{stats?.system?.arch}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, marginBottom: '4px' }}>Health Status</div>
                        <div style={{ fontWeight: 700, fontSize: '15px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="pulse" style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }}></span>
                            Operational
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .pulse {
                    animation: pulse-green 2s infinite;
                }
                @keyframes pulse-green {
                    0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
                }
            `}</style>
        </div>
    );
}
