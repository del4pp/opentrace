"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useResource } from '../context/ResourceContext';
import { useTranslation } from '../context/LanguageContext';

export default function Layout({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const { t, lang, setLanguage } = useTranslation();
    const { resources, selectedResource, selectResource, loading: resLoading } = useResource();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const isPublicPage = pathname === '/login' || pathname === '/' || pathname.startsWith('/forgot-password') || pathname.startsWith('/reset-password');

    useEffect(() => {
        const savedTheme = localStorage.getItem('ot_theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);

        const checkAuth = () => {
            const user = localStorage.getItem('user');
            const token = localStorage.getItem('access_token');

            if (!user || !token) {
                if (!isPublicPage) {
                    router.push('/login');
                    return;
                }
                setIsAuthenticated(false);
            } else {
                try {
                    const userData = JSON.parse(user);
                    if (userData && userData.user_id) {
                        setIsAuthenticated(true);
                        if (userData.is_first_login && pathname !== '/profile' && !isPublicPage) {
                            router.replace('/profile');
                        }
                    } else {
                        localStorage.removeItem('user');
                        localStorage.removeItem('access_token');
                        if (!isPublicPage) {
                            router.push('/login');
                            return;
                        }
                        setIsAuthenticated(false);
                    }
                } catch (e) {
                    localStorage.removeItem('user');
                    localStorage.removeItem('access_token');
                    setIsAuthenticated(false);
                    if (!isPublicPage) {
                        router.push('/login');
                        return;
                    }
                }
            }
            setIsChecking(false);
        };

        checkAuth();
    }, [pathname, router, isPublicPage]);

    if (isPublicPage) {
        return <>{children}</>;
    }

    if (isChecking) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div>Loading...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
        window.location.href = '/login';
    };

    const navGroups = [
        {
            title: t('nav.groups.analytics'),
            items: [
                { label: t('nav.funnels'), href: '/funnels' },
                { label: t('nav.retention'), href: '/retention' },
                { label: t('nav.segments'), href: '/segments' },
                { label: t('reports.title'), href: '/reports' },
                { label: t('nav.explorer'), href: '/explorer' },
                { label: t('nav.live'), href: '/live' },
            ]
        },
        {
            title: t('nav.groups.tracking'),
            items: [
                { label: t('nav.resources'), href: '/resources' },
                { label: t('nav.campaigns'), href: '/campaigns' },
                { label: t('nav.events'), href: '/events' },
                { label: t('nav.tags'), href: '/tags' },
            ]
        },
        {
            title: t('nav.groups.system'),
            items: [
                { label: t('nav.settings'), href: '/settings' },
            ]
        }
    ];

    if (isChecking) {
        return null;
    }

    return (
        <div className="app-shell">
            {/* Mobile Header */}
            <div className="mobile-header" style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                <Link href="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 900, margin: 0 }}>OpenTrace</h2>
                </Link>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
                >
                    {isMobileMenuOpen ? '✕' : '☰'}
                </button>
            </div>

            {/* Sidebar-Lux */}
            <aside className={`sidebar-lux ${isMobileMenuOpen ? 'open' : ''}`}>
                <div style={{ padding: '0 16px 40px', fontSize: '22px', fontWeight: 900, letterSpacing: '-0.06em', color: 'var(--text)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link href="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
                        OpenTrace
                    </Link>
                    {isMobileMenuOpen && (
                        <button onClick={() => setIsMobileMenuOpen(false)} style={{ background: 'none', border: 'none', fontSize: '18px', display: 'none' }}>✕</button>
                    )}
                </div>

                <nav style={{ flex: 1, overflowY: 'auto', paddingBottom: '20px' }} className="thin-scrollbar">
                    {navGroups.map((group, gidx) => (
                        <div key={gidx} style={{ marginBottom: '32px' }}>
                            <div style={{
                                padding: '0 16px 12px',
                                fontSize: '11px',
                                fontWeight: 800,
                                color: '#94a3b8',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                {group.title}
                            </div>
                            {group.items.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`nav-link-lux ${pathname === item.href ? 'active' : ''}`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    ))}
                </nav>

                {/* Sticky Bottom Section */}
                <div style={{
                    padding: '20px 8px 8px',
                    borderTop: '1px solid var(--border)',
                    background: 'var(--bg)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                }}>
                    <div className="lang-switcher">
                        {['en', 'ua', 'pl', 'de'].map(l => (
                            <button
                                key={l}
                                className={`lang-btn ${lang === l ? 'active' : ''}`}
                                onClick={() => setLanguage(l)}
                                style={{ minWidth: '35px', height: '32px' }}
                            >
                                {l.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    <a
                        href="https://github.com/del4pp/opentrace"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '10px',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '10px',
                            textDecoration: 'none',
                            color: '#475569',
                            fontSize: '11px',
                            fontWeight: 700,
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                        Main Version (Repo)
                    </a>
                </div>
            </aside>

            {isMobileMenuOpen && (
                <div
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 950 }}
                    onClick={() => setIsMobileMenuOpen(false)}
                ></div>
            )}

            <main className="main-view">
                {/* Top Bar with Resource Switcher */}
                <div className="top-bar">
                    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
                        <div className="resource-switcher">
                            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginRight: '12px' }}>Resource:</div>
                            <select
                                className="resource-select"
                                value={selectedResource?.id || ''}
                                onChange={(e) => selectResource(e.target.value)}
                            >
                                {resLoading ? (
                                    <option>Loading...</option>
                                ) : resources.length > 0 ? (
                                    resources.map(r => (
                                        <option key={r.id} value={r.id}>
                                            {r.name} ({r.type})
                                        </option>
                                    ))
                                ) : (
                                    <option value="">No resources found</option>
                                )}
                            </select>
                        </div>
                        <div suppressHydrationWarning style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: '32px' }}>
                            <span>{new Date().toLocaleDateString()}</span>

                            <div style={{
                                paddingLeft: '24px',
                                borderLeft: '1px solid #e2e8f0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                cursor: 'pointer',
                                padding: '8px 16px',
                                borderRadius: '12px',
                                transition: 'all 0.2s'
                            }}
                                className="profile-trigger"
                                onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                            >
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>Admin User</div>
                                    <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>System Administrator</div>
                                </div>
                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #0f172a, #334155)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '14px', fontWeight: 700 }}>
                                    AD
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleLogout(); }}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#f43f5e',
                                        fontSize: '12px',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        padding: '4px 8px',
                                        marginLeft: '8px'
                                    }}
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 24px', width: '100%' }}>
                    {children}
                </div>
            </main>
        </div>
    );
}
