import { useEffect, useState } from 'react';

type Pixel = { x: number; y: number; color: string; size?: number };

type Track = {
  title: string;
  tagline: string;
  description: string;
  comment: string;
  badges: string[];
  accentColor: string;
  fighterType: 'algorithm' | 'analysis' | 'risk';
  callSign: string;
  systemLabel: string;
};

const fighterPixels: Record<Track['fighterType'], Pixel[]> = {
  algorithm: [
    { x: 24, y: 0, color: '#fff4bf' }, { x: 20, y: 4, color: '#ff8a5b' }, { x: 24, y: 4, color: '#ffdf8c' }, { x: 28, y: 4, color: '#ff8a5b' },
    { x: 16, y: 8, color: '#fa4616' }, { x: 20, y: 8, color: '#ffd26b' }, { x: 24, y: 8, color: '#fff4bf' }, { x: 28, y: 8, color: '#ffd26b' }, { x: 32, y: 8, color: '#fa4616' },
    { x: 12, y: 12, color: '#fa4616' }, { x: 16, y: 12, color: '#ff8a5b' }, { x: 20, y: 12, color: '#ffd26b' }, { x: 24, y: 12, color: '#fff4bf' }, { x: 28, y: 12, color: '#ffd26b' }, { x: 32, y: 12, color: '#ff8a5b' }, { x: 36, y: 12, color: '#fa4616' },
    { x: 8, y: 16, color: '#8f1d00' }, { x: 12, y: 16, color: '#fa4616' }, { x: 16, y: 16, color: '#ff8a5b' }, { x: 20, y: 16, color: '#ffd26b' }, { x: 24, y: 16, color: '#fff4bf' }, { x: 28, y: 16, color: '#ffd26b' }, { x: 32, y: 16, color: '#ff8a5b' }, { x: 36, y: 16, color: '#fa4616' }, { x: 40, y: 16, color: '#8f1d00' },
    { x: 16, y: 20, color: '#fa4616' }, { x: 20, y: 20, color: '#ff8a5b' }, { x: 24, y: 20, color: '#fff4bf' }, { x: 28, y: 20, color: '#ff8a5b' }, { x: 32, y: 20, color: '#fa4616' },
    { x: 12, y: 24, color: '#fa4616' }, { x: 20, y: 24, color: '#ffd26b' }, { x: 24, y: 24, color: '#fff4bf' }, { x: 28, y: 24, color: '#ffd26b' }, { x: 36, y: 24, color: '#fa4616' },
    { x: 20, y: 28, color: '#ff8a5b' }, { x: 28, y: 28, color: '#ff8a5b' },
  ],
  analysis: [
    { x: 16, y: 0, color: '#7cf1ff' }, { x: 12, y: 4, color: '#1a8cff' }, { x: 16, y: 4, color: '#d6fbff' }, { x: 20, y: 4, color: '#1a8cff' },
    { x: 8, y: 8, color: '#044a94' }, { x: 12, y: 8, color: '#5ddcff' }, { x: 16, y: 8, color: '#d6fbff' }, { x: 20, y: 8, color: '#5ddcff' }, { x: 24, y: 8, color: '#044a94' },
    { x: 4, y: 12, color: '#044a94' }, { x: 8, y: 12, color: '#1a8cff' }, { x: 12, y: 12, color: '#5ddcff' }, { x: 16, y: 12, color: '#d6fbff' }, { x: 20, y: 12, color: '#5ddcff' }, { x: 24, y: 12, color: '#1a8cff' }, { x: 28, y: 12, color: '#044a94' },
    { x: 0, y: 16, color: '#022b5a' }, { x: 4, y: 16, color: '#044a94' }, { x: 8, y: 16, color: '#1a8cff' }, { x: 12, y: 16, color: '#5ddcff' }, { x: 16, y: 16, color: '#d6fbff' }, { x: 20, y: 16, color: '#5ddcff' }, { x: 24, y: 16, color: '#1a8cff' }, { x: 28, y: 16, color: '#044a94' }, { x: 32, y: 16, color: '#022b5a' },
    { x: 8, y: 20, color: '#044a94' }, { x: 12, y: 20, color: '#5ddcff' }, { x: 16, y: 20, color: '#d6fbff' }, { x: 20, y: 20, color: '#5ddcff' }, { x: 24, y: 20, color: '#044a94' },
    { x: 4, y: 24, color: '#044a94' }, { x: 12, y: 24, color: '#1a8cff' }, { x: 16, y: 24, color: '#5ddcff' }, { x: 20, y: 24, color: '#1a8cff' }, { x: 28, y: 24, color: '#044a94' },
    { x: 12, y: 28, color: '#1a8cff' }, { x: 20, y: 28, color: '#1a8cff' },
  ],
  risk: [
    { x: 20, y: 0, color: '#d8ffe8' }, { x: 16, y: 4, color: '#33d17a' }, { x: 20, y: 4, color: '#d8ffe8' }, { x: 24, y: 4, color: '#33d17a' },
    { x: 12, y: 8, color: '#157a47' }, { x: 16, y: 8, color: '#7ff0b0' }, { x: 20, y: 8, color: '#d8ffe8' }, { x: 24, y: 8, color: '#7ff0b0' }, { x: 28, y: 8, color: '#157a47' },
    { x: 8, y: 12, color: '#0c4d2f' }, { x: 12, y: 12, color: '#33d17a' }, { x: 16, y: 12, color: '#7ff0b0' }, { x: 20, y: 12, color: '#d8ffe8' }, { x: 24, y: 12, color: '#7ff0b0' }, { x: 28, y: 12, color: '#33d17a' }, { x: 32, y: 12, color: '#0c4d2f' },
    { x: 4, y: 16, color: '#7d95b1' }, { x: 8, y: 16, color: '#157a47' }, { x: 12, y: 16, color: '#33d17a' }, { x: 16, y: 16, color: '#7ff0b0' }, { x: 20, y: 16, color: '#d8ffe8' }, { x: 24, y: 16, color: '#7ff0b0' }, { x: 28, y: 16, color: '#33d17a' }, { x: 32, y: 16, color: '#157a47' }, { x: 36, y: 16, color: '#7d95b1' },
    { x: 8, y: 20, color: '#157a47' }, { x: 12, y: 20, color: '#33d17a' }, { x: 16, y: 20, color: '#7ff0b0' }, { x: 20, y: 20, color: '#d8ffe8' }, { x: 24, y: 20, color: '#7ff0b0' }, { x: 28, y: 20, color: '#33d17a' }, { x: 32, y: 20, color: '#157a47' },
    { x: 12, y: 24, color: '#33d17a' }, { x: 16, y: 24, color: '#7ff0b0' }, { x: 20, y: 24, color: '#d8ffe8' }, { x: 24, y: 24, color: '#7ff0b0' }, { x: 28, y: 24, color: '#33d17a' },
    { x: 16, y: 28, color: '#157a47' }, { x: 24, y: 28, color: '#157a47' },
  ],
};

function PixelShip({ type, accentColor }: { type: Track['fighterType']; accentColor: string }) {
  const pixels = fighterPixels[type];

  return (
    <div className={`ship-stage ship-stage--${type}`}>
      {type === 'analysis' && (
        <>
          <span className="signal-ring signal-ring--1" style={{ borderColor: `${accentColor}55` }} />
          <span className="signal-ring signal-ring--2" style={{ borderColor: `${accentColor}35` }} />
          <span className="orbit orbit--1" style={{ backgroundColor: '#d6fbff' }} />
          <span className="orbit orbit--2" style={{ backgroundColor: '#7cf1ff' }} />
          <span className="bullet bullet--1" style={{ backgroundColor: '#2457a6' }} />
          <span className="bullet bullet--2" style={{ backgroundColor: '#2457a6' }} />
          <span className="bullet bullet--3" style={{ backgroundColor: '#12376f' }} />
        </>
      )}
      {type === 'algorithm' && (
        <>
          <span className="bullet bullet--1" style={{ backgroundColor: '#ffd26b' }} />
          <span className="bullet bullet--2" style={{ backgroundColor: '#ffd26b' }} />
          <span className="bullet bullet--3" style={{ backgroundColor: '#ff8a5b' }} />
        </>
      )}
      {type === 'risk' && (
        <>
          <span className="risk-bullet risk-bullet--1" style={{ backgroundColor: '#7ff0b0' }} />
          <span className="risk-bullet risk-bullet--2" style={{ backgroundColor: '#7ff0b0' }} />
          <span className="risk-bullet risk-bullet--3" style={{ backgroundColor: '#d8ffe8' }} />
        </>
      )}
      <div className={`ship-flight ship-flight--${type}`}>
        <div className={`pixel-ship pixel-ship--${type}`}>
          {pixels.map((pixel, index) => (
            <span
              key={`${type}-${index}`}
              className="pixel"
              style={{
                left: `${pixel.x}px`,
                top: `${pixel.y}px`,
                backgroundColor: pixel.color,
                width: `${pixel.size ?? 4}px`,
                height: `${pixel.size ?? 4}px`,
              }}
            />
          ))}
          <span className="flame flame--1" />
          <span className="flame flame--2" />
        </div>
      </div>
    </div>
  );
}

export function GameModes() {
  const tracks: Track[] = [
    {
      title: 'Research & Alpha Discovery',
      tagline: 'Pitch a testable edge.',
      description: 'Participants develop and present a testable market hypothesis supported by clear, structured analysis. The focus is on identifying signal, building a strong argument, and communicating it effectively. This track is best suited for students interested in finance, economics, or strategy who want to explore how ideas translate into potential alpha.',
      comment: 'FIGHTER PROFILE: THESIS LAB | PRESENTATION READY',
      badges: ['Finance', 'Economics', 'Hypothesis', 'Analysis'],
      accentColor: '#FA4616',
      fighterType: 'algorithm',
      callSign: 'THESIS',
      systemLabel: 'RESEARCH DECK | ALPHA SIGNAL',
    },
    {
      title: 'Quantitative Puzzles & Brainteasers',
      tagline: 'Low barrier, high upside.',
      description: 'A problem-driven track centered on probability, combinatorics, and game theory. No prior finance experience or datasets required. Designed as the most accessible entry point, it challenges participants to think critically, solve efficiently, and apply mathematical reasoning in a competitive environment.',
      comment: 'FIGHTER PROFILE: PUZZLE ENGINE | FAST THINKING',
      badges: ['Probability', 'Combinatorics', 'Game Theory', 'No Dataset'],
      accentColor: '#044a94',
      fighterType: 'analysis',
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
      fighterType: 'risk',
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

        @keyframes flameFlicker {
          0%, 100% { transform: translateX(-50%) scaleY(1); opacity: 0.95; }
          50% { transform: translateX(-50%) scaleY(0.55); opacity: 0.55; }
        }

        @keyframes shipWobble {
          0%, 100% { transform: translate(-50%, -50%) translateY(0) rotate(0deg); }
          25% { transform: translate(-50%, -50%) translate(-1px, -2px) rotate(-2deg); }
          50% { transform: translate(-50%, -50%) translateY(0) rotate(0deg); }
          75% { transform: translate(-50%, -50%) translate(1px, -2px) rotate(2deg); }
        }

        @keyframes bulletBurst {
          0% { opacity: 0; transform: translateX(-50%) translateY(0); }
          20% { opacity: 1; }
          100% { opacity: 0; transform: translateX(-50%) translateY(-30px); }
        }

        @keyframes signalPulse {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.55); }
          35% { opacity: 0.55; }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(1.3); }
        }

        @keyframes orbitData {
          from { transform: rotate(0deg) translateX(22px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(22px) rotate(-360deg); }
        }

        @keyframes dishSpin {
          from { transform: translateX(-50%) rotate(0deg); }
          to { transform: translateX(-50%) rotate(360deg); }
        }

        @keyframes riskBulletBurst {
          0% { opacity: 0; transform: translateX(-50%) translateY(0); }
          18% { opacity: 1; }
          100% { opacity: 0; transform: translateX(-50%) translateY(-24px); }
        }

        .ship-stage {
          position: relative;
          width: 84px;
          height: 84px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .ship-flight {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 48px;
          height: 48px;
          transform: translate(-50%, -50%);
          transform-origin: center center;
          margin-top: 6px;
        }

        .pixel-ship {
          position: absolute;
          left: 0;
          top: 0;
          width: 48px;
          height: 48px;
          --sprite-center: 26px;
          --engine-center: 26px;
          --engine-gap: 3px;
          image-rendering: pixelated;
          transition: transform 220ms ease;
          transform-origin: center center;
          translate: calc(24px - var(--sprite-center)) 0;
        }

        .pixel-ship--analysis {
          --sprite-center: 18px;
          --engine-center: 18px;
        }

        .pixel-ship--risk {
          --sprite-center: 22px;
          --engine-center: 22px;
        }

        .pixel {
          position: absolute;
          image-rendering: pixelated;
        }

        .flame {
          position: absolute;
          bottom: -2px;
          width: 4px;
          height: 7px;
          background: #ffd348;
          opacity: 0;
          transform: translateX(-50%);
          transform-origin: center top;
        }

        .flame--1 { left: calc(var(--engine-center) - var(--engine-gap)); background: #ffd348; }
        .flame--2 { left: calc(var(--engine-center) + var(--engine-gap)); background: #ff7f2e; }

        .bullet,
        .risk-bullet,
        .signal-ring,
        .orbit,
        .block-node {
          position: absolute;
          pointer-events: none;
          opacity: 0;
        }

        .bullet {
          top: 16px;
          left: 50%;
          width: 3px;
          height: 8px;
          transform: translateX(-50%);
        }

        .bullet--1 { margin-left: -8px; }
        .bullet--2 { margin-left: 8px; }
        .bullet--3 { margin-left: 0; top: 8px; }

        .risk-bullet {
          top: 18px;
          left: 50%;
          width: 3px;
          height: 7px;
          transform: translateX(-50%);
        }

        .risk-bullet--1 { margin-left: -7px; }
        .risk-bullet--2 { margin-left: 7px; }
        .risk-bullet--3 { margin-left: 0; top: 10px; }

        .signal-ring {
          top: 50%;
          left: 50%;
          width: 46px;
          height: 46px;
          border: 1px solid;
          border-radius: 999px;
          transform: translate(-50%, -50%);
        }

        .signal-ring--2 {
          width: 64px;
          height: 64px;
        }

        .orbit {
          top: 50%;
          left: 50%;
          width: 4px;
          height: 4px;
          border-radius: 999px;
        }

        .group:hover .ship-flight--algorithm,
        .group:hover .ship-flight--risk,
        .ship-active .ship-flight--algorithm,
        .ship-active .ship-flight--risk {
          animation: shipWobble 0.8s linear infinite;
        }

        .group:hover .ship-flight--analysis,
        .ship-active .ship-flight--analysis {
          animation: shipWobble 1.1s linear infinite;
        }

        .group:hover .pixel-ship .flame,
        .ship-active .pixel-ship .flame {
          opacity: 1;
          animation: flameFlicker 0.22s steps(2, end) infinite;
        }

        .group:hover .bullet,
        .ship-active .bullet {
          opacity: 1;
          animation: bulletBurst 0.45s linear infinite;
        }

        .group:hover .bullet--2,
        .ship-active .bullet--2 { animation-delay: 0.08s; }
        .group:hover .bullet--3,
        .ship-active .bullet--3 { animation-delay: 0.14s; }

        .group:hover .risk-bullet,
        .ship-active .risk-bullet {
          opacity: 1;
          animation: riskBulletBurst 0.5s linear infinite;
        }

        .group:hover .risk-bullet--2,
        .ship-active .risk-bullet--2 { animation-delay: 0.09s; }
        .group:hover .risk-bullet--3,
        .ship-active .risk-bullet--3 { animation-delay: 0.16s; }

        .group:hover .signal-ring,
        .ship-active .signal-ring {
          opacity: 1;
          animation: signalPulse 1.5s ease-out infinite;
        }

        .group:hover .signal-ring--2,
        .ship-active .signal-ring--2 { animation-delay: 0.3s; }
        .group:hover .orbit--1,
        .group:hover .orbit--2,
        .ship-active .orbit--1,
        .ship-active .orbit--2 {
          opacity: 1;
          animation: orbitData 2.4s linear infinite;
        }

        .group:hover .orbit--2,
        .ship-active .orbit--2 { animation-duration: 3s; }

        .fighter-console {
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

        .fighter-console::before {
          content: '';
          position: absolute;
          inset: 10px;
          border: 1px solid rgba(43, 84, 133, 0.4);
          pointer-events: none;
        }

        .fighter-title {
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

        .fighter-title span {
          display: block;
          font-size: clamp(20px, 3.3vw, 32px);
          letter-spacing: 5px;
          color: #88baff;
          margin-top: 8px;
        }

        .fighter-card {
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

        .fighter-card::before,
        .fighter-card::after {
          content: '';
          position: absolute;
          inset: 6px;
          pointer-events: none;
        }

        .fighter-card::before {
          border: 2px solid var(--track-outline);
          opacity: 0.85;
        }

        .fighter-card::after {
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

        .fighter-card__corners {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
        }

        .fighter-card__corner {
          position: absolute;
          width: 24px;
          height: 24px;
          opacity: 0.98;
          filter: drop-shadow(0 0 8px var(--track-accent));
        }

        .fighter-card__corner::before,
        .fighter-card__corner::after {
          content: '';
          position: absolute;
          background: var(--track-accent);
          box-shadow: 0 0 8px var(--track-accent);
        }

        .fighter-card__corner--tl {
          top: -2px;
          left: -2px;
        }

        .fighter-card__corner--tr {
          top: -2px;
          right: -2px;
        }

        .fighter-card__corner--bl {
          bottom: -2px;
          left: -2px;
        }

        .fighter-card__corner--br {
          bottom: -2px;
          right: -2px;
        }

        .fighter-card__corner--tl::before,
        .fighter-card__corner--tr::before,
        .fighter-card__corner--bl::before,
        .fighter-card__corner--br::before {
          top: 0;
          width: 20px;
          height: 3px;
        }

        .fighter-card__corner--tl::after,
        .fighter-card__corner--tr::after,
        .fighter-card__corner--bl::after,
        .fighter-card__corner--br::after {
          left: 0;
          width: 3px;
          height: 20px;
        }

        .fighter-card__corner--tl::before {
          left: 0;
        }

        .fighter-card__corner--tl::after {
          top: 0;
        }

        .fighter-card__corner--tr::before {
          right: 0;
        }

        .fighter-card__corner--tr::after {
          top: 0;
          left: auto;
          right: 0;
        }

        .fighter-card__corner--bl::before {
          bottom: 0;
          top: auto;
          left: 0;
        }

        .fighter-card__corner--bl::after {
          bottom: 0;
          top: auto;
        }

        .fighter-card__corner--br::before {
          bottom: 0;
          top: auto;
          right: 0;
        }

        .fighter-card__corner--br::after {
          bottom: 0;
          top: auto;
          left: auto;
          right: 0;
        }

        .fighter-card__corner-step {
          position: absolute;
          width: 10px;
          height: 10px;
          border-color: var(--track-accent);
          opacity: 0.98;
          filter: drop-shadow(0 0 6px var(--track-accent));
        }

        .fighter-card__corner-step--tl {
          top: 3px;
          left: 3px;
          border-top: 3px solid var(--track-accent);
          border-left: 3px solid var(--track-accent);
        }

        .fighter-card__corner-step--tr {
          top: 3px;
          right: 3px;
          border-top: 3px solid var(--track-accent);
          border-right: 3px solid var(--track-accent);
        }

        .fighter-card__corner-step--bl {
          bottom: 3px;
          left: 3px;
          border-bottom: 3px solid var(--track-accent);
          border-left: 3px solid var(--track-accent);
        }

        .fighter-card__corner-step--br {
          bottom: 3px;
          right: 3px;
          border-bottom: 3px solid var(--track-accent);
          border-right: 3px solid var(--track-accent);
        }

        .fighter-card:hover {
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

        .fighter-card--selected {
          border-color: var(--track-accent);
          box-shadow:
            0 0 0 2px rgba(8, 13, 25, 0.98),
            inset 0 0 0 1px rgba(255, 255, 255, 0.03),
            inset 0 0 30px rgba(0, 0, 0, 0.28),
            0 0 22px var(--track-shadow),
            0 0 36px var(--track-shadow),
            0 0 56px rgba(0, 0, 0, 0.26);
        }

        .fighter-card--focused {
          transform: translateY(-4px);
          border-color: var(--track-accent);
          box-shadow:
            0 0 0 2px rgba(8, 13, 25, 0.98),
            inset 0 0 0 1px rgba(255, 255, 255, 0.03),
            0 0 26px var(--track-shadow);
        }

        .fighter-card__ship {
          position: relative;
          display: flex;
          justify-content: center;
          margin-bottom: 1.75rem;
        }

        .fighter-card__ship::before {
          content: '';
          position: absolute;
          inset: auto 15% -6px 15%;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--track-outline), transparent);
          opacity: 0.7;
        }

        .fighter-panel {
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

        .fighter-panel::before {
          content: '';
          position: absolute;
          inset: 6px;
          border: 1px solid var(--track-outline);
          opacity: 0.5;
        }

        .fighter-badge {
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

        .fighter-metric {
          border-top: 1px dashed var(--track-outline);
          padding-top: 0.95rem;
        }

        .fighter-chip {
          border: 1px solid var(--track-outline);
          background: rgba(5, 10, 19, 0.82);
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.02);
        }

        @media (max-width: 767px) {
          .fighter-title span {
            letter-spacing: 3px;
          }
        }

      `}</style>
      <div className="game-modes-scanline absolute inset-0" />
      <div className="absolute inset-0 opacity-40">
        <div className="h-full w-full bg-[radial-gradient(circle_at_top,rgba(4,74,148,0.18),transparent_30%),linear-gradient(180deg,transparent,rgba(250,70,22,0.03)_58%,transparent)]" />
      </div>
      <div className="max-w-[1260px] mx-auto px-4 sm:px-6">
        <div className="fighter-console px-4 py-5 sm:px-5 lg:px-6">
          <div className="mb-4 flex items-center justify-center gap-4">
            <div className="h-px w-10 bg-gradient-to-r from-transparent to-[#2c6dac]" />
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-[#FA4616]" />
              <div className="h-2 w-2 bg-[#63f6ff]" />
              <div className="h-2 w-2 bg-[#33d17a]" />
            </div>
            <div className="h-px w-10 bg-gradient-to-l from-transparent to-[#2c6dac]" />
          </div>

          <div className="mb-5 text-center">
            <div
              className="mb-2 text-[#7e90ab]"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '2.4px',
              }}
            >
              04 / CHOOSE YOUR GAME MODE
            </div>
            <h2 className="fighter-title">Select Your Track</h2>
          </div>

          <div className="relative mb-5 overflow-hidden border border-[#1d4f83] bg-[linear-gradient(180deg,#08101a_0%,#091523_55%,#07111d_100%)] px-3 py-2 shadow-[0_0_0_1px_rgba(4,74,148,0.22),0_0_24px_rgba(4,74,148,0.08)] md:px-4">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#5db8ff]/60 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#FA4616]/45 to-transparent" />
            <div className="pointer-events-none absolute left-0 top-0 h-4 w-4 border-l-2 border-t-2 border-[#044a94]" />
            <div className="pointer-events-none absolute right-0 top-0 h-4 w-4 border-r-2 border-t-2 border-[#044a94]" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-[#044a94]" />
            <div className="pointer-events-none absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-[#044a94]" />

            <div className="relative flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="fighter-panel ship-active !min-h-[58px] !min-w-[58px] scale-[0.66]"
                  style={{
                    borderColor: previewTrack.accentColor,
                    boxShadow: `0 0 16px ${previewTrack.accentColor}33`,
                    ['--track-accent' as string]: previewTrack.accentColor,
                    ['--track-outline' as string]: `${previewTrack.accentColor}66`,
                    ['--track-shadow' as string]: `${previewTrack.accentColor}33`,
                    ['--track-panel-glow' as string]: `${previewTrack.accentColor}20`,
                  }}
                >
                  <PixelShip type={previewTrack.fighterType} accentColor={previewTrack.accentColor} />
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
                    ARCADE TRACK SELECTION
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
                    {'< > TO NAVIGATE   A TO SELECT'}
                    <span style={{ animation: 'blink 1s step-end infinite' }}> _</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-3 md:grid-cols-2 md:gap-6">
            {tracks.map((track, index) => (
              <article
                key={index}
                className={`group fighter-card overflow-hidden cursor-pointer outline-none focus:outline-none focus-visible:outline-none ${
                  selectedTrackIndex === index ? 'fighter-card--selected' : ''
                } ${
                  focusedTrackIndex === index ? 'fighter-card--focused' : ''
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
                <div className="fighter-card__corners">
                  <span className="fighter-card__corner fighter-card__corner--tl" />
                  <span className="fighter-card__corner fighter-card__corner--tr" />
                  <span className="fighter-card__corner fighter-card__corner--bl" />
                  <span className="fighter-card__corner fighter-card__corner--br" />
                  <span className="fighter-card__corner-step fighter-card__corner-step--tl" />
                  <span className="fighter-card__corner-step fighter-card__corner-step--tr" />
                  <span className="fighter-card__corner-step fighter-card__corner-step--bl" />
                  <span className="fighter-card__corner-step fighter-card__corner-step--br" />
                </div>

                <div className="relative z-10 flex h-full flex-col p-6 md:p-7">
                  <div className="mb-5 flex items-start justify-between gap-3">
                    <span className="fighter-badge">P{index + 1} / TRACK SELECT</span>
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
                  <div className="fighter-card__ship">
                    <div
                      className={`fighter-panel transition-transform duration-300 group-hover:scale-105 ${
                        selectedTrackIndex === index || focusedTrackIndex === index ? 'ship-active scale-105' : ''
                      }`}
                    >
                      <PixelShip type={track.fighterType} accentColor={track.accentColor} />
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

                  <div className="fighter-metric mb-4">
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
                        className="fighter-chip px-3 py-1.5"
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
            ))}
          </div>

          <div className="mt-10">
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
          </div>
        </div>
      </div>
    </section>
  );
}
