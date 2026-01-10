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
              <a href="#tech" className={styles.navItem}>{t('landing.nav.opensource')}</a>
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
          <h1 className={styles.heroTitle}>{t('landing.hero.title')}</h1>
          <p className={styles.heroSubtitle}>
            {t('landing.hero.subtitle')}
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
            <div className={styles.statLabel}>{t('landing.stats_block.speed')}</div>
            <div className={styles.statValue}>&lt; 0.05s</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>{t('landing.stats_block.integrity')}</div>
            <div className={styles.statValue}>99.9%</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statLabel}>{t('landing.stats_block.scalability')}</div>
            <div className={styles.statValue}>{t('landing.stats_block.events')}</div>
          </div>
        </div>
      </section>

      {/* Technical Block */}
      <section id="tech" className={styles.featuresSection} style={{ background: '#fafafa' }}>
        <div className={styles.featuresContainer}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t('landing.tech_stack.title')}</h2>
            <p className={styles.sectionSubtitle}>{t('landing.tech_stack.subtitle')}</p>
          </div>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard} style={{ background: '#fff' }}>
              <div className={styles.featureIcon}>⚡</div>
              <h3 className={styles.featureTitle}>{t('landing.tech_stack.fastapi.title')}</h3>
              <p className={styles.featureDesc}>{t('landing.tech_stack.fastapi.desc')}</p>
            </div>
            <div className={styles.featureCard} style={{ background: '#fff' }}>
              <div className={styles.featureIcon}>📊</div>
              <h3 className={styles.featureTitle}>{t('landing.tech_stack.clickhouse.title')}</h3>
              <p className={styles.featureDesc}>{t('landing.tech_stack.clickhouse.desc')}</p>
            </div>
            <div className={styles.featureCard} style={{ background: '#fff' }}>
              <div className={styles.featureIcon}>⚛️</div>
              <h3 className={styles.featureTitle}>{t('landing.tech_stack.nextjs.title')}</h3>
              <p className={styles.featureDesc}>{t('landing.tech_stack.nextjs.desc')}</p>
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
              {[
                { key: 'dashboards', en: 'Custom Dashboards' },
                { key: 'retention', en: 'Infinite Data Retention' },
                { key: 'security', en: 'Secure Architecture' },
                { key: 'api', en: 'API Access' }
              ].map((item, i) => (
                <div key={i} className={styles.cardFeatureItem}>
                  <div className={styles.checkIcon}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                  <span style={{ fontSize: '15px' }}>{t(`landing.enterprise.${item.key}`)}</span>
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
              <div className={styles.socialLinks}>
                <a href="https://t.me/opentrace_analytics" target="_blank" className={styles.socialIcon} title="Telegram">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
                </a>
                <a href="https://discord.gg/opentrace" target="_blank" className={styles.socialIcon} title="Discord">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="1" /><circle cx="15" cy="12" r="1" /><path d="M7.5 7.1c2.1-.9 4.9-.9 7 0M5 19l4.5-1.5M19 19l-4.5-1.5" /></svg>
                </a>
                <a href="https://github.com/del4pp/opentrace" target="_blank" className={styles.socialIcon} title="GitHub">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></svg>
                </a>
                <a href="https://instagram.com/opentrace" target="_blank" className={styles.socialIcon} title="Instagram">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                </a>
              </div>
            </div>
            <div className={styles.footerLinks}>
              <div>
                <div className={styles.footerGroupTitle}>{t('landing.footer.product')}</div>
                <div className={styles.footerGroupLinks}>
                  <a href="#features" className={styles.footerLink}>{t('landing.nav.features')}</a>
                  <a href="#tech" className={styles.footerLink}>{t('landing.nav.opensource')}</a>
                </div>
              </div>
              <div>
                <div className={styles.footerGroupTitle}>{t('landing.footer.community')}</div>
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
