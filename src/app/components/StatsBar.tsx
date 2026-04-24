type StatCard = {
  label: string;
  value: string;
  color: string;
};

const stats: StatCard[] = [
  {
    label: 'TREASURE VAULT',
    value: '$25,000',
    color: '#FA5A2A',
  },
  {
    label: 'DURATION',
    value: '36 HOURS',
    color: '#3AE36C',
  },
  {
    label: 'SPONSORS',
    value: '12+',
    color: '#2E86FF',
  },
];

export function StatsBar() {
  return (
    <section className="relative overflow-hidden border-y border-[#14345c] bg-[#050913] py-5 md:py-6">
      <style>{`
        .status-title {
          clip-path: polygon(3% 0, 97% 0, 100% 18%, 100% 82%, 97% 100%, 3% 100%, 0 82%, 0 18%);
          overflow: hidden;
        }

        .status-title-shell::after {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            linear-gradient(180deg, rgba(255,255,255,0.16), transparent 34%),
            linear-gradient(90deg, transparent, rgba(118, 194, 255, 0.08), transparent);
        }

        .stats-shell::before {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.18;
          background-image:
            linear-gradient(rgba(25, 74, 140, 0.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(25, 74, 140, 0.12) 1px, transparent 1px);
          background-size: 22px 22px;
        }

        .stats-shell::after {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            linear-gradient(180deg, rgba(18, 42, 78, 0.12), transparent 18%, transparent 82%, rgba(18, 42, 78, 0.14)),
            repeating-linear-gradient(
              180deg,
              rgba(255, 255, 255, 0.03) 0,
              rgba(255, 255, 255, 0.03) 1px,
              transparent 1px,
              transparent 4px
            );
          opacity: 0.2;
        }

        .stats-card {
          position: relative;
          min-height: 112px;
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
        }

        .stats-card::before,
        .stats-card::after {
          content: '';
          position: absolute;
          inset: 6px;
          pointer-events: none;
        }

        .stats-card::before {
          border: 2px solid var(--track-outline);
          opacity: 0.85;
        }

        .stats-card::after {
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

        .stats-card__corners {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
        }

        .stats-card__corner {
          position: absolute;
          width: 24px;
          height: 24px;
          opacity: 0.98;
          filter: drop-shadow(0 0 8px var(--track-accent));
        }

        .stats-card__corner::before,
        .stats-card__corner::after {
          content: '';
          position: absolute;
          background: var(--track-accent);
          box-shadow: 0 0 8px var(--track-accent);
        }

        .stats-card__corner--tl {
          top: -2px;
          left: -2px;
        }

        .stats-card__corner--tr {
          top: -2px;
          right: -2px;
        }

        .stats-card__corner--bl {
          bottom: -2px;
          left: -2px;
        }

        .stats-card__corner--br {
          bottom: -2px;
          right: -2px;
        }

        .stats-card__corner--tl::before,
        .stats-card__corner--tr::before,
        .stats-card__corner--bl::before,
        .stats-card__corner--br::before {
          top: 0;
          width: 20px;
          height: 3px;
        }

        .stats-card__corner--tl::after,
        .stats-card__corner--tr::after,
        .stats-card__corner--bl::after,
        .stats-card__corner--br::after {
          left: 0;
          width: 3px;
          height: 20px;
        }

        .stats-card__corner--tl::before {
          left: 0;
        }

        .stats-card__corner--tl::after {
          top: 0;
        }

        .stats-card__corner--tr::before {
          right: 0;
        }

        .stats-card__corner--tr::after {
          top: 0;
          left: auto;
          right: 0;
        }

        .stats-card__corner--bl::before {
          bottom: 0;
          top: auto;
          left: 0;
        }

        .stats-card__corner--bl::after {
          bottom: 0;
          top: auto;
        }

        .stats-card__corner--br::before {
          bottom: 0;
          top: auto;
          right: 0;
        }

        .stats-card__corner--br::after {
          bottom: 0;
          top: auto;
          left: auto;
          right: 0;
        }

        .stats-card__corner-step {
          position: absolute;
          width: 10px;
          height: 10px;
          border-color: var(--track-accent);
          opacity: 0.98;
          filter: drop-shadow(0 0 6px var(--track-accent));
        }

        .stats-card__corner-step--tl {
          top: 3px;
          left: 3px;
          border-top: 3px solid var(--track-accent);
          border-left: 3px solid var(--track-accent);
        }

        .stats-card__corner-step--tr {
          top: 3px;
          right: 3px;
          border-top: 3px solid var(--track-accent);
          border-right: 3px solid var(--track-accent);
        }

        .stats-card__corner-step--bl {
          bottom: 3px;
          left: 3px;
          border-bottom: 3px solid var(--track-accent);
          border-left: 3px solid var(--track-accent);
        }

        .stats-card__corner-step--br {
          bottom: 3px;
          right: 3px;
          border-bottom: 3px solid var(--track-accent);
          border-right: 3px solid var(--track-accent);
        }
      `}</style>

      <div className="stats-shell absolute inset-0 pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-[1140px] px-4 md:px-6">
        <div className="mb-3 flex items-center justify-center gap-4 md:mb-4">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#2c6dac]" />
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-[#FA4616]" />
            <div className="h-2 w-2 bg-[#63f6ff]" />
            <div className="h-2 w-2 bg-[#33d17a]" />
          </div>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#2c6dac]" />
        </div>

        <div className="mb-3 flex justify-center md:mb-4">
          <div
            className="status-title status-title-shell relative border-[2px] border-[#2459a3] bg-[linear-gradient(180deg,#264f95_0%,#1d407b_52%,#15315f_100%)] px-5 py-2 shadow-[0_0_0_2px_#07111f,0_8px_24px_rgba(7,17,31,0.4),0_0_22px_rgba(37,123,255,0.12)] md:px-9"
          >
            <span
              className="block text-center text-[#eef4ff]"
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 'clamp(9px, 0.9vw, 13px)',
                letterSpacing: '1px',
                lineHeight: 1,
                textShadow: '0 0 14px rgba(255,255,255,0.1)',
              }}
            >
              ARCADE STATUS BOARD
            </span>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          {stats.map((stat) => (
            <article
              key={stat.label}
              className="stats-card overflow-hidden px-2.5 py-2 md:px-3 md:py-2.5"
              style={
                {
                  '--track-accent': stat.color,
                  '--track-glow': `${stat.color}14`,
                  '--track-outline': `${stat.color}66`,
                  '--track-shadow': `${stat.color}33`,
                } as React.CSSProperties
              }
            >
              <div className="stats-card__corners">
                <span className="stats-card__corner stats-card__corner--tl" />
                <span className="stats-card__corner stats-card__corner--tr" />
                <span className="stats-card__corner stats-card__corner--bl" />
                <span className="stats-card__corner stats-card__corner--br" />
                <span className="stats-card__corner-step stats-card__corner-step--tl" />
                <span className="stats-card__corner-step stats-card__corner-step--tr" />
                <span className="stats-card__corner-step stats-card__corner-step--bl" />
                <span className="stats-card__corner-step stats-card__corner-step--br" />
              </div>

              <div className="relative z-10 flex h-full flex-col items-center justify-center text-center">
                <div
                  className="mb-2"
                  style={{
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: 'clamp(17px, 1.9vw, 28px)',
                    lineHeight: 1,
                    color: stat.color,
                    textShadow: `0 0 18px ${stat.color}35`,
                  }}
                >
                  {stat.value}
                </div>

                <div
                  className="text-[#b8c0cf]"
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 'clamp(10px, 0.8vw, 13px)',
                    fontWeight: 700,
                    letterSpacing: '1.3px',
                    lineHeight: 1.1,
                  }}
                >
                  {stat.label}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
