"use client";
import { useState } from 'react';
import { useTranslation } from '../context/LanguageContext';

export default function HelpButton({ title, content, section }) {
    const [show, setShow] = useState(false);
    const { t } = useTranslation();

    // If section is provided, pull title/content from translations
    const helpTitle = section ? t(`${section}.help.title`) : title;
    const helpContent = section ? t(`${section}.help.content`) : content;

    return (
        <>
            <button
                className="btn-help"
                onClick={(e) => {
                    e.preventDefault();
                    setShow(true);
                }}
                style={{
                    background: '#6366f1',
                    color: 'white',
                    border: 'none',
                    boxShadow: '0 4px 10px -2px rgba(99, 102, 241, 0.3)',
                    fontSize: '11px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontWeight: 900,
                    marginLeft: '12px',
                    flexShrink: 0,
                    transform: 'translateY(-1px)'
                }}
            >
                ?
            </button>

            {show && (
                <div className="modal-overlay" onClick={() => setShow(false)} style={{ zIndex: 10000 }}>
                    <div className="modal-content" style={{ maxWidth: '440px', padding: '32px', borderRadius: '24px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', background: '#e0e7ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>💡</div>
                                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#1e1b4b' }}>{helpTitle}</h3>
                            </div>
                            <button
                                onClick={() => setShow(false)}
                                style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#64748b', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                ×
                            </button>
                        </div>
                        <div style={{ color: '#475569', fontSize: '14px', lineHeight: '1.7', background: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                            {helpContent}
                        </div>
                        <button
                            className="btn-premium"
                            style={{ width: '100%', marginTop: '24px', padding: '14px' }}
                            onClick={() => setShow(false)}
                        >
                            Зрозумів / Got it
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
