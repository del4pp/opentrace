"use client";
import { useState, useEffect } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { useResource } from '../../context/ResourceContext';
import HelpButton from '../../components/HelpButton';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}`;

export default function ReportsPage() {
    const { t } = useTranslation();
    const { selectedResource } = useResource();
    const [reports, setReports] = useState([]);
    const [selectedReportId, setSelectedReportId] = useState('');
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Config State
    const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [activeMetric, setActiveMetric] = useState('users');
    const [activeDimension, setActiveDimension] = useState('date');
    const [chartType, setChartType] = useState('bar'); // bar, pie, table
    const [filters, setFilters] = useState([]); // {key, value}

    // UI State
    const [showBuilder, setShowBuilder] = useState(true);
    const [newName, setNewName] = useState('');

    const fetchReports = async () => {
        if (!selectedResource) return;
        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch(`${API_URL}/reports?resource_id=${selectedResource.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setReports(data);
            }
        } catch (err) {
            console.error("Failed to fetch reports:", err);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [selectedResource]);

    const runReport = async () => {
        if (!selectedResource) return;
        setLoading(true);
        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch(`${API_URL}/reports/adhoc`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    resource_id: selectedResource.id,
                    metric: activeMetric,
                    dimension: activeDimension,
                    start_date: startDate,
                    end_date: endDate,
                    filters: filters.filter(f => !f.key.startsWith('_')),
                    metric_field: activeMetric === 'revenue' ? 'amount' : (filters.find(f => f.key === '_metric_field')?.value || null),
                    aggregation: activeMetric === 'revenue' ? 'sum' : (filters.find(f => f.key === '_metric_agg')?.value || 'count')
                })
            });

            if (res.ok) {
                const data = await res.json();
                setReportData(data.data);
            } else {
                const err = await res.json();
                alert(`Error: ${err.detail || 'Failed to run report'}`);
            }
        } catch (err) {
            console.error("Report execution error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveReport = async () => {
        if (!newName) return alert("Please enter report name");
        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch(`${API_URL}/reports`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: newName,
                    resource_id: selectedResource.id,
                    config: JSON.stringify({
                        metric: activeMetric,
                        dimension: activeDimension,
                        chartType: chartType,
                        filters: filters
                    })
                })
            });
            if (res.ok) {
                alert("Report saved!");
                setNewName('');
                fetchReports();
            }
        } catch (err) {
            console.error("Save report error:", err);
        }
    };

    const handleSelectReport = (rid) => {
        setSelectedReportId(rid);
        if (!rid) return;
        const report = reports.find(r => r.id == rid);
        if (report) {
            const conf = JSON.parse(report.config);
            setActiveMetric(conf.metric || 'users');
            setActiveDimension(conf.dimension || 'date');
            setChartType(conf.chartType || 'bar');
            setFilters(conf.filters || []);
        }
    };

    const addFilter = () => {
        setFilters([...filters, { key: 'source', value: '' }]);
    };

    const removeFilter = (idx) => {
        setFilters(filters.filter((_, i) => i !== idx));
    };

    const updateFilter = (idx, field, val) => {
        const newFilters = [...filters];
        newFilters[idx][field] = val;
        setFilters(newFilters);
    };

    const maxValue = Math.max(...reportData.map(d => d.value), 1);
    const totalValue = reportData.reduce((acc, curr) => acc + curr.value, 0);

    return (
        <div className="fade-in" style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em' }}>{t('reports.title')}</h1>
                        <HelpButton section="reports" />
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <select
                        className="input-lux"
                        style={{ width: '240px', background: '#fff' }}
                        value={selectedReportId}
                        onChange={(e) => handleSelectReport(e.target.value)}
                    >
                        <option value="">-- {t('reports.select')} --</option>
                        {reports.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                    </select>
                    <button className="btn-premium" style={{ background: '#0f172a' }} onClick={() => setShowBuilder(!showBuilder)}>
                        {showBuilder ? 'Hide Panel' : 'Edit Report'}
                    </button>
                    <button className="btn-premium" onClick={runReport} disabled={loading}>
                        {loading ? '...' : t('reports.adhoc')}
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', flex: 1, gap: '24px', overflow: 'hidden' }}>
                {/* Left Panel: Builder */}
                {showBuilder && (
                    <div className="card-stat" style={{ width: '320px', padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div>
                            <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>Data Source</label>
                            <div className="form-field">
                                <label>{t('reports.metric')}</label>
                                <select className="input-lux" value={activeMetric} onChange={(e) => setActiveMetric(e.target.value)}>
                                    <option value="users">{t('reports.metrics.users')}</option>
                                    <option value="sessions">{t('reports.metrics.sessions')}</option>
                                    <option value="events">{t('reports.metrics.events')}</option>
                                    <option value="revenue">Revenue (Sum Amount)</option>
                                    <option value="custom_payload">Custom Payload Field</option>
                                </select>
                            </div>

                            {activeMetric === 'custom_payload' && (
                                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '12px' }}>
                                    <div className="form-field" style={{ marginBottom: '8px' }}>
                                        <label style={{ fontSize: '10px' }}>Field Key (e.g. amount, duration)</label>
                                        <input
                                            className="input-lux"
                                            style={{ padding: '6px' }}
                                            placeholder="amount"
                                            value={filters.find(f => f.key === '_metric_field')?.value || ''}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                const existing = filters.find(f => f.key === '_metric_field');
                                                if (existing) {
                                                    updateFilter(filters.indexOf(existing), 'value', val);
                                                } else {
                                                    setFilters([...filters, { key: '_metric_field', value: val }]);
                                                }
                                            }}
                                        />
                                    </div>
                                    <div className="form-field" style={{ marginBottom: 0 }}>
                                        <label style={{ fontSize: '10px' }}>Aggregation</label>
                                        <select
                                            className="input-lux"
                                            style={{ padding: '6px' }}
                                            value={filters.find(f => f.key === '_metric_agg')?.value || 'sum'}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                const existing = filters.find(f => f.key === '_metric_agg');
                                                if (existing) {
                                                    updateFilter(filters.indexOf(existing), 'value', val);
                                                } else {
                                                    setFilters([...filters, { key: '_metric_agg', value: val }]);
                                                }
                                            }}
                                        >
                                            <option value="sum">Sum</option>
                                            <option value="avg">Average</option>
                                            <option value="min">Min</option>
                                            <option value="max">Max</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                            <div className="form-field">
                                <label>{t('reports.dimension')}</label>
                                <select className="input-lux" value={activeDimension} onChange={(e) => setActiveDimension(e.target.value)}>
                                    <option value="date">{t('reports.dimensions.date')}</option>
                                    <option value="source">{t('reports.dimensions.source')}</option>
                                    <option value="country">{t('reports.dimensions.country')}</option>
                                    <option value="device">{t('reports.dimensions.device')}</option>
                                    <option value="event_name">{t('reports.dimensions.event_name')}</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>{t('reports.period')}</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <input type="date" className="input-lux" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                                <input type="date" className="input-lux" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                            </div>
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Filters</label>
                                <button style={{ border: 'none', background: 'none', color: '#2563eb', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }} onClick={addFilter}>+ Add</button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {filters.map((f, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                        <select className="input-lux" style={{ flex: 1, padding: '6px' }} value={f.key} onChange={(e) => updateFilter(i, 'key', e.target.value)}>
                                            <option value="source">Source</option>
                                            <option value="country">Country</option>
                                            <option value="device">Device</option>
                                            <option value="event_name">Event</option>
                                        </select>
                                        <input className="input-lux" style={{ flex: 1, padding: '6px' }} placeholder="Value" value={f.value} onChange={(e) => updateFilter(i, 'value', e.target.value)} />
                                        <button style={{ color: '#f43f5e', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => removeFilter(i)}>✕</button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>Visualization</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                                <button className={`btn-lux ${chartType === 'bar' ? 'active' : ''}`} style={{ padding: '8px', fontSize: '12px' }} onClick={() => setChartType('bar')}>Bar</button>
                                <button className={`btn-lux ${chartType === 'pie' ? 'active' : ''}`} style={{ padding: '8px', fontSize: '12px' }} onClick={() => setChartType('pie')}>Pie</button>
                                <button className={`btn-lux ${chartType === 'table' ? 'active' : ''}`} style={{ padding: '8px', fontSize: '12px' }} onClick={() => setChartType('table')}>Table</button>
                            </div>
                        </div>

                        <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
                            <input
                                className="input-lux"
                                placeholder="Report name..."
                                style={{ marginBottom: '12px' }}
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                            />
                            <button className="btn-premium" style={{ width: '100%', background: '#22c55e' }} onClick={handleSaveReport}>
                                {t('reports.save')}
                            </button>
                        </div>
                    </div>
                )}

                {/* Right Panel: Canvas */}
                <div className="card-stat" style={{ flex: 1, padding: '40px', background: '#f8fafc', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                    {reportData.length === 0 ? (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                            <div style={{ fontSize: '64px', marginBottom: '24px' }}>🎨</div>
                            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Canvas is Empty</h2>
                            <p style={{ fontSize: '14px' }}>Configure metrics and dimensions on the left, then click <b>Run Ad-hoc</b></p>
                        </div>
                    ) : (
                        <div style={{ background: '#fff', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', flex: 1 }}>
                            <div style={{ marginBottom: '32px' }}>
                                <h2 style={{ fontSize: '13px', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                                    {activeMetric} by {activeDimension}
                                </h2>
                                <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.03em', color: '#0f172a' }}>{totalValue.toLocaleString()}</h1>
                                <p style={{ fontSize: '14px', color: '#64748b' }}>{startDate} — {endDate}</p>
                            </div>

                            {chartType === 'bar' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {reportData.map((item, idx) => (
                                        <div key={idx}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                                                <span style={{ fontWeight: 700, color: '#334155' }}>{item.label}</span>
                                                <span style={{ color: '#64748b', fontWeight: 700 }}>{item.value.toLocaleString()} <span style={{ fontWeight: 400, marginLeft: '4px' }}>({((item.value / totalValue) * 100).toFixed(1)}%)</span></span>
                                            </div>
                                            <div style={{ height: '12px', background: '#f1f5f9', borderRadius: '100px', overflow: 'hidden' }}>
                                                <div
                                                    style={{
                                                        height: '100%',
                                                        width: `${(item.value / maxValue) * 100}%`,
                                                        background: `linear-gradient(90deg, #2563eb, #60a5fa)`,
                                                        borderRadius: '100px',
                                                        transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {chartType === 'pie' && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
                                    {reportData.map((item, idx) => {
                                        const percentage = (item.value / totalValue) * 100;
                                        return (
                                            <div key={idx} style={{ background: '#f8fafc', padding: '16px 24px', borderRadius: '12px', textAlign: 'center', minWidth: '140px' }}>
                                                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', fontWeight: 600 }}>{item.label}</div>
                                                <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>{percentage.toFixed(1)}%</div>
                                                <div style={{ fontSize: '11px', color: '#94a3b8' }}>{item.value} units</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {chartType === 'table' && (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                                            <th style={{ textAlign: 'left', padding: '16px', fontSize: '12px', fontWeight: 800, color: '#64748b' }}>{activeDimension.toUpperCase()}</th>
                                            <th style={{ textAlign: 'right', padding: '16px', fontSize: '12px', fontWeight: 800, color: '#64748b' }}>{activeMetric.toUpperCase()}</th>
                                            <th style={{ textAlign: 'right', padding: '16px', fontSize: '12px', fontWeight: 800, color: '#64748b' }}>SHARE</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.map((item, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '16px', fontSize: '14px', fontWeight: 600 }}>{item.label}</td>
                                                <td style={{ padding: '16px', fontSize: '14px', textAlign: 'right', fontWeight: 700 }}>{item.value.toLocaleString()}</td>
                                                <td style={{ padding: '16px', fontSize: '14px', textAlign: 'right', color: '#64748b' }}>{((item.value / totalValue) * 100).toFixed(1)}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .btn-lux {
                    background: #fff;
                    border: 1px solid #e2e8f0;
                    color: #64748b;
                    font-weight: 700;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-lux:hover {
                    border-color: #cbd5e1;
                    background: #f8fafc;
                }
                .btn-lux.active {
                    background: #0f172a;
                    color: #fff;
                    border-color: #0f172a;
                }
            `}</style>
        </div>
    );
}
