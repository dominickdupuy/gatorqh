import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { Reveal } from '../Reveal';
import { Footer } from '../Footer';
import { TapeField } from './TapeField';
import { HypothesisBuilder } from './HypothesisBuilder';
import { HoldoutPlanner } from './HoldoutPlanner';
import { BacktestLab } from './BacktestLab';
import { OverfitMachine } from './OverfitMachine';
import { CapacityDial } from './CapacityDial';
import { NoteBlueprint } from './NoteBlueprint';
import { RubricSim } from './RubricSim';
import { WebullStarter } from './WebullStarter';
import massiveLogo from '../../../assets/Massive.png';
import { BootArrival, BriefingHud, Chapter, DecodeText, DeadlineClock, FinalChecklist, SubHead, TrackStyles, reducedMotion } from './shell';

type AppPage = 'home' | 'apply' | 'massive-track';

const PAGE_TITLE = 'Systematic Trading Track | Gator Quant Hacks 2026';

const DISCORD_URL = 'https://discord.gg/BNB82dKdf';
const DEVPOST_URL = 'https://gqhacks.devpost.com';
const HACKER_GUIDE_URL = 'https://gqhacks.notion.site/hacker-guide';
const CONTACT_EMAIL = 'gatorquanthacks@gmail.com';


const CHAPTERS = [
  { id: 'st-mission', label: 'OVERVIEW' },
  { id: 'st-hypothesis', label: 'HYPOTHESIS' },
  { id: 'st-data', label: 'DATA' },
  { id: 'st-webull', label: 'WEBULL STARTER' },
  { id: 'st-backtest', label: 'BACKTESTING' },
  { id: 'st-pitfalls', label: 'PITFALLS' },
  { id: 'st-risk', label: 'RISK & CAPACITY' },
  { id: 'st-note', label: 'QUANT NOTE' },
  { id: 'st-judging', label: 'JUDGING' },
  { id: 'st-submit', label: 'SUBMITTING' },
];

const HERO_LINES = ['FIND AN', 'EDGE', 'PROVE IT HONESTLY'];

const HERO_SPECS = [
  ['DELIVERABLES', 'NOTE + CODE'],
  ['QUANT NOTE', '≤ 5 PAGES'],
  ['SCORED', '5 × 10 = 50'],
  ['DEVPOST', 'SUN 11:00 AM'],
];

type StoryEntry = { log: string; label: string; text: string };

const STORY_LOG: StoryEntry[] = [
  {
    log: 'FRI 7:15 PM',
    label: 'HACKING BEGINS',
    text: 'Pick a market and write down why you think there’s an edge in it. Do this before you run a single backtest.',
  },
  {
    log: 'FRI NIGHT',
    label: 'DATA',
    text: 'Get clean history from sponsor data or a free public source. Settle on your universe, then set aside the most recent stretch as your out-of-sample period and don’t look at it.',
  },
  {
    log: 'SATURDAY',
    label: 'BUILD & TEST',
    text: 'Build the signal, size positions, add realistic costs, and try to break it. Expect most ideas to fail here. Keep a list of the ones that did, because it goes in your note.',
  },
  {
    log: 'SAT NIGHT',
    label: 'EVALUATE ONCE',
    text: 'Run the out-of-sample period once and report the result, good or bad. Then write the quant note around what you found.',
  },
];

const SCOPE = ['HYPOTHESIS', 'DATA', 'SIGNALS', 'SIZING', 'COSTS', 'OUT-OF-SAMPLE', 'RISK', 'CAPACITY'];

const STRONG = [
  { k: '01', t: 'A HYPOTHESIS UP FRONT', d: 'An economic reason for the edge, written down before you saw any results.' },
  { k: '02', t: 'A FAIR TEST', d: 'Realistic costs, and an out-of-sample period you never tuned on.' },
  { k: '03', t: 'THE FAILURES TOO', d: 'What didn’t work, and how many variants you tried in total.' },
  { k: '04', t: 'CODE THAT RUNS', d: 'A judge can run it and get the same headline numbers that are in your note.' },
];

const DECODED = [
  {
    glyph: '↺',
    term: 'BACKTEST',
    plain: 'Running a strategy over historical data as if you’d traded it, bar by bar, using only what you would have known at each point.',
    twist: 'The point is to find out where your idea breaks.',
  },
  {
    glyph: 'OOS',
    term: 'OUT-OF-SAMPLE',
    plain: 'Data you set aside and never use to design or tune the strategy. It’s as close as you can get to testing on the future.',
    twist: 'For this track: the most recent 20% of your history or the most recent 2 years, whichever is shorter.',
  },
  {
    glyph: 'S/σ',
    term: 'SHARPE RATIO',
    plain: 'Average return divided by volatility, annualized. Roughly, how much return you got for the risk you took.',
    twist: 'A Sharpe above 3 on daily data usually means a bug. Check before you celebrate.',
  },
  {
    glyph: '▼%',
    term: 'MAX DRAWDOWN',
    plain: 'The biggest drop from a peak in your equity curve to the low that came after it.',
    twist: 'Ask yourself whether you’d have kept running the strategy through it.',
  },
  {
    glyph: '⇄',
    term: 'TURNOVER',
    plain: 'How much you trade per year, as a multiple of your capital. More trading means more costs.',
    twist: 'Plenty of strategies that make money gross lose it once you charge for turnover.',
  },
  {
    glyph: 'bp',
    term: 'BASIS POINT',
    plain: 'One hundredth of a percent (0.01%). Trading costs are usually quoted in bps per trade.',
    twist: 'Pick a cost for your market and explain where the number came from.',
  },
];

const SOURCES = [
  {
    name: 'DATABENTO',
    tag: 'SPONSOR DATA',
    tone: 'green',
    text: 'Market data for registered teams. Access instructions are in the Discord.',
    href: 'https://databento.com/docs',
    link: 'DOCS ↗',
  },
  {
    name: 'WEBULL',
    tag: 'SPONSOR DATA · TRACK SPONSOR',
    tone: 'green',
    text: 'Market data through the Webull OpenAPI, for any market it supports, with a ready-made backtesting starter.',
    href: '#st-webull',
    link: 'STARTER KIT ↓',
  },
  {
    name: 'FRED',
    tag: 'FREE · PUBLIC',
    tone: 'cyan',
    text: 'Macro and rates data from the St. Louis Fed.',
    href: 'https://fred.stlouisfed.org',
    link: 'FRED ↗',
  },
  {
    name: 'KEN FRENCH LIBRARY',
    tag: 'FREE · PUBLIC',
    tone: 'cyan',
    text: 'Factor returns for benchmarking against market, value and momentum.',
    href: 'https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/data_library.html',
    link: 'LIBRARY ↗',
  },
];

const ASSETS = ['EQUITIES', 'ETFS', 'FUTURES', 'FX', 'OPTIONS', 'CRYPTO'];

const HYGIENE = [
  { t: 'SURVIVORSHIP', d: 'Today’s index members are the companies that survived. Use a point-in-time universe, or say the bias is there and estimate how much it matters.' },
  { t: 'CORPORATE ACTIONS', d: 'Splits and dividends make prices jump overnight. Use adjusted data and say how it was adjusted.' },
  { t: 'MISSING DATA', d: 'Gaps, halts and stale prints. Say whether you filled or dropped them, and never fill a gap with data from after it.' },
];

const RULES = [
  { k: 'DATA', t: 'CITE EVERY SOURCE', d: 'Sponsor data is optional. Free public sources are allowed. Every source you use is cited in the note.' },
  { k: 'MARKET', t: 'ANY LIQUID MARKET', d: 'Any liquid, publicly traded market works. Pick one you can get clean data for.' },
  { k: 'COSTS', t: 'NET OF COSTS', d: 'Every reported result is net of transaction costs. State the cost in bps per trade and justify it.' },
  { k: 'ORIGINAL', t: 'EXTEND, THEN CITE', d: 'Open-source libraries and published research are fine, cited. Copying a strategy is allowed only if you clearly extend it and say what is new.' },
  { k: 'AI', t: 'AI TOOLS ALLOWED', d: 'You’re still responsible for every line of code and every claim, and judges may ask you to explain any of it.' },
  { k: 'TEAM', t: 'EVERYONE CAN EXPLAIN', d: 'Every team member should be able to explain the strategy if judges ask follow-up questions.' },
];

const PITFALLS = [
  {
    name: 'P-HACKING',
    sub: 'DATA SNOOPING',
    looks: 'Testing dozens of signals, lookbacks or thresholds and reporting only the best one.',
    fix: 'Write the hypothesis first and report how many variants you tried. Show that nearby parameter values also work; a broad plateau is far more convincing than one sharp peak.',
  },
  {
    name: 'OVERFITTING',
    sub: 'TOO MANY PARAMETERS',
    looks: 'Many free parameters, complex rules, or ML models tuned on a short history.',
    fix: 'Keep the parameter count low and favor simple rules with an economic reason behind them. Use walk-forward or cross-validation that respects time order.',
  },
  {
    name: 'LOOKAHEAD BIAS',
    sub: 'USING FUTURE INFORMATION',
    looks: 'Using information not available at decision time: same-bar close for signal and fill, revised economic data, future index membership.',
    fix: 'Lag every signal at least one bar. Trade at the next open or close. Use point-in-time data when it exists.',
  },
  {
    name: 'SURVIVORSHIP BIAS',
    sub: 'ONLY TODAY’S SURVIVORS',
    looks: 'Backtesting only on today’s index members or tickers that still trade.',
    fix: 'Use a point-in-time universe, or state the bias clearly and estimate its effect.',
  },
  {
    name: 'IGNORING COSTS',
    sub: 'GROSS RETURNS ONLY',
    looks: 'Reporting gross returns, or assuming a high-turnover strategy trades for free.',
    fix: 'Take commissions, spread and slippage out of every number, and show what happens when costs double.',
  },
  {
    name: 'LEAKING THE TEST SET',
    sub: 'TUNING ON THE TEST SET',
    looks: 'Looking at out-of-sample results, then going back and changing the strategy.',
    fix: 'Don’t touch the out-of-sample period until the end, then evaluate it once.',
  },
  {
    name: 'MISLEADING SHARPE',
    sub: 'SHARPE WITHOUT CONTEXT',
    looks: 'Sharpe from too little data, overlapping returns, or a strategy short volatility that hides tail risk.',
    fix: 'Report max drawdown, skew and worst month next to Sharpe. If you get a Sharpe above 3 on daily data, assume something is wrong until you find out what.',
  },
  {
    name: 'REGIME DEPENDENCE',
    sub: 'ONE GOOD PERIOD',
    looks: 'All the profit comes from one period, such as 2020 or 2022.',
    fix: 'Break results down by year or regime and talk about it in the note.',
  },
  {
    name: 'UNREALISTIC CAPACITY',
    sub: 'IGNORING MARKET IMPACT',
    looks: 'Trading illiquid names at full size, or ignoring market impact.',
    fix: 'Size positions as a fraction of average daily volume and estimate capacity in dollars.',
  },
];

const RISK_CONTROLS = [
  { glyph: '▥', t: 'LIMITS', d: 'Limits per name, per sector, and on gross and net exposure. What’s the most you can lose on a single position?' },
  { glyph: '⏚', t: 'DE-RISKING', d: 'Rules, set in advance, for when you cut size and when you scale back in.' },
  { glyph: '≈', t: 'FACTOR EXPOSURE', d: 'Is the edge really just market beta, momentum or value? Regress your returns on those factors to find out.' },
  { glyph: '↯', t: 'TAIL & REGIME', d: 'What happens in a crash, a volatility spike, or a market that stops trending?' },
];

const REPO_TREE: [string, string][] = [
  ['your-strategy/', ''],
  ['├── README.md', 'setup + one command to run'],
  ['├── requirements.txt', 'or environment.yml'],
  ['├── .env.example', 'keys stay out of git'],
  ['├── data/', ''],
  ['│   └── download.py', 'download scripts only'],
  ['├── src/', ''],
  ['│   ├── signals.py', ''],
  ['│   ├── backtest.py', ''],
  ['│   └── analysis.py', ''],
  ['└── run_all.py', 'reproduces the note'],
];

const REPO_MUST = [
  'A README with setup steps and the single command or notebook that reproduces your headline results',
  'A dependency file: requirements.txt, environment.yml, or equivalent',
  'All signal, backtest and analysis code',
  'Data download scripts, or instructions for getting the data',
];

const REPO_NEVER = ['Raw licensed data', 'API keys', 'A zip upload instead of a public GitHub link'];

const FINAL_CHECKS = [
  'Quant note as a PDF, 5 pages or fewer (excluding references and appendix)',
  'Hypothesis stated before results',
  'In-sample and out-of-sample results reported separately, net of costs',
  'Sharpe, max drawdown, turnover, and an equity curve included',
  'Risk management and liquidity/capacity sections included',
  'Number of strategy variants tested disclosed',
  'Public GitHub repo linked, with a README and dependency file',
  'One command or notebook reproduces the headline numbers',
  'No API keys or licensed raw data committed',
  'All team members listed on Devpost',
];

const CHECKLIST_KEY = 'gqh-systematic-checklist';

const READING = [
  {
    group: 'BACKTESTING HONESTLY',
    tone: 'green',
    note: 'Most useful this weekend',
    items: [
      { title: 'Pseudo-Mathematics and Financial Charlatanism', by: 'Bailey, Borwein, López de Prado & Zhu · Notices of the AMS, 2014', why: 'Why backtest overfitting is so easy' },
      { title: '…and the Cross-Section of Expected Returns', by: 'Harvey, Liu & Zhu · Review of Financial Studies, 2016', why: 'Why a t-stat of 2 is not enough after many tests' },
      { title: 'The Deflated Sharpe Ratio', by: 'Bailey & López de Prado, 2014', why: 'Adjusting Sharpe for the number of trials' },
      { title: 'Advances in Financial Machine Learning', by: 'Marcos López de Prado, 2018', why: 'Purged cross-validation and backtest pitfalls' },
    ],
  },
  {
    group: 'STRATEGY IDEAS & INTUITION',
    tone: 'cyan',
    items: [
      { title: 'Time Series Momentum', by: 'Moskowitz, Ooi & Pedersen · Journal of Financial Economics, 2012' },
      { title: 'Value and Momentum Everywhere', by: 'Asness, Moskowitz & Pedersen · Journal of Finance, 2013' },
      { title: 'Expected Returns', by: 'Antti Ilmanen, 2011', why: 'A survey of where returns come from' },
      { title: 'Quantitative Trading and Algorithmic Trading', by: 'Ernest Chan', why: 'Practical and beginner-friendly' },
    ],
  },
  {
    group: 'RISK & PORTFOLIO CONSTRUCTION',
    tone: 'amber',
    items: [{ title: 'Active Portfolio Management', by: 'Grinold & Kahn', why: 'The fundamental law, information ratio, sizing' }],
  },
];

const TOOLS = [
  { label: 'Databento documentation', href: 'https://databento.com/docs' },
  { label: 'Kenneth French Data Library', href: 'https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/data_library.html' },
  { label: 'FRED', href: 'https://fred.stlouisfed.org' },
  { label: 'Quantopian lecture archive', href: 'https://github.com/quantopian/research_public' },
];

const LIBRARIES = ['pandas', 'numpy', 'statsmodels', 'vectorbt', 'backtrader', 'quantstats'];

const BOOT_LINES = [
  '> LOAD UNIVERSE · 12Y DAILY BARS',
  '> LAG SIGNALS · 1 BAR',
  '> CHARGE COSTS · NET OF 5 BPS',
  '> LOCK OUT-OF-SAMPLE',
];

function PitfallGrid() {
  const [flipped, setFlipped] = useState<boolean[]>(() => PITFALLS.map(() => false));
  const fixedCount = flipped.filter(Boolean).length;

  return (
    <div className="st-pits">
      <div className="st-pits__head">
        <span>TAP A CARD TO SEE HOW TO AVOID IT</span>
        <em>
          {fixedCount}/{PITFALLS.length} READ
        </em>
      </div>
      <div className="st-pits__grid">
        {PITFALLS.map((pit, index) => {
          const on = flipped[index];
          return (
            <Reveal key={pit.name} delay={(index % 3) * 80}>
              <button
                type="button"
                className={`st-pit ${on ? 'st-pit--fixed' : ''}`}
                onClick={() => setFlipped((current) => current.map((value, k) => (k === index ? !value : value)))}
                aria-pressed={on}
              >
                <span className="st-pit__top">
                  <span className="st-pit__n">{String(index + 1).padStart(2, '0')}</span>
                  <span className="st-pit__state">{on ? 'FIX' : 'PROBLEM'}</span>
                </span>
                <span className="st-pit__name">{pit.name}</span>
                <span className="st-pit__sub">{pit.sub}</span>
                <span className="st-pit__label">{on ? 'HOW TO AVOID IT' : 'WHAT IT LOOKS LIKE'}</span>
                <span className="st-pit__text" key={on ? 'fix' : 'looks'}>
                  {on ? pit.fix : pit.looks}
                </span>
              </button>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}

export default function SystematicTrackPage({
  onNavigate,
  isIntroActive = false,
}: {
  onNavigate?: (page: AppPage) => void;
  isIntroActive?: boolean;
}) {
  // Only boot in when arriving from inside the site; a direct visit already
  // gets the rocket intro.
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
    const heroObserver = new IntersectionObserver(([entry]) => setHeroInView(entry.isIntersecting), {
      threshold: 0.25,
    });
    heroObserver.observe(hero);

    const chapterObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveChapter(CHAPTERS.findIndex((chapter) => chapter.id === entry.target.id));
          }
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

  const backToTracks = () => {
    onNavigate?.('home');
    window.setTimeout(() => {
      document.getElementById('game-modes')?.scrollIntoView({ behavior: 'instant' as ScrollBehavior, block: 'start' });
    }, 60);
  };

  const beginBriefing = () => {
    document.getElementById(CHAPTERS[0].id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="st-page">
      <TrackStyles />
      {booting && <BootArrival lines={BOOT_LINES} ok="TRACK 03 · SYSTEMATIC TRADING" onDone={() => setBooting(false)} />}

      <section ref={heroRef} className="st-hero">
        <TapeField />
        <div className="st-hero__shade" aria-hidden="true" />
        <div className="st-hero__scan" aria-hidden="true" />

        <div className="st-wrap st-hero__content">
          <button type="button" className={`st-back ${heroReady ? 'st-in' : ''}`} onClick={backToTracks}>
            ← ALL TRACKS
          </button>

          <div className={`st-hero__badge ${heroReady ? 'st-in' : ''}`}>
            <span className="st-emblem" aria-hidden="true">
              <b />
              <i />
            </span>
            <span>
              TRACK 03 · SYSTEMATIC TRADING
              <em>STRATEGY · BACKTEST · QUANT NOTE · SPONSORED BY WEBULL</em>
            </span>
          </div>

          <div className={`st-hero__signal ${heroReady ? 'st-in' : ''}`}>
            <span className="st-dot" /> OCT 2–4, 2026 · ANY LANGUAGE · NO P&amp;L LEADERBOARD
          </div>

          <h1 className="st-hero__title">
            <span className="sr-only">Find an edge. Prove it honestly.</span>
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

          <button
            type="button"
            className={`st-bonus-cta ${heroReady ? 'st-in' : ''}`}
            style={{ animationDelay: '1450ms' }}
            onClick={() => onNavigate?.('massive-track')}
          >
            <span className="st-bonus-cta__tag">+ BONUS PRIZE</span>
            <img src={massiveLogo} alt="Massive" />
            <span className="st-bonus-cta__text">TRADE THE 8-K · OPTIONS CHALLENGE</span>
            <i aria-hidden="true">→</i>
          </button>
        </div>

        <div className="st-hero__live" aria-hidden="true">
          <span className="st-dot st-dot--green" /> BACKGROUND: A TREND RULE ON SYNTHETIC PRICES
        </div>
        <button type="button" className="st-hero__cue" onClick={beginBriefing} aria-label="Scroll to the overview">
          <span>READ THE BRIEF</span>
          <i />
        </button>
      </section>

      <BriefingHud chapters={CHAPTERS} active={activeChapter} visible={!heroInView && activeChapter >= 0} />

      <Chapter
        id="st-mission"
        index={1}
        kicker="OVERVIEW"
        title="What you’re doing this weekend"
        lede="Your team designs, builds and backtests a systematic trading strategy, then hands in a quant note (five pages max) and the code behind it. There’s no P&L leaderboard. Judges score your reasoning: why the edge should exist, how carefully you tested it, and whether it would hold up in real trading."
      >
        <div className="st-story">
          {STORY_LOG.map((entry, index) => (
            <Reveal key={entry.log} delay={index * 90} className={`st-story__beat ${index === 0 ? 'st-story__beat--premise' : ''}`}>
              <div className="st-story__stamp">
                <span>{entry.log}</span>
                <b>{entry.label}</b>
              </div>
              <p className="st-story__text">{entry.text}</p>
            </Reveal>
          ))}

          <Reveal delay={STORY_LOG.length * 90} className="st-story__beat st-story__beat--open">
            <div className="st-story__stamp">
              <span>SUN 11:00 AM</span>
              <b>DEVPOST CLOSES</b>
            </div>
            <p className="st-story__text">Note and repo link due on Devpost. You can keep pushing code until 11:00 AM.</p>
          </Reveal>

          <Reveal delay={(STORY_LOG.length + 1) * 90} className="st-story__beat st-story__beat--task">
            <div className="st-story__stamp">
              <span>YOUR TASK</span>
              <b>OCT 2–4</b>
            </div>
            <div>
              <p className="st-story__brief">
                Start from a <strong>clear economic hypothesis</strong>, turn it into a strategy, and test it with{' '}
                <strong>realistic costs and a real out-of-sample period</strong>. Then report what you found, including
                what didn’t work.
              </p>
              <p className="st-story__fine">
                Judges care more about how you tested than how big the returns are. A modest strategy with a solid
                rationale will score better than a huge backtest that doesn’t hold up. Use any language; most teams use
                Python.
              </p>
              <p className="st-story__scope">
                <span>IN SCOPE</span>
                {SCOPE.map((item) => (
                  <em key={item}>{item}</em>
                ))}
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal>
          <div className="st-bonus">
            <div className="st-bonus__head">
              <span>+ BONUS PRIZE · SPONSORED BY</span>
              <img src={massiveLogo} alt="Massive" />
            </div>
            <div className="st-bonus__body">
              <h3>Trade the 8-K</h3>
              <p>
                Massive is running a bonus challenge inside this track. You use Massive’s 8-K disclosure categories as the
                signal and its options data as the instrument, and argue that certain kinds of corporate filings tell you when
                to put on one of five options strategies. There’s a starter notebook for the data work, and judging is on the
                research rather than P&amp;L.
              </p>
              <ul>
                <li>$500 toward the winning team’s prize, plus a month of Massive data for each member</li>
                <li>Starter notebook and Massive’s judging criteria are on the bonus page. All the normal track rules still apply.</li>
                <li>Workshop: Saturday 1:00 PM, Reitz Room 2355</li>
              </ul>
            </div>
            <button type="button" className="st-btn st-btn--primary st-bonus__go" onClick={() => onNavigate?.('massive-track')}>
              BONUS CHALLENGE DETAILS →
            </button>
          </div>
        </Reveal>

        <SubHead>WHAT JUDGES WANT TO SEE</SubHead>
        <div className="st-rules st-rules--four">
          {STRONG.map((rule, index) => (
            <Reveal key={rule.t} delay={index * 90}>
              <div className="st-rule">
                <div className="st-rule__k">{rule.k}</div>
                <div className="st-rule__t">{rule.t}</div>
                <p>{rule.d}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <SubHead>KEY TERMS</SubHead>
        <div className="st-decoded">
          {DECODED.map((card, index) => (
            <Reveal key={card.term} delay={(index % 3) * 90}>
              <article className="st-decoded__card">
                <div className="st-decoded__glyph">{card.glyph}</div>
                <h4>{card.term}</h4>
                <p>{card.plain}</p>
                <p className="st-decoded__twist">{card.twist}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <p className="st-note">
            <span>NO LEADERBOARD</span>
            Returns alone don’t win anything. Judges would rather see a Sharpe of 0.6 you can defend than a 4 you can’t
            explain.
          </p>
        </Reveal>
      </Chapter>

      <Chapter
        id="st-hypothesis"
        index={2}
        kicker="HYPOTHESIS"
        title="Who’s on the other side of your trade?"
        lede="Every trade has a counterparty. Before you look at any results, write down who’s taking the other side and why the opportunity hasn’t gone away. That’s the core of your Economic Foundation score, and having it in writing makes it harder to fool yourself once backtests start coming in."
      >
        <Reveal>
          <HypothesisBuilder />
        </Reveal>
        <Reveal>
          <p className="st-note st-note--cyan">
            <span>COMMIT IT FIRST</span>
            Commit your hypothesis to the repo before your first backtest. The commit timestamp shows judges it came
            before the results.
          </p>
        </Reveal>
      </Chapter>

      <Chapter
        id="st-data"
        index={3}
        kicker="DATA"
        title="Get clean data, then hold some back"
        lede="Pick a liquid, publicly traded market you can get clean data for. Registered teams get sponsor data from Databento and Webull, and free public sources are fine too. Once you have your history, set aside the most recent part and leave it alone until the end."
      >
        <div className="st-sources">
          {SOURCES.map((source, index) => (
            <Reveal key={source.name} delay={index * 90}>
              <article className={`st-source st-source--${source.tone}`}>
                <span className="st-source__tag">{source.tag}</span>
                <h4>{source.name}</h4>
                <p>{source.text}</p>
                <a
                  href={source.href}
                  {...(source.href.startsWith('#')
                    ? {
                        // Scroll in place: following a #fragment fires popstate, which App answers by jumping to the top.
                        onClick: (event: MouseEvent) => {
                          event.preventDefault();
                          document.getElementById(source.href.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        },
                      }
                    : { target: '_blank', rel: 'noreferrer' })}
                >
                  {source.link}
                </a>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="st-assets">
            <span className="st-assets__title">ANY LIQUID MARKET</span>
            {ASSETS.map((asset) => (
              <span key={asset} className="st-assets__chip">
                {asset}
              </span>
            ))}
          </div>
        </Reveal>

        <SubHead>THE OUT-OF-SAMPLE RULE</SubHead>
        <Reveal>
          <HoldoutPlanner />
        </Reveal>

        <SubHead>DATA PROBLEMS TO HANDLE (AND EXPLAIN IN THE NOTE)</SubHead>
        <div className="st-gotchas">
          {HYGIENE.map((item, index) => (
            <Reveal key={item.t} delay={index * 100}>
              <article className={`st-gotcha st-gotcha--${['amber', 'cyan', 'red'][index]}`}>
                <h4>{item.t}</h4>
                <p>{item.d}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <SubHead>THE RULES</SubHead>
        <div className="st-rules st-rules--six">
          {RULES.map((rule, index) => (
            <Reveal key={rule.t} delay={(index % 3) * 90}>
              <div className="st-rule">
                <div className="st-rule__k">{rule.k}</div>
                <div className="st-rule__t">{rule.t}</div>
                <p>{rule.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Chapter>

      <WebullStarter index={4} />

      <Chapter
        id="st-backtest"
        index={5}
        kicker="BACKTESTING"
        title="Try to break your own backtest"
        lede="Below is a small but complete backtest: a trend-following rule on twelve years of synthetic prices. Change the lookback, raise costs, turn on the lookahead bug, and when you’re done tuning, evaluate the out-of-sample period once to see if the edge holds."
      >
        <Reveal>
          <BacktestLab />
        </Reveal>

        <div className="st-gotchas">
          <Reveal>
            <article className="st-gotcha st-gotcha--red">
              <h4>LAG EVERY SIGNAL</h4>
              <p>
                If a signal uses today’s close, you can’t also trade at today’s close. Trade at the next open or close
                instead. Switch the lab to <strong>SAME BAR</strong> to see how much fake performance that bug adds.
              </p>
            </article>
          </Reveal>
          <Reveal delay={100}>
            <article className="st-gotcha st-gotcha--amber">
              <h4>DOUBLE THE COSTS</h4>
              <p>
                Report everything net of commissions, spread and slippage, and show what happens when costs double. If
                the edge disappears, say so.
              </p>
            </article>
          </Reveal>
          <Reveal delay={200}>
            <article className="st-gotcha st-gotcha--cyan">
              <h4>REPORT THE MINIMUM</h4>
              <p>
                For in-sample and out-of-sample separately: annualized return, volatility, Sharpe, max drawdown,
                turnover, and an equity curve.
              </p>
            </article>
          </Reveal>
        </div>
      </Chapter>

      <Chapter
        id="st-pitfalls"
        index={6}
        kicker="PITFALLS"
        title="Common ways backtests go wrong"
        lede="Judges see these every year. Each one makes a backtest look better without making the strategy any better. Catch them yourself and you’ll do better on Economic Foundation and Performance."
      >
        <Reveal>
          <PitfallGrid />
        </Reveal>

        <SubHead>TRYING MANY VARIANTS ON NOISE</SubHead>
        <Reveal>
          <OverfitMachine />
        </Reveal>

        <Reveal>
          <p className="st-note st-note--amber">
            <span>CHECK THE SIMPLE EXPLANATION</span>
            When a result looks good, look for a simpler reason first. Usually it’s a bug, a bias, or exposure to
            something well known like market beta, momentum or value.
          </p>
        </Reveal>
      </Chapter>

      <Chapter
        id="st-risk"
        index={7}
        kicker="RISK & CAPACITY"
        title="What happens with real money"
        lede="Two of the five judging criteria are about what comes after the backtest: how you control risk, and how much money the strategy could manage before trading costs and market impact eat the edge."
      >
        <div className="st-controls">
          {RISK_CONTROLS.map((control, index) => (
            <Reveal key={control.t} delay={index * 90}>
              <article className="st-control">
                <div className="st-control__glyph">{control.glyph}</div>
                <h4>{control.t}</h4>
                <p>{control.d}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <SubHead>ESTIMATING CAPACITY</SubHead>
        <Reveal>
          <CapacityDial />
        </Reveal>
      </Chapter>

      <Chapter
        id="st-note"
        index={8}
        kicker="QUANT NOTE"
        title="Writing the quant note"
        lede="The quant note is a PDF of at most five pages, figures and tables included. References and an optional appendix of extra charts don’t count toward the limit, but judges aren’t required to read the appendix. Use 11pt font or larger and standard margins."
      >
        <Reveal>
          <NoteBlueprint />
        </Reveal>
      </Chapter>

      <Chapter
        id="st-judging"
        index={9}
        kicker="JUDGING"
        title="How it’s scored"
        lede="Judges score five criteria from 1 to 10, for a total out of 50. Code isn’t scored on its own, but it supports your Performance score, and judges will spot-check that it runs and matches your note."
      >
        <Reveal>
          <RubricSim />
        </Reveal>
        <Reveal>
          <p className="st-note st-note--red">
            <span>SCORE CAP</span>
            If judges can’t run your code, or it gives materially different numbers than your note, your Performance and
            Analytical Evidence score is capped at 4. The same cap applies if they find lookahead bias or tuning on the
            out-of-sample period.
          </p>
        </Reveal>
      </Chapter>

      <Chapter
        id="st-submit"
        index={10}
        kicker="SUBMITTING"
        title="How to submit"
        lede="Submit two things on Devpost: your quant note as a PDF and a link to a public GitHub repo. Both are required. A note without code, or code without a note, won’t be judged."
      >
        <Reveal>
          <DeadlineClock />
        </Reveal>

        <Reveal>
          <div className="st-official">
            <div>
              <span>DEVPOST LINK</span>
              <a href={DEVPOST_URL} target="_blank" rel="noreferrer">
                GQHACKS.DEVPOST.COM ↗
              </a>
            </div>
            <div>
              <span>DEADLINE</span>
              <b>SUN OCT 4 · 11:00 AM</b>
            </div>
            <div>
              <span>DATA ACCESS & HELP</span>
              <a href={DISCORD_URL} target="_blank" rel="noreferrer">
                PARTICIPANT DISCORD ↗
              </a>
            </div>
            <div>
              <span>EVENT INFO</span>
              <a href={HACKER_GUIDE_URL} target="_blank" rel="noreferrer">
                HACKER GUIDE ↗
              </a>
            </div>
          </div>
        </Reveal>

        <div className="st-repo">
          <Reveal>
            <article className="st-repo__card">
              <h4>WHAT GOES IN THE REPO</h4>
              <ul>
                {REPO_MUST.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <h4 className="st-repo__never-title">NEVER COMMIT</h4>
              <ul className="st-repo__never">
                {REPO_NEVER.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="st-repo__fine">
                Judges will spot-check that your code runs and that the numbers in your note match what it produces.
              </p>
            </article>
          </Reveal>
          <Reveal delay={120}>
            <div>
              <pre className="st-tree" aria-label="Example repository layout">
                {REPO_TREE.map(([path, note], index) => (
                  <span key={path} className="st-tree__line" style={{ animationDelay: `${index * 90}ms` }}>
                    <b>{path}</b>
                    {note && <em>{note}</em>}
                  </span>
                ))}
              </pre>
              <p className="st-tree__caption">EXAMPLE LAYOUT · YOURS CAN DIFFER</p>
            </div>
          </Reveal>
        </div>

        <SubHead>SUBMISSION CHECKLIST</SubHead>
        <Reveal>
          <FinalChecklist items={FINAL_CHECKS} storageKey={CHECKLIST_KEY} goText="ALL CHECKED · SUBMIT ON DEVPOST BEFORE 11:00 AM" />
        </Reveal>

        <SubHead>FURTHER READING (OPTIONAL)</SubHead>
        <div className="st-library">
          {READING.map((shelf, index) => (
            <Reveal key={shelf.group} delay={index * 100}>
              <article className={`st-shelf st-shelf--${shelf.tone}`}>
                <h4>
                  {shelf.group}
                  {shelf.note && <em>{shelf.note}</em>}
                </h4>
                <ul>
                  {shelf.items.map((item) => (
                    <li key={item.title}>
                      <cite>{item.title}</cite>
                      <span>{item.by}</span>
                      {item.why && <small>{item.why}</small>}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
          <Reveal delay={300}>
            <article className="st-shelf st-shelf--orange">
              <h4>DATA & TOOLS</h4>
              <div className="st-shelf__links">
                {TOOLS.map((tool) => (
                  <a key={tool.href} href={tool.href} target="_blank" rel="noreferrer">
                    {tool.label} ↗
                  </a>
                ))}
              </div>
              <div className="st-shelf__libs">
                {LIBRARIES.map((lib) => (
                  <code key={lib}>{lib}</code>
                ))}
              </div>
            </article>
          </Reveal>
        </div>
      </Chapter>

      <section className="st-final">
        <div className="st-wrap">
          <Reveal>
            <div className="st-final__panel">
              <div className="st-final__curve" aria-hidden="true">
                <svg viewBox="0 0 400 80" preserveAspectRatio="none">
                  <path d="M0 70 L40 62 L70 66 L110 50 L140 54 L180 40 L210 44 L250 30 L280 34 L320 22 L360 18 L400 8" />
                </svg>
              </div>
              <div className="st-final__kicker">SYSTEMATIC TRADING TRACK</div>
              <h2>Questions? Ask us.</h2>
              <p>
                Post in the{' '}
                <a href={DISCORD_URL} target="_blank" rel="noreferrer">
                  Discord
                </a>{' '}
                or email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Gator Quant Hacks runs October 2–4, 2026.
              </p>
              <div className="st-final__actions">
                <a className="st-btn st-btn--primary" href={DISCORD_URL} target="_blank" rel="noreferrer">
                  JOIN THE DISCORD ↗
                </a>
                <button type="button" className="st-btn" onClick={backToTracks}>
                  ← BACK TO ALL TRACKS
                </button>
              </div>
              <p className="st-final__fine">
                This page summarizes the Systematic Trading Track Participant Brief. The interactive labs use synthetic
                data. If anything here conflicts with the brief or an organizer announcement, go with the brief or the
                announcement.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}
