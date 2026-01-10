"use client";
import { useState, useEffect } from 'react';
import { useTranslation } from '../../context/LanguageContext';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}`;

export default function ModulesPage() {
    const { t } = useTranslation();
    const [activationCode, setActivationCode] = useState('');
    const [status, setStatus] = useState(null);
    const [availableModules, setAvailableModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [configModal, setConfigModal] = useState(null); // stores module slug if modal open
    const [moduleConfig, setModuleConfig] = useState({});
    const [savingConfig, setSavingConfig] = useState(false);

    const fetchModules = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const res = await fetch(`${API_URL}/modules`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setAvailableModules(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchModules();
    }, []);

    const handleActivate = async (e) => {
        e.preventDefault();
        if (!activationCode) return;

        setStatus('Verifying code...');
        try {
            const token = localStorage.getItem('access_token');
            const res = await fetch(`${API_URL}/modules/install`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    license_key: activationCode,
                    module_slug: activationCode.includes('-') ? activationCode.split('-')[0] : (availableModules.length > 0 ? availableModules[0].slug : 'smart-reports')
                })
            });

            if (res.ok) {
                setStatus('Success! Module activated.');
                setActivationCode('');
                fetchModules();
            } else {
                const err = await res.json();
                setStatus(`Error: ${err.detail || 'Activation failed'}`);
            }
        } catch (err) {
            setStatus('Connection error');
        }
    };

    const handleToggle = async (moduleId) => {
        try {
            const token = localStorage.getItem('access_token');
            const res = await fetch(`${API_URL}/modules/${moduleId}/toggle`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchModules();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const openConfig = async (slug) => {
        setConfigModal(slug);
        try {
            const token = localStorage.getItem('access_token');
            const res = await fetch(`${API_URL}/modules/${slug}/config`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setModuleConfig(data.config || {});
            }
        } catch (err) {
            console.error(err);
        }
    };

    const saveConfig = async () => {
        setSavingConfig(true);
        try {
            const token = localStorage.getItem('access_token');
            await fetch(`${API_URL}/modules/${configModal}/config`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(moduleConfig)
            });
            setConfigModal(null);
        } catch (err) {
            console.error(err);
        } finally {
            setSavingConfig(false);
        }
    };

    return (
        <div className="fade-in">
            <div style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: 800 }}>{t('modules.title')}</h1>
                <p className="subtitle">{t('modules.subtitle')}</p>
            </div>

            <div className="card-stat" style={{
                padding: '32px',
                marginBottom: '40px',
            }}>
                <h3 style={{ marginBottom: '20px', fontWeight: 700 }}>{t('modules.activate')}</h3>
                <form onSubmit={handleActivate} style={{ display: 'flex', gap: '12px' }}>
                    <input
                        className="input-lux"
                        style={{ marginBottom: 0, flex: 1 }}
                        placeholder={t('modules.keyPlaceholder') || "Enter license key..."}
                        value={activationCode}
                        onChange={e => setActivationCode(e.target.value)}
                    />
                    <button className="btn-premium" style={{ whiteSpace: 'nowrap' }} disabled={!activationCode}>
                        {t('modules.activate')}
                    </button>
                </form>
                {status && <p style={{ marginTop: '12px', fontSize: '13px', color: status.includes('Success') ? '#10b981' : '#f43f5e', fontWeight: 700 }}>{status}</p>}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>Loading modules...</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                    {availableModules.map(m => (
                        <div key={m.slug} className="card-stat" style={{
                            padding: '24px',
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'relative',
                            opacity: m.status === 'disabled' ? 0.7 : 1
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: '20px',
                                right: '20px',
                                fontSize: '11px',
                                fontWeight: 800,
                                padding: '4px 10px',
                                borderRadius: '20px',
                                background: m.status === 'installed' ? '#ecfdf5' : (m.status === 'disabled' ? '#f1f5f9' : '#eff6ff'),
                                color: m.status === 'installed' ? '#059669' : (m.status === 'disabled' ? '#64748b' : '#3b82f6'),
                                textTransform: 'uppercase'
                            }}>
                                {m.status}
                            </div>

                            <div style={{ fontSize: '32px', marginBottom: '16px' }}>{m.icon}</div>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>{m.name}</h3>
                            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px', flex: 1 }}>{m.desc}</p>

                            <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                                {m.status === 'installed' && (
                                    <button onClick={() => openConfig(m.slug)} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '12px', flex: 1 }}>
                                        Settings
                                    </button>
                                )}
                                <button
                                    onClick={() => m.status === 'available' ? openConfig(m.slug) : handleToggle(m.id_db)}
                                    className="btn-premium"
                                    style={{
                                        padding: '8px 16px',
                                        fontSize: '12px',
                                        background: m.status === 'installed' ? '#fee2e2' : '#0f172a',
                                        color: m.status === 'installed' ? '#ef4444' : '#fff',
                                        border: 'none',
                                        flex: 2
                                    }}
                                >
                                    {m.status === 'installed' ? 'Disable' : (m.status === 'disabled' ? 'Enable' : 'Details')}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {configModal === 'smart-reports' && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '500px' }}>
                        <h2 style={{ marginBottom: '8px' }}>Smart Reports Config</h2>
                        <p className="subtitle" style={{ marginBottom: '24px' }}>Setup your automated performance reports.</p>

                        <div className="form-field">
                            <label>Telegram Bot Token</label>
                            <input
                                className="input-lux"
                                value={moduleConfig.telegram_token || ''}
                                onChange={e => setModuleConfig({ ...moduleConfig, telegram_token: e.target.value })}
                                placeholder="123456789:ABC..."
                            />
                        </div>

                        <div className="form-field">
                            <label>Telegram Chat ID</label>
                            <input
                                className="input-lux"
                                value={moduleConfig.chat_id || ''}
                                onChange={e => setModuleConfig({ ...moduleConfig, chat_id: e.target.value })}
                                placeholder="-100..."
                            />
                        </div>

                        <div className="form-field">
                            <label>Report Frequency</label>
                            <select
                                className="select-lux"
                                value={moduleConfig.frequency || 'daily'}
                                onChange={e => setModuleConfig({ ...moduleConfig, frequency: e.target.value })}
                            >
                                <option value="daily">Daily</option>
                                <option value="weekly">Every 7 Days</option>
                            </select>
                        </div>

                        <div className="form-field">
                            <label>Delivery Time (Server Time)</label>
                            <input
                                type="time"
                                className="input-lux"
                                value={moduleConfig.time || '09:00'}
                                onChange={e => setModuleConfig({ ...moduleConfig, time: e.target.value })}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                            <button className="btn-secondary" onClick={() => setConfigModal(null)} style={{ flex: 1 }}>Cancel</button>
                            <button className="btn-premium" onClick={saveConfig} style={{ flex: 1 }}>{savingConfig ? 'Saving...' : 'Save Settings'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
