import { useState } from 'react';

// The brief asks: who is on the other side of your trade, and why does the
// opportunity persist? Each edge source answers that differently.
type FieldKey = 'universe' | 'behavior' | 'horizon' | 'counterparty' | 'persistence' | 'prediction' | 'falsifier';

type Source = {
  key: string;
  tab: string;
  glyph: string;
  definition: string;
  otherSide: string;
  example: string;
  cite?: string;
  kill: string;
  options: Record<Exclude<FieldKey, 'universe' | 'horizon'>, string[]>;
};

const SOURCES: Source[] = [
  {
    key: 'risk',
    tab: 'RISK PREMIUM',
    glyph: '%',
    definition: 'You are paid for holding a risk that other investors would rather not hold.',
    otherSide: 'Investors who pay to shed the risk: hedgers, insurance buyers, holders who can’t stomach drawdowns.',
    example: 'Value and momentum premia show up across stocks, bonds, currencies and commodities.',
    cite: 'Asness, Moskowitz & Pedersen, Value and Momentum Everywhere (2013); Ilmanen, Expected Returns (2011)',
    kill: 'The risk arrives all at once, or the trade gets crowded and the premium shrinks.',
    options: {
      behavior: ['earn a positive carry', 'outperform when cheap on value measures', 'pay out steadily with rare large losses'],
      counterparty: [
        'hedgers pay a premium to offload the risk',
        'most investors avoid assets that lose in bad times',
        'leverage-constrained investors overpay for safe-looking assets',
      ],
      persistence: [
        'the risk is real and the losses do happen',
        'demand for the hedge does not go away',
        'few investors can hold the risk through a drawdown',
      ],
      prediction: [
        'higher returns for the riskier leg, net of costs',
        'losses clustered in stress periods',
        'the premium in more than one market',
      ],
      falsifier: [
        'the returns are explained by market beta alone',
        'the premium disappears after costs',
        'all the profit comes from one year',
      ],
    },
  },
  {
    key: 'behavior',
    tab: 'BEHAVIORAL BIAS',
    glyph: '?!',
    definition: 'Other traders make systematic mistakes, and those mistakes leave patterns in prices.',
    otherSide: 'Investors who underreact to news, then chase the move late, or who anchor on old prices.',
    example: 'Time-series momentum: an asset’s own past 12-month return predicts its next month across futures markets.',
    cite: 'Moskowitz, Ooi & Pedersen, Time Series Momentum (2012)',
    kill: 'The bias is arbitraged away, or the pattern reverses sharply in a crash.',
    options: {
      behavior: ['keep trending in the direction of recent returns', 'revert after an overreaction', 'drift after earnings surprises'],
      counterparty: [
        'investors underreact to new information at first',
        'investors overreact to vivid news and then correct',
        'traders anchor on past prices and adjust slowly',
      ],
      persistence: [
        'the bias is human and does not go away',
        'betting against it is risky for arbitrageurs with short horizons',
        'the pattern is noisy enough that few trade it at scale',
      ],
      prediction: [
        'returns that depend on the strength of the past move',
        'the effect weakening after costs at short horizons',
        'the same pattern in markets we did not tune on',
      ],
      falsifier: [
        'nearby lookbacks fail (a lone spike, not a plateau)',
        'the out-of-sample Sharpe is near zero',
        'the profit is just a known momentum factor in disguise',
      ],
    },
  },
  {
    key: 'structural',
    tab: 'STRUCTURAL CONSTRAINT',
    glyph: '#',
    definition: 'Rules, mandates or institutional habits force some players to trade regardless of price.',
    otherSide: 'Index funds rebalancing on a set date, funds that must sell downgraded bonds, products rolling futures on a schedule.',
    example: 'Predictable, mandated flows such as index rebalances and futures rolls.',
    kill: 'The rule changes, or enough traders front-run the flow that its price impact disappears.',
    options: {
      behavior: ['move ahead of a scheduled rebalance', 'reverse after forced selling ends', 'misprice around a futures roll'],
      counterparty: [
        'index funds must trade on a fixed date',
        'mandates force funds to sell regardless of price',
        'products roll futures on a published schedule',
      ],
      persistence: [
        'the rule is written down and slow to change',
        'the forced trader cares about tracking, not price',
        'the flow is large compared with the liquidity on that day',
      ],
      prediction: [
        'price pressure concentrated around the event dates',
        'larger effects when the forced flow is larger',
        'the effect fading once the flow is done',
      ],
      falsifier: [
        'the effect is gone in recent years',
        'the profit does not survive realistic spreads on event days',
        'there is no link between flow size and returns',
      ],
    },
  },
  {
    key: 'liquidity',
    tab: 'LIQUIDITY PROVISION',
    glyph: '⇄',
    definition: 'You are paid for supplying immediacy: taking the other side when someone needs to trade now.',
    otherSide: 'Hurried sellers and buyers who pay you, through the price, to trade right now.',
    example: 'Short-term reversal: buying what was sold hard yesterday and selling what was bought hard.',
    kill: 'Costs eat the edge, or the hurried trader knew something you didn’t.',
    options: {
      behavior: ['bounce back after a sharp one-day drop', 'revert after heavy order imbalance', 'trade at a discount during volume spikes'],
      counterparty: [
        'impatient sellers accept a worse price to exit now',
        'forced liquidations push prices past fair value',
        'large orders move the price temporarily',
      ],
      persistence: [
        'someone always needs to trade in a hurry',
        'providing liquidity in a selloff takes balance sheet few have',
        'the trade loses in exactly the moments most traders panic',
      ],
      prediction: [
        'stronger reversals after larger, high-volume moves',
        'the edge shrinking as costs double',
        'losses when moves are driven by real news',
      ],
      falsifier: [
        'the edge disappears at realistic spreads',
        'reversals do not depend on the size of the move',
        'results depend on a same-bar close for signal and fill',
      ],
    },
  },
];

const UNIVERSE = ['large-cap US equities', 'liquid sector ETFs', 'equity index futures', 'major FX pairs', 'large-cap crypto'];
const HORIZON = ['days', 'weeks', 'one to three months', 'a year'];

const FIELDS: { key: FieldKey; label: string }[] = [
  { key: 'universe', label: 'UNIVERSE' },
  { key: 'behavior', label: 'BEHAVIOR' },
  { key: 'horizon', label: 'HORIZON' },
  { key: 'counterparty', label: 'WHO’S ON THE OTHER SIDE' },
  { key: 'persistence', label: 'WHY IT PERSISTS' },
  { key: 'prediction', label: 'TESTABLE PREDICTION' },
  { key: 'falsifier', label: 'IT FAILS IF' },
];

const defaultsFor = (source: Source, keep?: Record<FieldKey, string>): Record<FieldKey, string> => ({
  universe: keep?.universe ?? UNIVERSE[0],
  horizon: keep?.horizon ?? HORIZON[2],
  behavior: source.options.behavior[0],
  counterparty: source.options.counterparty[0],
  persistence: source.options.persistence[0],
  prediction: source.options.prediction[0],
  falsifier: source.options.falsifier[0],
});

const stamp = () => {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
};

export function HypothesisBuilder() {
  const [active, setActive] = useState(1);
  const [fields, setFields] = useState<Record<FieldKey, string>>(() => defaultsFor(SOURCES[1]));
  const [field, setField] = useState<FieldKey>('counterparty');
  const [time, setTime] = useState(stamp);
  const [copied, setCopied] = useState(false);
  const source = SOURCES[active];

  const chooseSource = (index: number) => {
    setActive(index);
    setFields((current) => defaultsFor(SOURCES[index], current));
    setTime(stamp());
  };

  const update = (key: FieldKey, value: string) => {
    setFields((current) => ({ ...current, [key]: value }));
    setTime(stamp());
  };

  const optionsFor = (key: FieldKey) => (key === 'universe' ? UNIVERSE : key === 'horizon' ? HORIZON : source.options[key]);

  const blank = (key: FieldKey) => {
    const value = fields[key].trim();
    return (
      <button
        type="button"
        className={`hb-blank ${field === key ? 'hb-blank--on' : ''} ${value ? '' : 'hb-blank--empty'}`}
        onClick={() => setField(key)}
      >
        {value || `[${FIELDS.find((item) => item.key === key)!.label.toLowerCase()}]`}
      </button>
    );
  };

  const text =
    `We expect ${fields.universe || '[universe]'} to ${fields.behavior || '[behavior]'} over ${fields.horizon || '[horizon]'} ` +
    `because ${fields.counterparty || '[counterparty]'}, and the edge persists because ${fields.persistence || '[persistence]'}. ` +
    `If true, we should see ${fields.prediction || '[prediction]'}; it fails if ${fields.falsifier || '[falsifier]'}.`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`HYPOTHESIS · ${source.tab} · written ${time}\n${text}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const fieldMeta = FIELDS.find((item) => item.key === field)!;

  return (
    <div className="hb">
      <div className="hb-top">
        <span>HYPOTHESIS BUILDER · WHO IS ON THE OTHER SIDE?</span>
        <em>PICK AN EDGE SOURCE · FILL THE BLANKS</em>
      </div>

      <div className="hb-tabs" role="tablist" aria-label="Edge sources">
        {SOURCES.map((item, index) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={index === active}
            className={`hb-tab ${index === active ? 'hb-tab--on' : ''}`}
            onClick={() => chooseSource(index)}
          >
            <i aria-hidden="true">{item.glyph}</i>
            {item.tab}
          </button>
        ))}
      </div>

      <div className="hb-grid">
        <div className="hb-source" role="tabpanel" key={source.key}>
          <p className="hb-source__def">{source.definition}</p>
          <dl>
            <div>
              <dt>THE OTHER SIDE</dt>
              <dd>{source.otherSide}</dd>
            </div>
            <div>
              <dt>CLASSIC EXAMPLE</dt>
              <dd>
                {source.example}
                {source.cite && <cite>{source.cite}</cite>}
              </dd>
            </div>
            <div className="hb-source__kill">
              <dt>WHAT WOULD KILL IT</dt>
              <dd>{source.kill}</dd>
            </div>
          </dl>
        </div>

        <div className="hb-composer">
          <div className="hb-memo">
            <div className="hb-memo__head">
              <span>HYPOTHESIS · {source.tab}</span>
              <em className="hb-memo__stamp">WRITTEN BEFORE RESULTS · {time}</em>
            </div>
            <p className="hb-memo__text" aria-live="polite">
              We expect {blank('universe')} to {blank('behavior')} over {blank('horizon')} because {blank('counterparty')}, and
              the edge persists because {blank('persistence')}. If true, we should see {blank('prediction')}; it fails if{' '}
              {blank('falsifier')}.
            </p>
            <button type="button" className="hb-copy" onClick={copy}>
              {copied ? 'COPIED ✓' : 'COPY HYPOTHESIS'}
            </button>
          </div>

          <div className="hb-editor">
            <div className="hb-editor__fields" role="group" aria-label="Choose a blank to edit">
              {FIELDS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  aria-pressed={field === item.key}
                  className={`hb-chip hb-chip--field ${field === item.key ? 'hb-chip--on' : ''}`}
                  onClick={() => setField(item.key)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="hb-editor__label">{fieldMeta.label} · PICK ONE OR WRITE YOUR OWN</div>
            <div className="hb-editor__options">
              {optionsFor(field).map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={fields[field] === option}
                  className={`hb-chip ${fields[field] === option ? 'hb-chip--pick' : ''}`}
                  onClick={() => update(field, option)}
                >
                  {option}
                </button>
              ))}
            </div>
            <label className="hb-input">
              <span className="hb-sr">{fieldMeta.label}</span>
              <input type="text" value={fields[field]} onChange={(event) => update(field, event.target.value)} placeholder="Write your own…" />
            </label>
          </div>
        </div>
      </div>

      <style>{`
        .hb {
          font-family: 'Space Mono', monospace;
          border: 1px solid #1d4f83;
          background: linear-gradient(180deg, rgba(7, 13, 26, 0.96), rgba(4, 8, 18, 0.98));
          box-shadow: 0 0 0 3px rgba(5, 11, 23, 0.98), 0 0 36px rgba(51, 209, 122, 0.1);
          padding: 18px;
        }

        .hb-top {
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

        .hb-top em { font-style: normal; font-size: 9px; letter-spacing: 1.4px; color: #63f6ff; }

        .hb-tabs {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 6px;
          margin-bottom: 14px;
        }

        .hb-tab {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border: 1px solid #294f7d;
          background: #07101d;
          color: #9cc9ff;
          font-family: 'Orbitron', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.4px;
          text-align: left;
          cursor: pointer;
          transition: border-color 150ms ease, background 150ms ease, color 150ms ease;
        }

        .hb-tab i {
          display: grid;
          place-items: center;
          flex: none;
          min-width: 28px;
          height: 28px;
          border: 2px solid currentColor;
          font-family: 'Press Start 2P', monospace;
          font-size: 10px;
          font-style: normal;
        }

        .hb-tab:hover { border-color: #63f6ff; color: #fff; }
        .hb-tab--on { border-color: #33d17a; background: rgba(51, 209, 122, 0.12); color: #33d17a; box-shadow: 0 0 16px rgba(51, 209, 122, 0.18); }
        .hb-tab:focus-visible { outline: 2px solid #63f6ff; outline-offset: 2px; }

        .hb-grid { display: grid; gap: 16px; }

        @media (min-width: 980px) {
          .hb-grid { grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr); }
        }

        .hb-source {
          padding: 14px 16px;
          border: 1px solid rgba(41, 79, 125, 0.6);
          border-left: 4px solid #33d17a;
          background: rgba(4, 9, 19, 0.9);
          animation: hbIn 260ms ease-out both;
        }

        @keyframes hbIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: none; }
        }

        .hb-source__def {
          margin: 0 0 14px;
          font-size: 15px;
          line-height: 1.6;
          color: #fff;
        }

        .hb-source dl { display: grid; gap: 12px; margin: 0; }

        .hb-source dt {
          margin-bottom: 3px;
          font-family: 'Orbitron', sans-serif;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 2px;
          color: #33d17a;
        }

        .hb-source dd {
          margin: 0;
          font-size: 12px;
          line-height: 1.65;
          color: #c9d4e4;
        }

        .hb-source cite {
          display: block;
          margin-top: 4px;
          font-style: normal;
          font-size: 11px;
          color: #9cc9ff;
        }

        .hb-source cite::before { content: '↳ '; color: #5f7390; }

        .hb-source__kill { padding-top: 10px; border-top: 1px dashed rgba(41, 79, 125, 0.7); }
        .hb-source .hb-source__kill dt { color: #ff5a6e; }

        .hb-composer { display: grid; gap: 12px; align-content: start; }

        .hb-memo {
          position: relative;
          padding: 14px 16px 16px;
          border: 1px solid rgba(255, 244, 200, 0.35);
          background:
            repeating-linear-gradient(180deg, transparent 0 27px, rgba(156, 201, 255, 0.06) 27px 28px),
            #0c1424;
          box-shadow: 4px 4px 0 #02060e;
        }

        .hb-memo__head {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          gap: 6px 12px;
          margin-bottom: 10px;
          font-family: 'Orbitron', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.6px;
          color: #fff4c8;
        }

        .hb-memo__stamp {
          padding: 2px 6px;
          border: 2px solid #FA4616;
          font-style: normal;
          font-size: 8px;
          letter-spacing: 1.2px;
          color: #FA4616;
          transform: rotate(-2deg);
        }

        .hb-memo__text {
          margin: 0 0 14px;
          font-size: 14px;
          line-height: 2;
          color: #e6edf7;
        }

        .hb-blank {
          display: inline;
          padding: 1px 4px;
          border: 0;
          border-bottom: 2px solid #33d17a;
          background: rgba(51, 209, 122, 0.1);
          color: #9df0c0;
          font: inherit;
          line-height: 1.6;
          text-align: left;
          cursor: pointer;
          transition: background 150ms ease;
        }

        .hb-blank:hover { background: rgba(51, 209, 122, 0.2); }
        .hb-blank--on { background: rgba(99, 246, 255, 0.16); border-color: #63f6ff; color: #fff; }
        .hb-blank--empty { border-color: #ffb84d; background: rgba(255, 184, 77, 0.1); color: #ffd99a; }
        .hb-blank:focus-visible { outline: 2px solid #63f6ff; outline-offset: 1px; }

        .hb-copy {
          padding: 8px 14px;
          border: 2px solid #044a94;
          background: #FA4616;
          color: #fff;
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.2px;
          box-shadow: 3px 3px 0 #044a94;
          cursor: pointer;
        }

        .hb-copy:hover { box-shadow: 0 0 18px rgba(250, 70, 22, 0.5), 3px 3px 0 #044a94; }

        .hb-editor {
          padding: 12px;
          border: 1px solid rgba(41, 79, 125, 0.6);
          background: rgba(4, 9, 19, 0.9);
        }

        .hb-editor__fields,
        .hb-editor__options {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }

        .hb-editor__fields { padding-bottom: 10px; margin-bottom: 10px; border-bottom: 1px dashed rgba(41, 79, 125, 0.7); }

        .hb-editor__label {
          margin-bottom: 8px;
          font-family: 'Orbitron', sans-serif;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.8px;
          color: #63f6ff;
        }

        .hb-chip {
          padding: 5px 9px;
          border: 1px solid #294f7d;
          background: #07101d;
          color: #c9d4e4;
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          line-height: 1.4;
          text-align: left;
          cursor: pointer;
          transition: border-color 140ms ease, background 140ms ease, color 140ms ease;
        }

        .hb-chip:hover { border-color: #63f6ff; color: #fff; }
        .hb-chip:focus-visible { outline: 2px solid #63f6ff; outline-offset: 1px; }

        .hb-chip--field {
          font-family: 'Orbitron', sans-serif;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 1.2px;
          color: #7e90ab;
        }

        .hb-chip--on { border-color: #63f6ff; background: rgba(99, 246, 255, 0.12); color: #63f6ff; }
        .hb-chip--pick { border-color: #33d17a; background: rgba(51, 209, 122, 0.14); color: #fff; }

        .hb-input { display: block; margin-top: 10px; }

        .hb-input input {
          width: 100%;
          padding: 9px 10px;
          border: 1px solid #294f7d;
          background: #050a14;
          color: #fff;
          font-family: 'Space Mono', monospace;
          font-size: 12px;
          outline: none;
        }

        .hb-input input:focus { border-color: #33d17a; box-shadow: 0 0 12px rgba(51, 209, 122, 0.2); }

        .hb-sr {
          position: absolute;
          width: 1px;
          height: 1px;
          overflow: hidden;
          clip: rect(0 0 0 0);
          white-space: nowrap;
        }

        @media (prefers-reduced-motion: reduce) {
          .hb-source { animation: none; }
        }
      `}</style>
    </div>
  );
}
