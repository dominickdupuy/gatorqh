import { useEffect, useState } from 'react';
import { Reveal } from './Reveal';
import { CygnusSparks, EmberOrbit, GaiaRings, GaiaSphere } from './PlanetField';
import bluePlanet from './bluePlanet.png';
import orangePlanet from './orangePlanet.png';

type Track = {
  title: string;
  tagline: string;
  description: string;
  comment: string;
  badges: string[];
  accentColor: string;
  planetType: 'algorithm' | 'analysis' | 'risk';
  callSign: string;
  systemLabel: string;
};

// Each track flies the same planet that appears in the hero field, so a
// visitor recognizes Ember/Cygnus/Gaia as the same "world" throughout the site.
const trackPlanetImage: Record<Track['planetType'], string | undefined> = {
  algorithm: orangePlanet,
  analysis: bluePlanet,
  risk: undefined,
};

function TrackPlanet({ type }: { type: Track['planetType'] }) {
  const image = trackPlanetImage[type];

  return (
    <div className={`track-planet track-planet--${type}`}>
      <span className="track-planet__halo" />

      {type === 'algorithm' && (
        <div className="track-planet__ember-orbit track-planet__ember-orbit--far">
          <EmberOrbit half="far" />
        </div>
      )}
      {type === 'risk' && <GaiaRings half="far" />}

      {image ? (
        <img src={image} alt="" className="track-planet__img" />
      ) : (
        <GaiaSphere className="track-planet__sphere" />
      )}

      {type === 'analysis' && <CygnusSparks />}

      {type === 'algorithm' && (
        <div className="track-planet__ember-orbit track-planet__ember-orbit--near">
          <EmberOrbit half="near" />
        </div>
      )}
      {type === 'risk' && <GaiaRings half="near" />}
    </div>
  );
}

export function GameModes() {
  const tracks: Track[] = [
    {
      title: 'Hardware & Alpha Discovery',
      tagline: 'Take an edge to the metal.',
      description: 'Participants build and demo a testable market signal on real hardware, using FPGAs to move an idea from software prototype to a low-latency implementation. Best suited for students interested in digital design, embedded systems, or high-frequency trading infrastructure who want to see how alpha survives the jump to silicon.',
      comment: 'FIGHTER PROFILE: HARDWARE LAB | LOW LATENCY',
      badges: ['FPGA', 'Hardware', 'Latency', 'Signals'],
      accentColor: '#FA4616',
      planetType: 'algorithm',
      callSign: 'SILICON',
      systemLabel: 'FPGA BENCH | ALPHA SIGNAL',
    },
    {
      title: 'Quantitative Puzzles & Brainteasers',
      tagline: 'Low barrier, high upside.',
      description: 'A problem-driven track centered on probability, combinatorics, and game theory. No prior finance experience or datasets required — the most accessible entry point in the event.',
      comment: 'FIGHTER PROFILE: PUZZLE ENGINE | FAST THINKING',
      badges: ['Probability', 'Combinatorics', 'Game Theory', 'No Dataset'],
      accentColor: '#044a94',
      planetType: 'analysis',
      callSign: 'RIDDLE',
      systemLabel: 'LOGIC LOOPS | OPEN ENTRY',
    },
    {
      title: 'Systematic Trading',
      tagline: 'Optimize the full strategy.',
      description: 'Participants build and refine a trading strategy using historical data and quantitative modeling. Performance is evaluated through metrics such as Sharpe ratio, drawdown, and turnover. This track is geared toward students with programming experience who want to apply technical skills to a more realistic trading workflow.',
      comment: 'FIGHTER PROFILE: STRATEGY CORE | RISK-ADJUSTED RUN',
      badges: ['Sharpe Ratio', 'Drawdown', 'Turnover', 'Historical Data'],
      accentColor: '#33d17a',
      planetType: 'risk',
      callSign: 'VECTOR',
      systemLabel: 'BACKTEST LOOP | EXECUTION STACK',
    },
  ];
  const [focusedTrackIndex, setFocusedTrackIndex] = useState(0);
  const [selectedTrackIndex, setSelectedTrackIndex] = useState(0);
  const previewTrack = tracks[focusedTrackIndex];

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const targetTag = target?.tagName;
      const isTypingTarget =
        target?.isContentEditable ||
        targetTag === 'INPUT' ||
        targetTag === 'TEXTAREA' ||
        targetTag === 'SELECT';

      if (isTypingTarget) {
        return;
      }

      if (event.key === 'ArrowRight' || event.key === '>') {
        event.preventDefault();
        setFocusedTrackIndex((current) => (current + 1) % tracks.length);
      }

      if (event.key === 'ArrowLeft' || event.key === '<') {
        event.preventDefault();
        setFocusedTrackIndex((current) => (current - 1 + tracks.length) % tracks.length);
      }

      if (event.key.toLowerCase() === 'a' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setSelectedTrackIndex(focusedTrackIndex);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedTrackIndex, tracks.length]);

  return (
    <section id="game-modes" className="relative overflow-hidden bg-[#040814] pt-8 pb-20 md:pt-10">
      <style>{`
        .game-modes-scanline::after {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.05;
          background: repeating-linear-gradient(
            180deg,
            transparent 0px,
            transparent 12px,
            rgba(255, 255, 255, 0.85) 12px,
            rgba(255, 255, 255, 0.85) 14px,
            transparent 14px,
            transparent 28px
          );
          animation: gameModesScanline 3s linear infinite;
        }

        @keyframes gameModesScanline {
          from {
            transform: translateY(-28px);
          }
          to {
            transform: translateY(28px);
          }
        }

        @keyframes blink {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }

        @keyframes trackPlanetBob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        .track-planet {
          position: relative;
          width: 64px;
          height: 64px;
          animation: trackPlanetBob 4.5s ease-in-out infinite;
          transition: transform 260ms ease;
        }

        .track-planet--analysis { animation-delay: -1.2s; }
        .track-planet--risk { animation-delay: -2.6s; }

        .track-planet__halo {
          position: absolute;
          inset: -34%;
          border-radius: 50%;
          background: radial-gradient(circle, var(--track-accent) 0%, transparent 68%);
          opacity: 0;
          filter: blur(2px);
          transition: opacity 260ms ease;
        }

        .track-planet__img {
          position: relative;
          z-index: 2;
          display: block;
          width: 100%;
          height: 100%;
          object-fit: contain;
          image-rendering: pixelated;
          filter: drop-shadow(3px 3px 0 #000820);
        }

        .track-planet__sphere {
          position: relative;
          z-index: 2;
          display: block;
          width: 100%;
          height: 100%;
          filter: drop-shadow(3px 3px 0 #000820);
        }

        /* Ember's ring+moon are sized in px for its 145px hero sprite, so a
           scaled wrapper shrinks the whole orbit to fit this 64px icon. The
           scale creates its own stacking context, which is why the wrapper
           carries the far/near z-index instead of the ring/moon inside it. */
        .track-planet__ember-orbit {
          position: absolute;
          inset: 0;
          transform: scale(0.44);
          transform-origin: 50% 50%;
          pointer-events: none;
        }

        .track-planet__ember-orbit--far { z-index: 1; }
        .track-planet__ember-orbit--near { z-index: 3; }

        .group:hover .track-planet,
        .ship-active .track-planet {
          transform: scale(1.1) translateY(-3px);
        }

        .group:hover .track-planet__halo,
        .ship-active .track-planet__halo {
          opacity: 0.4;
        }

        /* Hovering/selecting a card kicks every planet effect into a faster,
           more energetic gear — same animations, higher tempo. */
        .group:hover .planet__spark,
        .ship-active .planet__spark {
          animation-duration: 1s !important;
        }

        .group:hover .planet__saturn-ring,
        .ship-active .planet__saturn-ring {
          animation-duration: 1.6s !important;
        }

        .group:hover .planet__asteroid,
        .ship-active .planet__asteroid {
          animation-duration: 9s !important;
        }

        .group:hover .planet__moon,
        .ship-active .planet__moon {
          animation-duration: 2.6s !important;
        }

        .craft-console {
          position: relative;
          border: 1px solid rgba(36, 92, 145, 0.9);
          background:
            linear-gradient(180deg, rgba(8, 14, 28, 0.96), rgba(4, 9, 20, 0.98)),
            radial-gradient(circle at top, rgba(4, 74, 148, 0.08), transparent 45%);
          box-shadow:
            0 0 0 3px rgba(5, 11, 23, 0.98),
            inset 0 0 0 1px rgba(129, 194, 255, 0.06),
            0 0 30px rgba(4, 74, 148, 0.16);
        }

        .craft-console::before {
          content: '';
          position: absolute;
          inset: 10px;
          border: 1px solid rgba(43, 84, 133, 0.4);
          pointer-events: none;
        }

        .craft-title {
          font-family: var(--font-heading);
          font-size: clamp(34px, 5.6vw, 60px);
          line-height: 0.95;
          letter-spacing: 3px;
          text-transform: uppercase;
          text-align: center;
          color: #f3f5ff;
          text-shadow:
            0 0 12px rgba(255, 255, 255, 0.12),
            0 0 26px rgba(4, 74, 148, 0.24);
        }

        .craft-title span {
          display: block;
          font-size: clamp(20px, 3.3vw, 32px);
          letter-spacing: 5px;
          color: #88baff;
          margin-top: 8px;
        }

        .craft-card {
          position: relative;
          min-height: 100%;
          border: 2px solid var(--track-accent);
          background:
            linear-gradient(180deg, rgba(9, 14, 28, 0.97), rgba(4, 8, 18, 0.98)),
            radial-gradient(circle at top, var(--track-glow), transparent 58%);
          box-shadow:
            0 0 0 2px rgba(8, 13, 25, 0.98),
            inset 0 0 0 1px rgba(255, 255, 255, 0.02),
            inset 0 0 24px rgba(0, 0, 0, 0.22),
            0 0 18px var(--track-shadow),
            0 0 26px rgba(0, 0, 0, 0.22);
          transition:
            transform 240ms ease,
            box-shadow 240ms ease,
            border-color 240ms ease;
        }

        .craft-card::before,
        .craft-card::after {
          content: '';
          position: absolute;
          inset: 6px;
          pointer-events: none;
        }

        .craft-card::before {
          border: 2px solid var(--track-outline);
          opacity: 0.85;
        }

        .craft-card::after {
          background:
            linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%),
            repeating-linear-gradient(
              180deg,
              transparent 0px,
              transparent 10px,
              rgba(255, 255, 255, 0.04) 10px,
              rgba(255, 255, 255, 0.04) 11px
            );
          opacity: 0.35;
        }

        .craft-card__corners {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
        }

        .craft-card__corner {
          position: absolute;
          width: 24px;
          height: 24px;
          opacity: 0.98;
          filter: drop-shadow(0 0 8px var(--track-accent));
        }

        .craft-card__corner::before,
        .craft-card__corner::after {
          content: '';
          position: absolute;
          background: var(--track-accent);
          box-shadow: 0 0 8px var(--track-accent);
        }

        .craft-card__corner--tl {
          top: -2px;
          left: -2px;
        }

        .craft-card__corner--tr {
          top: -2px;
          right: -2px;
        }

        .craft-card__corner--bl {
          bottom: -2px;
          left: -2px;
        }

        .craft-card__corner--br {
          bottom: -2px;
          right: -2px;
        }

        .craft-card__corner--tl::before,
        .craft-card__corner--tr::before,
        .craft-card__corner--bl::before,
        .craft-card__corner--br::before {
          top: 0;
          width: 20px;
          height: 3px;
        }

        .craft-card__corner--tl::after,
        .craft-card__corner--tr::after,
        .craft-card__corner--bl::after,
        .craft-card__corner--br::after {
          left: 0;
          width: 3px;
          height: 20px;
        }

        .craft-card__corner--tl::before {
          left: 0;
        }

        .craft-card__corner--tl::after {
          top: 0;
        }

        .craft-card__corner--tr::before {
          right: 0;
        }

        .craft-card__corner--tr::after {
          top: 0;
          left: auto;
          right: 0;
        }

        .craft-card__corner--bl::before {
          bottom: 0;
          top: auto;
          left: 0;
        }

        .craft-card__corner--bl::after {
          bottom: 0;
          top: auto;
        }

        .craft-card__corner--br::before {
          bottom: 0;
          top: auto;
          right: 0;
        }

        .craft-card__corner--br::after {
          bottom: 0;
          top: auto;
          left: auto;
          right: 0;
        }

        .craft-card__corner-step {
          position: absolute;
          width: 10px;
          height: 10px;
          border-color: var(--track-accent);
          opacity: 0.98;
          filter: drop-shadow(0 0 6px var(--track-accent));
        }

        .craft-card__corner-step--tl {
          top: 3px;
          left: 3px;
          border-top: 3px solid var(--track-accent);
          border-left: 3px solid var(--track-accent);
        }

        .craft-card__corner-step--tr {
          top: 3px;
          right: 3px;
          border-top: 3px solid var(--track-accent);
          border-right: 3px solid var(--track-accent);
        }

        .craft-card__corner-step--bl {
          bottom: 3px;
          left: 3px;
          border-bottom: 3px solid var(--track-accent);
          border-left: 3px solid var(--track-accent);
        }

        .craft-card__corner-step--br {
          bottom: 3px;
          right: 3px;
          border-bottom: 3px solid var(--track-accent);
          border-right: 3px solid var(--track-accent);
        }

        .craft-card:hover {
          transform: translateY(-6px);
          border-color: var(--track-accent);
          box-shadow:
            0 0 0 2px rgba(8, 13, 25, 0.98),
            inset 0 0 0 1px rgba(255, 255, 255, 0.03),
            inset 0 0 28px rgba(0, 0, 0, 0.26),
            0 0 18px var(--track-shadow),
            0 0 32px var(--track-shadow),
            0 0 52px rgba(0, 0, 0, 0.24);
        }

        .craft-card--selected {
          border-color: var(--track-accent);
          box-shadow:
            0 0 0 2px rgba(8, 13, 25, 0.98),
            inset 0 0 0 1px rgba(255, 255, 255, 0.03),
            inset 0 0 30px rgba(0, 0, 0, 0.28),
            0 0 22px var(--track-shadow),
            0 0 36px var(--track-shadow),
            0 0 56px rgba(0, 0, 0, 0.26);
        }

        .craft-card--focused {
          transform: translateY(-4px);
          border-color: var(--track-accent);
          box-shadow:
            0 0 0 2px rgba(8, 13, 25, 0.98),
            inset 0 0 0 1px rgba(255, 255, 255, 0.03),
            0 0 26px var(--track-shadow);
        }

        .craft-card__ship {
          position: relative;
          display: flex;
          justify-content: center;
          margin-bottom: 1.75rem;
        }

        .craft-card__ship::before {
          content: '';
          position: absolute;
          inset: auto 15% -6px 15%;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--track-outline), transparent);
          opacity: 0.7;
        }

        .craft-panel {
          position: relative;
          display: inline-flex;
          min-height: 112px;
          min-width: 112px;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--track-accent);
          background:
            radial-gradient(circle at 50% 24%, var(--track-panel-glow), transparent 60%),
            linear-gradient(180deg, rgba(4, 8, 19, 0.98), rgba(8, 12, 23, 0.96));
          box-shadow:
            inset 0 0 0 1px rgba(255,255,255,0.03),
            0 0 18px var(--track-shadow);
        }

        .craft-panel::before {
          content: '';
          position: absolute;
          inset: 6px;
          border: 1px solid var(--track-outline);
          opacity: 0.5;
        }

        .craft-badge {
          display: inline-flex;
          width: fit-content;
          margin-bottom: 1.5rem;
          padding: 0.28rem 0.58rem;
          border: 1px solid var(--track-outline);
          background: rgba(6, 10, 20, 0.88);
          font-family: var(--font-body);
          font-size: 10px;
          letter-spacing: 1.6px;
          color: #8fb7ef;
        }

        .craft-metric {
          border-top: 1px dashed var(--track-outline);
          padding-top: 0.95rem;
        }

        .craft-chip {
          border: 1px solid var(--track-outline);
          background: rgba(5, 10, 19, 0.82);
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.02);
        }

        @media (max-width: 767px) {
          .craft-title span {
            letter-spacing: 3px;
          }
        }

      `}</style>
      <div className="game-modes-scanline absolute inset-0" />
      <div className="absolute inset-0 opacity-40">
        <div className="h-full w-full bg-[radial-gradient(circle_at_top,rgba(4,74,148,0.18),transparent_30%),linear-gradient(180deg,transparent,rgba(250,70,22,0.03)_58%,transparent)]" />
      </div>
      <div className="max-w-[1260px] mx-auto px-4 sm:px-6">
        <div className="craft-console px-4 py-5 sm:px-5 lg:px-6">
          <div className="mb-4 flex items-center justify-center gap-4">
            <div className="h-px w-10 bg-gradient-to-r from-transparent to-[#2c6dac]" />
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-[#FA4616]" />
              <div className="h-2 w-2 bg-[#63f6ff]" />
              <div className="h-2 w-2 bg-[#33d17a]" />
            </div>
            <div className="h-px w-10 bg-gradient-to-l from-transparent to-[#2c6dac]" />
          </div>

          <Reveal className="mb-5 text-center">
            <div
              className="mb-2 text-[#7e90ab]"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '2.4px',
              }}
            >
              04 / MISSION TRACKS
            </div>
            <h2 className="craft-title">Select Your Track</h2>
          </Reveal>

          <Reveal
            delay={100}
            className="relative mb-5 overflow-hidden border border-[#1d4f83] bg-[linear-gradient(180deg,#08101a_0%,#091523_55%,#07111d_100%)] px-3 py-2 shadow-[0_0_0_1px_rgba(4,74,148,0.22),0_0_24px_rgba(4,74,148,0.08)] md:px-4"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#5db8ff]/60 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#FA4616]/45 to-transparent" />
            <div className="pointer-events-none absolute left-0 top-0 h-4 w-4 border-l-2 border-t-2 border-[#044a94]" />
            <div className="pointer-events-none absolute right-0 top-0 h-4 w-4 border-r-2 border-t-2 border-[#044a94]" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-[#044a94]" />
            <div className="pointer-events-none absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-[#044a94]" />

            <div className="relative flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="craft-panel ship-active !min-h-[58px] !min-w-[58px] scale-[0.66]"
                  style={{
                    borderColor: previewTrack.accentColor,
                    boxShadow: `0 0 16px ${previewTrack.accentColor}33`,
                    ['--track-accent' as string]: previewTrack.accentColor,
                    ['--track-outline' as string]: `${previewTrack.accentColor}66`,
                    ['--track-shadow' as string]: `${previewTrack.accentColor}33`,
                    ['--track-panel-glow' as string]: `${previewTrack.accentColor}20`,
                  }}
                >
                  <TrackPlanet type={previewTrack.planetType} />
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "'Orbitron', sans-serif",
                      fontSize: '11px',
                      fontWeight: 700,
                      color: previewTrack.accentColor,
                      letterSpacing: '1.2px',
                      textShadow: `0 0 10px ${previewTrack.accentColor}33`,
                    }}
                  >
                    {previewTrack.title.toUpperCase()}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '9px',
                      color: '#7e90ab',
                      letterSpacing: '0.8px',
                    }}
                  >
                    NAV COMPUTER · TRACK SELECT
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-start md:justify-end">
                <div className="border border-[#203854] bg-[#0a1421]/90 px-2.5 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_0_18px_rgba(4,74,148,0.08)]">
                  <span
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '9px',
                      color: '#a4acbb',
                      letterSpacing: '0.7px',
                    }}
                  >
                    {'< > TO SCAN   •   ENTER TO LOCK'}
                    <span style={{ animation: 'blink 1s step-end infinite' }}> _</span>
                  </span>
                </div>
              </div>
            </div>
          </Reveal>

          <div className="grid gap-6 xl:grid-cols-3 md:grid-cols-2 md:gap-6">
            {tracks.map((track, index) => (
              <Reveal key={index} delay={index * 110}>
              <article
                className={`group craft-card overflow-hidden cursor-pointer outline-none focus:outline-none focus-visible:outline-none ${
                  selectedTrackIndex === index ? 'craft-card--selected' : ''
                } ${
                  focusedTrackIndex === index ? 'craft-card--focused' : ''
                }`}
                onClick={() => {
                  setFocusedTrackIndex(index);
                  setSelectedTrackIndex(index);
                }}
                onFocus={() => setFocusedTrackIndex(index)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setFocusedTrackIndex(index);
                    setSelectedTrackIndex(index);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-pressed={selectedTrackIndex === index}
                style={
                  {
                    '--track-accent': track.accentColor,
                    '--track-glow': `${track.accentColor}14`,
                    '--track-outline': `${track.accentColor}66`,
                    '--track-shadow': `${track.accentColor}33`,
                    '--track-panel-glow': `${track.accentColor}20`,
                  } as React.CSSProperties
                }
              >
                <div
                  className="absolute left-0 right-0 top-0 h-[3px]"
                  style={{ background: `linear-gradient(90deg, transparent, ${track.accentColor}, transparent)` }}
                />
                <div
                  className="absolute bottom-0 left-0 right-0 h-[2px] opacity-60"
                  style={{ background: `linear-gradient(90deg, transparent, ${track.accentColor}, transparent)` }}
                />
                <div className="craft-card__corners">
                  <span className="craft-card__corner craft-card__corner--tl" />
                  <span className="craft-card__corner craft-card__corner--tr" />
                  <span className="craft-card__corner craft-card__corner--bl" />
                  <span className="craft-card__corner craft-card__corner--br" />
                  <span className="craft-card__corner-step craft-card__corner-step--tl" />
                  <span className="craft-card__corner-step craft-card__corner-step--tr" />
                  <span className="craft-card__corner-step craft-card__corner-step--bl" />
                  <span className="craft-card__corner-step craft-card__corner-step--br" />
                </div>

                <div className="relative z-10 flex h-full flex-col p-6 md:p-7">
                  <div className="mb-5 flex items-start justify-between gap-3">
                    <span className="craft-badge">SECTOR 0{index + 1} / TRACK</span>
                    <span
                      className="border px-2 py-1 text-[10px]"
                      style={{
                        borderColor: `${track.accentColor}66`,
                        color: track.accentColor,
                        fontFamily: "'Space Mono', monospace",
                        letterSpacing: '1.3px',
                        background: '#050913',
                      }}
                    >
                      {selectedTrackIndex === index ? 'SELECTED' : 'ACTIVE SLOT'}
                    </span>
                  </div>
                  <div className="craft-card__ship">
                    <div
                      className={`craft-panel transition-transform duration-300 group-hover:scale-105 ${
                        selectedTrackIndex === index || focusedTrackIndex === index ? 'ship-active scale-105' : ''
                      }`}
                    >
                      <TrackPlanet type={track.planetType} />
                    </div>
                  </div>

                  <h3
                    className="mb-3 text-center text-[#F4F4F4]"
                    style={{
                      fontFamily: "'Orbitron', sans-serif",
                      fontSize: 'clamp(25px, 3vw, 34px)',
                      fontWeight: 700,
                      letterSpacing: '1px',
                      lineHeight: 1.06,
                      textTransform: 'uppercase',
                    }}
                  >
                    {track.title}
                  </h3>

                  <p
                    className="mb-5 text-center"
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '13px',
                      fontWeight: 700,
                      color: track.accentColor,
                      textShadow: `0 0 12px ${track.accentColor}55`,
                    }}
                  >
                    {track.tagline}
                  </p>

                  <div className="craft-metric mb-4">
                    <div
                      className="mb-2 text-[#7f92ae]"
                      style={{
                        fontFamily: "'Orbitron', sans-serif",
                        fontSize: '10px',
                        letterSpacing: '1.8px',
                      }}
                    >
                      CALL SIGN
                    </div>
                    <div
                      className="mb-1"
                      style={{
                        fontFamily: "'Orbitron', sans-serif",
                        fontSize: '19px',
                        fontWeight: 700,
                        letterSpacing: '1px',
                        color: track.accentColor,
                      }}
                    >
                      {track.callSign}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '11px',
                        color: '#8ea3c4',
                        letterSpacing: '0.9px',
                      }}
                    >
                      {track.systemLabel}
                    </div>
                  </div>

                  <p
                    className="mb-5 flex-1 text-[#a7b4c9]"
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '13px',
                      lineHeight: 1.75,
                    }}
                  >
                    {track.description}
                  </p>

                  <p
                    className="mb-5"
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '12px',
                      fontWeight: 700,
                      letterSpacing: '0.8px',
                      color: track.accentColor,
                    }}
                  >
                    {track.comment}
                  </p>

                  <div className="mt-auto flex flex-wrap gap-2">
                    {track.badges.map((badge, badgeIndex) => (
                      <span
                        key={badgeIndex}
                        className="craft-chip px-3 py-1.5"
                        style={{
                          fontFamily: "'Space Mono', monospace",
                          fontSize: '10px',
                          fontWeight: 700,
                          color: track.accentColor,
                          letterSpacing: '0.7px',
                        }}
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-10">
            <div className="mb-4 text-center">
              <p
                className="mb-2 text-[#9A9A9A]"
                style={{ fontFamily: "'Space Mono', monospace", fontSize: '13px' }}
              >
                Not sure which track? Teams can pivot during the event.
              </p>
              <p
                className="text-[#6d83a6]"
                style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px', letterSpacing: '1px' }}
              >
                ALL FIGHTERS ELIGIBLE FOR THE MAIN PRIZE POOL
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
