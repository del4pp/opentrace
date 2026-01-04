"use client";
import { useState, useEffect } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { useResource } from '../../context/ResourceContext';
import HelpButton from '../../components/HelpButton';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}`;

export default function CampaignsPage() {
    const { t } = useTranslation();
    const { selectedResource } = useResource();
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [campaigns, setCampaigns] = useState([]);
    const [bots, setBots] = useState([]);

    const [form, setForm] = useState({
        name: '',
        source: '',
        medium: 'cpc',
        campaign: '',
        content: '',
        term: '',
        is_bot_link: false,
        bot_id: ''
    });

    // Delete state
    const [deleteData, setDeleteData] = useState({ id: null, loading: false });
    const [deletePassword, setDeletePassword] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const fetchCampaigns = async () => {
        if (!selectedResource) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/campaigns?resource_id=${selectedResource.id}`);
            if (res.ok) setCampaigns(await res.json());
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const fetchBots = async () => {
        try {
            const res = await fetch(`${API_URL}/resources`);
            if (res.ok) {
                const data = await res.json();
                setBots(data.filter(r => r.type === 'Telegram Bot'));
            }
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        fetchCampaigns();
        fetchBots();
    }, [selectedResource]);

    const generateRandomString = (length) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        const slug = generateRandomString(8);
        const bot_start_param = form.is_bot_link ? generateRandomString(12) : null;

        const payload = {
            ...form,
            slug: slug,
            bot_start_param: bot_start_param,
            resource_id: selectedResource?.id
        };

        try {
            const res = await fetch(`${API_URL}/campaigns`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                await fetchCampaigns();
                setShowModal(false);
                setForm({ name: '', source: '', medium: 'cpc', campaign: '', content: '', term: '', is_bot_link: false, bot_id: '' });
            }
        } catch (err) {
            alert("Error saving campaign");
        }
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
            const res = await fetch(`${API_URL}/campaigns/${deleteData.id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: deletePassword })
            });
            if (res.ok) {
                await fetchCampaigns();
                setShowDeleteModal(false);
            } else {
                alert('Invalid password or error');
            }
        } catch (err) { alert("Error deleting"); }
        finally { setDeleteData({ ...deleteData, loading: false }); }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <h1 style={{ fontSize: '32px', fontWeight: 800 }}>{t('campaigns.title')}</h1>
                        <HelpButton title={t('campaigns.help.title')} content={t('campaigns.help.content')} />
                    </div>
                    <p className="subtitle">{t('campaigns.subtitle')}</p>
                </div>
                <button className="btn-premium" onClick={() => setShowModal(true)}>
                    {t('campaigns.create')}
                </button>
            </div>

            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Syncing data...</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Campaign Name</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Parameters</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Short URL</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Integration</th>
                                <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {campaigns.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No campaigns found. Start tracking by creating your first link.</td>
                                </tr>
                            ) : campaigns.map((item) => (
                                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '20px 24px' }}>
                                        <div style={{ fontWeight: 700 }}>{item.name}</div>
                                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>{item.campaign}</div>
                                    </td>
                                    <td style={{ padding: '20px 24px' }}>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            <span style={{ fontSize: '10px', background: '#f1f5f9', padding: '3px 6px', borderRadius: '4px' }}>{item.source}</span>
                                            <span style={{ fontSize: '10px', background: '#f1f5f9', padding: '3px 6px', borderRadius: '4px' }}>{item.medium}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '20px 24px', color: '#2563eb', fontSize: '13px', fontFamily: 'monospace' }}>
                                        ot.io/l/{item.slug}
                                    </td>
                                    <td style={{ padding: '20px 24px' }}>
                                        {item.is_bot_link ? (
                                            <div style={{ fontSize: '12px', color: '#059669', fontStyle: 'italic' }}>
                                                Bot: {item.bot_id} <br />
                                                param: /start={item.bot_start_param}
                                            </div>
                                        ) : (
                                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Web Only</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                                        <button
                                            onClick={() => openDelete(item.id)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5, transition: 'opacity 0.2s', fontSize: '16px' }}
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
                    <div className="modal-content" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
                        <h2 style={{ marginBottom: '24px' }}>{t('campaigns.create')}</h2>
                        <form onSubmit={handleCreate}>
                            <div className="form-field">
                                <label>Internal Reference Name</label>
                                <input className="input-lux" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. FB Winter Sale Influencer" required />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-field">
                                    <label>UTM Source</label>
                                    <input className="input-lux" value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} placeholder="facebook, newsletter..." required />
                                </div>
                                <div className="form-field">
                                    <label>UTM Medium</label>
                                    <input className="input-lux" value={form.medium} onChange={e => setForm({ ...form, medium: e.target.value })} placeholder="cpc, bio, email..." required />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                                <div className="form-field">
                                    <label>UTM Campaign</label>
                                    <input className="input-lux" value={form.campaign} onChange={e => setForm({ ...form, campaign: e.target.value })} placeholder="promo_2025" required />
                                </div>
                                <div className="form-field">
                                    <label>UTM Content</label>
                                    <input className="input-lux" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="ad_v1" />
                                </div>
                                <div className="form-field">
                                    <label>UTM Term</label>
                                    <input className="input-lux" value={form.term} onChange={e => setForm({ ...form, term: e.target.value })} placeholder="analytics_tools" />
                                </div>
                            </div>

                            <div style={{ marginTop: '20px', padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: form.is_bot_link ? '16px' : 0 }}>
                                    <input
                                        type="checkbox"
                                        id="is_bot"
                                        checked={form.is_bot_link}
                                        onChange={e => setForm({ ...form, is_bot_link: e.target.checked })}
                                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                    />
                                    <label htmlFor="is_bot" style={{ margin: 0, textTransform: 'none', color: '#0f172a', fontWeight: 600 }}>Create Deep-link for Telegram Bot</label>
                                </div>

                                {form.is_bot_link && (
                                    <div className="form-field" style={{ marginBottom: 0 }}>
                                        <label>Select Target Bot</label>
                                        {bots.length > 0 ? (
                                            <select className="select-lux" value={form.bot_id} onChange={e => setForm({ ...form, bot_id: e.target.value })} required>
                                                <option value="">Choose bot...</option>
                                                {bots.map(b => (
                                                    <option key={b.id} value={b.uid}>@{b.uid} ({b.name})</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <p style={{ fontSize: '12px', color: '#f43f5e' }}>No bots found in Resources. Please add a Bot first.</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                                <button type="button" className="btn-premium" style={{ background: '#fff', color: '#0f172a', border: '1px solid #e2e8f0', flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn-premium" style={{ flex: 1 }}>Deploy Campaign Link</button>
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
