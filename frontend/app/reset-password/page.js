"use client";
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '../../context/LanguageContext';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}`;

function ResetForm() {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [pass, setPass] = useState({ new: '', confirm: '' });
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!token) {
        return <div style={{ textAlign: 'center', color: '#ef4444' }}>Invalid reset link.</div>;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMsg('');

        if (pass.new !== pass.confirm) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, new_password: pass.new })
            });
            const data = await res.json();

            if (res.ok) {
                setMsg(data.message || "Success");
            } else {
                setError(data.detail || "Error resetting password");
            }
        } catch (e) {
            console.error(e);
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    if (msg) {
        return (
            <div style={{ textAlign: 'center' }}>
                <div style={{ padding: '16px', background: '#ecfdf5', color: '#047857', borderRadius: '8px', marginBottom: '24px', fontSize: '14px' }}>
                    {t('forgot_password.success')}
                </div>
                <Link href="/login" className="btn-premium" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                    {t('forgot_password.back')}
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit}>
            {error && <div style={{ color: '#ef4444', marginBottom: '16px', fontSize: '13px', fontWeight: 600 }}>{error}</div>}

            <div className="form-field">
                <label>{t('forgot_password.new_pass')}</label>
                <input
                    type="password"
                    className="input-lux"
                    value={pass.new}
                    onChange={e => setPass({ ...pass, new: e.target.value })}
                    required
                    minLength={6}
                />
            </div>
            <div className="form-field">
                <label>{t('forgot_password.confirm_pass')}</label>
                <input
                    type="password"
                    className="input-lux"
                    value={pass.confirm}
                    onChange={e => setPass({ ...pass, confirm: e.target.value })}
                    required
                    minLength={6}
                />
            </div>
            <button type="submit" disabled={loading} className="btn-premium" style={{ width: '100%', opacity: loading ? 0.7 : 1 }}>
                {loading ? '...' : t('forgot_password.reset_btn')}
            </button>
        </form>
    );
}

export default function ResetPasswordPage() {
    const { t } = useTranslation();
    return (
        <div className="auth-wrap">
            <div className="auth-card">
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ width: '48px', height: '48px', background: '#0f172a', borderRadius: '12px', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900 }}>OT</div>
                    <h1 style={{ fontSize: '24px', fontWeight: 800 }}>{t('forgot_password.new_pass_title')}</h1>
                </div>
                <Suspense fallback={<div style={{ textAlign: 'center' }}>Loading...</div>}>
                    <ResetForm />
                </Suspense>
            </div>
        </div>
    );
}
