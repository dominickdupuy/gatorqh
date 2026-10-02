import { useState, type ChangeEvent } from 'react';

// A rough capacity model. Each day the strategy trades AUM × turnover / 252,
// spread across its names. Every trade pays a half-spread plus fees, plus a
// market-impact cost from the square-root impact law:
//   impact ≈ Y · σ_daily · √(trade size / ADV), with Y ≈ 1.
// The yearly cost drag, divided by strategy volatility, comes straight off the
// Sharpe ratio. Capacity is the AUM where net Sharpe reaches zero.

type Inputs = {
  aumExp: number; // log10 of AUM in dollars
  names: number;
  advExp: number; // log10 of average daily dollar volume per name
  turnover: number; // one-way, multiples of capital per year
  sharpe: number; // gross, before costs
  vol: number; // strategy volatility, percent per year
  cost: number; // half-spread + fees, bps per trade
  dailyVol: number; // daily volatility of the names, percent
};

const PRESETS: { label: string; values: Inputs }[] = [
  { label: 'SMALL-CAP STOCKS', values: { aumExp: 7, names: 100, advExp: 6.7, turnover: 20, sharpe: 1.5, vol: 10, cost: 15, dailyVol: 3.5 } },
  { label: 'LARGE-CAP ETFS', values: { aumExp: 7, names: 5, advExp: 9.7, turnover: 12, sharpe: 1, vol: 10, cost: 1, dailyVol: 1.2 } },
  { label: 'FAST INTRADAY', values: { aumExp: 6, names: 20, advExp: 8.3, turnover: 100, sharpe: 2.5, vol: 10, cost: 2, dailyVol: 2 } },
];

const AUM_MIN = 4;
const AUM_MAX = 9;
const CHART_MIN = 4;
const CHART_MAX = 12;

const money = (value: number) => {
  if (!Number.isFinite(value)) return '∞';
  const units: [number, string][] = [
    [1e12, 'T'],
    [1e9, 'B'],
    [1e6, 'M'],
    [1e3, 'K'],
  ];
  for (const [size, suffix] of units) {
    if (value >= size) {
      const scaled = value / size;
      return `$${scaled >= 100 ? scaled.toFixed(0) : scaled >= 10 ? scaled.toFixed(1) : scaled.toFixed(2)}${suffix}`;
    }
  }
  return `$${value.toFixed(0)}`;
};

const model = (inputs: Inputs, aum: number) => {
  const adv = 10 ** inputs.advExp;
  const dailyTrade = (aum * inputs.turnover) / (252 * inputs.names);
  const participation = dailyTrade / adv;
  const impactBps = (inputs.dailyVol / 100) * Math.sqrt(participation) * 1e4;
  const totalBps = inputs.cost + impactBps;
  const drag = (inputs.turnover * totalBps) / 1e4;
  const net = inputs.sharpe - drag / (inputs.vol / 100);
  return { dailyTrade, participation, impactBps, totalBps, drag, net };
};

// Solve net Sharpe = target for AUM in closed form.
const aumForNet = (inputs: Inputs, target: number) => {
  const allowedDrag = (inputs.sharpe - target) * (inputs.vol / 100);
  const allowedImpactBps = (allowedDrag * 1e4) / inputs.turnover - inputs.cost;
  if (allowedImpactBps <= 0) return 0;
  const k = (inputs.dailyVol / 100) * 1e4 * Math.sqrt(inputs.turnover / (252 * inputs.names * 10 ** inputs.advExp));
  return (allowedImpactBps / k) ** 2;
};

const PARTICIPATION_TIERS = [
  { max: 0.01, label: 'UNDER 1% OF ADV', note: 'Small next to the market. Impact is minor.', tone: 'green' },
  { max: 0.05, label: '1–5% OF ADV', note: 'Noticeable. Spread trades over the day.', tone: 'amber' },
  { max: 0.1, label: '5–10% OF ADV', note: 'Heavy. Your own orders move the price.', tone: 'orange' },
  { max: Infinity, label: 'OVER 10% OF ADV', note: 'You are a big part of the market in these names.', tone: 'red' },
] as const;

const W = 640;
const H = 250;
const PAD = { left: 42, right: 14, top: 18, bottom: 30 };

export function CapacityDial() {
  const [inputs, setInputs] = useState<Inputs>(PRESETS[0].values);
  const aum = 10 ** inputs.aumExp;
  const now = model(inputs, aum);
  const capacity = aumForNet(inputs, 0);
  const half = aumForNet(inputs, inputs.sharpe / 2);
  const tier = PARTICIPATION_TIERS.find((t) => now.participation < t.max)!;

  const set = (key: keyof Inputs) => (event: ChangeEvent<HTMLInputElement>) =>
    setInputs((current) => ({ ...current, [key]: Number(event.target.value) }));

  const yMax = Math.max(0.5, inputs.sharpe) * 1.1;
  const yMin = -Math.max(0.5, inputs.sharpe) * 0.6;
  const xOf = (exp: number) => PAD.left + ((exp - CHART_MIN) / (CHART_MAX - CHART_MIN)) * (W - PAD.left - PAD.right);
  const yOf = (value: number) => PAD.top + ((yMax - Math.max(yMin, Math.min(yMax, value))) / (yMax - yMin)) * (H - PAD.top - PAD.bottom);

  const samples = Array.from({ length: 141 }, (_, index) => CHART_MIN + (index / 140) * (CHART_MAX - CHART_MIN));
  const curve = samples.map((exp, index) => `${index ? 'L' : 'M'} ${xOf(exp).toFixed(1)} ${yOf(model(inputs, 10 ** exp).net).toFixed(1)}`).join(' ');
  const positive = samples.filter((exp) => model(inputs, 10 ** exp).net > 0);
  const area =
    positive.length > 1
      ? `M ${xOf(positive[0]).toFixed(1)} ${yOf(0)} ${positive.map((exp) => `L ${xOf(exp).toFixed(1)} ${yOf(model(inputs, 10 ** exp).net).toFixed(1)}`).join(' ')} L ${xOf(positive[positive.length - 1]).toFixed(1)} ${yOf(0)} Z`
      : '';

  const marker = (value: number, label: string, cls: string, row: number) => {
    if (value <= 0) return null;
    const exp = Math.log10(value);
    if (exp < CHART_MIN || exp > CHART_MAX) return null;
    const x = xOf(exp);
    return (
      <g className={cls}>
        <line x1={x} x2={x} y1={PAD.top} y2={H - PAD.bottom} />
        <text x={x + (x > W - 140 ? -5 : 5)} y={H - PAD.bottom - 8 - row * 12} textAnchor={x > W - 140 ? 'end' : 'start'}>
          {label}
        </text>
      </g>
    );
  };

  const sliders: { key: keyof Inputs; label: string; min: number; max: number; step: number; format: (value: number) => string }[] = [
    { key: 'aumExp', label: 'STRATEGY AUM', min: AUM_MIN, max: AUM_MAX, step: 0.05, format: (value) => money(10 ** value) },
    { key: 'names', label: 'NAMES TRADED', min: 1, max: 500, step: 1, format: (value) => `${value}` },
    { key: 'advExp', label: 'AVG DAILY $ VOLUME / NAME', min: 6, max: 10, step: 0.05, format: (value) => money(10 ** value) },
    { key: 'turnover', label: 'TURNOVER', min: 1, max: 100, step: 1, format: (value) => `${value}× / YR` },
    { key: 'sharpe', label: 'GROSS SHARPE (BEFORE COSTS)', min: 0.5, max: 3, step: 0.05, format: (value) => value.toFixed(2) },
    { key: 'vol', label: 'STRATEGY VOLATILITY', min: 5, max: 25, step: 1, format: (value) => `${value}%` },
    { key: 'cost', label: 'HALF-SPREAD + FEES', min: 0.5, max: 20, step: 0.5, format: (value) => `${value.toFixed(1)} BPS` },
    { key: 'dailyVol', label: 'DAILY VOL OF THE NAMES', min: 1, max: 5, step: 0.1, format: (value) => `${value.toFixed(1)}%` },
  ];

  const ticks = [4, 5, 6, 7, 8, 9, 10, 11, 12];

  return (
    <div className="cd">
      <div className="cd-top">
        <span>CAPACITY DIAL · HOW BIG BEFORE THE EDGE IS GONE</span>
        <em>SQUARE-ROOT IMPACT LAW · ROUGH MODEL</em>
      </div>

      <div className="cd-presets" role="group" aria-label="Example markets">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            className={`cd-preset ${JSON.stringify(preset.values) === JSON.stringify(inputs) ? 'cd-preset--on' : ''}`}
            onClick={() => setInputs(preset.values)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="cd-grid">
        <div className="cd-sliders">
          {sliders.map((slider) => (
            <label key={slider.key} className={`cd-slider ${slider.key === 'aumExp' ? 'cd-slider--aum' : ''}`}>
              <span>
                {slider.label}
                <b>{slider.format(inputs[slider.key])}</b>
              </span>
              <input
                type="range"
                min={slider.min}
                max={slider.max}
                step={slider.step}
                value={inputs[slider.key]}
                onChange={set(slider.key)}
                style={{ ['--fill' as string]: `${((inputs[slider.key] - slider.min) / (slider.max - slider.min)) * 100}%` }}
              />
            </label>
          ))}
        </div>

        <div className="cd-main">
          <svg viewBox={`0 0 ${W} ${H}`} className="cd-chart" role="img" aria-label={`Net Sharpe against AUM. At ${money(aum)}, net Sharpe is ${now.net.toFixed(2)}. Capacity is about ${money(capacity)}.`}>
            {ticks.map((exp) => (
              <g key={exp}>
                <line x1={xOf(exp)} x2={xOf(exp)} y1={PAD.top} y2={H - PAD.bottom} className="cd-grid-line" />
                <text x={xOf(exp)} y={H - 12} textAnchor={exp === ticks[ticks.length - 1] ? 'end' : exp === ticks[0] ? 'start' : 'middle'} className="cd-axis">
                  {money(10 ** exp)}
                </text>
              </g>
            ))}
            {[yMax / 1.1, 0, yMin].map((value) => (
              <text key={value} x={PAD.left - 6} y={yOf(value) + 3} textAnchor="end" className="cd-axis">
                {value.toFixed(1)}
              </text>
            ))}
            <line x1={PAD.left} x2={W - PAD.right} y1={yOf(0)} y2={yOf(0)} className="cd-zero" />
            <line x1={PAD.left} x2={W - PAD.right} y1={yOf(inputs.sharpe)} y2={yOf(inputs.sharpe)} className="cd-gross" />
            <text x={PAD.left + 4} y={yOf(inputs.sharpe) - 5} textAnchor="start" className="cd-gross-label">
              GROSS SHARPE {inputs.sharpe.toFixed(2)}
            </text>
            <rect x={xOf(AUM_MAX)} y={PAD.top} width={W - PAD.right - xOf(AUM_MAX)} height={H - PAD.top - PAD.bottom} className="cd-beyond" />
            {area && <path d={area} className="cd-area" />}
            <path d={curve} className="cd-curve" />
            {marker(half, 'EDGE HALF GONE', 'cd-mark cd-mark--half', 0)}
            {marker(capacity, 'CAPACITY', 'cd-mark cd-mark--cap', 1)}
            <g className="cd-now">
              <line x1={xOf(inputs.aumExp)} x2={xOf(inputs.aumExp)} y1={PAD.top} y2={H - PAD.bottom} />
              <circle cx={xOf(inputs.aumExp)} cy={yOf(now.net)} r={5} />
            </g>
          </svg>

          <div className="cd-readouts">
            <div className="cd-big">
              <span>CAPACITY ≈</span>
              <strong>{capacity <= 0 ? '$0' : money(capacity)}</strong>
              <em>{capacity <= 0 ? 'Fees and spread alone eat the edge at any size.' : `Edge half gone near ${money(half)}`}</em>
            </div>
            <dl className="cd-stats">
              <div>
                <dt>NET SHARPE @ {money(aum)}</dt>
                <dd className={now.net > inputs.sharpe / 2 ? 'cd-good' : now.net > 0 ? 'cd-warn' : 'cd-bad'}>{now.net.toFixed(2)}</dd>
              </div>
              <div>
                <dt>COST PER TRADE</dt>
                <dd>{now.totalBps.toFixed(1)} BPS</dd>
                <small>
                  {inputs.cost.toFixed(1)} FIXED + {now.impactBps.toFixed(1)} IMPACT
                </small>
              </div>
              <div>
                <dt>YEARLY COST DRAG</dt>
                <dd>{(now.drag * 100).toFixed(2)}%</dd>
              </div>
              <div>
                <dt>DAILY TRADE / NAME</dt>
                <dd>{money(now.dailyTrade)}</dd>
              </div>
            </dl>
            <div className={`cd-part cd-part--${tier.tone}`} aria-live="polite">
              <div className="cd-part__head">
                <span>PARTICIPATION</span>
                <b>{now.participation < 0.0001 ? '<0.01' : (now.participation * 100).toFixed(2)}% OF ADV</b>
              </div>
              <div className="cd-part__meter" aria-hidden="true">
                <i style={{ width: `${Math.min(100, (now.participation / 0.15) * 100)}%` }} />
                <em style={{ left: `${(0.01 / 0.15) * 100}%` }}>1%</em>
                <em style={{ left: `${(0.05 / 0.15) * 100}%` }}>5%</em>
                <em style={{ left: `${(0.1 / 0.15) * 100}%` }}>10%</em>
              </div>
              <p>
                <strong>{tier.label}.</strong> {tier.note}
              </p>
            </div>
          </div>
        </div>
      </div>

      <p className="cd-caption">
        <span>IN YOUR NOTE</span>
        Size positions as a fraction of average daily volume and estimate capacity in dollars. This dial is a rough model:
        state your own cost, spread and impact assumptions for your market, and show how results change when costs double.
      </p>

      <style>{`
        .cd {
          font-family: 'Space Mono', monospace;
          border: 1px solid #1d4f83;
          background: linear-gradient(180deg, rgba(7, 13, 26, 0.96), rgba(4, 8, 18, 0.98));
          box-shadow: 0 0 0 3px rgba(5, 11, 23, 0.98), 0 0 36px rgba(4, 74, 148, 0.16);
          padding: 18px;
        }

        .cd-top {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          gap: 4px 16px;
          margin-bottom: 12px;
          padding-bottom: 10px;
          border-bottom: 1px dashed rgba(41, 79, 125, 0.7);
          font-family: 'Orbitron', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2px;
          color: #fff;
        }

        .cd-top em {
          font-style: normal;
          font-size: 9px;
          letter-spacing: 1.4px;
          color: #63f6ff;
        }

        .cd-presets {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 16px;
        }

        .cd-preset {
          padding: 6px 10px;
          border: 1px solid #294f7d;
          background: #07101d;
          color: #9cc9ff;
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1px;
          cursor: pointer;
        }

        .cd-preset:hover { border-color: #33d17a; color: #fff; }
        .cd-preset--on { border-color: #33d17a; background: #33d17a; color: #03140a; }

        .cd-grid {
          display: grid;
          gap: 18px;
        }

        @media (min-width: 1000px) {
          .cd-grid { grid-template-columns: minmax(0, 0.75fr) minmax(0, 1.25fr); }
        }

        .cd-sliders {
          display: grid;
          gap: 12px;
          align-content: start;
        }

        @media (min-width: 640px) and (max-width: 999px) {
          .cd-sliders { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px 18px; }
        }

        .cd-slider span {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 8px;
          margin-bottom: 5px;
          font-family: 'Orbitron', sans-serif;
          font-size: 8.5px;
          font-weight: 700;
          letter-spacing: 1.3px;
          color: #7e90ab;
        }

        .cd-slider b {
          font-family: 'VT323', monospace;
          font-size: 21px;
          font-weight: 400;
          letter-spacing: 0;
          color: #d9ffe6;
          white-space: nowrap;
        }

        .cd-slider--aum span { color: #33d17a; }
        .cd-slider--aum b { font-size: 26px; color: #fff; }

        .cd-slider input {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 8px;
          background: linear-gradient(90deg, #1f7a4a, #33d17a var(--fill), #12233a var(--fill));
          border: 1px solid #294f7d;
          outline: none;
        }

        .cd-slider input:focus-visible { outline: 1px solid #63f6ff; outline-offset: 3px; }

        .cd-slider input::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 20px;
          background: #d9ffe6;
          border: 2px solid #33d17a;
          box-shadow: 0 0 12px rgba(51, 209, 122, 0.8);
          cursor: pointer;
        }

        .cd-slider input::-moz-range-thumb {
          width: 12px;
          height: 18px;
          background: #d9ffe6;
          border: 2px solid #33d17a;
          border-radius: 0;
          cursor: pointer;
        }

        .cd-main { min-width: 0; }

        .cd-chart {
          display: block;
          width: 100%;
          height: auto;
          border: 1px solid rgba(41, 79, 125, 0.6);
          background: #040913;
        }

        .cd-grid-line { stroke: rgba(41, 79, 125, 0.35); stroke-width: 1; }
        .cd-axis { fill: #5f7390; font-family: 'Space Mono', monospace; font-size: 10px; }
        .cd-zero { stroke: #ff5a6e; stroke-width: 1; stroke-dasharray: 4 3; opacity: 0.7; }
        .cd-gross { stroke: #9cc9ff; stroke-width: 1; stroke-dasharray: 2 4; opacity: 0.6; }
        .cd-gross-label { fill: #9cc9ff; font-family: 'Space Mono', monospace; font-size: 9px; letter-spacing: 1px; }
        .cd-beyond { fill: rgba(255, 255, 255, 0.025); }
        .cd-area { fill: rgba(51, 209, 122, 0.12); }

        .cd-curve {
          fill: none;
          stroke: #33d17a;
          stroke-width: 2.5;
          filter: drop-shadow(0 0 6px rgba(51, 209, 122, 0.6));
        }

        .cd-mark line { stroke-width: 1; stroke-dasharray: 3 3; }
        .cd-mark text { font-family: 'Orbitron', sans-serif; font-size: 9px; font-weight: 700; letter-spacing: 1.2px; }
        .cd-mark--half line { stroke: #ffb84d; }
        .cd-mark--half text { fill: #ffb84d; }
        .cd-mark--cap line { stroke: #ff5a6e; }
        .cd-mark--cap text { fill: #ff5a6e; }

        .cd-now line { stroke: #fff; stroke-width: 1; opacity: 0.5; }
        .cd-now circle { fill: #fff; stroke: #33d17a; stroke-width: 2; filter: drop-shadow(0 0 6px #33d17a); }

        .cd-readouts {
          display: grid;
          gap: 10px;
          margin-top: 12px;
        }

        @media (min-width: 640px) {
          .cd-readouts { grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr); }
          .cd-part { grid-column: 1 / -1; }
        }

        .cd-big {
          padding: 12px 14px;
          border: 2px solid #33d17a;
          background:
            repeating-linear-gradient(135deg, rgba(51, 209, 122, 0.07) 0 10px, transparent 10px 20px),
            rgba(7, 13, 26, 0.95);
        }

        .cd-big span {
          display: block;
          font-family: 'Orbitron', sans-serif;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.6px;
          color: #7e90ab;
        }

        .cd-big strong {
          display: block;
          margin: 4px 0;
          font-family: 'Press Start 2P', monospace;
          font-size: clamp(22px, 3.2vw, 32px);
          font-weight: 400;
          color: #fff;
          text-shadow: 0 0 20px rgba(51, 209, 122, 0.5);
        }

        .cd-big em {
          font-style: normal;
          font-size: 10px;
          line-height: 1.5;
          color: #ffb84d;
        }

        .cd-stats {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
          margin: 0;
        }

        .cd-stats div {
          min-width: 0;
          padding: 8px 10px;
          border: 1px solid rgba(41, 79, 125, 0.6);
          background: rgba(4, 9, 19, 0.9);
        }

        .cd-stats dt {
          font-family: 'Orbitron', sans-serif;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 1.2px;
          color: #7e90ab;
        }

        .cd-stats dd {
          margin: 2px 0 0;
          font-family: 'VT323', monospace;
          font-size: 24px;
          line-height: 1;
          color: #fff;
        }

        .cd-stats small {
          font-size: 8.5px;
          letter-spacing: 0.5px;
          color: #5f7390;
        }

        .cd-stats .cd-good { color: #33d17a; }
        .cd-stats .cd-warn { color: #ffb84d; }
        .cd-stats .cd-bad { color: #ff5a6e; }

        .cd-part {
          --c: #33d17a;
          padding: 10px 12px;
          border: 1px solid var(--c);
          background: rgba(4, 9, 19, 0.9);
          transition: border-color 200ms ease;
        }

        .cd-part--amber { --c: #ffb84d; }
        .cd-part--orange { --c: #FA4616; }
        .cd-part--red { --c: #ff5a6e; }

        .cd-part__head {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          gap: 4px 12px;
          font-family: 'Orbitron', sans-serif;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.5px;
          color: #7e90ab;
        }

        .cd-part__head b { color: var(--c); letter-spacing: 1px; }

        .cd-part__meter {
          position: relative;
          height: 8px;
          margin: 8px 0 16px;
          border: 1px solid rgba(41, 79, 125, 0.7);
          background: #0b1830;
        }

        .cd-part__meter i {
          display: block;
          height: 100%;
          background: var(--c);
          box-shadow: 0 0 10px var(--c);
          transition: width 300ms ease, background 200ms ease;
        }

        .cd-part__meter em {
          position: absolute;
          top: 9px;
          transform: translateX(-50%);
          font-style: normal;
          font-size: 8px;
          color: #5f7390;
        }

        .cd-part__meter em::before {
          content: '';
          position: absolute;
          left: 50%;
          top: -10px;
          width: 1px;
          height: 8px;
          background: #5f7390;
        }

        .cd-part p {
          margin: 0;
          font-size: 11px;
          line-height: 1.55;
          color: #a7b4c9;
        }

        .cd-part p strong { color: var(--c); }

        .cd-caption {
          display: flex;
          flex-wrap: wrap;
          gap: 6px 14px;
          align-items: baseline;
          margin: 16px 0 0;
          padding: 12px 14px;
          border-left: 3px solid #63f6ff;
          background: rgba(99, 246, 255, 0.05);
          font-size: 12px;
          line-height: 1.7;
          color: #d3dcea;
        }

        .cd-caption span {
          font-family: 'Orbitron', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2px;
          color: #63f6ff;
        }

        @media (prefers-reduced-motion: reduce) {
          .cd-part__meter i { transition: none; }
        }
      `}</style>
    </div>
  );
}
