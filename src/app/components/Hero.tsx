import { useEffect, useRef, useState } from 'react';
import { ShatterButton } from '@/components/ui/shatter-button';
import bluePlanet from './bluePlanet.png';
import orangePlanet from './orangePlanet.png';

const titleLines = ['GATOR', 'QUANT', 'HACKS'];
type Star = {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  color: string;
};

type AppPage = 'home' | 'interest';

export function Hero({
  onNavigate,
  isIntroActive = false,
}: {
  onNavigate?: (page: AppPage) => void;
  isIntroActive?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  const scrollToRegister = () => {
    document.getElementById('register')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openSponsorMail = () => {
    window.location.href = 'mailto:team@gatorquant.com?subject=Power%20Sponsor%20Inquiry';
  };

  useEffect(() => {
    if (isIntroActive) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    let animationFrame = 0;
    const stars: Star[] = [];

    const createStar = (width: number, height: number): Star => {
      const random = Math.random();
      let color = '#FFFFFF';
      if (random < 0.05) {
        color = '#FA4616';
      } else if (random < 0.15) {
        color = '#044a94';
      }

      return {
        x: Math.random() * width,
        y: Math.random() * height,
        size: 0.5 + Math.random() * 2,
        speed: 0.05 + Math.random() * 0.25,
        opacity: 0.3 + Math.random() * 0.7,
        color,
      };
    };

    const resizeCanvas = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
      stars.length = 0;
      for (let index = 0; index < 180; index += 1) {
        stars.push(createStar(width, height));
      }
    };

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      context.clearRect(0, 0, width, height);

      stars.forEach((star) => {
        star.y += star.speed;
        if (star.y > height) {
          star.y = 0;
          star.x = Math.random() * width;
        }

        context.fillStyle =
          star.color === '#FFFFFF'
            ? `rgba(255,255,255,${star.opacity})`
            : star.color === '#044a94'
              ? `rgba(4,74,148,${star.opacity})`
              : `rgba(250,70,22,${star.opacity})`;
        const pixelSize = star.size < 1.2 ? 1 : star.size < 1.9 ? 2 : 3;
        context.fillRect(star.x, star.y, pixelSize, pixelSize);
      });

      animationFrame = window.requestAnimationFrame(render);
    };

    resizeCanvas();
    render();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isIntroActive]);

  useEffect(() => {
    let animationFrame = 0;

    const onScroll = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        setScrollY(window.scrollY);
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 767px)');
    const updateViewport = () => setIsMobileViewport(mobileQuery.matches);

    updateViewport();
    mobileQuery.addEventListener('change', updateViewport);

    return () => {
      mobileQuery.removeEventListener('change', updateViewport);
    };
  }, []);

  const bluePlanetOffset = Math.min(scrollY * 0.42, 180);
  const altPlanetOffset = Math.min(scrollY * 0.34, 140);

  return (
    <section id="hero" className="hero-space relative min-h-screen overflow-hidden">
      <canvas
        id="starfield"
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          backgroundImage:
            'linear-gradient(rgba(4,74,148,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(4,74,148,0.05) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      <style>{`
        .hero-space {
          background:
            radial-gradient(circle at 50% 22%, rgba(99, 246, 255, 0.08), transparent 22%),
            linear-gradient(180deg, #070b11 0%, #090c12 48%, #0a0d13 100%);
        }

        .hero-space::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(255,255,255,0.03) 2px,
            rgba(255,255,255,0.03) 4px
          );
          pointer-events: none;
          z-index: 0;
        }

        .pixel-badge::after {
          content: '_';
          animation: blink 1s step-end infinite;
        }

        @keyframes blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }

        .pixel-btn:active {
          transform: translate(4px, 4px);
          box-shadow: 0px 0px 0px #7a1a00;
        }

        @keyframes scanline {
          0% { background-position: 0 0; }
          100% { background-position: 0 16px; }
        }

        @keyframes heroTitleGlow {
          0%, 100% { filter: brightness(1) saturate(1); }
          50% { filter: brightness(1.035) saturate(1.06); }
        }

        .hero-title-main {
          animation: heroTitleGlow 7s ease-in-out infinite;
        }

        .hero-title-stack {
          transform-origin: center;
        }

        .hero-title-seo {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        .hero-title-layer::before {
          content: attr(data-title);
        }

        .mission-console {
          position: relative;
          min-height: 100%;
          overflow: hidden;
          border: 2px solid #2e86ff;
          background:
            linear-gradient(180deg, rgba(9, 14, 28, 0.97), rgba(4, 8, 18, 0.98)),
            radial-gradient(circle at top, rgba(46, 134, 255, 0.14), transparent 58%);
          box-shadow:
            0 0 0 2px rgba(8, 13, 25, 0.98),
            inset 0 0 0 1px rgba(255, 255, 255, 0.02),
            inset 0 0 24px rgba(0, 0, 0, 0.22),
            0 0 18px rgba(46, 134, 255, 0.33),
            0 0 26px rgba(0, 0, 0, 0.22);
        }

        .mission-console::before,
        .mission-console::after {
          content: '';
          position: absolute;
          pointer-events: none;
        }

        .mission-console::before {
          inset: 6px;
          border: 2px solid rgba(46, 134, 255, 0.4);
          opacity: 0.85;
        }

        .mission-console::after {
          inset: 6px;
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

        .mission-console__corners {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
        }

        .mission-console__corner {
          position: absolute;
          width: 24px;
          height: 24px;
          opacity: 0.98;
          filter: drop-shadow(0 0 8px #2e86ff);
        }

        .mission-console__corner::before,
        .mission-console__corner::after {
          content: '';
          position: absolute;
          background: #2e86ff;
          box-shadow: 0 0 8px #2e86ff;
        }

        .mission-console__corner--tl {
          top: -2px;
          left: -2px;
        }

        .mission-console__corner--tr {
          top: -2px;
          right: -2px;
        }

        .mission-console__corner--bl {
          bottom: -2px;
          left: -2px;
        }

        .mission-console__corner--br {
          bottom: -2px;
          right: -2px;
        }

        .mission-console__corner--tl::before,
        .mission-console__corner--tr::before,
        .mission-console__corner--bl::before,
        .mission-console__corner--br::before {
          top: 0;
          width: 20px;
          height: 3px;
        }

        .mission-console__corner--tl::after,
        .mission-console__corner--tr::after,
        .mission-console__corner--bl::after,
        .mission-console__corner--br::after {
          left: 0;
          width: 3px;
          height: 20px;
        }

        .mission-console__corner--tl::before {
          left: 0;
        }

        .mission-console__corner--tl::after {
          top: 0;
        }

        .mission-console__corner--tr::before {
          right: 0;
        }

        .mission-console__corner--tr::after {
          top: 0;
          left: auto;
          right: 0;
        }

        .mission-console__corner--bl::before {
          bottom: 0;
          top: auto;
          left: 0;
        }

        .mission-console__corner--bl::after {
          bottom: 0;
          top: auto;
        }

        .mission-console__corner--br::before {
          bottom: 0;
          top: auto;
          right: 0;
        }

        .mission-console__corner--br::after {
          bottom: 0;
          top: auto;
          left: auto;
          right: 0;
        }

        .mission-console__corner-step {
          position: absolute;
          width: 10px;
          height: 10px;
          border-color: #2e86ff;
          opacity: 0.98;
          filter: drop-shadow(0 0 6px #2e86ff);
        }

        .mission-console__corner-step--tl {
          top: 3px;
          left: 3px;
          border-top: 3px solid #2e86ff;
          border-left: 3px solid #2e86ff;
        }

        .mission-console__corner-step--tr {
          top: 3px;
          right: 3px;
          border-top: 3px solid #2e86ff;
          border-right: 3px solid #2e86ff;
        }

        .mission-console__corner-step--bl {
          bottom: 3px;
          left: 3px;
          border-bottom: 3px solid #2e86ff;
          border-left: 3px solid #2e86ff;
        }

        .mission-console__corner-step--br {
          bottom: 3px;
          right: 3px;
          border-bottom: 3px solid #2e86ff;
          border-right: 3px solid #2e86ff;
        }

      `}</style>

      <img
        src={bluePlanet}
        alt=""
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: '14%',
          right: isMobileViewport ? '-30%' : '5%',
          width: '220px',
          height: '220px',
          objectFit: 'contain',
          filter: 'drop-shadow(8px 8px 0 #000820) drop-shadow(0 0 18px rgba(99,246,255,0.22))',
          imageRendering: 'pixelated',
          zIndex: 0,
          pointerEvents: 'none',
          willChange: 'transform',
          transform: `translate3d(0, ${bluePlanetOffset}px, 0)`,
        }}
      />

      <img
        src={orangePlanet}
        alt=""
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: '36%',
          left: isMobileViewport ? '-14%' : '10%',
          width: '130px',
          height: '130px',
          objectFit: 'contain',
          filter: 'drop-shadow(4px 4px 0 #000820) drop-shadow(0 0 16px rgba(250,70,22,0.22))',
          zIndex: 0,
          pointerEvents: 'none',
          willChange: 'transform',
          imageRendering: 'pixelated',
          transform: `translate3d(${altPlanetOffset * 0.08}px, ${-altPlanetOffset}px, 0)`,
        }}
      />

      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute left-1/2 bottom-[-60px] h-[300px] w-[600px] -translate-x-1/2"
          style={{
            background: 'radial-gradient(circle at center, rgba(250, 70, 22, 0.06) 0%, transparent 70%)',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1400px] flex-col items-center justify-center px-6 pb-10 pt-24 md:pb-14 text-center">
        <div className="mb-1 flex w-full max-w-[980px] flex-wrap items-center justify-between gap-3 md:mb-2">
          <div
            className="inline-flex items-center gap-3 border border-[#294f7d] bg-[#09111d]/92 px-4 py-3 shadow-[0_0_20px_rgba(4,74,148,0.12)]"
            style={{
              clipPath: 'polygon(4% 0, 96% 0, 100% 24%, 100% 76%, 96% 100%, 4% 100%, 0 76%, 0 24%)',
            }}
          >
            <span className="h-2.5 w-2.5 bg-[#FA4616] shadow-[0_0_10px_rgba(250,70,22,0.5)]" />
            <span
              className="text-[#ffb25e]"
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '10px',
                letterSpacing: '1px',
              }}
            >
              PLAYER 1
            </span>
            <span
              className="text-[#9cc9ff]"
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '10px',
                letterSpacing: '1px',
              }}
            >
              SPACE MARKET
            </span>
          </div>

          <div
            className="inline-flex items-center gap-3 border border-[#294f7d] bg-[#09111d]/92 px-4 py-3 shadow-[0_0_20px_rgba(4,74,148,0.12)]"
            style={{
              clipPath: 'polygon(6% 0, 94% 0, 100% 24%, 100% 76%, 94% 100%, 6% 100%, 0 76%, 0 24%)',
            }}
          >
            <span className="h-2.5 w-2.5 bg-[#63F6FF] shadow-[0_0_10px_rgba(99,246,255,0.5)]" />
            <span
              className="text-[#ffb25e]"
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '10px',
                letterSpacing: '1px',
              }}
            >
              CREDITS: 00
            </span>
          </div>
        </div>

        <div className="relative">
          <div
            className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle at center, rgba(99,246,255,0.08) 0%, transparent 72%)',
            }}
          />

          <div
            className="hero-panel relative w-full max-w-[680px]"
            style={{
              padding: '12px 48px 48px',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <h1 className="hero-title-seo">Gator Quant Hacks 2026</h1>
            <div className="hero-title-stack mb-10 w-full max-w-[1320px]">
              {titleLines.map((line, index) => {
                const isBottomLine = index === titleLines.length - 1;
                const titleSize = isBottomLine ? 'clamp(57px, 9vw, 131px)' : 'clamp(55px, 8.6vw, 125px)';

                return (
                <div
                  key={line}
                  className={`relative mx-auto flex justify-center ${isBottomLine ? '' : 'mb-1 md:mb-2'}`}
                >
                  {[24, 16, 8].map((offset, layerIndex) => (
                    <span
                      key={offset}
                      aria-hidden="true"
                      className="hero-title-layer absolute select-none uppercase"
                      data-title={line}
                      style={{
                        fontFamily: "'Russo One', sans-serif",
                        fontSize: titleSize,
                        fontWeight: 400,
                        letterSpacing: '0.02em',
                        lineHeight: 0.9,
                        whiteSpace: 'nowrap',
                        transform: `translate(0px, ${offset}px)`,
                        color: layerIndex === 0 ? '#173a65' : layerIndex === 1 ? '#173a65' : '#2a6fa8',
                      }}
                    />
                  ))}
                  <span
                    className="hero-title-main relative uppercase"
                    style={{
                      fontFamily: "'Russo One', sans-serif",
                      fontSize: titleSize,
                      fontWeight: 400,
                      letterSpacing: '0.02em',
                      lineHeight: 0.9,
                      whiteSpace: 'nowrap',
                      color: '#63f6ff',
                      textShadow: `
                        -1px 0 0 rgba(199,251,255,0.45),
                        1px 0 0 rgba(16,41,73,0.45),
                        0 -1px 0 rgba(242,255,255,0.55),
                        0 1px 0 rgba(18,49,93,0.55),
                        0 1px 0 #c7fbff,
                        0 2px 0 #63f6ff,
                        0 3px 0 #1aa9dc,
                        0 8px 0 #173a65,
                        0 12px 0 #12315d,
                        0 0 18px rgba(99,246,255,0.2)
                      `,
                    }}
                  >
                    {line}
                  </span>
                  <span
                    aria-hidden="true"
                    className="hero-title-layer absolute select-none uppercase"
                    data-title={line}
                    style={{
                      fontFamily: "'Russo One', sans-serif",
                      fontSize: titleSize,
                      fontWeight: 400,
                      letterSpacing: '0.02em',
                      lineHeight: 0.9,
                      whiteSpace: 'nowrap',
                      transform: 'translate(0px, 36px) scaleY(-1)',
                      transformOrigin: 'top center',
                      color: '#2e82cc',
                      opacity: 0.18,
                      filter: 'blur(0.5px)',
                      maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.65), transparent 72%)',
                      WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.65), transparent 72%)',
                    }}
                  />
                </div>
              )})}
            </div>

            <p
              className="mb-5 text-[#9cc9ff]"
              style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: 'clamp(24px, 3vw, 40px)',
                fontWeight: 700,
                letterSpacing: '0.03em',
                lineHeight: 1.1,
                textShadow: '0 0 24px rgba(4,74,148,0.28)',
              }}
            >
              Build the Model.
              <br />
              Beat the Market.
            </p>

            <div className="mission-console mx-auto mb-6 w-full max-w-[780px] px-3 py-3 md:px-4 md:py-4">
              <div className="mission-console__corners">
                <span className="mission-console__corner mission-console__corner--tl" />
                <span className="mission-console__corner mission-console__corner--tr" />
                <span className="mission-console__corner mission-console__corner--bl" />
                <span className="mission-console__corner mission-console__corner--br" />
                <span className="mission-console__corner-step mission-console__corner-step--tl" />
                <span className="mission-console__corner-step mission-console__corner-step--tr" />
                <span className="mission-console__corner-step mission-console__corner-step--bl" />
                <span className="mission-console__corner-step mission-console__corner-step--br" />
              </div>
              <div className="relative z-10 p-1">
                <div className="mb-3 border-b border-[#1f67be] pb-2 text-left">
                  <span
                    className="text-[#2e86ff]"
                    style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 'clamp(10px,0.95vw,15px)', letterSpacing: '0.8px' }}
                  >
                    MISSION BRIEFING
                  </span>
                </div>

                <div>
                  <p
                    className="text-left text-[#d7dee8]"
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: 'clamp(13px,1.05vw,16px)',
                      lineHeight: 1.7,
                      letterSpacing: '0.01em',
                    }}
                  >
                    Choose a track, build your model, and compete for the leaderboard
                    in a 36-hour trading arena. Teams develop and test quantitative
                    strategies under pressure, working through real market dynamics
                    before presenting their final results.
                  </p>
                </div>
              </div>
            </div>

            <div className="mx-auto grid w-full max-w-[780px] gap-3 sm:grid-cols-2">
              <ShatterButton
                onClick={scrollToRegister}
                shatterColor="#FA4616"
                className="pixel-btn group relative w-full border-0 text-white"
              >
                <span style={{ display: 'block', width: '100%', textAlign: 'center', fontFamily: "'Orbitron', sans-serif", fontSize: '14px', letterSpacing: '1px' }}>
                  REGISTER
                  <br />
                  NOW
                </span>
              </ShatterButton>

              <ShatterButton
                onClick={openSponsorMail}
                shatterColor="#9cc9ff"
                className="pixel-btn group relative w-full border-0"
              >
                <span style={{ display: 'block', width: '100%', textAlign: 'center', fontFamily: "'Orbitron', sans-serif", fontSize: '14px', letterSpacing: '1px' }}>
                  BECOME A POWER SPONSOR
                </span>
              </ShatterButton>
            </div>

            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('interest')}
                className="mt-5 text-[#9cc9ff] underline decoration-[#044a94] underline-offset-4 transition-colors hover:text-[#cbd6e8]"
                style={{ fontFamily: "'Space Mono', monospace", fontSize: '15px', letterSpacing: '0.08em' }}
              >
                Interest form (not registering yet)
              </button>
            )}
          </div>
        </div>

        <div className="hero-marquee -mt-4 w-full max-w-[1100px] overflow-hidden border-y border-[#173154] py-3">
          <div
            className="hero-marquee__track whitespace-nowrap text-[#9cc9ff]"
            style={{ fontFamily: "'Space Mono', monospace", fontSize: '12px', letterSpacing: '1.4px' }}
          >
            {Array.from({ length: 10 }, () => 'ARCADE MARKET // BUILD MODELS // CLIMB THE LEADERBOARD // ').join('')}
          </div>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 10,
          pointerEvents: 'none',
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 3px,
            rgba(0,0,0,0.15) 3px,
            rgba(0,0,0,0.15) 4px
          )`,
          backgroundSize: '100% 4px',
          opacity: 0.4,
          animation: 'scanline 1.6s linear infinite',
        }}
      />
    </section>
  );
}
