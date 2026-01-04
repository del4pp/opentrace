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
                    <Link href="/funnels/compare" className="btn-premium" style={{ background: '#fff', color: '#0f172a', border: '1px solid #e2e8f0' }}>
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
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px', background: '#fff', borderRadius: '16px', border: '1px dashed #e2e8f0' }}>
                        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎯</div>
                        <h3>No funnels yet</h3>
                        <p style={{ color: '#64748b', marginBottom: '24px' }}>Define steps to track how users convert through your site.</p>
                        <Link href="/funnels/builder" className="btn-premium" style={{ display: 'inline-block' }}>{t('funnels.create')}</Link>
                    </div>
                ) : funnels.map((f) => (
                    <div key={f.id} className="card-stat" style={{ padding: '24px', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                            <div style={{ fontSize: '18px', fontWeight: 800 }}>{f.name}</div>
                            <button onClick={() => deleteFunnel(f.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.3 }}>✕</button>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>
                            <span>{f.steps_count} Steps</span>
                            <span>•</span>
                            <span>Created {new Date(f.created_at).toLocaleDateString()}</span>
                        </div>
                        <Link href={`/funnels/${f.id}`} className="btn-premium" style={{ width: '100%', textAlign: 'center', display: 'block' }}>
                            Analyze Results
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}
