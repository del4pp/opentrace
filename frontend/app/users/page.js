"use client";
import { useState, useEffect } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import HelpButton from '../../components/HelpButton';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}`;

export default function UsersPage() {
    const { t } = useTranslation();
    const [userRole, setUserRole] = useState('demo');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState('admin');
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.role) {
            setUserRole(user.role);
        }
    }, []);

    const handleInvite = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMsg('');

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const res = await fetch(`${API_URL}/invite`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
                body: JSON.stringify({
                    email,
                    role,
                    invited_by: user.user_id
                })
            });
            const data = await res.json();

            if (res.ok) {
                setMsg(t('users_page.success') || `Invitation sent to ${email}`);
                setEmail('');
            } else {
                setError(data.detail || t('users_page.error_failed'));
            }
        } catch (err) {
            setError("Network error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '1200px' }}>
            <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '8px' }}>
                        {t('users_page.title') || 'Team Management'}
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '16px' }}>{t('users_page.subtitle') || 'Invite your colleagues to join OpenTrace'}</p>
                </div>
                <HelpButton
                    title={t('users_page.help.title')}
                    content={t('users_page.help.content')}
                />
            </div>

            {userRole === 'admin' ? (
                <div className="card-lux" style={{ maxWidth: '600px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '24px' }}>{t('users_page.invite_title') || 'Invite New Member'}</h2>

                    <form onSubmit={handleInvite}>
                        {msg && (
                            <div style={{ padding: '12px', background: '#ecfdf5', color: '#047857', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', fontWeight: 600 }}>
                                {msg}
                            </div>
                        )}
                        {error && (
                            <div style={{ padding: '12px', background: '#fef2f2', color: '#991b1b', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', fontWeight: 600 }}>
                                {error}
                            </div>
                        )}

                        <div className="form-field">
                            <label>{t('users_page.email_label') || 'Email Address'}</label>
                            <input
                                type="email"
                                className="input-lux"
                                placeholder={t('users_page.placeholder') || "colleague@company.com"}
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-field" style={{ marginTop: '20px' }}>
                            <label>User Role</label>
                            <select
                                className="input-lux"
                                value={role}
                                onChange={e => setRole(e.target.value)}
                                style={{ width: '100%', padding: '12px' }}
                            >
                                <option value="admin">Admin (Full Access)</option>
                                <option value="demo">Demo (View Only)</option>
                            </select>
                            <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                                {role === 'admin'
                                    ? 'Admin can manage resources, campaigns, and settings.'
                                    : 'Demo users can only view charts and reports.'}
                            </p>
                        </div>

                        <button
                            type="submit"
                            className="btn-premium"
                            disabled={loading}
                            style={{ width: '100%', marginTop: '8px' }}
                        >
                            {loading ? t('users_page.loading') : t('users_page.send_btn')}
                        </button>

                        <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '16px', textAlign: 'center' }}>
                            {t('users_page.footer_note')}
                        </p>
                    </form>
                </div>
            ) : (
                <div className="card-lux" style={{ maxWidth: '600px', textAlign: 'center', padding: '40px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛡️</div>
                    <h2 style={{ fontWeight: 800, marginBottom: '8px' }}>Access Restricted</h2>
                    <p style={{ color: '#64748b' }}>Only administrators can invite new team members.</p>
                </div>
            )}
        </div>
    );
}
