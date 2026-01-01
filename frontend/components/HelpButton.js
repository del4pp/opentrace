"use client";
import { useState } from 'react';

export default function HelpButton({ title, content }) {
    const [show, setShow] = useState(false);

    return (
        <>
            <button
                className="btn-help"
                onClick={() => setShow(true)}
                style={{
                    background: '#4f46e5',
                    color: 'white',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)',
                    fontSize: '14px'
                }}
            >
                i
            </button>

            {show && (
                <div className="modal-overlay" onClick={() => setShow(false)}>
                    <div className="modal-content" style={{ maxWidth: '400px', padding: '32px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '32px', height: '32px', background: '#eef2ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>ℹ️</div>
                                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>{title}</h3>
                            </div>
                            <button
                                onClick={() => setShow(false)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', color: '#94a3b8' }}
                            >
                                ×
                            </button>
                        </div>
                        <div style={{ color: '#475569', fontSize: '14px', lineHeight: '1.7', background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            {content}
                        </div>
                        <button
                            className="btn-premium"
                            style={{ width: '100%', marginTop: '24px' }}
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
