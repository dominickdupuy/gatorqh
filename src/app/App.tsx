import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { StatsBar } from './components/StatsBar';
import { About } from './components/About';
import { GameModes } from './components/GameModes';
import { Schedule } from './components/Schedule';
import { Sponsors } from './components/Sponsors';
import { Team } from './components/Team';
import { FAQ } from './components/FAQ';
import { FooterCTA } from './components/FooterCTA';
import { Footer } from './components/Footer';
import { IntroAnimation } from './components/IntroAnimation';
import { probeFrameRate } from './performance';

// Track pages carry their own canvas models, so each loads only when visited.
// The application form only matters on /apply, and the map pulls in d3; keeping
// both out of the first bundle gets the home page painted sooner on slow phones.
const ApplicationForm = lazy(() =>
  import('./components/ApplicationForm').then((m) => ({ default: m.ApplicationForm }))
);
const TradingCompetitionMap = lazy(() => import('./components/TradingCompetitionMap'));
const QuantTrackPage = lazy(() => import('./components/quant-track/QuantTrackPage'));
const HardwareTrackPage = lazy(() => import('./components/hardware-track/HardwareTrackPage'));
const SystematicTrackPage = lazy(() => import('./components/systematic-track/SystematicTrackPage'));
const MassiveTrackPage = lazy(() => import('./components/systematic-track/massive/MassiveTrackPage'));

type AppPage = 'home' | 'apply' | 'quant-track' | 'hardware-track' | 'systematic-track' | 'massive-track';
type TrackPage = Extract<AppPage, 'quant-track' | 'hardware-track' | 'systematic-track'>;

const TRACK_PAGES: AppPage[] = ['quant-track', 'hardware-track', 'systematic-track', 'massive-track'];

// The older /interest-form links (and the misspelled alias that shipped with
// them) are already in circulation, so they keep resolving to the portal.
const APPLY_PATHS = ['/apply', '/interest-form', '/intrest-form'];
const QUANT_TRACK_PATH = '/tracks/quant-puzzles';
const HARDWARE_TRACK_PATH = '/tracks/hardware';
const SYSTEMATIC_TRACK_PATH = '/tracks/systematic-trading';
const MASSIVE_TRACK_PATH = '/tracks/systematic-trading/massive';

const getPageFromPath = (): AppPage => {
  const path = window.location.pathname.replace(/\/+$/, '');
  if (APPLY_PATHS.includes(path)) return 'apply';
  if (path === QUANT_TRACK_PATH) return 'quant-track';
  if (path === HARDWARE_TRACK_PATH) return 'hardware-track';
  if (path === SYSTEMATIC_TRACK_PATH) return 'systematic-track';
  if (path === MASSIVE_TRACK_PATH) return 'massive-track';
  return 'home';
};

const getPathForPage = (page: AppPage) => {
  if (page === 'apply') return '/apply';
  if (page === 'quant-track') return QUANT_TRACK_PATH;
  if (page === 'hardware-track') return HARDWARE_TRACK_PATH;
  if (page === 'systematic-track') return SYSTEMATIC_TRACK_PATH;
  if (page === 'massive-track') return MASSIVE_TRACK_PATH;
  return '/';
};

const scrollToTracks = () => {
  window.setTimeout(() => {
    document.getElementById('game-modes')?.scrollIntoView({ behavior: 'instant' as ScrollBehavior, block: 'start' });
  }, 60);
};

// The MLH badge stays solid until the visitor has scrolled 5% of the page,
// then decays to invisible by 15% so it never competes with the content.
const MLH_BADGE_FADE_START = 0.05;
const MLH_BADGE_FADE_END = 0.15;

const useMlhBadgeOpacity = () => {
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
      const t = (progress - MLH_BADGE_FADE_START) / (MLH_BADGE_FADE_END - MLH_BADGE_FADE_START);
      const clamped = Math.min(1, Math.max(0, t));
      // Ease-out curve so the badge lingers, then drops away.
      setOpacity(1 - clamped * clamped);
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return opacity;
};

export default function App() {
  const [page, setPage] = useState<AppPage>(() => getPageFromPath());
  const [introActive, setIntroActive] = useState(true);
  const mlhBadgeOpacity = useMlhBadgeOpacity();
  const pageRef = useRef(page);
  pageRef.current = page;

  useEffect(() => {
    if (!introActive) probeFrameRate();
  }, [introActive]);

  useEffect(() => {
    const handlePopState = () => {
      const nextPage = getPageFromPath();
      // Backing out of a track page lands on the track cards it was opened from.
      const leavingTrack = TRACK_PAGES.includes(pageRef.current) && nextPage === 'home';
      setPage(nextPage);
      if (leavingTrack) scrollToTracks();
      else window.scrollTo({ top: 0 });
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

    if (TRACK_PAGES.includes(nextPage)) {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
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
          opacity: mlhBadgeOpacity,
          transform: `translateY(${(1 - mlhBadgeOpacity) * -24}px)`,
          transition: 'opacity 120ms linear, transform 120ms linear',
          pointerEvents: mlhBadgeOpacity < 0.05 ? 'none' : 'auto',
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

      <div className="hull-frame" aria-hidden="true">
        <div className="hull-frame__top">
          <div className="hull-frame__vent hull-frame__vent--left" />
          <div className="hull-frame__readout">
            <span>GQH-01</span>
            <span>SPACE MARKET</span>
            <span>ORBIT STABLE</span>
          </div>
          <div className="hull-frame__vent hull-frame__vent--right" />
        </div>
        <div className="hull-frame__side hull-frame__side--left">
          <span className="hull-frame__light hull-frame__light--orange" />
          <span className="hull-frame__light hull-frame__light--blue" />
          <span className="hull-frame__panel-line" />
        </div>
        <div className="hull-frame__side hull-frame__side--right">
          <span className="hull-frame__light hull-frame__light--orange" />
          <span className="hull-frame__light hull-frame__light--blue" />
          <span className="hull-frame__panel-line" />
        </div>
        <div className="hull-frame__bottom">
          <div className="hull-frame__dock">
            <span className="hull-frame__dock-light hull-frame__dock-light--blue" />
            <span className="hull-frame__dock-light hull-frame__dock-light--orange" />
            <span className="hull-frame__dock-light hull-frame__dock-light--blue" />
          </div>
        </div>
        <div className="hull-frame__corner hull-frame__corner--tl" />
        <div className="hull-frame__corner hull-frame__corner--tr" />
        <div className="hull-frame__corner hull-frame__corner--bl" />
        <div className="hull-frame__corner hull-frame__corner--br" />
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
              <GameModes onOpenTrack={(track: TrackPage) => navigateToPage(track)} />
            </div>
            <div className="site-section">
              <Schedule />
            </div>
            <div className="site-section">
              <Sponsors />
            </div>
            <div className="site-section">
              <Suspense fallback={<div style={{ minHeight: 600 }} />}>
                <TradingCompetitionMap />
              </Suspense>
            </div>
            <div className="site-section">
              <Team />
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
        ) : page === 'quant-track' ? (
          <Suspense fallback={<div className="min-h-screen bg-[#050508]" />}>
            <QuantTrackPage onNavigate={navigateToPage} isIntroActive={introActive} />
          </Suspense>
        ) : page === 'hardware-track' ? (
          <Suspense fallback={<div className="min-h-screen bg-[#050508]" />}>
            <HardwareTrackPage onNavigate={navigateToPage} isIntroActive={introActive} />
          </Suspense>
        ) : page === 'systematic-track' ? (
          <Suspense fallback={<div className="min-h-screen bg-[#050508]" />}>
            <SystematicTrackPage onNavigate={navigateToPage} isIntroActive={introActive} />
          </Suspense>
        ) : page === 'massive-track' ? (
          <Suspense fallback={<div className="min-h-screen bg-[#050508]" />}>
            <MassiveTrackPage onNavigate={navigateToPage} isIntroActive={introActive} />
          </Suspense>
        ) : (
          <Suspense fallback={<div className="min-h-screen bg-[#050508]" />}>
            <ApplicationForm />
          </Suspense>
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
