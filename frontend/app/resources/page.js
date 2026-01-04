"use client";
import { useState, useEffect } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import HelpButton from '../../components/HelpButton';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}`;

export default function ResourcesPage() {
    const { t } = useTranslation();
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSetupModal, setShowSetupModal] = useState(false);
    const [selectedResource, setSelectedResource] = useState(null);
    const [deletePassword, setDeletePassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [resources, setResources] = useState([]);

    const [newResource, setNewResource] = useState({
        name: '',
        type: 'Website',
        botToken: '',
        bundleId: ''
    });

    const [editResource, setEditResource] = useState({
        id: null,
        name: '',
        status: 'Active'
    });

    const fetchResources = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const headers = {
                'Content-Type': 'application/json'
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch(`${API_URL}/resources`, { headers });
            if (res.ok) {
                const data = await res.json();
                setResources(data);
            } else if (res.status === 401) {
                localStorage.removeItem('user');
                localStorage.removeItem('access_token');
                window.location.href = '/login';
            } else {
                console.error("Failed to fetch resources:", res.status);
            }
        } catch (err) {
            console.error("Failed to fetch resources:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResources();
    }, []);

    const generateUid = (type) => {
        let prefix = 'ot_web_';
        if (type === 'Telegram Bot') prefix = 'ot_bot_';
        if (type === 'Mobile Application') prefix = 'ot_app_';
        return prefix + Math.random().toString(36).substring(2, 7);
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        const uid = generateUid(newResource.type);

        const payload = {
            name: newResource.name,
            type: newResource.type,
            uid: uid,
            token: newResource.type === 'Telegram Bot' ? newResource.botToken : (newResource.type === 'Mobile Application' ? newResource.bundleId : null),
            status: 'Active'
        };

        try {
            const res = await fetch(`${API_URL}/resources`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                await fetchResources();
                setShowModal(false);
                setNewResource({ name: '', type: 'Website', botToken: '', bundleId: '' });
            }
        } catch (err) {
            alert("Error saving resource");
        }
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/resources/${editResource.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: editResource.name,
                    status: editResource.status
                })
            });

            if (res.ok) {
                await fetchResources();
                setShowEditModal(false);
                setEditResource({ id: null, name: '', status: 'Active' });
            } else {
                alert("Error updating resource");
            }
        } catch (err) {
            alert("Error updating resource");
        }
    };

    const handleEditClick = (res) => {
        setEditResource({
            id: res.id,
            name: res.name,
            status: res.status
        });
        setShowEditModal(true);
    };

    const handleDeleteClick = (res) => {
        setSelectedResource(res);
        setShowDeleteModal(true);
    };

    const confirmDelete = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/resources/${selectedResource.id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: deletePassword })
            });

            if (res.ok) {
                await fetchResources();
                setShowDeleteModal(false);
                setDeletePassword('');
                setSelectedResource(null);
            } else {
                const data = await res.json();
                alert(data.detail || "Invalid password");
            }
        } catch (err) {
            alert("Delete failed");
        }
    };

    const getIcon = (type) => {
        if (type === 'Website') return '🌐';
        if (type === 'Telegram Bot') return '🤖';
        if (type === 'Mobile Application') return '📱';
        return '📦';
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <h1 style={{ fontSize: '32px', fontWeight: 800 }}>{t('resources.title')}</h1>
                        <HelpButton title={t('resources.help.title')} content={t('resources.help.content')} />
                    </div>
                    <p className="subtitle">{t('resources.subtitle')}</p>
                </div>
                <button className="btn-premium" onClick={() => setShowModal(true)}>
                    {t('resources.add')}
                </button>
            </div>

            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Syncing with cloud...</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{t('resources.table.name')}</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{t('resources.table.type')}</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Tracking ID</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{t('resources.table.status')}</th>
                                <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {resources.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No resources active. Connect your first site, bot or app.</td>
                                </tr>
                            ) : resources.map((item, i) => (
                                <tr key={item.id} style={{ borderBottom: i === resources.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '20px 24px' }}>
                                        <div style={{ fontWeight: 700 }}>{item.name}</div>
                                        {item.token && (
                                            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px', fontFamily: 'monospace' }}>
                                                {item.type === 'Telegram Bot' ? 'Token: ' : 'Bundle: '}
                                                {item.token.substring(0, 12)}...
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ padding: '20px 24px' }}>
                                        <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {getIcon(item.type)} {item.type === 'Website' ? t('resources.types.website') : (item.type === 'Telegram Bot' ? t('resources.types.bot') : t('resources.types.app'))}
                                        </div>
                                    </td>
                                    <td style={{ padding: '20px 24px', fontFamily: 'monospace', color: '#9d174d', fontWeight: 600, fontSize: '13px' }}>{item.uid}</td>
                                    <td style={{ padding: '20px 24px' }}>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '100px',
                                            fontSize: '11px',
                                            fontWeight: 700,
                                            background: item.status === 'Active' ? '#f0fdf4' : '#fef2f2',
                                            color: item.status === 'Active' ? '#166534' : '#991b1b'
                                        }}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', alignItems: 'center' }}>
                                            {item.type === 'Website' && (
                                                <button
                                                    onClick={() => { setSelectedResource(item); setShowSetupModal(true); }}
                                                    style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                                                >
                                                    {t('integration.copy')}
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleEditClick(item)}
                                                style={{ background: 'none', border: 'none', color: '#059669', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(item)}
                                                style={{ background: 'none', border: 'none', color: '#f43f5e', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2 style={{ marginBottom: '24px' }}>{t('resources.add')}</h2>
                        <form onSubmit={handleAdd}>
                            <div className="form-field">
                                <label>{t('resources.fields.name')}</label>
                                <input
                                    className="input-lux"
                                    value={newResource.name}
                                    onChange={e => setNewResource({ ...newResource, name: e.target.value })}
                                    placeholder="Production App / Website"
                                    required
                                    style={{ marginBottom: 0 }}
                                />
                            </div>
                            <div className="form-field">
                                <label>{t('resources.fields.type')}</label>
                                <select
                                    className="select-lux"
                                    value={newResource.type}
                                    onChange={e => setNewResource({ ...newResource, type: e.target.value })}
                                >
                                    <option value="Website">{t('resources.types.website')}</option>
                                    <option value="Telegram Bot">{t('resources.types.bot')}</option>
                                    <option value="Mobile Application">{t('resources.types.app')}</option>
                                </select>
                            </div>

                            {newResource.type === 'Telegram Bot' && (
                                <div className="form-field">
                                    <label>{t('resources.fields.token')}</label>
                                    <input
                                        className="input-lux"
                                        value={newResource.botToken}
                                        onChange={e => setNewResource({ ...newResource, botToken: e.target.value })}
                                        placeholder="123456789:ABCDefGh..."
                                        required
                                        style={{ marginBottom: 0 }}
                                    />
                                    <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Integration required for deep-link mapping.</p>
                                </div>
                            )}

                            {newResource.type === 'Mobile Application' && (
                                <div className="form-field">
                                    <label>{t('resources.fields.bundleId')}</label>
                                    <input
                                        className="input-lux"
                                        value={newResource.bundleId}
                                        onChange={e => setNewResource({ ...newResource, bundleId: e.target.value })}
                                        placeholder="com.company.app"
                                        required
                                        style={{ marginBottom: 0 }}
                                    />
                                    <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Required for SDK authentication.</p>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                                <button type="button" className="btn-premium" style={{ background: '#fff', color: '#0f172a', border: '1px solid #e2e8f0', flex: 1 }} onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-premium" style={{ flex: 1 }}>
                                    Confirm Connection
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showEditModal && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal-content" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
                        <h2 style={{ marginBottom: '24px' }}>Edit Resource</h2>
                        <form onSubmit={handleEdit}>
                            <div className="form-field">
                                <label>Name</label>
                                <input
                                    className="input-lux"
                                    value={editResource.name}
                                    onChange={e => setEditResource({ ...editResource, name: e.target.value })}
                                    placeholder="Resource name"
                                    required
                                    style={{ marginBottom: 0 }}
                                />
                            </div>
                            <div className="form-field">
                                <label>Status</label>
                                <select
                                    className="select-lux"
                                    value={editResource.status}
                                    onChange={e => setEditResource({ ...editResource, status: e.target.value })}
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                                <button type="button" className="btn-premium" style={{ background: '#fff', color: '#0f172a', border: '1px solid #e2e8f0', flex: 1 }} onClick={() => setShowEditModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-premium" style={{ flex: 1 }}>
                                    Update Resource
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="modal-content" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
                        <h2 style={{ marginBottom: '12px', color: '#0f172a' }}>Confirm Removal</h2>
                        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
                            You are deleting <strong>{selectedResource?.name}</strong>. This action is irreversible. Enter administrator password to proceed.
                        </p>
                        <form onSubmit={confirmDelete}>
                            <div className="form-field">
                                <label>Security Password</label>
                                <input
                                    type="password"
                                    className="input-lux"
                                    value={deletePassword}
                                    onChange={e => setDeletePassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    autoFocus
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                                <button type="button" className="btn-premium" style={{ background: '#fff', color: '#0f172a', border: '1px solid #e2e8f0', flex: 1 }} onClick={() => { setShowDeleteModal(false); setDeletePassword(''); }}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-premium" style={{ background: '#f43f5e', flex: 1 }}>
                                    Final Delete
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {showSetupModal && (
                <div className="modal-overlay" onClick={() => setShowSetupModal(false)}>
                    <div className="modal-content" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
                        <h2 style={{ marginBottom: '8px' }}>{t('integration.title')}</h2>
                        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>{t('integration.desc')}</p>

                        <div style={{
                            background: '#0f172a',
                            padding: '24px',
                            borderRadius: '12px',
                            color: '#94a3b8',
                            fontSize: '13px',
                            fontFamily: 'monospace',
                            position: 'relative',
                            lineHeight: '1.6'
                        }}>
                            <div style={{ color: '#38bdf8' }}>&lt;!-- OpenTrace Tracking --&gt;</div>
                            <div>&lt;<span style={{ color: '#fb7185' }}>script</span></div>
                            <div style={{ paddingLeft: '20px' }}><span style={{ color: '#fbbf24' }}>async</span></div>
                            <div style={{ paddingLeft: '20px' }}>
                                <span style={{ color: '#fbbf24' }}>src</span>="{(typeof window !== 'undefined' ? (window.location.origin.includes('localhost') ? 'http://localhost:8000' : window.location.origin) : '')}/sdk/t.js?id=<span style={{ color: '#34d399' }}>{selectedResource?.uid}</span>"
                            </div>
                            <div>&gt;&lt;/<span style={{ color: '#fb7185' }}>script</span>&gt;</div>
                        </div>

                        <div style={{ marginTop: '24px', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#0f172a' }}>⚡ PRO Tip</div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>
                                Use <code style={{ color: '#2563eb' }}>ot.track('button_click', &#123; name: 'hero' &#125;)</code> for custom events.
                            </div>
                        </div>

                        <button
                            className="btn-premium"
                            style={{ width: '100%', marginTop: '32px' }}
                            onClick={() => {
                                const origin = typeof window !== 'undefined' ? (window.location.origin.includes('localhost') ? 'http://localhost:8000' : window.location.origin) : '';
                                const code = `<!-- OpenTrace Tracking -->\n<script async src="${origin}/sdk/t.js?id=${selectedResource?.uid}"></script>`;
                                navigator.clipboard.writeText(code);
                                alert("Snippet copied to clipboard!");
                            }}
                        >
                            {t('integration.copy')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
