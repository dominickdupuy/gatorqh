import { useCallback, useEffect, useState } from 'react';
import { InterestForm } from '@/components/InterestForm';
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

type AppPage = 'home' | 'interest';

const getPageFromPath = (): AppPage => {
  const path = window.location.pathname.replace(/\/+$/, '');
  return path === '/interest-form' || path === '/intrest-form' ? 'interest' : 'home';
};

const getPathForPage = (page: AppPage) => (page === 'interest' ? '/interest-form' : '/');

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

    if (nextPage === 'interest') {
      window.scrollTo({ top: 0 });
    }
  }, []);

  return (
    <div className="site-shell min-h-screen">
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
              <FooterCTA />
            </div>
            <div className="site-section">
              <Footer />
            </div>
          </>
        ) : (
          <InterestForm />
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
