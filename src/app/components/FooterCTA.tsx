import { useEffect, useState } from 'react';
import { ShatterButton } from '@/components/ui/shatter-button';
import trophyImage from './trophy.png';

export function FooterCTA() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isLockingIn, setIsLockingIn] = useState(false);
  const [flashScreen, setFlashScreen] = useState(false);
  const [fuelLevel, setFuelLevel] = useState(0);

  useEffect(() => {
    const targetDate = new Date('2026-09-18T17:00:00').getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isLockingIn) return;

    setFuelLevel(0);

    const start = window.setTimeout(() => setFuelLevel(100), 60);
    const finish = window.setTimeout(() => {
      const section = document.getElementById('register');
      section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 1800);

    return () => {
      window.clearTimeout(start);
      window.clearTimeout(finish);
    };
  }, [isLockingIn]);

  const countdownUnits = [
    { label: 'DAYS', value: timeLeft.days },
    { label: 'HOURS', value: timeLeft.hours },
    { label: 'MINUTES', value: timeLeft.minutes },
    { label: 'SECONDS', value: timeLeft.seconds },
  ];

  const handlePressStart = () => {
    return;
  };

  return (
    <section id="register" className="relative overflow-hidden bg-[#050508] pb-20 pt-8 md:pb-28 md:pt-12">
      <style>{`
        @keyframes asteroidRotate {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }

        @keyframes thrustBurst {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          100% {
            transform: translateY(26px) scale(0.4);
            opacity: 0;
          }
        }

        @keyframes trophyFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        @keyframes orbPulse {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.08); }
        }
      `}</style>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(4,74,148,0.2),transparent_34%),radial-gradient(circle_at_82%_78%,rgba(250,70,22,0.08),transparent_18%),linear-gradient(180deg,rgba(8,10,18,0.12),rgba(5,5,8,0.96))]" />
        <div
          className="absolute left-1/2 top-1/2 h-[140vmax] w-[140vmax] opacity-[0.18]"
          style={{
            transform: 'translate(-50%, -50%)',
            animation: 'asteroidRotate 80s linear infinite',
            backgroundImage: `
              radial-gradient(circle at 18% 24%, rgba(156,201,255,0.35) 0 2px, transparent 2px),
              radial-gradient(circle at 68% 30%, rgba(250,70,22,0.24) 0 3px, transparent 3px),
              radial-gradient(circle at 76% 72%, rgba(156,201,255,0.25) 0 2px, transparent 2px),
              radial-gradient(circle at 38% 84%, rgba(250,70,22,0.22) 0 4px, transparent 4px),
              radial-gradient(circle at 52% 48%, rgba(156,201,255,0.15) 0 180px, transparent 180px),
              linear-gradient(rgba(76,124,188,0.22) 1px, transparent 1px),
              linear-gradient(90deg, rgba(76,124,188,0.22) 1px, transparent 1px)
            `,
            backgroundSize: 'auto, auto, auto, auto, auto, 120px 120px, 120px 120px',
          }}
        />
        <div className="absolute left-1/2 top-16 h-56 w-[42rem] -translate-x-1/2 bg-[#044a94]/12 blur-3xl" />
        <div className="absolute -bottom-12 right-[-4rem] h-72 w-72 rounded-full bg-[#003087]/20 blur-3xl" />
      </div>
      {flashScreen && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[10000] bg-[rgba(255,240,180,0.22)]"
        />
      )}

      <div className="relative z-10 mx-auto flex w-full max-w-[1440px] justify-center px-6">
        <div className="grid w-full max-w-[1200px] items-center gap-14 lg:grid-cols-[minmax(0,760px)_1fr]">
          <div className="text-center lg:text-left">
            <div className="mb-5 inline-flex items-center gap-2 border border-[#294f7d] bg-[#0b1524]/92 px-4 py-2 shadow-[0_0_18px_rgba(4,74,148,0.12)]">
              <span
                className="text-[#9cc9ff]"
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '14px',
                  fontWeight: 700,
                  letterSpacing: '1.5px',
                }}
              >
                FINAL STAGE
              </span>
            </div>

            <h2
              className="mb-5 text-white"
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(22px, 2.2vw, 28px)',
                lineHeight: 1.55,
                textShadow: '0 0 28px rgba(4, 74, 148, 0.2)',
              }}
            >
              THE ARENA OPENS SEPTEMBER 18TH
            </h2>

            <p
              className="mx-auto mb-10 max-w-2xl text-[rgba(255,255,255,0.74)] lg:mx-0"
              style={{ fontFamily: "'Space Mono', monospace", fontSize: '19px', lineHeight: 1.6 }}
            >
              36 hours. $25,000. One High Score Board.
            </p>

            <ShatterButton
              onClick={handlePressStart}
              shatterColor="#9cc9ff"
              className="group relative mb-10 w-full overflow-hidden rounded-none sm:mb-12 sm:w-full"
              style={{
                background: 'linear-gradient(180deg, #151d2a 0%, #101722 45%, #0a1119 100%)',
                border: '2px solid #294f7d',
                boxShadow: `
                  0 0 0 2px rgba(8, 14, 26, 0.95),
                  inset 0 0 0 1px rgba(156, 201, 255, 0.06),
                  inset 0 1px 0 rgba(255, 255, 255, 0.04),
                  0 0 24px rgba(4, 74, 148, 0.14),
                  0 16px 32px rgba(0, 0, 0, 0.42)
                `,
                padding: '1.1rem 1.5rem',
                transition: 'transform 180ms ease, box-shadow 180ms ease',
                clipPath: 'polygon(4% 0, 96% 0, 100% 18%, 100% 82%, 96% 100%, 4% 100%, 0 82%, 0 18%)',
              }}
            >
              <div
                className="relative z-10 flex flex-col items-center justify-center gap-3"
                style={{
                  transition: 'transform 180ms ease',
                }}
              >
                <span
                  style={{
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: 'clamp(16px, 2.1vw, 24px)',
                    fontWeight: 700,
                    letterSpacing: '2px',
                    color: '#eef4ff',
                    textShadow: `
                      0 0 14px rgba(156, 201, 255, 0.12)
                    `,
                  }}
                >
                  {isLockingIn ? 'COIN ACCEPTED -' : 'PRESS START'}
                </span>
                <span
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 'clamp(10px, 1vw, 12px)',
                    fontWeight: 700,
                    letterSpacing: '1.4px',
                    color: isLockingIn ? '#ffb08a' : '#9cc9ff',
                    textTransform: 'uppercase',
                  }}
                >
                  {isLockingIn ? 'LOCKING IN YOUR SHIP...' : 'INSERT COIN TO ENTER THE ARENA'}
                </span>
                {isLockingIn && (
                  <div className="mt-1 w-full max-w-[520px] border-[3px] border-[#8fb6ff] bg-[#0d1b44] p-1 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)]">
                    <div
                      style={{
                        width: `${fuelLevel}%`,
                        height: '18px',
                        background:
                          'linear-gradient(90deg, #FA4616 0%, #9cc9ff 38%, #4f7dff 100%)',
                        boxShadow: '0 0 16px rgba(79, 125, 255, 0.38)',
                        transition: 'width 1.5s ease-out',
                      }}
                    />
                  </div>
                )}
              </div>
            </ShatterButton>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {countdownUnits.map((unit) => (
                <div
                  key={unit.label}
                  className="border border-[#2A2A3E] bg-[#0B0D14]/92 px-4 py-5 shadow-[0_0_20px_rgba(4,74,148,0.1),inset_0_1px_0_rgba(255,255,255,0.03)]"
                >
                  <div
                    className="mb-2 text-[#ff6231]"
                    style={{
                      fontFamily: "'DS-Digital', 'Orbitron', sans-serif",
                      fontSize: 'clamp(54px, 6vw, 78px)',
                      fontWeight: 700,
                      lineHeight: 0.8,
                      letterSpacing: '2px',
                      textShadow: `
                        0 0 10px rgba(250, 70, 22, 0.35),
                        0 0 24px rgba(250, 70, 22, 0.16)
                      `,
                    }}
                  >
                    {String(unit.value).padStart(2, '0')}
                  </div>
                  <div
                    className="text-[rgba(255,255,255,0.6)]"
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '12px',
                      fontWeight: 700,
                      letterSpacing: '1.8px',
                    }}
                  >
                    {unit.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center lg:justify-end lg:self-end">
            <div className="relative w-full max-w-[360px]">
              <div className="overflow-hidden border border-[#183046] bg-[#070A11]/95 shadow-[0_0_24px_rgba(4,74,148,0.14),inset_0_0_0_1px_rgba(255,255,255,0.02)]">
                <div className="relative flex min-h-[462px] flex-col p-5">
                  <div className="flex justify-center border-b border-[#173154] pb-4">
                    <div
                      className="inline-flex border border-[#1d3353] bg-[#0a1220]/90 px-4 py-2 text-[#9cc9ff]"
                      style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '11px',
                        letterSpacing: '1.4px',
                      }}
                    >
                      HIGH SCORE RELIC
                    </div>
                  </div>

                  <div className="relative my-5 flex min-h-[240px] items-center justify-center overflow-hidden border border-[#11233b] bg-[linear-gradient(180deg,rgba(8,14,24,0.92),rgba(7,11,18,0.98))] px-4 py-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]">
                    <div className="pointer-events-none absolute inset-x-4 top-4 h-px bg-gradient-to-r from-transparent via-[#1f67be]/60 to-transparent" />
                    <div className="pointer-events-none absolute inset-x-6 bottom-5 h-px bg-gradient-to-r from-transparent via-[#1f67be]/35 to-transparent" />
                    <div className="absolute h-52 w-52 rounded-full bg-[#044a94]/14 blur-3xl" />
                    <div
                      className="absolute h-[150px] w-[150px] rounded-full border border-[#9cc9ff]/30"
                      style={{ animation: 'orbPulse 2.8s ease-in-out infinite' }}
                    />
                    <div
                      className="relative flex h-[220px] w-[220px] items-center justify-center"
                      style={{ animation: 'trophyFloat 3.4s ease-in-out infinite' }}
                    >
                      <img
                        src={trophyImage}
                        alt=""
                        className="h-[218px] w-[218px] translate-x-[14px] object-contain"
                        draggable="false"
                      />
                    </div>
                  </div>

                  <div className="mt-auto border-t border-[#1d3353] pt-4">
                    <div
                      className="mb-2 text-[#eef4ff]"
                      style={{
                        fontFamily: "'Orbitron', sans-serif",
                        fontSize: '13px',
                        fontWeight: 700,
                        letterSpacing: '1.1px',
                        lineHeight: 1.4,
                      }}
                    >
                      TREASURE VAULT ONLINE
                    </div>
                    <div
                      className="text-[rgba(255,255,255,0.55)]"
                      style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '10.5px',
                        letterSpacing: '0.8px',
                        lineHeight: 1.75,
                      }}
                    >
                      CHAMPION CLASS REWARD | LOCK IN YOUR SHIP AND CHASE THE HIGH
                      SCORE
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -left-1 -top-1 h-10 w-10 border-l-4 border-t-4 border-[#044a94]" />
              <div className="absolute -right-1 -top-1 h-10 w-10 border-r-4 border-t-4 border-[#044a94]" />
              <div className="absolute -bottom-1 -left-1 h-10 w-10 border-b-4 border-l-4 border-[#044a94]" />
              <div className="absolute -bottom-1 -right-1 h-10 w-10 border-b-4 border-r-4 border-[#044a94]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
