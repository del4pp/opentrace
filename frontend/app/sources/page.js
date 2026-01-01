"use client";
import { useTranslation } from '../../context/LanguageContext';

export default function SourcesPage() {
    const { t } = useTranslation();

    const data = [
        { name: 'Corporate Website', type: 'Web', id: 'ot_web_001', events: '1.2M', status: 'Active' },
        { name: 'iOS Application', type: 'Mobile', id: 'ot_ios_772', events: '450k', status: 'Active' },
        { name: 'Beta Landing', type: 'Web', id: 'ot_web_test', events: '12k', status: 'Inactive' },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: 800 }}>{t('sources.title')}</h1>
                    <p className="subtitle">Manage external telemetry ingestion nodes</p>
                </div>
                <button className="btn-premium">{t('sources.add')}</button>
            </div>

            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{t('sources.table.name')}</th>
                            <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{t('sources.table.type')}</th>
                            <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{t('sources.table.id')}</th>
                            <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{t('sources.table.events')}</th>
                            <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{t('sources.table.status')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, i) => (
                            <tr key={i} style={{ borderBottom: i === data.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                                <td style={{ padding: '20px 24px', fontWeight: 700 }}>{item.name}</td>
                                <td style={{ padding: '20px 24px', color: '#64748b' }}>{item.type}</td>
                                <td style={{ padding: '20px 24px', fontFamily: 'monospace', color: '#94a3b8' }}>{item.id}</td>
                                <td style={{ padding: '20px 24px', fontWeight: 700 }}>{item.events}</td>
                                <td style={{ padding: '20px 24px' }}>
                                    <span style={{
                                        padding: '4px 10px',
                                        borderRadius: '100px',
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        background: item.status === 'Active' ? '#f0fdf4' : '#fef2f2',
                                        color: item.status === 'Active' ? '#166534' : '#991b1b'
                                    }}>
                                        {item.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
