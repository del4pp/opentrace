"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '../../context/LanguageContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { t } = useTranslation();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.detail || 'Login failed');
            }

            // Save auth data
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('user', JSON.stringify({
                user_id: data.user_id,
                email: data.email,
                role: data.role,
                is_first_login: data.is_first_login
            }));

            // Check if first login
            if (data.is_first_login) {
                router.push('/profile');
            } else {
                router.push('/dashboard');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrap">
            <div className="auth-card">
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{ width: '48px', height: '48px', background: '#0f172a', borderRadius: '12px', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900 }}>OT</div>
                    <h1 style={{ fontSize: '24px', fontWeight: 800 }}>{t('auth.login.title')}</h1>
                    <p style={{ color: '#64748b', fontSize: '14px', marginTop: '8px' }}>{t('auth.login.subtitle')}</p>
                </div>

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>{t('auth.login.email')}</label>
                        <input
                            type="email"
                            className="input-lux"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@company.com"
                            required
                            autoComplete="username"
                        />
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <label style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>{t('auth.login.password')}</label>
                            <Link href="/forgot-password" style={{ fontSize: '12px', color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>
                                {t('auth.login.forgot')}
                            </Link>
                        </div>
                        <input
                            type="password"
                            className="input-lux"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    {error && (
                        <div style={{ marginBottom: '20px', padding: '12px', background: '#fef2f2', border: '1px solid #ef4444', borderRadius: '8px', color: '#dc2626' }}>
                            {error}
                        </div>
                    )}

                    <button type="submit" className="btn-premium" style={{ width: '100%', padding: '14px', fontSize: '16px' }} disabled={loading}>
                        {loading ? '...' : t('auth.login.submit')}
                    </button>
                </form>
            </div>
        </div>
    );
}
