"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '../../context/LanguageContext';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showDemo, setShowDemo] = useState(true);
    const router = useRouter();
    const { t } = useTranslation();

    useEffect(() => {
        const checkDemo = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
                const res = await fetch(`${apiUrl}/settings/show-demo`);
                if (res.ok) {
                    const data = await res.json();
                    setShowDemo(data.show_demo);
                }
            } catch (err) {
                console.error("Failed to fetch demo setting", err);
            }
        };
        checkDemo();
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
            const res = await fetch(`${apiUrl}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('user', JSON.stringify(data));

                if (data.is_first_login) {
                    router.push('/profile');
                } else {
                    router.push('/dashboard');
                }
            } else {
                alert('Invalid credentials');
            }
        } catch (err) {
            console.error("Login error:", err);
            alert("Login failed");
        }
    };

    return (
        <div className="auth-wrap">
            <div className="auth-card">
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{ width: '48px', height: '48px', background: '#0f172a', borderRadius: '12px', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900 }}>OT</div>
                    <h1 style={{ fontSize: '24px', fontWeight: 800 }}>{t('auth.title')}</h1>
                    <p style={{ color: '#64748b', fontSize: '14px', marginTop: '8px' }}>Log in to your control panel</p>
                </div>

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>{t('auth.email')}</label>
                        <input
                            type="email"
                            className="input-lux"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@opentrace.io"
                            required
                        />
                    </div>
                    <div style={{ marginBottom: '32px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>{t('auth.password')}</label>
                        <input
                            type="password"
                            className="input-lux"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button type="submit" className="btn-premium" style={{ width: '100%', padding: '14px', fontSize: '16px' }}>
                        {t('auth.submit')}
                    </button>
                </form>

                {showDemo && (
                    <div style={{ marginTop: '32px', textAlign: 'center', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <p style={{ fontSize: '12px', color: '#64748b' }}>Demo access:</p>
                        <code style={{ fontSize: '12px', color: '#0f172a', fontWeight: 700 }}>admin@opentrace.io / admin</code>
                    </div>
                )}
            </div>
        </div>
    );
}
