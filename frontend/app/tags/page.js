"use client";
import { useState, useEffect } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { useResource } from '../../context/ResourceContext';
import HelpButton from '../../components/HelpButton';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}`;

export default function TagsPage() {
    const { t } = useTranslation();
    const { selectedResource } = useResource();
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [tags, setTags] = useState([]);

    const [form, setForm] = useState({ name: '', provider: 'Custom', code: '', is_active: true });

    // Delete state
    const [deleteData, setDeleteData] = useState({ id: null, loading: false });
    const [deletePassword, setDeletePassword] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const fetchTags = async () => {
        if (!selectedResource) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/tags?resource_id=${selectedResource.id}`);
            if (res.ok) setTags(await res.json());
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchTags();
    }, [selectedResource]);

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/tags`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, resource_id: selectedResource?.id })
            });
            if (res.ok) {
                await fetchTags();
                setShowModal(false);
                setForm({ name: '', provider: 'Custom', code: '', is_active: true });
            }
        } catch (err) { alert("Error saving tag"); }
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
            const res = await fetch(`${API_URL}/tags/${deleteData.id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: deletePassword })
            });
            if (res.ok) {
                await fetchTags();
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
                        <h1 style={{ fontSize: '32px', fontWeight: 800 }}>{t('tags.title')}</h1>
                        <HelpButton title={t('tags.help.title')} content={t('tags.help.content')} />
                    </div>
                    <p className="subtitle">{t('tags.subtitle')}</p>
                </div>
                <button className="btn-premium" onClick={() => setShowModal(true)}>{t('tags.add')}</button>
            </div>

            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Establishing container sync...</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Tag Name</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Provider</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Status</th>
                                <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tags.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No tags found. Add your first pixel or tracking script.</td>
                                </tr>
                            ) : tags.map((tag) => (
                                <tr key={tag.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '20px 24px' }}>
                                        <div style={{ fontWeight: 700 }}>{tag.name}</div>
                                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', fontFamily: 'monospace' }}>Global Injection</div>
                                    </td>
                                    <td style={{ padding: '20px 24px' }}>
                                        <span style={{ fontSize: '12px', color: '#64748b' }}>{tag.provider}</span>
                                    </td>
                                    <td style={{ padding: '20px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '8px', height: '8px', background: tag.is_active ? '#10b981' : '#94a3b8', borderRadius: '50%' }}></div>
                                            <span style={{ fontSize: '13px', fontWeight: 600 }}>{tag.is_active ? 'Active' : 'Disabled'}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                                        <button
                                            onClick={() => openDelete(tag.id)}
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

            <div style={{ marginTop: '40px', padding: '32px', background: '#0f172a', borderRadius: '16px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <h3 style={{ color: '#fff', marginBottom: '12px' }}>{t('tags.snippet.title')}</h3>
                    <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px' }}>{t('tags.snippet.description')}</p>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'monospace', fontSize: '13px', color: '#34d399' }}>
                        &lt;script src="{API_URL.replace('/api', '')}/sdk/t.js?id=OT-CONTAINER-PRIME" async&gt;&lt;/script&gt;
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
                        <h2 style={{ marginBottom: '24px' }}>{t('tags.add')}</h2>
                        <form onSubmit={handleAdd}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-field">
                                    <label>Tag Name</label>
                                    <input className="input-lux" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Meta Pixel" required />
                                </div>
                                <div className="form-field">
                                    <label>Provider</label>
                                    <select className="select-lux" value={form.provider} onChange={e => setForm({ ...form, provider: e.target.value })}>
                                        <option value="Custom">Custom Code</option>
                                        <option value="Meta">Meta (Facebook)</option>
                                        <option value="Google">Google</option>
                                        <option value="TikTok">TikTok</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-field">
                                <label>Script Body (HTML/JS)</label>
                                <textarea
                                    className="input-lux"
                                    style={{ minHeight: '150px', paddingTop: '12px', fontFamily: 'monospace' }}
                                    value={form.code}
                                    onChange={e => setForm({ ...form, code: e.target.value })}
                                    placeholder="<!-- Pixel code here -->"
                                    required
                                ></textarea>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                                <button type="button" className="btn-premium" style={{ background: '#fff', color: '#0f172a', border: '1px solid #e2e8f0', flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn-premium" style={{ flex: 1 }}>Save Tag</button>
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
