"use client";
import { useState } from 'react';
import { useTranslation } from '../../../context/LanguageContext';
import { useResource } from '../../../context/ResourceContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}`;

export default function FunnelBuilder() {
    const { t } = useTranslation();
    const { selectedResource } = useResource();
    const router = useRouter();
    const [name, setName] = useState('');
    const [steps, setSteps] = useState([
        { name: 'Home Page', type: 'page_view', value: '/', order: 1 },
        { name: 'Product View', type: 'page_view', value: '/product', order: 2 }
    ]);
    const [saving, setSaving] = useState(false);

    const addStep = () => {
        setSteps([...steps, { name: '', type: 'page_view', value: '', order: steps.length + 1 }]);
    };

    const removeStep = (index) => {
        const newSteps = steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i + 1 }));
        setSteps(newSteps);
    };

    const updateStep = (index, field, val) => {
        const newSteps = [...steps];
        newSteps[index][field] = val;
        setSteps(newSteps);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!selectedResource) return alert("Select a resource first");
        if (steps.length < 2) return alert("Funnel must have at least 2 steps");

        setSaving(true);
        try {
            const res = await fetch(`${API_URL}/funnels`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    resource_id: selectedResource.id,
                    steps
                })
            });
            if (res.ok) {
                router.push('/funnels');
            } else {
                alert("Error saving funnel");
            }
        } catch (err) {
            console.error(err);
            alert("Connection error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '40px' }}>
                <Link href="/funnels" style={{ color: '#2563eb', textDecoration: 'none', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    ← Back to Funnels
                </Link>
                <h1 style={{ fontSize: '32px', fontWeight: 800 }}>{t('funnels.builder')}</h1>
                <p className="subtitle">Design your user journey step by step</p>
            </div>

            <form onSubmit={handleSave}>
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '32px', marginBottom: '24px' }}>
                    <div className="form-field">
                        <label>{t('funnels.fields.name')}</label>
                        <input
                            className="input-lux"
                            style={{ fontSize: '18px', fontWeight: 700 }}
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. Website Checkout Flow"
                            required
                        />
                    </div>
                </div>

                <div style={{ position: 'relative' }}>
                    {steps.map((step, index) => (
                        <div key={index} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', marginBottom: '20px', position: 'relative' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                background: '#0f172a',
                                color: '#fff',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                flexShrink: 0,
                                zIndex: 2
                            }}>
                                {index + 1}
                            </div>

                            <div style={{
                                background: '#fff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '16px',
                                padding: '24px',
                                flex: 1,
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr 1.5fr auto',
                                gap: '16px',
                                alignItems: 'end'
                            }}>
                                <div className="form-field" style={{ marginBottom: 0 }}>
                                    <label>{t('funnels.fields.stepName')}</label>
                                    <input className="input-lux" value={step.name} onChange={e => updateStep(index, 'name', e.target.value)} placeholder="e.g. View Cart" required />
                                </div>
                                <div className="form-field" style={{ marginBottom: 0 }}>
                                    <label>{t('funnels.fields.type')}</label>
                                    <select className="select-lux" value={step.type} onChange={e => updateStep(index, 'type', e.target.value)}>
                                        <option value="page_view">Page View</option>
                                        <option value="event">Custom Event</option>
                                    </select>
                                </div>
                                <div className="form-field" style={{ marginBottom: 0 }}>
                                    <label>{t('funnels.fields.value')}</label>
                                    <input className="input-lux" value={step.value} onChange={e => updateStep(index, 'value', e.target.value)} placeholder={step.type === 'page_view' ? '/checkout' : 'purchase'} required />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeStep(index)}
                                    style={{ background: '#fff1f2', color: '#e11d48', border: '1px solid #ffe4e6', borderRadius: '8px', padding: '10px', cursor: 'pointer' }}
                                    disabled={steps.length <= 2}
                                >
                                    🗑️
                                </button>
                            </div>

                            {index < steps.length - 1 && (
                                <div style={{
                                    position: 'absolute',
                                    left: '20px',
                                    top: '40px',
                                    bottom: '-20px',
                                    width: '2px',
                                    background: '#e2e8f0',
                                    zIndex: 1
                                }}></div>
                            )}
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', margin: '32px 0' }}>
                    <button type="button" onClick={addStep} style={{ background: '#f8fafc', border: '2px dashed #e2e8f0', borderRadius: '12px', padding: '16px 32px', color: '#64748b', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.target.style.borderColor = '#cbd5e1'} onMouseLeave={e => e.target.style.borderColor = '#e2e8f0'}>
                        + Add Step to Journey
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '16px', marginTop: '40px' }}>
                    <button type="submit" className="btn-premium" style={{ flex: 1, padding: '16px' }} disabled={saving}>
                        {saving ? 'Creating Funnel...' : 'Save & Build Funnel'}
                    </button>
                    <Link href="/funnels" className="btn-premium" style={{ background: '#fff', color: '#0f172a', border: '1px solid #e2e8f0', flex: 0.3, padding: '16px', textAlign: 'center', textDecoration: 'none' }}>
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}
