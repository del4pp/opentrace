"use client";
import { useState, useEffect } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { useResource } from '../../context/ResourceContext';
import HelpButton from '../../components/HelpButton';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}`;

const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return num.toLocaleString();
};

export default function EventsPage() {
    const { t } = useTranslation();
    const { selectedResource } = useResource();
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState([]);
    const [resources, setResources] = useState([]);
    const [eventActions, setEventActions] = useState([]);

    const [form, setForm] = useState({
        name: '',
        trigger: 'click',
        selector: '',
        resource_id: ''
    });

    const [actions, setActions] = useState([]);
    const [currentAction, setCurrentAction] = useState({
        action_type: 'facebook_conversion',
        pixel_id: '',
        access_token: '',
        custom_data: ''
    });

    const [deleteData, setDeleteData] = useState({ id: null, loading: false });
    const [deletePassword, setDeletePassword] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const fetchData = async () => {
        if (!selectedResource) return;
        setLoading(true);
        try {
            const [evRes, resRes, actionsRes] = await Promise.all([
                fetch(`${API_URL}/events?resource_id=${selectedResource.id}`),
                fetch(`${API_URL}/resources`),
                fetch(`${API_URL}/event-actions`)
            ]);
            if (evRes.ok) setEvents(await evRes.json());
            if (resRes.ok) setResources(await resRes.json());
            if (actionsRes.ok) setEventActions(await actionsRes.json());
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchData();
        if (selectedResource) {
            setForm(prev => ({ ...prev, resource_id: selectedResource.id }));
        }
    }, [selectedResource]);

    const addAction = () => {
        if (currentAction.action_type === 'facebook_conversion' && (!currentAction.pixel_id || !currentAction.access_token)) {
            alert('Please fill in Pixel ID and Access Token for Facebook');
            return;
        }
        if (currentAction.action_type === 'tiktok_conversion' && (!currentAction.pixel_code || !currentAction.access_token)) {
            alert('Please fill in Pixel Code and Access Token for TikTok');
            return;
        }

        const config = JSON.stringify({
            ...(currentAction.action_type === 'facebook_conversion' ? {
                pixel_id: currentAction.pixel_id,
                access_token: currentAction.access_token
            } : {
                pixel_code: currentAction.pixel_code,
                access_token: currentAction.access_token
            }),
            custom_data: currentAction.custom_data ? JSON.parse(currentAction.custom_data) : {}
        });

        setActions([...actions, {
            action_type: currentAction.action_type,
            config: config
        }]);

        // Reset form
        setCurrentAction({
            action_type: 'facebook_conversion',
            pixel_id: '',
            access_token: '',
            pixel_code: '',
            custom_data: ''
        });
    };

    const removeAction = (index) => {
        setActions(actions.filter((_, i) => i !== index));
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/events`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            if (res.ok) {
                const eventData = await res.json();

                // Create actions for this event
                for (const action of actions) {
                    await fetch(`${API_URL}/event-actions`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            event_id: eventData.id,
                            ...action
                        })
                    });
                }

                await fetchData();
                setShowModal(false);
                setForm({ name: '', trigger: 'click', selector: '', resource_id: selectedResource?.id || '' });
                setActions([]);
                setCurrentAction({
                    action_type: 'facebook_conversion',
                    pixel_id: '',
                    access_token: '',
                    pixel_code: '',
                    custom_data: ''
                });
            }
        } catch (err) { alert("Error saving event"); }
    };

    const openDelete = (id) => {
        setDeleteData({ ...deleteData, id });
        setDeletePassword('');
        setShowDeleteModal(true);
    };

    const handleDelete = async (e) => {
        e.preventDefault();
        setDeleteData({ ...deleteData, loading: true });
        try {
            const res = await fetch(`${API_URL}/events/${deleteData.id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: deletePassword })
            });
            if (res.ok) {
                await fetchData();
                setShowDeleteModal(false);
            } else {
                alert('Invalid password or error');
            }
        } catch (err) { alert("Error deleting"); }
        finally { setDeleteData({ ...deleteData, loading: false }); }
    };

    const getResourceName = (id) => {
        const r = resources.find(r => r.id === parseInt(id));
        return r ? r.name : 'Unknown';
    };

    const getEventActions = (eventId) => {
        return eventActions.filter(action => action.event_id === eventId && action.is_active);
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <h1 style={{ fontSize: '32px', fontWeight: 800 }}>{t('events.title')}</h1>
                        <HelpButton title={t('events.help.title')} content={t('events.help.content')} />
                    </div>
                    <p className="subtitle">{t('events.subtitle')}</p>
                </div>
                <button className="btn-premium" onClick={() => setShowModal(true)}>{t('events.add')}</button>
            </div>

            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Refreshing event regulations...</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Event Definition</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Trigger Type</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Selector / URL</th>
                                <th style={{ textAlign: 'center', padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Count</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Target Resource</th>
                                <th style={{ textAlign: 'center', padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Conversions</th>
                                <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No event regulations defined. Create your first tracker.</td>
                                </tr>
                            ) : events.map((ev) => (
                                <tr key={ev.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '20px 24px', fontWeight: 700 }}>{ev.name}</td>
                                    <td style={{ padding: '20px 24px' }}>
                                        <span style={{ fontSize: '12px', fontWeight: 600, color: ev.trigger === 'click' ? '#ef4444' : '#2563eb', background: ev.trigger === 'click' ? '#fef2f2' : '#eff6ff', padding: '4px 8px', borderRadius: '6px' }}>
                                            {ev.trigger.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ padding: '20px 24px', fontFamily: 'monospace', fontSize: '13px', color: '#64748b' }}>{ev.selector}</td>
                                    <td style={{ padding: '20px 24px', textAlign: 'center' }}>
                                        <b style={{ color: '#0f172a' }}>{formatNumber(ev.count || 0)}</b>
                                    </td>
                                    <td style={{ padding: '20px 24px', fontSize: '14px', color: '#64748b' }}>{getResourceName(ev.resource_id)}</td>
                                    <td style={{ padding: '20px 24px', textAlign: 'center' }}>
                                        {getEventActions(ev.id).length > 0 ? (
                                            <div style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
                                                {getEventActions(ev.id).map((action, idx) => (
                                                    <span key={idx} style={{
                                                        fontSize: '10px',
                                                        padding: '2px 6px',
                                                        borderRadius: '4px',
                                                        background: action.action_type === 'facebook_conversion' ? '#1877f2' : '#000000',
                                                        color: 'white',
                                                        fontWeight: 600
                                                    }}>
                                                        {action.action_type === 'facebook_conversion' ? 'FB' : 'TT'}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>—</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                                        <button
                                            onClick={() => openDelete(ev.id)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5, transition: 'opacity 0.2s' }}
                                            onMouseEnter={e => e.target.style.opacity = 1}
                                            onMouseLeave={e => e.target.style.opacity = 0.5}
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
                        <h2 style={{ marginBottom: '24px' }}>{t('events.add')}</h2>
                        <form onSubmit={handleAdd}>
                            <div className="form-field">
                                <label>Event Name</label>
                                <input className="input-lux" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Lead Form Submission" required />
                            </div>
                            <div className="form-field">
                                <label>Target Resource</label>
                                <select className="select-lux" value={form.resource_id} onChange={e => setForm({ ...form, resource_id: e.target.value })} required>
                                    <option value="">Choose resource...</option>
                                    {resources.map(r => (
                                        <option key={r.id} value={r.id}>{r.name} ({r.type})</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-field">
                                    <label>Trigger Type</label>
                                    <select className="select-lux" value={form.trigger} onChange={e => setForm({ ...form, trigger: e.target.value })}>
                                        <option value="click">Click</option>
                                        <option value="visit">Page View</option>
                                        <option value="submit">Form Submit</option>
                                    </select>
                                </div>
                                <div className="form-field">
                                    <label>Selector / Path</label>
                                    <input className="input-lux" value={form.selector} onChange={e => setForm({ ...form, selector: e.target.value })} placeholder=".btn-hero or /thanks" required />
                                </div>
                            </div>

                            <div style={{ marginTop: '24px', padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
                                <h4 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 600 }}>Conversion Actions</h4>

                                {actions.length > 0 && (
                                    <div style={{ marginBottom: '16px' }}>
                                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>Configured Actions:</div>
                                        {actions.map((action, index) => (
                                            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                <span style={{ fontSize: '11px', background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>
                                                    {action.action_type === 'facebook_conversion' ? 'Facebook' : 'TikTok'}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeAction(index)}
                                                    style={{ fontSize: '12px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                    <div className="form-field" style={{ marginBottom: 0 }}>
                                        <label style={{ fontSize: '12px' }}>Action Type</label>
                                        <select
                                            className="select-lux"
                                            value={currentAction.action_type}
                                            onChange={e => setCurrentAction({ ...currentAction, action_type: e.target.value })}
                                            style={{ fontSize: '12px', padding: '8px 12px' }}
                                        >
                                            <option value="facebook_conversion">Facebook CAPI</option>
                                            <option value="tiktok_conversion">TikTok CAPI</option>
                                        </select>
                                    </div>
                                    <div className="form-field" style={{ marginBottom: 0 }}>
                                        <label style={{ fontSize: '12px' }}>
                                            {currentAction.action_type === 'facebook_conversion' ? 'Pixel ID' : 'Pixel Code'}
                                        </label>
                                        <input
                                            className="input-lux"
                                            value={currentAction.action_type === 'facebook_conversion' ? currentAction.pixel_id : currentAction.pixel_code}
                                            onChange={e => setCurrentAction({
                                                ...currentAction,
                                                [currentAction.action_type === 'facebook_conversion' ? 'pixel_id' : 'pixel_code']: e.target.value
                                            })}
                                            placeholder={currentAction.action_type === 'facebook_conversion' ? '123456789' : 'ABC123DEF456'}
                                            style={{ fontSize: '12px', padding: '8px 12px' }}
                                        />
                                    </div>
                                </div>

                                <div className="form-field" style={{ marginBottom: '12px' }}>
                                    <label style={{ fontSize: '12px' }}>Access Token</label>
                                    <input
                                        className="input-lux"
                                        type="password"
                                        value={currentAction.access_token}
                                        onChange={e => setCurrentAction({ ...currentAction, access_token: e.target.value })}
                                        placeholder="EAA..."
                                        style={{ fontSize: '12px', padding: '8px 12px' }}
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={addAction}
                                    style={{ fontSize: '12px', padding: '6px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    + Add Action
                                </button>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                                <button type="button" className="btn-premium" style={{ background: '#fff', color: '#0f172a', border: '1px solid #e2e8f0', flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn-premium" style={{ flex: 1 }}>Define Regulation</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="modal-content" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
                        <h2 style={{ marginBottom: '16px', color: '#ef4444' }}>{t('modals.delete_confirm')}</h2>
                        <p style={{ marginBottom: '24px', color: '#64748b' }}>{t('modals.delete_message')}</p>
                        <form onSubmit={handleDelete}>
                            <div className="form-field">
                                <label>{t('modals.admin_password')}</label>
                                <input
                                    type="password"
                                    className="input-lux"
                                    value={deletePassword}
                                    onChange={e => setDeletePassword(e.target.value)}
                                    placeholder="Enter password..."
                                    required
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                                <button type="button" className="btn-premium" style={{ background: '#fff', color: '#0f172a', border: '1px solid #e2e8f0', flex: 1 }} onClick={() => setShowDeleteModal(false)}>{t('modals.cancel')}</button>
                                <button type="submit" className="btn-premium" style={{ flex: 1, background: '#ef4444', borderColor: '#ef4444', color: '#fff' }}>
                                    {deleteData.loading ? '...' : t('modals.delete')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
