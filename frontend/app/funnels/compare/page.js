"use client";
import { useState, useEffect } from 'react';
import { useTranslation } from '../../../context/LanguageContext';
import { useResource } from '../../../context/ResourceContext';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}`;

export default function FunnelComparison() {
    const { t } = useTranslation();
    const { selectedResource } = useResource();
    const [funnels, setFunnels] = useState([]);
    const [selectedFunnels, setSelectedFunnels] = useState([null, null]);
    const [stats, setStats] = useState([null, null]);

    useEffect(() => {
        const fetchFunnels = async () => {
            if (!selectedResource) return;
            const res = await fetch(`${API_URL}/funnels?resource_id=${selectedResource.id}`);
            if (res.ok) setFunnels(await res.json());
        };
        fetchFunnels();
    }, [selectedResource]);

    const handleSelect = async (val, idx) => {
        const newSelected = [...selectedFunnels];
        newSelected[idx] = val;
        setSelectedFunnels(newSelected);

        if (val) {
            const res = await fetch(`${API_URL}/funnels/${val}/stats`);
            if (res.ok) {
                const newStats = [...stats];
                newStats[idx] = await res.json();
                setStats(newStats);
            }
        }
    };

    return (
        <div>
            <div style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: 800 }}>{t('funnels.compare')}</h1>
                <p className="subtitle">Head-to-head performance analysis</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                {[0, 1].map(i => (
                    <div key={i}>
                        <div className="form-field">
                            <label>Select Funnel {i + 1}</label>
                            <select className="select-lux" onChange={e => handleSelect(e.target.value, i)}>
                                <option value="">--- Choose Funnel ---</option>
                                {funnels.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                            </select>
                        </div>

                        {stats[i] && (
                            <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '32px', marginTop: '24px' }}>
                                <div style={{ fontSize: '18px', fontWeight: 800, marginBottom: '24px' }}>{stats[i].funnel_name}</div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>Conversion</div>
                                        <div style={{ fontSize: '24px', fontWeight: 800, color: '#2563eb' }}>{stats[i].overall_conversion}%</div>
                                    </div>
                                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>TTC</div>
                                        <div style={{ fontSize: '24px', fontWeight: 800 }}>{stats[i].avg_ttc}s</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {stats[i].steps.map((s, idx) => (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                            <span style={{ color: '#64748b' }}>Step {idx + 1}: {s.name}</span>
                                            <span style={{ fontWeight: 700 }}>{s.conversion}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
