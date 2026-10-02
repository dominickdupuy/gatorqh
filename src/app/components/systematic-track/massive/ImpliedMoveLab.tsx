import { useMemo, useState, type ChangeEvent } from 'react';

// "The one number that matters": the implied move is what the at-the-money
// straddle cost on the pre-event session, divided by spot. Buying options wins
// when the realized move beats it; selling options wins when it does not.
// The second half models the volatility trap with Black-Scholes.

const W = 640;
const H = 118;
const PAD = { left: 16, right: 16 };
const AXIS_Y = 70;
const RANGE = 0.3;

// Abramowitz & Stegun 7.1.26, accurate to about 1e-7: plenty for a teaching chart.
const normCdf = (x: number) => {
  const t = 1 / (1 + 0.3275911 * Math.abs(x) / Math.SQRT2);
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-(x * x) / 2);
  return x >= 0 ? 0.5 * (1 + y) : 0.5 * (1 - y);
};

// Zero rates and no dividends keep the lesson about volatility, not carry.
const bsCall = (S: number, K: number, T: number, vol: number) => {
  if (T <= 0 || vol <= 0) return Math.max(0, S - K);
  const sd = vol * Math.sqrt(T);
  const d1 = (Math.log(S / K) + 0.5 * sd * sd) / sd;
  return S * normCdf(d1) - K * normCdf(d1 - sd);
};

const bsStraddle = (S: number, K: number, T: number, vol: number) => {
  const call = bsCall(S, K, T, vol);
  return call + (call - S + K);
};

// The implied volatility that makes the model straddle cost what the chain charged.
const solveVol = (S: number, T: number, target: number) => {
  let lo = 0.001;
  let hi = 5;
  for (let k = 0; k < 80; k += 1) {
    const mid = (lo + hi) / 2;
    if (bsStraddle(S, S, T, mid) > target) hi = mid;
    else lo = mid;
  }
  return (lo + hi) / 2;
};

const signed = (value: number, digits = 2) => `${value >= 0 ? '+' : '−'}${Math.abs(value).toFixed(digits)}`;
const pctSigned = (value: number, digits = 1) => `${signed(value * 100, digits)}%`;
const money = (value: number) => `${value >= 0 ? '+' : '−'}$${Math.abs(value).toFixed(2)}`;

const IV_SIDES = [
  { name: '1 · Long call', side: 'HURT', tone: 'red', note: 'The option gives back in IV what it gained in direction.' },
  { name: '2 · Covered call', side: 'PAID', tone: 'green', note: 'You sold the call, so the collapse is your profit.' },
  { name: '3 · Protective put', side: 'HURT', tone: 'red', note: 'On the hedge leg. A bought put wants IV to rise.' },
  { name: '4 · Collar', side: 'NEUTRAL', tone: 'cyan', note: 'Roughly, being one bought and one sold option.' },
  { name: '5 · Cash-secured put', side: 'PAID', tone: 'green', note: 'You sold the put, so the collapse is your profit.' },
];

type SliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (value: number) => void;
  tone?: 'amber' | 'violet' | 'red';
};

function Slider({ label, value, min, max, step, display, onChange, tone }: SliderProps) {
  return (
    <label className={`im-slider ${tone ? `im-slider--${tone}` : ''}`}>
      <span>
        {label} <b>{display}</b>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

export function ImpliedMoveLab() {
  const [spot, setSpot] = useState(100);
  const [call, setCall] = useState(3.4);
  const [put, setPut] = useState(3.1);
  const [realized, setRealized] = useState(0.02);
  const [crushOn, setCrushOn] = useState(true);
  const [crush, setCrush] = useState(-0.4);
  const [dte, setDte] = useState(30);

  const implied = (call + put) / spot;
  const ratio = implied > 0 ? Math.abs(realized) / implied : 0;
  const buyersWin = Math.abs(realized) > implied;
  const priced = ratio >= 0.8 && ratio <= 1.25;
  const exitPrice = spot * (1 + realized);

  // Price axis: spot ± 30%, with the implied band drawn around spot.
  const xOf = (price: number) => {
    const t = (price / spot - (1 - RANGE)) / (2 * RANGE);
    return PAD.left + Math.max(0, Math.min(1, t)) * (W - PAD.left - PAD.right);
  };
  const bandLo = xOf(spot * (1 - implied));
  const bandHi = xOf(spot * (1 + implied));
  const exitX = xOf(exitPrice);
  const ticks = [-0.3, -0.2, -0.1, 0, 0.1, 0.2, 0.3];

  const trap = useMemo(() => {
    const T = dte / 365;
    const T1 = Math.max(0, (dte - 1) / 365);
    const preVol = solveVol(spot, T, call + put);
    const postVol = Math.max(0.01, preVol * (1 + (crushOn ? crush : 0)));
    const cost = bsCall(spot, spot, T, preVol);
    const sameVol = bsCall(exitPrice, spot, T1, preVol);
    const after = bsCall(exitPrice, spot, T1, postVol);
    return {
      preVol,
      postVol,
      cost,
      direction: sameVol - cost,
      volatility: after - sameVol,
      total: after - cost,
    };
  }, [call, put, spot, dte, exitPrice, crush, crushOn]);

  const barMax = Math.max(0.5, Math.abs(trap.direction), Math.abs(trap.volatility), Math.abs(trap.total));
  const bar = (value: number) => `${(Math.abs(value) / barMax) * 50}%`;

  const trapVerdict = () => {
    const move = pctSigned(realized);
    if (trap.total < 0 && realized > 0) {
      return (
        <>
          The stock moved <b className="im-g">{move}</b> and the long call still lost <b className="im-r">{money(trap.total)}</b> a share.
          Direction was right; the volatility collapse took more back.
        </>
      );
    }
    if (trap.total < 0) {
      return (
        <>
          The stock moved <b>{move}</b> and the long call lost <b className="im-r">{money(trap.total)}</b> a share.
        </>
      );
    }
    return (
      <>
        The stock moved <b>{move}</b> and the long call made <b className="im-g">{money(trap.total)}</b> a share
        {crushOn && trap.volatility < 0 ? ', after giving back ' : ''}
        {crushOn && trap.volatility < 0 ? <b className="im-r">{money(trap.volatility)}</b> : null}
        {crushOn && trap.volatility < 0 ? ' to the IV collapse' : ''}.
      </>
    );
  };

  return (
    <div className="im">
      <div className="im-top">
        <span>IMPLIED MOVE LAB · WHAT THE CHAIN CHARGED vs WHAT HAPPENED</span>
        <em>ILLUSTRATIVE NUMBERS</em>
      </div>

      <div className="im-step">
        <span className="im-step__n">01</span>
        <div>
          <b>THE PRE-EVENT SESSION, t_pre</b>
          <p>The session before the filing. Its chain cannot know the news, so it is where the implied move is read.</p>
        </div>
      </div>

      <div className="im-controls">
        <Slider label="SPOT" value={spot} min={20} max={500} step={1} display={`$${spot.toFixed(0)}`} onChange={setSpot} />
        <Slider label="ATM CALL" value={call} min={0.1} max={spot * 0.12} step={0.05} display={`$${call.toFixed(2)}`} onChange={(value) => setCall(Math.min(value, spot * 0.12))} />
        <Slider label="ATM PUT" value={put} min={0.1} max={spot * 0.12} step={0.05} display={`$${put.toFixed(2)}`} onChange={(value) => setPut(Math.min(value, spot * 0.12))} />
      </div>

      <div className="im-implied">
        <div className="im-implied__math">
          <span>IMPLIED MOVE = (CALL + PUT) ÷ SPOT</span>
          <code>
            (${call.toFixed(2)} + ${put.toFixed(2)}) ÷ ${spot.toFixed(0)}
          </code>
        </div>
        <strong aria-live="polite">±{(implied * 100).toFixed(1)}%</strong>
      </div>

      <div className="im-step">
        <span className="im-step__n">02</span>
        <div>
          <b>AFTER THE 8-K</b>
          <p>What the stock actually did. Drag it and watch where it lands against the band the chain priced.</p>
        </div>
      </div>

      <div className="im-controls">
        <Slider
          label="REALIZED MOVE"
          value={realized}
          min={-0.25}
          max={0.25}
          step={0.005}
          display={pctSigned(realized)}
          onChange={setRealized}
          tone="violet"
        />
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="im-axis" role="img" aria-label={`Implied range ${(spot * (1 - implied)).toFixed(2)} to ${(spot * (1 + implied)).toFixed(2)}. The stock ended at ${exitPrice.toFixed(2)}.`}>
        <rect x={bandLo} y={AXIS_Y - 26} width={Math.max(1, bandHi - bandLo)} height={36} className="im-band" />
        <text x={(bandLo + bandHi) / 2} y={AXIS_Y - 32} textAnchor="middle" className="im-band-label">
          WHAT THE CHAIN PRICED
        </text>
        <line x1={PAD.left} x2={W - PAD.right} y1={AXIS_Y} y2={AXIS_Y} className="im-line" />
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={xOf(spot * (1 + tick))} x2={xOf(spot * (1 + tick))} y1={AXIS_Y - 4} y2={AXIS_Y + 4} className="im-line" />
            <text x={xOf(spot * (1 + tick))} y={AXIS_Y + 20} textAnchor={tick === -0.3 ? 'start' : tick === 0.3 ? 'end' : 'middle'} className="im-tick">
              {tick === 0 ? `$${spot.toFixed(0)}` : `${tick > 0 ? '+' : '−'}${Math.abs(tick * 100)}%`}
            </text>
          </g>
        ))}
        <line x1={xOf(spot)} x2={xOf(spot)} y1={AXIS_Y - 26} y2={AXIS_Y + 10} className="im-spot" />
        <line x1={xOf(spot)} x2={exitX} y1={AXIS_Y + 34} y2={AXIS_Y + 34} className={`im-path ${buyersWin ? 'im-path--out' : 'im-path--in'}`} />
        <circle cx={exitX} cy={AXIS_Y} r={7} className={buyersWin ? 'im-exit im-exit--out' : 'im-exit im-exit--in'} />
        <text x={exitX} y={AXIS_Y + 46} textAnchor={exitX > W - 80 ? 'end' : exitX < 80 ? 'start' : 'middle'} className="im-exit-label">
          ${exitPrice.toFixed(2)}
        </text>
      </svg>

      <div className={`im-verdict ${buyersWin ? 'im-verdict--buy' : 'im-verdict--sell'}`} aria-live="polite">
        <strong>{buyersWin ? 'BUYERS OF OPTIONS WIN' : 'SELLERS OF OPTIONS WIN'}</strong>
        <p>
          {buyersWin
            ? 'The realized move beat the implied move. The chain under-priced the news, so whoever bought the straddle came out ahead.'
            : 'The realized move fell short of the implied move. The chain over-charged for drama that did not arrive, so whoever sold it kept the difference.'}
        </p>
        <div className="im-ratio">
          <span>|REALIZED| ÷ IMPLIED</span>
          <b>{ratio.toFixed(2)}</b>
          <em>{priced ? 'NEAR 1 · PRICED ABOUT RIGHT' : ratio > 1 ? 'ABOVE 1 · A MOVE THE CHAIN DID NOT SEE' : 'BELOW 1 · THE MARKET OVER-PAID'}</em>
        </div>
      </div>

      <div className="im-trap">
        <div className="im-trap__head">
          <div>
            <span>THE VOLATILITY TRAP</span>
            <p>
              The most common novice result: the stock moved the right way and the long call still lost money. Implied
              volatility collapses the moment the uncertainty resolves.
            </p>
          </div>
          <button type="button" className={`im-btn ${crushOn ? 'im-btn--violet' : ''}`} onClick={() => setCrushOn((value) => !value)} aria-pressed={crushOn}>
            IV CRUSH AFTER THE NEWS {crushOn ? 'ON' : 'OFF'}
          </button>
        </div>

        <div className="im-controls">
          <Slider label="DAYS TO EXPIRY" value={dte} min={7} max={120} step={1} display={`${dte}`} onChange={setDte} />
          <Slider
            label="IV CHANGE AFTER THE NEWS"
            value={crush}
            min={-0.7}
            max={0}
            step={0.05}
            display={crushOn ? `${(crush * 100).toFixed(0)}%` : 'OFF'}
            onChange={setCrush}
            tone="red"
          />
        </div>

        <div className="im-trap__grid">
          <div className="im-split">
            <div className="im-split__head">
              <span>LONG ATM CALL · P&amp;L PER SHARE</span>
              <em>
                IV {(trap.preVol * 100).toFixed(0)}% → {(trap.postVol * 100).toFixed(0)}% · COST ${trap.cost.toFixed(2)}
              </em>
            </div>
            {[
              { label: 'DIRECTION', sub: 'the move, one day of time', value: trap.direction },
              { label: 'VOLATILITY', sub: 'IV falling after the news', value: trap.volatility },
              { label: 'TOTAL', sub: '× 100 per contract', value: trap.total, total: true },
            ].map((row) => (
              <div key={row.label} className={`im-row ${row.total ? 'im-row--total' : ''}`}>
                <div className="im-row__label">
                  <b>{row.label}</b>
                  <small>{row.sub}</small>
                </div>
                <div className="im-row__bar" aria-hidden="true">
                  <i
                    className={row.value >= 0 ? 'im-bar--pos' : 'im-bar--neg'}
                    style={row.value >= 0 ? { left: '50%', width: bar(row.value) } : { right: '50%', width: bar(row.value) }}
                  />
                </div>
                <strong className={row.value >= 0 ? 'im-g' : 'im-r'}>{money(row.value)}</strong>
              </div>
            ))}
            <p className="im-trap__verdict" aria-live="polite">
              {trapVerdict()}
            </p>
            <p className="im-fine">
              Modelled with Black-Scholes, zero rates, strike at spot. Pre-news IV is set so the model straddle costs your
              ${(call + put).toFixed(2)}.
            </p>
          </div>

          <div className="im-sides">
            <div className="im-split__head">
              <span>WHICH SIDE OF IT ARE YOU ON?</span>
            </div>
            <ul>
              {IV_SIDES.map((item) => (
                <li key={item.name}>
                  <div>
                    <b>{item.name}</b>
                    <small>{item.note}</small>
                  </div>
                  <span className={`im-tag im-tag--${item.tone}`}>{item.side}</span>
                </li>
              ))}
            </ul>
            <p className="im-fine">State which side you are on in your quant note.</p>
          </div>
        </div>
      </div>

      <style>{`
        .im {
          font-family: 'Space Mono', monospace;
          border: 1px solid #1d4f83;
          background: linear-gradient(180deg, rgba(7, 13, 26, 0.96), rgba(4, 8, 18, 0.98));
          box-shadow: 0 0 0 3px rgba(5, 11, 23, 0.98), 0 0 36px rgba(157, 140, 255, 0.12);
          padding: 18px;
          color: #F4F4F4;
        }

        @media (max-width: 520px) {
          .im { padding: 12px; }
        }

        .im-top {
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

        .im-top em {
          font-style: normal;
          font-size: 9px;
          letter-spacing: 1.4px;
          color: #ffb84d;
        }

        .im-step {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          margin: 4px 0 10px;
        }

        .im-step__n {
          flex: none;
          display: grid;
          place-items: center;
          width: 30px;
          height: 30px;
          border: 1px solid #9d8cff;
          font-family: 'VT323', monospace;
          font-size: 20px;
          color: #9d8cff;
        }

        .im-step b {
          font-family: 'Orbitron', sans-serif;
          font-size: 10px;
          letter-spacing: 1.8px;
          color: #fff;
        }

        .im-step p {
          margin: 3px 0 0;
          font-size: 12px;
          line-height: 1.55;
          color: #a7b4c9;
        }

        .im-controls {
          display: flex;
          flex-wrap: wrap;
          gap: 12px 20px;
          margin-bottom: 14px;
        }

        .im-slider {
          display: grid;
          gap: 4px;
          min-width: 0;
          flex: 1 1 180px;
          max-width: 320px;
        }

        .im-slider span {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.2px;
          color: #5f7390;
        }

        .im-slider b {
          margin-left: 6px;
          font-family: 'VT323', monospace;
          font-size: 20px;
          font-weight: 400;
          color: #33d17a;
        }

        .im-slider input { width: 100%; accent-color: #33d17a; }
        .im-slider--violet b { color: #9d8cff; }
        .im-slider--violet input { accent-color: #9d8cff; }
        .im-slider--red b { color: #ff8a98; }
        .im-slider--red input { accent-color: #ff5a6e; }

        .im-implied {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 8px 16px;
          margin-bottom: 18px;
          padding: 12px 14px;
          border: 1px solid rgba(255, 184, 77, 0.45);
          background: rgba(255, 184, 77, 0.06);
        }

        .im-implied__math {
          display: grid;
          gap: 4px;
          min-width: 0;
        }

        .im-implied__math span {
          font-family: 'Orbitron', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.6px;
          color: #ffb84d;
        }

        .im-implied__math code {
          font-size: 12px;
          color: #ffd9a0;
          overflow-wrap: anywhere;
        }

        .im-implied strong {
          font-family: 'VT323', monospace;
          font-size: 54px;
          font-weight: 400;
          line-height: 0.9;
          color: #ffb84d;
          text-shadow: 0 0 18px rgba(255, 184, 77, 0.5);
        }

        .im-axis {
          display: block;
          width: 100%;
          height: auto;
          margin-bottom: 12px;
          border: 1px solid rgba(41, 79, 125, 0.6);
          background: #040913;
        }

        .im-band { fill: rgba(255, 184, 77, 0.16); stroke: #ffb84d; stroke-width: 1; stroke-dasharray: 4 3; transition: x 200ms ease, width 200ms ease; }
        .im-band-label { fill: #ffb84d; font-size: 9px; font-weight: 700; letter-spacing: 1px; font-family: 'Space Mono', monospace; }
        .im-line { stroke: rgba(156, 201, 255, 0.4); stroke-width: 1; }
        .im-tick { fill: #5f7390; font-size: 10px; font-family: 'Space Mono', monospace; }
        .im-spot { stroke: #c9d4e4; stroke-width: 1.5; stroke-dasharray: 2 3; }
        .im-path { stroke-width: 3; stroke-linecap: round; }
        .im-path--out { stroke: #33d17a; }
        .im-path--in { stroke: #63f6ff; }
        .im-exit { stroke: #02040a; stroke-width: 2; transition: cx 150ms ease; }
        .im-exit--out { fill: #33d17a; filter: drop-shadow(0 0 6px rgba(51, 209, 122, 0.9)); }
        .im-exit--in { fill: #63f6ff; filter: drop-shadow(0 0 6px rgba(99, 246, 255, 0.8)); }
        .im-exit-label { fill: #fff; font-size: 11px; font-weight: 700; font-family: 'Space Mono', monospace; }

        .im-verdict {
          margin-bottom: 18px;
          padding: 12px 14px;
          border-left: 3px solid var(--im-c);
          background: var(--im-bg);
        }

        .im-verdict--buy { --im-c: #33d17a; --im-bg: rgba(51, 209, 122, 0.07); }
        .im-verdict--sell { --im-c: #63f6ff; --im-bg: rgba(99, 246, 255, 0.06); }

        .im-verdict strong {
          font-family: 'Orbitron', sans-serif;
          font-size: 13px;
          letter-spacing: 2px;
          color: var(--im-c);
        }

        .im-verdict p {
          margin: 6px 0 10px;
          font-size: 12px;
          line-height: 1.65;
          color: #c9d4e4;
        }

        .im-ratio {
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          gap: 4px 12px;
        }

        .im-ratio span {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.2px;
          color: #7e90ab;
        }

        .im-ratio b {
          font-family: 'VT323', monospace;
          font-size: 28px;
          font-weight: 400;
          line-height: 1;
          color: #fff;
        }

        .im-ratio em {
          font-style: normal;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1px;
          color: #ffd27a;
        }

        .im-trap {
          padding-top: 16px;
          border-top: 1px dashed rgba(41, 79, 125, 0.7);
        }

        .im-trap__head {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px 16px;
          margin-bottom: 12px;
        }

        .im-trap__head > div { flex: 1 1 320px; min-width: 0; }

        .im-trap__head span {
          font-family: 'Orbitron', sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 2px;
          color: #9d8cff;
        }

        .im-trap__head p {
          margin: 6px 0 0;
          max-width: 620px;
          font-size: 12px;
          line-height: 1.6;
          color: #a7b4c9;
        }

        .im-btn {
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

        .im-btn:hover { border-color: #9d8cff; color: #fff; }
        .im-btn--violet { border-color: #9d8cff; background: #9d8cff; color: #0a0620; }
        .im-btn--violet:hover { color: #0a0620; }

        .im-trap__grid {
          display: grid;
          gap: 14px;
        }

        @media (min-width: 900px) {
          .im-trap__grid { grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr); }
        }

        .im-split, .im-sides {
          min-width: 0;
          padding: 12px 14px;
          border: 1px solid rgba(41, 79, 125, 0.8);
          background: rgba(7, 13, 26, 0.92);
        }

        .im-split__head {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          gap: 4px 10px;
          margin-bottom: 10px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.2px;
          color: #9cc9ff;
        }

        .im-split__head em { font-style: normal; color: #7e90ab; }

        .im-row {
          display: grid;
          grid-template-columns: minmax(96px, 0.9fr) minmax(60px, 1.2fr) auto;
          align-items: center;
          gap: 10px;
          padding: 6px 0;
          border-bottom: 1px dashed rgba(41, 79, 125, 0.5);
        }

        .im-row--total { border-bottom: 0; }

        .im-row__label b {
          display: block;
          font-family: 'Orbitron', sans-serif;
          font-size: 10px;
          letter-spacing: 1.4px;
          color: #fff;
        }

        .im-row__label small {
          font-size: 10px;
          color: #7e90ab;
        }

        .im-row__bar {
          position: relative;
          height: 14px;
          background: linear-gradient(90deg, transparent calc(50% - 0.5px), rgba(156, 201, 255, 0.35) calc(50% - 0.5px), rgba(156, 201, 255, 0.35) calc(50% + 0.5px), transparent calc(50% + 0.5px));
        }

        .im-row__bar i {
          position: absolute;
          top: 2px;
          bottom: 2px;
          transition: width 200ms ease;
        }

        .im-bar--pos { background: #33d17a; box-shadow: 0 0 8px rgba(51, 209, 122, 0.5); }
        .im-bar--neg { background: #ff5a6e; box-shadow: 0 0 8px rgba(255, 90, 110, 0.5); }

        .im-row strong {
          min-width: 64px;
          font-family: 'VT323', monospace;
          font-size: 22px;
          font-weight: 400;
          text-align: right;
        }

        .im-row--total strong { font-size: 26px; }

        .im-g { color: #33d17a; }
        .im-r { color: #ff5a6e; }

        .im-trap__verdict {
          margin: 10px 0 6px;
          font-size: 12px;
          line-height: 1.65;
          color: #c9d4e4;
        }

        .im-fine {
          margin: 6px 0 0;
          font-size: 10px;
          line-height: 1.55;
          color: #6f819c;
        }

        .im-sides ul {
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .im-sides li {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 7px 0;
          border-bottom: 1px dashed rgba(41, 79, 125, 0.5);
        }

        .im-sides li b {
          display: block;
          font-size: 12px;
          color: #fff;
        }

        .im-sides li small {
          font-size: 10px;
          line-height: 1.5;
          color: #7e90ab;
        }

        .im-tag {
          flex: none;
          padding: 2px 7px;
          border: 1px solid var(--im-t);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.2px;
          color: var(--im-t);
        }

        .im-tag--red { --im-t: #ff5a6e; }
        .im-tag--green { --im-t: #33d17a; }
        .im-tag--cyan { --im-t: #63f6ff; }

        @media (max-width: 420px) {
          .im-row { grid-template-columns: minmax(0, 1fr) auto; }
          .im-row__bar { grid-column: 1 / -1; grid-row: 2; }
          .im-implied strong { font-size: 44px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .im *, .im *::before, .im *::after { transition: none !important; }
        }
      `}</style>
    </div>
  );
}
