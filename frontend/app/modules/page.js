"use client";
import { useState } from 'react';
import { useTranslation } from '../../context/LanguageContext';

export default function ModulesPage() {
    const { t } = useTranslation();
    const [activationCode, setActivationCode] = useState('');
    const [status, setStatus] = useState(null);

    const modules = [
        { id: 'tg-advanced', name: 'Telegram Bot Deep-Insights', price: '$89', status: 'premium', icon: '🤖', desc: 'Full lifecycle tracking from ad click to bot interaction.' },
        { id: 'formula-engine', name: 'Advanced Formula Engine', price: 'Installed', status: 'installed', icon: '🧪', desc: 'Create custom KPIs using SQL-like expressions.' },
        { id: 'white-label', name: 'Agency White-Label', price: '$149', status: 'premium', icon: '🏢', desc: 'Remove branding and use your own agency logo.' },
        { id: 'crm-sync', name: 'CRM Auto-Sync', price: '$59', status: 'available', icon: '🔄', desc: 'Real-time data push to HubSpot, Pipedrive or Salesforce.' },
        { id: 'geo-pro', name: 'IP Intelligence Pro', price: '$29', status: 'available', icon: '🌍', desc: 'Precise city-level geolocation and ISP detection.' },
        { id: 'slack-alerts', name: 'Discord/Slack Alerts', price: 'Free', status: 'installed', icon: '🔔', desc: 'Get instant notifications for traffic anomalies.' },
    ];

    const handleActivate = (e) => {
        e.preventDefault();
        setStatus('Verifying code...');
        setTimeout(() => {
            setStatus('Success! Module activated.');
            setActivationCode('');
        }, 1500);
    };

    return (
        <div>
            <div style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: 800 }}>{t('modules.title')}</h1>
                <p className="subtitle">{t('modules.subtitle')}</p>
            </div>

            <div style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '20px',
                padding: '32px',
                marginBottom: '40px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
            }}>
                <h3 style={{ marginBottom: '20px' }}>{t('modules.activate')}</h3>
                <form onSubmit={handleActivate} style={{ display: 'flex', gap: '12px' }}>
                    <input
                        className="input-lux"
                        style={{ marginBottom: 0, flex: 1 }}
                        placeholder={t('modules.keyPlaceholder')}
                        value={activationCode}
                        onChange={e => setActivationCode(e.target.value)}
                    />
                    <button className="btn-premium" style={{ whiteSpace: 'nowrap' }}>{t('modules.activate')}</button>
                </form>
                {status && <p style={{ marginTop: '12px', fontSize: '13px', color: status.includes('Success') ? '#10b981' : '#2563eb', fontWeight: 600 }}>{status}</p>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                {modules.map(m => (
                    <div key={m.id} style={{
                        background: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '16px',
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: '20px',
                            right: '20px',
                            fontSize: '11px',
                            fontWeight: 800,
                            padding: '4px 10px',
                            borderRadius: '20px',
                            background: m.status === 'installed' ? '#ecfdf5' : '#eff6ff',
                            color: m.status === 'installed' ? '#059669' : '#2563eb',
                            textTransform: 'uppercase'
                        }}>
                            {t(`modules.status.${m.status}`)}
                        </div>

                        <div style={{ fontSize: '32px', marginBottom: '16px' }}>{m.icon}</div>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>{m.name}</h3>
                        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px', flex: 1 }}>{m.desc}</p>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                            <span style={{ fontSize: '16px', fontWeight: 800 }}>{m.price}</span>
                            {m.status !== 'installed' && (
                                <button className="btn-premium" style={{ padding: '8px 16px', fontSize: '12px' }}>Details</button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
