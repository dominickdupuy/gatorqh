import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { ShatterButton } from '@/components/ui/shatter-button';

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

export function Hero({ onNavigate }: { onNavigate?: (page: AppPage) => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [scrollY, setScrollY] = useState(0);

  const scrollToRegister = () => {
    document.getElementById('register')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openSponsorMail = () => {
    window.location.href = 'mailto:team@gatorquant.com?subject=Power%20Sponsor%20Inquiry';
  };

  useEffect(() => {
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
  }, []);

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
          100% { background-position: 0 32px; }
        }

        .mission-console {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(36, 92, 145, 0.85);
          background:
            linear-gradient(180deg, rgba(8, 14, 28, 0.95), rgba(4, 9, 20, 0.98)),
            radial-gradient(circle at top, rgba(4, 74, 148, 0.08), transparent 45%);
          box-shadow:
            0 0 0 3px rgba(5, 11, 23, 0.98),
            inset 0 0 0 1px rgba(129, 194, 255, 0.05),
            0 0 26px rgba(4, 74, 148, 0.12);
        }

        .mission-console::before {
          content: '';
          position: absolute;
          inset: 10px;
          border: 1px solid rgba(43, 84, 133, 0.35);
          pointer-events: none;
        }

        .mission-console::after {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: repeating-linear-gradient(
            180deg,
            rgba(255,255,255,0.02) 0 1px,
            transparent 1px 4px
          );
          opacity: 0.18;
        }

      `}</style>

      <div
        style={{
          position: 'fixed',
          top: '10%',
          right: '5%',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 35% 35%, #4da3ff 0 18%, #1a4a8a 18% 38%, #003087 38% 68%, #001a4a 68% 100%)',
          boxShadow:
            '4px 0 0 #001a4a, 0 4px 0 #001a4a, -4px 0 0 #1a4a8a, 0 -4px 0 #1a4a8a, 8px 8px 0 #000820',
          imageRendering: 'pixelated',
          zIndex: 0,
          pointerEvents: 'none',
          willChange: 'transform',
          transform: `translate3d(0, ${bluePlanetOffset}px, 0)`,
        }}
      />

      <div
        style={{
          position: 'fixed',
          top: '24%',
          left: '10%',
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 36% 36%, #ffd36e 0 18%, #d38b18 18% 58%, #6b3a08 58% 100%)',
          boxShadow: '4px 4px 0 #6b3a08',
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

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1400px] flex-col items-center justify-center px-6 py-24 text-center">
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
            <div className="mb-10 w-full max-w-[1320px]">
              {titleLines.map((line, index) => {
                const isBottomLine = index === titleLines.length - 1;
                const titleSize = isBottomLine ? 'clamp(56px, 9vw, 130px)' : 'clamp(54px, 8.6vw, 124px)';

                return (
                <div
                  key={line}
                  className={`relative mx-auto flex justify-center ${isBottomLine ? '' : 'mb-1 md:mb-2'}`}
                >
                  {[24, 16, 8].map((offset, layerIndex) => (
                    <span
                      key={offset}
                      aria-hidden="true"
                      className="absolute select-none uppercase"
                      style={{
                        fontFamily: "'Russo One', sans-serif",
                        fontSize: titleSize,
                        fontWeight: 400,
                        letterSpacing: '0.02em',
                        lineHeight: 0.9,
                        whiteSpace: 'nowrap',
                        transform: `translate(0px, ${offset}px)`,
                        color: layerIndex === 0 ? '#244a7a' : layerIndex === 1 ? '#1b3d68' : '#122d4d',
                      }}
                    >
                      {line}
                    </span>
                  ))}
                  <span
                    aria-hidden="true"
                    className="absolute select-none uppercase"
                    style={{
                      fontFamily: "'Russo One', sans-serif",
                      fontSize: titleSize,
                      fontWeight: 400,
                      letterSpacing: '0.02em',
                      lineHeight: 0.9,
                      whiteSpace: 'nowrap',
                      transform: 'translate(0px, -4px)',
                      color: '#dffcff',
                      opacity: 0.95,
                    }}
                  >
                    {line}
                  </span>
                  <span
                    className="relative uppercase"
                    style={{
                      fontFamily: "'Russo One', sans-serif",
                      fontSize: titleSize,
                      fontWeight: 400,
                      letterSpacing: '0.02em',
                      lineHeight: 0.9,
                      whiteSpace: 'nowrap',
                      color: '#74edff',
                      textShadow: `
                        0 1px 0 #c7fbff,
                        0 2px 0 #52c8e3,
                        0 3px 0 #2f7caf,
                        0 10px 20px rgba(20, 69, 126, 0.45),
                        0 0 26px rgba(99,246,255,0.22)
                      `,
                    }}
                  >
                    {line}
                  </span>
                  <span
                    aria-hidden="true"
                    className="absolute select-none uppercase"
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
                  >
                    {line}
                  </span>
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
                    Enter a neon-lit trading arena where each team chooses a strategy track,
                    collects signals, survives volatility, and races toward the leaderboard
                    through collaborative building, rapid prototyping, and live demo battles.
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
                className="mt-6 text-[#9cc9ff] underline decoration-[#044a94] underline-offset-4 transition-colors hover:text-[#cbd6e8]"
                style={{ fontFamily: "'Space Mono', monospace", fontSize: '15px', letterSpacing: '0.08em' }}
              >
                Interest form (not registering yet)
              </button>
            )}
          </div>
        </div>

        <div className="hero-marquee mt-6 w-full max-w-[1100px] overflow-hidden border-y border-[#173154] py-3">
          <div
            className="hero-marquee__track whitespace-nowrap text-[#9cc9ff]"
            style={{ fontFamily: "'Space Mono', monospace", fontSize: '12px', letterSpacing: '1.4px' }}
          >
            {Array.from({ length: 10 }, () => 'ARCADE MARKET // BUILD MODELS // CLIMB THE LEADERBOARD // ').join('')}
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 animate-bounce">
        <div className="flex flex-col items-center gap-2">
          <ChevronDown className="text-[#044a94]" size={28} strokeWidth={3} />
          <span
            className="text-[#9A9AA8]"
            style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px', letterSpacing: '1px' }}
          >
            SCROLL
          </span>
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
          animation: 'scanline 0.5s linear infinite',
        }}
      />
    </section>
  );
}
