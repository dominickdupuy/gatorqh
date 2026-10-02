import { useEffect, useRef, useState } from 'react';

// The brief's five criteria, 1 to 10 each, with its band descriptors verbatim.
type Criterion = { key: string; name: string; short: string; bands: [string, string, string, string] };

const CRITERIA: Criterion[] = [
  {
    key: 'economic',
    name: 'ECONOMIC FOUNDATION',
    short: 'Strength of the economic hypothesis behind the strategy',
    bands: [
      'Hypothesis lacks clarity or logical foundation. No clear rationale for why the strategy should work.',
      'Moderate understanding of economic drivers, but with weak or incomplete logical support.',
      'Strong economic rationale with clear articulation of why the strategy should perform. Logical, well-supported arguments.',
      "Exceptional economic understanding, with highly compelling and well-evidenced reasoning for the strategy's success.",
    ],
  },
  {
    key: 'innovation',
    name: 'INNOVATION',
    short: 'Creativity and distinctiveness of the strategy',
    bands: [
      'Generic or common strategy with no clear differentiation.',
      'Some innovative aspects, but relies on established frameworks or ideas.',
      'Strong differentiation from traditional strategies, with unique or novel elements.',
      'Highly innovative, groundbreaking approach that is original and distinct from conventional strategies.',
    ],
  },
  {
    key: 'risk',
    name: 'RISK MANAGEMENT PLAN',
    short: 'Comprehensiveness and effectiveness of risk controls',
    bands: [
      'Minimal or no risk management outlined. Little understanding of key risks.',
      'Basic risk management plan, but lacking depth or thoroughness.',
      'Comprehensive framework with clear plans to mitigate identified risks.',
      'Highly detailed and effective approach, with multiple contingencies and a thorough understanding of strategy risks.',
    ],
  },
  {
    key: 'liquidity',
    name: 'LIQUIDITY & CAPITAL',
    short: 'How well the strategy accounts for liquidity and capital deployment',
    bands: [
      'No clear analysis of liquidity or capital needs. Strategy might be impractical in real markets.',
      'Some consideration of liquidity and capital, but with gaps or oversights.',
      'Strong understanding of liquidity and capital needs, with realistic and practical deployment.',
      'Excellent, thorough analysis demonstrating deep market knowledge and practical application.',
    ],
  },
  {
    key: 'performance',
    name: 'PERFORMANCE & ANALYTICAL EVIDENCE',
    short: "Use of historical data or other evidence to demonstrate the strategy's potential",
    bands: [
      'Little to no evidence. No meaningful analysis supporting performance.',
      'Some evidence, but limited depth or rigor. Partial performance analysis.',
      'Strong use of data and analysis. Well-reasoned performance expectations.',
      'Exceptional analytical rigor, with thorough and convincing evidence of effectiveness.',
    ],
  },
];

const BAND_LABELS = ['1–3', '4–6', '7–9', '10'];
const CAP = 4;

const bandOf = (score: number) => (score <= 3 ? 0 : score <= 6 ? 1 : score <= 9 ? 2 : 3);

export function RubricSim() {
  const [scores, setScores] = useState<number[]>([7, 5, 6, 5, 7]);
  const [reproducible, setReproducible] = useState(true);
  const [clean, setClean] = useState(true);
  const capped = !reproducible || !clean;

  const effective = scores.map((score, index) => (CRITERIA[index].key === 'performance' && capped ? Math.min(score, CAP) : score));
  const total = effective.reduce((sum, value) => sum + value, 0);

  const [shown, setShown] = useState(total);
  const shownRef = useRef(total);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      shownRef.current = total;
      setShown(total);
      return;
    }
    let raf = 0;
    const from = shownRef.current;
    const begin = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - begin) / 450);
      const value = from + (total - from) * (1 - (1 - t) ** 3);
      shownRef.current = value;
      setShown(value);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [total]);

  const setScore = (index: number, value: number) =>
    setScores((current) => current.map((score, k) => (k === index ? value : score)));

  return (
    <div className="rs">
      <div className="rs-top">
        <span>RUBRIC SIMULATOR · 5 CRITERIA × 10 POINTS</span>
        <em>TRY SCORING YOUR OWN DRAFT</em>
      </div>

      <div className="rs-grid">
        <div className="rs-rows">
          {CRITERIA.map((criterion, index) => {
            const score = scores[index];
            const value = effective[index];
            const isCapped = value !== score;
            const band = bandOf(value);
            return (
              <div key={criterion.key} className={`rs-row ${isCapped ? 'rs-row--capped' : ''}`}>
                <div className="rs-row__head">
                  <div>
                    <span className="rs-row__n">{String(index + 1).padStart(2, '0')}</span>
                    <h4>{criterion.name}</h4>
                    <p className="rs-row__short">{criterion.short}</p>
                  </div>
                  <b className="rs-row__score">
                    {isCapped && <s>{score}</s>}
                    {value}
                    <small>/10</small>
                    {isCapped && <em className="rs-stamp">CAPPED</em>}
                  </b>
                </div>
                <div className="rs-seg" role="radiogroup" aria-label={`${criterion.name} score`}>
                  {Array.from({ length: 10 }, (_, k) => {
                    const n = k + 1;
                    return (
                      <button
                        key={n}
                        type="button"
                        role="radio"
                        aria-checked={score === n}
                        aria-label={`${n} out of 10`}
                        className={`rs-seg__cell ${n <= value ? `rs-seg__cell--on rs-seg__cell--b${bandOf(n)}` : ''} ${n <= score && n > value ? 'rs-seg__cell--lost' : ''}`}
                        onClick={() => setScore(index, n)}
                      >
                        {n}
                      </button>
                    );
                  })}
                </div>
                <div className="rs-bands" aria-hidden="true">
                  {BAND_LABELS.map((label, k) => (
                    <em key={label} className={band === k ? 'rs-band--on' : ''}>
                      {label}
                    </em>
                  ))}
                </div>
                <p className="rs-row__desc" aria-live="polite">
                  {criterion.bands[band]}
                </p>
              </div>
            );
          })}
        </div>

        <div className="rs-side">
          <div className={`rs-total ${capped ? 'rs-total--capped' : ''}`}>
            <span>TOTAL</span>
            <div className="rs-total__num">
              {Math.round(shown)}
              <small>/50</small>
            </div>
            <div className="rs-meter" aria-hidden="true">
              {Array.from({ length: 50 }, (_, k) => (
                <i key={k} className={k < total ? 'rs-meter__on' : ''} />
              ))}
            </div>
          </div>

          <div className="rs-caps">
            <div className="rs-caps__title">THE CAP RULE · CRITERION 5</div>
            {[
              { label: 'JUDGES CAN RUN OUR CODE AND IT MATCHES THE NOTE', on: reproducible, set: setReproducible },
              { label: 'NO LOOKAHEAD, NO TUNING ON OUT-OF-SAMPLE', on: clean, set: setClean },
            ].map((toggle) => (
              <button
                key={toggle.label}
                type="button"
                className={`rs-toggle ${toggle.on ? 'rs-toggle--on' : 'rs-toggle--off'}`}
                aria-pressed={toggle.on}
                onClick={() => toggle.set((value) => !value)}
              >
                <i aria-hidden="true">{toggle.on ? '✓' : '✕'}</i>
                {toggle.label}
              </button>
            ))}
            <p className={capped ? 'rs-caps__warn' : ''}>
              {capped
                ? 'Performance & Analytical Evidence is capped at 4, no matter how strong the rest of the analysis is.'
                : 'Code is not scored separately, but it backs up criterion 5. If either box breaks, criterion 5 is capped at 4.'}
            </p>
          </div>

          <div className="rs-notes">
            <p>
              <span>TIES</span>
              Performance &amp; Analytical Evidence first, then Economic Foundation.
            </p>
            <p>
              <span>NO LEADERBOARD</span>
              There’s no P&amp;L leaderboard. Returns only count as evidence for your argument.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .rs {
          font-family: 'Space Mono', monospace;
          border: 1px solid #1d4f83;
          background: linear-gradient(180deg, rgba(7, 13, 26, 0.96), rgba(4, 8, 18, 0.98));
          box-shadow: 0 0 0 3px rgba(5, 11, 23, 0.98), 0 0 36px rgba(51, 209, 122, 0.1);
          padding: 18px;
        }

        .rs-top {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          gap: 4px 16px;
          margin-bottom: 16px;
          padding-bottom: 10px;
          border-bottom: 1px dashed rgba(41, 79, 125, 0.7);
          font-family: 'Orbitron', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2px;
          color: #fff;
        }

        .rs-top em {
          font-style: normal;
          font-size: 9px;
          letter-spacing: 1.4px;
          color: #63f6ff;
        }

        .rs-grid { display: grid; gap: 18px; }

        @media (min-width: 980px) {
          .rs-grid { grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr); }
        }

        .rs-rows { display: grid; gap: 12px; }

        .rs-row {
          padding: 12px;
          border: 1px solid rgba(41, 79, 125, 0.6);
          background: rgba(4, 9, 19, 0.9);
          transition: border-color 200ms ease, box-shadow 200ms ease;
        }

        .rs-row--capped {
          border-color: rgba(255, 90, 110, 0.7);
          box-shadow: 0 0 18px rgba(255, 90, 110, 0.12);
        }

        .rs-row__head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 10px;
        }

        .rs-row__n {
          font-family: 'Orbitron', sans-serif;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.5px;
          color: #33d17a;
        }

        .rs-row h4 {
          margin: 2px 0 2px;
          font-family: 'Orbitron', sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1.6px;
          color: #fff;
        }

        .rs-row__short {
          margin: 0;
          font-size: 11px;
          line-height: 1.5;
          color: #7e90ab;
        }

        .rs-row__score {
          position: relative;
          flex: none;
          display: flex;
          align-items: baseline;
          gap: 6px;
          font-family: 'VT323', monospace;
          font-size: 34px;
          font-weight: 400;
          line-height: 1;
          color: #fff4c8;
        }

        .rs-row__score small { font-size: 18px; color: #5f7390; }
        .rs-row__score s { font-size: 22px; color: #5f7390; text-decoration-color: #ff5a6e; text-decoration-thickness: 2px; }
        .rs-row--capped .rs-row__score { color: #ff8a98; }

        .rs-stamp {
          position: absolute;
          right: -4px;
          top: -14px;
          padding: 1px 5px;
          border: 2px solid #ff5a6e;
          font-family: 'Orbitron', sans-serif;
          font-style: normal;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 1.5px;
          color: #ff5a6e;
          transform: rotate(-8deg);
          background: rgba(20, 4, 8, 0.9);
          animation: rsStamp 260ms cubic-bezier(0.2, 1.6, 0.4, 1) both;
        }

        @keyframes rsStamp {
          from { opacity: 0; transform: rotate(-8deg) scale(1.8); }
          to { opacity: 1; transform: rotate(-8deg) scale(1); }
        }

        .rs-seg {
          display: grid;
          grid-template-columns: repeat(10, minmax(0, 1fr));
          gap: 3px;
        }

        .rs-seg__cell {
          height: 26px;
          padding: 0;
          border: 1px solid rgba(41, 79, 125, 0.7);
          background: #0b1830;
          color: #5f7390;
          font-family: 'VT323', monospace;
          font-size: 16px;
          cursor: pointer;
          transition: background 140ms ease, color 140ms ease, box-shadow 140ms ease;
        }

        .rs-seg__cell:hover { border-color: #63f6ff; color: #fff; }
        .rs-seg__cell:focus-visible { outline: 2px solid #63f6ff; outline-offset: 1px; }

        .rs-seg__cell--on { color: #04110a; }
        .rs-seg__cell--b0 { background: #ff5a6e; border-color: #ff5a6e; }
        .rs-seg__cell--b1 { background: #ffb84d; border-color: #ffb84d; }
        .rs-seg__cell--b2 { background: #33d17a; border-color: #33d17a; }
        .rs-seg__cell--b3 { background: #63f6ff; border-color: #63f6ff; box-shadow: 0 0 12px rgba(99, 246, 255, 0.6); }

        .rs-seg__cell--lost {
          background: repeating-linear-gradient(135deg, rgba(255, 90, 110, 0.3) 0 4px, transparent 4px 8px);
          border-color: rgba(255, 90, 110, 0.6);
          color: #ff8a98;
        }

        .rs-bands {
          display: grid;
          grid-template-columns: 3fr 3fr 3fr 1fr;
          gap: 3px;
          margin: 4px 0 8px;
        }

        .rs-bands em {
          padding: 1px 0;
          border-top: 2px solid rgba(41, 79, 125, 0.5);
          font-style: normal;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1px;
          text-align: center;
          color: #5f7390;
          transition: color 160ms ease, border-color 160ms ease;
        }

        .rs-bands .rs-band--on { border-color: #33d17a; color: #33d17a; }

        .rs-row__desc {
          margin: 0;
          min-height: 3em;
          font-size: 12px;
          line-height: 1.6;
          color: #c9d4e4;
        }

        .rs-side {
          display: grid;
          gap: 12px;
          align-content: start;
        }

        @media (min-width: 980px) {
          .rs-side { position: sticky; top: 90px; }
        }

        .rs-total {
          padding: 14px 16px;
          border: 2px solid #33d17a;
          background:
            repeating-linear-gradient(135deg, rgba(51, 209, 122, 0.07) 0 10px, transparent 10px 20px),
            rgba(7, 13, 26, 0.95);
          transition: border-color 200ms ease;
        }

        .rs-total--capped { border-color: #ff5a6e; }

        .rs-total > span {
          font-family: 'Orbitron', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2.5px;
          color: #7e90ab;
        }

        .rs-total__num {
          font-family: 'VT323', monospace;
          font-size: clamp(64px, 9vw, 96px);
          line-height: 0.95;
          color: #fff;
          text-shadow: 0 0 24px rgba(51, 209, 122, 0.45);
        }

        .rs-total--capped .rs-total__num { text-shadow: 0 0 24px rgba(255, 90, 110, 0.45); }
        .rs-total__num small { font-size: 0.4em; color: #5f7390; }

        .rs-meter {
          display: grid;
          grid-template-columns: repeat(50, minmax(0, 1fr));
          gap: 2px;
          margin-top: 8px;
        }

        .rs-meter i {
          height: 14px;
          background: #12233a;
          transition: background 200ms ease;
        }

        .rs-meter i:nth-child(10n) { margin-right: 3px; }
        .rs-meter .rs-meter__on { background: #33d17a; box-shadow: 0 0 6px rgba(51, 209, 122, 0.5); }
        .rs-total--capped .rs-meter__on { background: #ffb84d; box-shadow: none; }

        .rs-caps {
          padding: 12px;
          border: 1px solid rgba(41, 79, 125, 0.7);
          background: rgba(4, 9, 19, 0.9);
        }

        .rs-caps__title {
          margin-bottom: 10px;
          font-family: 'Orbitron', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2px;
          color: #FA4616;
        }

        .rs-toggle {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          width: 100%;
          margin-bottom: 8px;
          padding: 9px 10px;
          border: 1px solid #294f7d;
          background: #07101d;
          color: #c9d4e4;
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.8px;
          line-height: 1.5;
          text-align: left;
          cursor: pointer;
          transition: border-color 150ms ease, background 150ms ease;
        }

        .rs-toggle i {
          flex: none;
          display: grid;
          place-items: center;
          width: 18px;
          height: 18px;
          font-style: normal;
          font-size: 12px;
        }

        .rs-toggle--on { border-color: rgba(51, 209, 122, 0.7); }
        .rs-toggle--on i { background: #33d17a; color: #04110a; }
        .rs-toggle--off { border-color: #ff5a6e; background: rgba(255, 90, 110, 0.08); color: #ffc2ca; }
        .rs-toggle--off i { background: #ff5a6e; color: #1a0306; }
        .rs-toggle:focus-visible { outline: 2px solid #63f6ff; outline-offset: 2px; }

        .rs-caps p {
          margin: 4px 0 0;
          font-size: 11px;
          line-height: 1.6;
          color: #a7b4c9;
        }

        .rs-caps .rs-caps__warn { color: #ff8a98; }

        .rs-notes { display: grid; gap: 8px; }

        .rs-notes p {
          margin: 0;
          padding: 10px 12px;
          border-left: 3px solid #63f6ff;
          background: rgba(99, 246, 255, 0.05);
          font-size: 11px;
          line-height: 1.6;
          color: #c9d4e4;
        }

        .rs-notes p:last-child { border-color: #33d17a; background: rgba(51, 209, 122, 0.05); }

        .rs-notes span {
          display: block;
          margin-bottom: 2px;
          font-family: 'Orbitron', sans-serif;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 2px;
          color: #63f6ff;
        }

        .rs-notes p:last-child span { color: #33d17a; }

        @media (prefers-reduced-motion: reduce) {
          .rs-stamp { animation: none; }
          .rs-seg__cell, .rs-meter i, .rs-toggle { transition: none; }
        }
      `}</style>
    </div>
  );
}
