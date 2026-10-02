import { useId, useMemo, useState, type PointerEvent } from 'react';

// The five strategies from the starter notebook's library, drawn at expiry.
// Premiums are illustrative round numbers, not market data: the notebook prices
// every leg from the real chain on the pre-event session.

type Key = 'long_call' | 'covered_call' | 'protective_put' | 'collar' | 'cash_secured_put';
type Otm = 0.03 | 0.05 | 0.1;

const SPOT = 100;
const X_MIN = 70;
const X_MAX = 130;
const ATM_CALL = 4;
// Illustrative OTM premiums by distance from spot: the call a little richer than
// the put, so a 5% collar opens for a small credit, near zero cost.
const OTM_CALL: Record<Otm, number> = { 0.03: 2.6, 0.05: 1.8, 0.1: 0.65 };
const OTM_PUT: Record<Otm, number> = { 0.03: 2.3, 0.05: 1.6, 0.1: 0.55 };
const OTM_GRID: Otm[] = [0.03, 0.05, 0.1];

type Strategy = {
  key: Key;
  n: number;
  name: string;
  tier: 'ROOKIE' | 'VETERAN';
  outlook: string;
  legs: string;
  pays: string;
  ownsShares: boolean;
  construction: string;
  maxGain: string;
  maxLoss: string;
  breakEven: string;
  signal: string;
  watch: string;
  trap: { tone: 'red' | 'green' | 'amber'; text: string };
};

const STRATEGIES: Strategy[] = [
  {
    key: 'long_call',
    n: 1,
    name: 'Long call',
    tier: 'VETERAN',
    outlook: 'Up, and soon',
    legs: 'Buy 1 ATM call',
    pays: 'Debit',
    ownsShares: false,
    construction: 'Buy 1 call, strike A ≈ spot',
    maxGain: 'Unlimited',
    maxLoss: 'The premium paid',
    breakEven: 'A + premium',
    signal:
      'Guidance raised, an acquisition completed, a large contract award, a buyback authorized: categories where the disclosure is unambiguously good news and you can argue the move was not already in the price.',
    watch:
      'The move must arrive before expiry and be bigger than the premium. A stock that rises 2% when you paid 4% for the call is a loss. Compare your realized move against the implied move, never against zero.',
    trap: { tone: 'red', text: 'Exposed. Implied volatility collapses once the news is out, and the call gives back in IV what it gained in direction.' },
  },
  {
    key: 'covered_call',
    n: 2,
    name: 'Covered call',
    tier: 'ROOKIE',
    outlook: 'Flat to mildly up',
    legs: 'Own 100 shares, sell 1 call',
    pays: 'Credit',
    ownsShares: true,
    construction: 'Own 100 shares, sell 1 call at strike A above spot',
    maxGain: '(A − stock price) + premium received',
    maxLoss: "The stock's own downside, cushioned by the premium",
    breakEven: 'Stock price − premium',
    signal:
      'A dividend increase or a buyback in a name you hold. More interesting here: any category where you can show the market over-pays for the implied move. That over-payment is the premium you collect.',
    watch:
      'The tail is opportunity risk: a merger 8-K that gaps the stock 30% above your strike is the disaster case. Also mind early assignment on the short call around dividends.',
    trap: { tone: 'green', text: 'Paid by it. You sold the volatility, so the post-news collapse in IV works for you.' },
  },
  {
    key: 'protective_put',
    n: 3,
    name: 'Protective put',
    tier: 'ROOKIE',
    outlook: 'Up, but nervous',
    legs: 'Own 100 shares, buy 1 put',
    pays: 'Debit',
    ownsShares: true,
    construction: 'Own 100 shares, buy 1 put at strike A',
    maxGain: 'Unlimited, the upside is uncapped',
    maxLoss: '(Stock price − A) + premium paid',
    breakEven: 'Stock price + premium',
    signal:
      'A regulatory investigation opened, material litigation disclosed, a cybersecurity incident, an impairment: bad-but-ambiguous news where you want to stay long and cap the left tail.',
    watch:
      'Insurance has a cost, and paid every event it compounds into a real drag. The honest test is what the full programme cost across all events in the category, winners included.',
    trap: { tone: 'red', text: 'Hurt on the hedge leg. The put wants IV to rise after you are in.' },
  },
  {
    key: 'collar',
    n: 4,
    name: 'Collar',
    tier: 'ROOKIE',
    outlook: 'Up, but nervous, cheaply',
    legs: 'Own 100 shares, buy put A, sell call B',
    pays: 'Either, often ~zero',
    ownsShares: true,
    construction: 'Own 100 shares, buy put A, sell call B, A < spot < B',
    maxGain: '(B − stock price), adjusted for the net debit or credit',
    maxLoss: '(Stock price − A), adjusted the same way',
    breakEven: 'Stock price + net debit, or stock price − net credit',
    signal:
      'Holding through a restructuring, a workforce reduction, a strategic review: an event you must sit through, trading away the upside tail to remove the downside one.',
    watch:
      'Two strikes now, so your rule must fix both defensibly. The zero-cost constraint is the cleanest way: it picks B once you have chosen A.',
    trap: { tone: 'amber', text: 'Roughly neutral, being one of each: long the put, short the call.' },
  },
  {
    key: 'cash_secured_put',
    n: 5,
    name: 'Cash-secured put',
    tier: 'ROOKIE',
    outlook: 'Flat to up, happy to own it',
    legs: 'Sell 1 put, set the cash aside',
    pays: 'Credit',
    ownsShares: false,
    construction: 'Sell 1 put at strike A, hold A × 100 in cash',
    maxGain: 'The premium received',
    maxLoss: 'Substantial: down to A minus the premium, if the stock goes to zero',
    breakEven: 'A − premium',
    signal:
      'A share repurchase programme announced, an insider purchase, a restructuring you read as a floor: cases where a dip is your entry rather than your risk.',
    watch:
      'The largest risk in this list. It is an obligation, not an opportunity, and being American-style you can be assigned early. Show your sizing and your worst single event, not just the average.',
    trap: { tone: 'green', text: 'Paid by it. Like the covered call, you sold the volatility.' },
  },
];

const THESES: { id: string; quote: string; picks: Key[]; note: string }[] = [
  {
    id: 'direction',
    quote: 'This category moves stocks more than the market expects, and I can call the direction.',
    picks: ['long_call'],
    note: 'Defending the sign is a strong claim and worth real credit if it survives the sealed window.',
  },
  {
    id: 'overpriced',
    quote: 'This category is over-priced: the market pays up for drama that does not arrive.',
    picks: ['covered_call', 'cash_secured_put'],
    note: 'The most novel direction available here, and the one that most needs the placebo control to rule out “you were just short volatility in a calm year.”',
  },
  {
    id: 'hold',
    quote: 'You have to hold this name through the event.',
    picks: ['protective_put', 'collar'],
    note: 'The question becomes what the protection costs, priced across the whole category rather than cherry-picked on the bad events.',
  },
];

type Geometry = {
  pnl: (x: number) => number;
  strikes: { label: string; value: number }[];
  breakEven: number;
  gain: number | null;
  loss: number | null;
  net: number;
  netLabel: string;
};

const geometry = (key: Key, otm: Otm): Geometry => {
  const cu = OTM_CALL[otm];
  const pl = OTM_PUT[otm];
  const upper = Math.round(SPOT * (1 + otm) * 2) / 2;
  const lower = Math.round(SPOT * (1 - otm) * 2) / 2;
  const call = (x: number, k: number) => Math.max(x - k, 0);
  const put = (x: number, k: number) => Math.max(k - x, 0);

  switch (key) {
    case 'long_call':
      return {
        pnl: (x) => call(x, SPOT) - ATM_CALL,
        strikes: [{ label: 'A', value: SPOT }],
        breakEven: SPOT + ATM_CALL,
        gain: null,
        loss: -ATM_CALL,
        net: ATM_CALL,
        netLabel: `PAY ${ATM_CALL.toFixed(2)}`,
      };
    case 'covered_call':
      return {
        pnl: (x) => x - SPOT - call(x, upper) + cu,
        strikes: [{ label: 'A', value: upper }],
        breakEven: SPOT - cu,
        gain: upper - SPOT + cu,
        loss: -(SPOT - cu),
        net: -cu,
        netLabel: `RECEIVE ${cu.toFixed(2)}`,
      };
    case 'protective_put':
      return {
        pnl: (x) => x - SPOT + put(x, lower) - pl,
        strikes: [{ label: 'A', value: lower }],
        breakEven: SPOT + pl,
        gain: null,
        loss: -(SPOT - lower + pl),
        net: pl,
        netLabel: `PAY ${pl.toFixed(2)}`,
      };
    case 'collar': {
      const net = pl - cu;
      return {
        pnl: (x) => x - SPOT + put(x, lower) - call(x, upper) - net,
        strikes: [
          { label: 'A', value: lower },
          { label: 'B', value: upper },
        ],
        breakEven: SPOT + net,
        gain: upper - SPOT - net,
        loss: -(SPOT - lower + net),
        net,
        netLabel: net > 0.005 ? `NET DEBIT ${net.toFixed(2)}` : net < -0.005 ? `NET CREDIT ${(-net).toFixed(2)}` : 'ZERO COST',
      };
    }
    case 'cash_secured_put':
      return {
        pnl: (x) => pl - put(x, lower),
        strikes: [{ label: 'A', value: lower }],
        breakEven: lower - pl,
        gain: pl,
        loss: -(lower - pl),
        net: -pl,
        netLabel: `RECEIVE ${pl.toFixed(2)}`,
      };
  }
};

const W = 640;
const H = 300;
const PAD = { left: 46, right: 16, top: 22, bottom: 34 };
const xOf = (x: number) => PAD.left + ((x - X_MIN) / (X_MAX - X_MIN)) * (W - PAD.left - PAD.right);
const STEP = 0.5;

const signed = (v: number) => `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(2)}`;

export function PayoffExplorer() {
  const [active, setActive] = useState<Key>('long_call');
  const [otm, setOtm] = useState<Otm>(0.05);
  const [cursor, setCursor] = useState(108);
  const [thesis, setThesis] = useState<string | null>(null);
  const uid = useId().replace(/:/g, '');

  const strategy = STRATEGIES.find((s) => s.key === active)!;
  const geo = useMemo(() => geometry(active, otm), [active, otm]);
  const matched = THESES.find((t) => t.id === thesis);

  const xs = useMemo(() => {
    const out: number[] = [];
    for (let x = X_MIN; x <= X_MAX + 1e-9; x += STEP) out.push(x);
    return out;
  }, []);

  const { yMin, yMax } = useMemo(() => {
    const values = xs.map(geo.pnl);
    if (strategy.ownsShares) xs.forEach((x) => values.push(x - SPOT));
    const lo = Math.min(...values, -2);
    const hi = Math.max(...values, 2);
    const pad = (hi - lo) * 0.12;
    return { yMin: lo - pad, yMax: hi + pad };
  }, [geo, strategy.ownsShares, xs]);

  const yOf = (v: number) => PAD.top + ((yMax - v) / (yMax - yMin)) * (H - PAD.top - PAD.bottom);
  const zeroY = yOf(0);

  const line = (f: (x: number) => number) => xs.map((x, i) => `${i ? 'L' : 'M'} ${xOf(x).toFixed(1)} ${yOf(f(x)).toFixed(1)}`).join(' ');
  const strategyPath = line(geo.pnl);
  const stockPath = line((x) => x - SPOT);
  const atCursor = geo.pnl(cursor);

  const yTicks = useMemo(() => {
    const span = yMax - yMin;
    const step = span > 50 ? 10 : span > 24 ? 5 : 2;
    const out: number[] = [];
    for (let v = Math.ceil(yMin / step) * step; v <= yMax; v += step) out.push(v);
    return out;
  }, [yMin, yMax]);

  const onPointer = (event: PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const vx = ((event.clientX - rect.left) / rect.width) * W;
    const x = X_MIN + ((vx - PAD.left) / (W - PAD.left - PAD.right)) * (X_MAX - X_MIN);
    setCursor(Math.round(Math.min(X_MAX, Math.max(X_MIN, x)) / STEP) * STEP);
  };

  const inRange = (x: number) => x >= X_MIN && x <= X_MAX;
  const clipAbove = `px-above-${uid}`;
  const clipBelow = `px-below-${uid}`;

  return (
    <div className="px">
      <div className="px-top">
        <span>PAYOFF EXPLORER · FIVE DEFINED STRATEGIES</span>
        <em>AT EXPIRY · ILLUSTRATIVE PREMIUMS</em>
      </div>

      <div className="px-tabs" role="tablist" aria-label="Strategies">
        {STRATEGIES.map((s) => {
          const on = s.key === active;
          const match = matched?.picks.includes(s.key);
          return (
            <button
              key={s.key}
              type="button"
              role="tab"
              aria-selected={on}
              aria-controls={`px-panel-${uid}`}
              className={`px-tab ${on ? 'px-tab--on' : ''} ${match ? 'px-tab--match' : ''}`}
              onClick={() => setActive(s.key)}
            >
              <span className="px-tab__head">
                <i>{s.n}</i>
                <b className={`px-tier px-tier--${s.tier.toLowerCase()}`}>{s.tier}</b>
              </span>
              <span className="px-tab__name">{s.name}</span>
              <span className="px-tab__outlook">{s.outlook}</span>
              {match && <span className="px-tab__fit">FITS YOUR THESIS</span>}
            </button>
          );
        })}
      </div>

      <div className="px-grid" id={`px-panel-${uid}`} role="tabpanel" aria-label={strategy.name}>
        <div className="px-chartbox">
          <div className="px-controls">
            <div className="px-group" role="group" aria-label="Out-of-the-money distance">
              <span>OTM DISTANCE</span>
              {OTM_GRID.map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`px-chip ${otm === value ? 'px-chip--on' : ''}`}
                  aria-pressed={otm === value}
                  onClick={() => setOtm(value)}
                  disabled={active === 'long_call'}
                >
                  {Math.round(value * 100)}%
                </button>
              ))}
            </div>
            <span className="px-net">{active === 'long_call' ? 'ATM · ' : ''}{geo.netLabel}</span>
          </div>

          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="px-chart"
            role="img"
            aria-label={`${strategy.name} payoff at expiry. At a stock price of ${cursor.toFixed(2)}, profit or loss is ${signed(atCursor)} per share.`}
            onPointerMove={onPointer}
            onPointerDown={onPointer}
          >
            <defs>
              <clipPath id={clipAbove}>
                <rect x={0} y={0} width={W} height={Math.max(0, zeroY)} />
              </clipPath>
              <clipPath id={clipBelow}>
                <rect x={0} y={zeroY} width={W} height={Math.max(0, H - zeroY)} />
              </clipPath>
            </defs>

            {yTicks.map((v) => (
              <g key={v}>
                <line x1={PAD.left} x2={W - PAD.right} y1={yOf(v)} y2={yOf(v)} className={v === 0 ? 'px-zero' : 'px-gridline'} />
                <text x={PAD.left - 6} y={yOf(v) + 3} textAnchor="end" className="px-axis">
                  {v > 0 ? `+${v}` : v}
                </text>
              </g>
            ))}
            {[70, 80, 90, 100, 110, 120, 130].map((x) => (
              <text key={x} x={xOf(x)} y={H - 14} textAnchor={x === X_MIN ? 'start' : x === X_MAX ? 'end' : 'middle'} className="px-axis">
                {x === SPOT ? 'SPOT 100' : x}
              </text>
            ))}
            <text x={W - PAD.right} y={H - 2} textAnchor="end" className="px-axis px-axis--title">
              STOCK PRICE AT EXPIRY →
            </text>
            <text x={PAD.left - 38} y={PAD.top - 8} className="px-axis px-axis--title">
              P&amp;L / SHARE
            </text>

            <line x1={xOf(SPOT)} x2={xOf(SPOT)} y1={PAD.top} y2={H - PAD.bottom} className="px-spot" />

            {geo.strikes.map((k) => (
              <g key={k.label} className="px-strike">
                <line x1={xOf(k.value)} x2={xOf(k.value)} y1={PAD.top} y2={H - PAD.bottom} />
                <text x={xOf(k.value)} y={PAD.top - 6} textAnchor="middle">
                  {k.label} {k.value}
                </text>
              </g>
            ))}

            {geo.gain !== null && (
              <g className="px-level px-level--gain">
                <line x1={PAD.left} x2={W - PAD.right} y1={yOf(geo.gain)} y2={yOf(geo.gain)} />
                <text x={PAD.left + 6} y={yOf(geo.gain) - 5}>
                  MAX GAIN {signed(geo.gain)}
                </text>
              </g>
            )}
            {geo.loss !== null && yOf(geo.loss) <= H - PAD.bottom && geo.pnl(X_MIN) <= geo.loss + 1e-9 && (
              <g className="px-level px-level--loss">
                <line x1={PAD.left} x2={W - PAD.right} y1={yOf(geo.loss)} y2={yOf(geo.loss)} />
                <text x={W - PAD.right - 6} y={yOf(geo.loss) + 13} textAnchor="end">
                  MAX LOSS {signed(geo.loss)}
                </text>
              </g>
            )}
            {geo.loss !== null && geo.pnl(X_MIN) > geo.loss + 1e-9 && (
              <text x={PAD.left + 6} y={H - PAD.bottom - 6} className="px-offchart">
                ↙ MAX LOSS {signed(geo.loss)} IF THE STOCK GOES TO ZERO
              </text>
            )}
            {geo.gain === null && (
              <text x={W - PAD.right - 4} y={yOf(geo.pnl(X_MAX)) + 16} textAnchor="end" className="px-unlimited">
                UNLIMITED ↗
              </text>
            )}

            {strategy.ownsShares && <path d={stockPath} className="px-stock" />}
            <path d={strategyPath} className="px-line px-line--gain" clipPath={`url(#${clipAbove})`} />
            <path d={strategyPath} className="px-line px-line--loss" clipPath={`url(#${clipBelow})`} />

            {inRange(geo.breakEven) && (
              <g className="px-be">
                <circle cx={xOf(geo.breakEven)} cy={zeroY} r={4.5} />
                <text x={xOf(geo.breakEven)} y={zeroY + 18} textAnchor="middle">
                  BE {geo.breakEven.toFixed(2)}
                </text>
              </g>
            )}

            <g className="px-cursor">
              <line x1={xOf(cursor)} x2={xOf(cursor)} y1={PAD.top} y2={H - PAD.bottom} />
              <circle cx={xOf(cursor)} cy={yOf(atCursor)} r={5} className={atCursor >= 0 ? 'px-dot--gain' : 'px-dot--loss'} />
            </g>
          </svg>

          <div className="px-readout">
            <label className="px-slider">
              <span>
                STOCK AT EXPIRY <b>{cursor.toFixed(2)}</b>
              </span>
              <input
                type="range"
                min={X_MIN}
                max={X_MAX}
                step={STEP}
                value={cursor}
                onChange={(event) => setCursor(Number(event.target.value))}
                aria-label="Stock price at expiry"
              />
            </label>
            <div className={`px-pnl ${atCursor >= 0 ? 'px-pnl--gain' : 'px-pnl--loss'}`} aria-live="polite">
              <span>P&amp;L / SHARE</span>
              <b>{signed(atCursor)}</b>
              <em>{signed(atCursor * 100)} PER CONTRACT</em>
            </div>
          </div>

          <div className="px-legend" aria-hidden="true">
            <span>
              <i className="px-key px-key--line" /> {strategy.name.toUpperCase()}
            </span>
            {strategy.ownsShares && (
              <span>
                <i className="px-key px-key--stock" /> STOCK ONLY
              </span>
            )}
            <span>
              <i className="px-key px-key--be" /> BREAK-EVEN
            </span>
          </div>
        </div>

        <div className="px-facts" key={active}>
          <div className="px-facts__title">
            <span>
              {strategy.n} · {strategy.name.toUpperCase()}
            </span>
            <em>{strategy.legs}</em>
          </div>
          <dl className="px-specs">
            <div>
              <dt>CONSTRUCTION</dt>
              <dd>{strategy.construction}</dd>
            </div>
            <div>
              <dt>MAX GAIN</dt>
              <dd>{strategy.maxGain}</dd>
            </div>
            <div>
              <dt>MAX LOSS</dt>
              <dd>{strategy.maxLoss}</dd>
            </div>
            <div>
              <dt>BREAK-EVEN</dt>
              <dd>{strategy.breakEven}</dd>
            </div>
            <div>
              <dt>YOU PAY / ARE PAID</dt>
              <dd>{strategy.pays}</dd>
            </div>
          </dl>
          <div className="px-block">
            <span>THE 8-K SIGNAL</span>
            <p>{strategy.signal}</p>
          </div>
          <div className="px-block px-block--watch">
            <span>WATCH OUT FOR</span>
            <p>{strategy.watch}</p>
          </div>
          <div className={`px-trap px-trap--${strategy.trap.tone}`}>
            <span>THE VOLATILITY TRAP</span>
            <p>{strategy.trap.text}</p>
          </div>
        </div>
      </div>

      <div className="px-thesis">
        <div className="px-thesis__head">
          <span>WHICH SHAPE IS YOUR THESIS?</span>
          <em>CHOOSE ON THE SHAPE OF THE THESIS, NOT ON WHICH STRATEGY SOUNDS MOST ADVANCED</em>
        </div>
        <div className="px-thesis__options">
          {THESES.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`px-quote ${thesis === t.id ? 'px-quote--on' : ''}`}
              aria-pressed={thesis === t.id}
              onClick={() => {
                const next = thesis === t.id ? null : t.id;
                setThesis(next);
                if (next) setActive(t.picks[0]);
              }}
            >
              <span>“{t.quote}”</span>
              <b>
                → {t.picks.map((k) => {
                  const s = STRATEGIES.find((x) => x.key === k)!;
                  return `${s.n} · ${s.name}`;
                }).join(' or ')}
              </b>
            </button>
          ))}
        </div>
        {matched && (
          <p className="px-thesis__note" aria-live="polite">
            {matched.note}
          </p>
        )}
      </div>

      <p className="px-foot">
        <span>NO STOCK FEED</span>
        Three of the five start with 100 shares, and this challenge has no stock data. The notebook builds the shares from
        a synthetic long: a long ATM call plus a short ATM put at the same strike and expiry, which by put-call parity moves
        one for one with the stock. Payoffs follow{' '}
        <a href="https://www.optionsplaybook.com/option-strategies/" target="_blank" rel="noreferrer">
          OptionsPlaybook ↗
        </a>
        .
      </p>

      <style>{`
        .px {
          font-family: 'Space Mono', monospace;
          border: 1px solid #1d4f83;
          background: linear-gradient(180deg, rgba(7, 13, 26, 0.96), rgba(4, 8, 18, 0.98));
          box-shadow: 0 0 0 3px rgba(5, 11, 23, 0.98), 0 0 36px rgba(157, 140, 255, 0.1);
          padding: 18px;
        }

        .px-top {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          gap: 4px 16px;
          margin-bottom: 14px;
          padding-bottom: 10px;
          border-bottom: 1px dashed rgba(41, 79, 125, 0.7);
          font-family: 'Orbitron', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2px;
          color: #fff;
        }

        .px-top em { font-style: normal; font-size: 9px; letter-spacing: 1.4px; color: #9d8cff; }

        .px-tabs {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 6px;
          margin-bottom: 14px;
        }

        .px-tab {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 10px 12px;
          border: 1px solid #294f7d;
          background: #07101d;
          color: #9cc9ff;
          font-family: 'Space Mono', monospace;
          text-align: left;
          cursor: pointer;
          transition: border-color 150ms ease, background 150ms ease, color 150ms ease, box-shadow 150ms ease;
        }

        .px-tab__head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }

        .px-tab i {
          display: grid;
          place-items: center;
          min-width: 26px;
          height: 26px;
          border: 2px solid currentColor;
          font-family: 'Press Start 2P', monospace;
          font-size: 10px;
          font-style: normal;
        }

        .px-tier {
          padding: 2px 6px;
          border: 1px solid currentColor;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 1.4px;
        }

        .px-tier--rookie { color: #63f6ff; }
        .px-tier--veteran { color: #ffb84d; }

        .px-tab__name {
          font-family: 'Orbitron', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.2px;
          color: #fff;
        }

        .px-tab__outlook { font-size: 10px; color: #7e90ab; }

        .px-tab__fit {
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 1.4px;
          color: #9d8cff;
        }

        .px-tab:hover { border-color: #63f6ff; color: #fff; }
        .px-tab--match { border-color: #9d8cff; box-shadow: 0 0 14px rgba(157, 140, 255, 0.22); }
        .px-tab--on { border-color: #33d17a; background: rgba(51, 209, 122, 0.1); color: #33d17a; box-shadow: 0 0 16px rgba(51, 209, 122, 0.18); }
        .px-tab:focus-visible { outline: 2px solid #63f6ff; outline-offset: 2px; }

        .px-grid { display: grid; gap: 16px; }

        @media (min-width: 1000px) {
          .px-grid { grid-template-columns: minmax(0, 1.25fr) minmax(0, 0.75fr); }
        }

        .px-chartbox {
          min-width: 0;
          padding: 12px;
          border: 1px solid rgba(41, 79, 125, 0.6);
          background: rgba(4, 9, 19, 0.9);
        }

        .px-controls {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 8px 14px;
          margin-bottom: 8px;
        }

        .px-group { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }

        .px-group > span {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.5px;
          color: #7e90ab;
        }

        .px-chip {
          padding: 5px 10px;
          border: 1px solid #294f7d;
          background: #07101d;
          color: #9cc9ff;
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }

        .px-chip:hover:not(:disabled) { border-color: #63f6ff; color: #fff; }
        .px-chip--on { border-color: #9d8cff; background: rgba(157, 140, 255, 0.15); color: #fff; }
        .px-chip:disabled { opacity: 0.35; cursor: not-allowed; }
        .px-chip:focus-visible { outline: 2px solid #63f6ff; outline-offset: 2px; }

        .px-net {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.4px;
          color: #ffb84d;
        }

        .px-chart {
          display: block;
          width: 100%;
          height: auto;
          touch-action: none;
          cursor: crosshair;
          image-rendering: auto;
        }

        .px-gridline { stroke: rgba(41, 79, 125, 0.35); stroke-width: 1; }
        .px-zero { stroke: rgba(201, 212, 228, 0.55); stroke-width: 1; }
        .px-axis { fill: #5f7390; font-size: 9px; font-family: 'Space Mono', monospace; }
        .px-axis--title { fill: #7e90ab; font-size: 8px; letter-spacing: 1px; }
        .px-spot { stroke: rgba(156, 201, 255, 0.35); stroke-dasharray: 2 3; }

        .px-strike line { stroke: #9d8cff; stroke-width: 1; stroke-dasharray: 4 3; opacity: 0.75; }
        .px-strike text { fill: #9d8cff; font-size: 10px; font-weight: 700; font-family: 'Space Mono', monospace; }

        .px-level line { stroke-width: 1; stroke-dasharray: 6 4; opacity: 0.6; }
        .px-level text { font-size: 9px; font-weight: 700; letter-spacing: 1px; font-family: 'Space Mono', monospace; paint-order: stroke; stroke: #040913; stroke-width: 3px; }
        .px-level--gain line { stroke: #33d17a; }
        .px-level--gain text { fill: #33d17a; }
        .px-level--loss line { stroke: #ff5a6e; }
        .px-level--loss text { fill: #ff5a6e; }

        .px-offchart { fill: #ff5a6e; font-size: 9px; font-weight: 700; letter-spacing: 1px; font-family: 'Space Mono', monospace; paint-order: stroke; stroke: #040913; stroke-width: 3px; }
        .px-unlimited { fill: #33d17a; font-size: 10px; font-weight: 700; letter-spacing: 1.2px; font-family: 'Space Mono', monospace; paint-order: stroke; stroke: #040913; stroke-width: 3px; }

        .px-stock { fill: none; stroke: #7e90ab; stroke-width: 1.5; stroke-dasharray: 5 4; opacity: 0.6; }
        .px-line { fill: none; stroke-width: 3; stroke-linejoin: round; }
        .px-line--gain { stroke: #33d17a; filter: drop-shadow(0 0 4px rgba(51, 209, 122, 0.6)); }
        .px-line--loss { stroke: #ff5a6e; filter: drop-shadow(0 0 4px rgba(255, 90, 110, 0.5)); }

        .px-be circle { fill: #040913; stroke: #ffb84d; stroke-width: 2; }
        .px-be text { fill: #ffb84d; font-size: 9px; font-weight: 700; font-family: 'Space Mono', monospace; paint-order: stroke; stroke: #040913; stroke-width: 3px; }

        .px-cursor line { stroke: rgba(255, 255, 255, 0.35); stroke-width: 1; }
        .px-dot--gain { fill: #33d17a; stroke: #040913; stroke-width: 2; }
        .px-dot--loss { fill: #ff5a6e; stroke: #040913; stroke-width: 2; }

        .px-readout {
          display: grid;
          gap: 10px;
          margin-top: 8px;
          align-items: center;
        }

        @media (min-width: 560px) {
          .px-readout { grid-template-columns: minmax(0, 1fr) auto; }
        }

        .px-slider { display: grid; gap: 6px; }

        .px-slider span {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.5px;
          color: #7e90ab;
        }

        .px-slider b { margin-left: 6px; font-family: 'VT323', monospace; font-size: 20px; color: #fff; }

        .px-slider input {
          width: 100%;
          height: 6px;
          appearance: none;
          -webkit-appearance: none;
          background: #12233a;
          border: 1px solid #294f7d;
          outline: none;
        }

        .px-slider input::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 18px;
          background: #9d8cff;
          border: 2px solid #040913;
          box-shadow: 0 0 10px rgba(157, 140, 255, 0.6);
          cursor: pointer;
        }

        .px-slider input::-moz-range-thumb {
          width: 14px;
          height: 18px;
          border-radius: 0;
          background: #9d8cff;
          border: 2px solid #040913;
          cursor: pointer;
        }

        .px-slider input:focus-visible { outline: 2px solid #63f6ff; outline-offset: 3px; }

        .px-pnl {
          display: grid;
          justify-items: end;
          padding: 6px 12px;
          border: 1px solid currentColor;
          min-width: 150px;
        }

        .px-pnl--gain { color: #33d17a; background: rgba(51, 209, 122, 0.06); }
        .px-pnl--loss { color: #ff5a6e; background: rgba(255, 90, 110, 0.06); }

        .px-pnl span { font-size: 8px; font-weight: 700; letter-spacing: 1.5px; color: #7e90ab; }
        .px-pnl b { font-family: 'VT323', monospace; font-size: 32px; line-height: 1; font-weight: 400; }
        .px-pnl em { font-style: normal; font-size: 9px; letter-spacing: 1px; color: #a7b4c9; }

        .px-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 6px 16px;
          margin-top: 10px;
          font-size: 9px;
          letter-spacing: 1.2px;
          color: #7e90ab;
        }

        .px-legend span { display: inline-flex; align-items: center; gap: 6px; }
        .px-key { display: inline-block; width: 18px; height: 0; border-top: 3px solid #33d17a; }
        .px-key--stock { border-top: 2px dashed #7e90ab; }
        .px-key--be { width: 9px; height: 9px; border: 2px solid #ffb84d; border-radius: 50%; }

        .px-facts {
          display: grid;
          gap: 12px;
          align-content: start;
          padding: 14px 16px;
          border: 1px solid rgba(41, 79, 125, 0.6);
          border-left: 4px solid #9d8cff;
          background: rgba(4, 9, 19, 0.9);
          animation: pxIn 260ms ease-out both;
        }

        @keyframes pxIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: none; }
        }

        .px-facts__title span {
          display: block;
          font-family: 'Orbitron', sans-serif;
          font-size: 14px;
          font-weight: 800;
          letter-spacing: 1.6px;
          color: #fff;
        }

        .px-facts__title em { font-style: normal; font-size: 11px; color: #9d8cff; }

        .px-specs { display: grid; gap: 8px; margin: 0; }

        .px-specs div {
          display: grid;
          grid-template-columns: 112px minmax(0, 1fr);
          gap: 10px;
          padding-bottom: 8px;
          border-bottom: 1px dashed rgba(41, 79, 125, 0.5);
        }

        .px-specs dt {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.4px;
          color: #7e90ab;
          padding-top: 2px;
        }

        .px-specs dd { margin: 0; font-size: 12px; line-height: 1.5; color: #fff; }

        .px-block span,
        .px-trap span {
          display: block;
          margin-bottom: 4px;
          font-family: 'Orbitron', sans-serif;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 2px;
          color: #33d17a;
        }

        .px-block p,
        .px-trap p { margin: 0; font-size: 12px; line-height: 1.65; color: #c9d4e4; }

        .px-block--watch span { color: #ff5a6e; }

        .px-trap {
          padding: 10px 12px;
          border: 1px solid currentColor;
        }

        .px-trap--red { color: #ff5a6e; background: rgba(255, 90, 110, 0.06); }
        .px-trap--green { color: #33d17a; background: rgba(51, 209, 122, 0.06); }
        .px-trap--amber { color: #ffb84d; background: rgba(255, 184, 77, 0.06); }
        .px-trap span { color: inherit; }

        .px-thesis {
          margin-top: 16px;
          padding: 14px;
          border: 1px dashed rgba(157, 140, 255, 0.5);
        }

        .px-thesis__head {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          gap: 4px 12px;
          margin-bottom: 10px;
        }

        .px-thesis__head span {
          font-family: 'Orbitron', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2px;
          color: #9d8cff;
        }

        .px-thesis__head em { font-style: normal; font-size: 9px; letter-spacing: 1.2px; color: #5f7390; }

        .px-thesis__options { display: grid; gap: 8px; }

        @media (min-width: 900px) {
          .px-thesis__options { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }

        .px-quote {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 10px;
          padding: 12px 14px;
          border: 1px solid #294f7d;
          background: #07101d;
          color: #c9d4e4;
          font-family: 'Space Mono', monospace;
          text-align: left;
          cursor: pointer;
          transition: border-color 150ms ease, background 150ms ease;
        }

        .px-quote span { font-size: 12px; line-height: 1.55; font-style: italic; }
        .px-quote b { font-size: 10px; letter-spacing: 1.2px; color: #9cc9ff; }
        .px-quote:hover { border-color: #9d8cff; }
        .px-quote--on { border-color: #9d8cff; background: rgba(157, 140, 255, 0.12); }
        .px-quote--on b { color: #fff; }
        .px-quote:focus-visible { outline: 2px solid #63f6ff; outline-offset: 2px; }

        .px-thesis__note {
          margin: 10px 0 0;
          padding: 10px 12px;
          border-left: 3px solid #9d8cff;
          background: rgba(157, 140, 255, 0.07);
          font-size: 12px;
          line-height: 1.65;
          color: #d3dcea;
        }

        .px-foot {
          margin: 14px 0 0;
          font-size: 11px;
          line-height: 1.7;
          color: #8ea0bb;
        }

        .px-foot span {
          margin-right: 10px;
          font-family: 'Orbitron', sans-serif;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.8px;
          color: #ffb84d;
        }

        .px-foot a { color: #63f6ff; }

        @media (max-width: 520px) {
          .px { padding: 12px; }
          .px-specs div { grid-template-columns: minmax(0, 1fr); gap: 2px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .px-facts { animation: none; }
          .px-tab, .px-quote { transition: none; }
        }
      `}</style>
    </div>
  );
}
