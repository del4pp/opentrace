"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '../../context/LanguageContext';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}`;

export default function ForgotPasswordPage() {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg('');
        try {
            const res = await fetch(`${API_URL}/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            setMsg(data.message || "Reset link sent.");
        } catch (e) {
            setMsg('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrap">
            <div className="auth-card">
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ width: '48px', height: '48px', background: '#0f172a', borderRadius: '12px', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900 }}>OT</div>
                    <h1 style={{ fontSize: '24px', fontWeight: 800 }}>{t('forgot_password.title')}</h1>
                    <p className="subtitle">{t('forgot_password.desc')}</p>
                </div>

                {msg ? (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ padding: '16px', background: '#ecfdf5', color: '#047857', borderRadius: '8px', marginBottom: '24px', fontSize: '14px', lineHeight: '1.5' }}>
                            {msg}
                        </div>
                        <Link href="/login" className="btn-premium" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                            {t('forgot_password.back')}
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="form-field">
                            <label>{t('forgot_password.email')}</label>
                            <input
                                type="email"
                                className="input-lux"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" disabled={loading} className="btn-premium" style={{ width: '100%', opacity: loading ? 0.7 : 1 }}>
                            {loading ? '...' : t('forgot_password.submit')}
                        </button>
                        <div style={{ marginTop: '24px', textAlign: 'center' }}>
                            <Link href="/login" style={{ color: '#64748b', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
                                ← {t('forgot_password.back')}
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
