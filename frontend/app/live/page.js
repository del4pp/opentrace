"use client";
import { useState, useEffect } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { useResource } from '../../context/ResourceContext';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api'}`;
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export default function LivePage() {
    const { t } = useTranslation();
    const { selectedResource } = useResource();
    const [liveData, setLiveData] = useState({ online: 0, locations: [], events: [] });
    const [pulse, setPulse] = useState(false);
    const [position, setPosition] = useState({ coordinates: [10, 0], zoom: 1.2 });
    const [viewMode, setViewMode] = useState('global');

    const handleZoomIn = () => {
        if (position.zoom >= 4) return;
        setPosition((pos) => ({ ...pos, zoom: pos.zoom * 1.5 }));
    };

    const handleZoomOut = () => {
        if (position.zoom <= 1) return;
        setPosition((pos) => ({ ...pos, zoom: pos.zoom / 1.5 }));
    };

    const handleMoveEnd = (position) => {
        setPosition(position);
    };

    const fetchLive = async () => {
        if (!selectedResource) return;
        try {
            const res = await fetch(`${API_URL}/analytics/live?resource_id=${selectedResource.id}`);
            if (res.ok) {
                const data = await res.json();
                setLiveData(data);
                setPulse(true);
                setTimeout(() => setPulse(false), 800);
            }
        } catch (err) {
            console.error("Live fetch error:", err);
        }
    };

    useEffect(() => {
        fetchLive();
        const interval = setInterval(fetchLive, 3000);
        return () => clearInterval(interval);
    }, [selectedResource]);

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <h1>{t('analytics.live.title')}</h1>
                        <span style={{
                            marginLeft: '16px',
                            padding: '4px 12px',
                            background: '#fef2f2',
                            color: '#ef4444',
                            borderRadius: '100px',
                            fontSize: '12px',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            border: '1px solid #fee2e2'
                        }}>
                            <span style={{ width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></span>
                            LIVE
                        </span>
                    </div>
                    <p className="subtitle">{t('analytics.live.subtitle')}</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '32px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

                    <div className="card-stat" style={{
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                        color: '#fff',
                        padding: '40px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        position: 'relative',
                        borderRadius: '24px'
                    }}>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
                            {t('analytics.live.online')}
                        </div>
                        <div style={{
                            fontSize: '96px',
                            fontWeight: 900,
                            letterSpacing: '-3px',
                            transition: 'all 0.4s',
                            transform: pulse ? 'scale(1.05)' : 'scale(1)',
                            color: pulse ? '#3b82f6' : '#fff'
                        }}>
                            {liveData.online}
                        </div>
                    </div>

                    <div className="card-stat" style={{ padding: '0', height: '550px', background: '#f8fafc', overflow: 'hidden', borderRadius: '24px', position: 'relative' }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{t('analytics.live.map')}</h3>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <select
                                    className="select-lux"
                                    style={{ margin: 0, padding: '4px 12px', fontSize: '12px', height: '32px' }}
                                    value={viewMode}
                                    onChange={(e) => setViewMode(e.target.value)}
                                >
                                    <option value="global">🌍 Global View</option>
                                    <option value="europe">🇪🇺 Europe Focus</option>
                                    <option value="na">🇺🇸 N. America</option>
                                    <option value="asia">🌏 Asia Pacific</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ width: '100%', height: 'calc(100% - 70px)', background: '#f1f5f9', position: 'relative' }}>
                            {/* Zoom Controls */}
                            <div style={{ position: 'absolute', bottom: '20px', right: '20px', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 10 }}>
                                <button className="btn-premium" style={{ width: '40px', height: '40px', borderRadius: '10px', padding: 0 }} onClick={handleZoomIn}>+</button>
                                <button className="btn-premium" style={{ width: '40px', height: '40px', borderRadius: '10px', padding: 0 }} onClick={handleZoomOut}>-</button>
                            </div>

                            <ComposableMap projectionConfig={{ scale: viewMode === 'global' ? 190 : 400 }} style={{ width: "100%", height: "100%" }}>
                                <ZoomableGroup
                                    zoom={position.zoom}
                                    center={viewMode === 'europe' ? [15, 50] : viewMode === 'na' ? [-100, 40] : viewMode === 'asia' ? [100, 20] : position.coordinates}
                                    onMoveEnd={handleMoveEnd}
                                >
                                    <Geographies geography={geoUrl}>
                                        {({ geographies }) =>
                                            geographies.map((geo) => {
                                                if (geo.id === "643" || geo.properties.name === "Russia") return null;
                                                return (
                                                    <Geography
                                                        key={geo.rsmKey}
                                                        geography={geo}
                                                        fill="#cbd5e1"
                                                        stroke="#f1f5f9"
                                                        strokeWidth={0.5}
                                                        style={{
                                                            default: { outline: "none" },
                                                            hover: { fill: "#94a3b8", outline: "none" },
                                                            pressed: { outline: "none" }
                                                        }}
                                                    />
                                                );
                                            })
                                        }
                                    </Geographies>
                                    {liveData.locations.map((loc, i) => (
                                        <Marker key={i} coordinates={[loc.lng, loc.lat]}>
                                            <circle r={4} fill="#2563eb" stroke="#fff" strokeWidth={1}>
                                                <animate attributeName="r" values="3;6;3" dur="2s" repeatCount="indefinite" />
                                                <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
                                            </circle>
                                        </Marker>
                                    ))}
                                </ZoomableGroup>
                            </ComposableMap>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="card-stat" style={{ padding: '24px', flex: 1, borderRadius: '24px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                            {t('analytics.live.recent')}
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
                            {(!liveData.events || liveData.events.length === 0) ? (
                                <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', paddingTop: '20px' }}>
                                    Waiting for events...
                                </div>
                            ) : (
                                liveData.events.map((e, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
                                        <div style={{ width: '4px', background: e.type === 'page_view' ? '#2563eb' : '#10b981', borderRadius: '4px' }}></div>
                                        <div style={{ flex: 1, overflow: 'hidden' }}>
                                            <div style={{ fontWeight: 700 }}>{e.type}</div>
                                            <div style={{ color: '#64748b', fontSize: '11px', fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {e.url || e.ip}
                                            </div>
                                        </div>
                                        <div style={{ color: '#94a3b8', fontSize: '10px' }}>
                                            {new Date(e.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes pulse {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
                }
            `}</style>
        </div>
    );
}
