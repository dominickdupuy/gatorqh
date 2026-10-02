import { useState } from 'react';

// The brief's out-of-sample rule: lock the most recent 20% of history or the
// most recent two years, whichever is shorter. "Today" is the event, Oct 2026.
const END = 2026.75;
const MIN_START = 1995;
const MAX_START = 2024;
const OOS_CAP_YEARS = 2;

const FREQS = [
  { id: 'daily', label: 'DAILY', perYear: 252, unit: 'DAILY BARS' },
  { id: 'hourly', label: 'HOURLY', perYear: 1638, unit: 'HOURLY BARS' },
  { id: 'minute', label: '1-MIN', perYear: 98280, unit: 'MINUTE BARS' },
] as const;

type FreqId = (typeof FREQS)[number]['id'];

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

const dateOf = (t: number) => {
  const year = Math.floor(t + 1e-9);
  const month = Math.min(11, Math.floor((t - year) * 12 + 1e-6));
  return `${MONTHS[month]} ${year}`;
};

const years = (value: number) => `${value.toFixed(1)} YRS`;
const bars = (value: number) => Math.round(value).toLocaleString('en-US');

export function HoldoutPlanner() {
  const [start, setStart] = useState(2012);
  const [freq, setFreq] = useState<FreqId>('daily');
  const [walk, setWalk] = useState(false);
  const [folds, setFolds] = useState(4);

  const total = END - start;
  const capBinds = total * 0.2 > OOS_CAP_YEARS;
  const oosYears = Math.min(total * 0.2, OOS_CAP_YEARS);
  const isYears = total - oosYears;
  const split = END - oosYears;
  const perYear = FREQS.find((f) => f.id === freq)!.perYear;
  const pos = (t: number) => ((t - start) / total) * 100;

  const tickStep = total > 20 ? 5 : total > 9 ? 2 : 1;
  const ticks: number[] = [];
  for (let y = Math.ceil(start / tickStep) * tickStep; y <= END; y += tickStep) ticks.push(y);

  // Expanding-window walk-forward inside the in-sample period only. The first
  // 40% is the minimum training window; the rest is cut into validation blocks.
  const firstTrain = isYears * 0.4;
  const block = (isYears - firstTrain) / folds;
  const embargo = Math.min(0.15, block * 0.25);
  const foldRows = Array.from({ length: folds }, (_, index) => {
    const trainEnd = start + firstTrain + index * block;
    return { trainEnd, valStart: trainEnd + embargo, valEnd: trainEnd + block };
  });

  return (
    <div className="hp">
      <div className="hp-top">
        <span>HOLDOUT PLANNER · WHERE YOUR TEST SET STARTS</span>
        <em>RULE: MOST RECENT 20% OR 2 YEARS, WHICHEVER IS SHORTER</em>
      </div>

      <div className="hp-controls">
        <label className="hp-slider">
          <span>
            HISTORY STARTS
            <b>{start}</b>
          </span>
          <input
            type="range"
            min={MIN_START}
            max={MAX_START}
            step={1}
            value={start}
            onChange={(event) => setStart(Number(event.target.value))}
            aria-label="History start year"
            style={{ ['--fill' as string]: `${((start - MIN_START) / (MAX_START - MIN_START)) * 100}%` }}
          />
        </label>
        <div className="hp-group" role="group" aria-label="Bar frequency">
          <span>FREQUENCY</span>
          {FREQS.map((f) => (
            <button key={f.id} type="button" className={`hp-chip ${freq === f.id ? 'hp-chip--on' : ''}`} onClick={() => setFreq(f.id)} aria-pressed={freq === f.id}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="hp-group">
          <button type="button" className={`hp-chip ${walk ? 'hp-chip--cyan' : ''}`} onClick={() => setWalk((value) => !value)} aria-pressed={walk}>
            WALK-FORWARD {walk ? 'ON' : 'OFF'}
          </button>
          {walk && (
            <span className="hp-folds" role="group" aria-label="Number of folds">
              {[3, 4, 5].map((k) => (
                <button key={k} type="button" className={`hp-chip ${folds === k ? 'hp-chip--cyan' : ''}`} onClick={() => setFolds(k)} aria-pressed={folds === k}>
                  {k}
                </button>
              ))}
              <em>FOLDS</em>
            </span>
          )}
        </div>
      </div>

      <div className="hp-timeline" role="img" aria-label={`In-sample ${dateOf(start)} to ${dateOf(split)}, out-of-sample ${dateOf(split)} to ${dateOf(END)}.`}>
        <div className="hp-bar">
          <div className="hp-bar__is" style={{ width: `${pos(split)}%` }}>
            <span>IN-SAMPLE · BUILD &amp; TUNE HERE</span>
          </div>
          <div className="hp-bar__oos" style={{ left: `${pos(split)}%` }}>
            <span className="hp-lock" aria-hidden="true">
              <i />
            </span>
            <span className="hp-bar__oos-label">OOS</span>
          </div>
          <div className="hp-bar__split" style={{ left: `${pos(split)}%` }}>
            <em>{dateOf(split)}</em>
          </div>
        </div>

        {walk && (
          <div className="hp-folds-grid">
            {foldRows.map((row, index) => (
              <div key={index} className="hp-fold" style={{ animationDelay: `${index * 70}ms` }}>
                <span className="hp-fold__label">FOLD {index + 1}</span>
                <div className="hp-fold__track">
                  <i className="hp-fold__train" style={{ left: 0, width: `${pos(row.trainEnd)}%` }} />
                  <i className="hp-fold__gap" style={{ left: `${pos(row.trainEnd)}%`, width: `${pos(row.valStart) - pos(row.trainEnd)}%` }} />
                  <i className="hp-fold__val" style={{ left: `${pos(row.valStart)}%`, width: `${pos(row.valEnd) - pos(row.valStart)}%` }} />
                  <i className="hp-fold__locked" style={{ left: `${pos(split)}%`, right: 0 }} />
                </div>
              </div>
            ))}
            <div className="hp-legend">
              <span>
                <i className="hp-key hp-key--train" /> TRAIN
              </span>
              <span>
                <i className="hp-key hp-key--gap" /> PURGE GAP
              </span>
              <span>
                <i className="hp-key hp-key--val" /> VALIDATE
              </span>
              <span>
                <i className="hp-key hp-key--locked" /> LOCKED · NEVER TOUCHED
              </span>
            </div>
          </div>
        )}

        <div className="hp-ticks" aria-hidden="true">
          {ticks.map((y) => (
            <span key={y} style={{ left: `${pos(y)}%` }}>
              {y}
            </span>
          ))}
          <span className="hp-ticks__now" style={{ left: '100%' }}>
            NOW
          </span>
        </div>
      </div>

      <div className="hp-readout">
        <div className={`hp-binds ${capBinds ? 'hp-binds--cap' : ''}`}>
          <span>WHICH RULE BINDS</span>
          <strong>{capBinds ? '2-YEAR CAP BINDS' : '20% BINDS'}</strong>
          <p>
            {capBinds
              ? `20% of ${years(total)} would be ${years(total * 0.2)}. The 2-year cap is shorter, so hold out 2 years.`
              : `20% of ${years(total)} is ${years(total * 0.2)}, shorter than 2 years, so hold out 20%.`}
          </p>
        </div>
        <dl className="hp-stats">
          <div>
            <dt>IN-SAMPLE</dt>
            <dd className="hp-green">{years(isYears)}</dd>
            <small>
              {dateOf(start)} → {dateOf(split)}
            </small>
          </div>
          <div>
            <dt>OUT-OF-SAMPLE</dt>
            <dd className="hp-amber">{years(oosYears)}</dd>
            <small>
              {dateOf(split)} → {dateOf(END)}
            </small>
          </div>
          <div>
            <dt>IN-SAMPLE BARS</dt>
            <dd>{bars(isYears * perYear)}</dd>
            <small>{FREQS.find((f) => f.id === freq)!.unit}</small>
          </div>
          <div>
            <dt>OOS BARS</dt>
            <dd>{bars(oosYears * perYear)}</dd>
            <small>{FREQS.find((f) => f.id === freq)!.unit}</small>
          </div>
        </dl>
      </div>

      <p className="hp-caption">
        <span>LOCK IT</span>
        {walk
          ? 'Tune with walk-forward folds inside the in-sample period: always train on the past and validate on what comes next. Leave a purge gap so overlapping labels don’t leak across the boundary. The locked period stays untouched.'
          : 'Evaluate it once, at the end. If you look at it and then go back and change things, it isn’t out-of-sample anymore.'}
      </p>

      <style>{`
        .hp {
          font-family: 'Space Mono', monospace;
          border: 1px solid #1d4f83;
          background: linear-gradient(180deg, rgba(7, 13, 26, 0.96), rgba(4, 8, 18, 0.98));
          box-shadow: 0 0 0 3px rgba(5, 11, 23, 0.98), 0 0 36px rgba(4, 74, 148, 0.16);
          padding: 18px;
        }

        .hp-top {
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

        .hp-top em {
          font-style: normal;
          font-size: 9px;
          letter-spacing: 1.4px;
          color: #ffb84d;
        }

        .hp-controls {
          display: grid;
          gap: 12px 20px;
          margin-bottom: 22px;
        }

        @media (min-width: 900px) {
          .hp-controls { grid-template-columns: minmax(0, 1.2fr) auto auto; align-items: end; }
        }

        .hp-slider span,
        .hp-group > span {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 6px;
          font-family: 'Orbitron', sans-serif;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.5px;
          color: #7e90ab;
        }

        .hp-slider b {
          font-family: 'VT323', monospace;
          font-size: 24px;
          font-weight: 400;
          letter-spacing: 0;
          color: #d9ffe6;
        }

        .hp-slider input {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 8px;
          background: linear-gradient(90deg, #1f7a4a, #33d17a var(--fill), #12233a var(--fill));
          border: 1px solid #294f7d;
          outline: none;
        }

        .hp-slider input:focus-visible { outline: 1px solid #63f6ff; outline-offset: 3px; }

        .hp-slider input::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 20px;
          background: #d9ffe6;
          border: 2px solid #33d17a;
          box-shadow: 0 0 12px rgba(51, 209, 122, 0.8);
          cursor: pointer;
        }

        .hp-slider input::-moz-range-thumb {
          width: 12px;
          height: 18px;
          background: #d9ffe6;
          border: 2px solid #33d17a;
          border-radius: 0;
          cursor: pointer;
        }

        .hp-group {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px;
        }

        .hp-group > span { width: 100%; margin-bottom: 0; }

        .hp-folds {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .hp-folds em {
          font-style: normal;
          font-size: 9px;
          letter-spacing: 1.2px;
          color: #5f7390;
        }

        .hp-chip {
          padding: 6px 10px;
          border: 1px solid #294f7d;
          background: #07101d;
          color: #9cc9ff;
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1px;
          cursor: pointer;
          transition: border-color 150ms ease, color 150ms ease, background 150ms ease;
        }

        .hp-chip:hover { border-color: #33d17a; color: #fff; }
        .hp-chip--on { border-color: #33d17a; background: #33d17a; color: #03140a; }
        .hp-chip--cyan { border-color: #63f6ff; background: rgba(99, 246, 255, 0.14); color: #63f6ff; }

        .hp-timeline {
          position: relative;
          padding: 24px 4px 30px;
        }

        .hp-bar {
          position: relative;
          height: 56px;
          border: 1px solid #294f7d;
          background: #07101d;
        }

        .hp-bar__is {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          display: flex;
          align-items: center;
          overflow: hidden;
          padding-left: 12px;
          background: linear-gradient(90deg, rgba(51, 209, 122, 0.12), rgba(51, 209, 122, 0.32));
          border-right: 0;
          transition: width 350ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .hp-bar__is span {
          font-family: 'Orbitron', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.6px;
          color: #33d17a;
          white-space: nowrap;
        }

        .hp-bar__oos {
          position: absolute;
          top: 0;
          bottom: 0;
          right: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          overflow: hidden;
          background:
            repeating-linear-gradient(135deg, rgba(255, 184, 77, 0.28) 0 6px, rgba(255, 184, 77, 0.08) 6px 12px),
            rgba(30, 20, 6, 0.9);
          box-shadow: inset 0 0 18px rgba(255, 184, 77, 0.25);
          transition: left 350ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .hp-bar__oos-label {
          font-family: 'Orbitron', sans-serif;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.5px;
          color: #ffd27a;
        }

        .hp-lock {
          position: relative;
          width: 14px;
          height: 16px;
        }

        .hp-lock::before {
          content: '';
          position: absolute;
          left: 2px;
          top: 0;
          width: 10px;
          height: 9px;
          border: 2px solid #ffb84d;
          border-bottom: 0;
          box-sizing: border-box;
        }

        .hp-lock i {
          position: absolute;
          left: 0;
          bottom: 0;
          width: 14px;
          height: 9px;
          background: #ffb84d;
          box-shadow: 0 0 10px rgba(255, 184, 77, 0.7);
        }

        .hp-bar__split {
          position: absolute;
          top: -8px;
          bottom: -8px;
          width: 2px;
          margin-left: -1px;
          background: #ffb84d;
          box-shadow: 0 0 10px #ffb84d;
          transition: left 350ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .hp-bar__split em {
          position: absolute;
          top: -18px;
          right: 6px;
          font-style: normal;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1px;
          color: #ffb84d;
          white-space: nowrap;
        }

        .hp-folds-grid {
          display: grid;
          gap: 6px;
          margin-top: 12px;
        }

        .hp-fold {
          display: grid;
          grid-template-columns: 56px minmax(0, 1fr);
          align-items: center;
          gap: 8px;
          animation: hpIn 400ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes hpIn {
          from { opacity: 0; transform: translateX(-8px); }
          to { opacity: 1; transform: none; }
        }

        .hp-fold__label {
          font-family: 'Orbitron', sans-serif;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 1.2px;
          color: #7e90ab;
        }

        .hp-fold__track {
          position: relative;
          height: 14px;
          border: 1px solid rgba(41, 79, 125, 0.6);
          background: #050b16;
        }

        .hp-fold__track i {
          position: absolute;
          top: 0;
          bottom: 0;
        }

        .hp-fold__train,
        .hp-key--train { background: rgba(51, 209, 122, 0.45); }
        .hp-fold__gap,
        .hp-key--gap { background: repeating-linear-gradient(90deg, #5f7390 0 2px, transparent 2px 4px); }
        .hp-fold__val,
        .hp-key--val { background: #63f6ff; box-shadow: 0 0 8px rgba(99, 246, 255, 0.6); }
        .hp-fold__locked,
        .hp-key--locked { background: repeating-linear-gradient(135deg, rgba(255, 184, 77, 0.3) 0 4px, transparent 4px 8px); }

        .hp-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 6px 16px;
          margin: 4px 0 0 64px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1px;
          color: #7e90ab;
        }

        .hp-legend span { display: inline-flex; align-items: center; gap: 6px; }

        .hp-key {
          display: inline-block;
          width: 14px;
          height: 8px;
          border: 1px solid rgba(41, 79, 125, 0.6);
        }

        .hp-ticks {
          position: absolute;
          left: 4px;
          right: 4px;
          bottom: 6px;
          height: 16px;
        }

        .hp-ticks span {
          position: absolute;
          top: 0;
          transform: translateX(-50%);
          font-size: 9px;
          color: #5f7390;
        }

        .hp-ticks span::before {
          content: '';
          position: absolute;
          left: 50%;
          top: -6px;
          width: 1px;
          height: 4px;
          background: #294f7d;
        }

        .hp-ticks .hp-ticks__now {
          transform: translateX(-100%);
          font-weight: 700;
          color: #ffb84d;
        }

        .hp-ticks .hp-ticks__now::before { left: 100%; }

        @media (max-width: 560px) {
          .hp-ticks span:nth-child(even):not(.hp-ticks__now) { display: none; }
          .hp-bar__is span { display: none; }
          .hp-legend { margin-left: 0; }
          .hp-fold { grid-template-columns: 40px minmax(0, 1fr); }
        }

        .hp-readout {
          display: grid;
          gap: 12px;
          margin-top: 6px;
        }

        @media (min-width: 900px) {
          .hp-readout { grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr); }
        }

        .hp-binds {
          padding: 12px 14px;
          border: 1px solid rgba(51, 209, 122, 0.6);
          background: rgba(51, 209, 122, 0.06);
        }

        .hp-binds--cap {
          border-color: rgba(255, 184, 77, 0.7);
          background: rgba(255, 184, 77, 0.06);
        }

        .hp-binds > span {
          display: block;
          font-family: 'Orbitron', sans-serif;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.5px;
          color: #7e90ab;
        }

        .hp-binds strong {
          display: block;
          margin: 4px 0 6px;
          font-family: 'Orbitron', sans-serif;
          font-size: 15px;
          letter-spacing: 2px;
          color: #33d17a;
        }

        .hp-binds--cap strong { color: #ffb84d; }

        .hp-binds p {
          margin: 0;
          font-size: 11px;
          line-height: 1.6;
          color: #a7b4c9;
        }

        .hp-stats {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
          margin: 0;
        }

        @media (min-width: 640px) {
          .hp-stats { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        }

        .hp-stats div {
          padding: 10px 12px;
          border: 1px solid rgba(41, 79, 125, 0.6);
          background: rgba(4, 9, 19, 0.9);
          min-width: 0;
        }

        .hp-stats dt {
          font-family: 'Orbitron', sans-serif;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 1.3px;
          color: #7e90ab;
        }

        .hp-stats dd {
          margin: 2px 0;
          font-family: 'VT323', monospace;
          font-size: 26px;
          line-height: 1;
          color: #fff;
          overflow-wrap: anywhere;
        }

        .hp-stats .hp-green { color: #33d17a; }
        .hp-stats .hp-amber { color: #ffb84d; }

        .hp-stats small {
          font-size: 9px;
          letter-spacing: 0.6px;
          color: #5f7390;
        }

        .hp-caption {
          display: flex;
          flex-wrap: wrap;
          gap: 6px 14px;
          align-items: baseline;
          margin: 16px 0 0;
          padding: 12px 14px;
          border-left: 3px solid #ffb84d;
          background: rgba(255, 184, 77, 0.06);
          font-size: 12px;
          line-height: 1.7;
          color: #d3dcea;
        }

        .hp-caption span {
          font-family: 'Orbitron', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2px;
          color: #ffb84d;
        }

        @media (prefers-reduced-motion: reduce) {
          .hp-bar__is, .hp-bar__oos, .hp-bar__split { transition: none; }
          .hp-fold { animation: none; }
        }
      `}</style>
    </div>
  );
}
