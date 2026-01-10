"use client";
import { useState, useEffect } from 'react';
import { useTranslation } from '../../context/LanguageContext';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}`;

export default function ModulesPage() {
    const { t } = useTranslation();
    const [activationCode, setActivationCode] = useState('');
    const [status, setStatus] = useState(null);
    const [availableModules, setAvailableModules] = useState([]);
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [configModal, setConfigModal] = useState(null);
    const [moduleConfig, setModuleConfig] = useState({ channels: [], resources: [] });
    const [savingConfig, setSavingConfig] = useState(false);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const headers = { 'Authorization': `Bearer ${token}` };

            const [modRes, resRes] = await Promise.all([
                fetch(`${API_URL}/modules`, { headers }),
                fetch(`${API_URL}/resources`, { headers })
            ]);

            if (modRes.ok) setAvailableModules(await modRes.json());
            if (resRes.ok) setResources(await resRes.json());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
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
                    module_slug: availableModules.find(m => activationCode.startsWith(m.slug))?.slug || availableModules[0]?.slug
                })
            });

            if (res.ok) {
                setStatus('Success! Module activated.');
                setActivationCode('');
                fetchData();
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
            if (res.ok) fetchData();
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
                setModuleConfig({
                    channels: data.config?.channels || [],
                    resources: data.config?.resources || [],
                    ...data.config
                });
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

    const toggleChannel = (ch) => {
        const channels = [...(moduleConfig.channels || [])];
        if (channels.includes(ch)) {
            setModuleConfig({ ...moduleConfig, channels: channels.filter(c => c !== ch) });
        } else {
            setModuleConfig({ ...moduleConfig, channels: [...channels, ch] });
        }
    };

    const toggleResource = (id) => {
        const resIds = [...(moduleConfig.resources || [])];
        if (resIds.includes(id)) {
            setModuleConfig({ ...moduleConfig, resources: resIds.filter(r => r !== id) });
        } else {
            setModuleConfig({ ...moduleConfig, resources: [...resIds, id] });
        }
    };

    return (
        <div className="fade-in">
            <div style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: 800 }}>{t('modules.title')}</h1>
                <p className="subtitle">{t('modules.subtitle')}</p>
            </div>

            <div className="card-stat" style={{ padding: '32px', marginBottom: '40px' }}>
                <h3 style={{ marginBottom: '20px', fontWeight: 700 }}>{t('modules.activate')}</h3>
                <form onSubmit={handleActivate} style={{ display: 'flex', gap: '12px' }}>
                    <input
                        className="input-lux"
                        style={{ marginBottom: 0, flex: 1 }}
                        placeholder={t('modules.keyPlaceholder')}
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
                <div style={{ textAlign: 'center', padding: '40px' }}>Syncing registry...</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                    {availableModules.map(m => (
                        <div key={m.slug} className="card-stat" style={{ padding: '24px', display: 'flex', flexDirection: 'column', position: 'relative', opacity: m.status === 'disabled' ? 0.7 : 1 }}>
                            <div style={{ position: 'absolute', top: '20px', right: '20px', fontSize: '10px', fontWeight: 800, padding: '4px 10px', borderRadius: '20px', background: m.status === 'installed' ? '#ecfdf5' : (m.status === 'disabled' ? '#f1f5f9' : '#eff6ff'), color: m.status === 'installed' ? '#059669' : (m.status === 'disabled' ? '#64748b' : '#3b82f6'), textTransform: 'uppercase' }}>
                                {t(`module_store.status.${m.status}`)}
                            </div>

                            <div style={{ fontSize: '32px', marginBottom: '16px' }}>{m.icon}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{m.name}</h3>
                                <span style={{ fontSize: '10px', color: '#94a3b8', background: '#f8fafc', padding: '2px 6px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>v{m.version}</span>
                            </div>
                            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px', flex: 1 }}>{m.desc}</p>

                            <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                                {m.status === 'installed' && (
                                    <button onClick={() => openConfig(m.slug)} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '12px', flex: 1 }}>
                                        {t('module_store.settings')}
                                    </button>
                                )}
                                <button
                                    onClick={() => m.status === 'available' ? openConfig(m.slug) : handleToggle(m.id_db)}
                                    className="btn-premium"
                                    style={{ padding: '8px 16px', fontSize: '12px', background: m.status === 'installed' ? '#fee2e2' : '#0f172a', color: m.status === 'installed' ? '#ef4444' : '#fff', border: 'none', flex: 2 }}
                                >
                                    {m.status === 'installed' ? t('module_store.disable') : (m.status === 'disabled' ? t('module_store.enable') : t('module_store.details'))}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {configModal === 'smart-reports' && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '600px' }}>
                        <h2 style={{ marginBottom: '8px' }}>{t('smart_reports.title')}</h2>
                        <p className="subtitle" style={{ marginBottom: '24px' }}>{t('smart_reports.subtitle')}</p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginBottom: '12px', display: 'block' }}>{t('smart_reports.channels')}</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {['telegram', 'discord', 'email'].map(ch => (
                                        <label key={ch} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer', padding: '10px', background: '#f8fafc', borderRadius: '8px' }}>
                                            <input type="checkbox" checked={moduleConfig.channels?.includes(ch)} onChange={() => toggleChannel(ch)} />
                                            {ch.charAt(0).toUpperCase() + ch.slice(1)}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginBottom: '12px', display: 'block' }}>{t('smart_reports.resources')}</label>
                                <div style={{ maxHeight: '160px', overflowY: 'auto', paddingRight: '8px' }}>
                                    {resources.map(res => (
                                        <label key={res.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', marginBottom: '4px' }}>
                                            <input type="checkbox" checked={moduleConfig.resources?.includes(res.id)} onChange={() => toggleResource(res.id)} />
                                            {res.name}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '24px', borderTop: '1px solid #f1f5f9', paddingTop: '24px' }}>
                            {moduleConfig.channels?.includes('telegram') && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                    <div className="form-field">
                                        <label>{t('smart_reports.telegram')}</label>
                                        <input className="input-lux" value={moduleConfig.telegram_token || ''} onChange={e => setModuleConfig({ ...moduleConfig, telegram_token: e.target.value })} placeholder="Token" />
                                    </div>
                                    <div className="form-field">
                                        <label>{t('smart_reports.chat_id')}</label>
                                        <input className="input-lux" value={moduleConfig.chat_id || ''} onChange={e => setModuleConfig({ ...moduleConfig, chat_id: e.target.value })} placeholder="ID" />
                                    </div>
                                </div>
                            )}

                            {moduleConfig.channels?.includes('discord') && (
                                <div className="form-field">
                                    <label>{t('smart_reports.discord')}</label>
                                    <input className="input-lux" value={moduleConfig.discord_webhook || ''} onChange={e => setModuleConfig({ ...moduleConfig, discord_webhook: e.target.value })} placeholder="https://discord.com/api/webhooks/..." />
                                </div>
                            )}

                            {moduleConfig.channels?.includes('email') && (
                                <div className="form-field">
                                    <label>{t('smart_reports.email')}</label>
                                    <input className="input-lux" value={moduleConfig.emails || ''} onChange={e => setModuleConfig({ ...moduleConfig, emails: e.target.value })} placeholder="admin@example.com, boss@example.com" />
                                </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-field">
                                    <label>{t('smart_reports.frequency')}</label>
                                    <select className="select-lux" value={moduleConfig.frequency || 'daily'} onChange={e => setModuleConfig({ ...moduleConfig, frequency: e.target.value })}>
                                        <option value="daily">{t('smart_reports.daily')}</option>
                                        <option value="weekly">{t('smart_reports.weekly')}</option>
                                    </select>
                                </div>
                                <div className="form-field">
                                    <label>{t('smart_reports.time')}</label>
                                    <input type="time" className="input-lux" value={moduleConfig.time || '09:00'} onChange={e => setModuleConfig({ ...moduleConfig, time: e.target.value })} />
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                            <button className="btn-secondary" onClick={() => setConfigModal(null)} style={{ flex: 1 }}>{t('smart_reports.cancel')}</button>
                            <button className="btn-premium" onClick={saveConfig} style={{ flex: 1 }}>{savingConfig ? t('smart_reports.saving') : t('smart_reports.save')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
