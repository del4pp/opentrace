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
            <Link href="/login" className={styles.mobileLoginBtn}>
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
          <h1 className={styles.heroTitle}>{t('landing.hero.title')}</h1>
          <p className={styles.heroSubtitle}>{t('landing.hero.subtitle')}</p>
          <div className={styles.heroActions}>
            <Link href="/login" className={styles.primaryBtn}>
              {t('landing.hero.cta')}
            </Link>
            <a href="https://github.com/opentrace" target="_blank" className={styles.secondaryBtn}>
              GitHub
            </a>
          </div>
        </div>

        {/* Right: Abstract UI Visual */}
        <div className={styles.heroVisual}>
          <div className={styles.visualCard}>
            {/* Mock Chart */}
            <div className={styles.chartHeader}>
              <div>
                <div className={styles.chartLabel}>Active Users</div>
                <div className={styles.chartValue}>24,592</div>
              </div>
              <div className={styles.chartChange}>+12.4%</div>
            </div>
            <div className={styles.chartBars}>
              {[40, 65, 50, 80, 55, 90, 70, 85, 60, 95, 75, 100].map((h, i) => (
                <div key={i} className={`${styles.chartBar} ${i === 11 ? styles.chartBarActive : ''}`} style={{ height: `${h}%` }}></div>
              ))}
            </div>
          </div>
          {/* Floating Element */}
          <div className={styles.cleanFloat}>
            <div className={styles.floatHeader}>
              <div className={styles.floatDot}></div>
              <div className={styles.floatTitle}>Live Traffic</div>
            </div>
            <div className={`${styles.floatRow} ${styles.floatRowBorder}`}>
              <span>USA</span>
              <span>8,421</span>
            </div>
            <div className={styles.floatRow}>
              <span>Germany</span>
              <span>4,120</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats - Tech Style */}
      <section className={styles.statsSection}>
        <div className={styles.statsGrid}>
          {stats.map((stat, i) => (
            <div key={i} className={styles.statItem}>
              <div className={styles.statLabel}>{stat.label}</div>
              <div className={styles.statValue}>{stat.value}</div>
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
          <div className={styles.pricingBadge}>
            Open Source
          </div>
          <h2 className={styles.pricingTitle}>Absolutely Free. Always.</h2>
          <p className={styles.pricingDesc}>
            We believe analytics should be accessible to everyone. Host it yourself, own your data, and never pay a penny for basic tracking.
          </p>

          <div className={styles.pricingCard}>
            <div className={styles.cardType}>Self-Hosted</div>
            <div className={styles.cardPrice}>$0<span className={styles.cardPricePeriod}>/mo</span></div>
            <div className={styles.cardFeatures}>
              {['Unlimited Events', 'Unlimited Websites', 'Full Data Ownership', 'Community Support'].map((item, i) => (
                <div key={i} className={styles.cardFeatureItem}>
                  <div className={styles.checkIcon}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                  <span style={{ fontSize: '15px' }}>{item}</span>
                </div>
              ))}
            </div>
            <a href="https://github.com/opentrace" target="_blank" className={styles.cardBtn}>
              Deploy Now
            </a>
          </div>
        </div>
      </section>

      {/* Language Section */}
      <section className={styles.langSection}>
        <h2 className={styles.langTitle}>{t('landing.languages.title')}</h2>
        <div className={styles.langGrid}>
          {[
            { code: 'en', label: 'English' },
            { code: 'ua', label: 'Ukrainian' },
            { code: 'pl', label: 'Polish' },
            { code: 'de', label: 'German' }
          ].map(l => (
            <button
              key={l.code}
              onClick={() => setLanguage(l.code)}
              className={styles.langCard}
            >
              <div className={styles.langIcon}>
                {l.code.toUpperCase()}
              </div>
              <span className={styles.langLabel}>{l.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <div className={styles.footerContent}>
            <div>
              <div className={styles.footerBrand}>OpenTrace</div>
              <div className={styles.footerDesc}>
                Open-source analytics for everyone. <br />
                Privacy focused, self-hosted, powerful.
              </div>
            </div>
            <div className={styles.footerLinks}>
              <div>
                <div className={styles.footerGroupTitle}>Product</div>
                <div className={styles.footerGroupLinks}>
                  {['Features', 'Pricing'].map(i => (
                    <a key={i} href="#" className={styles.footerLink}>{i}</a>
                  ))}
                </div>
              </div>
              <div>
                <div className={styles.footerGroupTitle}>Resources</div>
                <div className={styles.footerGroupLinks}>
                  {['Documentation', 'GitHub', 'API'].map(i => (
                    <a key={i} href="#" className={styles.footerLink}>{i}</a>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className={styles.copyright}>
            © 2025 OpenTrace Analytics. AGPL v3 License.
          </div>
        </div>
      </footer>
    </div>
  );
}
