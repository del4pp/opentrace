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
                    <h1 style={{ fontSize: '32px', fontWeight: 800 }}>{t('funnels.title')}</h1>
                    <p className="subtitle">{t('funnels.subtitle')}</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <Link href="/funnels/compare" className="btn-premium" style={{ background: 'var(--bg)', color: 'var(--text) !important', border: '1px solid var(--border)' }}>
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
                            <button onClick={() => deleteFunnel(f.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.3, fontSize: '18px', color: 'var(--text)' }}>✕</button>
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
