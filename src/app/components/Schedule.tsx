import { useState } from 'react';

type ScheduleEvent = {
  time: string;
  title: string;
  subtitle: string;
  type: 'key' | 'powerup' | 'standard';
};

type ScheduleDay = {
  label: string;
  date: string;
  sector: string;
  sectorColor: string;
  sectorGlow: string;
  events: ScheduleEvent[];
};

const days: ScheduleDay[] = [
  {
    label: 'Day 1',
    date: 'Thursday, Oct 2',
    sector: 'LAUNCH SECTOR',
    sectorColor: '#FA4616',
    sectorGlow: 'rgba(250,70,22,0.16)',
    events: [
      { time: '05:00 PM', title: 'Insert Coin Portal', subtitle: 'Registration & Check-In', type: 'standard' },
      { time: '06:00 PM', title: 'Game Boot Sequence', subtitle: 'Opening Ceremony & Keynote', type: 'key' },
      { time: '07:00 PM', title: 'Guild Formation', subtitle: 'Team Formation & Networking', type: 'standard' },
      { time: '08:00 PM', title: 'Competition Begins - System Online', subtitle: 'Official Competition Start', type: 'key' },
      { time: '09:00 PM', title: 'Power-Up: Market Data APIs', subtitle: 'Workshop on Financial Data Integration', type: 'powerup' },
      { time: '11:00 PM', title: 'Midnight Fuel Station', subtitle: 'Late Night Snacks & Drinks', type: 'standard' },
    ],
  },
  {
    label: 'Day 2',
    date: 'Friday, Oct 3',
    sector: 'VOLATILITY CORE',
    sectorColor: '#044a94',
    sectorGlow: 'rgba(4,74,148,0.18)',
    events: [
      { time: '09:00 AM', title: 'Morning Energy Boost', subtitle: 'Breakfast & Coffee', type: 'standard' },
      { time: '10:00 AM', title: 'Power-Up: ML for Trading', subtitle: 'Machine Learning Models Workshop', type: 'powerup' },
      { time: '12:00 PM', title: 'Fuel Station + Sponsor Scouting', subtitle: 'Lunch & Networking with Sponsors', type: 'standard' },
      { time: '03:00 PM', title: 'Power-Up: Risk Management Systems', subtitle: 'Portfolio & VaR Analytics Workshop', type: 'powerup' },
      { time: '06:00 PM', title: 'Dinner & Recharge', subtitle: 'Dinner Served', type: 'standard' },
      { time: '09:00 PM', title: 'Energy Boost Activated', subtitle: 'Midnight Snacks & Final Sprint', type: 'standard' },
    ],
  },
  {
    label: 'Day 3',
    date: 'Saturday, Oct 4',
    sector: 'FINAL BUILD PUSH',
    sectorColor: '#33d17a',
    sectorGlow: 'rgba(51,209,122,0.18)',
    events: [
      { time: '09:00 AM', title: 'Systems Check', subtitle: 'Breakfast, mentor rounds, and roadmap reviews', type: 'standard' },
      { time: '11:00 AM', title: 'Power-Up: Demo Engineering', subtitle: 'Sharpen your pitch, visuals, and product story', type: 'powerup' },
      { time: '01:00 PM', title: 'Final Build Sprint', subtitle: 'Feature lock, testing, and polish passes', type: 'key' },
      { time: '06:00 PM', title: 'Checkpoint Broadcast', subtitle: 'Progress reviews and sponsor walkthroughs', type: 'standard' },
      { time: '10:00 PM', title: 'Last Night Fuel', subtitle: 'Late-night snacks and final debugging', type: 'standard' },
    ],
  },
];

export function Schedule() {
  const [activeDay, setActiveDay] = useState(0);

  const getBadge = (type: ScheduleEvent['type']) => {
    if (type === 'key') return { label: 'KEY EVENT', color: '#FA4616' };
    if (type === 'powerup') return { label: 'POWER-UP', color: '#044a94' };
    return { label: 'STAGE NODE', color: '#044a94' };
  };

  const day = days[activeDay];

  return (
    <section id="schedule" className="relative overflow-hidden bg-[#0F0F1F] pb-16 pt-8 md:pb-24 md:pt-12">
      <style>{`
        .schedule-shell {
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

        .schedule-shell::before {
          content: '';
          position: absolute;
          inset: 10px;
          border: 1px solid rgba(43, 84, 133, 0.4);
          pointer-events: none;
        }

        .schedule-row + .schedule-row {
          border-top: 1px solid rgba(37, 48, 71, 0.95);
        }

        .schedule-row {
          position: relative;
        }

        .schedule-row::before {
          content: '';
          position: absolute;
          left: 2rem;
          top: 1.5rem;
          bottom: 1.5rem;
          width: 1px;
          background: linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02));
        }

        @media (max-width: 767px) {
          .schedule-row::before {
            display: none;
          }
        }
      `}</style>
      <div className="mx-auto max-w-[1320px] px-6">
        <div className="mb-12 md:mb-16">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-[#FA4616]" />
              <div className="h-2 w-2 bg-[#044a94]" />
              <div className="h-2 w-2 bg-[#044a94]" />
            </div>
            <span
              className="pixel-ribbon"
              style={{
                ['--ribbon-bg' as string]: '#ffe66e',
                ['--ribbon-text' as string]: '#8f1d00',
                ['--ribbon-border' as string]: '#171717',
                ['--ribbon-shadow' as string]: '#7a1a00',
                ['--ribbon-depth' as string]: 'rgba(250,70,22,0.18)',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '2px',
              }}
            >
              36-HOUR QUEST
            </span>
          </div>

          <h2
            className="mb-4 text-white"
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(18px, 4vw, 40px)',
              lineHeight: 1.3,
            }}
          >
            LEVEL PROGRESSION
          </h2>
          <p
            className="max-w-3xl text-[#9A9AA8]"
            style={{ fontFamily: "'Space Mono', monospace", fontSize: '15px', lineHeight: 1.6 }}
          >
            Three days. One clear schedule through launch, building, and final presentations.
          </p>
        </div>

        <div className="mb-10 flex flex-wrap justify-center gap-3 md:gap-4">
          {days.map((item, index) => (
            <button
              key={item.label}
              type="button"
              onClick={() => setActiveDay(index)}
              className={`pixel-soft-pill relative transition-all ${activeDay === index ? 'text-white' : 'hover:brightness-110'}`}
              style={{
                ['--soft-bg' as string]: activeDay === index ? item.sectorColor : '#2b3356',
                ['--soft-text' as string]: activeDay === index ? '#f7fbff' : '#d4dcf7',
                ['--soft-border' as string]: activeDay === index ? '#171717' : '#1a2140',
                ['--soft-shadow' as string]: activeDay === index ? '#171717' : '#1a2140',
                ['--soft-depth' as string]: activeDay === index ? 'rgba(0,0,0,0.18)' : 'rgba(0,0,0,0.14)',
                boxShadow: activeDay === index ? `0 0 24px ${item.sectorGlow}` : undefined,
                padding: '0.9rem 1.4rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'center',
                gap: '4px',
                minWidth: '240px',
              }}
            >
              <div
                style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: '20px',
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '12px',
                  letterSpacing: '1px',
                  lineHeight: 1,
                  opacity: 0.82,
                  whiteSpace: 'nowrap',
                }}
              >
                {item.date}
              </div>
            </button>
          ))}
        </div>

        <div
          className="schedule-shell mx-auto max-w-[980px] overflow-hidden"
          style={{
            boxShadow: `
              0 0 0 3px rgba(5, 11, 23, 0.98),
              inset 0 0 0 1px rgba(129, 194, 255, 0.06),
              0 0 30px rgba(4, 74, 148, 0.16),
              0 0 50px ${day.sectorGlow}
            `,
          }}
        >
          <div className="h-1 w-full" style={{ backgroundColor: day.sectorColor }} />

          <div className="border-b border-[#253047] px-6 py-6 md:px-8">
            <p
              style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: '10px',
                color: day.sectorColor,
                letterSpacing: '1.6px',
              }}
            >
              {day.sector}
            </p>
            <div className="mt-3 flex items-end justify-between gap-3">
              <div>
                <h3
                  className="text-white"
                  style={{
                    fontFamily: "'Rajdhani', sans-serif",
                    fontSize: 'clamp(26px, 4vw, 34px)',
                    fontWeight: 700,
                  }}
                >
                  {day.label}
                </h3>
                <p
                  className="text-[#9A9AA8]"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '12px',
                    letterSpacing: '1px',
                  }}
                >
                  {day.date}
                </p>
              </div>
              <span
                style={{
                  fontFamily: "'DS-Digital', 'Orbitron', sans-serif",
                  fontSize: '24px',
                  color: day.sectorColor,
                  letterSpacing: '2px',
                  opacity: 0.85,
                }}
              >
                D{activeDay + 1}
              </span>
            </div>
          </div>

          <div>
            {day.events.map((event) => {
              const badge = getBadge(event.type);

              return (
                <div
                  key={`${day.label}-${event.title}`}
                  className="schedule-row grid gap-4 px-6 py-6 md:grid-cols-[160px_minmax(0,1fr)] md:gap-6 md:px-8"
                >
                  <div className="relative z-10 flex items-start md:justify-start">
                    <div
                      className="inline-flex items-center rounded-none border border-[#2a3a57] bg-[#0b1220] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
                      style={{
                        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.03), 0 0 0 1px ${day.sectorGlow}`,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'DS-Digital', 'Orbitron', sans-serif",
                          fontSize: 'clamp(24px, 3vw, 30px)',
                          fontWeight: 700,
                          lineHeight: 1,
                          color: day.sectorColor,
                          letterSpacing: '1px',
                        }}
                      >
                        {event.time}
                      </span>
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="mb-3 flex flex-wrap items-center gap-3">
                      <span
                        className="inline-flex border px-2.5 py-1"
                        style={{
                          borderColor: `${badge.color}66`,
                          color: badge.color,
                          background: `${badge.color}12`,
                          fontFamily: "'Press Start 2P', monospace",
                          fontSize: '11px',
                          fontWeight: 700,
                          letterSpacing: '1px',
                        }}
                      >
                        {badge.label}
                      </span>
                      <span
                        className="hidden h-px flex-1 md:block"
                        style={{
                          background: `linear-gradient(90deg, ${day.sectorColor}35, rgba(255,255,255,0.04))`,
                        }}
                      />
                    </div>

                    <h4
                      className="text-white"
                      style={{
                        fontFamily: "'Rajdhani', sans-serif",
                        fontSize: 'clamp(24px, 3.2vw, 30px)',
                        fontWeight: 700,
                        lineHeight: 1.1,
                      }}
                    >
                      {event.title}
                    </h4>
                    <p
                      className="mt-2 text-[#9A9AA8]"
                      style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '14px',
                        lineHeight: 1.6,
                      }}
                    >
                      {event.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
