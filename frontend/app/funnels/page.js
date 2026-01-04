"use client";
import { useState, useEffect } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { useResource } from '../../context/ResourceContext';
import HelpButton from '../../components/HelpButton';
import Link from 'next/link';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}`;

export default function FunnelsPage() {
    const { t } = useTranslation();
    const { selectedResource } = useResource();
    const [loading, setLoading] = useState(true);
    const [funnels, setFunnels] = useState([]);

    const fetchFunnels = async () => {
        if (!selectedResource) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/funnels?resource_id=${selectedResource.id}`);
            if (res.ok) setFunnels(await res.json());
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchFunnels();
    }, [selectedResource]);

    const handleDelete = async (id) => {
        if (!window.confirm(t('modals.delete_confirm'))) return;
        try {
            const res = await fetch(`${API_URL}/funnels/${id}`, { method: 'DELETE' });
            if (res.ok) fetchFunnels();
        } catch (err) { console.error(err); }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <h1 style={{ fontSize: '32px', fontWeight: 800 }}>{t('funnels.title')}</h1>
                        <HelpButton title={t('funnels.title')} content={t('funnels.subtitle')} />
                    </div>
                    <p className="subtitle">{t('funnels.subtitle')}</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <Link href="/funnels/compare" className="btn-premium" style={{ background: '#fff', color: '#0f172a', border: '1px solid #e2e8f0' }}>
                        {t('funnels.compare')}
                    </Link>
                    <Link href="/funnels/builder" className="btn-premium">
                        {t('funnels.create')}
                    </Link>
                </div>
            </div>

            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
                        <div className="spinner" style={{ marginBottom: '16px' }}></div>
                        Syncing Funnels...
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{t('funnels.fields.name')}</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{t('funnels.stats.steps')}</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Created At</th>
                                <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {funnels.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
                                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
                                        <div>No funnels created yet. Define your first user journey to start tracking conversions.</div>
                                    </td>
                                </tr>
                            ) : funnels.map((item) => (
                                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '20px 24px' }}>
                                        <Link href={`/funnels/${item.id}`} style={{ fontWeight: 800, color: '#0f172a', textDecoration: 'none' }}>
                                            {item.name}
                                        </Link>
                                    </td>
                                    <td style={{ padding: '20px 24px' }}>
                                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                            {item.steps.map((s, idx) => (
                                                <span key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <span style={{ fontSize: '10px', background: s.type === 'event' ? '#eff6ff' : '#f8fafc', color: s.type === 'event' ? '#2563eb' : '#64748b', padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                                        {s.name}
                                                    </span>
                                                    {idx < item.steps.length - 1 && <span style={{ color: '#cbd5e1' }}>→</span>}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td style={{ padding: '20px 24px', color: '#64748b', fontSize: '13px' }}>
                                        {new Date(item.created_at).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                            <Link href={`/funnels/${item.id}`} style={{ textDecoration: 'none', fontSize: '14px', color: '#2563eb', fontWeight: 600 }}>Analyze</Link>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5, transition: 'opacity 0.2s', fontSize: '16px' }}
                                                onMouseEnter={e => e.target.style.opacity = 1}
                                                onMouseLeave={e => e.target.style.opacity = 0.5}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
