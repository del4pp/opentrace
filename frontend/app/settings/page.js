"use client";
import { useState, useEffect } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import HelpButton from '../../components/HelpButton';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}`;

export default function SettingsPage() {
    const { t } = useTranslation();
    const [logs, setLogs] = useState([]);
    const [loadingLogs, setLoadingLogs] = useState(true);
    const [theme, setTheme] = useState('dark');
    const [notifications, setNotifications] = useState({ email: true, slack: false, alerts: true });
    const [showDemo, setShowDemo] = useState(true);
    const [adminEmail, setAdminEmail] = useState('');
    const [emailLoading, setEmailLoading] = useState(false);
    const [smtp, setSmtp] = useState({
        smtp_host: '',
        smtp_port: '587',
        smtp_user: '',
        smtp_password: '',
        smtp_from: ''
    });
    const [updateInfo, setUpdateInfo] = useState({ current: '1.0.5', latest: '', update_available: false, checking: false });

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

    const fetchSettings = async () => {
        try {
            const res = await fetch(`${API_URL}/settings`);
            if (res.ok) {
                const data = await res.json();
                setShowDemo(data.show_demo === 'true');
                setSmtp({
                    smtp_host: data.smtp_host || '',
                    smtp_port: data.smtp_port || '587',
                    smtp_user: data.smtp_user || '',
                    smtp_password: data.smtp_password || '',
                    smtp_from: data.smtp_from || ''
                });
            }
        } catch (err) {
            console.error("Failed to fetch settings:", err);
        }
    };

    useEffect(() => {
        fetchLogs();
        fetchSettings();
        const interval = setInterval(fetchLogs, 10000);

        // Load user email from localstorage for initial state
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.email) setAdminEmail(user.email);

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

    const handleUpdateSetting = async (key, value) => {
        try {
            await fetch(`${API_URL}/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, value })
            });
        } catch (err) {
            console.error(`Failed to update setting ${key}:`, err);
        }
    };

    const handleToggleDemo = (val) => {
        setShowDemo(val);
        handleUpdateSetting('show_demo', val ? 'true' : 'false');
    };

    const handleUpdateEmail = async () => {
        setEmailLoading(true);
        try {
            const res = await fetch(`${API_URL}/admin/update-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ new_email: adminEmail })
            });

            if (res.ok) {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                user.email = adminEmail;
                localStorage.setItem('user', JSON.stringify(user));
                alert('Email updated successfully');
            } else {
                alert('Failed to update email');
            }
        } catch (err) {
            console.error("Update email error:", err);
            alert('An error occurred');
        } finally {
            setEmailLoading(false);
        }
    };

    const handleCheckUpdate = async () => {
        setUpdateInfo(prev => ({ ...prev, checking: true }));
        try {
            const res = await fetch(`${API_URL}/system/check-update`);
            if (res.ok) {
                const data = await res.json();
                setUpdateInfo({
                    current: data.current,
                    latest: data.latest,
                    update_available: data.update_available,
                    checking: false
                });
            } else {
                setUpdateInfo(prev => ({ ...prev, checking: false }));
                alert('Failed to check for updates');
            }
        } catch (err) {
            console.error("Check update error:", err);
            setUpdateInfo(prev => ({ ...prev, checking: false }));
        }
    };

    const handlePerformUpdate = async () => {
        const confirmed = window.confirm(
            "⚠️ ATTENTION: SYSTEM UPDATE\n\n" +
            "1. The system will be UNAVAILABLE for 2-5 minutes during the process.\n" +
            "2. We strongly recommend making a FULL BACKUP of your 'data/' folder before proceeding.\n" +
            "3. Existing data in volumes will be preserved, but a backup is always safer.\n\n" +
            "Do you want to proceed with the update to v" + updateInfo.latest + "?"
        );

        if (!confirmed) return;

        try {
            const res = await fetch(`${API_URL}/system/perform-update`, { method: 'POST' });
            if (res.ok) {
                const data = await res.json();
                alert("🚀 UPDATE TRIGGERED: " + data.message + "\n\nYou will be logged out. Please refresh the page in a few minutes.");
                // Optional: Logout or redirect
                localStorage.clear();
                window.location.href = '/login';
            } else {
                const error = await res.json();
                alert('Update failed: ' + (error.detail || 'Unknown error'));
            }
        } catch (err) {
            console.error("Perform update error:", err);
            alert('An error occurred during update initialization.');
        }
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
                        <div style={{ fontSize: '24px' }}>🛡️</div>
                        <div>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>{t('settings.security.title')}</h3>
                            <p style={{ fontSize: '13px', color: '#64748b' }}>{t('settings.security.desc')}</p>
                        </div>
                    </div>

                    <div className="form-field">
                        <label>{t('settings.security.adminEmail')}</label>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <input
                                className="input-lux"
                                value={adminEmail}
                                onChange={(e) => setAdminEmail(e.target.value)}
                                style={{ marginBottom: 0 }}
                            />
                            <button
                                className="btn-premium"
                                style={{ whiteSpace: 'nowrap' }}
                                onClick={handleUpdateEmail}
                                disabled={emailLoading}
                            >
                                {emailLoading ? '...' : t('settings.security.update')}
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px', paddingBottom: '20px', borderBottom: '1px solid #f1f5f9' }}>
                        <div>
                            <div style={{ fontSize: '14px', fontWeight: 600 }}>{t('settings.security.showDemo')}</div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>{t('settings.security.showDemoDesc')}</div>
                        </div>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={showDemo}
                                onChange={(e) => handleToggleDemo(e.target.checked)}
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>

                    <div style={{ marginTop: '20px' }}>
                        <button
                            className="btn-premium"
                            style={{ width: '100%', background: '#fff', color: '#0f172a', border: '1px solid #e2e8f0' }}
                            onClick={async () => {
                                try {
                                    const res = await fetch(`${API_URL}/forgot-password`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ email: adminEmail })
                                    });
                                    if (res.ok) {
                                        const data = await res.json();
                                        alert(data.message || 'Password reset link sent to ' + adminEmail);
                                    } else {
                                        const errorData = await res.json().catch(() => ({ detail: 'Failed to send reset link' }));
                                        alert(errorData.detail || 'Failed to send reset link. Please check email server configuration.');
                                    }
                                } catch (e) {
                                    alert('Error sending reset link: ' + e.message);
                                }
                            }}
                        >
                            {t('settings.security.resetPassword')}
                        </button>
                    </div>
                </div>

                <div className="card-stat" style={{ padding: '32px' }}>
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                        <div style={{ fontSize: '24px' }}>📧</div>
                        <div>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>{t('settings.smtp.title')}</h3>
                            <p style={{ fontSize: '13px', color: '#64748b' }}>{t('settings.smtp.desc')}</p>
                        </div>
                    </div>

                    <div className="form-field">
                        <label>{t('settings.smtp.host')}</label>
                        <input
                            className="input-lux"
                            value={smtp.smtp_host}
                            onChange={(e) => setSmtp({ ...smtp, smtp_host: e.target.value })}
                            onBlur={() => handleUpdateSetting('smtp_host', smtp.smtp_host)}
                            placeholder="smtp.example.com"
                        />
                    </div>
                    <div className="form-field">
                        <label>{t('settings.smtp.port')}</label>
                        <input
                            className="input-lux"
                            value={smtp.smtp_port}
                            onChange={(e) => setSmtp({ ...smtp, smtp_port: e.target.value })}
                            onBlur={() => handleUpdateSetting('smtp_port', smtp.smtp_port)}
                            placeholder="587"
                        />
                    </div>
                    <div className="form-field">
                        <label>{t('settings.smtp.user')}</label>
                        <input
                            className="input-lux"
                            value={smtp.smtp_user}
                            onChange={(e) => setSmtp({ ...smtp, smtp_user: e.target.value })}
                            onBlur={() => handleUpdateSetting('smtp_user', smtp.smtp_user)}
                        />
                    </div>
                    <div className="form-field">
                        <label>{t('settings.smtp.pass')}</label>
                        <input
                            type="password"
                            className="input-lux"
                            value={smtp.smtp_password}
                            onChange={(e) => setSmtp({ ...smtp, smtp_password: e.target.value })}
                            onBlur={() => handleUpdateSetting('smtp_password', smtp.smtp_password)}
                        />
                    </div>
                    <div className="form-field">
                        <label>{t('settings.smtp.from')}</label>
                        <input
                            className="input-lux"
                            value={smtp.smtp_from}
                            onChange={(e) => setSmtp({ ...smtp, smtp_from: e.target.value })}
                            onBlur={() => handleUpdateSetting('smtp_from', smtp.smtp_from)}
                            placeholder="noreply@opentrace.io"
                        />
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
                            }}>{updateInfo.update_available ? '🎁' : '🚀'}</div>
                            <div>
                                <div style={{ fontSize: '16px', fontWeight: 800 }}>
                                    OpenTrace v{updateInfo.current} {updateInfo.latest && `(Latest: ${updateInfo.latest})`}
                                </div>
                                <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                                    {updateInfo.update_available ? t('settings.updates.newAvailable') : t('settings.updates.stable')}
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            {updateInfo.update_available && (
                                <button
                                    className="btn-premium"
                                    style={{ padding: '12px 24px', background: '#22c55e' }}
                                    onClick={handlePerformUpdate}
                                >
                                    {t('settings.updates.install')}
                                </button>
                            )}
                            <button
                                className="btn-update"
                                style={{ padding: '12px 24px', borderRadius: '10px' }}
                                onClick={handleCheckUpdate}
                                disabled={updateInfo.checking}
                            >
                                {updateInfo.checking ? t('settings.updates.installing') : t('settings.checkUpdate')}
                            </button>
                        </div>
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
