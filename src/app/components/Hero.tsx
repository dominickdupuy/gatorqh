import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

const titleLines = ['GATOR', 'QUANT', 'HACKATHON'];
const featureTags = ['Signal stars', 'Rocket trajectories', 'Asteroid risk'];

type Star = {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  color: string;
};

export function Hero() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [scrollY, setScrollY] = useState(0);

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
      for (let i = 0; i < 180; i += 1) {
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
        <div className="mb-8 flex w-full max-w-[980px] flex-wrap items-center justify-between gap-4">
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
                letterSpacing: '1.6px',
              }}
            >
              PLAYER 1
            </span>
            <span
              className="text-[#9cc9ff]"
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '10px',
                letterSpacing: '1.6px',
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
                letterSpacing: '1.6px',
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
              padding: '48px',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <div
              className="pixel-badge pixel-pill mb-8 inline-flex items-center gap-3"
              style={{
                ['--pill-bg' as string]: '#6f88ff',
                ['--pill-text' as string]: '#f2f5ff',
                ['--pill-border' as string]: '#1a255a',
                ['--pill-shadow' as string]: '#1a255a',
                ['--pill-depth' as string]: 'rgba(4,74,148,0.22)',
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '10px',
                padding: '8px 16px',
                letterSpacing: '2px',
                imageRendering: 'pixelated',
              }}
            >
              <span
                style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '10px', color: '#f2f5ff', letterSpacing: '2px' }}
              >
                PLAYER 1 // SPACE MARKET
              </span>
            </div>

            <div className="mb-10 w-full max-w-[1320px]">
              {titleLines.map((line, index) => {
                const isBottomLine = index === titleLines.length - 1;
                const titleSize = isBottomLine ? 'clamp(49px, 8vw, 114px)' : 'clamp(47px, 7vw, 106px)';

                return (
                <div
                  key={line}
                  className={`relative mx-auto flex justify-center ${isBottomLine ? '' : 'mb-2 md:mb-3'}`}
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
                        transform: `translate(0px, ${offset}px)`,
                        color: layerIndex === 0 ? '#244a7a' : layerIndex === 1 ? '#1b3d68' : '#122d4d',
                        textShadow: 'none',
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
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: 'clamp(24px, 3vw, 40px)',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textShadow: '0 0 24px rgba(4,74,148,0.28)',
              }}
            >
              Build the Model. Beat the Market.
            </p>

            <div className="mx-auto mb-8 w-full max-w-[760px] border border-[#294252] bg-[#0a1118]/70 p-4 md:p-5 shadow-[0_0_24px_rgba(99,246,255,0.06)] backdrop-blur-sm">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-[#173154] pb-3">
                <span
                  className="text-[#9cc9ff]"
                  style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: 700, letterSpacing: '1.8px' }}
                >
                  MISSION BRIEFING
                </span>
                <span
                  className="text-[#9A9AA8]"
                  style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: 700, letterSpacing: '1.2px' }}
                >
                  QUANT ARCADE WORLD // HIGH SCORE RUN
                </span>
              </div>
              <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
                <p
                  className="text-left text-[#dce9ff]"
                  style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', lineHeight: 1.8 }}
                >
                  Enter a neon-lit trading arena where each team chooses a strategy track, collects signals, survives volatility, and races toward the leaderboard through collaborative building, rapid prototyping, and live demo battles.
                </p>
                <div className="grid gap-2 text-left">
                  {[
                    'TRACKS = GAME MODES',
                    'WORKSHOPS = POWER-UPS',
                    'JUDGING = FINAL BOSS',
                  ].map((item) => (
                    <div
                      key={item}
                      className="border border-[#173154] bg-[#0a1626] px-3 py-2 text-[#9cc9ff]"
                      style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '0.7px' }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
              {featureTags.map((item) => (
                <div
                  key={item}
                  className="border border-[#044a94]/70 bg-[#06101d]/80 px-4 py-2.5 text-[#dce9ff] shadow-[0_0_16px_rgba(4,74,148,0.12)]"
                  style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', lineHeight: 1.4 }}
                >
                  {item}
                </div>
              ))}
            </div>

            <p
              className="mb-10 text-[#cbd6e8]"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '14px',
                lineHeight: 1.8,
              }}
            >
              Sep 25-27 // Reitz Union, Gainesville // $50,000 Treasure Vault // 48 Hours
            </p>

            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <button
                className="pixel-btn group relative overflow-hidden"
                style={{
                  background: '#FA4616',
                  border: 'none',
                  outline: '4px solid #c43010',
                  boxShadow: '4px 4px 0px #7a1a00, 6px 6px 0px #000',
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: '11px',
                  color: 'white',
                  padding: '14px 28px',
                  letterSpacing: '1px',
                  cursor: 'pointer',
                  imageRendering: 'pixelated',
                  transition: 'none',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '11px', letterSpacing: '1px' }}>
                  INSERT COIN -&gt; Register Now
                </span>
              </button>

              <button
                className="pixel-btn group"
                style={{
                  background: '#0A0A0A',
                  border: 'none',
                  outline: '4px solid #044a94',
                  boxShadow: '4px 4px 0px #052b5e, 6px 6px 0px #000',
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: '11px',
                  color: '#9cc9ff',
                  padding: '14px 28px',
                  letterSpacing: '1px',
                  cursor: 'pointer',
                  imageRendering: 'pixelated',
                  transition: 'none',
                }}
              >
                <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '11px', letterSpacing: '1px' }}>
                  Become a Power Sponsor
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="hero-marquee mt-10 w-full max-w-[1100px] overflow-hidden border-y border-[#173154] py-3">
          <div
            className="hero-marquee__track whitespace-nowrap text-[#9cc9ff]"
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '1.4px' }}
          >
            {Array.from({ length: 10 }, () => 'ARCADE MARKET // BUILD MODELS // CLIMB THE LEADERBOARD // ').join('')}
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 animate-bounce">
        <div className="flex flex-col items-center gap-2">
          <ChevronDown className="text-[#044a94]" size={28} strokeWidth={3} />
          <span
            className="text-[#9A9AA8]"
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', letterSpacing: '1px' }}
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
