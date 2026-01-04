"use client";
import { useTranslation } from '../context/LanguageContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './page.module.css';
import { getFeatures, stats } from './content';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}`;

export default function LandingPage() {
  const { t, lang, setLanguage } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkRedirect = async () => {
      try {
        const res = await fetch(`${API_URL}/settings`);
        if (res.ok) {
          const data = await res.json();
          if (data.skip_landing === 'true') {
            router.replace('/login');
          }
        }
      } catch (err) {
        console.error("Failed to check redirect setting:", err);
      }
    };
    checkRedirect();

    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [router]);

  const features = getFeatures(t);

  return (
    <div className={styles.container}>

      {/* Header */}
      <header className={`${styles.stickyHeader} ${scrolled ? styles.scrolledHeader : ''}`}>
        <div className={styles.headerContainer}>
          {/* Logo */}
          <div className={styles.logoGroup}>
            <div className={styles.logoIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <span className={styles.logoText}>OpenTrace</span>
          </div>

          {/* Nav */}
          <nav className={styles.desktopNav}>
            <div className={styles.navLinks}>
              {['features', 'opensource'].map(item => (
                <a key={item} href={`#${item}`} className={styles.navItem}>
                  {item === 'features' ? t('landing.nav.features') : t('landing.nav.opensource')}
                </a>
              ))}
            </div>

            <div className={styles.navActions}>
              <div className={styles.langGroup}>
                {['en', 'ua', 'pl', 'de'].map(l => (
                  <button
                    key={l}
                    onClick={() => setLanguage(l)}
                    className={`${styles.langBtn} ${lang === l ? styles.langBtnActive : ''}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <Link href="/login" className={styles.loginBtn}>
                {t('nav.signIn')}
              </Link>
            </div>
          </nav>

          {/* Mobile Menu Toggle */}
          <div className={styles.mobileMenuToggle}>
            <Link href="/login" className={styles.loginBtn} style={{ padding: '8px 20px' }}>
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeDot}></span>
            {t('landing.hero.badge')}
          </div>
          <h1 className={styles.heroTitle}>
            <span>{t('landing.hero.title').split(' ')[0]}</span>
            {t('landing.hero.title').split(' ').slice(1).join(' ')}
          </h1>
          <p className={styles.heroSubtitle}>{t('landing.hero.subtitle')}</p>
          <div className={styles.heroActions}>
            <Link href="/login" className={styles.primaryBtn}>
              {t('landing.hero.cta')}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </Link>
            <a href="https://github.com/del4pp/opentrace" target="_blank" className={styles.secondaryBtn}>
              GitHub
            </a>
          </div>
        </div>

        {/* Right: Abstract UI Visual */}
        <div className={styles.heroVisual}>
          <div className={styles.visualWrapper}>
            <div className={styles.glassCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Growth</div>
                  <div style={{ fontSize: '24px', fontWeight: 800 }}>+42.8%</div>
                </div>
                <div style={{ width: '32px', height: '32px', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  📈
                </div>
              </div>
              <div style={{ height: '40px', display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
                {[30, 50, 40, 70, 60, 90, 80].map((h, i) => (
                  <div key={i} style={{ flex: 1, height: `${h}%`, background: i === 5 ? '#6366f1' : 'rgba(255,255,255,0.1)', borderRadius: '2px' }}></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats - Tech Style */}
      <section className={styles.statsSection}>
        <div className={styles.statsGrid}>
          {stats.map((stat, i) => (
            <div key={i} className={styles.statItem}>
              <div className={styles.statValue}>{stat.value}</div>
              <div className={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className={styles.featuresSection}>
        <div className={styles.featuresContainer}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t('landing.features.title')}</h2>
            <p className={styles.sectionSubtitle}>{t('landing.features.subtitle')}</p>
          </div>

          <div className={styles.featuresGrid}>
            {features.map((f, i) => (
              <div key={i} className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {f.svg}
                  </svg>
                </div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className={styles.pricingSection}>
        <div className={styles.pricingContainer}>
          <div className={styles.glassPricing}>
            <div className={styles.pricingContent}>
              <div className={styles.heroBadge} style={{ background: 'rgba(255,255,255,0.05)', color: '#fff' }}>
                Open Source
              </div>
              <h2 className={styles.pricingTitle}>Absolutely Free. Always.</h2>
              <p className={styles.pricingDesc}>
                We believe analytics should be accessible to everyone. Host it yourself, own your data, and never pay a penny for basic tracking.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {['Unlimited Events', 'Unlimited Websites', 'Full Data Ownership', 'Community Support'].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '20px', height: '20px', background: 'rgba(34, 197, 94, 0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                    <span style={{ fontSize: '16px', color: '#94a3b8' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.pricingCard}>
              <div style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', marginBottom: '20px' }}>Self-Hosted</div>
              <div className={styles.cardPrice}><span>$</span>0</div>
              <div style={{ color: '#64748b', fontSize: '16px', marginBottom: '40px' }}>Lifetime access, zero cost</div>
              <a href="https://github.com/del4pp/opentrace" target="_blank" className={styles.cardBtn}>
                Deploy Now
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '10px' }}><path d="M7 17L17 7"></path><polyline points="7 7 17 7 17 17"></polyline></svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Language Section moved to footer area or integrated */}

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <div className={styles.footerContent}>
            <div>
              <div className={styles.footerBrand}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <div className={styles.logoIcon} style={{ width: '28px', height: '28px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" />
                  </div>
                  <span style={{ fontSize: '20px', fontWeight: 800 }}>OpenTrace</span>
                </div>
              </div>
              <div className={styles.footerDesc}>
                The ultimate open-source alternative to Google Analytics. Built for developers who value privacy and performance.
              </div>
            </div>
            <div className={styles.footerLinks}>
              <div>
                <div className={styles.footerGroupTitle}>Product</div>
                <div className={styles.footerGroupLinks}>
                  {['Features', 'Security', 'Pricing'].map(i => (
                    <a key={i} href="#" className={styles.footerLink}>{i}</a>
                  ))}
                </div>
              </div>
              <div>
                <div className={styles.footerGroupTitle}>Resources</div>
                <div className={styles.footerGroupLinks}>
                  {['Documentation', 'GitHub', 'API Reference'].map(i => (
                    <a key={i} href="#" className={styles.footerLink}>{i}</a>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className={styles.copyright}>
            © 2026 OpenTrace Analytics. Made with ❤️ in Ukraine. AGPL v3 License.
          </div>
        </div>
      </footer>
    </div>
  );
}
