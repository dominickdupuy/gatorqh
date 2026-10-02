import { useEffect, useMemo, useRef, useState } from 'react';
import {
  DAYS,
  DAYS_PER_YEAR,
  expectedMaxSharpe,
  holdoutDays,
  makeMarket,
  metrics,
  mulberry32,
  num,
} from './market';

// Data snooping on pure noise: try many rules on a market with no edge, keep
// the best in-sample one, then watch it fail on the held-out data.
const PRESETS = [1, 10, 50, 200, 1000];
const SPLIT = DAYS - holdoutDays(DAYS);
const IS_YEARS = SPLIT / DAYS_PER_YEAR;

const X_MIN = -1.5;
const X_MAX = 1.5;
const BIN = 0.05;
const BINS = Math.round((X_MAX - X_MIN) / BIN);

// A rule bets on the sign of a few past returns, each pushed with a random sign:
// the kind of pattern a search turns up when it has no idea to test.
type Rule = { lags: number[]; signs: number[]; hold: number };
type Trial = { rule: Rule; is: number; oos: number };

// A market with no drift to find: the simulator at trend 0, demeaned so even
// buy-and-hold has nothing to earn.
//
// A noise history whose first 200-variant run shows the typical outcome: the
// luckiest rule fades out of sample. Other seeds (NEW NOISE) vary, as luck does.
const DEFAULT_SEED = 5;

const noiseReturns = (seed: number) => {
  const raw = makeMarket(seed, DAYS, 0).returns;
  let mean = 0;
  for (let t = 0; t < raw.length; t += 1) mean += raw[t];
  mean /= raw.length;
  const out = new Float64Array(raw.length);
  for (let t = 0; t < raw.length; t += 1) out[t] = raw[t] - mean;
  return out;
};

const randomRule = (rand: () => number): Rule => {
  const terms = 1 + Math.floor(rand() * 4);
  const lags: number[] = [];
  const signs: number[] = [];
  for (let k = 0; k < terms; k += 1) {
    lags.push(1 + Math.floor(rand() * 60));
    signs.push(rand() < 0.5 ? 1 : -1);
  }
  return { lags, signs, hold: 1 + Math.floor(rand() * 5) };
};

// Every lag is at least 1, so each position uses only returns already known.
// Gross of costs: costs would only push every bar of the histogram left.
const evaluate = (returns: Float64Array, rule: Rule) => {
  const n = returns.length;
  const net = new Float64Array(n);
  const position = new Float64Array(n);
  let pos = 0;
  for (let t = 0; t < n; t += 1) {
    if (t % rule.hold === 0) {
      let score = 0;
      for (let k = 0; k < rule.lags.length; k += 1) {
        const at = t - rule.lags[k];
        if (at >= 0) score += rule.signs[k] * returns[at];
      }
      pos = score > 0 ? 1 : score < 0 ? -1 : 0;
    }
    position[t] = pos;
    net[t] = pos * returns[t];
  }
  return { net, position };
};

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const ruleLabel = (rule: Rule) =>
  `${rule.lags.map((lag, k) => `${rule.signs[k] > 0 ? '+' : '−'}r[t−${lag}]`).join(' ')} · REBALANCE EVERY ${rule.hold} DAY${rule.hold === 1 ? '' : 'S'}`;

const HW = 640;
const HH = 200;
const HP = { left: 14, right: 14, top: 26, bottom: 30 };
const xOfSharpe = (value: number) =>
  HP.left + ((Math.max(X_MIN, Math.min(X_MAX, value)) - X_MIN) / (X_MAX - X_MIN)) * (HW - HP.left - HP.right);

const EW = 640;
const EH = 190;
const EP = { left: 44, right: 14, top: 18, bottom: 26 };

export function OverfitMachine() {
  const [seed, setSeed] = useState(DEFAULT_SEED);
  const [count, setCount] = useState(200);
  const [trials, setTrials] = useState<Trial[]>([]);
  const [target, setTarget] = useState(0);
  const [running, setRunning] = useState(false);
  const runRef = useRef(0);
  const rafRef = useRef(0);

  const returns = useMemo(() => noiseReturns(seed), [seed]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const run = () => {
    cancelAnimationFrame(rafRef.current);
    runRef.current += 1;
    const token = runRef.current;
    const rand = mulberry32(seed * 7919 + token * 104729 + count);
    const all: Trial[] = [];
    const doOne = () => {
      const rule = randomRule(rand);
      const result = evaluate(returns, rule);
      all.push({ rule, is: metrics(result, 0, SPLIT).sharpe, oos: metrics(result, SPLIT).sharpe });
    };

    setTarget(count);
    if (reducedMotion()) {
      for (let k = 0; k < count; k += 1) doOne();
      setTrials(all);
      setRunning(false);
      return;
    }

    setTrials([]);
    setRunning(true);
    // Fill the histogram over roughly ninety frames, whatever the trial count.
    const batch = Math.max(1, Math.ceil(count / 90));
    const tick = () => {
      if (runRef.current !== token) return;
      for (let k = 0; k < batch && all.length < count; k += 1) doOne();
      setTrials(all.slice());
      if (all.length < count) rafRef.current = requestAnimationFrame(tick);
      else setRunning(false);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const reseed = () => {
    cancelAnimationFrame(rafRef.current);
    runRef.current += 1;
    setRunning(false);
    setTrials([]);
    setTarget(0);
    setSeed((value) => value + 1);
  };

  const done = !running && trials.length > 0 && trials.length === target;
  const best = trials.reduce<Trial | null>((top, trial) => (!top || trial.is > top.is ? trial : top), null);
  const luck = expectedMaxSharpe(Math.max(1, trials.length), IS_YEARS);

  // Stack each trial into its Sharpe bin. The winner always sits on top of its
  // stack so the marker above it points at the right cell.
  const bins = useMemo(() => {
    const stacks: number[] = new Array(BINS).fill(0);
    const binOf = (trial: Trial) => Math.max(0, Math.min(BINS - 1, Math.floor((trial.is - X_MIN) / BIN)));
    const place = (trial: Trial) => {
      const bin = binOf(trial);
      const level = stacks[bin];
      stacks[bin] += 1;
      return { bin, level, trial };
    };
    const placed = trials.filter((trial) => trial !== best).map(place);
    if (best) placed.push(place(best));
    return { placed, tallest: Math.max(1, ...stacks) };
  }, [trials, best]);

  const cellW = (HW - HP.left - HP.right) / BINS;
  const cellH = Math.min(cellW - 1, (HH - HP.top - HP.bottom) / bins.tallest);
  // With many trials the cells get thin; the winner stays big enough to see.
  const bestH = Math.max(5, cellH - 1);

  // The winner's equity curve, only once the run is over.
  const curve = useMemo(() => {
    if (!done || !best) return null;
    const result = evaluate(returns, best.rule);
    const equity: number[] = [];
    let eq = 1;
    for (let t = 0; t < result.net.length; t += 1) {
      eq *= 1 + result.net[t];
      equity.push(eq);
    }
    const lo = Math.min(...equity);
    const hi = Math.max(...equity);
    const span = hi - lo || 1;
    const x = (t: number) => EP.left + (t / (equity.length - 1)) * (EW - EP.left - EP.right);
    const y = (v: number) => EP.top + ((hi - v) / span) * (EH - EP.top - EP.bottom);
    const path = (from: number, to: number) => {
      let d = '';
      const step = 3;
      for (let t = from; t <= to; t += step) d += `${t === from ? 'M' : 'L'} ${x(t).toFixed(1)} ${y(equity[t]).toFixed(1)} `;
      d += `L ${x(to).toFixed(1)} ${y(equity[to]).toFixed(1)}`;
      return d;
    };
    return {
      isPath: path(0, SPLIT - 1),
      oosPath: path(SPLIT - 1, equity.length - 1),
      splitX: x(SPLIT),
      // Drop the low or high label when it would sit on top of the 1.00× line.
      ticks: [1, lo, hi].filter((v, i) => i === 0 || Math.abs(y(v) - y(1)) > 14).map((v) => ({ v, y: y(v) })),
      isGrowth: equity[SPLIT - 1] - 1,
      oosGrowth: equity[equity.length - 1] / equity[SPLIT - 1] - 1,
    };
  }, [done, best, returns]);

  const verdict = () => {
    if (!done || !best) return null;
    const bestIs = num(best.is);
    const bestOos = num(best.oos);
    if (trials.length === 1) {
      return (
        <>
          You tried <b>one</b> rule on a market with no edge. In sample it scored <b>{bestIs}</b>, out of sample <b>{bestOos}</b>.
          With only one try there’s nothing to cherry-pick from, so this is just noise.
        </>
      );
    }
    const gap = best.is - luck;
    const compare = Math.abs(gap) <= 0.25 ? 'about what luck alone predicts' : gap > 0 ? 'a little above what luck predicts, and still luck' : 'below what luck predicts';
    return (
      <>
        You tried <b>{trials.length.toLocaleString()}</b> rules on a market with no edge. The winner’s Sharpe of <b className="om-g">{bestIs}</b> is{' '}
        {compare} (<b className="om-c">{num(luck)}</b>). Out of sample it made <b className={best.oos > 0.3 ? 'om-g' : 'om-r'}>{bestOos}</b>.
        {best.oos > 0.3 && ' That’s also luck. Over two years, noise alone can move a Sharpe by about ±0.7. Try running it again.'}
      </>
    );
  };

  return (
    <div className="om">
      <div className="om-top">
        <span>OVERFITTING MACHINE · DATA SNOOPING ON PURE NOISE</span>
        <em>NO STRATEGY HERE HAS AN EDGE</em>
      </div>

      <div className="om-controls">
        <div className="om-group" role="group" aria-label="Number of strategy variants">
          <span>VARIANTS TO TRY</span>
          {PRESETS.map((value) => (
            <button
              key={value}
              type="button"
              className={`om-btn ${count === value ? 'om-btn--on' : ''}`}
              onClick={() => setCount(value)}
              aria-pressed={count === value}
              disabled={running}
            >
              {value.toLocaleString()}
            </button>
          ))}
        </div>
        <div className="om-group">
          <button type="button" className="om-btn om-btn--main" onClick={run} disabled={running}>
            {running ? `RUNNING ${trials.length}/${count}…` : `RUN ${count.toLocaleString()} BACKTEST${count === 1 ? '' : 'S'} ▸`}
          </button>
          <button type="button" className="om-btn" onClick={reseed} disabled={running}>
            ↻ NEW NOISE
          </button>
        </div>
      </div>

      <div className="om-readouts">
        <div>
          <span>TRIALS RUN</span>
          <b>{trials.length.toLocaleString()}</b>
        </div>
        <div>
          <span>BEST IN-SAMPLE SHARPE</span>
          <b className="om-g">{best ? num(best.is) : '—'}</b>
        </div>
        <div>
          <span>LUCK ALONE PREDICTS</span>
          <b className="om-c">{trials.length > 1 ? num(luck) : '—'}</b>
        </div>
        <div>
          <span>WINNER OUT OF SAMPLE</span>
          <b className={done && best ? (best.oos > 0.3 ? 'om-g' : 'om-r') : ''}>{done && best ? num(best.oos) : '—'}</b>
        </div>
      </div>

      <div className="om-panel">
        <div className="om-panel__head">
          <span>IN-SAMPLE SHARPE OF EVERY VARIANT</span>
          <em>{IS_YEARS.toFixed(0)} YEARS IN SAMPLE · GROSS OF COSTS · NO LOOKAHEAD</em>
        </div>
        <svg viewBox={`0 0 ${HW} ${HH}`} className="om-chart" role="img" aria-label={`Histogram of ${trials.length} in-sample Sharpe ratios.`}>
          {[-1, -0.5, 0, 0.5, 1].map((tick) => (
            <g key={tick}>
              <line x1={xOfSharpe(tick)} x2={xOfSharpe(tick)} y1={HP.top} y2={HH - HP.bottom} className={tick === 0 ? 'om-zero' : 'om-gridline'} />
              <text x={xOfSharpe(tick)} y={HH - 12} textAnchor="middle" className="om-axis">
                {tick > 0 ? `+${tick}` : tick === 0 ? '0' : `−${Math.abs(tick)}`}
              </text>
            </g>
          ))}
          <line x1={HP.left} x2={HW - HP.right} y1={HH - HP.bottom} y2={HH - HP.bottom} className="om-base" />

          {bins.placed.map(({ bin, level, trial }, index) => {
            const isBest = trial === best;
            const height = isBest ? bestH : Math.max(1, cellH - 1);
            return (
              <rect
                key={index}
                x={HP.left + bin * cellW + 0.5}
                y={HH - HP.bottom - level * cellH - height - 0.5}
                width={Math.max(1, cellW - 1)}
                height={height}
                className={isBest ? 'om-cell om-cell--best' : trial.is > 0 ? 'om-cell om-cell--pos' : 'om-cell'}
              />
            );
          })}

          {trials.length > 1 && (
            <g className="om-luck">
              <line x1={xOfSharpe(luck)} x2={xOfSharpe(luck)} y1={HP.top - 4} y2={HH - HP.bottom} />
              <text x={xOfSharpe(luck) + (luck > 0.6 ? -5 : 5)} y={HP.top - 10} textAnchor={luck > 0.6 ? 'end' : 'start'}>
                EXPECTED BEST FROM PURE LUCK
              </text>
            </g>
          )}

          {best &&
            (() => {
              const cell = bins.placed[bins.placed.length - 1];
              const cx = HP.left + cell.bin * cellW + cellW / 2;
              const tip = Math.max(HP.top + 22, HH - HP.bottom - cell.level * cellH - bestH - 4);
              const right = cx > HW * 0.6;
              return (
                <g className="om-best">
                  <path d={`M ${cx} ${tip} l -5 -7 h 10 Z`} />
                  <text x={cx + (right ? 6 : -6)} y={tip - 11} textAnchor={right ? 'end' : 'start'}>
                    BEST IN-SAMPLE
                  </text>
                </g>
              );
            })()}

          {trials.length === 0 && (
            <text x={HW / 2} y={HH / 2} textAnchor="middle" className="om-empty">
              PICK A NUMBER OF VARIANTS, THEN RUN
            </text>
          )}
        </svg>
      </div>

      {curve && best && (
        <div className="om-panel om-reveal">
          <div className="om-panel__head">
            <span>THE WINNER: {ruleLabel(best.rule)}</span>
            <em>
              IN-SAMPLE SHARPE <b className="om-g">{num(best.is)}</b> → OUT-OF-SAMPLE <b className={best.oos > 0.3 ? 'om-g' : 'om-r'}>{num(best.oos)}</b>
            </em>
          </div>
          <svg viewBox={`0 0 ${EW} ${EH}`} className="om-chart" role="img" aria-label="Equity curve of the best in-sample strategy across the in-sample and out-of-sample periods.">
            <rect x={curve.splitX} y={EP.top} width={EW - EP.right - curve.splitX} height={EH - EP.top - EP.bottom} className="om-oos-zone" />
            <text x={curve.splitX + 6} y={EH - EP.bottom - 8} className="om-oos-label">
              OUT OF SAMPLE
            </text>
            <text x={EP.left + 6} y={EP.top + 12} className="om-is-label">
              IN SAMPLE · WHERE IT WAS PICKED
            </text>
            {curve.ticks.map((tick) => (
              <g key={tick.v}>
                <line x1={EP.left} x2={EW - EP.right} y1={tick.y} y2={tick.y} className={tick.v === 1 ? 'om-zero' : 'om-gridline'} />
                <text x={EP.left - 6} y={tick.y + 3} textAnchor="end" className="om-axis">
                  {tick.v.toFixed(2)}×
                </text>
              </g>
            ))}
            <path d={curve.isPath} className="om-line om-line--is" pathLength={1} />
            <path d={curve.oosPath} className="om-line om-line--oos" pathLength={1} />
          </svg>
          <div className="om-growth">
            <span>
              IN SAMPLE <b className={curve.isGrowth >= 0 ? 'om-g' : 'om-r'}>{curve.isGrowth >= 0 ? '+' : '−'}{Math.abs(curve.isGrowth * 100).toFixed(0)}%</b>
            </span>
            <span>
              OUT OF SAMPLE <b className={curve.oosGrowth > 0.05 ? 'om-g' : 'om-r'}>{curve.oosGrowth >= 0 ? '+' : '−'}{Math.abs(curve.oosGrowth * 100).toFixed(0)}%</b>
            </span>
          </div>
        </div>
      )}

      <p className="om-verdict" aria-live="polite">
        {verdict() ?? (
          <>
            The more rules you try, the better the best one looks, even when none of them work. The cyan line shows how
            good the luckiest of N useless strategies should look by chance. Bailey and López de Prado’s fix for this is
            the{' '}
            <b>Deflated Sharpe Ratio</b>.
          </>
        )}
      </p>

      <div className="om-instead">
        <span>WHAT TO DO INSTEAD</span>
        <em>Write the hypothesis first</em>
        <em>Report how many variants you tried</em>
        <em>Show that nearby parameter values work too</em>
      </div>

      <style>{`
        .om {
          font-family: 'Space Mono', monospace;
          border: 1px solid #1d4f83;
          background: linear-gradient(180deg, rgba(7, 13, 26, 0.96), rgba(4, 8, 18, 0.98));
          box-shadow: 0 0 0 3px rgba(5, 11, 23, 0.98), 0 0 36px rgba(4, 74, 148, 0.16);
          padding: 18px;
        }

        @media (max-width: 480px) {
          .om { padding: 12px; }
        }

        .om-top {
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

        .om-top em {
          font-style: normal;
          font-size: 9px;
          letter-spacing: 1.4px;
          color: #ffb84d;
        }

        .om-controls {
          display: flex;
          flex-wrap: wrap;
          gap: 10px 18px;
          margin-bottom: 14px;
        }

        .om-group {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px;
        }

        .om-group > span {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.2px;
          color: #5f7390;
        }

        .om-btn {
          padding: 6px 10px;
          border: 1px solid #294f7d;
          background: #07101d;
          color: #9cc9ff;
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1px;
          transition: border-color 150ms ease, background 150ms ease, color 150ms ease, box-shadow 150ms ease;
        }

        .om-btn:hover:not(:disabled) { border-color: #63f6ff; color: #fff; }
        .om-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .om-btn--on { border-color: #33d17a; background: #33d17a; color: #02040a; }
        .om-btn--on:hover:not(:disabled) { color: #02040a; }
        .om-btn--main {
          border-color: #FA4616;
          background: rgba(250, 70, 22, 0.18);
          color: #fff;
          box-shadow: 3px 3px 0 #044a94;
        }
        .om-btn--main:hover:not(:disabled) { border-color: #FA4616; box-shadow: 3px 3px 0 #044a94, 0 0 16px rgba(250, 70, 22, 0.4); }

        .om-readouts {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
          margin-bottom: 14px;
        }

        @media (min-width: 760px) {
          .om-readouts { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        }

        .om-readouts div {
          padding: 8px 10px;
          border: 1px solid rgba(41, 79, 125, 0.7);
          background: #040913;
        }

        .om-readouts span {
          display: block;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 1.2px;
          color: #5f7390;
        }

        .om-readouts b {
          display: block;
          font-family: 'VT323', monospace;
          font-size: 30px;
          font-weight: 400;
          line-height: 1.05;
          color: #c9d4e4;
        }

        .om .om-g { color: #33d17a; text-shadow: 0 0 10px rgba(51, 209, 122, 0.45); }
        .om .om-r { color: #ff5a6e; text-shadow: 0 0 10px rgba(255, 90, 110, 0.4); }
        .om .om-c { color: #63f6ff; text-shadow: 0 0 10px rgba(99, 246, 255, 0.4); }

        .om-panel { margin-bottom: 14px; }

        .om-panel__head {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          gap: 4px 14px;
          margin-bottom: 6px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.2px;
          color: #9cc9ff;
        }

        .om-panel__head em {
          font-style: normal;
          color: #5f7390;
        }

        .om-panel__head em b { font-weight: 700; }

        .om-chart {
          display: block;
          width: 100%;
          height: auto;
          border: 1px solid rgba(41, 79, 125, 0.6);
          background: #040913;
        }

        .om-gridline { stroke: rgba(88, 140, 210, 0.12); }
        .om-zero { stroke: rgba(201, 212, 228, 0.35); stroke-dasharray: 3 3; }
        .om-base { stroke: rgba(88, 140, 210, 0.35); }
        .om-axis { fill: #5f7390; font-size: 10px; font-family: 'Space Mono', monospace; }
        .om-empty { fill: #5f7390; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; font-family: 'Space Mono', monospace; }

        .om-cell { fill: #294f7d; }
        .om-cell--pos { fill: #3d78b8; }
        .om-cell--best {
          fill: #33d17a;
          filter: drop-shadow(0 0 4px #33d17a);
          animation: omPulse 1.2s ease-in-out infinite;
        }

        @keyframes omPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.55; }
        }

        .om-luck line { stroke: #63f6ff; stroke-width: 1.5; stroke-dasharray: 5 3; }
        .om-luck text { fill: #63f6ff; font-size: 9px; font-weight: 700; letter-spacing: 1px; font-family: 'Space Mono', monospace; }
        .om-best path { fill: #33d17a; filter: drop-shadow(0 0 4px rgba(51, 209, 122, 0.8)); }
        .om-best text { fill: #33d17a; font-size: 9px; font-weight: 700; letter-spacing: 1px; font-family: 'Space Mono', monospace; paint-order: stroke; stroke: #02040a; stroke-width: 4px; stroke-linejoin: round; }

        .om-reveal { animation: omIn 500ms cubic-bezier(0.16, 1, 0.3, 1) both; }

        @keyframes omIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: none; }
        }

        .om-oos-zone { fill: rgba(255, 184, 77, 0.07); }
        .om-oos-label { fill: #ffb84d; font-size: 9px; font-weight: 700; letter-spacing: 1px; font-family: 'Space Mono', monospace; }
        .om-is-label { fill: rgba(51, 209, 122, 0.75); font-size: 9px; font-weight: 700; letter-spacing: 1px; font-family: 'Space Mono', monospace; }

        .om-line {
          fill: none;
          stroke-width: 2;
          stroke-linejoin: round;
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          animation: omDraw 1.1s ease-out forwards;
        }

        .om-line--is { stroke: #33d17a; filter: drop-shadow(0 0 3px rgba(51, 209, 122, 0.6)); }
        .om-line--oos { stroke: #ffb84d; animation-delay: 1.05s; animation-duration: 0.6s; }

        @keyframes omDraw { to { stroke-dashoffset: 0; } }

        .om-growth {
          display: flex;
          flex-wrap: wrap;
          gap: 6px 18px;
          margin-top: 6px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.2px;
          color: #5f7390;
        }

        .om-growth b {
          margin-left: 4px;
          font-family: 'VT323', monospace;
          font-size: 20px;
          font-weight: 400;
        }

        .om-verdict {
          margin: 0 0 14px;
          padding: 12px 14px;
          border-left: 3px solid #63f6ff;
          background: rgba(99, 246, 255, 0.05);
          font-size: 13px;
          line-height: 1.7;
          color: #d3dcea;
        }

        .om-verdict b { color: #fff; }

        .om-instead {
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          gap: 6px 0;
          padding-top: 12px;
          border-top: 1px dashed rgba(41, 79, 125, 0.7);
          font-size: 11px;
          line-height: 1.6;
        }

        .om-instead span {
          margin-right: 14px;
          font-family: 'Orbitron', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2px;
          color: #33d17a;
        }

        .om-instead em {
          font-style: normal;
          color: #c9d4e4;
        }

        .om-instead em:not(:last-child)::after {
          content: '·';
          margin: 0 9px;
          color: #3b5a82;
        }

        @media (prefers-reduced-motion: reduce) {
          .om-cell--best, .om-reveal { animation: none; }
          .om-line { animation: none; stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}
