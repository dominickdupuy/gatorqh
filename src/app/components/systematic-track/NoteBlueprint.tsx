import { useState } from 'react';

// The brief's recommended structure for the quant note. Page budgets are a
// suggestion for balancing five pages, not a rule.
type Section = {
  key: string;
  name: string;
  color: string;
  budget: number;
  lead: string;
  include: string[];
  feeds: string[];
};

const SECTIONS: Section[] = [
  {
    key: 'summary',
    name: 'SUMMARY',
    color: '#9cc9ff',
    budget: 0.25,
    lead: 'A few sentences.',
    include: ['The strategy', 'The edge', 'The headline out-of-sample results'],
    feeds: ['Economic Foundation', 'Performance & Analytical Evidence'],
  },
  {
    key: 'hypothesis',
    name: 'ECONOMIC HYPOTHESIS',
    color: '#33d17a',
    budget: 0.5,
    lead: 'Who is on the other side of your trade, and why the opportunity persists.',
    include: ['Risk premium', 'Behavioral bias', 'Structural or institutional constraint', 'Liquidity provision'],
    feeds: ['Economic Foundation', 'Innovation'],
  },
  {
    key: 'data',
    name: 'DATA & UNIVERSE',
    color: '#63f6ff',
    budget: 0.5,
    lead: 'What you traded and where the numbers came from.',
    include: [
      'Instruments, frequency and date range',
      'Sources (cite every one)',
      'How you handled survivorship, corporate actions and missing data',
    ],
    feeds: ['Performance & Analytical Evidence'],
  },
  {
    key: 'method',
    name: 'METHODOLOGY',
    color: '#c79bff',
    budget: 1,
    lead: 'How a signal becomes a trade.',
    include: ['Signal construction', 'Portfolio construction', 'Position sizing', 'Rebalancing frequency', 'Execution assumptions'],
    feeds: ['Innovation', 'Performance & Analytical Evidence'],
  },
  {
    key: 'results',
    name: 'RESULTS',
    color: '#FA4616',
    budget: 1.25,
    lead: 'In-sample vs out-of-sample performance, net of transaction costs.',
    include: ['Annualized return', 'Volatility', 'Sharpe ratio', 'Max drawdown', 'Turnover', 'An equity curve'],
    feeds: ['Performance & Analytical Evidence'],
  },
  {
    key: 'risk',
    name: 'RISK MANAGEMENT',
    color: '#ff5a6e',
    budget: 0.5,
    lead: 'How you limit losses, and when you cut risk.',
    include: ['Position and exposure limits', 'Stop or de-risking rules', 'Factor and correlation exposure', 'Tail and regime risk'],
    feeds: ['Risk Management Plan'],
  },
  {
    key: 'liquidity',
    name: 'LIQUIDITY & CAPACITY',
    color: '#ffb84d',
    budget: 0.5,
    lead: 'What it costs to trade, and how big it can get.',
    include: [
      'Trading costs',
      'Slippage',
      'Market impact',
      'Roughly how much capital the strategy could run before the edge erodes',
    ],
    feeds: ['Liquidity & Capital Considerations'],
  },
  {
    key: 'limits',
    name: 'LIMITATIONS & NEXT STEPS',
    color: '#7e90ab',
    budget: 0.5,
    lead: 'What didn’t work, and what you’d try next.',
    include: ['What you would test with more time', 'What could break the strategy'],
    feeds: ['Risk Management Plan', 'Performance & Analytical Evidence'],
  },
];

const PAGE_LIMIT = 5;
const STEP = 0.25;

type Slice = { key: string; index: number; size: number; first: boolean };

// Lay the sections end to end and cut them at page boundaries.
const paginate = (budgets: number[]) => {
  const pages: Slice[][] = [];
  let cursor = 0;
  budgets.forEach((budget, index) => {
    let left = budget;
    let first = true;
    while (left > 1e-9) {
      const page = Math.floor(cursor + 1e-9);
      const room = page + 1 - cursor;
      const size = Math.min(room, left);
      (pages[page] ??= []).push({ key: SECTIONS[index].key, index, size, first });
      cursor += size;
      left -= size;
      first = false;
    }
  });
  return pages;
};

export function NoteBlueprint() {
  const [budgets, setBudgets] = useState<number[]>(() => SECTIONS.map((section) => section.budget));
  const [active, setActive] = useState(4);

  const total = budgets.reduce((sum, value) => sum + value, 0);
  const over = total > PAGE_LIMIT + 1e-9;
  const pages = paginate(budgets);
  const pageCount = Math.max(PAGE_LIMIT, pages.length);
  const section = SECTIONS[active];

  const nudge = (index: number, delta: number) =>
    setBudgets((current) => current.map((value, k) => (k === index ? Math.max(STEP, Math.min(3, value + delta)) : value)));

  return (
    <div className="nb">
      <div className="nb-top">
        <span>NOTE BLUEPRINT · PDF · MAX 5 PAGES</span>
        <em>CLICK A SECTION · ADJUST ITS BUDGET</em>
      </div>

      <div className="nb-rules">
        {['5 PAGES INCL. FIGURES & TABLES', '11PT FONT OR LARGER', 'STANDARD MARGINS', 'REFERENCES & APPENDIX DON’T COUNT'].map((rule) => (
          <span key={rule}>{rule}</span>
        ))}
      </div>

      <div className="nb-pages" aria-label="Page layout preview">
        {Array.from({ length: pageCount }, (_, page) => {
          const extra = page >= PAGE_LIMIT;
          return (
            <div key={page} className={`nb-page ${extra ? 'nb-page--over' : ''}`}>
              <div className="nb-page__sheet">
                {(pages[page] ?? []).map((slice) => (
                  <button
                    key={`${slice.key}-${page}`}
                    type="button"
                    className={`nb-block ${slice.index === active ? 'nb-block--on' : ''}`}
                    style={{ flexGrow: slice.size, ['--c' as string]: SECTIONS[slice.index].color }}
                    onClick={() => setActive(slice.index)}
                    aria-label={`${SECTIONS[slice.index].name}, page ${page + 1}`}
                  >
                    {slice.first && slice.size >= 0.2 && <span>{SECTIONS[slice.index].name}</span>}
                    <i aria-hidden="true" />
                  </button>
                ))}
              </div>
              <div className="nb-page__num">{extra ? `PAGE ${page + 1} · OVER LIMIT` : `PAGE ${page + 1}`}</div>
            </div>
          );
        })}
        {['REFERENCES', 'APPENDIX · OPTIONAL'].map((label) => (
          <div key={label} className="nb-page nb-page--free">
            <div className="nb-page__sheet">
              <div className="nb-free">
                <b>{label}</b>
                <span>DOESN’T COUNT</span>
              </div>
            </div>
            <div className="nb-page__num">OUTSIDE LIMIT</div>
          </div>
        ))}
      </div>

      <div className="nb-grid">
        <ol className="nb-list">
          {SECTIONS.map((item, index) => (
            <li key={item.key} className={index === active ? 'nb-list__item--on' : ''} style={{ ['--c' as string]: item.color }}>
              <button type="button" className="nb-list__pick" onClick={() => setActive(index)} aria-pressed={index === active}>
                <i aria-hidden="true" />
                <span>{String(index + 1).padStart(2, '0')}</span>
                {item.name}
              </button>
              <div className="nb-list__budget">
                <button type="button" onClick={() => nudge(index, -STEP)} aria-label={`Less space for ${item.name}`} disabled={budgets[index] <= STEP}>
                  −
                </button>
                <b>{budgets[index].toFixed(2)}</b>
                <button type="button" onClick={() => nudge(index, STEP)} aria-label={`More space for ${item.name}`}>
                  +
                </button>
              </div>
            </li>
          ))}
          <li className={`nb-total ${over ? 'nb-total--over' : ''}`} aria-live="polite">
            <span>{over ? 'OVER THE LIMIT · CUT SOMETHING' : 'TOTAL PAGES'}</span>
            <b>
              {total.toFixed(2)}
              <small>/5.00</small>
            </b>
          </li>
        </ol>

        <div className="nb-detail" key={section.key} style={{ ['--c' as string]: section.color }}>
          <div className="nb-detail__head">
            <span>SECTION {String(active + 1).padStart(2, '0')}</span>
            <h4>{section.name}</h4>
          </div>
          <p className="nb-detail__lead">{section.lead}</p>
          <div className="nb-detail__label">{section.key === 'results' ? 'AT MINIMUM' : 'INCLUDE'}</div>
          <ul>
            {section.include.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          {section.key === 'results' && (
            <p className="nb-detail__warn">Report in-sample and out-of-sample results separately. Every number net of costs.</p>
          )}
          {section.key === 'hypothesis' && (
            <p className="nb-detail__warn">State it before the results, not after.</p>
          )}
          <div className="nb-feeds">
            <span>FEEDS</span>
            {section.feeds.map((feed) => (
              <em key={feed}>{feed}</em>
            ))}
          </div>
        </div>
      </div>

      <p className="nb-fine">
        Budgets are a suggested starting point. Judges are not required to read the appendix, so anything that matters
        belongs in the five pages.
      </p>

      <style>{`
        .nb {
          font-family: 'Space Mono', monospace;
          border: 1px solid #1d4f83;
          background: linear-gradient(180deg, rgba(7, 13, 26, 0.96), rgba(4, 8, 18, 0.98));
          box-shadow: 0 0 0 3px rgba(5, 11, 23, 0.98), 0 0 36px rgba(4, 74, 148, 0.16);
          padding: 18px;
        }

        .nb-top {
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

        .nb-top em { font-style: normal; font-size: 9px; letter-spacing: 1.4px; color: #63f6ff; }

        .nb-rules {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 16px;
        }

        .nb-rules span {
          padding: 4px 8px;
          border: 1px solid rgba(51, 209, 122, 0.45);
          background: rgba(51, 209, 122, 0.06);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1px;
          color: #9df0c0;
        }

        .nb-pages {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(88px, 1fr));
          gap: 12px;
          margin-bottom: 18px;
        }

        .nb-page__sheet {
          display: flex;
          flex-direction: column;
          gap: 3px;
          aspect-ratio: 8.5 / 11;
          padding: 8px 7px;
          background: #0d1626;
          border: 1px solid #294f7d;
          box-shadow: 3px 3px 0 #02060e;
        }

        .nb-page--over .nb-page__sheet {
          border-color: #ff5a6e;
          background: repeating-linear-gradient(135deg, rgba(255, 90, 110, 0.12) 0 6px, #140810 6px 12px);
        }

        .nb-page--free .nb-page__sheet {
          border-style: dashed;
          border-color: #3a4a62;
          background: rgba(13, 22, 38, 0.4);
          box-shadow: none;
        }

        .nb-page__num {
          margin-top: 6px;
          font-family: 'Orbitron', sans-serif;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 1.2px;
          text-align: center;
          color: #5f7390;
        }

        .nb-page--over .nb-page__num { color: #ff5a6e; }

        .nb-block {
          position: relative;
          flex-basis: 0;
          min-height: 6px;
          padding: 3px 4px;
          border: 1px solid var(--c);
          background: color-mix(in srgb, var(--c) 18%, transparent);
          overflow: hidden;
          text-align: left;
          cursor: pointer;
          transition: background 150ms ease, box-shadow 150ms ease;
        }

        .nb-block span {
          position: relative;
          z-index: 1;
          display: block;
          font-family: 'Orbitron', sans-serif;
          font-size: 7px;
          font-weight: 700;
          letter-spacing: 0.6px;
          line-height: 1.25;
          color: #fff;
        }

        .nb-block i {
          position: absolute;
          inset: 14px 5px 4px;
          background: repeating-linear-gradient(180deg, color-mix(in srgb, var(--c) 35%, transparent) 0 2px, transparent 2px 6px);
          opacity: 0.6;
        }

        .nb-block:hover,
        .nb-block--on {
          background: color-mix(in srgb, var(--c) 38%, transparent);
          box-shadow: 0 0 12px color-mix(in srgb, var(--c) 55%, transparent);
        }

        .nb-block:focus-visible { outline: 2px solid #fff; outline-offset: 1px; }

        .nb-free {
          display: grid;
          place-content: center;
          gap: 6px;
          height: 100%;
          text-align: center;
        }

        .nb-free b {
          font-family: 'Orbitron', sans-serif;
          font-size: 8px;
          letter-spacing: 1px;
          color: #7e90ab;
        }

        .nb-free span {
          padding: 2px 4px;
          border: 1px solid #5f7390;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.8px;
          color: #5f7390;
          transform: rotate(-6deg);
        }

        .nb-grid { display: grid; gap: 16px; }

        @media (min-width: 900px) {
          .nb-grid { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
        }

        .nb-list {
          display: grid;
          gap: 4px;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .nb-list li {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          border: 1px solid rgba(41, 79, 125, 0.5);
          background: rgba(4, 9, 19, 0.9);
          transition: border-color 150ms ease;
        }

        .nb-list .nb-list__item--on { border-color: var(--c); }

        .nb-list__pick {
          display: flex;
          flex: 1;
          align-items: center;
          gap: 8px;
          min-width: 0;
          padding: 8px 10px;
          font-family: 'Orbitron', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.2px;
          color: #c9d4e4;
          text-align: left;
          cursor: pointer;
        }

        .nb-list__pick i { flex: none; width: 8px; height: 8px; background: var(--c); }
        .nb-list__pick span { color: #5f7390; }
        .nb-list__item--on .nb-list__pick { color: #fff; }
        .nb-list__pick:focus-visible { outline: 2px solid #63f6ff; outline-offset: -2px; }

        .nb-list__budget {
          display: flex;
          align-items: center;
          gap: 2px;
          padding-right: 6px;
        }

        .nb-list__budget button {
          width: 22px;
          height: 22px;
          border: 1px solid #294f7d;
          background: #07101d;
          color: #9cc9ff;
          font-size: 13px;
          line-height: 1;
          cursor: pointer;
        }

        .nb-list__budget button:hover:not(:disabled) { border-color: #33d17a; color: #fff; }
        .nb-list__budget button:disabled { opacity: 0.35; cursor: default; }

        .nb-list__budget b {
          min-width: 40px;
          font-family: 'VT323', monospace;
          font-size: 20px;
          font-weight: 400;
          text-align: center;
          color: #fff4c8;
        }

        .nb-list .nb-total {
          padding: 8px 10px;
          border: 2px solid #33d17a;
          background: rgba(51, 209, 122, 0.06);
        }

        .nb-total span {
          font-family: 'Orbitron', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.6px;
          color: #33d17a;
        }

        .nb-total b {
          font-family: 'VT323', monospace;
          font-size: 30px;
          font-weight: 400;
          color: #fff;
        }

        .nb-total small { font-size: 18px; color: #5f7390; }
        .nb-list .nb-total--over { border-color: #ff5a6e; background: rgba(255, 90, 110, 0.08); }
        .nb-total--over span, .nb-total--over b { color: #ff5a6e; }

        .nb-detail {
          padding: 14px 16px;
          border: 1px solid var(--c);
          border-left-width: 4px;
          background: rgba(4, 9, 19, 0.92);
          animation: nbIn 260ms ease-out both;
        }

        @keyframes nbIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: none; }
        }

        .nb-detail__head span {
          font-family: 'Orbitron', sans-serif;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.8px;
          color: var(--c);
        }

        .nb-detail__head h4 {
          margin: 4px 0 8px;
          font-family: 'Orbitron', sans-serif;
          font-size: 16px;
          font-weight: 800;
          letter-spacing: 1.6px;
          color: #fff;
        }

        .nb-detail__lead {
          margin: 0 0 12px;
          font-size: 13px;
          line-height: 1.65;
          color: #c9d4e4;
        }

        .nb-detail__label {
          margin-bottom: 6px;
          font-family: 'Orbitron', sans-serif;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 2px;
          color: #7e90ab;
        }

        .nb-detail ul {
          display: grid;
          gap: 4px;
          margin: 0 0 12px;
          padding: 0;
          list-style: none;
        }

        .nb-detail li {
          position: relative;
          padding-left: 16px;
          font-size: 12px;
          line-height: 1.55;
          color: #e6edf7;
        }

        .nb-detail li::before {
          content: '▸';
          position: absolute;
          left: 0;
          color: var(--c);
        }

        .nb-detail__warn {
          margin: 0 0 12px;
          padding: 8px 10px;
          border-left: 3px solid #ffb84d;
          background: rgba(255, 184, 77, 0.07);
          font-size: 11px;
          line-height: 1.6;
          color: #ffd99a;
        }

        .nb-feeds {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px;
          padding-top: 10px;
          border-top: 1px dashed rgba(41, 79, 125, 0.7);
        }

        .nb-feeds span {
          font-family: 'Orbitron', sans-serif;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 2px;
          color: #FA4616;
        }

        .nb-feeds em {
          padding: 2px 7px;
          border: 1px solid rgba(99, 246, 255, 0.5);
          font-style: normal;
          font-size: 10px;
          font-weight: 700;
          color: #63f6ff;
        }

        .nb-fine {
          margin: 14px 0 0;
          font-size: 11px;
          line-height: 1.6;
          color: #7e90ab;
        }

        @media (max-width: 480px) {
          .nb-pages { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
          .nb-block span { font-size: 6px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .nb-detail { animation: none; }
        }
      `}</style>
    </div>
  );
}
