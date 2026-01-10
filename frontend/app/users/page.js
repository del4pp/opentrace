"use client";
import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}`;

export default function UsersPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState('admin');
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');

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
                setMsg(`Invitation sent to ${email}`);
                setEmail('');
            } else {
                setError(data.detail || "Failed to send invitation");
            }
        } catch (err) {
            setError("Network error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '1200px' }}>
            <div style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '8px' }}>
                    Team Management
                </h1>
                <p style={{ color: '#64748b', fontSize: '16px' }}>Invite your colleagues to join OpenTrace</p>
            </div>

            <div className="card-lux" style={{ maxWidth: '600px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '24px' }}>Invite New Member</h2>

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
                        <label>Email Address</label>
                        <input
                            type="email"
                            className="input-lux"
                            placeholder="colleague@company.com"
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
                        {loading ? 'Sending...' : 'Send Invitation'}
                    </button>

                    <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '16px', textAlign: 'center' }}>
                        An invitation email will be sent with a link to set up their account.
                    </p>
                </form>
            </div>
        </div>
    );
}
