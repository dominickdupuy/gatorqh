import { useEffect, useRef, useState } from 'react';
import { Reveal } from '../../Reveal';
import { Footer } from '../../Footer';
import massiveLogo from '../../../../assets/Massive.png';
import { BootArrival, BriefingHud, Chapter, CopyBlock, DecodeText, DeadlineClock, FinalChecklist, SubHead, TrackStyles, reducedMotion } from '../shell';
import { EventField } from './EventField';
import { ImpliedMoveLab } from './ImpliedMoveLab';
import { PayoffExplorer } from './PayoffExplorer';

type AppPage = 'home' | 'apply' | 'systematic-track';

const PAGE_TITLE = 'Massive Bonus Challenge: Trade the 8-K | Gator Quant Hacks 2026';

const DISCORD_URL = 'https://discord.gg/BNB82dKdf';
const DEVPOST_URL = 'https://gqhacks.devpost.com';
const NOTEBOOK_URL = '/massive/gqh-massive-8k-options-starter.ipynb';
const NOTEBOOK_FILE = 'gqh-massive-8k-options-starter.ipynb';
const KIT_URL = '/massive/gqh-massive-8k-starter-kit.zip';
const KIT_FILE = 'gqh-massive-8k-starter-kit.zip';
const OPTIONS_PLAYBOOK_URL = 'https://www.optionsplaybook.com/option-strategies/';

const CHAPTERS = [
  { id: 'mv-challenge', label: 'THE CHALLENGE' },
  { id: 'mv-options', label: 'OPTIONS 101' },
  { id: 'mv-strategies', label: 'THE FIVE STRATEGIES' },
  { id: 'mv-data', label: 'THE DATA' },
  { id: 'mv-notebook', label: 'THE NOTEBOOK' },
  { id: 'mv-judging', label: 'JUDGING & PRIZE' },
  { id: 'mv-weekend', label: 'THE WEEKEND' },
];

const BOOT_LINES = [
  '> GET /stocks/filings/8-K/vX/disclosures',
  '  119 EVENT TYPES · SINCE JAN 2022',
  '> GET /v3/reference/options/contracts?as_of=t_pre',
  '> SEAL WINDOW ████-██-██..████-██-██',
];

const HERO_LINES = ['TRADE THE', '8-K', 'WAS IT PRICED IN?'];

const HERO_SPECS = [
  ['SIGNAL', '8-K FILINGS'],
  ['INSTRUMENT', 'US OPTIONS'],
  ['QUANT NOTE', '≤ 5 PAGES'],
  ['JUDGED ON', 'RESEARCH, NOT P&L'],
];

const STORY = [
  {
    log: 'THE EVENT',
    label: 'A CFO IS APPOINTED',
    text: 'Something material happens at a company: a CEO leaves, a merger is signed, guidance is cut, a new CFO is named.',
  },
  {
    log: '≤ 4 BUSINESS DAYS',
    label: 'FORM 8-K FILED',
    text: 'The company must disclose it on a Form 8-K. Massive’s Filings & Disclosures dataset tags every 8-K since January 2022 with one of 119 event types.',
  },
  {
    log: 't_pre',
    label: 'THE NIGHT BEFORE',
    text: 'The session before the filing, the option chain has already put a price on how much the stock should move. It can’t know the news yet.',
  },
];

const TIERS = [
  {
    tier: 'BASELINE',
    who: 'EVERY TEAM',
    tone: 'green',
    deliver: 'One category, one strategy, one expiry bucket, and a written interpretation.',
    notebook: 'Runs end to end: CFO appointments × all five strategies × 3–6 month options, in-sample and out-of-sample.',
  },
  {
    tier: 'STRETCH',
    who: 'SEPARATES THE TOP TEAMS',
    tone: 'violet',
    deliver: 'Decay across horizons and expiry buckets, combined categories, a placebo control, timing refinements, a realistic trade specification.',
    notebook: 'Sections 7, 10, 11 and the timing stretch.',
  },
  {
    tier: 'SEALED WINDOW',
    who: 'JUDGES ONLY',
    tone: 'amber',
    deliver: 'Judges rerun your pipeline on dates you never saw.',
    notebook: 'The final section, one function call.',
  },
];

const VOCAB: { term: string; def: string }[] = [
  { term: 'CALL', def: 'The right to buy 100 shares at the strike, any time before expiry.' },
  { term: 'PUT', def: 'The right to sell 100 shares at the strike, any time before expiry.' },
  { term: 'STRIKE', def: 'The fixed price in the contract. O:AAPL260116C00150000 is a $150 call expiring 2026-01-16.' },
  { term: 'EXPIRY / DTE', def: 'When the contract dies. EXPIRY_BUCKETS picks contracts by days-to-expiry from the pre-event session.' },
  { term: 'PREMIUM', def: 'What the contract costs. Quoted per share, so multiply by 100 for one contract.' },
  { term: 'AT THE MONEY', def: 'The strike closest to the current stock price.' },
  { term: 'DEBIT / CREDIT', def: 'You pay to open (debit) or you are paid to open (credit).' },
  { term: 'LONG / SHORT', def: 'You bought the leg (long, a right) or you sold it (short, an obligation). You keep the premium either way.' },
  { term: 'COVERED / SECURED', def: 'A short leg backed by what it obliges you to deliver: shares for a short call, cash for a short put.' },
  { term: 'BREAK-EVEN', def: 'Where the stock must be at expiry for the trade to return zero.' },
  { term: 'IMPLIED MOVE', def: 'The cost of the ATM call plus the ATM put, divided by spot. What the chain says the event is worth, and the benchmark the whole challenge is built on.' },
  { term: 'IV', def: 'Implied volatility. It usually falls once the news is out. That is the volatility trap.' },
  { term: 'ASSIGNMENT', def: 'A short leg exercised against you. US equity options are American-style, so it can happen early, especially for a short call the day before a dividend goes ex.' },
];

const DATASETS = [
  {
    name: 'FILINGS & DISCLOSURES',
    endpoint: '/stocks/filings/8-K/vX/disclosures',
    use: 'The events: 119 AI-tagged 8-K event types, one row per event, coverage from January 2022.',
    links: [
      { label: 'ENDPOINT DOCS ↗', href: 'https://massive.com/docs/rest/stocks/filings/8-k-disclosures' },
      { label: 'TAXONOMY ↗', href: 'https://massive.com/docs/rest/stocks/filings/disclosure-categories' },
    ],
  },
  {
    name: 'OPTIONS CONTRACTS',
    endpoint: '/v3/reference/options/contracts?as_of=…',
    use: 'The chain exactly as it existed on the pre-event session, before anyone knew the news.',
    links: [{ label: 'ENDPOINT DOCS ↗', href: 'https://massive.com/docs/rest/options/contracts/all-contracts' }],
  },
  {
    name: 'OPTIONS AGGREGATES',
    endpoint: '/v2/aggs/ticker/O:…/range/1/day/…',
    use: 'Every leg’s daily close and volume from entry to expiry, and the stock price, recovered from the chain by put-call parity.',
    links: [{ label: 'ENDPOINT DOCS ↗', href: 'https://massive.com/docs/rest/options/aggregates/custom-bars' }],
  },
];

const NOT_INCLUDED = ['NO STOCK FEED', 'NO INDEX MEMBERSHIP FEED', 'NO EARNINGS CALENDAR'];

const KEY_STEPS = [
  { n: '01', t: 'ASK IN #MASSIVE', d: 'Ask in the #massive channel on the participant Discord. Massive creates keys with the right entitlements for teams on the challenge.' },
  { n: '02', t: 'KEEP IT OUT OF THE CODE', d: 'Put the key in the environment or a .env file next to the notebook. The notebook reads it from there and never needs it pasted into a cell.' },
  { n: '03', t: 'KEEP IT OUT OF GIT', d: 'Ignore .env and the .massive_cache/ folder. The cache holds raw API responses, and licensed data stays out of public repos.' },
];

const KEY_SETUP = `# .env next to the notebook (the setup script creates it)
MASSIVE_API_KEY=your-key-here

# or an environment variable, set before starting Jupyter
export MASSIVE_API_KEY=your-key-here          # macOS / Linux
$env:MASSIVE_API_KEY="your-key-here"          # Windows PowerShell

# .gitignore
.env
.massive_cache/`;

const KIT_FILES: [string, string][] = [
  ['gator-quant-hacks-8k-options-challenge.ipynb', 'The starter notebook'],
  ['setup.sh · setup.ps1', 'One-step setup for macOS / Linux and Windows'],
  ['requirements.txt', 'pandas, numpy, requests, matplotlib, ipykernel, JupyterLab'],
  ['.env.example', 'Template for your API key'],
  ['.gitignore', 'Keeps .env and .massive_cache/ out of git'],
  ['README.md', 'These instructions'],
];

const SETUP_STEPS = [
  { n: '01', t: 'INSTALL PYTHON 3.10+', d: 'From python.org if you don’t have it. On Windows, tick “Add python.exe to PATH”. Tested on 3.14.' },
  { n: '02', t: 'RUN THE SETUP SCRIPT', d: 'Unzip the kit and run the script from inside the folder. It creates a .venv, installs requirements.txt, registers the Jupyter kernel and creates .env from .env.example. Safe to re-run.' },
  { n: '03', t: 'ADD YOUR KEY', d: 'Open .env and replace your-key-here with your Massive API key from #massive: no spaces, no quotes.' },
  { n: '04', t: 'PICK THE KERNEL AND RUN ALL', d: 'Start Jupyter (or open the notebook in VS Code), choose the kernel “Python (Gator Quant Hacks .venv)” and run every cell. Section 1 prints “API key loaded (ends xxxx)”. The first run takes about ten minutes; responses are cached in .massive_cache/, so later runs take seconds.' },
];

const SETUP_UNIX = `# macOS / Linux, from the unzipped folder
./setup.sh
source .venv/bin/activate && jupyter lab`;

const SETUP_WINDOWS = `# Windows PowerShell, from the unzipped folder
powershell -ExecutionPolicy Bypass -File setup.ps1
.venv\\Scripts\\activate; jupyter lab`;

const SETUP_MANUAL = `python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\\Scripts\\activate
python -m pip install -r requirements.txt
python -m ipykernel install --user --name gator-quant-hacks --display-name "Python (Gator Quant Hacks .venv)"
cp .env.example .env               # then add your key`;

const TROUBLESHOOTING = [
  { q: '“Kernel not found” when opening the notebook', a: 'Run the setup script, or pick any Python 3.10+ kernel.' },
  { q: 'ModuleNotFoundError', a: 'The notebook is on a different kernel from the one you installed into. Run import sys; print(sys.executable) in a cell: it should end in .venv/bin/python.' },
  { q: 'Prompted for an API key', a: '.env is missing, in a different folder from the notebook, or still has the placeholder.' },
  { q: 'Slow iteration', a: 'Set RUN_PLACEBO = False in section 2 while exploring, which saves about eight minutes a run. Turn it back on before you submit.' },
  { q: 'Stale recent data', a: 'The cache never expires. Delete .massive_cache/ to refetch.' },
  { q: 'Already in Colab or an existing kernel?', a: 'Skip setup: run the optional %pip install -r requirements.txt cell at the top of the notebook, then restart the kernel.' },
];

const HORIZONS = [1, 2, 3, 5, 10, 21, 42, 63];

type Step = { n: string; title: string; does: string; knob?: string };

const NOTEBOOK_STEPS: Step[] = [
  { n: '1', title: 'SETUP', does: 'Plain requests against the REST API. api_get caches every response on disk by URL and follows next_url pagination. A full run is roughly 6,500 requests and about ten minutes on a fresh cache, most of it the placebo; reruns take seconds.' },
  { n: '2', title: 'CONFIGURATION', does: 'Everything a team may change lives in one cell. The horizons are fixed for every team so submissions are comparable.', knob: 'EVENT_TAG · windows · TOP_100 · EXPIRY_BUCKETS · OTM_PCT · ENTRY' },
  { n: '3', title: 'TRADING CALENDAR', does: 'Every horizon counts sessions, and there is no stock feed to read open days from, so the notebook builds the NYSE calendar from holiday rules and checks it against the days options traded.' },
  { n: '4', title: 'EVENTS', does: 'One request per tag across all filers, filtered to the top 100 and collapsed to one event per filer per filing date. Each event gets t_0, the filing session, and t_pre, the session before it.', knob: 'Combine tags by building your own event table here' },
  { n: '5', title: 'THE CHAIN & HIDDEN SPOT', does: 'For each event, the chain as of t_pre. Spot is recovered by put-call parity, S = K·e^(−rT) + C − P, iterating to the at-the-money strike. Then pick the expiry per bucket, the strikes, and pull every leg’s bars once for its whole life.' },
  { n: '6', title: 'THE P&L ENGINE', does: 'Five strategies from four legs, marked at entry and every exit, as P&L per $1 of stock at entry so a $60 and a $600 stock compare. The stock leg is the synthetic long.' },
  { n: '7', title: 'SCOREBOARD & PLACEBO', does: 'Mean P&L per strategy and horizon with a 95% bootstrap interval, then the same measurement on ordinary days for the same names. The finding is the gap between the two. Also the yardstick: |realized| ÷ implied move.' },
  { n: '8', title: 'OUT-OF-SAMPLE', does: 'The same pipeline on January to August 2026, which nothing above touched. A dozen or two events: enough to check the sign, not enough for anything stronger. Say so.' },
  { n: '9', title: 'ONE TICKER, END TO END', does: 'Only now does it pick a name, mechanically, and list the real OCC contracts used. One ticker is an illustration, not evidence.' },
  { n: '10', title: 'PARAMETER SENSITIVITY', does: 'The result across OTM distance, expiry bucket and entry session. A finding that lives at one parameter setting is not a finding.', knob: 'OTM_GRID · EXPIRY_BUCKETS · ENTRY' },
  { n: '11', title: 'SPECIFYING THE TRADE', does: 'Instrument and entry, exit horizon justified by the decay, costs (a flat haircut stands in for spreads unless your key has quotes), capacity from leg volume, and whether you are in the tradeable "post" regime.', knob: 'COST_HAIRCUT' },
  { n: '★', title: 'STRETCH · TIMING', does: 'filing_date has no time of day. EDGAR’s acceptance timestamp tells you whether a filing landed after the bell, which moves its tradeable session to the next day. Optional; pulls from sec.gov.', knob: 'FETCH_ACCEPTANCE_TIMES · SEC_USER_AGENT' },
  { n: '🔒', title: 'SEALED WINDOW', does: 'Judges set RUN_HOLDOUT = True, put the sealed dates in the configuration cell and run one cell. Your whole pipeline must be a function of a tag, a start date and an end date.', knob: 'Judges only' },
];

const CONFIG_ROWS: [string, string, string][] = [
  ['EVENT_TAG', '"cfo_appointment"', 'One tertiary_category from the taxonomy. Yours to change.'],
  ['STUDY_START..END', '2024-01-01 → 2025-12-31', 'In-sample. Research here.'],
  ['OOS_START..END', '2026-01-01 → 2026-08-31', 'Out-of-sample, run in the notebook. Don’t tune on it.'],
  ['HOLDOUT', 'set by the judges', 'Sealed. The judges’ window; the dates in the notebook are placeholders.'],
  ['TOP_100', '100 tickers', 'The 100 largest US companies. Static, so mind survivorship.'],
  ['EXPIRY_BUCKETS', '1m · 2m · 3–6m', 'Days to expiry. The headline bucket is 3–6m.'],
  ['HORIZONS', '1 2 3 5 10 21 42 63', 'Sessions after the filing. Fixed for every team. Do not change.'],
  ['OTM_PCT / OTM_GRID', '0.05 / 3% · 5% · 10%', 'Distance of the sold call and the put.'],
  ['ENTRY', '"post"', '"post" is tradeable. "pre" asks whether the market priced it.'],
];

const FOUND = [
  { k: '70', t: 'IN-SAMPLE EVENTS', d: 'CFO appointments across 51 of the top 100, 2022 to November 2025.' },
  { k: '+0.42%', t: 'BEST EDGE: COLLAR', d: 'Over ordinary days, averaged over the 21-session, 42-session and expiry horizons. No horizon’s interval excluded zero.' },
  { k: '−0.18%', t: 'NET AFTER COSTS', d: 'The collar at 21 sessions after a 5%-of-premium haircut each way. The gross edge didn’t survive trading costs.' },
  { k: '12', t: 'OUT-OF-SAMPLE EVENTS', d: 'Enough to check the sign of the in-sample answer, not to prove it.' },
];

const RUBRIC = [
  { points: 30, label: 'HYPOTHESIS AND NOVELTY', detail: 'A non-obvious, economically motivated category-to-strategy link. “Guidance up, buy a call” is the floor.' },
  { points: 30, label: 'ANALYTICAL RIGOR', detail: 'All fixed horizons reported, a placebo or baseline, an out-of-sample window, uncertainty shown, sensitivity examined.' },
  { points: 20, label: 'SEALED-WINDOW REPLICATION', detail: 'The finding holds on the judges’ window, or you predicted its fragility and were right.' },
  { points: 10, label: 'TRADE REALISM', detail: 'Entry timing that respects the filing lag, costs and liquidity from the data, stated capacity.' },
  { points: 10, label: 'COMMUNICATION', detail: 'A write-up a portfolio manager could act on, and a notebook that runs.' },
];

const SUBMIT = [
  {
    n: '01',
    t: 'THE QUANT NOTE · PDF ≤ 5 PAGES',
    d: 'The track’s note, built around your 8-K finding: the hypothesis (which categories, which strategy, why the market should misprice it), the method, results with uncertainty at every fixed horizon in- and out-of-sample, what would make it break, and how you would trade it.',
  },
  {
    n: '02',
    t: 'THE CODE · PUBLIC GITHUB REPO',
    d: 'Your notebook, built on the starter, that runs from a clean kernel with only an API key and takes a start date and an end date as inputs: judges will call it on a window you haven’t seen. Plus a README and a dependency file, as for every track submission.',
  },
  {
    n: '03',
    t: 'A SENSITIVITY CHECK',
    d: 'The result across the neighbouring choices you could have made: expiry bucket, OTM distance, entry session, horizon, category definition. It goes in the note.',
  },
];

const JUDGING_FLOW = [
  { when: 'SUN 11:00 AM', what: 'DEVPOST CLOSES', d: 'Submit on Devpost like every project. Code pushes until 11:00 AM.' },
  { when: 'SUN 1:00 PM', what: 'TOP 10', d: 'GQH judges send their ten strongest Massive entries to Massive.' },
  { when: 'SUN 2:30 PM', what: 'MASSIVE PICKS', d: 'The Massive team chooses the winner from the shortlist.' },
  { when: 'SUN 3:35 PM', what: 'CLOSING CEREMONY', d: 'The winner is announced on stage.' },
];

const WEEKEND = [
  { day: 'FRI · OCT 2', time: '6:30 PM', title: 'MEET MASSIVE', where: 'Commencement · Reitz Union Grand Ballroom', d: 'The Massive team is there from the opening. Find them with questions about the challenge.' },
  { day: 'SAT · OCT 3', time: '1:00 PM', title: 'MASSIVE WORKSHOP', where: 'Reitz Room 2355', d: 'A walkthrough of the challenge, the 8-K dataset and the starter notebook, then Q&A.' },
  { day: 'SAT · OCT 3', time: 'AFTERNOON', title: 'OPTIONS DATA HELP', where: 'Ask in #massive on Discord', d: 'The Massive team stays on hand for questions on the options data while you’re deep in the research.' },
  { day: 'SUN · OCT 4', time: '3:35 PM', title: 'WINNER ANNOUNCED', where: 'Closing ceremony', d: 'Massive judges remotely and the winner is announced at closing.' },
];

const CHECKS = [
  'Notebook runs from a clean kernel with only an API key',
  'Pipeline takes a start date and an end date as inputs',
  'Out-of-sample window left untouched until the end, never tuned on',
  'Hypothesis names the categories, the strategy, and why the market should misprice it',
  'Every fixed horizon reported, in-sample and out-of-sample, net of costs, with uncertainty',
  'A placebo or ordinary-day baseline for the same names',
  'Parameter-sensitivity check across neighbouring choices',
  'Trade specification: entry vs filing lag, costs in bps, liquidity, capacity',
  'Quant note as a PDF, 5 pages or fewer',
  'Public GitHub repo with a README and dependency file',
  'No API key, .env or .massive_cache committed',
  'Submitted on Devpost by 11:00 AM',
];

function Glossary() {
  const [active, setActive] = useState(10);
  const entry = VOCAB[active];

  return (
    <div className="mv-gloss">
      <div className="mv-gloss__chips" role="tablist" aria-label="Options vocabulary">
        {VOCAB.map((item, index) => (
          <button
            key={item.term}
            type="button"
            role="tab"
            aria-selected={active === index}
            className={`mv-gloss__chip ${active === index ? 'mv-gloss__chip--on' : ''} ${item.term === 'IMPLIED MOVE' ? 'mv-gloss__chip--key' : ''}`}
            onClick={() => setActive(index)}
          >
            {item.term}
          </button>
        ))}
      </div>
      <div className="mv-gloss__def" role="tabpanel" aria-live="polite" key={entry.term}>
        <span>{entry.term}</span>
        <p>{entry.def}</p>
      </div>
    </div>
  );
}

// t_pre, t_0 and the fixed horizons on one ruler, so the two entry rules and the
// exits are concrete.
function EventTimeline() {
  const [entry, setEntry] = useState<'post' | 'pre'>('post');
  const [exit, setExit] = useState<number | 'exp'>(21);
  const ticks: (number | 'exp')[] = [...HORIZONS, 'exp'];
  // Square-root spacing keeps the short horizons readable next to the long ones.
  const pos = (h: number | 'exp') => {
    const sessions = h === 'exp' ? 84 : h;
    return 14 + (Math.sqrt(sessions + 1) / Math.sqrt(85)) * 82;
  };
  const entryPos = entry === 'post' ? pos(0) : 6;

  return (
    <div className="mv-tl">
      <div className="mv-tl__top">
        <span>ONE EVENT ON THE CALENDAR</span>
        <div className="mv-tl__toggle" role="group" aria-label="Entry rule">
          <button type="button" className={entry === 'post' ? 'mv-on' : ''} aria-pressed={entry === 'post'} onClick={() => setEntry('post')}>
            ENTRY = "post" ✓ TRADEABLE
          </button>
          <button type="button" className={entry === 'pre' ? 'mv-on mv-on--amber' : ''} aria-pressed={entry === 'pre'} onClick={() => setEntry('pre')}>
            ENTRY = "pre" · WAS IT PRICED?
          </button>
        </div>
      </div>

      <div className="mv-tl__rail">
        <div className="mv-tl__line" />
        <div className="mv-tl__hold" style={{ left: `${entryPos}%`, width: `${pos(exit) - entryPos}%` }} />
        <div className={`mv-tl__mark mv-tl__mark--pre ${entry === 'pre' ? 'mv-tl__mark--entry' : ''}`} style={{ left: '6%' }}>
          <i />
          <b>t_pre</b>
          <em>chain read here</em>
        </div>
        <div className={`mv-tl__mark mv-tl__mark--t0 ${entry === 'post' ? 'mv-tl__mark--entry' : ''}`} style={{ left: `${pos(0)}%` }}>
          <i />
          <b>t_0</b>
          <em>8-K filed</em>
        </div>
        {ticks.map((h) => (
          <button
            key={h}
            type="button"
            className={`mv-tl__tick ${exit === h ? 'mv-tl__tick--on' : ''} ${h === 2 || h === 3 || h === 5 ? 'mv-tl__tick--crowded' : ''}`}
            style={{ left: `${pos(h)}%` }}
            onClick={() => setExit(h)}
            aria-pressed={exit === h}
            aria-label={h === 'exp' ? 'Exit at expiry' : `Exit ${h} sessions after the filing`}
          >
            <i />
            <span>{h === 'exp' ? 'EXP' : `+${h}`}</span>
          </button>
        ))}
      </div>

      <p className="mv-tl__read" aria-live="polite">
        {entry === 'post' ? (
          <>
            Buy at the close of <b>t_0</b>, the filing session, and mark it{' '}
            <b>{exit === 'exp' ? 'at expiry' : `${exit} session${exit === 1 ? '' : 's'} later`}</b>. This is the rule you could
            actually trade, provided the filing landed before the bell.
          </>
        ) : (
          <>
            Enter at the close of <b>t_pre</b>, before the filing. Nobody could trade this, since the 8-K wasn’t public yet. It
            answers a different question: <b>did the market already price the event?</b> Present it as a statement about
            pricing, not a trade.
          </>
        )}
      </p>
      <p className="mv-tl__fine">
        Horizons are fixed for every team: <code>[1, 2, 3, 5, 10, 21, 42, 63]</code> sessions plus expiry. Report all of them, so
        judges see where the edge lives rather than where it looks best.
      </p>
    </div>
  );
}

function NotebookTour() {
  const [active, setActive] = useState(0);
  const step = NOTEBOOK_STEPS[active];

  return (
    <div className="mv-tour">
      <ol className="mv-tour__list">
        {NOTEBOOK_STEPS.map((item, index) => (
          <li key={item.title}>
            <button
              type="button"
              className={`${index === active ? 'mv-tour__item--on' : ''} ${index < active ? 'mv-tour__item--done' : ''}`}
              onClick={() => setActive(index)}
              aria-current={index === active ? 'step' : undefined}
            >
              <span>{item.n}</span>
              {item.title}
            </button>
          </li>
        ))}
      </ol>
      <div className="mv-tour__panel" key={step.title} aria-live="polite">
        <div className="mv-tour__kicker">
          {step.n === '★' || step.n === '🔒' ? step.n : `SECTION ${step.n}`} · {active + 1}/{NOTEBOOK_STEPS.length}
        </div>
        <h4>{step.title}</h4>
        <p>{step.does}</p>
        {step.knob && (
          <div className="mv-tour__knob">
            <span>YOUR KNOBS</span>
            {step.knob}
          </div>
        )}
        <div className="mv-tour__nav">
          <button type="button" onClick={() => setActive((value) => Math.max(0, value - 1))} disabled={active === 0}>
            ← PREV
          </button>
          <button type="button" onClick={() => setActive((value) => Math.min(NOTEBOOK_STEPS.length - 1, value + 1))} disabled={active === NOTEBOOK_STEPS.length - 1}>
            NEXT →
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MassiveTrackPage({
  onNavigate,
  isIntroActive = false,
}: {
  onNavigate?: (page: AppPage) => void;
  isIntroActive?: boolean;
}) {
  const [booting, setBooting] = useState(() => !isIntroActive && !reducedMotion());
  const [activeChapter, setActiveChapter] = useState(-1);
  const [heroInView, setHeroInView] = useState(true);
  const heroRef = useRef<HTMLElement>(null);
  const heroReady = !isIntroActive && !booting;

  useEffect(() => {
    const previous = document.title;
    document.title = PAGE_TITLE;
    return () => {
      document.title = previous;
    };
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const heroObserver = new IntersectionObserver(([entry]) => setHeroInView(entry.isIntersecting), { threshold: 0.25 });
    heroObserver.observe(hero);
    const chapterObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveChapter(CHAPTERS.findIndex((chapter) => chapter.id === entry.target.id));
        }
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    CHAPTERS.forEach((chapter) => {
      const node = document.getElementById(chapter.id);
      if (node) chapterObserver.observe(node);
    });
    return () => {
      heroObserver.disconnect();
      chapterObserver.disconnect();
    };
  }, []);

  const backToSystematic = () => onNavigate?.('systematic-track');

  return (
    <div className="st-page mv-page">
      <TrackStyles />
      <MassiveStyles />
      {booting && <BootArrival lines={BOOT_LINES} ok="CHAIN PRICED · BONUS CHALLENGE ONLINE" onDone={() => setBooting(false)} />}

      <section ref={heroRef} className="st-hero">
        <EventField />
        <div className="st-hero__shade" aria-hidden="true" />
        <div className="st-hero__scan" aria-hidden="true" />

        <div className="st-wrap st-hero__content">
          <button type="button" className={`st-back ${heroReady ? 'st-in' : ''}`} onClick={backToSystematic}>
            ← SYSTEMATIC TRADING
          </button>

          <div className={`st-hero__badge mv-badge ${heroReady ? 'st-in' : ''}`}>
            <img src={massiveLogo} alt="Massive" className="mv-badge__logo" />
            <span>
              BONUS PRIZE · SYSTEMATIC TRADING
              <em>MISSION FILE: 8-K DISCLOSURES × OPTIONS · SPONSORED BY MASSIVE</em>
            </span>
          </div>

          <div className={`st-hero__signal mv-signal ${heroReady ? 'st-in' : ''}`}>
            <span className="st-dot mv-dot" /> 8-K FILED · CHAIN PRICED AT t_pre · IMPLIED vs REALIZED · SEALED WINDOW LOCKED
          </div>

          <h1 className="st-hero__title mv-title">
            <span className="sr-only">Trade the 8-K. Was it priced in?</span>
            {HERO_LINES.map((line, index) => (
              <span key={line} className={`st-hero__line st-hero__line--${index}`}>
                <DecodeText text={line} active={heroReady} delay={150 + index * 260} />
              </span>
            ))}
          </h1>

          <dl className={`st-hero__specs ${heroReady ? 'st-hero__specs--in' : ''}`}>
            {HERO_SPECS.map(([key, value], index) => (
              <div key={key} style={{ animationDelay: `${900 + index * 120}ms` }}>
                <dt>{key}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="st-hero__live" aria-hidden="true">
          <span className="st-dot st-dot--green" /> LIVE MODEL · 8-K EVENTS vs THE IMPLIED-MOVE CONE
        </div>
        <button
          type="button"
          className="st-hero__cue"
          onClick={() => document.getElementById(CHAPTERS[0].id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          aria-label="Scroll to the challenge"
        >
          <span>READ THE CHALLENGE</span>
          <i />
        </button>
      </section>

      <BriefingHud chapters={CHAPTERS} active={activeChapter} visible={!heroInView && activeChapter >= 0} />

      <Chapter
        id="mv-challenge"
        index={1}
        kicker="THE CHALLENGE"
        title="Did the options market see it coming?"
        lede="A bonus prize inside the Systematic Trading track, sponsored by Massive. Use Massive’s 8-K disclosure categories as the signal and its options data as the instrument, and make the case that a type of corporate filing tells you when to enter an options strategy."
      >
        <div className="st-story">
          {STORY.map((entry, index) => (
            <Reveal key={entry.log} delay={index * 90} className={`st-story__beat ${index === 0 ? 'st-story__beat--premise' : ''}`}>
              <div className="st-story__stamp">
                <span>{entry.log}</span>
                <b>{entry.label}</b>
              </div>
              <p className="st-story__text">{entry.text}</p>
            </Reveal>
          ))}
          <Reveal delay={STORY.length * 90} className="st-story__beat st-story__beat--task">
            <div className="st-story__stamp">
              <span>YOUR TASK</span>
              <b>OCT 2–4</b>
            </div>
            <div>
              <blockquote className="mv-quote">
                Pick one or more <strong>8-K disclosure categories</strong> and <strong>one strategy</strong> from the library,
                and make the case that the category is a signal for entering that strategy.
              </blockquote>
              <p className="st-story__fine">
                Define the rule: which filings, which contracts, entered when, exited when. Test it on the 100 largest US
                companies across the fixed horizons, show how it compares with ordinary days for the same names, show it out of
                sample, and show how sensitive it is to your parameters.
              </p>
            </div>
          </Reveal>
        </div>

        <SubHead>THREE TIERS</SubHead>
        <div className="mv-tiers">
          {TIERS.map((tier, index) => (
            <Reveal key={tier.tier} delay={index * 100}>
              <article className={`mv-tier mv-tier--${tier.tone}`}>
                <span className="mv-tier__who">{tier.who}</span>
                <h4>{tier.tier}</h4>
                <p>{tier.deliver}</p>
                <div className="mv-tier__nb">
                  <span>THE NOTEBOOK</span>
                  {tier.notebook}
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mv-rules">
            <div>
              <span>A SUB-TRACK</span>
              <p>
                Every Systematic Trading rule applies here too: a hypothesis stated before results, results net of costs,
                every data source cited, a quant note of at most five pages, and a public GitHub repo. Massive’s challenge
                adds the data, the strategy menu and the fixed horizons. One exception: the notebook’s own out-of-sample
                window and the judges’ sealed window replace the track’s 20% holdout rule.
              </p>
            </div>
            <button type="button" className="st-btn" onClick={backToSystematic}>
              READ THE TRACK RULES →
            </button>
          </div>
        </Reveal>

        <Reveal>
          <p className="st-note mv-note">
            <span>NOT P&amp;L</span>
            You’re judged on the novelty of the category-to-strategy link, the rigor of the analysis, whether it replicates on a
            sealed window, the realism of the trade, and clarity. A well-argued null result with a clear decay curve beats a
            lucky backtest.
          </p>
        </Reveal>
      </Chapter>

      <Chapter
        id="mv-options"
        index={2}
        kicker="OPTIONS 101"
        title="One number that matters"
        lede="No options experience needed to start. Every strategy here is a bet on one relationship: the implied move the chain charged on the pre-event session against the move the stock actually made. Buying options wins when realized beats implied; selling wins when it doesn’t."
      >
        <SubHead>THE VOCABULARY</SubHead>
        <Reveal>
          <Glossary />
        </Reveal>

        <SubHead>IMPLIED vs REALIZED</SubHead>
        <Reveal>
          <ImpliedMoveLab />
        </Reveal>
      </Chapter>

      <Chapter
        id="mv-strategies"
        index={3}
        kicker="THE FIVE STRATEGIES"
        title="Pick a shape, defend the pairing"
        lede="Five standard strategies, each explainable in two sentences and buildable from one option chain: OptionsPlaybook’s four Rookie strategies plus one Veteran, the long call. Finding and defending the link between a filing category and one of these is the challenge."
      >
        <Reveal>
          <PayoffExplorer />
        </Reveal>
        <Reveal>
          <p className="st-note st-note--amber">
            <span>LEARN ONE CONTRACT</span>
            The long call teaches what a call costs. The covered call sells that same contract. The protective put buys the
            insurance instead of selling it, the collar is both at once, and the cash-secured put is the covered call’s payoff
            without owning the shares. More on each at{' '}
            <a href={OPTIONS_PLAYBOOK_URL} target="_blank" rel="noreferrer">
              OptionsPlaybook
            </a>.
          </p>
        </Reveal>
      </Chapter>

      <Chapter
        id="mv-data"
        index={4}
        kicker="THE DATA"
        title="Two datasets, one key"
        lede="Everything comes from api.massive.com: the 8-K filings that are your events, and the options chains and daily bars that are your instrument. That is the whole list, and the notebook shows how far it goes."
      >
        <div className="mv-data">
          {DATASETS.map((set, index) => (
            <Reveal key={set.name} delay={index * 100}>
              <article className="mv-dataset">
                <h4>{set.name}</h4>
                <code className="mv-dataset__ep">{set.endpoint}</code>
                <p>{set.use}</p>
                <div className="mv-dataset__links">
                  {set.links.map((link) => (
                    <a key={link.href} href={link.href} target="_blank" rel="noreferrer">
                      {link.label}
                    </a>
                  ))}
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mv-none">
            <span className="mv-none__title">NOT IN THIS CHALLENGE</span>
            {NOT_INCLUDED.map((item) => (
              <span key={item} className="mv-none__chip">
                ✕ {item}
              </span>
            ))}
            <p>
              The notebook builds the trading calendar from NYSE holiday rules, reads the stock price off the option chain, and
              replicates the 100 shares behind three of the five strategies with options.
            </p>
          </div>
        </Reveal>

        <SubHead>GET YOUR KEY</SubHead>
        <div className="mv-key">
          <div className="mv-key__steps">
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
          <Reveal delay={150}>
            <CopyBlock text={KEY_SETUP} label="MASSIVE_API_KEY" />
          </Reveal>
        </div>
      </Chapter>

      <Chapter
        id="mv-notebook"
        index={5}
        kicker="THE NOTEBOOK"
        title="A pipeline you can swap the tag in"
        lede="Massive’s data team wrote a starter notebook that runs the whole study end to end. Its worked example asks: if a company appoints a new CFO, which of the five strategies would have worked? Swap the tag, the strategy set or the universe and the same pipeline runs."
      >
        <Reveal>
          <div className="st-download">
            <div>
              <span>STARTER KIT · PYTHON 3.10+</span>
              <strong>Trade the 8-K: starter kit</strong>
              <em>The notebook, setup scripts and requirements in one folder. Bring your own API key.</em>
            </div>
            <div className="st-download__actions">
              <a className="st-btn st-btn--primary" href={KIT_URL} download={KIT_FILE}>
                DOWNLOAD KIT .ZIP ↓
              </a>
              <a className="st-btn" href={NOTEBOOK_URL} download={NOTEBOOK_FILE}>
                NOTEBOOK ONLY .IPYNB ↓
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

        <SubHead>SET UP IN TWO MINUTES</SubHead>
        <div className="mv-key">
          <div className="mv-key__steps">
            {SETUP_STEPS.map((step, index) => (
              <Reveal key={step.n} delay={index * 90}>
                <div className="st-rule">
                  <div className="st-rule__k">{step.n}</div>
                  <div className="st-rule__t">{step.t}</div>
                  <p>{step.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mv-key__steps">
            <Reveal delay={150}>
              <CopyBlock text={SETUP_UNIX} label="MACOS / LINUX" />
            </Reveal>
            <Reveal delay={200}>
              <CopyBlock text={SETUP_WINDOWS} label="WINDOWS" />
            </Reveal>
            <Reveal delay={250}>
              <CopyBlock text={SETUP_MANUAL} label="BY HAND, ANY OS" />
            </Reveal>
          </div>
        </div>

        <SubHead>IF SOMETHING BREAKS</SubHead>
        <Reveal>
          <div className="mv-trouble">
            {TROUBLESHOOTING.map((item) => (
              <div key={item.q} className="mv-trouble__row">
                <strong>{item.q}</strong>
                <p>{item.a}</p>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal>
          <p className="st-note st-note--cyan">
            <span>KEEP THE KEY OUT</span>
            Never paste your key into a notebook cell, and don’t submit .env. Judges run your notebook with their own key.
          </p>
        </Reveal>

        <SubHead>WALK THE SECTIONS</SubHead>
        <Reveal>
          <NotebookTour />
        </Reveal>

        <SubHead>t_pre, t_0 AND THE FIXED HORIZONS</SubHead>
        <Reveal>
          <EventTimeline />
        </Reveal>

        <SubHead>THE CONFIGURATION CELL</SubHead>
        <Reveal>
          <div className="mv-config">
            {CONFIG_ROWS.map(([name, value, note]) => (
              <div key={name} className={`mv-config__row ${name === 'HORIZONS' ? 'mv-config__row--locked' : ''}`}>
                <code>{name}</code>
                <b>{value}</b>
                <span>{note}</span>
              </div>
            ))}
          </div>
        </Reveal>

        <SubHead>WHAT THE WORKED EXAMPLE FOUND</SubHead>
        <div className="mv-found">
          {FOUND.map((item, index) => (
            <Reveal key={item.t} delay={index * 90}>
              <article className="mv-found__card">
                <strong>{item.k}</strong>
                <h4>{item.t}</h4>
                <p>{item.d}</p>
              </article>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <p className="st-note st-note--cyan">
            <span>THAT’S THE POINT</span>
            The example’s honest answer is that CFO appointments don’t give a tradeable edge on their own. Your job is to find a
            category, or a combination, where the gap over ordinary days holds up across horizons, out of sample, and after costs.
            These figures come from an earlier draft run on 2022–2025 windows. The final notebook ships without saved outputs and
            uses the windows above, so your first run will print its own numbers.
          </p>
        </Reveal>
      </Chapter>

      <Chapter
        id="mv-judging"
        index={6}
        kicker="JUDGING & PRIZE"
        title="A finding that replicates wins"
        lede="A Massive entry is a Systematic Trading submission, scored on the track’s rubric like every other. GQH judges send their ten strongest Massive entries to Massive, and the Massive team picks the bonus winner using the criteria below."
      >
        <div className="mv-submit">
          {SUBMIT.map((item, index) => (
            <Reveal key={item.n} delay={index * 100}>
              <article className="mv-submit__card">
                <span>{item.n}</span>
                <h4>{item.t}</h4>
                <p>{item.d}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <SubHead>WHAT MASSIVE LOOKS FOR · 100 POINTS</SubHead>
        <Reveal>
          <div className="mv-rubric">
            {RUBRIC.map((item) => (
              <div key={item.label} className="mv-rubric__row">
                <div className="mv-rubric__pts">{item.points}</div>
                <div className="mv-rubric__body">
                  <div className="mv-rubric__label">{item.label}</div>
                  <div className="mv-rubric__bar">
                    <i style={{ width: `${(item.points / 30) * 100}%` }} />
                  </div>
                  <p>{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        <SubHead>FROM DEVPOST TO THE STAGE</SubHead>
        <Reveal>
          <ol className="mv-flow">
            {JUDGING_FLOW.map((step) => (
              <li key={step.what}>
                <span>{step.when}</span>
                <b>{step.what}</b>
                <p>{step.d}</p>
              </li>
            ))}
          </ol>
        </Reveal>

        <SubHead>THE PRIZE</SubHead>
        <Reveal>
          <div className="mv-prize">
            <div className="mv-prize__main">
              <span>WINNING TEAM</span>
              <strong>$500</strong>
              <em>toward the winning team’s prize</em>
            </div>
            <ul>
              <li>
                <b>One month free</b> of any Massive Advanced individual plan for each winning team member: stocks, options or
                futures, their pick.
              </li>
              <li>
                <b>Massive swag</b>, handed out at the event.
              </li>
            </ul>
          </div>
        </Reveal>
      </Chapter>

      <Chapter
        id="mv-weekend"
        index={7}
        kicker="THE WEEKEND"
        title="Massive is in the room"
        lede="The Massive team is at the event to help teams get from the starter notebook to a real finding. Questions about the challenge, keys or the data go to #massive on the participant Discord."
      >
        <div className="mv-weekend">
          {WEEKEND.map((slot, index) => (
            <Reveal key={slot.title} delay={index * 90}>
              <article className="mv-slot">
                <div className="mv-slot__when">
                  <span>{slot.day}</span>
                  <b>{slot.time}</b>
                </div>
                <h4>{slot.title}</h4>
                <em>{slot.where}</em>
                <p>{slot.d}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <SubHead>DEADLINES</SubHead>
        <Reveal>
          <DeadlineClock />
        </Reveal>

        <SubHead>BEFORE YOU SUBMIT</SubHead>
        <Reveal>
          <FinalChecklist items={CHECKS} storageKey="gqh-massive-checklist" goText="READY · SUBMIT ON DEVPOST BEFORE 11:00 AM" />
        </Reveal>

        <Reveal>
          <div className="st-official mv-official">
            <div>
              <span>SUBMIT</span>
              <a href={DEVPOST_URL} target="_blank" rel="noreferrer">
                GQHACKS.DEVPOST.COM ↗
              </a>
            </div>
            <div>
              <span>KEYS & HELP</span>
              <a href={DISCORD_URL} target="_blank" rel="noreferrer">
                #MASSIVE ON DISCORD ↗
              </a>
            </div>
            <div>
              <span>STARTER KIT</span>
              <a href={KIT_URL} download={KIT_FILE}>
                NOTEBOOK + SETUP .ZIP ↓
              </a>
            </div>
            <div>
              <span>API DOCS</span>
              <a href="https://massive.com/docs" target="_blank" rel="noreferrer">
                MASSIVE.COM/DOCS ↗
              </a>
            </div>
          </div>
        </Reveal>
      </Chapter>

      <section className="st-final">
        <div className="st-wrap">
          <Reveal>
            <div className="st-final__panel mv-final">
              <div className="st-final__kicker">END OF BONUS FILE</div>
              <h2>Find the filing the market misprices</h2>
              <p>
                The Massive bonus challenge runs inside the Systematic Trading Track at Gator Quant Hacks, October 2–4, 2026.
              </p>
              <div className="st-final__actions">
                <a className="st-btn st-btn--primary" href={KIT_URL} download={KIT_FILE}>
                  GET THE STARTER KIT ↓
                </a>
                <button type="button" className="st-btn" onClick={backToSystematic}>
                  ← SYSTEMATIC TRADING TRACK
                </button>
              </div>
              <p className="st-final__fine">
                This page is a plain-language tour of Massive’s starter notebook and challenge brief. As a sub-track, every Systematic Trading rule applies except the 20% holdout rule. The labs use illustrative
                numbers. Where anything here differs from the notebook or an organizer announcement, those govern.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function MassiveStyles() {
  return (
    <style>{`
      .mv-page { --mv: #9d8cff; }

      /* Tints the shared starter-kit pieces; .st-page sets the defaults. */
      .st-page.mv-page {
        --st-kit: #9d8cff;
        --st-kit-line: rgba(157, 140, 255, 0.45);
        --st-kit-edge: rgba(157, 140, 255, 0.55);
        --st-kit-glow: rgba(157, 140, 255, 0.16);
        --st-kit-ink: #c4b9ff;
        --st-kit-text: #d6cfff;
      }

      .mv-badge { border-color: rgba(157, 140, 255, 0.6); background: rgba(14, 10, 30, 0.88); color: #d6cfff; }
      .mv-badge__logo { width: 96px; height: auto; flex: none; image-rendering: auto; }
      .mv-signal { color: #c4b9ff; }
      .mv-dot { background: var(--mv); box-shadow: 0 0 10px var(--mv); }
      .mv-title .st-hero__line--0 { color: #d6cfff; }
      .mv-title .st-hero__line--1 { text-shadow: 0 0 30px rgba(157, 140, 255, 0.45), 6px 6px 0 #2a1f66; }

      .mv-field {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        display: block;
        image-rendering: auto;
      }

      @media (max-width: 640px) {
        .mv-badge__logo { width: 72px; }
      }

      .mv-quote {
        margin: 0 0 16px;
        padding: 4px 0 4px 16px;
        border-left: 3px solid var(--mv);
        font-size: clamp(16px, 1.6vw, 20px);
        line-height: 1.6;
        color: #fff;
      }

      .mv-quote strong { color: #c4b9ff; }

      .mv-note { border-color: var(--mv); background: rgba(157, 140, 255, 0.07); }
      .mv-note > span:first-child { color: var(--mv); }

      /* Tiers */
      .mv-tiers { display: grid; gap: 14px; }
      @media (min-width: 900px) { .mv-tiers { grid-template-columns: repeat(3, minmax(0, 1fr)); } }

      .mv-tier {
        height: 100%;
        padding: 18px;
        border: 1px solid rgba(41, 79, 125, 0.8);
        border-top: 3px solid var(--c);
        background: rgba(7, 13, 26, 0.92);
      }

      .mv-tier--green { --c: #33d17a; }
      .mv-tier--violet { --c: #9d8cff; }
      .mv-tier--amber { --c: #ffb84d; }

      .mv-tier__who { font-size: 9px; font-weight: 700; letter-spacing: 1.6px; color: #7e90ab; }

      .mv-tier h4 {
        margin: 6px 0 10px;
        font-family: 'Orbitron', sans-serif;
        font-size: 16px;
        font-weight: 800;
        letter-spacing: 2px;
        color: var(--c);
      }

      .mv-tier p { margin: 0 0 14px; font-size: 13px; line-height: 1.65; color: #d3dcea; }

      .mv-tier__nb {
        padding-top: 10px;
        border-top: 1px dashed rgba(41, 79, 125, 0.7);
        font-size: 12px;
        line-height: 1.6;
        color: #a7b4c9;
      }

      .mv-tier__nb span { display: block; margin-bottom: 4px; font-size: 9px; font-weight: 700; letter-spacing: 1.5px; color: #5f7390; }

      /* Glossary */
      .mv-gloss {
        padding: 18px;
        border: 1px solid rgba(41, 79, 125, 0.8);
        background: rgba(7, 13, 26, 0.92);
      }

      .mv-gloss__chips { display: flex; flex-wrap: wrap; gap: 6px; }

      .mv-page .mv-gloss__chip {
        padding: 6px 10px;
        border: 1px solid #294f7d;
        background: rgba(8, 16, 30, 0.85);
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 1.2px;
        color: #9cc9ff;
        transition: border-color 150ms ease, color 150ms ease, background 150ms ease;
      }

      .mv-page .mv-gloss__chip:hover { border-color: var(--mv); color: #fff; }
      .mv-page .mv-gloss__chip--key { border-color: rgba(255, 184, 77, 0.7); color: #ffd27a; }
      .mv-page .mv-gloss__chip--on { border-color: var(--mv); background: rgba(157, 140, 255, 0.18); color: #fff; }

      .mv-gloss__def {
        margin-top: 16px;
        padding: 14px 16px;
        border-left: 3px solid var(--mv);
        background: rgba(157, 140, 255, 0.06);
        animation: stIn 280ms ease-out both;
      }

      .mv-gloss__def span { font-family: 'Orbitron', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 2px; color: var(--mv); }
      .mv-gloss__def p { margin: 6px 0 0; font-size: 14px; line-height: 1.7; color: #e3e9f3; }

      /* Data */
      .mv-data { display: grid; gap: 14px; }
      @media (min-width: 900px) { .mv-data { grid-template-columns: repeat(3, minmax(0, 1fr)); } }

      .mv-dataset {
        height: 100%;
        padding: 18px;
        border: 1px solid rgba(41, 79, 125, 0.8);
        border-left: 3px solid var(--mv);
        background: rgba(7, 13, 26, 0.92);
      }

      .mv-dataset h4 { margin: 0 0 10px; font-family: 'Orbitron', sans-serif; font-size: 13px; font-weight: 800; letter-spacing: 2px; color: #fff; }
      .mv-page .mv-dataset__ep { display: block; width: fit-content; max-width: 100%; white-space: normal; word-break: break-all; color: #c4b9ff; background: rgba(157, 140, 255, 0.1); }
      .mv-dataset p { margin: 12px 0; font-size: 13px; line-height: 1.65; color: #b8c4d6; }
      .mv-dataset__links { display: flex; flex-wrap: wrap; gap: 12px; }
      .mv-page .mv-dataset__links a { font-size: 11px; font-weight: 700; letter-spacing: 1.3px; }

      .mv-none {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
        margin-top: 18px;
        padding: 14px 16px;
        border: 1px dashed rgba(255, 90, 110, 0.5);
      }

      .mv-none__title { margin-right: 6px; font-family: 'Orbitron', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 2px; color: #ff8a98; }
      .mv-none__chip { padding: 3px 9px; border: 1px solid rgba(255, 90, 110, 0.45); font-size: 10px; font-weight: 700; letter-spacing: 1.3px; color: #ffb3bd; }
      .mv-none p { flex-basis: 100%; margin: 6px 0 0; font-size: 13px; line-height: 1.65; color: #c9d4e4; }

      /* minmax(0, …) keeps long command lines scrolling inside their block
         instead of widening the column past the page. */
      .mv-key { display: grid; grid-template-columns: minmax(0, 1fr); gap: 16px; }
      @media (min-width: 960px) { .mv-key { grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); align-items: start; } }
      .mv-key__steps { display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; }

      .mv-trouble { display: grid; border: 1px solid rgba(41, 79, 125, 0.8); background: rgba(7, 13, 26, 0.92); }
      .mv-trouble__row { display: grid; gap: 4px 20px; padding: 12px 16px; border-top: 1px solid rgba(41, 79, 125, 0.45); }
      .mv-trouble__row:first-child { border-top: 0; }
      .mv-trouble__row strong { font-size: 12px; letter-spacing: 0.4px; color: #fff; }
      .mv-trouble__row p { margin: 0; font-size: 13px; line-height: 1.6; color: #c9d4e4; overflow-wrap: anywhere; }
      @media (min-width: 900px) { .mv-trouble__row { grid-template-columns: 300px minmax(0, 1fr); } }

      .mv-tour {
        display: grid;
        border: 1px solid rgba(41, 79, 125, 0.8);
        background: rgba(7, 13, 26, 0.92);
      }

      @media (min-width: 900px) { .mv-tour { grid-template-columns: 280px minmax(0, 1fr); } }

      .mv-tour__list {
        margin: 0;
        padding: 8px;
        list-style: none;
        border-bottom: 1px solid rgba(41, 79, 125, 0.8);
      }

      @media (min-width: 900px) { .mv-tour__list { border-bottom: 0; border-right: 1px solid rgba(41, 79, 125, 0.8); } }
      @media (max-width: 899px) { .mv-tour__list { display: flex; flex-wrap: wrap; gap: 4px; } }

      .mv-page .mv-tour__list button {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        padding: 7px 10px;
        border-left: 2px solid transparent;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 1.2px;
        color: #8ea0bb;
        text-align: left;
      }

      @media (max-width: 899px) {
        .mv-page .mv-tour__list button { width: auto; border: 1px solid #294f7d; }
        .mv-page .mv-tour__list button:not(.mv-tour__item--on) { font-size: 0; gap: 0; }
        .mv-page .mv-tour__list button:not(.mv-tour__item--on) span { font-size: 11px; }
      }

      .mv-tour__list button span {
        min-width: 22px;
        font-family: 'VT323', monospace;
        font-size: 18px;
        color: #5f7390;
      }

      .mv-page .mv-tour__list button:hover { color: #fff; background: rgba(157, 140, 255, 0.06); }
      .mv-page .mv-tour__list .mv-tour__item--done { color: #c9d4e4; }
      .mv-page .mv-tour__list .mv-tour__item--done span { color: #33d17a; }
      .mv-page .mv-tour__list .mv-tour__item--on { border-left-color: var(--mv); background: rgba(157, 140, 255, 0.12); color: #fff; }
      .mv-page .mv-tour__list .mv-tour__item--on span { color: var(--mv); }

      .mv-tour__panel { padding: 22px 24px; animation: stIn 300ms ease-out both; }
      .mv-tour__kicker { font-size: 10px; font-weight: 700; letter-spacing: 1.8px; color: #7e90ab; }

      .mv-tour__panel h4 {
        margin: 8px 0 12px;
        font-family: 'Orbitron', sans-serif;
        font-size: clamp(18px, 2.2vw, 24px);
        font-weight: 800;
        letter-spacing: 1.5px;
        color: #fff;
      }

      .mv-tour__panel > p { margin: 0; max-width: 680px; font-size: 14px; line-height: 1.8; color: #d3dcea; }

      .mv-tour__knob {
        margin-top: 16px;
        padding: 10px 14px;
        border-left: 3px solid #ffb84d;
        background: rgba(255, 184, 77, 0.06);
        font-size: 12px;
        line-height: 1.6;
        color: #ffe0ad;
      }

      .mv-tour__knob span { display: block; margin-bottom: 4px; font-size: 9px; font-weight: 700; letter-spacing: 1.6px; color: #ffb84d; }

      .mv-tour__nav { display: flex; gap: 10px; margin-top: 20px; }

      .mv-page .mv-tour__nav button {
        padding: 8px 14px;
        border: 1px solid #294f7d;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 1.4px;
        color: #9cc9ff;
      }

      .mv-page .mv-tour__nav button:hover:not(:disabled) { border-color: var(--mv); color: #fff; }
      .mv-page .mv-tour__nav button:disabled { opacity: 0.35; cursor: default; }

      /* Timeline */
      .mv-tl {
        padding: 18px 20px 20px;
        border: 1px solid rgba(41, 79, 125, 0.8);
        background: rgba(7, 13, 26, 0.92);
      }

      .mv-tl__top { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 10px; }
      .mv-tl__top > span { font-family: 'Orbitron', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 2px; color: #fff; }
      .mv-tl__toggle { display: flex; flex-wrap: wrap; gap: 6px; }

      .mv-page .mv-tl__toggle button {
        padding: 6px 10px;
        border: 1px solid #294f7d;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 1.2px;
        color: #9cc9ff;
      }

      .mv-page .mv-tl__toggle .mv-on { border-color: #33d17a; background: rgba(51, 209, 122, 0.14); color: #fff; }
      .mv-page .mv-tl__toggle .mv-on--amber { border-color: #ffb84d; background: rgba(255, 184, 77, 0.14); }

      .mv-tl__rail { position: relative; height: 112px; margin: 26px 8px 6px; }

      .mv-tl__line {
        position: absolute;
        left: 0;
        right: 0;
        top: 56px;
        height: 2px;
        background: linear-gradient(90deg, #294f7d, #3b5a82);
      }

      .mv-tl__hold {
        position: absolute;
        top: 53px;
        height: 8px;
        background: linear-gradient(90deg, rgba(51, 209, 122, 0.85), rgba(157, 140, 255, 0.85));
        box-shadow: 0 0 12px rgba(157, 140, 255, 0.5);
        transition: left 300ms ease, width 300ms ease;
      }

      .mv-tl__mark {
        position: absolute;
        top: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        transform: translateX(-50%);
        text-align: center;
      }

      .mv-tl__mark i { order: 3; width: 2px; height: 30px; margin-top: 4px; background: #5f7390; }
      .mv-tl__mark b { font-family: 'VT323', monospace; font-size: 20px; line-height: 1; color: #c9d4e4; }
      .mv-tl__mark em { font-style: normal; font-size: 9px; letter-spacing: 1px; color: #7e90ab; white-space: nowrap; }
      .mv-tl__mark--t0 b { color: var(--mv); }
      .mv-tl__mark--entry b { color: #33d17a; }
      .mv-tl__mark--entry i { background: #33d17a; box-shadow: 0 0 8px #33d17a; }

      .mv-page .mv-tl__tick {
        position: absolute;
        top: 48px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        padding: 0 4px;
        transform: translateX(-50%);
      }

      .mv-tl__tick i { width: 10px; height: 18px; background: #12233a; border: 1px solid #3b5a82; transition: background 150ms ease; }
      .mv-tl__tick span { font-family: 'VT323', monospace; font-size: 16px; color: #8ea0bb; }
      .mv-page .mv-tl__tick:hover i { border-color: var(--mv); }
      .mv-tl__tick--on i { background: var(--mv); border-color: var(--mv); box-shadow: 0 0 10px var(--mv); }
      .mv-tl__tick--on span { color: #fff; }

      @media (max-width: 640px) {
        .mv-tl__tick span { font-size: 13px; }
        .mv-tl__tick i { width: 7px; }
        .mv-tl__mark em { display: none; }
        /* The short horizons sit too close to label on a phone; their ticks stay clickable. */
        .mv-tl__tick--crowded:not(.mv-tl__tick--on) span { visibility: hidden; }
      }

      .mv-tl__read { margin: 14px 0 0; font-size: 14px; line-height: 1.75; color: #d3dcea; }
      .mv-tl__read b { color: #fff; }
      .mv-tl__fine { margin: 10px 0 0; font-size: 12px; line-height: 1.6; color: #8ea0bb; }

      /* Config */
      .mv-config { border: 1px solid rgba(41, 79, 125, 0.8); background: rgba(7, 13, 26, 0.92); }

      .mv-config__row {
        display: grid;
        gap: 4px 16px;
        padding: 10px 16px;
        border-bottom: 1px solid rgba(41, 79, 125, 0.45);
        font-size: 13px;
      }

      .mv-config__row:last-child { border-bottom: 0; }
      @media (min-width: 860px) { .mv-config__row { grid-template-columns: 210px 220px minmax(0, 1fr); align-items: baseline; } }
      .mv-config__row b { font-weight: 400; color: #fff; }
      .mv-config__row span { color: #a7b4c9; }
      .mv-config__row--locked { background: rgba(255, 184, 77, 0.06); }
      .mv-config__row--locked span { color: #ffd27a; }

      /* Worked example */
      .mv-found { display: grid; gap: 14px; }
      @media (min-width: 640px) { .mv-found { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
      @media (min-width: 1100px) { .mv-found { grid-template-columns: repeat(4, minmax(0, 1fr)); } }

      .mv-found__card { height: 100%; padding: 18px; border: 1px solid rgba(41, 79, 125, 0.8); background: rgba(7, 13, 26, 0.92); }
      .mv-found__card strong { font-family: 'VT323', monospace; font-size: 40px; line-height: 1; color: #c4b9ff; }
      .mv-found__card h4 { margin: 8px 0; font-family: 'Orbitron', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 1.8px; color: #fff; }
      .mv-found__card p { margin: 0; font-size: 12px; line-height: 1.6; color: #a7b4c9; }

      /* Judging */
      .mv-submit { display: grid; gap: 14px; }
      @media (min-width: 900px) { .mv-submit { grid-template-columns: repeat(3, minmax(0, 1fr)); } }

      .mv-submit__card { height: 100%; padding: 18px; border: 1px solid rgba(41, 79, 125, 0.8); border-top: 3px solid var(--mv); background: rgba(7, 13, 26, 0.92); }
      .mv-submit__card span { font-family: 'VT323', monospace; font-size: 22px; color: #ffb84d; }
      .mv-submit__card h4 { margin: 6px 0 8px; font-family: 'Orbitron', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 2px; color: #fff; }
      .mv-submit__card p { margin: 0; font-size: 13px; line-height: 1.7; color: #c9d4e4; }

      .mv-rubric { display: grid; gap: 12px; padding: 20px; border: 1px solid rgba(41, 79, 125, 0.8); background: rgba(7, 13, 26, 0.92); }
      .mv-rubric__row { display: grid; grid-template-columns: 56px minmax(0, 1fr); gap: 14px; align-items: start; }
      .mv-rubric__pts { font-family: 'VT323', monospace; font-size: 40px; line-height: 0.9; color: var(--mv); text-align: right; }
      .mv-rubric__label { font-family: 'Orbitron', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 1.8px; color: #fff; }
      .mv-rubric__bar { height: 8px; margin: 8px 0; background: #12233a; }
      .mv-rubric__bar i { display: block; height: 100%; background: linear-gradient(90deg, #33d17a, var(--mv)); box-shadow: 0 0 10px rgba(157, 140, 255, 0.4); }
      .mv-rubric__body p { margin: 0; font-size: 13px; line-height: 1.6; color: #b8c4d6; }

      .mv-flow {
        display: grid;
        gap: 1px;
        margin: 0;
        padding: 0;
        list-style: none;
        border: 1px solid rgba(41, 79, 125, 0.8);
        background: rgba(41, 79, 125, 0.8);
      }

      @media (min-width: 900px) { .mv-flow { grid-template-columns: repeat(4, minmax(0, 1fr)); } }

      .mv-flow li { position: relative; padding: 16px 18px; background: rgba(7, 13, 26, 0.96); }
      .mv-flow li span { font-family: 'VT323', monospace; font-size: 20px; color: #ffb84d; }
      .mv-flow li b { display: block; margin: 4px 0 6px; font-family: 'Orbitron', sans-serif; font-size: 12px; letter-spacing: 1.8px; color: #fff; }
      .mv-flow li p { margin: 0; font-size: 12px; line-height: 1.6; color: #a7b4c9; }
      .mv-flow li:last-child b { color: var(--mv); }

      .mv-prize {
        display: grid;
        gap: 18px;
        padding: 22px;
        border: 1px solid rgba(157, 140, 255, 0.6);
        background:
          radial-gradient(circle at 15% 30%, rgba(157, 140, 255, 0.2), transparent 50%),
          rgba(7, 13, 26, 0.94);
        box-shadow: 0 0 30px rgba(157, 140, 255, 0.15);
      }

      @media (min-width: 760px) { .mv-prize { grid-template-columns: 260px minmax(0, 1fr); align-items: center; } }

      .mv-prize__main span { font-size: 10px; font-weight: 700; letter-spacing: 2px; color: #c4b9ff; }
      .mv-prize__main strong {
        display: block;
        font-family: 'Press Start 2P', monospace;
        font-size: clamp(34px, 5vw, 52px);
        line-height: 1.3;
        color: #fff;
        text-shadow: 0 0 24px rgba(157, 140, 255, 0.6), 4px 4px 0 #2a1f66;
      }
      .mv-prize__main em { font-style: normal; font-size: 12px; color: #a7b4c9; }

      .mv-prize ul { margin: 0; padding: 0; list-style: none; }
      .mv-prize li { position: relative; padding: 0 0 10px 22px; font-size: 14px; line-height: 1.65; color: #d3dcea; }
      .mv-prize li::before { content: '◆'; position: absolute; left: 0; color: var(--mv); }
      .mv-prize li b { color: #fff; }

      /* Weekend */
      .mv-weekend { display: grid; gap: 14px; }
      @media (min-width: 640px) { .mv-weekend { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
      @media (min-width: 1100px) { .mv-weekend { grid-template-columns: repeat(4, minmax(0, 1fr)); } }

      .mv-slot { height: 100%; padding: 18px; border: 1px solid rgba(41, 79, 125, 0.8); background: rgba(7, 13, 26, 0.92); }
      .mv-slot__when { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
      .mv-slot__when span { font-size: 10px; font-weight: 700; letter-spacing: 1.5px; color: #7e90ab; }
      .mv-slot__when b { font-family: 'VT323', monospace; font-size: 22px; font-weight: 400; color: #ffb84d; }
      .mv-slot h4 { margin: 10px 0 4px; font-family: 'Orbitron', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 1.8px; color: #fff; }
      .mv-slot em { display: block; margin-bottom: 8px; font-style: normal; font-size: 11px; color: #c4b9ff; }
      .mv-slot p { margin: 0; font-size: 13px; line-height: 1.6; color: #b8c4d6; }

      .mv-official { margin-top: 22px; }

      .mv-rules {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 14px 24px;
        margin-top: 22px;
        padding: 16px 18px;
        border: 1px solid rgba(51, 209, 122, 0.45);
        background: rgba(6, 20, 13, 0.85);
      }

      .mv-rules > div { flex: 1 1 420px; }
      .mv-rules span { font-family: 'Orbitron', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 2px; color: #33d17a; }
      .mv-rules p { margin: 6px 0 0; font-size: 13px; line-height: 1.7; color: #d3dcea; }
      .mv-final { background: radial-gradient(circle at 50% 0%, rgba(157, 140, 255, 0.16), transparent 60%), rgba(6, 10, 22, 0.95); }
    `}</style>
  );
}
