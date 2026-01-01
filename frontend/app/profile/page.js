"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({ current: '', newPass: '', confirm: '' });
    const [msg, setMsg] = useState('');

    useEffect(() => {
        const u = localStorage.getItem('user');
        if (u) {
            setUser(JSON.parse(u));
        } else {
            router.push('/login');
        }
    }, [router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg('');

        if (formData.newPass !== formData.confirm) {
            setMsg('New passwords do not match');
            return;
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api'}/change-password`, {
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
                alert("Password changed successfully!");
                // If it was forced first login, redirect to dashboard now
                router.push('/dashboard');
            } else {
                const err = await res.json();
                setMsg(err.detail || 'Error changing password');
            }
        } catch (e) {
            setMsg('Network error');
        }
    };

    if (!user) return null;

    return (
        <div className="fade-in">
            <h1 style={{ marginBottom: '24px' }}>Profile Settings</h1>

            {user.is_first_login && (
                <div style={{ background: '#fff1f2', color: '#be123c', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #fda4af' }}>
                    <strong>Security Alert:</strong> You are using a temporary password. You must change it to proceed.
                </div>
            )}

            <div className="card-stat" style={{ maxWidth: '500px', padding: '32px' }}>
                <h3 style={{ marginBottom: '24px' }}>Change Password</h3>
                {msg && <div style={{ marginBottom: '16px', color: '#ef4444', fontWeight: 600 }}>{msg}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-field">
                        <label>Current Password</label>
                        <input
                            type="password"
                            className="input-lux"
                            value={formData.current}
                            onChange={e => setFormData({ ...formData, current: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-field">
                        <label>New Password</label>
                        <input
                            type="password"
                            className="input-lux"
                            value={formData.newPass}
                            onChange={e => setFormData({ ...formData, newPass: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-field">
                        <label>Confirm New Password</label>
                        <input
                            type="password"
                            className="input-lux"
                            value={formData.confirm}
                            onChange={e => setFormData({ ...formData, confirm: e.target.value })}
                            required
                        />
                    </div>
                    <button className="btn-premium" style={{ width: '100%' }}>Update Password</button>
                </form>
            </div>

            <div style={{ marginTop: '32px', color: '#64748b', fontSize: '13px' }}>
                Logged in as <strong>{user.email}</strong>
            </div>
        </div>
    );
}
