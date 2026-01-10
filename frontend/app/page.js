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

  const featuresList = getFeatures(t);

  return (
    <div className={styles.container}>

      {/* Header */}
      <header className={`${styles.stickyHeader} ${scrolled ? styles.scrolledHeader : ''}`}>
        <div className={styles.headerContainer}>
          <div className={styles.logoGroup}>
            <div className={styles.logoIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <span className={styles.logoText}>OpenTrace</span>
          </div>

          <nav className={styles.desktopNav}>
            <div className={styles.navLinks}>
              <a href="#features" className={styles.navItem}>{t('landing.nav.features')}</a>
              <a href="#tech" className={styles.navItem}>Technology</a>
              <a href="#insights" className={styles.navItem}>Insights</a>
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
          <h1 className={styles.heroTitle}>Master Your Product Analytics</h1>
          <p className={styles.heroSubtitle}>
            Gain deep insights into your users' behavior with high-performance event tracking.
            Real-time data processing for modern businesses.
          </p>
          <div className={styles.heroActions}>
            <Link href="/login" className={styles.primaryBtn}>
              {t('landing.hero.cta')}
            </Link>
            <a href="https://github.com/opentrace" target="_blank" className={styles.secondaryBtn}>
              Documentation
            </a>
          </div>
        </div>

        <div className={styles.heroVisual}>
          <div className={styles.visualCard}>
            <div className={styles.chartHeader}>
              <div>
                <div className={styles.chartLabel}>Daily Active Users</div>
                <div className={styles.chartValue}>24,592</div>
              </div>
              <div className={styles.chartChange}>↑ 12.4%</div>
            </div>
            <div className={styles.chartBars}>
              {[40, 65, 50, 80, 55, 90, 70, 85, 60, 95, 75, 100].map((h, i) => (
                <div key={i} className={`${styles.chartBar} ${i === 11 ? styles.chartBarActive : ''}`} style={{ height: `${h}%` }}></div>
              ))}
            </div>
          </div>
          <div className={styles.cleanFloat}>
            <div className={styles.floatHeader}>
              <div className={styles.floatDot}></div>
              <div className={styles.floatTitle}>Real-time Stream</div>
            </div>
            <div className={`${styles.floatRow} ${styles.floatRowBorder}`}>
              <span>Session Initialized</span>
              <span>just now</span>
            </div>
            <div className={styles.floatRow}>
              <span>Conversion Logged</span>
              <span>2s ago</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="insights" className={styles.statsSection}>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>Query Speed</div>
            <div className={styles.statValue}>&lt; 0.05s</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>Data Integrity</div>
            <div className={styles.statValue}>99.9%</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>Scalability</div>
            <div className={styles.statValue}>Billion+ Events</div>
          </div>
        </div>
      </section>

      {/* Technical Block */}
      <section id="tech" className={styles.featuresSection} style={{ background: '#fafafa' }}>
        <div className={styles.featuresContainer}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Built for Scale</h2>
            <p className={styles.sectionSubtitle}>Developed with the most advanced technical stack to ensure stability and performance.</p>
          </div>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard} style={{ background: '#fff' }}>
              <div className={styles.featureIcon}>⚡</div>
              <h3 className={styles.featureTitle}>FastAPI Engine</h3>
              <p className={styles.featureDesc}>Asynchronous core handling thousands of requests per second with minimal overhead.</p>
            </div>
            <div className={styles.featureCard} style={{ background: '#fff' }}>
              <div className={styles.featureIcon}>📊</div>
              <h3 className={styles.featureTitle}>ClickHouse Storage</h3>
              <p className={styles.featureDesc}>The world's fastest columnar database for analytical workloads and real-time reporting.</p>
            </div>
            <div className={styles.featureCard} style={{ background: '#fff' }}>
              <div className={styles.featureIcon}>⚛️</div>
              <h3 className={styles.featureTitle}>Next.js Interface</h3>
              <p className={styles.featureDesc}>Responsive and modern frontend built with the latest React patterns for fluid experience.</p>
            </div>
          </div>
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
            {featuresList.slice(0, 6).map((f, i) => (
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

      {/* Deployment Section */}
      <section className={styles.pricingSection}>
        <div className={styles.pricingContainer}>
          <h2 className={styles.pricingTitle}>{t('landing.cta.title')}</h2>
          <p className={styles.pricingDesc}>
            {t('landing.cta.desc')}
          </p>
          <div className={styles.pricingCard}>
            <div className={styles.cardType}>Enterprise Edition</div>
            <div className={styles.cardPrice}>Tier-1<span className={styles.cardPricePeriod}> Infrastructure</span></div>
            <div className={styles.cardFeatures}>
              {['Custom Dashboards', 'Infinite Data Retention', 'Secure Architecture', 'API Access'].map((item, i) => (
                <div key={i} className={styles.cardFeatureItem}>
                  <div className={styles.checkIcon}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                  <span style={{ fontSize: '15px' }}>{item}</span>
                </div>
              ))}
            </div>
            <Link href="/login" className={styles.cardBtn}>
              {t('landing.cta.button')}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <div className={styles.footerContent}>
            <div>
              <div className={styles.footerBrand}>OpenTrace</div>
              <div className={styles.footerDesc}>
                {t('landing.footer.tagline')}
              </div>
            </div>
            <div className={styles.footerLinks}>
              <div>
                <div className={styles.footerGroupTitle}>Product</div>
                <div className={styles.footerGroupLinks}>
                  <a href="#features" className={styles.footerLink}>Features</a>
                  <a href="#tech" className={styles.footerLink}>Tech</a>
                </div>
              </div>
              <div>
                <div className={styles.footerGroupTitle}>Company</div>
                <div className={styles.footerGroupLinks}>
                  <a href="#" className={styles.footerLink}>About</a>
                  <a href="#" className={styles.footerLink}>Contact</a>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.copyright}>
            {t('footer.copyright')}
          </div>
        </div>
      </footer>
    </div>
  );
}
