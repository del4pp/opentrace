"use client";
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from '../../../context/LanguageContext';
import { useResource } from '../../../context/ResourceContext';
import HelpButton from '../../../components/HelpButton';

export default function UserTimelinePage() {
    const { t } = useTranslation();
    const { selectedResource } = useResource();
    const searchParams = useSearchParams();

    const [identity, setIdentity] = useState(searchParams.get('identity') || '');
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

    useEffect(() => {
        if (identity && selectedResource) {
            fetchTimeline();
        }
    }, [selectedResource]);

    const fetchTimeline = async () => {
        if (!identity || !selectedResource) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_URL}/users/timeline?resource_id=${selectedResource.id}&identity=${identity}`);
            if (res.ok) {
                const data = await res.json();
                setEvents(data.events);
            } else {
                setError("Failed to fetch timeline");
            }
        } catch (err) {
            console.error("Timeline error:", err);
            setError("Connection error");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter') fetchTimeline();
    };

    const groupEventsByDate = (events) => {
        const groups = {};
        events.forEach(event => {
            const date = new Date(event.timestamp).toLocaleDateString();
            if (!groups[date]) groups[date] = [];
            groups[date].push(event);
        });
        return groups;
    };

    const eventGroups = groupEventsByDate(events);

    return (
        <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {t('timeline.title')} <HelpButton section="timeline" />
                </h1>
                <p style={{ color: '#64748b', fontSize: '15px' }}>{t('timeline.subtitle')}</p>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '40px' }}>
                <input
                    type="text"
                    value={identity}
                    onChange={(e) => setIdentity(e.target.value)}
                    onKeyDown={handleSearch}
                    placeholder={t('timeline.searchPlaceholder')}
                    style={{
                        flex: 1,
                        padding: '14px 20px',
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        fontSize: '16px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                />
                <button
                    onClick={fetchTimeline}
                    style={{
                        padding: '14px 28px',
                        background: '#0f172a',
                        color: '#fff',
                        borderRadius: '16px',
                        border: 'none',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'transform 0.1s'
                    }}
                >
                    Search
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px' }}>
                    <div className="spinner" style={{ margin: '0 auto 20px' }}></div>
                    <p style={{ color: '#64748b' }}>Retreiving history...</p>
                </div>
            ) : events.length > 0 ? (
                <div style={{ position: 'relative' }}>
                    {/* Vertical Line */}
                    <div style={{
                        position: 'absolute',
                        left: '20px',
                        top: '0',
                        bottom: '0',
                        width: '2px',
                        background: '#f1f5f9'
                    }}></div>

                    {Object.keys(eventGroups).map(date => (
                        <div key={date} style={{ marginBottom: '40px', position: 'relative' }}>
                            <div style={{
                                background: '#f8fafc',
                                display: 'inline-block',
                                padding: '4px 12px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: 800,
                                color: '#64748b',
                                marginBottom: '24px',
                                textTransform: 'uppercase',
                                border: '1px solid #f1f5f9',
                                position: 'relative',
                                zIndex: 1,
                                marginLeft: '8px'
                            }}>
                                {date}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {eventGroups[date].map((event, idx) => (
                                    <div key={idx} style={{ display: 'flex', gap: '24px', position: 'relative' }}>
                                        {/* Dot */}
                                        <div style={{
                                            width: '12px',
                                            height: '12px',
                                            borderRadius: '50%',
                                            background: '#3b82f6',
                                            border: '3px solid #fff',
                                            boxShadow: '0 0 0 4px #eff6ff',
                                            marginTop: '6px',
                                            marginLeft: '15px',
                                            zIndex: 2,
                                            flexShrink: 0
                                        }}></div>

                                        <div style={{
                                            flex: 1,
                                            background: '#fff',
                                            borderRadius: '16px',
                                            border: '1px solid #f1f5f9',
                                            padding: '16px 20px',
                                            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <span style={{ fontWeight: 700, fontSize: '16px', color: '#0f172a' }}>{event.event_type}</span>
                                                <span style={{ color: '#94a3b8', fontSize: '13px' }}>
                                                    {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                </span>
                                            </div>

                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                                                {event.url && (
                                                    <span style={{ fontSize: '11px', background: '#f8fafc', padding: '2px 8px', borderRadius: '4px', color: '#475569', border: '1px solid #f1f5f9' }}>
                                                        {event.url}
                                                    </span>
                                                )}
                                                {event.utm_source && (
                                                    <span style={{ fontSize: '11px', background: '#ecfdf5', padding: '2px 8px', borderRadius: '4px', color: '#059669', border: '1px solid #d1fae5' }}>
                                                        Source: {event.utm_source}
                                                    </span>
                                                )}
                                                {event.ip && (
                                                    <span style={{ fontSize: '11px', background: '#fef2f2', padding: '2px 8px', borderRadius: '4px', color: '#dc2626', border: '1px solid #fee2e2' }}>
                                                        IP: {event.ip}
                                                    </span>
                                                )}
                                            </div>

                                            {event.payload && event.payload !== '{}' && (
                                                <div style={{ background: '#fdfdfd', borderRadius: '8px', padding: '12px', border: '1px solid #f1f5f9', fontSize: '12px', fontFamily: 'monospace', color: '#4b5563' }}>
                                                    {event.payload}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : identity ? (
                <div style={{ textAlign: 'center', padding: '80px', background: '#fff', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔍</div>
                    <h3 style={{ fontWeight: 700, margin: '0 0 8px 0' }}>{t('timeline.noEvents')}</h3>
                    <p style={{ color: '#64748b' }}>Check if the identity is correct or try a different one.</p>
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '80px', background: '#fff', borderRadius: '24px', border: '2px dashed #e2e8f0' }}>
                    <div style={{ fontSize: '48px', marginBottom: '20px' }}>👣</div>
                    <h3 style={{ fontWeight: 700, margin: '0 0 8px 0' }}>{t('timeline.noIdentity')}</h3>
                    <p style={{ color: '#64748b' }}>Follow the user journey step by step.</p>
                </div>
            )}
        </div>
    );
}
