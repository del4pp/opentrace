"use client";
import { useState, useEffect } from 'react';
import { useTranslation } from '../../../context/LanguageContext';
import { useResource } from '../../../context/ResourceContext';
import Link from 'next/link';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}`;

export default function FunnelComparison() {
    const { t } = useTranslation();
    const { selectedResource } = useResource();
    const [funnels, setFunnels] = useState([]);
    const [selection, setSelection] = useState({ f1: '', f2: '' });
    const [stats, setStats] = useState({ s1: null, s2: null });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchFunnels = async () => {
            if (!selectedResource) return;
            try {
                const res = await fetch(`${API_URL}/funnels?resource_id=${selectedResource.id}`);
                if (res.ok) setFunnels(await res.json());
            } catch (err) { console.error(err); }
        };
        fetchFunnels();
    }, [selectedResource]);

    const handleCompare = async () => {
        if (!selection.f1 || !selection.f2) return;
        setLoading(true);
        try {
            const [r1, r2] = await Promise.all([
                fetch(`${API_URL}/funnels/${selection.f1}/stats`),
                fetch(`${API_URL}/funnels/${selection.f2}/stats`)
            ]);
            if (r1.ok && r2.ok) {
                setStats({ s1: await r1.json(), s2: await r2.json() });
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const FunnelMiniView = ({ data, color }) => (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', flex: 1 }}>
            <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 800 }}>{data.funnel_name}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {data.steps.map((step, idx) => (
                    <div key={idx}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>
                            <span>{step.name}</span>
                            <span>{step.percentage}%</span>
                        </div>
                        <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${step.percentage}%`, background: color }}></div>
                        </div>
                    </div>
                ))}
            </div>
            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Conversion</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color }}>{data.conversion_rate}%</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Sessions</div>
                    <div style={{ fontSize: '20px', fontWeight: 800 }}>{data.total_sessions.toLocaleString()}</div>
                </div>
            </div>
        </div>
    );

    return (
        <div>
            <div style={{ marginBottom: '40px' }}>
                <Link href="/funnels" style={{ color: '#2563eb', textDecoration: 'none', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    ← Back to Funnels
                </Link>
                <h1 style={{ fontSize: '32px', fontWeight: 800 }}>{t('funnels.compare')}</h1>
                <p className="subtitle">Compare performance between two different user journeys</p>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', marginBottom: '40px' }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end' }}>
                    <div className="form-field" style={{ flex: 1, marginBottom: 0 }}>
                        <label>First Funnel</label>
                        <select className="select-lux" value={selection.f1} onChange={e => setSelection({ ...selection, f1: e.target.value })}>
                            <option value="">Select funnel...</option>
                            {funnels.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                    </div>
                    <div style={{ padding: '10px', fontWeight: 800, color: '#cbd5e1' }}>VS</div>
                    <div className="form-field" style={{ flex: 1, marginBottom: 0 }}>
                        <label>Second Funnel</label>
                        <select className="select-lux" value={selection.f2} onChange={e => setSelection({ ...selection, f2: e.target.value })}>
                            <option value="">Select funnel...</option>
                            {funnels.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                    </div>
                    <button className="btn-premium" onClick={handleCompare} disabled={loading || !selection.f1 || !selection.f2} style={{ height: '46px', padding: '0 32px' }}>
                        {loading ? 'Analyzing...' : 'Compare Performance'}
                    </button>
                </div>
            </div>

            {stats.s1 && stats.s2 ? (
                <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
                    <FunnelMiniView data={stats.s1} color="#3b82f6" />
                    <FunnelMiniView data={stats.s2} color="#8b5cf6" />
                </div>
            ) : (
                <div style={{ padding: '100px', textAlign: 'center', border: '2px dashed #e2e8f0', borderRadius: '16px', color: '#94a3b8' }}>
                    <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚔️</div>
                    <p>Select two funnels above to compare their conversion rates and drop-off patterns.</p>
                </div>
            )}
        </div>
    );
}
