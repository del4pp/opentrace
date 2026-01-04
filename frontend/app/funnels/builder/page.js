"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '../../../context/LanguageContext';
import { useResource } from '../../../context/ResourceContext';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}`;

export default function FunnelBuilder() {
    const { t } = useTranslation();
    const router = useRouter();
    const { selectedResource } = useResource();
    const [name, setName] = useState('');
    const [steps, setSteps] = useState([
        { name: 'Initial Visit', type: 'page_view', value: '/', order: 1 },
        { name: 'Interest', type: 'event', value: 'click_pricing', order: 2 }
    ]);

    const addStep = () => {
        setSteps([...steps, { name: '', type: 'page_view', value: '', order: steps.length + 1 }]);
    };

    const removeStep = (idx) => {
        const newSteps = steps.filter((_, i) => i !== idx).map((s, i) => ({ ...s, order: i + 1 }));
        setSteps(newSteps);
    };

    const updateStep = (idx, field, val) => {
        const newSteps = [...steps];
        newSteps[idx][field] = val;
        setSteps(newSteps);
    };

    const saveFunnel = async () => {
        if (!name || steps.some(s => !s.name || !s.value)) {
            alert("Please fill all fields");
            return;
        }
        try {
            const res = await fetch(`${API_URL}/funnels`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, resource_id: selectedResource.id, steps })
            });
            if (res.ok) router.push('/funnels');
        } catch (err) { alert("Error saving funnel"); }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>{t('funnels.builder')}</h1>
            <p className="subtitle" style={{ marginBottom: '40px' }}>Mapping the golden path to conversion</p>

            <div style={{ background: '#fff', padding: '32px', borderRadius: '24px', border: '1px solid #e2e8f0', marginBottom: '40px' }}>
                <div className="form-field">
                    <label>{t('funnels.fields.name')}</label>
                    <input
                        className="input-lux"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Sales Funnel 2026"
                    />
                </div>

                <div style={{ marginTop: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Funnel Steps</h3>
                        <button onClick={addStep} style={{ background: '#f1f5f9', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>+ Add Step</button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {steps.map((step, idx) => (
                            <div key={idx} style={{ position: 'relative', display: 'grid', gridTemplateColumns: '40px 1fr 1fr 1fr 40px', gap: '12px', alignItems: 'end', background: '#f8fafc', padding: '20px', borderRadius: '16px' }}>
                                <div style={{ fontSize: '24px', fontWeight: 900, color: '#e2e8f0', marginBottom: '10px' }}>{idx + 1}</div>
                                <div className="form-field" style={{ marginBottom: 0 }}>
                                    <label style={{ fontSize: '11px' }}>{t('funnels.fields.stepName')}</label>
                                    <input className="input-lux" value={step.name} onChange={e => updateStep(idx, 'name', e.target.value)} placeholder="Entry" />
                                </div>
                                <div className="form-field" style={{ marginBottom: 0 }}>
                                    <label style={{ fontSize: '11px' }}>{t('funnels.fields.type')}</label>
                                    <select className="select-lux" value={step.type} onChange={e => updateStep(idx, 'type', e.target.value)}>
                                        <option value="page_view">Page View</option>
                                        <option value="event">Event Trigger</option>
                                    </select>
                                </div>
                                <div className="form-field" style={{ marginBottom: 0 }}>
                                    <label style={{ fontSize: '11px' }}>{t('funnels.fields.value')}</label>
                                    <input className="input-lux" value={step.value} onChange={e => updateStep(idx, 'value', e.target.value)} placeholder={step.type === 'page_view' ? '/pricing' : 'click_signup'} />
                                </div>
                                <button onClick={() => removeStep(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginBottom: '12px', opacity: 0.3 }}>✕</button>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ marginTop: '40px', display: 'flex', gap: '16px' }}>
                    <button onClick={() => router.push('/funnels')} className="btn-premium" style={{ background: '#fff', color: '#0f172a', border: '1px solid #e2e8f0', flex: 1 }}>
                        Cancel
                    </button>
                    <button onClick={saveFunnel} className="btn-premium" style={{ flex: 1 }}>
                        Create Funnel
                    </button>
                </div>
            </div>
        </div>
    );
}
