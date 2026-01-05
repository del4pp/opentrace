"use client";
import { useState, useEffect } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { useResource } from '../../context/ResourceContext';
import HelpButton from '../../components/HelpButton';

export default function RetentionPage() {
    const { t } = useTranslation();
    const { selectedResource } = useResource();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateFrom, setDateFrom] = useState(
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    );
    const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
    const [viewMode, setViewMode] = useState('percentage'); // or 'absolute'

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

    useEffect(() => {
        if (selectedResource) {
            fetchRetention();
        }
    }, [selectedResource, dateFrom, dateTo]);

    const fetchRetention = async () => {
        setLoading(true);
        try {
            const res = await fetch(
                `${API_URL}/analytics/retention?resource_id=${selectedResource.id}&date_from=${dateFrom}&date_to=${dateTo}`
            );
            if (res.ok) {
                const json = await res.json();
                setData(json.cohorts || []);
            }
        } catch (err) {
            console.error("Failed to fetch retention:", err);
        } finally {
            setLoading(false);
        }
    };

    const getHeatmapColor = (value) => {
        if (!value) return 'transparent';
        const opacity = Math.min(value / 40, 0.9); // Scale color up to 40% retention
        return `rgba(99, 102, 241, ${opacity})`;
    };

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>
                        {t('retention.title')} <HelpButton section="retention" />
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '14px' }}>{t('retention.subtitle')}</p>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '8px', padding: '4px' }}>
                        <button
                            onClick={() => setViewMode('percentage')}
                            style={{
                                padding: '6px 12px', borderRadius: '6px', border: 'none', fontSize: '12px', fontWeight: 600,
                                background: viewMode === 'percentage' ? '#fff' : 'transparent',
                                boxShadow: viewMode === 'percentage' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                cursor: 'pointer'
                            }}
                        >
                            %
                        </button>
                        <button
                            onClick={() => setViewMode('absolute')}
                            style={{
                                padding: '6px 12px', borderRadius: '6px', border: 'none', fontSize: '12px', fontWeight: 600,
                                background: viewMode === 'absolute' ? '#fff' : 'transparent',
                                boxShadow: viewMode === 'absolute' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                cursor: 'pointer'
                            }}
                        >
                            abs
                        </button>
                    </div>
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        style={{ padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }}
                    />
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        style={{ padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }}
                    />
                </div>
            </div>

            {loading ? (
                <div style={{ padding: '100px', textAlign: 'center', color: '#64748b' }}>Loading retention data...</div>
            ) : (
                <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                    <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', minWidth: '120px' }}>
                                        {t('retention.cohort')}
                                    </th>
                                    <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                                        {t('retention.size')}
                                    </th>
                                    {[...Array(31)].map((_, i) => (
                                        <th key={i} style={{ padding: '12px', fontSize: '11px', fontWeight: 700, color: '#64748b', textAlign: 'center', minWidth: '60px' }}>
                                            Day {i}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((cohort, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '16px', fontSize: '14px', fontWeight: 600 }}>{cohort.cohort_date}</td>
                                        <td style={{ padding: '16px', fontSize: '14px', color: '#64748b' }}>{cohort.cohort_size.toLocaleString()}</td>
                                        {[...Array(31)].map((_, i) => {
                                            const val = cohort.retention[`day_${i}`];
                                            const percentage = cohort.cohort_size > 0 ? (val / cohort.cohort_size) * 100 : 0;
                                            return (
                                                <td
                                                    key={i}
                                                    style={{
                                                        padding: '12px',
                                                        fontSize: '12px',
                                                        textAlign: 'center',
                                                        backgroundColor: getHeatmapColor(percentage),
                                                        color: percentage > 25 ? '#fff' : '#0f172a',
                                                        fontWeight: percentage > 0 ? 600 : 400
                                                    }}
                                                >
                                                    {val > 0 ? (
                                                        viewMode === 'percentage' ? `${percentage.toFixed(1)}%` : val.toLocaleString()
                                                    ) : '—'}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
