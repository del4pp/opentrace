"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '../../context/LanguageContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function ProfilePage() {
    const router = useRouter();
    const { t } = useTranslation();
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({ current: '', newPass: '', confirm: '' });
    const [msg, setMsg] = useState('');

    useEffect(() => {
        try {
            const u = localStorage.getItem('user');
            if (u) {
                setUser(JSON.parse(u));
            } else {
                router.push('/login');
            }
        } catch (e) {
            console.error("Failed to parse user data", e);
            localStorage.removeItem('user');
            router.push('/login');
        }
    }, [router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg('');

        if (formData.newPass !== formData.confirm) {
            setMsg(t('profile.mismatch') || 'Passwords do not match');
            return;
        }

        try {
            const res = await fetch(`${API_URL}/change-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.user_id,
                    current_password: formData.current,
                    new_password: formData.newPass
                })
            });

            if (res.ok) {
                const newUser = { ...user, is_first_login: false };
                localStorage.setItem('user', JSON.stringify(newUser));
                setUser(newUser);
                alert(t('profile.success') || 'Password changed successfully');

                router.push('/dashboard');
            } else {
                const err = await res.json();
                setMsg(err.detail || 'Error');
            }
        } catch (e) {
            setMsg('Network error');
        }
    };

    if (!user) return null;

    return (
        <div className="fade-in">
            <h1 style={{ marginBottom: '24px' }}>{t('profile.title')}</h1>

            {user.is_first_login && (
                <div style={{ background: '#fff1f2', color: '#be123c', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #fda4af' }}>
                    <strong>Security Alert:</strong> {t('profile.alert_first_login')}
                </div>
            )}

            <div className="card-stat" style={{ maxWidth: '500px', padding: '32px' }}>
                <h3 style={{ marginBottom: '24px' }}>{t('profile.change_password')}</h3>
                {msg && <div style={{ marginBottom: '16px', color: '#ef4444', fontWeight: 600 }}>{msg}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-field">
                        <label>{t('profile.current')}</label>
                        <input
                            type="password"
                            className="input-lux"
                            value={formData.current}
                            onChange={e => setFormData({ ...formData, current: e.target.value })}
                            required
                            autoComplete="current-password"
                        />
                    </div>
                    <div className="form-field">
                        <label>{t('profile.new')}</label>
                        <input
                            type="password"
                            className="input-lux"
                            value={formData.newPass}
                            onChange={e => setFormData({ ...formData, newPass: e.target.value })}
                            required
                            autoComplete="new-password"
                        />
                    </div>
                    <div className="form-field">
                        <label>{t('profile.confirm')}</label>
                        <input
                            type="password"
                            className="input-lux"
                            value={formData.confirm}
                            onChange={e => setFormData({ ...formData, confirm: e.target.value })}
                            required
                            autoComplete="new-password"
                        />
                    </div>
                    <button className="btn-premium" style={{ width: '100%' }}>{t('profile.submit')}</button>
                </form>
            </div>

            <div style={{ marginTop: '32px', color: '#64748b', fontSize: '13px' }}>
                {t('profile.logged_in_as')} <strong>{user.email}</strong>
            </div>
        </div>
    );
}
