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
                { label: t('nav.views'), href: '/dashboard' },
                { label: t('nav.analytics'), href: '/analytics' },
                { label: t('nav.funnels'), href: '/funnels' },
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
                <h2 style={{ fontSize: '18px', fontWeight: 900, margin: 0 }}>OpenTrace</h2>
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
                    OpenTrace
                    {isMobileMenuOpen && (
                        <button onClick={() => setIsMobileMenuOpen(false)} style={{ background: 'none', border: 'none', fontSize: '18px', display: 'none' }}>✕</button>
                    )}
                </div>

                <nav style={{ flex: 1 }}>
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

                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', padding: '0 8px' }}>
                    <div className="lang-switcher">
                        {['en', 'ua', 'pl', 'de'].map(l => (
                            <button
                                key={l}
                                className={`lang-btn ${lang === l ? 'active' : ''}`}
                                onClick={() => setLanguage(l)}
                                style={{ minWidth: '35px' }}
                            >
                                {l.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    <div style={{ padding: '16px', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <div style={{ fontSize: '12px', fontWeight: 800 }}>Admin User</div>
                            <button
                                onClick={handleLogout}
                                style={{ background: 'none', border: 'none', color: '#f43f5e', fontSize: '11px', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                            >
                                Logout
                            </button>
                        </div>
                        <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>System Administrator</div>
                    </div>
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
                        <div suppressHydrationWarning style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>
                            {new Date().toLocaleDateString()}
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
