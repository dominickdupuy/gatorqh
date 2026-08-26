import { useCallback, useEffect, useState } from 'react';
import { ApplicationForm } from './components/ApplicationForm';
import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { StatsBar } from './components/StatsBar';
import { About } from './components/About';
import { GameModes } from './components/GameModes';
import { Schedule } from './components/Schedule';
import { Sponsors } from './components/Sponsors';
import { FAQ } from './components/FAQ';
import { FooterCTA } from './components/FooterCTA';
import { Footer } from './components/Footer';
import { IntroAnimation } from './components/IntroAnimation';

type AppPage = 'home' | 'apply';

// The older /interest-form links (and the misspelled alias that shipped with
// them) are already in circulation, so they keep resolving to the portal.
const APPLY_PATHS = ['/apply', '/interest-form', '/intrest-form'];

const getPageFromPath = (): AppPage => {
  const path = window.location.pathname.replace(/\/+$/, '');
  return APPLY_PATHS.includes(path) ? 'apply' : 'home';
};

const getPathForPage = (page: AppPage) => (page === 'apply' ? '/apply' : '/');

export default function App() {
  const [page, setPage] = useState<AppPage>(() => getPageFromPath());
  const [introActive, setIntroActive] = useState(true);

  useEffect(() => {
    const handlePopState = () => {
      setPage(getPageFromPath());
      window.scrollTo({ top: 0 });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToPage = useCallback((nextPage: AppPage) => {
    setPage(nextPage);

    const nextPath = getPathForPage(nextPage);
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }

    if (nextPage === 'apply') {
      window.scrollTo({ top: 0 });
    }
  }, []);

  return (
    <div className="site-shell min-h-screen">
      <a
        id="mlh-trust-badge"
        href="https://mlh.io/na?utm_source=na-hackathon&utm_medium=TrustBadge&utm_campaign=2026-season&utm_content=white"
        target="_blank"
        rel="noreferrer"
        style={{
          display: 'block',
          maxWidth: '100px',
          minWidth: '60px',
          position: 'fixed',
          right: '50px',
          top: 0,
          width: '10%',
          zIndex: 10000,
        }}
      >
        <img
          src="https://logged-assets.s3.amazonaws.com/trust-badge/2027/mlh-trust-badge-2027-white.svg"
          alt="Major League Hacking 2026 Hackathon Season"
          style={{ width: '100%', imageRendering: 'auto' }}
        />
      </a>

      <IntroAnimation onVisibilityChange={setIntroActive} />

      <style>{`
        html, body {
          background: #02040c;
          overflow-x: hidden;
        }

        * {
          image-rendering: pixelated;
        }
      `}</style>

      <div className="cabinet-frame" aria-hidden="true">
        <div className="cabinet-frame__top">
          <div className="cabinet-frame__vent cabinet-frame__vent--left" />
          <div className="cabinet-frame__marquee">
            <span>PLAYER 1</span>
            <span>SPACE MARKET</span>
            <span>CREDITS: 00</span>
          </div>
          <div className="cabinet-frame__vent cabinet-frame__vent--right" />
        </div>
        <div className="cabinet-frame__side cabinet-frame__side--left">
          <span className="cabinet-frame__light cabinet-frame__light--orange" />
          <span className="cabinet-frame__light cabinet-frame__light--blue" />
          <span className="cabinet-frame__panel-line" />
        </div>
        <div className="cabinet-frame__side cabinet-frame__side--right">
          <span className="cabinet-frame__light cabinet-frame__light--orange" />
          <span className="cabinet-frame__light cabinet-frame__light--blue" />
          <span className="cabinet-frame__panel-line" />
        </div>
        <div className="cabinet-frame__bottom">
          <div className="cabinet-frame__dock">
            <span className="cabinet-frame__dock-light cabinet-frame__dock-light--blue" />
            <span className="cabinet-frame__dock-light cabinet-frame__dock-light--orange" />
            <span className="cabinet-frame__dock-light cabinet-frame__dock-light--blue" />
          </div>
        </div>
        <div className="cabinet-frame__corner cabinet-frame__corner--tl" />
        <div className="cabinet-frame__corner cabinet-frame__corner--tr" />
        <div className="cabinet-frame__corner cabinet-frame__corner--bl" />
        <div className="cabinet-frame__corner cabinet-frame__corner--br" />
      </div>

      <div className="site-shell__inner">
        <div className="site-ambience" aria-hidden="true">
          <div className="site-ambience__stars site-ambience__stars--far" />
          <div className="site-ambience__stars site-ambience__stars--mid" />
          <div className="site-ambience__stars site-ambience__stars--near" />
          <div className="site-ambience__grid" />
          <div className="site-ambience__noise" />
        </div>
        <Navigation page={page} onNavigate={navigateToPage} />
        {page === 'home' ? (
          <>
            <div className="site-section">
              <Hero onNavigate={navigateToPage} isIntroActive={introActive} />
            </div>
            <div className="site-section">
              <StatsBar />
            </div>
            <div className="site-section">
              <About />
            </div>
            <div className="site-section">
              <GameModes />
            </div>
            <div className="site-section">
              <Schedule />
            </div>
            <div className="site-section">
              <Sponsors />
            </div>
            <div className="site-section">
              <FAQ />
            </div>
            <div className="site-section">
              <FooterCTA onNavigate={navigateToPage} />
            </div>
            <div className="site-section">
              <Footer />
            </div>
          </>
        ) : (
          <ApplicationForm />
        )}
      </div>

      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 9999,
          background:
            'radial-gradient(ellipse 95% 85% at 50% 50%, transparent 50%, rgba(0,0,0,0.15) 70%, rgba(0,0,0,0.5) 85%, rgba(0,0,0,0.85) 95%, rgba(0,0,0,0.97) 100%)',
        }}
      />
    </div>
  );
}
