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
                    module_slug: activationCode.includes('-') ? activationCode.split('-')[0] : 'tg-advanced'
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

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                <span style={{ fontSize: '16px', fontWeight: 900 }}>{m.price}</span>
                                {m.status === 'available' ? (
                                    <button className="btn-premium" style={{ padding: '8px 16px', fontSize: '12px', background: '#fff', color: '#0f172a', border: '1px solid #e2e8f0' }}>
                                        Details
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleToggle(m.id_db)}
                                        className="btn-premium"
                                        style={{
                                            padding: '8px 16px',
                                            fontSize: '12px',
                                            background: m.status === 'installed' ? '#fff' : '#0f172a',
                                            color: m.status === 'installed' ? '#f43f5e' : '#fff',
                                            border: m.status === 'installed' ? '1px solid #fecaca' : 'none'
                                        }}
                                    >
                                        {m.status === 'installed' ? 'Disable' : 'Enable'}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
