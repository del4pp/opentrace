"use client";
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}`;

function AcceptInvitationForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [form, setForm] = useState({ name: '', password: '', confirm: '' });
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!token) {
        return <div style={{ textAlign: 'center', color: '#ef4444' }}>Invalid or missing invitation token.</div>;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMsg('');

        if (form.password !== form.confirm) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/accept-invitation`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    name: form.name,
                    password: form.password
                })
            });
            const data = await res.json();

            if (res.ok) {
                setMsg(data.message || "Account created successfully!");
            } else {
                setError(data.detail || "Error creating account");
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
                    {msg}
                </div>
                <Link href="/login" className="btn-premium" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                    Go to Login
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit}>
            {error && <div style={{ color: '#ef4444', marginBottom: '16px', fontSize: '13px', fontWeight: 600 }}>{error}</div>}

            <div className="form-field">
                <label>Full Name</label>
                <input
                    type="text"
                    className="input-lux"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                />
            </div>

            <div className="form-field">
                <label>Password</label>
                <input
                    type="password"
                    className="input-lux"
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    required
                    minLength={6}
                />
            </div>

            <div className="form-field">
                <label>Confirm Password</label>
                <input
                    type="password"
                    className="input-lux"
                    placeholder="Repeat password"
                    value={form.confirm}
                    onChange={e => setForm({ ...form, confirm: e.target.value })}
                    required
                    minLength={6}
                />
            </div>

            <button type="submit" disabled={loading} className="btn-premium" style={{ width: '100%', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Processing...' : 'Complete Registration'}
            </button>
        </form>
    );
}

export default function AcceptInvitationPage() {
    return (
        <div className="auth-wrap">
            <div className="auth-card">
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        background: 'linear-gradient(135deg, #0f172a, #334155)',
                        borderRadius: '12px',
                        margin: '0 auto 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 900,
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                    }}>OT</div>
                    <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Join OpenTrace</h1>
                    <p style={{ color: '#64748b', fontSize: '14px', marginTop: '8px' }}>Set up your account to get started</p>
                </div>
                <Suspense fallback={<div style={{ textAlign: 'center' }}>Loading...</div>}>
                    <AcceptInvitationForm />
                </Suspense>
            </div>
        </div>
    );
}
