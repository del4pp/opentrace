"use client";
import { useState, useEffect } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { useResource } from '../../context/ResourceContext';
import HelpButton from '../../components/HelpButton';

export default function SegmentsPage() {
    const { t } = useTranslation();
    const { selectedResource } = useResource();
    const [segments, setSegments] = useState([]);
    const [isBuilderOpen, setIsBuilderOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewResult, setPreviewResult] = useState(null);

    // Segment Form State
    const [segName, setSegName] = useState('');
    const [segConfig, setSegConfig] = useState({
        logic: 'AND',
        conditions: [
            { type: 'property', field: 'source', operator: '=', value: '' }
        ]
    });

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

    useEffect(() => {
        if (selectedResource) {
            fetchSegments();
        }
    }, [selectedResource]);

    const fetchSegments = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/segments?resource_id=${selectedResource.id}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
            });
            if (res.ok) setSegments(await res.json());
        } catch (err) {
            console.error("Failed to fetch segments:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCondition = () => {
        setSegConfig({
            ...segConfig,
            conditions: [...segConfig.conditions, { type: 'property', field: 'source', operator: '=', value: '' }]
        });
    };

    const handleRemoveCondition = (idx) => {
        const newConds = segConfig.conditions.filter((_, i) => i !== idx);
        setSegConfig({ ...segConfig, conditions: newConds });
    };

    const updateCondition = (idx, updates) => {
        const newConds = [...segConfig.conditions];
        newConds[idx] = { ...newConds[idx], ...updates };
        setSegConfig({ ...segConfig, conditions: newConds });
    };

    const handleSave = async () => {
        if (!segName) return alert("Enter segment name");
        try {
            const res = await fetch(`${API_URL}/segments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
                body: JSON.stringify({
                    name: segName,
                    resource_id: selectedResource.id,
                    config: segConfig
                })
            });
            if (res.ok) {
                setIsBuilderOpen(false);
                setSegName('');
                setSegConfig({ logic: 'AND', conditions: [] });
                fetchSegments();
            }
        } catch (err) {
            console.error("Save error:", err);
        }
    };

    const handlePreview = async (segId) => {
        setPreviewLoading(true);
        try {
            const res = await fetch(`${API_URL}/segments/${segId}/preview`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
            });
            if (res.ok) setPreviewResult(await res.json());
        } catch (err) {
            console.error("Preview error:", err);
        } finally {
            setPreviewLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure?")) return;
        try {
            const res = await fetch(`${API_URL}/segments/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
            });
            if (res.ok) fetchSegments();
        } catch (err) {
            console.error("Delete error:", err);
        }
    };

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>
                        {t('segments.title')} <HelpButton section="segments" />
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '14px' }}>{t('segments.subtitle')}</p>
                </div>
                {!isBuilderOpen && (
                    <button
                        onClick={() => setIsBuilderOpen(true)}
                        style={{ padding: '10px 20px', background: '#0f172a', color: '#fff', borderRadius: '12px', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                    >
                        + {t('segments.create')}
                    </button>
                )}
            </div>

            {isBuilderOpen ? (
                <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', maxWidth: '800px' }}>
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                            {t('segments.name')}
                        </label>
                        <input
                            type="text"
                            value={segName}
                            onChange={(e) => setSegName(e.target.value)}
                            placeholder="e.g. Loyal Telegram Users"
                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '16px' }}
                        />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <label style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                                {t('segments.logic')}
                            </label>
                            <select
                                value={segConfig.logic}
                                onChange={(e) => setSegConfig({ ...segConfig, logic: e.target.value })}
                                style={{ padding: '4px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            >
                                <option value="AND">AND</option>
                                <option value="OR">OR</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {segConfig.conditions.map((cond, idx) => (
                                <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                                    <select
                                        value={cond.type}
                                        onChange={(e) => updateCondition(idx, { type: e.target.value })}
                                        style={{ padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                    >
                                        <option value="property">Property</option>
                                        <option value="event">Event</option>
                                    </select>

                                    {cond.type === 'property' ? (
                                        <>
                                            <select
                                                value={cond.field}
                                                onChange={(e) => updateCondition(idx, { field: e.target.value })}
                                                style={{ padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                            >
                                                <option value="source">Source</option>
                                                <option value="country">Country</option>
                                                <option value="device">Device</option>
                                            </select>
                                            <select
                                                value={cond.operator}
                                                onChange={(e) => updateCondition(idx, { operator: e.target.value })}
                                                style={{ padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                            >
                                                <option value="=">=</option>
                                                <option value="!=">!=</option>
                                            </select>
                                            <input
                                                type="text"
                                                value={cond.value}
                                                onChange={(e) => updateCondition(idx, { value: e.target.value })}
                                                placeholder="value..."
                                                style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <input
                                                type="text"
                                                value={cond.event}
                                                onChange={(e) => updateCondition(idx, { event: e.target.value })}
                                                placeholder="event name..."
                                                style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                            />
                                            <select
                                                value={cond.operator}
                                                onChange={(e) => updateCondition(idx, { operator: e.target.value })}
                                                style={{ padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                            >
                                                <option value="HAPPENED">Happened</option>
                                                <option value="NOT_HAPPENED">Not Happened</option>
                                            </select>
                                            {cond.operator === 'NOT_HAPPENED' && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontSize: '12px' }}>within</span>
                                                    <input
                                                        type="number"
                                                        value={cond.within_days || 3}
                                                        onChange={(e) => updateCondition(idx, { within_days: parseInt(e.target.value) })}
                                                        style={{ width: '50px', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                                    />
                                                    <span style={{ fontSize: '12px' }}>days</span>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    <button
                                        onClick={() => handleRemoveCondition(idx)}
                                        style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer', padding: '8px' }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleAddCondition}
                            style={{ marginTop: '16px', padding: '8px 16px', background: '#f1f5f9', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                        >
                            + {t('segments.addCondition')}
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '32px', borderTop: '1px solid #f1f5f9', paddingTop: '24px' }}>
                        <button
                            onClick={handleSave}
                            style={{ padding: '10px 24px', background: '#2563eb', color: '#fff', borderRadius: '12px', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                        >
                            Save Segment
                        </button>
                        <button
                            onClick={() => setIsBuilderOpen(false)}
                            style={{ padding: '10px 24px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                    {loading ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading segments...</div>
                    ) : segments.length > 0 ? (
                        segments.map(seg => (
                            <div key={seg.id} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px', transition: 'box-shadow 0.2s' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>{seg.name}</h3>
                                        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
                                            Created {new Date(seg.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(seg.id)}
                                        style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer', fontSize: '12px' }}
                                    >
                                        Delete
                                    </button>
                                </div>

                                <div style={{ fontSize: '13px', color: '#475569', marginBottom: '20px', padding: '12px', background: '#f8fafc', borderRadius: '12px' }}>
                                    {seg.config.conditions.length} conditions with {seg.config.logic} logic
                                </div>

                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => handlePreview(seg.id)}
                                        style={{ flex: 1, padding: '8px', background: '#f1f5f9', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                                    >
                                        Run Analysis
                                    </button>
                                </div>

                                {previewLoading && <div style={{ marginTop: '12px', fontSize: '12px', color: '#64748b' }}>Computing segment...</div>}

                                {previewResult && (
                                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                                        <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>{previewResult.count.toLocaleString()}</div>
                                        <div style={{ fontSize: '12px', color: '#64748b' }}>{t('segments.matches')}</div>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div style={{ gridColumn: '1/-1', padding: '60px', textAlign: 'center', background: '#fff', borderRadius: '24px', border: '2px dashed #e2e8f0' }}>
                            <div style={{ fontSize: '40px', marginBottom: '16px' }}>👥</div>
                            <h3 style={{ margin: 0, fontWeight: 700 }}>No segments yet</h3>
                            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Create groups based on user actions and properties.</p>
                            <button
                                onClick={() => setIsBuilderOpen(true)}
                                style={{ padding: '10px 24px', background: '#3b82f6', color: '#fff', borderRadius: '12px', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                            >
                                Start Building
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
