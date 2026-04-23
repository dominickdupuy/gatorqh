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
    <section className="relative overflow-hidden border-y border-[#14345c] bg-[#060b12] py-4 md:py-5">
      <style>{`
        .status-board::before {
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

        .status-board::after {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: repeating-linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.03) 0,
            rgba(255, 255, 255, 0.03) 1px,
            transparent 1px,
            transparent 4px
          );
          opacity: 0.22;
        }

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

        .status-title-pixels-left,
        .status-title-pixels-right {
          position: absolute;
          top: 50%;
          display: grid;
          grid-template-columns: repeat(3, 6px);
          gap: 3px;
          transform: translateY(-50%);
        }

        .status-title-pixels-left {
          right: calc(100% + 8px);
        }

        .status-title-pixels-right {
          left: calc(100% + 8px);
        }

        .status-title-pixels-left span,
        .status-title-pixels-right span {
          width: 6px;
          height: 6px;
          background: #257bff;
          box-shadow: 0 0 10px rgba(37, 123, 255, 0.5);
        }

        .status-card {
          position: relative;
          height: 142px;
          background:
            linear-gradient(180deg, rgba(6, 11, 20, 0.98), rgba(4, 8, 15, 0.98)),
            radial-gradient(circle at top, var(--card-glow), transparent 50%);
          box-shadow:
            inset 0 0 0 1px rgba(255,255,255,0.03),
            0 0 22px var(--card-shadow);
        }

        .status-card::before {
          content: '';
          position: absolute;
          inset: 12px;
          border: 1px solid var(--card-outline);
          pointer-events: none;
        }

        .status-card::after {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image:
            linear-gradient(rgba(18, 46, 88, 0.14) 1px, transparent 1px),
            linear-gradient(90deg, rgba(18, 46, 88, 0.14) 1px, transparent 1px);
          background-size: 18px 18px;
          opacity: 0.35;
        }

        .status-corner {
          position: absolute;
          width: 18px;
          height: 18px;
          border-color: var(--card-accent);
          filter: drop-shadow(0 0 8px var(--card-accent));
        }

        .status-corner--tl { top: 6px; left: 6px; border-top: 4px solid; border-left: 4px solid; }
        .status-corner--tr { top: 6px; right: 6px; border-top: 4px solid; border-right: 4px solid; }
        .status-corner--bl { bottom: 6px; left: 6px; border-bottom: 4px solid; border-left: 4px solid; }
        .status-corner--br { bottom: 6px; right: 6px; border-bottom: 4px solid; border-right: 4px solid; }

      `}</style>

      <div className="status-board absolute inset-0 pointer-events-none" />
      <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-transparent via-[#164883] to-transparent opacity-70" />
      <div className="pointer-events-none absolute left-0 right-0 top-[32px] h-px bg-gradient-to-r from-transparent via-[#164883] to-transparent opacity-60" />
      <div className="pointer-events-none absolute bottom-[12px] left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#164883] to-transparent opacity-60" />

      <div className="relative z-10 mx-auto max-w-[1140px] px-4 md:px-6">
        <div className="mb-2 flex justify-center md:mb-3">
          <div
            className="status-title status-title-shell relative border-[2px] border-[#2459a3] bg-[linear-gradient(180deg,#2c5cab_0%,#234b90_52%,#18386f_100%)] px-5 py-2 shadow-[0_0_0_2px_#07111f,0_8px_24px_rgba(7,17,31,0.45),0_0_26px_rgba(37,123,255,0.14)] md:px-9"
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
              className="status-card overflow-hidden border-[3px] px-3 py-2.5 md:px-4 md:py-3"
              style={
                {
                  borderColor: stat.color,
                  '--card-accent': stat.color,
                  '--card-outline': `${stat.color}66`,
                  '--card-glow': `${stat.color}12`,
                  '--card-shadow': `${stat.color}26`,
                } as React.CSSProperties
              }
            >
              <span className="status-corner status-corner--tl" />
              <span className="status-corner status-corner--tr" />
              <span className="status-corner status-corner--bl" />
              <span className="status-corner status-corner--br" />

              <div className="relative z-10 flex h-full flex-col items-center justify-center text-center">
                <div
                  className="mb-3"
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

                <div className="mb-3 h-px w-full bg-[linear-gradient(90deg,transparent,var(--card-accent),transparent)] opacity-70" />

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
