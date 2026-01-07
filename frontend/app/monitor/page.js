"use client";
import { useState, useEffect } from 'react';
import { useTranslation } from '../../context/LanguageContext';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}`;

export default function MonitorPage() {
    const { t } = useTranslation();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/system/monitor`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
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
        fetchStats();
        const interval = setInterval(fetchStats, 5000); // Update every 5s
        return () => clearInterval(interval);
    }, []);

    if (loading && !stats) return <div style={{ padding: '40px', textAlign: 'center' }}>Connecting to node...</div>;

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getProgressColor = (percent) => {
        if (percent > 90) return '#f43f5e';
        if (percent > 70) return '#f59e0b';
        return '#3b82f6';
    };

    return (
        <div className="fade-in">
            <div style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: 800 }}>{t('monitor.title')}</h1>
                <p className="subtitle">{t('monitor.subtitle')}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                {/* CPU Card */}
                <div className="card-stat" style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '24px' }}>{t('monitor.cpu')}</div>
                    <div style={{ position: 'relative', width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="160" height="160" viewBox="0 0 160 160">
                            <circle cx="80" cy="80" r="70" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                            <circle cx="80" cy="80" r="70" fill="none" stroke={getProgressColor(stats?.cpu.percent)} strokeWidth="12"
                                strokeDasharray={2 * Math.PI * 70}
                                strokeDashoffset={2 * Math.PI * 70 * (1 - stats?.cpu.percent / 100)}
                                strokeLinecap="round"
                                style={{ transition: 'stroke-dashoffset 0.5s ease', transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                            />
                        </svg>
                        <div style={{ position: 'absolute', textAlign: 'center' }}>
                            <div style={{ fontSize: '32px', fontWeight: 900 }}>{stats?.cpu.percent}%</div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>{stats?.cpu.cores} Cores</div>
                        </div>
                    </div>
                    <div style={{ marginTop: '24px', fontSize: '12px', color: '#64748b' }}>
                        Load Avg: {stats?.cpu.load_avg[0].toFixed(2)}, {stats?.cpu.load_avg[1].toFixed(2)}, {stats?.cpu.load_avg[2].toFixed(2)}
                    </div>
                </div>

                {/* Memory Card */}
                <div className="card-stat" style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '24px' }}>{t('monitor.memory')}</div>
                    <div style={{ position: 'relative', width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="160" height="160" viewBox="0 0 160 160">
                            <circle cx="80" cy="80" r="70" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                            <circle cx="80" cy="80" r="70" fill="none" stroke={getProgressColor(stats?.memory.percent)} strokeWidth="12"
                                strokeDasharray={2 * Math.PI * 70}
                                strokeDashoffset={2 * Math.PI * 70 * (1 - stats?.memory.percent / 100)}
                                strokeLinecap="round"
                                style={{ transition: 'stroke-dashoffset 0.5s ease', transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                            />
                        </svg>
                        <div style={{ position: 'absolute', textAlign: 'center' }}>
                            <div style={{ fontSize: '32px', fontWeight: 900 }}>{stats?.memory.percent}%</div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>Used</div>
                        </div>
                    </div>
                    <div style={{ marginTop: '24px', fontSize: '12px', color: '#64748b', textAlign: 'center' }}>
                        <div>{formatBytes(stats?.memory.used)} / {formatBytes(stats?.memory.total)}</div>
                    </div>
                </div>

                {/* Disk Card */}
                <div className="card-stat" style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '24px' }}>{t('monitor.disk')}</div>
                    <div style={{ position: 'relative', width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="160" height="160" viewBox="0 0 160 160">
                            <circle cx="80" cy="80" r="70" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                            <circle cx="80" cy="80" r="70" fill="none" stroke={getProgressColor(stats?.disk.percent)} strokeWidth="12"
                                strokeDasharray={2 * Math.PI * 70}
                                strokeDashoffset={2 * Math.PI * 70 * (1 - stats?.disk.percent / 100)}
                                strokeLinecap="round"
                                style={{ transition: 'stroke-dashoffset 0.5s ease', transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                            />
                        </svg>
                        <div style={{ position: 'absolute', textAlign: 'center' }}>
                            <div style={{ fontSize: '32px', fontWeight: 900 }}>{stats?.disk.percent}%</div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>Full</div>
                        </div>
                    </div>
                    <div style={{ marginTop: '24px', fontSize: '12px', color: '#64748b', textAlign: 'center' }}>
                        <div>{formatBytes(stats?.disk.used)} / {formatBytes(stats?.disk.total)}</div>
                    </div>
                </div>
            </div>

            <div className="card-stat" style={{ padding: '32px' }}>
                <h3 style={{ marginBottom: '24px', fontSize: '18px', fontWeight: 700 }}>System Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px' }}>
                    <div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>{t('monitor.uptime')}</div>
                        <div style={{ fontWeight: 600 }}>{Math.floor(stats?.system.uptime_seconds / 3600)}h {Math.floor((stats?.system.uptime_seconds % 3600) / 60)}m</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>{t('monitor.os')}</div>
                        <div style={{ fontWeight: 600 }}>{stats?.system.platform} {stats?.system.release}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>{t('monitor.arch')}</div>
                        <div style={{ fontWeight: 600 }}>{stats?.system.arch}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Status</div>
                        <div style={{ fontWeight: 600, color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }}></span>
                            Optimal
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
