import { Reveal } from '../Reveal';
import { Chapter, CopyBlock, SubHead } from './shell';

// Webull's backtesting starter: backtrader wired to Webull OpenAPI market data.
// The kit served from public/webull is Webull's example project with .env.example
// files added and its guide (docs/USAGE_EN.md) aligned with this track's rules.

const KIT_URL = '/webull/gqh-webull-backtrader-starter.zip';
const KIT_FILE = 'gqh-webull-backtrader-starter.zip';
const APPLY_DOCS_URL = 'https://developer.webull.com/apis/docs/authentication/IndividualApplicationAPI/';
const API_DOCS_URL = 'https://developer.webull.com/apis/docs';

const KIT_FILES: [string, string][] = [
  ['examples/backtest/main.py', 'The backtest entry point'],
  ['examples/strategies/', 'Two examples, dual_ma and portfolio. Yours goes here too'],
  ['webull_bt/', 'The WebullData feed and report generator; parameters in feed.py'],
  ['docs/USAGE_EN.md', 'The full guide: settings, writing a strategy, FAQ'],
  ['examples/live/', 'Simulated live and order placement. Optional, not scored'],
];

const KEY_STEPS = [
  { n: '01', t: 'LOG IN', d: 'Log in at webull.com and finish account opening if you haven’t.' },
  { n: '02', t: 'APPLY', d: 'Avatar → Developer Tool → OpenAPI Management → My Application, and submit.' },
  { n: '03', t: 'GENERATE A KEY', d: 'Once approved: API Keys Management → Generate Key, for an App Key and App Secret.' },
];

const SETUP = `# Python 3.11+, from the unzipped folder
uv sync                         # or: pip install -e . in a venv
cp examples/backtest/.env.example examples/backtest/.env
# put WEBULL_APP_KEY and WEBULL_APP_SECRET in that .env, then
uv run python examples/backtest/main.py`;

const COSTS = `# examples/backtest/main.py, after cerebro.broker.setcash(...)
cerebro.broker.setcommission(commission=0.0005)   # 5 bps per side
cerebro.broker.set_slippage_perc(0.0005)          # 5 bps slippage`;

export function WebullStarter({ index }: { index: number }) {
  return (
    <Chapter
      id="st-webull"
      index={index}
      kicker="THE WEBULL STARTER"
      title="Start from the Webull kit"
      lede="Webull, the track sponsor, put together a starter that connects the open-source backtrader engine to Webull OpenAPI market data. It fetches bars, runs the backtest, prints return, drawdown and Sharpe, and writes an interactive chart report, so all you have to write is the strategy. Any market the Webull API supports is allowed."
    >
      <Reveal>
        <div className="st-download">
          <div>
            <span>STARTER KIT · PYTHON 3.11+ · BACKTRADER</span>
            <strong>Webull backtesting starter</strong>
            <em>Two example strategies, a chart report and the full guide. Bring your own API credentials.</em>
          </div>
          <div className="st-download__actions">
            <a className="st-btn st-btn--primary" href={KIT_URL} download={KIT_FILE}>
              DOWNLOAD KIT .ZIP ↓
            </a>
          </div>
        </div>
      </Reveal>
      <Reveal>
        <div className="st-kit">
          {KIT_FILES.map(([name, what]) => (
            <div key={name} className="st-kit__row">
              <code>{name}</code>
              <span>{what}</span>
            </div>
          ))}
        </div>
      </Reveal>

      <SubHead>GET YOUR CREDENTIALS</SubHead>
      <div className="wb-key">
        {KEY_STEPS.map((step, index) => (
          <Reveal key={step.n} delay={index * 90}>
            <div className="st-rule">
              <div className="st-rule__k">{step.n}</div>
              <div className="st-rule__t">{step.t}</div>
              <p>{step.d}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal>
        <p className="st-note st-note--amber">
          <span>APPLY EARLY</span>
          {/* One flex item, so the link sits inline with the text. */}
          <span>
            Webull estimates approval at 1 to 2 working days. You also need market data access for what you trade, or
            requests come back 403. See{' '}
            <a href={APPLY_DOCS_URL} target="_blank" rel="noreferrer">
              Webull’s application guide
            </a>{' '}
            for the full steps.
          </span>
        </p>
      </Reveal>

      <SubHead>RUN IT, THEN MAKE IT YOURS</SubHead>
      <div className="wb-split">
        <Reveal>
          <CopyBlock text={SETUP} label="FIRST BACKTEST" />
        </Reveal>
        <Reveal delay={120}>
          <p className="wb-fine">
            Pick the market, symbols, bar size and date range with <code>WEBULL_CATEGORY</code>,{' '}
            <code>WEBULL_SYMBOLS</code>, <code>WEBULL_TIMESPAN</code> and <code>WEBULL_FROMDATE</code>/
            <code>TODATE</code> in <code>.env</code>. Add a strategy as a file in <code>examples/strategies/</code> that
            ends with <code>STRATEGY_CLASS = YourClass</code>, then set <code>WEBULL_STRATEGY</code> to its name.
          </p>
          <p className="wb-fine">
            Everything else is in <code>docs/USAGE_EN.md</code> and the{' '}
            <a href={API_DOCS_URL} target="_blank" rel="noreferrer">
              Webull API docs
            </a>. Never commit <code>.env</code>.
          </p>
        </Reveal>
      </div>

      <SubHead>TRACK RULES STILL APPLY</SubHead>
      <div className="wb-split wb-split--even">
        <Reveal>
          <article className="st-gotcha st-gotcha--red">
            <h4>NET OF COSTS</h4>
            <p>The example trades for free. Add costs before you report anything, and justify the bps for your market.</p>
            <CopyBlock text={COSTS} label="ADD COSTS" />
          </article>
        </Reveal>
        <Reveal delay={120}>
          <article className="st-gotcha st-gotcha--amber">
            <h4>HOLD OUT THE END</h4>
            <p>
              The example backtests the whole range it fetches. Set your out-of-sample period with the rule above, develop
              with <code>WEBULL_TODATE</code> before it, and run the held-out range once at the end.
            </p>
          </article>
        </Reveal>
      </div>
      <Reveal>
        <p className="st-note st-note--cyan">
          <span>SCORED ON THE NOTE</span>
          The kit’s backtest summary is evidence for your note. Your score comes from the rubric further down. Paper and
          live trading aren’t scored.
        </p>
      </Reveal>

      <style>{`
        .wb-key { display: grid; gap: 12px; }
        @media (min-width: 900px) { .wb-key { grid-template-columns: repeat(3, minmax(0, 1fr)); } }

        .wb-split { display: grid; grid-template-columns: minmax(0, 1fr); gap: 16px; }
        @media (min-width: 960px) { .wb-split { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); align-items: start; } }

        .wb-split--even { align-items: stretch; }
        @media (min-width: 960px) { .wb-split--even { align-items: stretch; } }
        .wb-split--even > * { height: 100%; }
        .wb-split .st-gotcha { height: 100%; }
        .wb-split .st-copy { margin-top: 14px; }

        .wb-fine { margin: 0 0 12px; font-size: 13px; line-height: 1.75; color: #c9d4e4; }
      `}</style>
    </Chapter>
  );
}
