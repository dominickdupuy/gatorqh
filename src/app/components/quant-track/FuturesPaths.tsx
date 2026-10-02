import { useEffect, useRef, useState } from 'react';

type PathId = 'rising' | 'falling';

// Brief §6's worked future: 10 contracts, multiplier 100, entry $100. The price paths and
// observation hours are illustrative only; teams choose their own paths.
const CONTRACTS = 10;
const MULTIPLIER = 100;
const ENTRY = 100;
const HOURS = [0, 240, 480];
const PRICES: Record<PathId, number[]> = {
  rising: [100, 120, 125],
  falling: [100, 80, 75],
};
const STARTING_BALANCE = 50000;

const W = 600;
const H = 260;
const PAD = { left: 52, right: 30, top: 24, bottom: 36 };
const xOf = (hour: number) => PAD.left + (hour / 480) * (W - PAD.left - PAD.right);
const yOf = (price: number) => PAD.top + ((130 - price) / 60) * (H - PAD.top - PAD.bottom);

const longGain = (price: number) => CONTRACTS * MULTIPLIER * (price - ENTRY);
const money = (value: number) => `${value < 0 ? '−' : value > 0 ? '+' : ''}$${Math.abs(value).toLocaleString()}`;

export function FuturesPaths() {
  const [path, setPath] = useState<PathId>('rising');
  const [stage, setStage] = useState(0);
  const [armed, setArmed] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setArmed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!armed) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setStage(2);
      return;
    }
    setStage(0);
    const first = window.setTimeout(() => setStage(1), 900);
    const second = window.setTimeout(() => setStage(2), 2600);
    return () => {
      window.clearTimeout(first);
      window.clearTimeout(second);
    };
  }, [armed, path]);

  const prices = PRICES[path];
  const cumulative = longGain(prices[stage]);
  const stepPayment = stage === 0 ? 0 : longGain(prices[stage]) - longGain(prices[stage - 1]);
  const longWins = cumulative >= 0;
  const accent = path === 'rising' ? '#4cff87' : '#ff5a6e';

  const pathD = (id: PathId) =>
    PRICES[id].map((price, index) => `${index === 0 ? 'M' : 'L'} ${xOf(HOURS[index])} ${yOf(price)}`).join(' ');
  const areaD = (id: PathId) =>
    `${pathD(id)} L ${xOf(480)} ${yOf(ENTRY)} L ${xOf(0)} ${yOf(ENTRY)} Z`;

  return (
    <div ref={rootRef} className="fp">
      <div className="fp-toggle" role="group" aria-label="Price path">
        {(['rising', 'falling'] as PathId[]).map((id) => (
          <button
            key={id}
            type="button"
            className={`fp-toggle__btn fp-toggle__btn--${id} ${path === id ? 'fp-toggle__btn--on' : ''}`}
            onClick={() => {
              setPath(id);
              setArmed(true);
            }}
            aria-pressed={path === id}
          >
            {id === 'rising' ? '▲ RISING RUN' : '▼ FALLING RUN'}
          </button>
        ))}
        <span className="fp-toggle__note">EXAMPLE PATHS · SAME MARGIN RULE IN BOTH RUNS</span>
      </div>

      <div className="fp-grid">
        <svg viewBox={`0 0 ${W} ${H}`} className="fp-chart" role="img" aria-label={`Metal futures price, ${path} run: $${prices.join(', $')} at hours 0, 240 and 480.`}>
          <defs>
            <linearGradient id="fpArea" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={accent} stopOpacity="0.28" />
              <stop offset="100%" stopColor={accent} stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {[70, 80, 90, 100, 110, 120, 130].map((price) => (
            <g key={price}>
              <line x1={PAD.left} x2={W - PAD.right} y1={yOf(price)} y2={yOf(price)} className="fp-grid-line" />
              <text x={PAD.left - 10} y={yOf(price) + 4} textAnchor="end" className="fp-axis">
                {price}
              </text>
            </g>
          ))}
          {HOURS.map((hour) => (
            <g key={hour}>
              <line x1={xOf(hour)} x2={xOf(hour)} y1={PAD.top} y2={H - PAD.bottom} className="fp-obs-line" />
              <text x={xOf(hour)} y={H - 14} textAnchor="middle" className="fp-axis">
                {hour === 480 ? 'h480 · EXPIRY' : `h${hour}`}
              </text>
            </g>
          ))}

          <line x1={PAD.left} x2={W - PAD.right} y1={yOf(ENTRY)} y2={yOf(ENTRY)} className="fp-entry" />
          <text x={W - PAD.right} y={yOf(ENTRY) - 6} textAnchor="end" className="fp-entry-label">
            ENTRY $100
          </text>

          <path key={`area-${path}`} d={areaD(path)} fill="url(#fpArea)" className="fp-area" />
          {(['rising', 'falling'] as PathId[]).map((id) => (
            <path
              key={`${id}-${id === path ? path : 'ghost'}`}
              d={pathD(id)}
              className={`fp-line ${id === path ? 'fp-line--on' : 'fp-line--ghost'}`}
              stroke={id === 'rising' ? '#4cff87' : '#ff5a6e'}
              style={{ color: id === 'rising' ? '#4cff87' : '#ff5a6e' }}
            />
          ))}

          {HOURS.map((hour, index) => {
            const reached = index <= stage;
            return (
              <g key={`${path}-${hour}`} className={`fp-point ${reached ? 'fp-point--on' : ''}`}>
                <circle cx={xOf(hour)} cy={yOf(prices[index])} r={reached ? 6 : 4} fill={reached ? accent : '#0b1830'} stroke={accent} />
                {reached && (
                  <circle cx={xOf(hour)} cy={yOf(prices[index])} r={6} fill="none" stroke={accent} className="fp-ping" />
                )}
                <text
                  x={xOf(hour) + (index === 2 ? -10 : 10)}
                  y={yOf(prices[index]) + (path === 'rising' ? -12 : 20)}
                  textAnchor={index === 2 ? 'end' : 'start'}
                  className="fp-price"
                  style={{ opacity: reached ? 1 : 0.25 }}
                >
                  P = {prices[index]}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="fp-ledger">
          <div className="fp-parties">
            <div className={`fp-party ${!longWins && stage > 0 ? 'fp-party--up' : ''} ${longWins && stage > 0 ? 'fp-party--down' : ''}`}>
              <div className="fp-party__where" style={{ color: '#b8aa91' }}>CERES · SHORT</div>
              <div className="fp-party__bal">${(STARTING_BALANCE - cumulative).toLocaleString()}</div>
              <div className="fp-party__unit">NEODOLLARS</div>
            </div>
            <div className="fp-lane" aria-hidden="true">
              {stage > 0 &&
                Array.from({ length: 6 }, (_, index) => (
                  <span
                    key={`${path}-${stage}-${index}`}
                    className={`fp-coin ${stepPayment >= 0 ? 'fp-coin--right' : 'fp-coin--left'}`}
                    style={{ animationDelay: `${index * 90}ms` }}
                  />
                ))}
              <span className="fp-lane__label">{stage > 0
                  ? `${stepPayment >= 0 ? '' : '← '}$${Math.abs(stepPayment).toLocaleString()}${stepPayment >= 0 ? ' →' : ''}`
                  : 'NO PAYMENT'}</span>
            </div>
            <div className={`fp-party ${longWins && stage > 0 ? 'fp-party--up' : ''} ${!longWins && stage > 0 ? 'fp-party--down' : ''}`}>
              <div className="fp-party__where" style={{ color: '#ff6a3d' }}>MARS · LONG</div>
              <div className="fp-party__bal">${(STARTING_BALANCE + cumulative).toLocaleString()}</div>
              <div className="fp-party__unit">NEODOLLARS</div>
            </div>
          </div>

          <table className="fp-table">
            <thead>
              <tr>
                <th>HOUR</th>
                <th>PRICE</th>
                <th>MARK</th>
                <th>TOTAL TO LONG</th>
              </tr>
            </thead>
            <tbody>
              {HOURS.map((hour, index) => {
                const mark = index === 0 ? 0 : longGain(prices[index]) - longGain(prices[index - 1]);
                return (
                  <tr key={hour} className={index <= stage ? 'fp-row--on' : ''}>
                    <td>{hour}</td>
                    <td>{prices[index]}</td>
                    <td>{index === 0 ? '—' : money(mark)}</td>
                    <td>{money(longGain(prices[index]))}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="fp-formula">
            {CONTRACTS} × {MULTIPLIER} × ({prices[2]} − {ENTRY}) = <strong style={{ color: accent }}>{money(longGain(prices[2]))}</strong>
            <span>to the long side over the whole contract</span>
          </div>
        </div>
      </div>

      <style>{`
        .fp {
          font-family: 'Space Mono', monospace;
          border: 1px solid #1d4f83;
          background: linear-gradient(180deg, rgba(7, 13, 26, 0.96), rgba(4, 8, 18, 0.98));
          box-shadow: 0 0 0 3px rgba(5, 11, 23, 0.98), 0 0 36px rgba(4, 74, 148, 0.16);
          padding: 18px;
        }

        .fp-toggle {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
          margin-bottom: 14px;
        }

        .fp-toggle__btn {
          padding: 7px 12px;
          border: 1px solid #294f7d;
          background: #07101d;
          color: #a7b4c9;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
        }

        .fp-toggle__btn--rising.fp-toggle__btn--on {
          border-color: #4cff87;
          background: rgba(76, 255, 135, 0.14);
          color: #4cff87;
          box-shadow: 0 0 14px rgba(76, 255, 135, 0.25);
        }

        .fp-toggle__btn--falling.fp-toggle__btn--on {
          border-color: #ff5a6e;
          background: rgba(255, 90, 110, 0.14);
          color: #ff5a6e;
          box-shadow: 0 0 14px rgba(255, 90, 110, 0.25);
        }

        .fp-toggle__note {
          margin-left: auto;
          font-size: 9px;
          letter-spacing: 1.4px;
          color: #5f7390;
        }

        .fp-grid {
          display: grid;
          gap: 16px;
        }

        @media (min-width: 900px) {
          .fp-grid { grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr); align-items: center; }
        }

        .fp-chart {
          width: 100%;
          height: auto;
          overflow: visible;
        }

        .fp-grid-line { stroke: rgba(88, 140, 210, 0.12); stroke-width: 1; }
        .fp-obs-line { stroke: rgba(99, 246, 255, 0.22); stroke-dasharray: 3 5; }
        .fp-axis { fill: #5f7390; font-size: 10px; font-family: 'Space Mono', monospace; }
        .fp-entry { stroke: rgba(255, 244, 200, 0.45); stroke-dasharray: 6 5; }
        .fp-entry-label { fill: #fff4c8; font-size: 10px; font-family: 'Space Mono', monospace; font-weight: 700; }

        .fp-area {
          animation: fpFade 900ms ease both 300ms;
        }

        .fp-line {
          fill: none;
          stroke-width: 3;
          stroke-linejoin: round;
          stroke-dasharray: 700;
        }

        .fp-line--on {
          filter: drop-shadow(0 0 6px currentColor);
          animation: fpDraw 2600ms cubic-bezier(0.65, 0, 0.35, 1) both;
        }

        .fp-line--ghost {
          opacity: 0.18;
          stroke-dasharray: 4 6;
          stroke-width: 2;
        }

        @keyframes fpDraw {
          from { stroke-dashoffset: 700; }
          to { stroke-dashoffset: 0; }
        }

        @keyframes fpFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .fp-price {
          fill: #fff;
          font-size: 13px;
          font-weight: 700;
          font-family: 'Space Mono', monospace;
          transition: opacity 400ms ease;
        }

        .fp-ping {
          animation: fpPing 1.6s ease-out infinite;
          transform-box: fill-box;
          transform-origin: center;
        }

        @keyframes fpPing {
          from { transform: scale(1); opacity: 0.9; }
          to { transform: scale(3); opacity: 0; }
        }

        .fp-parties {
          display: grid;
          grid-template-columns: 1fr minmax(70px, 1fr) 1fr;
          align-items: stretch;
          gap: 8px;
          margin-bottom: 14px;
        }

        .fp-party {
          border: 1px solid #294f7d;
          background: #07101d;
          padding: 10px;
          text-align: center;
          transition: border-color 300ms ease, box-shadow 300ms ease;
        }

        .fp-party--up { border-color: #4cff87; box-shadow: 0 0 16px rgba(76, 255, 135, 0.22); }
        .fp-party--down { border-color: #ff5a6e; box-shadow: 0 0 16px rgba(255, 90, 110, 0.18); }

        .fp-party__where {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.3px;
        }

        .fp-party__bal {
          font-family: 'VT323', monospace;
          font-size: 30px;
          line-height: 1.1;
          color: #fff;
        }

        .fp-party__unit {
          font-size: 9px;
          color: #7e90ab;
          letter-spacing: 1px;
        }

        .fp-lane {
          position: relative;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding-bottom: 6px;
          border-bottom: 1px dashed rgba(255, 244, 200, 0.3);
          overflow: hidden;
        }

        .fp-lane__label {
          font-size: 10px;
          font-weight: 700;
          color: #fff4c8;
          white-space: nowrap;
        }

        .fp-coin {
          position: absolute;
          top: 38%;
          width: 8px;
          height: 8px;
          background: #ffd27a;
          box-shadow: 0 0 8px #ffb84d;
          opacity: 0;
        }

        .fp-coin--right { animation: fpCoinRight 900ms ease-in-out forwards; }
        .fp-coin--left { animation: fpCoinLeft 900ms ease-in-out forwards; }

        @keyframes fpCoinRight {
          0% { left: 0; transform: translateY(0); opacity: 0; }
          15% { opacity: 1; }
          50% { transform: translateY(-12px); }
          85% { opacity: 1; }
          100% { left: calc(100% - 8px); transform: translateY(0); opacity: 0; }
        }

        @keyframes fpCoinLeft {
          0% { left: calc(100% - 8px); transform: translateY(0); opacity: 0; }
          15% { opacity: 1; }
          50% { transform: translateY(-12px); }
          85% { opacity: 1; }
          100% { left: 0; transform: translateY(0); opacity: 0; }
        }

        .fp-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }

        .fp-table th {
          text-align: right;
          font-size: 9px;
          letter-spacing: 1.2px;
          color: #5f7390;
          padding: 0 6px 6px;
          border-bottom: 1px solid rgba(41, 79, 125, 0.7);
        }

        .fp-table td {
          text-align: right;
          padding: 6px;
          color: rgba(211, 220, 234, 0.3);
          border-bottom: 1px dashed rgba(41, 79, 125, 0.4);
          transition: color 400ms ease;
        }

        .fp-table th:first-child,
        .fp-table td:first-child { text-align: left; }

        .fp-table .fp-row--on td { color: #e8fbff; }

        .fp-formula {
          margin-top: 12px;
          font-size: 12px;
          color: #a7b4c9;
        }

        .fp-formula strong {
          font-family: 'VT323', monospace;
          font-size: 24px;
          margin-left: 4px;
        }

        .fp-formula span {
          display: block;
          font-size: 10px;
          color: #5f7390;
          letter-spacing: 0.8px;
        }
      `}</style>
    </div>
  );
}
