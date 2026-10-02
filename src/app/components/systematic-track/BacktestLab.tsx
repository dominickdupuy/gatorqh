import { useMemo, useState } from 'react';
import {
  DAYS,
  START_YEAR,
  holdoutDays,
  makeMarket,
  metrics,
  num,
  pct,
  runBacktest,
  yearlyReturns,
  type Metrics,
  type StrategyParams,
} from './market';

// Time-series momentum on a synthetic market. The out-of-sample years stay
// locked until the visitor evaluates them once, and tuning afterwards is called
// out as a leak, the way a judge would see it.

const SEEDS = [1, 2, 3, 4, 5];
const HOLDOUT = holdoutDays(DAYS);
const SPLIT = DAYS - HOLDOUT;
const PLATEAU_LOOKBACKS = [5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 135, 150, 165, 180, 200, 225, 250];
const SHARPE_RED_FLAG = 3;

const W = 640;
const H = 260;
const PAD = { left: 46, right: 12, top: 16, bottom: 26 };
const STRIDE = 3;

const xOf = (t: number) => PAD.left + (t / (DAYS - 1)) * (W - PAD.left - PAD.right);

const buyHoldEquity = (returns: Float64Array) => {
  const out = new Float64Array(returns.length);
  let eq = 1;
  for (let t = 0; t < returns.length; t += 1) {
    eq *= 1 + returns[t];
    out[t] = eq;
  }
  return out;
};

type Row = { label: string; get: (m: Metrics) => string; key: keyof Metrics };

const ROWS: Row[] = [
  { label: 'ANN. RETURN', key: 'annReturn', get: (m) => pct(m.annReturn) },
  { label: 'VOLATILITY', key: 'annVol', get: (m) => pct(m.annVol) },
  { label: 'SHARPE', key: 'sharpe', get: (m) => num(m.sharpe) },
  { label: 'MAX DRAWDOWN', key: 'maxDrawdown', get: (m) => pct(m.maxDrawdown) },
  { label: 'TURNOVER', key: 'turnover', get: (m) => `${m.turnover.toFixed(1)}×/YR` },
  { label: 'WORST MONTH', key: 'worstMonth', get: (m) => pct(m.worstMonth) },
  { label: 'SKEW', key: 'skew', get: (m) => num(m.skew) },
];

export function BacktestLab() {
  const [seed, setSeed] = useState(1);
  const [lookback, setLookback] = useState(60);
  const [costBps, setCostBps] = useState(5);
  const [doubled, setDoubled] = useState(false);
  const [lag, setLag] = useState<0 | 1>(1);
  const [volTarget, setVolTarget] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [leaked, setLeaked] = useState(false);
  const [peeks, setPeeks] = useState(0);

  const market = useMemo(() => makeMarket(seed), [seed]);
  const buyHold = useMemo(() => buyHoldEquity(market.returns), [market]);

  const cost = costBps * (doubled ? 2 : 1);
  const params: StrategyParams = { lookback, lag, costBps: cost, volTarget };
  const bt = useMemo(() => runBacktest(market.returns, params), [market, lookback, lag, cost, volTarget]); // eslint-disable-line react-hooks/exhaustive-deps
  const baseBt = useMemo(
    () => (doubled ? runBacktest(market.returns, { lookback, lag, costBps, volTarget }) : bt),
    [doubled, market, lookback, lag, costBps, volTarget, bt]
  );

  const inSample = metrics(bt, 0, SPLIT);
  const outSample = metrics(bt, SPLIT);
  const baseIn = metrics(baseBt, 0, SPLIT);
  const baseOut = metrics(baseBt, SPLIT);

  const plateau = useMemo(
    () =>
      PLATEAU_LOOKBACKS.map((value) => ({
        lookback: value,
        sharpe: metrics(runBacktest(market.returns, { lookback: value, lag, costBps: cost, volTarget }), 0, SPLIT).sharpe,
      })),
    [market, lag, cost, volTarget]
  );

  const years = useMemo(() => yearlyReturns(bt.net, market.years), [bt, market]);

  // Any change to the rule after the out-of-sample years were seen is tuning on them.
  const tune = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    if (revealed) setLeaked(true);
  };

  const changeSeed = (value: number) => {
    setSeed(value);
    setRevealed(false);
    setLeaked(false);
    setPeeks(0);
  };

  const evaluate = () => {
    setRevealed(true);
    setPeeks((value) => value + 1);
  };

  const relock = () => {
    setRevealed(false);
    setLeaked(false);
  };

  // Chart: log-scaled equity. Only the in-sample years are drawn until evaluated.
  const end = revealed ? DAYS : SPLIT;
  let lo = Infinity;
  let hi = -Infinity;
  for (let t = 0; t < end; t += 1) {
    for (const v of [bt.equity[t], bt.grossEquity[t], buyHold[t]]) {
      if (v < lo) lo = v;
      if (v > hi) hi = v;
    }
  }
  const logLo = Math.log(lo * 0.94);
  const logHi = Math.log(hi * 1.06);
  const yOf = (value: number) => PAD.top + ((logHi - Math.log(value)) / (logHi - logLo || 1)) * (H - PAD.top - PAD.bottom);

  const path = (series: Float64Array) => {
    let d = '';
    for (let t = 0; t < end; t += STRIDE) d += `${t === 0 ? 'M' : 'L'} ${xOf(t).toFixed(1)} ${yOf(series[t]).toFixed(1)} `;
    const last = end - 1;
    d += `L ${xOf(last).toFixed(1)} ${yOf(series[last]).toFixed(1)}`;
    return d;
  };

  const gridValues = (() => {
    const out: number[] = [];
    for (const v of [0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4, 6, 8, 12, 16]) if (v >= lo * 0.94 && v <= hi * 1.06) out.push(v);
    return out;
  })();

  const yearTicks = Array.from({ length: 7 }, (_, k) => k * 2);

  // Plateau chart geometry.
  const PW = 300;
  const PH = 120;
  const PP = { left: 30, right: 8, top: 12, bottom: 20 };
  const pX = (value: number) => PP.left + ((value - 5) / 245) * (PW - PP.left - PP.right);
  const sharpes = plateau.map((p) => p.sharpe).concat(inSample.sharpe, 0);
  const pLo = Math.min(...sharpes) - 0.2;
  const pHi = Math.max(...sharpes) + 0.2;
  const pY = (value: number) => PP.top + ((pHi - value) / (pHi - pLo || 1)) * (PH - PP.top - PP.bottom);
  const plateauPath = plateau.map((p, k) => `${k === 0 ? 'M' : 'L'} ${pX(p.lookback).toFixed(1)} ${pY(p.sharpe).toFixed(1)}`).join(' ');
  const plateauBest = plateau.reduce((best, p) => (p.sharpe > best.sharpe ? p : best), plateau[0]);
  const nearby = plateau.filter((p) => Math.abs(p.lookback - lookback) <= Math.max(15, lookback * 0.3));
  const stable = nearby.length > 1 && Math.max(...nearby.map((p) => p.sharpe)) - Math.min(...nearby.map((p) => p.sharpe)) < 0.35;

  const maxYear = Math.max(0.05, ...years.map((y) => Math.abs(y.ret)));

  const rule = `Each day: if the last ${lookback} days’ return is above zero, hold long, otherwise short.${volTarget ? ' Scale the position to target 12% volatility.' : ''} ${lag === 1 ? 'Trade at the next bar.' : 'Trade on the same bar the signal used.'}`;

  const sharpeCell = (m: Metrics, base: Metrics) => (
    <>
      <span className={m.sharpe > SHARPE_RED_FLAG ? 'bl-flag' : ''}>{num(m.sharpe)}</span>
      {doubled && <em className="bl-delta">{num(m.sharpe - base.sharpe)} VS 1×</em>}
      {m.sharpe > SHARPE_RED_FLAG && <em className="bl-flag-note">RED FLAG: INVESTIGATE</em>}
    </>
  );

  return (
    <div className="bl">
      <div className="bl-top">
        <span>BACKTEST LAB · TIME-SERIES MOMENTUM</span>
        <em>SYNTHETIC MARKET · ILLUSTRATIVE ONLY</em>
      </div>

      <div className="bl-controls">
        <div className="bl-group" role="group" aria-label="Market history">
          <span>MARKET</span>
          {SEEDS.map((value) => (
            <button
              key={value}
              type="button"
              className={`bl-btn ${seed === value ? 'bl-btn--on' : ''}`}
              onClick={() => changeSeed(value)}
              aria-pressed={seed === value}
            >
              {value}
            </button>
          ))}
        </div>

        <label className="bl-slider">
          <span>
            LOOKBACK <b>{lookback}</b> BARS
          </span>
          <input
            type="range"
            min={5}
            max={250}
            step={5}
            value={lookback}
            onChange={(event) => tune(setLookback)(Number(event.target.value))}
          />
        </label>

        <label className="bl-slider">
          <span>
            COST <b>{costBps}</b> BPS / TRADE{doubled && <i> → {cost} BPS</i>}
          </span>
          <input type="range" min={0} max={30} step={1} value={costBps} onChange={(event) => setCostBps(Number(event.target.value))} />
        </label>

        <div className="bl-group">
          <button
            type="button"
            className={`bl-btn ${doubled ? 'bl-btn--amber' : ''}`}
            onClick={() => setDoubled((value) => !value)}
            aria-pressed={doubled}
          >
            COSTS ×2 {doubled ? 'ON' : 'OFF'}
          </button>
        </div>

        <div className="bl-group" role="group" aria-label="Signal timing">
          <span>SIGNAL</span>
          <button type="button" className={`bl-btn ${lag === 1 ? 'bl-btn--green' : ''}`} onClick={() => tune(setLag)(1)} aria-pressed={lag === 1}>
            LAG 1 BAR ✓
          </button>
          <button type="button" className={`bl-btn ${lag === 0 ? 'bl-btn--red' : ''}`} onClick={() => tune(setLag)(0)} aria-pressed={lag === 0}>
            SAME BAR ✗ (LOOKAHEAD)
          </button>
        </div>

        <div className="bl-group" role="group" aria-label="Position sizing">
          <span>SIZING</span>
          <button type="button" className={`bl-btn ${!volTarget ? 'bl-btn--on' : ''}`} onClick={() => tune(setVolTarget)(false)} aria-pressed={!volTarget}>
            SIGN ±1
          </button>
          <button type="button" className={`bl-btn ${volTarget ? 'bl-btn--on' : ''}`} onClick={() => tune(setVolTarget)(true)} aria-pressed={volTarget}>
            VOL TARGET
          </button>
        </div>
      </div>

      <p className="bl-rule">
        <span>RULE</span>
        {rule}
      </p>

      {lag === 0 && (
        <div className="bl-alert" role="alert">
          <b>LOOKAHEAD BIAS</b>
          <span>
            The signal now uses today’s return and also trades on it. You can’t know a bar’s close before it closes, so
            this backtest is using information it wouldn’t have had. The Sharpe goes up even though the strategy is the
            same.
          </span>
        </div>
      )}

      <div className="bl-grid">
        <div className="bl-main">
          <div className="bl-legend">
            <span><i className="bl-key bl-key--net" /> NET OF COSTS</span>
            <span><i className="bl-key bl-key--gross" /> GROSS</span>
            <span><i className="bl-key bl-key--bh" /> BUY &amp; HOLD</span>
            <span className="bl-legend__scale">LOG SCALE · GROWTH OF $1</span>
          </div>

          <div className="bl-chart-wrap">
            <svg viewBox={`0 0 ${W} ${H}`} className="bl-chart" role="img" aria-label={`Equity curve for a ${lookback}-bar momentum rule${revealed ? ', including out-of-sample years' : ', in-sample years only'}.`}>
              {gridValues.map((value) => (
                <g key={value}>
                  <line x1={PAD.left} x2={W - PAD.right} y1={yOf(value)} y2={yOf(value)} className={value === 1 ? 'bl-grid-one' : 'bl-gridline'} />
                  <text x={PAD.left - 6} y={yOf(value) + 3} textAnchor="end" className="bl-axis">
                    ${value}
                  </text>
                </g>
              ))}
              {yearTicks.map((k) => (
                <text key={k} x={xOf(k * 252)} y={H - 8} textAnchor="middle" className="bl-axis">
                  {START_YEAR + k}
                </text>
              ))}

              <rect
                x={xOf(SPLIT)}
                y={PAD.top}
                width={W - PAD.right - xOf(SPLIT)}
                height={H - PAD.top - PAD.bottom}
                className={revealed ? 'bl-oos' : 'bl-oos bl-oos--locked'}
              />
              <line x1={xOf(SPLIT)} x2={xOf(SPLIT)} y1={PAD.top} y2={H - PAD.bottom} className="bl-split" />
              <text x={xOf(SPLIT) - 5} y={PAD.top + 11} textAnchor="end" className="bl-zone bl-zone--is">
                IN-SAMPLE
              </text>

              <path d={path(buyHold)} className="bl-line bl-line--bh" />
              <path d={path(bt.grossEquity)} className="bl-line bl-line--gross" />
              <path d={path(bt.equity)} className="bl-line bl-line--net" />
            </svg>

            <div className="bl-oos-panel" style={{ left: `${(xOf(SPLIT) / W) * 100}%`, right: `${(PAD.right / W) * 100}%` }}>
              {revealed ? (
                <span className="bl-oos-tag">OUT-OF-SAMPLE · EVALUATED</span>
              ) : (
                <div className="bl-lock">
                  <span>OUT-OF-SAMPLE · LOCKED</span>
                  <em>LAST {HOLDOUT} BARS</em>
                  <button type="button" className="bl-btn bl-btn--eval" onClick={evaluate}>
                    EVALUATE ONCE ▸
                  </button>
                </div>
              )}
            </div>
          </div>

          {leaked && (
            <div className="bl-leak" role="alert">
              <div className="bl-leak__stamp">TEST SET LEAKED</div>
              <p>
                You changed the rule after seeing the out-of-sample years. That is tuning on the test set, and those
                results now overstate what the strategy would do on data it hasn’t seen. Judges cap criterion 5 at 4 for
                this.
              </p>
              <div className="bl-leak__foot">
                <span>PEEKS: {peeks}</span>
                <button type="button" className="bl-btn bl-btn--amber" onClick={relock}>
                  ↺ RELOCK &amp; START OVER
                </button>
              </div>
              {peeks > 1 && <em>In real life you can’t un-see a result. Report every peek in your note.</em>}
            </div>
          )}

          <div className="bl-years">
            <div className="bl-sub">
              <span>BY YEAR · NET RETURN</span>
              <em>WHERE DID THE PROFIT COME FROM?</em>
            </div>
            <div className="bl-years__bars">
              {years.map((y) => {
                const oos = (y.year - START_YEAR) * 252 >= SPLIT;
                const hidden = oos && !revealed;
                const h = (Math.abs(y.ret) / maxYear) * 100;
                return (
                  <div key={y.year} className={`bl-year ${oos ? 'bl-year--oos' : ''}`} title={hidden ? `${y.year}: locked` : `${y.year}: ${pct(y.ret)}`}>
                    <div className="bl-year__plot">
                      {hidden ? (
                        <span className="bl-year__lock">?</span>
                      ) : (
                        <i
                          className={y.ret >= 0 ? 'bl-year__bar--up' : 'bl-year__bar--down'}
                          style={{ height: `${h / 2}%`, [y.ret >= 0 ? 'bottom' : 'top']: '50%' }}
                        />
                      )}
                    </div>
                    <b>{hidden ? '··' : pct(y.ret, 0)}</b>
                    <span>’{String(y.year).slice(2)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bl-side">
          <table className="bl-metrics">
            <thead>
              <tr>
                <th />
                <th>IN-SAMPLE</th>
                <th className="bl-metrics__oos">OUT-OF-SAMPLE</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.key}>
                  <th>{row.label}</th>
                  <td>{row.key === 'sharpe' ? sharpeCell(inSample, baseIn) : row.get(inSample)}</td>
                  <td className="bl-metrics__oos">
                    {revealed ? (row.key === 'sharpe' ? sharpeCell(outSample, baseOut) : row.get(outSample)) : <span className="bl-locked">LOCKED</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="bl-verdict" aria-live="polite">
            {lag === 0
              ? 'These numbers include lookahead. None of them are real.'
              : !revealed
                ? `In-sample Sharpe ${num(inSample.sharpe)} net of ${cost} bps. Settle the rule, then evaluate the held-out years once.`
                : leaked
                  ? 'The out-of-sample column is no longer out-of-sample.'
                  : outSample.sharpe < inSample.sharpe - 0.5
                    ? 'Out-of-sample came in well below in-sample. Report it anyway. Judges want to see that.'
                    : 'Out-of-sample held up. Check the by-year bars to make sure it isn’t all from one good period.'}
          </div>

          <div className="bl-plateau">
            <div className="bl-sub">
              <span>PLATEAU · IN-SAMPLE SHARPE BY LOOKBACK</span>
            </div>
            <svg viewBox={`0 0 ${PW} ${PH}`} className="bl-plateau__chart" role="img" aria-label="In-sample Sharpe ratio across lookbacks from 5 to 250 bars.">
              <line x1={PP.left} x2={PW - PP.right} y1={pY(0)} y2={pY(0)} className="bl-grid-one" />
              {[pLo + 0.2, 0, pHi - 0.2].map((v, k) => (
                <text key={k} x={PP.left - 4} y={pY(v) + 3} textAnchor="end" className="bl-axis">
                  {v.toFixed(1)}
                </text>
              ))}
              {[5, 60, 120, 180, 250].map((v) => (
                <text key={v} x={pX(v)} y={PH - 6} textAnchor="middle" className="bl-axis">
                  {v}
                </text>
              ))}
              <path d={plateauPath} className="bl-plateau__line" />
              {plateau.map((p) => (
                <circle key={p.lookback} cx={pX(p.lookback)} cy={pY(p.sharpe)} r={2} className="bl-plateau__dot" />
              ))}
              <line x1={pX(lookback)} x2={pX(lookback)} y1={PP.top} y2={PH - PP.bottom} className="bl-plateau__cursor" />
              <circle cx={pX(lookback)} cy={pY(inSample.sharpe)} r={4.5} className="bl-plateau__now" />
            </svg>
            <p>
              {stable
                ? `Lookbacks near ${lookback} score about the same, which makes this result easier to believe.`
                : `Sharpe moves a lot around ${lookback}. If you picked this value because it scored best, expect it to do worse out of sample.`}{' '}
              Best in-sample: {plateauBest.lookback} bars ({num(plateauBest.sharpe)}). Choosing it after looking is one more trial to
              disclose.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .bl {
          font-family: 'Space Mono', monospace;
          border: 1px solid #1d4f83;
          background: linear-gradient(180deg, rgba(7, 13, 26, 0.96), rgba(4, 8, 18, 0.98));
          box-shadow: 0 0 0 3px rgba(5, 11, 23, 0.98), 0 0 36px rgba(51, 209, 122, 0.12);
          padding: 18px;
          color: #F4F4F4;
        }

        @media (max-width: 520px) {
          .bl { padding: 12px; }
        }

        .bl-top {
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

        .bl-top em {
          font-style: normal;
          font-size: 9px;
          letter-spacing: 1.4px;
          color: #ffb84d;
        }

        .bl-controls {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 12px 20px;
          margin-bottom: 12px;
        }

        .bl-group {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px;
        }

        .bl-group > span,
        .bl-slider > span {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.2px;
          color: #5f7390;
        }

        .bl-slider {
          display: grid;
          gap: 4px;
          min-width: 180px;
          flex: 1 1 180px;
          max-width: 280px;
        }

        .bl-slider b {
          font-family: 'VT323', monospace;
          font-size: 20px;
          font-weight: 400;
          color: #33d17a;
        }

        .bl-slider i { font-style: normal; color: #ffb84d; }

        .bl-slider input {
          width: 100%;
          accent-color: #33d17a;
        }

        .bl-btn {
          padding: 6px 10px;
          border: 1px solid #294f7d;
          background: #07101d;
          color: #9cc9ff;
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1px;
          transition: border-color 150ms ease, background 150ms ease, color 150ms ease;
        }

        .bl-btn:hover { border-color: #63f6ff; color: #fff; }
        .bl-btn--on { border-color: #63f6ff; background: #63f6ff; color: #02040a; }
        .bl-btn--on:hover { color: #02040a; }
        .bl-btn--amber { border-color: #ffb84d; background: rgba(255, 184, 77, 0.16); color: #ffd27a; }
        .bl-btn--green { border-color: #33d17a; background: #33d17a; color: #02040a; }
        .bl-btn--green:hover { color: #02040a; }
        .bl-btn--red { border-color: #ff5a6e; background: #ff5a6e; color: #02040a; }
        .bl-btn--red:hover { color: #02040a; }

        .bl-btn--eval {
          border-color: #ffb84d;
          background: rgba(255, 184, 77, 0.14);
          color: #ffd27a;
          box-shadow: 0 0 18px rgba(255, 184, 77, 0.2);
        }

        .bl-btn--eval:hover { background: #ffb84d; color: #02040a; }

        .bl-rule {
          display: flex;
          flex-wrap: wrap;
          gap: 4px 12px;
          margin: 0 0 12px;
          padding: 8px 12px;
          border-left: 3px solid #33d17a;
          background: rgba(51, 209, 122, 0.06);
          font-size: 12px;
          line-height: 1.6;
          color: #c9d4e4;
        }

        .bl-rule span {
          font-family: 'Orbitron', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2px;
          color: #33d17a;
        }

        .bl-alert {
          display: grid;
          gap: 4px;
          margin-bottom: 12px;
          padding: 10px 12px;
          border: 1px solid #ff5a6e;
          border-left-width: 3px;
          background: rgba(255, 59, 92, 0.08);
          font-size: 12px;
          line-height: 1.6;
          color: #ffd0d6;
        }

        .bl-alert b {
          font-family: 'Orbitron', sans-serif;
          font-size: 10px;
          letter-spacing: 2px;
          color: #ff5a6e;
        }

        .bl-grid {
          display: grid;
          gap: 16px;
        }

        @media (min-width: 1000px) {
          .bl-grid { grid-template-columns: minmax(0, 1.55fr) minmax(0, 1fr); }
        }

        .bl-main, .bl-side { min-width: 0; }

        .bl-side {
          display: grid;
          gap: 12px;
          align-content: start;
        }

        .bl-legend {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px 14px;
          margin-bottom: 6px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1px;
          color: #7e90ab;
        }

        .bl-legend span { display: inline-flex; align-items: center; gap: 6px; }
        .bl-legend__scale { margin-left: auto; color: #5f7390; }

        .bl-key { display: inline-block; width: 18px; height: 0; border-top: 2px solid; }
        .bl-key--net { border-color: #33d17a; }
        .bl-key--gross { border-color: rgba(51, 209, 122, 0.45); border-top-style: dashed; }
        .bl-key--bh { border-color: #5f7390; border-top-width: 1px; }

        .bl-chart-wrap { position: relative; }

        .bl-chart {
          display: block;
          width: 100%;
          height: auto;
          border: 1px solid rgba(41, 79, 125, 0.6);
          background: #040913;
        }

        .bl-gridline { stroke: rgba(88, 140, 210, 0.12); }
        .bl-grid-one { stroke: rgba(156, 201, 255, 0.3); stroke-dasharray: 2 3; }
        .bl-axis { fill: #5f7390; font-size: 9px; font-family: 'Space Mono', monospace; }

        .bl-oos { fill: rgba(255, 184, 77, 0.07); }
        .bl-oos--locked { fill: rgba(255, 184, 77, 0.1); }
        .bl-split { stroke: #ffb84d; stroke-dasharray: 4 4; }
        .bl-zone { font-size: 9px; font-weight: 700; letter-spacing: 1px; font-family: 'Space Mono', monospace; }
        .bl-zone--is { fill: rgba(156, 201, 255, 0.55); }

        .bl-line { fill: none; stroke-linejoin: round; }
        .bl-line--net { stroke: #33d17a; stroke-width: 2; filter: drop-shadow(0 0 3px rgba(51, 209, 122, 0.5)); }
        .bl-line--gross { stroke: rgba(51, 209, 122, 0.45); stroke-width: 1.3; stroke-dasharray: 5 4; }
        .bl-line--bh { stroke: #5f7390; stroke-width: 1; }

        .bl-oos-panel {
          position: absolute;
          top: 1px;
          bottom: 1px;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }

        .bl-lock {
          display: grid;
          justify-items: center;
          gap: 6px;
          padding: 8px 6px;
          text-align: center;
          pointer-events: auto;
        }

        .bl-lock span {
          font-family: 'Orbitron', sans-serif;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.4px;
          line-height: 1.5;
          color: #ffb84d;
        }

        .bl-lock em {
          font-style: normal;
          font-size: 8px;
          letter-spacing: 1px;
          color: #a58a5c;
        }

        .bl-oos-tag {
          position: absolute;
          top: 6px;
          left: 6px;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 1px;
          color: #ffb84d;
        }

        @media (max-width: 560px) {
          .bl-lock span, .bl-lock em { display: none; }
          .bl-lock .bl-btn { padding: 5px 4px; font-size: 8px; letter-spacing: 0; }
          .bl-oos-tag { display: none; }
        }

        .bl-leak {
          position: relative;
          margin-top: 12px;
          padding: 14px 14px 12px;
          border: 2px solid #ff5a6e;
          background: repeating-linear-gradient(135deg, rgba(255, 90, 110, 0.07) 0 10px, rgba(255, 184, 77, 0.04) 10px 20px);
          animation: blIn 260ms ease-out;
        }

        .bl-leak__stamp {
          display: inline-block;
          margin-bottom: 8px;
          padding: 4px 10px;
          border: 2px solid #ff5a6e;
          font-family: 'Press Start 2P', monospace;
          font-size: 11px;
          color: #ff5a6e;
          transform: rotate(-2deg);
          text-shadow: 0 0 10px rgba(255, 90, 110, 0.5);
        }

        .bl-leak p {
          margin: 0 0 10px;
          font-size: 12px;
          line-height: 1.65;
          color: #ffd0d6;
        }

        .bl-leak__foot {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .bl-leak__foot span {
          font-family: 'VT323', monospace;
          font-size: 20px;
          color: #ffb84d;
        }

        .bl-leak em {
          display: block;
          margin-top: 8px;
          font-style: normal;
          font-size: 11px;
          color: #ffd27a;
        }

        @keyframes blIn {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: none; }
        }

        .bl-sub {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          gap: 2px 10px;
          margin-bottom: 8px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.2px;
          color: #fff;
        }

        .bl-sub em { font-style: normal; color: #5f7390; }

        .bl-years {
          margin-top: 14px;
          padding: 10px;
          border: 1px solid rgba(41, 79, 125, 0.7);
          background: rgba(4, 9, 19, 0.9);
        }

        .bl-years__bars {
          display: grid;
          grid-template-columns: repeat(12, minmax(0, 1fr));
          gap: 3px;
        }

        .bl-year {
          display: grid;
          justify-items: center;
          gap: 3px;
          min-width: 0;
        }

        .bl-year__plot {
          position: relative;
          width: 100%;
          height: 64px;
          border-bottom: 1px solid transparent;
          background: linear-gradient(180deg, transparent calc(50% - 0.5px), rgba(156, 201, 255, 0.25) calc(50% - 0.5px), rgba(156, 201, 255, 0.25) calc(50% + 0.5px), transparent calc(50% + 0.5px));
        }

        .bl-year__plot i {
          position: absolute;
          left: 18%;
          right: 18%;
          transition: height 300ms ease;
        }

        .bl-year__bar--up { background: #33d17a; box-shadow: 0 0 6px rgba(51, 209, 122, 0.5); }
        .bl-year__bar--down { background: #ff5a6e; box-shadow: 0 0 6px rgba(255, 90, 110, 0.5); }

        .bl-year--oos .bl-year__plot { outline: 1px dashed rgba(255, 184, 77, 0.7); background-color: rgba(255, 184, 77, 0.05); }

        .bl-year__lock {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          font-family: 'Press Start 2P', monospace;
          font-size: 10px;
          color: #ffb84d;
        }

        .bl-year b {
          font-family: 'VT323', monospace;
          font-size: 14px;
          font-weight: 400;
          line-height: 1;
          color: #c9d4e4;
          white-space: nowrap;
        }

        .bl-year span { font-size: 8px; color: #5f7390; }

        @media (max-width: 520px) {
          .bl-year b { font-size: 11px; }
          .bl-year__plot { height: 48px; }
        }

        .bl-metrics {
          width: 100%;
          border-collapse: collapse;
          border: 1px solid rgba(41, 79, 125, 0.7);
          background: rgba(4, 9, 19, 0.9);
          table-layout: fixed;
        }

        .bl-metrics th,
        .bl-metrics td {
          padding: 6px 8px;
          border-bottom: 1px solid rgba(41, 79, 125, 0.35);
          text-align: right;
          vertical-align: top;
        }

        .bl-metrics thead th {
          font-family: 'Orbitron', sans-serif;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 1.2px;
          color: #9cc9ff;
        }

        .bl-metrics thead th.bl-metrics__oos { color: #ffb84d; }

        .bl-metrics tbody th {
          text-align: left;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1px;
          color: #5f7390;
        }

        .bl-metrics td {
          font-family: 'VT323', monospace;
          font-size: 19px;
          line-height: 1.05;
          color: #fff;
        }

        .bl-metrics td.bl-metrics__oos { background: rgba(255, 184, 77, 0.04); }

        .bl-locked {
          font-family: 'Space Mono', monospace;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1px;
          color: #a58a5c;
        }

        .bl-delta,
        .bl-flag-note {
          display: block;
          font-family: 'Space Mono', monospace;
          font-style: normal;
          font-size: 8px;
          letter-spacing: 0.6px;
          color: #ffb84d;
        }

        .bl-flag { color: #ff5a6e; text-shadow: 0 0 8px rgba(255, 90, 110, 0.6); }
        .bl-flag-note { color: #ff5a6e; }

        .bl-verdict {
          padding: 10px 12px;
          border-left: 3px solid #ffb84d;
          background: rgba(255, 184, 77, 0.06);
          font-size: 12px;
          line-height: 1.6;
          color: #d3dcea;
        }

        .bl-plateau {
          padding: 10px;
          border: 1px solid rgba(41, 79, 125, 0.7);
          background: rgba(4, 9, 19, 0.9);
        }

        .bl-plateau__chart {
          display: block;
          width: 100%;
          height: auto;
          background: #040913;
        }

        .bl-plateau__line { fill: none; stroke: #9cc9ff; stroke-width: 1.5; }
        .bl-plateau__dot { fill: #9cc9ff; }
        .bl-plateau__cursor { stroke: rgba(51, 209, 122, 0.5); stroke-dasharray: 3 3; }
        .bl-plateau__now { fill: #33d17a; filter: drop-shadow(0 0 4px #33d17a); }

        .bl-plateau p {
          margin: 8px 0 0;
          font-size: 11px;
          line-height: 1.6;
          color: #a7b4c9;
        }

        @media (prefers-reduced-motion: reduce) {
          .bl-leak { animation: none; }
          .bl-year__plot i { transition: none; }
        }
      `}</style>
    </div>
  );
}
