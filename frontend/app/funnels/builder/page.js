"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '../../../context/LanguageContext';
import { useResource } from '../../../context/ResourceContext';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}`;

export default function FunnelBuilder() {
    const { t } = useTranslation();
    const router = useRouter();
    const { selectedResource } = useResource();
    const [name, setName] = useState('');
    const [events, setEvents] = useState([]);
    const [steps, setSteps] = useState([
        { name: 'Initial Visit', type: 'page_view', value: '/', order: 1 },
        { name: 'Interest', type: 'event', value: '', order: 2 }
    ]);

    useEffect(() => {
        const fetchEvents = async () => {
            if (!selectedResource) return;
            try {
                const res = await fetch(`${API_URL}/events?resource_id=${selectedResource.id}`);
                if (res.ok) setEvents(await res.json());
            } catch (err) { console.error(err); }
        };
        fetchEvents();
    }, [selectedResource]);

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
        // More flexible validation: value can be 0 or empty only if it's the conversion_value
        if (!name || steps.some(s => !s.name || s.type === '' || (s.type === 'page_view' && s.value === ''))) {
            alert("Please fill all required fields (Step Name and URL/Event)");
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
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
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
                            <div key={idx} style={{
                                position: 'relative',
                                display: 'grid',
                                gridTemplateColumns: '40px 1.5fr 1fr 1.5fr 100px 80px 40px',
                                gap: '16px',
                                alignItems: 'end',
                                background: step.is_goal ? 'rgba(37, 99, 235, 0.05)' : 'var(--bg-subtle)',
                                padding: '24px',
                                borderRadius: '16px',
                                border: step.is_goal ? '1px solid #2563eb' : '1px solid var(--border)'
                            }}>
                                <div style={{ fontSize: '24px', fontWeight: 900, color: step.is_goal ? '#2563eb' : 'var(--border)', display: 'flex', alignItems: 'center', height: '44px' }}>{idx + 1}</div>

                                <div className="form-field" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column' }}>
                                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 700, textTransform: 'uppercase', height: '14px' }}>{t('funnels.fields.stepName')}</label>
                                    <input className="input-lux" style={{ height: '44px', marginBottom: 0 }} value={step.name} onChange={e => updateStep(idx, 'name', e.target.value)} placeholder="Entry" />
                                </div>

                                <div className="form-field" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column' }}>
                                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 700, textTransform: 'uppercase', height: '14px' }}>{t('funnels.fields.type')}</label>
                                    <select className="select-lux" style={{ height: '44px', marginBottom: 0 }} value={step.type} onChange={e => updateStep(idx, 'type', e.target.value)}>
                                        <option value="page_view">Page View</option>
                                        <option value="event">Event Trigger</option>
                                    </select>
                                </div>

                                <div className="form-field" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column' }}>
                                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 700, textTransform: 'uppercase', height: '14px' }}>{t('funnels.fields.value')}</label>
                                    {step.type === 'page_view' ? (
                                        <input className="input-lux" style={{ height: '44px', marginBottom: 0 }} value={step.value} onChange={e => updateStep(idx, 'value', e.target.value)} placeholder="/pricing" />
                                    ) : (
                                        <select className="select-lux" style={{ height: '44px', marginBottom: 0 }} value={step.value} onChange={e => updateStep(idx, 'value', e.target.value)}>
                                            <option value="">Select Event...</option>
                                            {events.map(ev => (
                                                <option key={ev.id} value={ev.name}>{ev.name}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                <div className="form-field" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column' }}>
                                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 700, textTransform: 'uppercase', height: '14px' }}>{t('funnels.fields.stepValue')}</label>
                                    <input
                                        type="number"
                                        className="input-lux"
                                        style={{ height: '44px', marginBottom: 0, paddingRight: '8px' }}
                                        value={step.conversion_value || 0}
                                        onChange={e => updateStep(idx, 'conversion_value', parseInt(e.target.value) || 0)}
                                        placeholder="0"
                                    />
                                </div>

                                <div className="form-field" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 700, textTransform: 'uppercase', height: '14px' }}>{t('funnels.fields.isGoal')}</label>
                                    <div style={{ height: '44px', display: 'flex', alignItems: 'center' }}>
                                        <input
                                            type="checkbox"
                                            style={{ width: '22px', height: '22px', cursor: 'pointer', marginBottom: 0 }}
                                            checked={step.is_goal || false}
                                            onChange={e => {
                                                const newSteps = steps.map((s, i) => ({ ...s, is_goal: i === idx ? e.target.checked : false }));
                                                setSteps(newSteps);
                                            }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'center', height: '44px', alignItems: 'center' }}>
                                    <button onClick={() => removeStep(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.3, fontSize: '20px', color: 'var(--text)' }}>✕</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ marginTop: '40px', display: 'flex', gap: '16px' }}>
                    <button onClick={() => router.push('/funnels')} className="btn-secondary" style={{ flex: 1 }}>
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
