"use client";
import { useTranslation } from '../context/LanguageContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './page.module.css';
import { getFeatures, stats, languages } from './content';

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

    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [router]);

  const features = getFeatures(t);

  return (
    <div className={styles.container}>
      <div className={styles.bgGlow}></div>

      {/* Header */}
      <header className={`${styles.stickyHeader} ${scrolled ? styles.scrolledHeader : ''}`}>
        <div className={styles.headerContainer}>
          <div className={styles.logoGroup}>
            <div className={styles.logoIconLux}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <span className={styles.logoTextLux}>OpenTrace</span>
          </div>

          <nav className={styles.desktopNav}>
            <div className={styles.navLinks}>
              <a href="#features" className={styles.navItemLux}>{t('landing.nav.features')}</a>
              <a href="#stats" className={styles.navItemLux}>Insights</a>
              <a href="#pricing" className={styles.navItemLux}>Deployment</a>
            </div>

            <div className={styles.navActionsLux}>
              <div className={styles.langSelectorLux}>
                {languages.map(l => (
                  <button
                    key={l.code}
                    onClick={() => setLanguage(l.code)}
                    className={`${styles.langBtnLux} ${lang === l.code ? styles.langBtnActiveLux : ''}`}
                  >
                    {l.code}
                  </button>
                ))}
              </div>
              <Link href="/login" className={styles.loginBtnLux}>
                {t('nav.signIn')}
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className={styles.heroLux}>
        <div className={styles.heroContentLux}>
          <div className={styles.heroBadgeLux}>
            <span className={styles.ping}></span>
            Now supporting ClickHouse 24.1
          </div>
          <h1 className={styles.heroTitleLux}>
            Trace Every <span className={styles.gradientText}>Interaction</span>.
            <br /> Own Every <span className={styles.gradientText}>Data Point</span>.
          </h1>
          <p className={styles.heroSubtitleLux}>
            The open-source alternative to Google Analytics and Mixpanel. High-performance event tracking with ClickHouse, FastAPI, and Next.js.
          </p>
          <div className={styles.heroActionsLux}>
            <Link href="/login" className={styles.primaryBtnLux}>
              Get Started Free
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </Link>
            <a href="https://github.com/del4pp/opentrace" target="_blank" className={styles.secondaryBtnLux}>
              Star on GitHub
            </a>
          </div>

          <div className={styles.heroTrust}>
            <span>Trusted by developers at</span>
            <div className={styles.trustLogos}>
              <div className={styles.trustItem}>Vercel</div>
              <div className={styles.trustItem}>Neon</div>
              <div className={styles.trustItem}>ClickHouse</div>
              <div className={styles.trustItem}>Supabase</div>
            </div>
          </div>
        </div>

        <div className={styles.heroVisualLux}>
          <div className={styles.visualMain}>
            {/* This is where the generated image would go, or a CSS representaiton */}
            <div className={styles.glowOrb}></div>
            <div className={styles.mockDashboard}>
              <div className={styles.mockHeader}>
                <div className={styles.mockDots}>
                  <span></span><span></span><span></span>
                </div>
              </div>
              <div className={styles.mockBody}>
                <div className={styles.mockMetric}>
                  <div className={styles.mockLabel}>Real-time Visitors</div>
                  <div className={styles.mockValue}>1,284</div>
                  <div className={styles.mockChart}>
                    {[40, 70, 45, 90, 65, 80, 50, 95].map((h, i) => (
                      <div key={i} style={{ height: `${h}%` }}></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className={styles.featuresLux}>
        <div className={styles.sectionHeaderLux}>
          <h2 className={styles.sectionTitleLux}>Engineered for <span className={styles.gradientText}>Performance</span></h2>
          <p className={styles.sectionSubtitleLux}>Built with the modern stack to handle millions of events per second with sub-millisecond latency.</p>
        </div>

        <div className={styles.featuresGridLux}>
          {features.map((f, i) => (
            <div key={i} className={styles.featureCardLux}>
              <div className={styles.featureIconLux}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {f.svg}
                </svg>
              </div>
              <h3 className={styles.featureTitleLux}>{f.title}</h3>
              <p className={styles.featureDescLux}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack / Stats */}
      <section id="stats" className={styles.techLux}>
        <div className={styles.techLayout}>
          <div className={styles.techInfo}>
            <h2 className={styles.techTitle}>Extreme Performance. <br />Zero Overhead.</h2>
            <div className={styles.techItems}>
              <div className={styles.techItem}>
                <h3>FastAPI</h3>
                <p>Asynchronous Python backend for lightning-fast API responses.</p>
              </div>
              <div className={styles.techItem}>
                <h3>ClickHouse</h3>
                <p>Columnar DB designed for real-time analytics at scale.</p>
              </div>
              <div className={styles.techItem}>
                <h3>Next.js 14</h3>
                <p>Modern frontend with Server Actions and optimized rendering.</p>
              </div>
            </div>
          </div>
          <div className={styles.techVisual}>
            <div className={styles.speedMetric}>
              <div className={styles.speedCircle}>
                <span className={styles.speedValue}>0.02ms</span>
                <span className={styles.speedLabel}>Query Time</span>
              </div>
              <div className={styles.speedPulse}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing/OS */}
      <section id="pricing" className={styles.pricingLux}>
        <div className={styles.pricingContentLux}>
          <div className={styles.pricingBadgeLux}>Open Source</div>
          <h2 className={styles.pricingTitleLux}>Deploy in 60 Seconds.</h2>
          <p className={styles.pricingDescLux}>Our one-line installation script handles everything: Nginx, SSL, Docker, and Database clusters.</p>

          <div className={styles.installCmd}>
            <code>curl -sS https://opentrace.io/install.sh | bash</code>
            <button className={styles.copyBtn}>Copy</button>
          </div>

          <div className={styles.osBenefits}>
            <div className={styles.benefit}>
              <div className={styles.benefitIcon}>🛡️</div>
              <h4>100% Privacy</h4>
              <p>Cookie-less tracking by default. GDPR/CCPA compliant.</p>
            </div>
            <div className={styles.benefit}>
              <div className={styles.benefitIcon}>📦</div>
              <h4>Self-Hosted</h4>
              <p>Your data never leaves your server. No third-party access.</p>
            </div>
            <div className={styles.benefit}>
              <div className={styles.benefitIcon}>📈</div>
              <h4>Unlimited</h4>
              <p>No limits on events, websites, or historical data.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footerLux}>
        <div className={styles.footerInner}>
          <div className={styles.footerLeft}>
            <div className={styles.footerLogo}>OpenTrace</div>
            <p>Made with ❤️ for the open-source community.</p>
          </div>
          <div className={styles.footerRight}>
            <div className={styles.footerLinksLux}>
              <a href="#">Security</a>
              <a href="#">Legal</a>
              <a href="#">Documentation</a>
              <a href="https://github.com/del4pp/opentrace">GitHub</a>
            </div>
            <div className={styles.copyLux}>© 2026 OpenTrace Analytics. AGPL v3.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
