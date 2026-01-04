"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from '../../context/LanguageContext';
import { useResource } from '../../context/ResourceContext';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}`;

export default function FunnelsPage() {
    const { t } = useTranslation();
    const { selectedResource } = useResource();
    const [funnels, setFunnels] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const deleteFunnel = async (id) => {
        if (!confirm("Delete this funnel?")) return;
        try {
            const res = await fetch(`${API_URL}/funnels/${id}`, { method: 'DELETE' });
            if (res.ok) fetchFunnels();
        } catch (err) { alert("Error deleting funnel"); }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <h1 style={{ fontSize: '32px', fontWeight: 800 }}>{t('funnels.title')}</h1>
                        <HelpButton title={t('funnels.help.title')} content={t('funnels.help.content')} />
                    </div>
                    <p className="subtitle">{t('funnels.subtitle')}</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <Link href="/funnels/compare" className="btn-secondary">
                        {t('funnels.compare')}
                    </Link>
                    <Link href="/funnels/builder" className="btn-premium">
                        {t('funnels.create')}
                    </Link>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                {loading ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px', color: '#64748b' }}>Calculating pathways...</div>
                ) : funnels.length === 0 ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px', background: 'var(--bg-subtle)', borderRadius: '24px', border: '1px dashed var(--border)' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '12px' }}>No conversion funnels yet</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px' }}>Define sequential steps to track how users convert through your acquisition paths.</p>
                        <Link href="/funnels/builder" className="btn-premium">{t('funnels.create')}</Link>
                    </div>
                ) : funnels.map((f) => (
                    <div key={f.id} className="card-stat" style={{ padding: '32px', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                            <div style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '-0.02em' }}>{f.name}</div>
                            <button
                                onClick={() => deleteFunnel(f.id)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: '#ef4444', opacity: 0.4, transition: '0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                                onMouseLeave={e => e.currentTarget.style.opacity = 0.4}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                            </button>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '32px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            <span>{f.steps_count} Steps</span>
                            <span>•</span>
                            <span>{new Date(f.created_at).toLocaleDateString()}</span>
                        </div>
                        <Link href={`/funnels/${f.id}`} className="btn-premium" style={{ width: '100%' }}>
                            Analyze Results
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}
