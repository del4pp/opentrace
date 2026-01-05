"use client";
import { useState, useEffect } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { useResource } from '../../context/ResourceContext';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}`;

export default function ExplorerPage() {
    const { t } = useTranslation();
    const { selectedResource } = useResource();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);

    const fetchLiveFeed = async (isManual = false) => {
        if (!selectedResource) return;
        if (isManual) setRefreshing(true);
        try {
            const res = await fetch(`${API_URL}/analytics/live-feed?resource_id=${selectedResource.uid}`);
            if (res.ok) {
                const data = await res.json();
                setEvents(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchLiveFeed();
        const timer = setInterval(() => fetchLiveFeed(), 10000); // Auto-refresh every 10s
        return () => clearInterval(timer);
    }, [selectedResource]);

    const getPayloadSummary = (payload) => {
        const keys = Object.keys(payload);
        if (keys.length === 0) return "—";
        return keys.map(k => `${k}: ${payload[k]}`).join(', ').substring(0, 60) + (keys.length > 3 ? '...' : '');
    };

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: 800 }}>Live Explorer</h1>
                    <p className="subtitle">Real-time stream of incoming events and custom payloads</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#10b981', fontWeight: 600 }}>
                        <span className="pulse"></span> LIVE
                    </div>
                    <button
                        className="btn-premium"
                        style={{ background: '#fff', color: '#0f172a', border: '1px solid #e2e8f0' }}
                        onClick={() => fetchLiveFeed(true)}
                    >
                        {refreshing ? 'Refreshing...' : 'Refresh Now'}
                    </button>
                </div>
            </div>

            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Time</th>
                            <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Event</th>
                            <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Page / Origin</th>
                            <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Payload Metadata</th>
                            <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>Connecting to data stream...</td></tr>
                        ) : events.length === 0 ? (
                            <tr><td colSpan="5" style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>No events detected for this resource yet.</td></tr>
                        ) : events.map((ev, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', transition: '0.2s' }} className="table-row-hover">
                                <td style={{ padding: '16px 24px', fontSize: '13px', color: '#64748b' }}>
                                    {new Date(ev.timestamp).toLocaleTimeString()}
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <span style={{
                                        fontWeight: 700,
                                        fontSize: '13px',
                                        color: ev.type.includes('purchase') ? '#10b981' : (ev.type.includes('error') ? '#ef4444' : '#0f172a'),
                                        background: ev.type.includes('purchase') ? '#ecfdf5' : 'none',
                                        padding: ev.type.includes('purchase') ? '4px 8px' : '0',
                                        borderRadius: '6px'
                                    }}>
                                        {ev.type}
                                    </span>
                                </td>
                                <td style={{ padding: '16px 24px', fontSize: '13px', color: '#64748b', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    <div>{ev.url}</div>
                                    {ev.sid && (
                                        <a
                                            href={`/users/timeline?identity=${ev.sid}`}
                                            style={{ fontSize: '10px', color: '#3b82f6', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}
                                        >
                                            👤 {ev.sid.substring(0, 8)}...
                                        </a>
                                    )}
                                </td>
                                <td style={{ padding: '16px 24px', fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>
                                    {getPayloadSummary(ev.payload)}
                                </td>
                                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                    <button
                                        onClick={() => setSelectedEvent(ev)}
                                        style={{ background: '#f1f5f9', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                                    >
                                        Inspect
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedEvent && (
                <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
                    <div className="modal-content" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '20px' }}>Event Details</h2>
                            <button onClick={() => setSelectedEvent(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                            <div>
                                <label style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Event Type</label>
                                <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '4px' }}>{selectedEvent.type}</div>
                            </div>
                            <div>
                                <label style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Timestamp</label>
                                <div style={{ fontSize: '16px', marginTop: '4px' }}>{new Date(selectedEvent.timestamp).toLocaleString()}</div>
                            </div>
                        </div>


                        {/* Smart Summary */}
                        {(selectedEvent.payload?.amount || selectedEvent.payload?.revenue || selectedEvent.payload?.status || selectedEvent.payload?.currency) && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
                                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Amount</div>
                                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>{selectedEvent.payload.amount || selectedEvent.payload.revenue || '-'}</div>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Currency</div>
                                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>{selectedEvent.payload.currency || 'USD'}</div>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Status</div>
                                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>{selectedEvent.payload.status || '-'}</div>
                                </div>
                            </div>
                        )}

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Full Payload (JSON)</label>
                            <pre style={{
                                marginTop: '8px',
                                background: '#1e293b',
                                color: '#e2e8f0',
                                padding: '20px',
                                borderRadius: '12px',
                                fontSize: '13px',
                                overflow: 'auto',
                                maxHeight: '300px',
                                border: '1px solid #334155'
                            }}>
                                {JSON.stringify(selectedEvent.payload, null, 4)}
                            </pre>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button className="btn-premium" style={{ flex: 1 }} onClick={() => setSelectedEvent(null)}>Close Inspector</button>
                        </div>
                    </div>
                </div >
            )
            }

            <style jsx>{`
                .pulse {
                    display: inline-block;
                    width: 8px;
                    height: 8px;
                    background: #10b981;
                    border-radius: 50%;
                    animation: pulse-animation 2s infinite;
                }
                @keyframes pulse-animation {
                    0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
                    70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
                }
                .table-row-hover:hover {
                    background: #f8fafc;
                }
            `}</style>
        </div >
    );
}
