"use client";
import { useState, useEffect } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import HelpButton from '../../components/HelpButton';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api'}`;

export default function SettingsPage() {
    const { t } = useTranslation();
    const [logs, setLogs] = useState([]);
    const [loadingLogs, setLoadingLogs] = useState(true);
    const [theme, setTheme] = useState('dark');
    const [notifications, setNotifications] = useState({ email: true, slack: false, alerts: true });

    const fetchLogs = async () => {
        try {
            const res = await fetch(`${API_URL}/logs`);
            if (res.ok) setLogs(await res.json());
        } catch (err) {
            console.error("Failed to fetch logs:", err);
        } finally {
            setLoadingLogs(false);
        }
    };

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 10000);

        // Load theme
        const savedTheme = localStorage.getItem('ot_theme') || 'dark';
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);

        return () => clearInterval(interval);
    }, []);

    const toggleTheme = (newTheme) => {
        setTheme(newTheme);
        localStorage.setItem('ot_theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    return (
        <div className="fade-in">
            <div style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <h1>{t('settings.title')}</h1>
                    <HelpButton title={t('settings.help.title')} content={t('settings.help.content')} />
                </div>
                <p className="subtitle">{t('settings.subtitle')}</p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '32px'
            }}>
                <div className="card-stat" style={{ padding: '32px' }}>
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                        <div style={{ fontSize: '24px' }}>🏢</div>
                        <div>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>{t('settings.general')}</h3>
                            <p style={{ fontSize: '13px', color: '#64748b' }}>{t('settings.generalDesc')}</p>
                        </div>
                    </div>

                    <div className="form-field">
                        <label>{t('settings.workspaceName')}</label>
                        <input className="input-lux" defaultValue="OpenTrace Analytics" style={{ marginBottom: 0 }} />
                    </div>
                </div>

                <div className="card-stat" style={{ padding: '32px' }}>
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                        <div style={{ fontSize: '24px' }}>🔑</div>
                        <div>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>{t('settings.api')}</h3>
                            <p style={{ fontSize: '13px', color: '#64748b' }}>{t('settings.apiDesc')}</p>
                        </div>
                    </div>

                    <div className="form-field">
                        <label>{t('settings.ingestionKey')}</label>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <input
                                className="input-lux"
                                readOnly
                                value="ot_ak_7721_99xbc_22"
                                style={{ fontFamily: 'monospace', marginBottom: 0, fontSize: '13px' }}
                            />
                            <button className="btn-premium" style={{ whiteSpace: 'nowrap' }}>
                                {t('settings.rotate')}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="card-stat" style={{ padding: '32px' }}>
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                        <div style={{ fontSize: '24px' }}>🎨</div>
                        <div>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>{t('settings.appearance')}</h3>
                            <p style={{ fontSize: '13px', color: '#64748b' }}>{t('settings.appearanceDesc')}</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={() => toggleTheme('light')}
                            style={{ flex: 1, padding: '12px', borderRadius: '10px', border: theme === 'light' ? '2px solid #2563eb' : '1px solid var(--border)', background: '#fff' }}
                        >☀️ Light</button>
                        <button
                            onClick={() => toggleTheme('dark')}
                            style={{ flex: 1, padding: '12px', borderRadius: '10px', border: theme === 'dark' ? '2px solid #2563eb' : '1px solid var(--border)', background: '#0f172a', color: '#fff' }}
                        >🌑 Night</button>
                    </div>
                </div>

                <div className="card-stat" style={{ padding: '32px', gridColumn: '1 / -1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                background: '#f1f5f9',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '20px'
                            }}>🚀</div>
                            <div>
                                <div style={{ fontSize: '16px', fontWeight: 800 }}>OpenTrace v1.0.4-stable</div>
                                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Last check: Just now</div>
                            </div>
                        </div>
                        <button
                            className="btn-update"
                            style={{ padding: '12px 24px', borderRadius: '10px' }}
                            onClick={(e) => {
                                const btn = e.currentTarget;
                                btn.innerText = 'Checking...';
                                setTimeout(() => {
                                    btn.innerText = t('settings.upToDate');
                                    btn.style.background = '#ecfdf5';
                                    btn.style.color = '#059669';
                                    btn.style.borderColor = '#10b981';
                                }, 1500);
                            }}
                        >
                            {t('settings.checkUpdate')}
                        </button>
                    </div>
                </div>
                <div className="card-stat" style={{ padding: '32px', gridColumn: '1 / -1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <div>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>{t('settings.logs.title')}</h3>
                            <p style={{ fontSize: '13px', color: '#64748b' }}>{t('settings.logs.subtitle')}</p>
                        </div>
                        <button onClick={fetchLogs} className="btn-update" style={{ background: '#fff' }}>
                            🔄 Refresh
                        </button>
                    </div>

                    <div style={{ overflowX: 'auto', border: '1px solid #f1f5f9', borderRadius: '12px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                                    <th style={{ textAlign: 'left', padding: '12px 16px', color: '#64748b' }}>{t('settings.logs.level')}</th>
                                    <th style={{ textAlign: 'left', padding: '12px 16px', color: '#64748b' }}>{t('settings.logs.module')}</th>
                                    <th style={{ textAlign: 'left', padding: '12px 16px', color: '#64748b' }}>{t('settings.logs.message')}</th>
                                    <th style={{ textAlign: 'right', padding: '12px 16px', color: '#64748b' }}>{t('settings.logs.time')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loadingLogs ? (
                                    <tr><td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>Loading system logs...</td></tr>
                                ) : logs.length === 0 ? (
                                    <tr><td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>No logs recorded yet.</td></tr>
                                ) : logs.map((log, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                                        <td style={{ padding: '12px 16px' }}>
                                            <span style={{
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                                fontSize: '10px',
                                                fontWeight: 800,
                                                background: log[0] === 'ERROR' ? '#fef2f2' : (log[0] === 'WARN' ? '#fffbeb' : '#f0fdf4'),
                                                color: log[0] === 'ERROR' ? '#ef4444' : (log[0] === 'WARN' ? '#d97706' : '#22c55e')
                                            }}>{log[0]}</span>
                                        </td>
                                        <td style={{ padding: '12px 16px', fontWeight: 600 }}>{log[1]}</td>
                                        <td style={{ padding: '12px 16px', color: '#64748b' }}>{log[2]}</td>
                                        <td style={{ padding: '12px 16px', textAlign: 'right', color: '#94a3b8', fontSize: '11px' }}>
                                            {log[4] ? new Date(log[4]).toLocaleTimeString() : 'N/A'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
