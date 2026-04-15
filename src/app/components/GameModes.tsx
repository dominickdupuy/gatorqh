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
          <span className="shield shield--1" style={{ borderColor: `${accentColor}66` }} />
          <span className="shield shield--2" style={{ borderColor: `${accentColor}33` }} />
          <span className="asteroid asteroid--1" />
          <span className="asteroid asteroid--2" />
          <span className="spark spark--1" style={{ backgroundColor: '#d8ffe8' }} />
          <span className="spark spark--2" style={{ backgroundColor: '#d8ffe8' }} />
        </>
      )}
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
  );
}

export function GameModes() {
  const tracks: Track[] = [
    {
      title: 'Research & Alpha Discovery',
      tagline: 'Pitch a testable edge.',
      description: 'A written and presentation track where participants propose a testable hypothesis with supporting analysis. This track is designed to attract strong analytical thinkers who may not be experienced coders. Marketing for this track should appeal to finance and economics students.',
      comment: '// FIGHTER PROFILE: THESIS LAB // PRESENTATION READY',
      badges: ['Finance', 'Economics', 'Hypothesis', 'Analysis'],
      accentColor: '#FA4616',
      fighterType: 'algorithm',
      callSign: 'THESIS',
      systemLabel: 'RESEARCH DECK // ALPHA SIGNAL',
    },
    {
      title: 'Quantitative Puzzles & Brainteasers',
      tagline: 'Low barrier, high upside.',
      description: 'Probability, combinatorics, and game theory problems with no dataset required. This is the widest funnel and should be marketed heavily toward CS and math students who may have never touched finance. The low barrier to entry is a key selling point.',
      comment: '// FIGHTER PROFILE: PUZZLE ENGINE // FAST THINKING',
      badges: ['Probability', 'Combinatorics', 'Game Theory', 'No Dataset'],
      accentColor: '#044a94',
      fighterType: 'analysis',
      callSign: 'RIDDLE',
      systemLabel: 'LOGIC LOOPS // OPEN ENTRY',
    },
    {
      title: 'Systematic Trading',
      tagline: 'Optimize the full strategy.',
      description: 'Participants build a trading strategy and maximize risk-adjusted returns on historical data. Judged on Sharpe ratio, drawdown, and turnover. This track attracts the core quant audience and should be marketed toward students with programming and quantitative modeling experience.',
      comment: '// FIGHTER PROFILE: STRATEGY CORE // RISK-ADJUSTED RUN',
      badges: ['Sharpe Ratio', 'Drawdown', 'Turnover', 'Historical Data'],
      accentColor: '#33d17a',
      fighterType: 'risk',
      callSign: 'VECTOR',
      systemLabel: 'BACKTEST LOOP // EXECUTION STACK',
    },
  ];

  return (
    <section id="game-modes" className="relative overflow-hidden bg-[#0A0A0A] py-24">
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
          0%, 100% { transform: scaleY(1); opacity: 0.95; }
          50% { transform: scaleY(0.55); opacity: 0.55; }
        }

        @keyframes shipWobble {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-2px) rotate(-2deg); }
          75% { transform: translateY(2px) rotate(2deg); }
        }

        @keyframes bulletBurst {
          0% { opacity: 0; transform: translateY(0); }
          20% { opacity: 1; }
          100% { opacity: 0; transform: translateY(-30px); }
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

        @keyframes shieldPulse {
          0%, 100% { opacity: 0.28; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.08); }
        }

        @keyframes asteroidBounceLeft {
          0% { transform: translate(0, 0); opacity: 0; }
          25% { opacity: 1; }
          60% { transform: translate(18px, 10px); opacity: 1; }
          100% { transform: translate(-6px, -4px); opacity: 0; }
        }

        @keyframes asteroidBounceRight {
          0% { transform: translate(0, 0); opacity: 0; }
          25% { opacity: 1; }
          60% { transform: translate(-18px, 8px); opacity: 1; }
          100% { transform: translate(6px, -4px); opacity: 0; }
        }

        @keyframes sparkFlash {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          35% { opacity: 1; transform: scale(1.2); }
        }

        .ship-stage {
          position: relative;
          width: 84px;
          height: 84px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .pixel-ship {
          position: relative;
          width: 48px;
          height: 48px;
          image-rendering: pixelated;
          transition: transform 220ms ease;
        }

        .pixel-ship--algorithm {
          top: 10px;
        }

        .pixel-ship--analysis {
          left: 4px;
          top: 10px;
        }

        .pixel-ship--risk {
          left: 4px;
          top: 10px;
        }

        .pixel {
          position: absolute;
          image-rendering: pixelated;
        }

        .flame {
          position: absolute;
          bottom: -6px;
          width: 4px;
          height: 8px;
          background: #ffd348;
          opacity: 0;
          transform-origin: top center;
        }

        .flame--1 { left: 16px; background: #ffd348; }
        .flame--2 { left: 28px; background: #ff7f2e; }

        .bullet,
        .signal-ring,
        .orbit,
        .shield,
        .asteroid,
        .spark,
        .block-node {
          position: absolute;
          pointer-events: none;
          opacity: 0;
        }

        .bullet {
          top: 16px;
          width: 3px;
          height: 8px;
        }

        .bullet--1 { left: 26px; }
        .bullet--2 { left: 40px; }
        .bullet--3 { left: 33px; top: 8px; }

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

        .shield {
          top: 50%;
          left: 50%;
          width: 66px;
          height: 66px;
          border: 2px solid;
          clip-path: polygon(25% 6%, 75% 6%, 94% 50%, 75% 94%, 25% 94%, 6% 50%);
          transform: translate(-50%, -50%);
        }

        .shield--2 {
          width: 78px;
          height: 78px;
        }

        .asteroid {
          width: 8px;
          height: 8px;
          background: #8f98a6;
          box-shadow: 4px 0 0 #6c7582, 0 4px 0 #6c7582;
        }

        .asteroid--1 { left: 4px; top: 10px; }
        .asteroid--2 { right: 4px; top: 18px; }

        .spark {
          width: 4px;
          height: 4px;
        }

        .spark--1 { left: 12px; top: 20px; }
        .spark--2 { right: 12px; top: 24px; }

        .group:hover .pixel-ship--algorithm,
        .group:hover .pixel-ship--risk {
          animation: shipWobble 0.8s ease-in-out infinite;
        }

        .group:hover .pixel-ship--analysis {
          animation: shipWobble 1.1s ease-in-out infinite;
        }

        .group:hover .pixel-ship .flame {
          opacity: 1;
          animation: flameFlicker 0.22s steps(2, end) infinite;
        }

        .group:hover .bullet {
          opacity: 1;
          animation: bulletBurst 0.45s linear infinite;
        }

        .group:hover .bullet--2 { animation-delay: 0.08s; }
        .group:hover .bullet--3 { animation-delay: 0.14s; }

        .group:hover .signal-ring {
          opacity: 1;
          animation: signalPulse 1.5s ease-out infinite;
        }

        .group:hover .signal-ring--2 { animation-delay: 0.3s; }
        .group:hover .orbit--1,
        .group:hover .orbit--2 {
          opacity: 1;
          animation: orbitData 2.4s linear infinite;
        }

        .group:hover .orbit--2 { animation-duration: 3s; }

        .group:hover .shield {
          opacity: 1;
          animation: shieldPulse 1.4s ease-in-out infinite;
        }

        .group:hover .asteroid--1 {
          opacity: 1;
          animation: asteroidBounceLeft 0.9s ease-out infinite;
        }

        .group:hover .asteroid--2 {
          opacity: 1;
          animation: asteroidBounceRight 0.9s ease-out infinite;
        }

        .group:hover .spark {
          opacity: 1;
          animation: sparkFlash 0.55s steps(2, end) infinite;
        }

        .group:hover .spark--2 { animation-delay: 0.2s; }
      `}</style>
      <div className="game-modes-scanline absolute inset-0" />
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#044a94]" />
              <div className="w-2 h-2 bg-[#FA4616]" />
              <div className="w-2 h-2 bg-[#33d17a]" />
            </div>
            <span
              className="text-[#9A9A9A]"
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '14px',
                fontWeight: 600,
                letterSpacing: '2px',
              }}
            >
              04 / CHOOSE YOUR GAME MODE
            </span>
          </div>

          <h2
            className="text-[#F4F4F4]"
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(24px, 4vw, 40px)',
              lineHeight: 1.3,
              textShadow: '0 0 30px rgba(4, 74, 148, 0.3)',
            }}
          >
            SELECT YOUR TRACK
          </h2>
        </div>

        <div className="relative mb-8 overflow-hidden border border-[#1d4f83] bg-[linear-gradient(180deg,#08101a_0%,#091523_55%,#07111d_100%)] px-5 py-4 shadow-[0_0_0_1px_rgba(4,74,148,0.22),0_0_24px_rgba(4,74,148,0.08)] md:px-7">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#5db8ff]/60 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#FA4616]/45 to-transparent" />
          <div className="pointer-events-none absolute left-0 top-0 h-4 w-4 border-l-2 border-t-2 border-[#044a94]" />
          <div className="pointer-events-none absolute right-0 top-0 h-4 w-4 border-r-2 border-t-2 border-[#044a94]" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-[#044a94]" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-[#044a94]" />

          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div>
                <div
                  style={{
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#FA4616',
                    letterSpacing: '1.8px',
                    textShadow: '0 0 10px rgba(250,70,22,0.2)',
                  }}
                >
                  SELECT YOUR FIGHTER
                </div>
                <div
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '11px',
                    color: '#7e90ab',
                    letterSpacing: '1.2px',
                  }}
                >
                  ARCADE TRACK SELECTION
                </div>
              </div>
            </div>

            <div className="flex items-center justify-start md:justify-end">
              <div className="border border-[#203854] bg-[#0a1421]/90 px-4 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_0_18px_rgba(4,74,148,0.08)]">
                <span
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '11px',
                    color: '#a4acbb',
                    letterSpacing: '1.1px',
                  }}
                >
                  {'< > TO NAVIGATE  A TO SELECT'}
                  <span style={{ animation: 'blink 1s step-end infinite' }}> _</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 md:gap-8">
          {tracks.map((track, index) => (
            <div
              key={index}
              className="group relative bg-[#1A1A2E] overflow-hidden transition-all duration-300 hover:transform hover:scale-[1.02]"
            >
              <div
                className="absolute top-0 left-0 right-0 h-1 transition-all duration-300 group-hover:h-2"
                style={{ backgroundColor: track.accentColor }}
              />

              <div
                className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 opacity-50 group-hover:opacity-100 transition-opacity"
                style={{ borderColor: track.accentColor }}
              />
              <div
                className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 opacity-50 group-hover:opacity-100 transition-opacity"
                style={{ borderColor: track.accentColor }}
              />
              <div
                className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 opacity-50 group-hover:opacity-100 transition-opacity"
                style={{ borderColor: track.accentColor }}
              />
              <div
                className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 opacity-50 group-hover:opacity-100 transition-opacity"
                style={{ borderColor: track.accentColor }}
              />

              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at top left, ${track.accentColor}15, transparent 60%)`,
                }}
              />

              <div className="relative z-10 p-6 md:p-10">
                <div className="mb-5 md:mb-6">
                  <div
                    className="inline-flex h-[84px] w-[84px] items-center justify-center border-2 bg-[#0c1020] transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_30px]"
                    style={{
                      borderColor: track.accentColor,
                      boxShadow: `0 0 20px ${track.accentColor}40`,
                    }}
                  >
                    <PixelShip type={track.fighterType} accentColor={track.accentColor} />
                  </div>
                </div>

                <h3
                  className="text-[#F4F4F4] mb-2 md:mb-3"
                  style={{
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: 'clamp(24px, 5vw, 32px)',
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                  }}
                >
                  {track.title}
                </h3>

                <p
                  className="mb-4 md:mb-5"
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '13px',
                    fontWeight: 600,
                    color: track.accentColor,
                    textShadow: `0 0 10px ${track.accentColor}70, 0 0 22px ${track.accentColor}35`,
                  }}
                >
                  {track.tagline}
                </p>

                <div className="mb-4 border border-[#2A2A3E] bg-[#0B0D14]/85 px-3 py-3">
                  <div
                    className="mb-1"
                    style={{
                      fontFamily: "'Orbitron', sans-serif",
                      fontSize: '10px',
                      color: '#9A9AA8',
                      letterSpacing: '1.2px',
                    }}
                  >
                    CALL SIGN
                  </div>
                  <div
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '13px',
                      fontWeight: 700,
                      color: track.accentColor,
                      letterSpacing: '1px',
                    }}
                  >
                    {track.callSign}
                  </div>
                  <div
                    className="mt-2"
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '11px',
                      color: '#9A9AA8',
                      letterSpacing: '0.8px',
                    }}
                  >
                    {track.systemLabel}
                  </div>
                </div>

                <p
                  className="text-[#9A9A9A] mb-5 md:mb-6 leading-relaxed"
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '14px',
                    lineHeight: 1.7,
                  }}
                >
                  {track.description}
                </p>

                <p
                  className="text-[#9A9AA8] mb-5 md:mb-6"
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '12px',
                    fontWeight: 600,
                    letterSpacing: '0.8px',
                  }}
                >
                  {track.comment}
                </p>

                <div className="flex flex-wrap gap-2">
                  {track.badges.map((badge, badgeIndex) => (
                    <span
                      key={badgeIndex}
                      className="px-3 py-1.5 bg-[#0A0A0A] border border-[#2A2A3E] transition-all duration-300"
                      style={{
                        borderColor: '#2A2A3E',
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '11px',
                        fontWeight: 500,
                        color: track.accentColor,
                      }}
                    >
                      {badge}
                    </span>
                  ))}
                </div>

                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 255, 255, 0.1) 2px, rgba(255, 255, 255, 0.1) 4px)',
                  }}
                />
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-px bg-[#2A2A3E]" />
            </div>
          ))}
        </div>

        <div className="mt-10 md:mt-12 text-center">
          <p
            className="text-[#9A9A9A] mb-4"
            style={{ fontFamily: "'Space Mono', monospace", fontSize: '13px' }}
          >
            Not sure which track? Teams can pivot during the event.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-[#2A2A3E]">
            <div className="w-2 h-2 bg-[#044a94] animate-pulse" />
            <span
              className="text-[#9A9A9A]"
              style={{ fontFamily: "'Space Mono', monospace", fontSize: '12px' }}
            >
              All tracks eligible for main prize pool
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
