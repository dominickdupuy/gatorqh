import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Reveal } from '../Reveal';
import { Footer } from '../Footer';
import bluePlanet from '../bluePlanet.webp';
import { SolarSystemModel } from './SolarSystemModel';
import { LightRace, SETTLEMENT_COLORS } from './LightRace';
import { PacketLossLab } from './PacketLossLab';
import { FuturesPaths } from './FuturesPaths';
import { StressTimeline } from './StressTimeline';
import { type SettlementId } from './orbits';

type AppPage = 'home' | 'apply';

const PAGE_TITLE = 'The MultiPlanetary Exchange | Gator Quant Hacks 2026';

const BRIEF_URL = '/quant/MultiPlanetary_Exchange_System_Participant_Brief.pdf';
const ORBITAL_DATA_URL = '/quant/Alpha_Orbital_Data.zip';

const CHAPTERS = [
  { id: 'qt-commission', label: 'THE COMMISSION' },
  { id: 'qt-light', label: 'THE SPEED LIMIT' },
  { id: 'qt-network', label: 'THE NETWORK' },
  { id: 'qt-map', label: 'THE MOVING MAP' },
  { id: 'qt-deals', label: 'YOUR SCENARIOS' },
  { id: 'qt-stress', label: 'WHEN THINGS BREAK' },
  { id: 'qt-submit', label: 'THE DELIVERABLE' },
];

const HERO_LINES = ['THE', 'MULTIPLANETARY', 'EXCHANGE'];

type StoryEntry = {
  log: string;
  label?: string;
  route?: SettlementId[];
  link?: string;
  text: string;
};

const STORY_LOG: StoryEntry[] = [
  {
    log: 'LOG 01',
    label: 'ALL STATIONS',
    text: 'It is 22 September 2126. Humanity lives at nine settlements strung from Mercury to Neptune, and every planet sits exactly where the real one was on 22 September 2026.',
  },
  {
    log: 'LOG 02',
    route: ['Earth', 'Mars'],
    link: '→',
    text: 'An investor on Earth wants 100 shares of Ares Habitat from a seller on Mars. The money is on one planet. The shares are on another.',
  },
  {
    log: 'LOG 03',
    route: ['Ceres', 'Mars'],
    link: '⇄',
    text: 'A mining crew on Ceres pulls metal out of the asteroid belt. A factory on Mars needs that metal. Both want to lock in a price today on a contract that settles 20 days from now.',
  },
  {
    log: 'LOG 04',
    route: ['Neptune', 'Earth'],
    link: '→',
    text: 'Out at Neptune, four light-hours from home, a participant wants their savings usable back on Earth.',
  },
];

const SCOPE = ['EQUITIES', 'FUTURES', 'OPTIONS', 'BONDS', 'CURRENCIES', 'LENDING', 'SHORTS', 'CLEARING', 'SETTLEMENT'];

const DECODED = [
  {
    glyph: '⇄',
    term: 'MARKET',
    plain: 'Where buyers and sellers find each other and agree on a price.',
    twist: 'Prices may have changed by the time a buyer receives a quote from another settlement.',
  },
  {
    glyph: '≡',
    term: 'CLEARING',
    plain: 'Working out exactly who owes what to whom once a trade is agreed.',
    twist: 'Each settlement keeps records, but updates take time to reach the other side.',
  },
  {
    glyph: '✓',
    term: 'SETTLEMENT',
    plain: 'Actually moving the money and the shares so the trade is final.',
    twist: 'Your rules must make the shares usable on Earth and the payment usable on Mars.',
  },
  {
    glyph: '!',
    term: 'MARGIN & DEFAULT',
    plain: 'Collateral posted up front, plus the rulebook for when someone cannot pay.',
    twist: 'A request for more collateral can take hours to arrive or get lost.',
  },
];

const FIXED = [
  'Where every planet and relay is, and how they move',
  'The relay network, its 19 links and their limits',
  'How messages travel, get lost and are rationed',
  'Physical limits and timing rules',
  'How you are scored and what evidence you submit',
];

const YOURS = [
  'Which institutions operate the exchange (at most 12) and where they are based',
  'Market structure, contract rules, matching and clearing',
  'Margin, valuation and default procedures',
  'Your opening balance sheet: who holds what, and where',
  'Your test scenarios, including the incident that stresses your design',
  'How users at every settlement get access',
  'Exactly what you guarantee, and under which conditions',
];

const TAKEAWAYS = [
  {
    title: 'INFORMATION ARRIVES LATE',
    text: "Every clock in the system agrees, but no clock can tell you what is happening on Neptune right now. You only ever see what was true when the light left.",
  },
  {
    title: 'REPLIES TAKE TIME',
    text: 'Getting an answer requires a message in each direction. Near the starting date, an Earth–Neptune round trip takes about eight hours before processing or retries.',
  },
  {
    title: 'THE MAP MOVES',
    text: 'Everything orbits, so every distance changes every hour. No distance table or contact schedule is supplied. You compute them.',
  },
];

const SERVICES = [
  {
    id: 'backbone',
    name: 'BACKBONE',
    nickname: 'For exchange coordination',
    color: '#63f6ff',
    rows: [
      ['WHO', 'Exchange operators and their clearing and settlement services'],
      ['PATH', 'Gateway → relay(s) → gateway. At most 3 links, pinned for the session'],
      ['LOSS', 'p = 1 − e^(−0.02·d) per launch, d in AU'],
      ['SAFETY NET', 'Hop receipts, up to 4 launches per hop, endpoint retries'],
      ['BUDGET', '600 new packets per rolling 24 h, for the entire solar system'],
      ['MUST CARRY', 'Anything that creates a shared exchange record or settlement authority'],
    ],
  },
  {
    id: 'direct',
    name: 'DIRECT',
    nickname: 'For client messages',
    color: '#ffb84d',
    rows: [
      ['WHO', 'Anyone'],
      ['PATH', 'A straight line, settlement to settlement'],
      ['LOSS', 'p = 1 − e^(−0.08·d) per launch, d in AU; higher loss than the backbone'],
      ['SAFETY NET', 'No automatic receipt or retry. A reply is a separate message'],
      ['BUDGET', '12 packets per rolling 24 h per principal, at least 60 s apart'],
      ['FOR', 'Client orders, instructions and observations only'],
    ],
  },
];

// The brief sets no assignment, only four things a team's own scenarios must
// cover together (§6).
type CoverCard = {
  tag: string;
  title: string;
  floor: string;
  route?: [SettlementId, SettlementId];
  arrow?: string;
  chips?: string[];
  ask: string;
  done: string;
};

const COVERAGE: CoverCard[] = [
  {
    tag: 'COVER 01',
    title: 'MOVE VALUE',
    floor: 'FAR-APART ACCOUNTS',
    route: ['Neptune', 'Earth'],
    arrow: '→',
    ask: 'A trade, a transfer or both, where the receiver can use the result only after two settlements agree. Put the accounts far apart.',
    done: 'Your authoritative record shows it final, each party can spend the result at its own settlement, and the matching debits are recorded.',
  },
  {
    tag: 'COVER 02',
    title: 'STAY OPEN',
    floor: 'OPEN ≥ 240 h',
    chips: ['PAYMENT', 'MATURITY', 'FUNDED DEFAULT'],
    ask: 'A contract that stays open for at least 240 hours and ends by payment, maturity or a funded default.',
    done: 'Every obligation ends in a stated state: paid, matured, in funded default, or still open with a named, funded owner.',
  },
  {
    tag: 'COVER 03',
    title: 'PAY ON LATER PRICES',
    floor: 'RISING AND FALLING RUNS',
    chips: ['▲ RISING', '▼ FALLING', '≥ 20% MOVE'],
    ask: 'At least one product whose payments depend on prices observed after it opens, such as a future, an option or a short. The contract names which observations count: the final price, an average, a barrier or another rule.',
    done: 'Two separate runs on price paths you choose, each moving at least 20% from the opening price at some point, under one margin rule.',
  },
  {
    tag: 'COVER 04',
    title: 'TWO KINDS OF PRODUCT',
    floor: 'FROM THE SCOPE LIST',
    chips: ['EQUITIES', 'FUTURES', 'OPTIONS', 'BONDS', 'CURRENCIES', 'LENDING', 'SHORTS'],
    ask: 'Show at least two different kinds of product from the scope list, for example a share trade and a futures contract.',
    done: 'For each product: quantity, unit, location, maturity, pricing inputs and valuation source, who bears losses, and what happens at end of life.',
  },
];

// An example sheet built from the story's accounts, drawn against the brief's
// limits so readers see both the rule and one sheet that satisfies it.
const SHEET = [
  {
    asset: 'NEODOLLARS',
    limit: 500000,
    format: (value: number) => `$${value.toLocaleString()}`,
    segments: [
      { who: 'Investor', where: 'Earth' as SettlementId, amount: 100000 },
      { who: 'Mining producer', where: 'Ceres' as SettlementId, amount: 50000 },
      { who: 'Manufacturer', where: 'Mars' as SettlementId, amount: 50000 },
      { who: 'Saver', where: 'Neptune' as SettlementId, amount: 20000 },
    ],
  },
  {
    asset: 'ARES HABITAT SHARES',
    limit: 5000,
    format: (value: number) => value.toLocaleString(),
    segments: [
      { who: 'Share seller', where: 'Mars' as SettlementId, amount: 1000 },
      { who: 'Saver', where: 'Neptune' as SettlementId, amount: 200 },
    ],
  },
];

const SHEET_ACCOUNTS = new Set(SHEET.flatMap((row) => row.segments.map((segment) => `${segment.who}@${segment.where}`))).size;
const SHEET_SETTLEMENTS = new Set(SHEET.flatMap((row) => row.segments.map((segment) => segment.where))).size;

const POOL_RULES = [
  'An asset supports only one use at a time. Assets held as collateral are not available to spend.',
  'No new money. Every guarantee, credit advance, insurance payout and unit of collateral comes from your opening balance sheet by an explicit transaction.',
  'A loan or a new currency creates matching claims and liabilities, never free backing.',
];

const PRESSURE = [
  { k: '25%', t: 'SCALE', d: 'In at least one scenario, a quarter of your opening NeoDollars is encumbered by open positions at the same moment.' },
  { k: 'MAX LOSS', t: 'EXPOSURE', d: "For every scenario, report each side's largest possible loss and how much of your capital is encumbered." },
  { k: 'BIND', t: 'A REAL CONSTRAINT', d: 'Show one variation of size or price path that forces a margin call, a default or a suspension. If nothing binds, show why not.' },
];

const NEVER_CLOSES = [
  { title: 'BLACKOUTS', text: 'A route can vanish for weeks. What happens to open obligations meanwhile, and how does service restart?' },
  { title: 'BACKLOGS', text: 'When a route reopens, queued work lands all at once. Each link carries one packet per second; queues hold 10,000.' },
  { title: 'LATE MATURITIES', text: 'Some obligations mature long after your longest worked example. Your rules still have to handle them.' },
  { title: 'EXPIRED PACKETS', text: 'A packet dies 30 days after it is created. The obligation it was carrying does not.' },
];

const EVIDENCE = [
  { code: 'S1', title: 'SCENARIO TRACES', text: 'A no-loss trace at the epoch for each of your scenarios, with maintenance and geometry applied, covering the value move, the long-lived obligation and both price runs. Report completion times, all communications, peak encumbered assets, asset-hours, exposure and capital use, plus the variation that makes a constraint bind.' },
  { code: 'S2', title: 'STRESS & RECOVERY', text: 'Add the incident you chose to a scenario with a price-dependent product. Report lost service, the state of every obligation and the recovery. Repeat without scheduled maintenance and compare, then run one design change or sensitivity check.' },
  { code: 'S3', title: 'ACCESS EVERYWHERE', text: 'Best route, one-way delay and availability from all nine settlements, at hour 0 and again at hour 300. Then full value-move timelines for a comparable funded client at your best, median and worst settlement.' },
  { code: 'E1', title: 'ORBITS', text: 'Reproduce the epoch positions, solve light-time, and show receiver motion changing an arrival time.' },
  { code: 'E2', title: 'PROBABILITY & TRAFFIC', text: 'Every direct-service success-by-deadline probability, backbone hop-abandonment odds, every packet counted, both quotas and link capacity checked.' },
  { code: 'E3', title: 'BALANCES & CAPITAL', text: 'Who holds what, where, encumbered by what, over time, for every scenario. Prove funding is conserved and nothing is used twice.' },
  { code: 'E4', title: 'LONG-HORIZON SCAN', text: 'Scan at least 200 Julian years of link geometry and argue what your step size could have missed. Higher tiers refine an event boundary, then give availability and delay ranges for every settlement.' },
  { code: 'E5', title: 'LATER STARTING DATES', text: 'Rerun at +1, +10 and +100 years with orbits advanced and balances reset. Higher tiers add a difficult epoch you choose, then both price directions there.' },
];

const SCORING = [
  {
    points: 30,
    label: 'CORRECTNESS & ASSET PROTECTION',
    detail: 'Precise, consistent financial state and guarantees that actually hold. Top marks state authority, states, obligations and recovery exactly.',
  },
  {
    points: 25,
    label: 'ECONOMIC USEFULNESS',
    detail: 'Access and completion time 10 · communication efficiency 5 · capital efficiency 5 · recovery 5. Speed is weighed against guarantees and completion probability, and the rising and falling runs count equally.',
  },
  {
    points: 20,
    label: 'RISK DISCOVERY & RESPONSE',
    detail: 'Identify weaknesses in your design, rank their importance and explain how you address them, including risks created by the way your rules interact. Judges also weigh how hard your own scenarios and incident push on the design.',
  },
  {
    points: 15,
    label: 'QUANTITATIVE EVIDENCE',
    detail: 'Three points each for E1 to E5: correct, reproducible calculations with sensitivity analysis. A missing item scores zero.',
  },
  {
    points: 10,
    label: 'CLARITY & REPRODUCIBILITY',
    detail: 'A reader can trace every decisive claim from the documents alone, with proof, assumption and limitation kept apart.',
  },
];

const ZERO_POINTS = [
  'Presentation polish',
  'Code volume',
  '"Blockchain", "consensus", "auction" or "clearinghouse" without a procedure behind the word',
  'A list of product names with no framework or demonstration behind it',
  'Lower capital that comes from unfunded exposure',
  'Extra E4 or E5 runs beyond the tier you claim',
];

const FIRST_MOVES = [
  'Read the participant brief, especially the fixed parameters in Section 2 and the clarifications in Section 11. Use the supplied orbital data and reference propagator to check the starting positions.',
  'Publish your opening balance sheet: 4 to 10 accounts at 3 or more settlements, within $500,000 and 5,000 shares. Put accounts where they are hardest to serve.',
  'Choose where institutions and account records are based. Specify who can approve trades, move assets and resolve failed payments.',
  'Trace a value move one step per row: time, actor, local knowledge, action, packet, arrival and financial state after.',
  'State one margin rule, run both price paths, then pick the incident that hurts most and test later starting dates. Record your calculations for the evidence appendix.',
];

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const GLYPHS = '#%&*+=?<>/\\[]{}01ABCDEFGHJKLMNPQRSTUVWXYZ';

// Characters resolve left to right out of random glyphs, like a signal locking on.
function DecodeText({ text, active, delay = 0 }: { text: string; active: boolean; delay?: number }) {
  const [out, setOut] = useState(() => text.replace(/\S/g, ' '));

  useEffect(() => {
    if (!active) return;
    if (reducedMotion()) {
      setOut(text);
      return;
    }
    let raf = 0;
    const begin = performance.now() + delay;
    const tick = (now: number) => {
      const progress = Math.min(1, Math.max(0, (now - begin) / 1100));
      let next = '';
      for (let index = 0; index < text.length; index += 1) {
        const revealAt = (index / text.length) * 0.65;
        if (progress >= revealAt + 0.35) next += text[index];
        else if (progress >= revealAt) next += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        else next += ' ';
      }
      setOut(next);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, delay, text]);

  return <span aria-hidden="true">{out}</span>;
}

// Arriving from the tracks section: streaks decelerate out of warp, then clear.
function WarpArrival({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const doneRef = useRef(onDone);
  const [fading, setFading] = useState(false);
  doneRef.current = onDone;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    const reach = Math.hypot(width, height) / 2;
    const palette = ['#dfefff', '#dfefff', '#63f6ff', '#9cc9ff', '#FA4616'];
    const stars = Array.from({ length: 380 }, () => ({
      angle: Math.random() * Math.PI * 2,
      dist: 0.02 + Math.random() * 0.95,
      speed: 0.5 + Math.random() * 1.1,
      color: palette[Math.floor(Math.random() * palette.length)],
    }));
    const duration = 1050;
    const begin = performance.now();
    let last = begin;
    let raf = 0;
    let timer = 0;

    const frame = (now: number) => {
      const t = Math.min(1, (now - begin) / duration);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const velocity = 3.2 * (1 - t) ** 2 + 0.05;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = 'rgba(2, 4, 10, 0.5)';
      ctx.fillRect(0, 0, width, height);
      for (const star of stars) {
        const from = star.dist;
        star.dist += velocity * star.speed * dt * (0.35 + star.dist);
        if (star.dist > 1.25) {
          star.dist = 0.02 + Math.random() * 0.1;
          continue;
        }
        const tail = Math.max(0, from - velocity * 0.05 * star.speed);
        ctx.strokeStyle = star.color;
        ctx.globalAlpha = Math.min(1, star.dist * 1.6);
        ctx.lineWidth = 0.6 + star.dist * 1.8;
        ctx.beginPath();
        ctx.moveTo(width / 2 + Math.cos(star.angle) * tail * reach, height / 2 + Math.sin(star.angle) * tail * reach);
        ctx.lineTo(width / 2 + Math.cos(star.angle) * star.dist * reach, height / 2 + Math.sin(star.angle) * star.dist * reach);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      if (t < 1) {
        raf = requestAnimationFrame(frame);
      } else {
        setFading(true);
        timer = window.setTimeout(() => doneRef.current(), 480);
      }
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div className={`qt-warp ${fading ? 'qt-warp--out' : ''}`} aria-hidden="true">
      <canvas ref={canvasRef} />
      <div className="qt-warp__text">DROPPING OUT OF WARP · TRACK 02</div>
    </div>
  );
}

function Chapter({
  id,
  index,
  kicker,
  title,
  lede,
  children,
}: {
  id: string;
  index: number;
  kicker: string;
  title: string;
  lede?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="qt-chapter" data-chapter={index}>
      <div className="qt-wrap">
        <Reveal className="qt-chapter__head">
          <div className="qt-chapter__ghost" aria-hidden="true">
            {String(index).padStart(2, '0')}
          </div>
          <div className="qt-chapter__kicker">
            <span>CH {String(index).padStart(2, '0')}</span>
            {kicker}
          </div>
          <h2 className="qt-chapter__title">{title}</h2>
          {lede && <p className="qt-lede">{lede}</p>}
        </Reveal>
        {children}
      </div>
    </section>
  );
}

function SubHead({ children }: { children: ReactNode }) {
  return (
    <Reveal className="qt-subhead">
      <span />
      <h3>{children}</h3>
      <span />
    </Reveal>
  );
}

// A slim chapter rail in the left gutter; hover or click to jump between chapters.
function BriefingHud({ active, visible }: { active: number; visible: boolean }) {
  const [open, setOpen] = useState(false);
  const current = Math.max(0, active);

  useEffect(() => {
    if (!visible) setOpen(false);
  }, [visible]);

  return (
    <nav className={`qt-hud ${visible ? 'qt-hud--on' : ''}`} aria-label="Briefing chapters">
      <button
        type="button"
        className="qt-hud__main"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={`Chapter ${current + 1} of ${CHAPTERS.length}: ${CHAPTERS[current].label}`}
      >
        <span className="qt-hud__count">
          {String(current + 1).padStart(2, '0')}
          <small>/{String(CHAPTERS.length).padStart(2, '0')}</small>
        </span>
        <span className="qt-hud__bar" aria-hidden="true">
          {CHAPTERS.map((chapter, index) => (
            <i
              key={chapter.id}
              className={`${index <= active ? 'qt-hud__tick--on' : ''} ${index === active ? 'qt-hud__tick--now' : ''}`}
            />
          ))}
        </span>
      </button>
      <ol className={`qt-hud__list ${open ? 'qt-hud__list--open' : ''}`}>
        <li className="qt-hud__list-title">BRIEFING</li>
        {CHAPTERS.map((chapter, index) => (
          <li key={chapter.id}>
            <button
              type="button"
              className={index === active ? 'qt-hud__item--on' : ''}
              onClick={() => {
                document.getElementById(chapter.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setOpen(false);
              }}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              {chapter.label}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default function QuantTrackPage({
  onNavigate,
  isIntroActive = false,
}: {
  onNavigate?: (page: AppPage) => void;
  isIntroActive?: boolean;
}) {
  // Only warp in when arriving from inside the site; a direct visit already
  // gets the rocket intro.
  const [warping, setWarping] = useState(() => !isIntroActive && !reducedMotion());
  const [activeChapter, setActiveChapter] = useState(-1);
  const [heroInView, setHeroInView] = useState(true);
  const heroRef = useRef<HTMLElement>(null);
  const heroReady = !isIntroActive && !warping;

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
    <div className="qt-page">
      <TrackStyles />
      {warping && <WarpArrival onDone={() => setWarping(false)} />}

      <section ref={heroRef} className="qt-hero">
        <SolarSystemModel variant="ambient" />
        <div className="qt-hero__shade" aria-hidden="true" />
        <div className="qt-hero__scan" aria-hidden="true" />

        <div className="qt-wrap qt-hero__content">
          <button type="button" className={`qt-back ${heroReady ? 'qt-in' : ''}`} onClick={backToTracks}>
            ← ALL TRACKS
          </button>

          <div className={`qt-hero__badge ${heroReady ? 'qt-in' : ''}`}>
            <span className="qt-emblem" aria-hidden="true">
              <img src={bluePlanet} alt="" />
              <i />
            </span>
            <span>
              TRACK 02 · QUANTITATIVE PUZZLES
              <em>MISSION FILE: MULTIPLANETARY EXCHANGE SYSTEM</em>
            </span>
          </div>

          <div className={`qt-hero__signal ${heroReady ? 'qt-in' : ''}`}>
            <span className="qt-dot" /> INCOMING TRANSMISSION · EARTH GATEWAY · 2126-09-22 00:00 TDB
          </div>

          <h1 className="qt-hero__title">
            <span className="sr-only">The MultiPlanetary Exchange</span>
            {HERO_LINES.map((line, index) => (
              <span key={line} className={`qt-hero__line qt-hero__line--${index}`}>
                <DecodeText text={line} active={heroReady} delay={150 + index * 260} />
              </span>
            ))}
          </h1>
        </div>

        <div className="qt-hero__live" aria-hidden="true">
          <span className="qt-dot qt-dot--green" /> LIVE MODEL · REAL PLANET POSITIONS FROM THE 22 SEP 2026 EPOCH
        </div>
        <button type="button" className="qt-hero__cue" onClick={beginBriefing} aria-label="Scroll to the briefing">
          <span>READ THE CHALLENGE</span>
          <i />
        </button>
      </section>

      <BriefingHud active={activeChapter} visible={!heroInView && activeChapter >= 0} />

      <Chapter
        id="qt-commission"
        index={1}
        kicker="THE COMMISSION"
        title="Design an exchange across the solar system"
        lede="In this Gator Quant Hacks track, you have 40 hours to design a financial exchange for nine settlements. Explain how people trade, how payments finish and what happens when communication fails. Submit a design paper and an evidence appendix; coding is optional."
      >
        <Reveal>
          <div className="qt-files">
            <div>
              <span>MISSION FILES · RELEASED OCT 2, 2026</span>
              <strong>Participant brief + Alpha orbital data</strong>
              <em>The brief is the official rulebook. The data pack holds the orbital elements, network model and JPL source files.</em>
            </div>
            <div className="qt-files__actions">
              <a className="qt-btn qt-btn--primary" href={BRIEF_URL} target="_blank" rel="noreferrer">
                READ THE BRIEF (PDF)
              </a>
              <a className="qt-btn" href={ORBITAL_DATA_URL} download="Alpha_Orbital_Data.zip">
                ORBITAL DATA (ZIP)
              </a>
            </div>
          </div>
        </Reveal>

        <div className="qt-story">
          {STORY_LOG.map((entry, index) => (
            <Reveal key={entry.log} delay={index * 90} className={`qt-story__beat ${index === 0 ? 'qt-story__beat--premise' : ''}`}>
              <div className="qt-story__stamp">
                <span>{entry.log}</span>
                {entry.route ? (
                  <b>
                    {entry.route.map((id, stop) => (
                      <span key={id}>
                        {stop > 0 && <i>{entry.link}</i>}
                        <em style={{ color: SETTLEMENT_COLORS[id] }}>{id.toUpperCase()}</em>
                      </span>
                    ))}
                  </b>
                ) : (
                  <b>{entry.label}</b>
                )}
              </div>
              <p className="qt-story__text">{entry.text}</p>
            </Reveal>
          ))}

          <Reveal delay={STORY_LOG.length * 90} className="qt-story__beat qt-story__beat--open">
            <div className="qt-story__stamp">
              <span>LOG 05</span>
              <b>UNRESOLVED</b>
            </div>
            <p className="qt-story__text">
              Your task is to design the exchange that handles transactions like these, including what happens
              when messages arrive late or payments fail.
            </p>
          </Reveal>

          <Reveal delay={(STORY_LOG.length + 1) * 90} className="qt-story__beat qt-story__beat--task">
            <div className="qt-story__stamp">
              <span>YOUR TASK</span>
              <b>40 HOURS</b>
            </div>
            <div>
              <p className="qt-story__brief">
                Write the rules that let people at all nine settlements <strong>buy and sell investments, transfer
                assets and enter financial contracts</strong>. Decide who operates the exchange, how transactions
                are recorded and how money and shares become available to their new owners.
              </p>
              <p className="qt-story__fine">
                There is no fixed assignment: you choose your own opening balances and test scenarios. Show each
                step precisely enough that a reader can follow a transaction from its first instruction to its final
                outcome, and explain what your rules guarantee, under which conditions and at what cost. The 40 hours
                is your submission deadline, not the market’s lifetime.
              </p>
              <p className="qt-story__scope">
                <span>IN SCOPE</span>
                {SCOPE.map((item) => (
                  <em key={item}>{item}</em>
                ))}
              </p>
            </div>
          </Reveal>
        </div>

        <SubHead>KEY FINANCIAL TERMS</SubHead>
        <div className="qt-decoded">
          {DECODED.map((card, index) => (
            <Reveal key={card.term} delay={index * 90}>
              <article className="qt-decoded__card">
                <div className="qt-decoded__glyph">{card.glyph}</div>
                <h4>{card.term}</h4>
                <p>{card.plain}</p>
                <p className="qt-decoded__twist">{card.twist}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <div className="qt-split">
          <Reveal>
            <div className="qt-split__col qt-split__col--fixed">
              <h4>THE BRIEF FIXES</h4>
              <ul>
                {FIXED.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="qt-split__col qt-split__col--yours">
              <h4>YOU DESIGN</h4>
              <ul>
                {YOURS.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
        <Reveal>
          <p className="qt-note">
            <span>CHOOSING A DESIGN</span>
            You can use one central exchange, several cooperating exchanges or scheduled trading rounds. No structure
            is preferred. Explain why your choice works, what participants give up and where it could fail.
          </p>
        </Reveal>
      </Chapter>

      <Chapter
        id="qt-light"
        index={2}
        kicker="THE SPEED LIMIT"
        title="Messages take minutes or hours"
        lede="Messages travel at the speed of light. Crossing one astronomical unit (AU), roughly the Earth–Sun distance, takes 8.317 minutes. Your exchange must work while participants wait for instructions and replies. Select a settlement below to compare travel times."
      >
        <Reveal>
          <LightRace />
        </Reveal>
        <div className="qt-takeaways">
          {TAKEAWAYS.map((item, index) => (
            <Reveal key={item.title} delay={index * 100}>
              <article className="qt-takeaway">
                <span className="qt-takeaway__n">0{index + 1}</span>
                <h4>{item.title}</h4>
                <p>{item.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </Chapter>

      <Chapter
        id="qt-network"
        index={3}
        kicker="THE NETWORK"
        title="How messages travel"
        lede="Each settlement has one gateway: its connection to the network. Two relays, A and B, orbit the Sun at about 2.83 AU. You must use this fixed network. Messages travel in packets of up to 1,024 bytes, with different rules for exchange coordination and client communication."
      >
        <div className="qt-services">
          {SERVICES.map((service, index) => (
            <Reveal key={service.id} delay={index * 120}>
              <article className={`qt-service qt-service--${service.id}`} style={{ ['--c' as string]: service.color }}>
                <div className="qt-service__lane" aria-hidden="true">
                  <span className="qt-service__node">TX</span>
                  {service.id === 'backbone' && <span className="qt-service__relay"><b>A</b></span>}
                  <span className="qt-service__node">RX</span>
                  <i className="qt-service__packet" />
                  <i className="qt-service__packet qt-service__packet--2" />
                  {service.id === 'backbone' ? <i className="qt-service__receipt" /> : <i className="qt-service__lost" />}
                </div>
                <h4>
                  {service.name}
                  <em>{service.nickname}</em>
                </h4>
                <dl>
                  {service.rows.map(([key, value]) => (
                    <div key={key}>
                      <dt>{key}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            </Reveal>
          ))}
        </div>

        <SubHead>PACKET LOSS LAB</SubHead>
        <Reveal>
          <PacketLossLab />
        </Reveal>
        <Reveal>
          <p className="qt-note qt-note--cyan">
            <span>REMEMBER</span>
            A delivery receipt confirms that a message arrived, not that a trade was accepted. Your exchange rules
            must define acceptance and final settlement separately.
          </p>
        </Reveal>
      </Chapter>

      <Chapter
        id="qt-map"
        index={4}
        kicker="THE MOVING MAP"
        title="The Sun gets in the way"
        lede="The simulation starts with planetary positions from 22 September 2026 and advances them along fixed elliptical orbits. A route can become unavailable when the Sun blocks it. Use the supplied orbital data to calculate distances and availability; explore the model below to see how they change."
      >
        <Reveal>
          <SolarSystemModel />
        </Reveal>
      </Chapter>

      <Chapter
        id="qt-deals"
        index={5}
        kicker="YOUR SCENARIOS"
        title="Set the balances, then test them"
        lede="There is no fixed assignment. You declare the money and shares that exist, who holds them and where, then run your design through scenarios you choose. Money is counted in NeoDollars ($), an abstract unit that no bank issues and nobody can create more of. The limits below keep the pool closed and let judges compare teams."
      >
        <Reveal>
          <div className="qt-pool">
            <div className="qt-pool__title">
              <span>YOUR OPENING BALANCE SHEET</span>
              <em>EXAMPLE · THE ACCOUNTS FROM THE STORY</em>
            </div>
            {SHEET.map((row) => {
              const total = row.segments.reduce((sum, item) => sum + item.amount, 0);
              return (
                <div key={row.asset} className="qt-pool__row">
                  <div className="qt-pool__head">
                    <span>{row.asset}</span>
                    <strong>
                      {row.format(total)}
                      <em>OF {row.format(row.limit)} MAX</em>
                    </strong>
                  </div>
                  <div className="qt-pool__bar">
                    {row.segments.map((segment, index) => (
                      <div
                        key={`${segment.who}-${segment.where}`}
                        className="qt-pool__seg"
                        style={{
                          ['--w' as string]: `${(segment.amount / row.limit) * 100}%`,
                          ['--c' as string]: SETTLEMENT_COLORS[segment.where],
                          transitionDelay: `${200 + index * 160}ms`,
                        }}
                      >
                        <span>
                          {segment.who.toUpperCase()} · {segment.where.toUpperCase()}
                          <b>{row.format(segment.amount)}</b>
                        </span>
                      </div>
                    ))}
                    <div className="qt-pool__room">
                      <span>UNUSED · UP TO {row.format(row.limit - total)} MORE</span>
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="qt-pool__facts">
              <span>
                <b>{SHEET_ACCOUNTS}</b> ACCOUNTS <em>4–10 ALLOWED</em>
              </span>
              <span>
                <b>{SHEET_SETTLEMENTS}</b> SETTLEMENTS <em>3 OR MORE</em>
              </span>
              <span>
                <b>$0</b> IN EVERY INSTITUTION YOU CHARTER <em>FUNDED ONLY BY RECORDED TRANSACTIONS</em>
              </span>
            </div>
            <ul className="qt-pool__rules">
              {POOL_RULES.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </div>
        </Reveal>
        <Reveal>
          <p className="qt-note qt-note--cyan">
            <span>CHOOSE IT TO FIND WEAKNESSES</span>
            This sheet fits the limits, but yours does not have to look like it. Putting accounts far apart, or
            holdings where they are hardest to use, is how you find where your design breaks. Accounts are fixed for
            the whole run, and you may not invent extra identities to gain message quota.
          </p>
        </Reveal>

        <SubHead>YOUR SCENARIOS MUST COVER</SubHead>
        <div className="qt-cases">
          {COVERAGE.map((item, index) => (
            <Reveal key={item.tag} delay={index * 100}>
              <article className="qt-case">
                <div className="qt-case__top">
                  <span className="qt-case__tag">{item.tag}</span>
                  <span className="qt-case__floor">{item.floor}</span>
                </div>
                <h4>{item.title}</h4>
                {item.route ? (
                  <div className="qt-case__route">
                    <em>E.G.</em>
                    <span style={{ ['--c' as string]: SETTLEMENT_COLORS[item.route[0]] }}>{item.route[0]}</span>
                    <i>{item.arrow}</i>
                    <span style={{ ['--c' as string]: SETTLEMENT_COLORS[item.route[1]] }}>{item.route[1]}</span>
                  </div>
                ) : (
                  <div className="qt-case__route qt-case__route--any">
                    {item.chips?.map((chip) => (
                      <span key={chip}>{chip}</span>
                    ))}
                  </div>
                )}
                <p className="qt-case__ask">{item.ask}</p>
                <div className="qt-case__done">
                  <span>DONE WHEN</span>
                  {item.done}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <p className="qt-note">
            <span>HOW TO RUN YOUR SCENARIOS</span>
            Every scenario starts from your full opening balance sheet at hour 0 and ends when you say. One run can
            cover several requirements, or you can run them separately with a declared reset; the rising and falling
            runs must be separate. Before hour 0 you may only set up sessions, from hour −168 at the earliest. There
            are no deadlines to hit: you report your own completion times, each with its probability.
          </p>
        </Reveal>

        <SubHead>MAKE THEM HURT</SubHead>
        <div className="qt-rules">
          {PRESSURE.map((rule, index) => (
            <Reveal key={rule.t} delay={index * 90}>
              <div className="qt-rule">
                <div className="qt-rule__k">{rule.k}</div>
                <div className="qt-rule__t">{rule.t}</div>
                <p>{rule.d}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <SubHead>WORKED EXAMPLE · PAYING ON LATER PRICES</SubHead>
        <div className="qt-futures">
          <Reveal className="qt-futures__copy">
            <p>
              Take the brief’s example: a cash-settled future on 10 contracts, multiplier 100, entry price 100, paying
              on the final price P. The long side receives <strong>10 × 100 × (P − 100) NeoDollars</strong> in total and
              the short side pays it. You design interim marking, but interim and final payments together must add up
              to that total, counted once.
            </p>
            <p>
              You run it twice from a fresh start, rising and falling, with <strong>one margin rule</strong> stated
              before either path is traced. It may use contract terms, observations already received, positions and
              risk assumptions you declare; never future prices, which run it is, or who will end up paying. Until the
              first observation after the contract opens, both runs must act the same wherever local information
              matches.
            </p>
            <p>
              If a product needs an outside price, name the source, the <strong>one settlement</strong> where it
              releases each signed observation, and how often. There is no free broadcast: you decide who carries it
              onward, when, by which route and on whose quota. Marks, margin calls and settlement instructions between
              exchanges must use the backbone.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <FuturesPaths />
          </Reveal>
        </div>
        <Reveal>
          <p className="qt-note qt-note--green">
            <span>A SEAT FOR EVERYONE</span>
            Every settlement must support local participation, including at least one product whose payment depends on
            later prices. You may restrict products or risk with good reason, but not by locking a settlement out,
            dropping price-dependent products or halting service forever. Show it by re-running from reset with one of
            your accounts moved to another settlement, never by adding capital.
          </p>
        </Reveal>
      </Chapter>

      <Chapter
        id="qt-stress"
        index={6}
        kicker="WHEN THINGS BREAK"
        title="Test failures and recovery"
        lede="Every run already includes the two scheduled maintenance windows. For the S2 stress run you add one incident of your own on a scenario with a price-dependent product: a 72-hour gateway isolation, a 6-hour forced-loss window or an endpoint reset. Incidents are never announced; participants learn of one only from what fails to arrive."
      >
        <Reveal>
          <StressTimeline />
        </Reveal>
        <Reveal>
          <p className="qt-note qt-note--red">
            <span>PICK THE WORST MOMENT</span>
            Choose the kind, the node and the start time that hurt your design most, and say why. In this example,
            hour 240 is when the second price lands at Ceres just as Relay B’s Ceres link enters maintenance. Report
            how long service was lost, the state of every obligation during the incident, which assets cover them,
            and the recovery: financial service resumed, not just a packet received.
          </p>
        </Reveal>

        <SubHead>PLAN FOR CONTINUING OPERATION</SubHead>
        <div className="qt-never">
          {NEVER_CLOSES.map((item, index) => (
            <Reveal key={item.title} delay={index * 90}>
              <article className="qt-never__card">
                <h4>{item.title}</h4>
                <p>{item.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <div className="qt-banner">
            <p>
              Every outstanding obligation needs a <strong>responsible party and committed funding</strong> until
              your rules resolve it.
            </p>
            <p className="qt-banner__sub">
              Random packet loss prevents an unconditional delivery deadline. For each completion time that depends
              on direct messages, calculate the probability of finishing by that time and explain what happens if
              the messages do not arrive.
            </p>
          </div>
        </Reveal>
      </Chapter>

      <Chapter
        id="qt-submit"
        index={7}
        kicker="THE DELIVERABLE"
        title="What you hand in"
        lede="Within 40 hours of the start: two documents of up to 12 pages each. Code is optional. Calculations, spreadsheets, worked timelines and clearly written procedures can all earn full credit."
      >
        <div className="qt-docs">
          <Reveal>
            <article className="qt-doc">
              <div className="qt-doc__pages">12 PAGES</div>
              <h4>DESIGN PAPER</h4>
              <p>
                Explain your architecture, operating rulebook, supported products, responsibilities, guarantees and
                their conditions, risks and limits. Include a service table: for each product and settlement, what is
                offered, under what conditions and with what restrictions. Cover continuing operation and estimate at
                least two real-world effects omitted from the model, with sources and assumptions. Keep exact
                procedures separate from future work. The 12-page limit includes diagrams and references.
              </p>
              <p className="qt-doc__warn">
                There is no live Q&amp;A. Say what every actor knows, does and owes when a message is lost, late,
                duplicated or contradicted.
              </p>
            </article>
          </Reveal>
          <Reveal delay={120}>
            <article className="qt-doc qt-doc--appendix">
              <div className="qt-doc__pages">12 PAGES</div>
              <h4>EVIDENCE APPENDIX</h4>
              <div className="qt-evidence">
                {EVIDENCE.map((item) => (
                  <div key={item.code} className="qt-evidence__item">
                    <span className={`qt-evidence__code ${item.code.startsWith('S') ? 'qt-evidence__code--s' : ''}`}>
                      {item.code}
                    </span>
                    <div>
                      <strong>{item.title}</strong>
                      <p>{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </Reveal>
        </div>

        <SubHead>HOW IT IS SCORED · 100 POINTS</SubHead>
        <Reveal>
          <div className="qt-score">
            {SCORING.map((item, index) => (
              <div key={item.label} className="qt-score__row" style={{ ['--w' as string]: `${(item.points / 30) * 100}%`, transitionDelay: `${index * 120}ms` }}>
                <div className="qt-score__points">{item.points}</div>
                <div className="qt-score__body">
                  <div className="qt-score__label">{item.label}</div>
                  <div className="qt-score__bar">
                    <i style={{ transitionDelay: `${250 + index * 140}ms` }} />
                  </div>
                  <p>{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        <div className="qt-endgame">
          <Reveal>
            <div className="qt-zero">
              <h4>
                <span>0 PTS</span> THINGS THAT EARN NOTHING
              </h4>
              <ul>
                {ZERO_POINTS.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="qt-moves">
              <h4>WHERE TO START</h4>
              <ol>
                {FIRST_MOVES.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
              <p className="qt-moves__who">
                Anyone may enter, subject to the hackathon-wide rules. You can support your design with calculations,
                spreadsheets, worked timelines or code. Judges must be able to check every key claim from the two
                submitted documents alone.
              </p>
            </div>
          </Reveal>
        </div>
      </Chapter>

      <section className="qt-final">
        <div className="qt-wrap">
          <Reveal>
            <div className="qt-final__panel">
              <div className="qt-final__orbit" aria-hidden="true">
                <i />
                <i />
                <i />
              </div>
              <div className="qt-final__kicker">END OF BRIEFING</div>
              <h2>Ready to build the exchange?</h2>
              <p>Join the Quantitative Puzzles track at Gator Quant Hacks, October 2–4, 2026.</p>
              <div className="qt-final__actions">
                <button type="button" className="qt-btn qt-btn--primary" onClick={() => onNavigate?.('apply')}>
                  APPLY NOW →
                </button>
                <a className="qt-btn" href={BRIEF_URL} target="_blank" rel="noreferrer">
                  READ THE BRIEF (PDF)
                </a>
                <button type="button" className="qt-btn" onClick={backToTracks}>
                  ← BACK TO ALL TRACKS
                </button>
              </div>
              <p className="qt-final__fine">
                This page is a plain-language tour of the MultiPlanetary Exchange System participant brief. Where
                anything here differs from the brief or a posted clarification, those govern.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function TrackStyles() {
  return (
    <style>{`
      .qt-page {
        position: relative;
        background: #050508;
        color: #F4F4F4;
        font-family: 'Space Mono', monospace;
      }

      .qt-wrap {
        position: relative;
        max-width: 1260px;
        margin: 0 auto;
        padding: 0 24px;
      }

      @media (max-width: 640px) {
        .qt-wrap { padding: 0 16px; }
      }

      .qt-in {
        animation: qtIn 700ms cubic-bezier(0.16, 1, 0.3, 1) both;
      }


      /* Hero.tsx and GameModes.tsx define this too, but neither is mounted here. */
      @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
      }

      @keyframes qtIn {
        from { opacity: 0; transform: translateY(16px); }
        to { opacity: 1; transform: none; }
      }

      .qt-back:not(.qt-in),
      .qt-hero__badge:not(.qt-in),
      .qt-hero__signal:not(.qt-in) {
        opacity: 0;
      }

      /* ---------- Warp ---------- */
      .qt-warp {
        position: fixed;
        inset: 0;
        z-index: 9000;
        background: #02040a;
        transition: opacity 480ms ease;
      }

      .qt-warp canvas {
        width: 100%;
        height: 100%;
        display: block;
      }

      .qt-warp--out { opacity: 0; }

      .qt-warp__text {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        font-family: 'Press Start 2P', monospace;
        font-size: 11px;
        letter-spacing: 2px;
        color: #9cc9ff;
        text-shadow: 0 0 14px rgba(99, 246, 255, 0.8);
        white-space: nowrap;
        animation: blink 0.5s step-end infinite;
      }

      /* ---------- Hero ---------- */
      .qt-hero {
        position: relative;
        min-height: 100vh;
        min-height: 100svh;
        display: flex;
        align-items: center;
        overflow: hidden;
        padding: 128px 0 110px;
        background: #02040a;
      }

      .qt-hero__shade {
        position: absolute;
        inset: 0;
        pointer-events: none;
        background:
          linear-gradient(90deg, rgba(2, 4, 10, 0.92) 0%, rgba(2, 4, 10, 0.7) 38%, rgba(2, 4, 10, 0.05) 70%),
          linear-gradient(180deg, rgba(5, 5, 8, 0) 70%, #050508 100%);
      }

      @media (max-width: 900px) {
        .qt-hero__shade {
          background:
            linear-gradient(180deg, rgba(2, 4, 10, 0.55) 0%, rgba(2, 4, 10, 0.82) 45%, rgba(2, 4, 10, 0.9) 80%, #050508 100%);
        }
      }

      .qt-hero__scan {
        position: absolute;
        inset: 0;
        pointer-events: none;
        opacity: 0.35;
        background: repeating-linear-gradient(0deg, transparent 0 2px, rgba(255, 255, 255, 0.025) 2px 4px);
      }

      .qt-hero__content {
        z-index: 2;
        width: 100%;
      }

      .qt-back {
        display: block;
        margin-bottom: 26px;
        padding: 6px 10px;
        border: 1px solid #294f7d;
        background: rgba(8, 16, 30, 0.8);
        color: #9cc9ff;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 1.5px;
        transition: border-color 150ms ease, color 150ms ease;
      }

      .qt-back:hover { border-color: #FA4616; color: #fff; }

      .qt-hero__badge {
        display: inline-flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 18px;
        padding: 8px 14px 8px 8px;
        border: 1px solid #294f7d;
        background: rgba(11, 21, 36, 0.85);
        font-family: 'Orbitron', sans-serif;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 2px;
        color: #9cc9ff;
        animation-delay: 80ms;
      }

      .qt-hero__badge em {
        display: block;
        margin-top: 3px;
        font-family: 'Space Mono', monospace;
        font-style: normal;
        font-size: 9px;
        letter-spacing: 1.2px;
        color: #7e90ab;
      }

      .qt-emblem {
        position: relative;
        width: 40px;
        height: 40px;
        flex: none;
      }

      .qt-emblem img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        image-rendering: pixelated;
        filter: drop-shadow(0 0 8px rgba(99, 246, 255, 0.5));
      }

      .qt-emblem i {
        position: absolute;
        inset: -6px;
        border: 1px dashed rgba(99, 246, 255, 0.5);
        border-radius: 50%;
        animation: qtSpin 9s linear infinite;
      }

      .qt-emblem i::after {
        content: '';
        position: absolute;
        top: -3px;
        left: 50%;
        width: 5px;
        height: 5px;
        background: #FA4616;
        box-shadow: 0 0 8px #FA4616;
      }

      @keyframes qtSpin { to { transform: rotate(360deg); } }

      .qt-hero__signal {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 14px;
        font-size: 11px;
        letter-spacing: 1.4px;
        color: #63f6ff;
        animation-delay: 160ms;
      }

      .qt-dot {
        display: inline-block;
        width: 8px;
        height: 8px;
        background: #FA4616;
        box-shadow: 0 0 10px #FA4616;
        animation: blink 1s step-end infinite;
      }

      .qt-dot--green {
        background: #4cff87;
        box-shadow: 0 0 10px #4cff87;
      }

      .qt-hero__title {
        margin: 0 0 22px;
        font-family: 'Press Start 2P', monospace;
        font-weight: 400;
        line-height: 1.2;
        text-transform: uppercase;
      }

      .qt-hero__line {
        display: block;
        white-space: nowrap;
      }

      .qt-hero__line--0 {
        font-size: clamp(14px, 1.9vw, 22px);
        color: #9cc9ff;
        margin-bottom: 10px;
      }

      .qt-hero__line--1 {
        font-size: clamp(18px, 4.3vw, 58px);
        color: #fff;
        text-shadow: 0 0 26px rgba(99, 246, 255, 0.35), 4px 4px 0 #044a94;
      }

      .qt-hero__line--2 {
        margin-top: 8px;
        font-size: clamp(18px, 4.3vw, 58px);
        color: #FA4616;
        text-shadow: 0 0 26px rgba(250, 70, 22, 0.4), 4px 4px 0 #3a1003;
      }

      .qt-btn {
        padding: 13px 20px;
        border: 2px solid #294f7d;
        background: rgba(8, 16, 30, 0.85);
        color: #F4F4F4;
        font-family: 'Space Mono', monospace;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 1.2px;
        transition: transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease;
      }

      .qt-btn:hover {
        transform: translateY(-2px);
        border-color: #63f6ff;
        box-shadow: 0 0 20px rgba(99, 246, 255, 0.25);
      }

      a.qt-btn {
        display: inline-block;
        text-decoration: none;
      }

      .qt-files {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        max-width: 920px;
        margin-bottom: 40px;
        padding: 20px 22px;
        border: 1px solid rgba(99, 246, 255, 0.55);
        background:
          radial-gradient(circle at 0% 50%, rgba(99, 246, 255, 0.12), transparent 55%),
          rgba(7, 13, 26, 0.92);
      }

      .qt-files span { display: block; font-size: 9px; font-weight: 700; letter-spacing: 1.6px; color: #9ff6ff; }
      .qt-files strong { display: block; margin: 6px 0 4px; font-family: 'Orbitron', sans-serif; font-size: clamp(15px, 2vw, 19px); letter-spacing: 1px; color: #fff; }
      .qt-files em { display: block; max-width: 520px; font-style: normal; font-size: 12px; line-height: 1.6; color: #a7b4c9; }
      .qt-files__actions { display: flex; flex-wrap: wrap; gap: 10px; }

      .qt-btn--primary {
        border-color: #044a94;
        background: #FA4616;
        box-shadow: 0 0 22px rgba(250, 70, 22, 0.35), 4px 4px 0 #044a94;
      }

      .qt-btn--primary:hover {
        border-color: #044a94;
        box-shadow: 0 0 30px rgba(250, 70, 22, 0.55), 4px 4px 0 #044a94;
      }

      .qt-hero__live {
        position: absolute;
        right: 24px;
        bottom: 26px;
        z-index: 2;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 9px;
        letter-spacing: 1.3px;
        color: rgba(167, 180, 201, 0.7);
      }

      .qt-hero__cue {
        position: absolute;
        left: 50%;
        bottom: 22px;
        z-index: 2;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        transform: translateX(-50%);
        font-size: 9px;
        letter-spacing: 3px;
        color: #7e90ab;
      }

      .qt-hero__cue i {
        width: 10px;
        height: 10px;
        border-right: 2px solid #63f6ff;
        border-bottom: 2px solid #63f6ff;
        transform: rotate(45deg);
        animation: qtBob 1.4s ease-in-out infinite;
      }

      @keyframes qtBob {
        0%, 100% { transform: translateY(0) rotate(45deg); opacity: 0.5; }
        50% { transform: translateY(6px) rotate(45deg); opacity: 1; }
      }

      @media (max-width: 900px) {
        .qt-hero__live { display: none; }
      }

      /* ---------- HUD ---------- */
      .qt-hud {
        display: none;
        position: fixed;
        left: 34px;
        top: 50%;
        z-index: 40;
        opacity: 0;
        transform: translate(-10px, -50%);
        pointer-events: none;
        transition: opacity 250ms ease, transform 250ms ease;
      }

      /* Only wide screens have a gutter the rail can sit in without covering copy. */
      @media (min-width: 1280px) {
        .qt-hud { display: block; }
      }

      .qt-hud--on {
        opacity: 1;
        transform: translate(0, -50%);
        pointer-events: auto;
      }

      .qt-hud__main {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        width: 42px;
        padding: 10px 0 12px;
        border: 1px solid #294f7d;
        background: rgba(4, 8, 18, 0.92);
        box-shadow: 0 0 24px rgba(4, 74, 148, 0.3);
      }

      .qt-hud__main:hover { border-color: #63f6ff; }

      .qt-hud__count {
        font-family: 'VT323', monospace;
        font-size: 20px;
        line-height: 0.9;
        color: #63f6ff;
        text-align: center;
      }

      .qt-hud__count small {
        display: block;
        font-size: 13px;
        color: #5f7390;
      }

      .qt-hud__bar {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .qt-hud__bar i {
        width: 4px;
        height: 18px;
        background: #12233a;
        transition: background 300ms ease, box-shadow 300ms ease;
      }

      .qt-hud__bar .qt-hud__tick--on { background: rgba(99, 246, 255, 0.55); }

      .qt-hud__bar .qt-hud__tick--now {
        background: #FA4616;
        box-shadow: 0 0 8px #FA4616;
      }

      .qt-hud__list {
        position: absolute;
        left: calc(100% + 8px);
        top: 50%;
        display: none;
        margin: 0;
        padding: 6px;
        list-style: none;
        white-space: nowrap;
        transform: translateY(-50%);
        border: 1px solid #294f7d;
        background: rgba(4, 8, 18, 0.96);
        box-shadow: 0 0 24px rgba(4, 74, 148, 0.3);
      }

      .qt-hud:hover .qt-hud__list,
      .qt-hud__list--open {
        display: block;
      }

      .qt-hud__list-title {
        padding: 4px 8px 6px;
        font-family: 'Orbitron', sans-serif;
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 2px;
        color: #FA4616;
      }

      .qt-hud__list button {
        display: flex;
        gap: 10px;
        width: 100%;
        padding: 6px 8px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 1px;
        color: #a7b4c9;
        text-align: left;
      }

      .qt-hud__list button span { color: #5f7390; }
      .qt-hud__list button:hover { color: #fff; background: rgba(99, 246, 255, 0.08); }
      .qt-hud__list .qt-hud__item--on { color: #63f6ff; }

      /* ---------- Chapters ---------- */
      .qt-chapter {
        position: relative;
        padding: 110px 0 40px;
        scroll-margin-top: 70px;
      }

      .qt-chapter::before {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(4, 74, 148, 0.7), rgba(250, 70, 22, 0.4), transparent);
      }

      .qt-chapter__head {
        position: relative;
        max-width: 820px;
        margin-bottom: 40px;
      }

      .qt-chapter__ghost {
        position: absolute;
        right: -40px;
        top: -50px;
        font-family: 'Press Start 2P', monospace;
        font-size: clamp(80px, 12vw, 150px);
        line-height: 1;
        color: transparent;
        -webkit-text-stroke: 1px rgba(99, 150, 220, 0.14);
        pointer-events: none;
        user-select: none;
      }

      @media (max-width: 900px) {
        .qt-chapter__ghost { right: 0; top: -30px; }
      }

      .qt-chapter__kicker {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 14px;
        font-family: 'Orbitron', sans-serif;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 3px;
        color: #FA4616;
      }

      .qt-chapter__kicker span {
        padding: 3px 7px;
        border: 1px solid rgba(250, 70, 22, 0.6);
        font-size: 10px;
        letter-spacing: 1.5px;
        color: #ffb38a;
      }

      .qt-chapter__title {
        margin: 0 0 16px;
        font-family: 'Orbitron', sans-serif;
        font-size: clamp(28px, 4.4vw, 52px);
        font-weight: 800;
        line-height: 1.04;
        letter-spacing: 1px;
        text-transform: uppercase;
        color: #fff;
        text-shadow: 0 0 30px rgba(4, 74, 148, 0.45);
      }

      .qt-lede {
        margin: 0;
        font-size: clamp(14px, 1.25vw, 16px);
        line-height: 1.8;
        color: #b8c4d6;
      }

      .qt-subhead {
        display: flex;
        align-items: center;
        gap: 14px;
        margin: 64px 0 22px;
      }

      .qt-subhead span {
        flex: 1;
        height: 1px;
        background: linear-gradient(90deg, transparent, #294f7d);
      }

      .qt-subhead span:last-child {
        background: linear-gradient(90deg, #294f7d, transparent);
      }

      .qt-subhead h3 {
        margin: 0;
        font-family: 'Orbitron', sans-serif;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 3px;
        color: #9cc9ff;
        text-align: center;
      }

      .qt-note {
        display: flex;
        flex-wrap: wrap;
        gap: 6px 14px;
        align-items: baseline;
        margin: 22px 0 0;
        padding: 14px 16px;
        border-left: 3px solid #FA4616;
        background: rgba(250, 70, 22, 0.06);
        font-size: 13px;
        line-height: 1.7;
        color: #d3dcea;
      }

      .qt-note span {
        font-family: 'Orbitron', sans-serif;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 2px;
        color: #FA4616;
        white-space: nowrap;
      }

      .qt-note--cyan { border-color: #63f6ff; background: rgba(99, 246, 255, 0.05); }
      .qt-note--cyan span { color: #63f6ff; }
      .qt-note--green { border-color: #4cff87; background: rgba(76, 255, 135, 0.05); }
      .qt-note--green span { color: #4cff87; }
      .qt-note--red { border-color: #ff3b5c; background: rgba(255, 59, 92, 0.07); }
      .qt-note--red span { color: #ff5a6e; }

      /* ---------- Ch1 ---------- */
      /* One signal line runs through every log and ends in the task, so the
         story reads as a single transmission. Each beat draws its own segment
         of the line, which lets the colour turn from cyan to orange at LOG 05. */
      .qt-story {
        --qt-gutter: 150px;
        --qt-spine: calc(var(--qt-gutter) + 24px);
        max-width: 920px;
      }

      .qt-story__beat {
        position: relative;
        display: grid;
        grid-template-columns: var(--qt-gutter) minmax(0, 1fr);
        column-gap: 48px;
        padding-bottom: 34px;
      }

      .qt-story__beat::before {
        content: '';
        position: absolute;
        left: var(--qt-spine);
        top: 0;
        bottom: 0;
        width: 1px;
        background: rgba(99, 246, 255, 0.28);
      }

      .qt-story__beat:first-child::before { top: 10px; }

      .qt-story__beat::after {
        content: '';
        position: absolute;
        left: calc(var(--qt-spine) - 4px);
        top: 6px;
        width: 9px;
        height: 9px;
        background: #63f6ff;
        box-shadow: 0 0 10px #63f6ff;
      }

      .qt-story__stamp {
        padding-top: 2px;
        text-align: right;
        font-family: 'Orbitron', sans-serif;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 1.8px;
        line-height: 1.7;
      }

      .qt-story__stamp > span {
        display: block;
        color: #5d7596;
      }

      .qt-story__stamp b {
        display: block;
        font-weight: 700;
        color: #63f6ff;
      }

      .qt-story__stamp em { font-style: normal; }

      .qt-story__stamp i {
        margin: 0 5px;
        font-style: normal;
        color: #5d7596;
      }

      .qt-story__text {
        margin: 0;
        font-size: 15px;
        line-height: 1.75;
        color: #c9d4e4;
      }

      .qt-story__beat--premise .qt-story__text {
        font-size: clamp(16px, 1.5vw, 18px);
        color: #fff;
      }

      .qt-story__beat--open { padding-bottom: 30px; }

      .qt-story__beat--open::before {
        background: linear-gradient(180deg, rgba(99, 246, 255, 0.28), #FA4616 14px);
      }

      .qt-story__beat--open::after {
        background: #FA4616;
        box-shadow: 0 0 12px #FA4616;
        animation: blink 1s step-end infinite;
      }

      .qt-story__beat--open .qt-story__stamp b { color: #FA4616; }

      .qt-story__beat--open .qt-story__text {
        font-family: 'Press Start 2P', monospace;
        font-size: 13px;
        line-height: 1.9;
        color: #fff;
      }

      .qt-story__beat--task { padding-bottom: 0; }

      .qt-story__beat--task::before {
        background: linear-gradient(180deg, #FA4616, rgba(250, 70, 22, 0.35) 70%, transparent);
      }

      .qt-story__beat--task::after { display: none; }

      .qt-story__beat--task .qt-story__stamp > span { color: #FA4616; }
      .qt-story__beat--task .qt-story__stamp b { color: #ffb38a; }

      .qt-story__brief {
        margin: 0 0 16px;
        font-size: clamp(17px, 1.7vw, 21px);
        line-height: 1.65;
        color: #fff;
      }

      .qt-story__brief strong { color: #63f6ff; }

      .qt-story__fine {
        margin: 0 0 20px;
        max-width: 640px;
        font-size: 13px;
        line-height: 1.75;
        color: #a7b4c9;
      }

      .qt-story__scope {
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        gap: 4px 0;
        margin: 0;
        font-family: 'Orbitron', sans-serif;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 1.5px;
      }

      .qt-story__scope span {
        margin-right: 14px;
        color: #FA4616;
      }

      .qt-story__scope em {
        font-style: normal;
        color: #9cc9ff;
      }

      .qt-story__scope em:not(:last-child)::after {
        content: '·';
        margin: 0 9px;
        color: #3b5a82;
      }

      @media (max-width: 720px) {
        .qt-story { --qt-spine: 4px; }

        .qt-story__beat {
          grid-template-columns: minmax(0, 1fr);
          row-gap: 8px;
          padding-left: 30px;
        }

        .qt-story__stamp { text-align: left; }
        .qt-story__stamp > span,
        .qt-story__stamp b { display: inline; }
        .qt-story__stamp > span::after { content: ' · '; }
      }

      .qt-decoded {
        display: grid;
        gap: 14px;
      }

      @media (min-width: 640px) { .qt-decoded { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
      @media (min-width: 1100px) { .qt-decoded { grid-template-columns: repeat(4, minmax(0, 1fr)); } }

      .qt-decoded__card {
        height: 100%;
        padding: 18px;
        border: 1px solid rgba(41, 79, 125, 0.8);
        background: rgba(7, 13, 26, 0.92);
        transition: transform 200ms ease, border-color 200ms ease, box-shadow 200ms ease;
      }

      .qt-decoded__card:hover {
        transform: translateY(-4px);
        border-color: #63f6ff;
        box-shadow: 0 0 24px rgba(99, 246, 255, 0.15);
      }

      .qt-decoded__glyph {
        display: grid;
        place-items: center;
        width: 42px;
        height: 42px;
        margin-bottom: 14px;
        border: 2px solid #FA4616;
        font-family: 'Press Start 2P', monospace;
        font-size: 16px;
        color: #FA4616;
        box-shadow: 3px 3px 0 #044a94;
      }

      .qt-decoded__card h4 {
        margin: 0 0 8px;
        font-family: 'Orbitron', sans-serif;
        font-size: 14px;
        font-weight: 700;
        letter-spacing: 2px;
        color: #fff;
      }

      .qt-decoded__card p {
        margin: 0;
        font-size: 13px;
        line-height: 1.65;
        color: #b8c4d6;
      }

      .qt-decoded__card .qt-decoded__twist {
        margin-top: 10px;
        padding-top: 10px;
        border-top: 1px dashed rgba(41, 79, 125, 0.7);
        font-size: 12px;
        color: #ffb38a;
      }

      .qt-split {
        display: grid;
        gap: 14px;
        margin-top: 40px;
      }

      @media (min-width: 768px) { .qt-split { grid-template-columns: 1fr 1fr; } }

      .qt-split__col {
        height: 100%;
        padding: 20px;
        border: 1px solid;
        background: rgba(7, 13, 26, 0.9);
      }

      .qt-split__col--fixed { border-color: rgba(167, 180, 201, 0.35); }
      .qt-split__col--yours { border-color: rgba(250, 70, 22, 0.6); box-shadow: inset 0 0 40px rgba(250, 70, 22, 0.06); }

      .qt-split__col h4 {
        margin: 0 0 14px;
        font-family: 'Orbitron', sans-serif;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 2.5px;
      }

      .qt-split__col--fixed h4 { color: #a7b4c9; }
      .qt-split__col--yours h4 { color: #FA4616; }

      .qt-split__col ul {
        margin: 0;
        padding: 0;
        list-style: none;
        display: grid;
        gap: 9px;
      }

      .qt-split__col li {
        position: relative;
        padding-left: 24px;
        font-size: 13px;
        line-height: 1.6;
        color: #d3dcea;
      }

      .qt-split__col li::before {
        position: absolute;
        left: 0;
        top: 0;
        font-weight: 700;
      }

      .qt-split__col--fixed li::before { content: '■'; color: #5f7390; font-size: 10px; top: 2px; }
      .qt-split__col--yours li::before { content: '▶'; color: #FA4616; font-size: 11px; top: 1px; }

      /* ---------- Ch2 ---------- */
      .qt-takeaways {
        display: grid;
        gap: 14px;
        margin-top: 22px;
      }

      @media (min-width: 900px) { .qt-takeaways { grid-template-columns: repeat(3, minmax(0, 1fr)); } }

      .qt-takeaway {
        position: relative;
        height: 100%;
        padding: 18px 18px 18px 60px;
        border: 1px solid rgba(41, 79, 125, 0.8);
        background: rgba(7, 13, 26, 0.92);
      }

      .qt-takeaway__n {
        position: absolute;
        left: 16px;
        top: 16px;
        font-family: 'Press Start 2P', monospace;
        font-size: 16px;
        color: #FA4616;
      }

      .qt-takeaway h4 {
        margin: 0 0 6px;
        font-family: 'Orbitron', sans-serif;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 2px;
        color: #fff;
      }

      .qt-takeaway p {
        margin: 0;
        font-size: 13px;
        line-height: 1.65;
        color: #b8c4d6;
      }

      /* ---------- Ch3 ---------- */
      .qt-services {
        display: grid;
        gap: 16px;
      }

      @media (min-width: 900px) { .qt-services { grid-template-columns: 1fr 1fr; } }

      .qt-service {
        height: 100%;
        padding: 20px;
        border: 2px solid var(--c);
        background: linear-gradient(180deg, rgba(9, 16, 30, 0.97), rgba(4, 8, 18, 0.98));
        box-shadow: 0 0 30px color-mix(in srgb, var(--c) 18%, transparent);
      }

      .qt-service h4 {
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        gap: 12px;
        margin: 16px 0 12px;
        font-family: 'Orbitron', sans-serif;
        font-size: 22px;
        font-weight: 800;
        letter-spacing: 2px;
        color: var(--c);
      }

      .qt-service h4 em {
        font-family: 'Space Mono', monospace;
        font-size: 12px;
        font-style: normal;
        font-weight: 400;
        letter-spacing: 0.5px;
        color: #a7b4c9;
      }

      .qt-service dl {
        margin: 0;
        display: grid;
        gap: 0;
      }

      .qt-service dl div {
        display: grid;
        grid-template-columns: 104px minmax(0, 1fr);
        gap: 12px;
        padding: 8px 0;
        border-top: 1px dashed rgba(41, 79, 125, 0.6);
      }

      .qt-service dt {
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 1.2px;
        color: var(--c);
      }

      .qt-service dd {
        margin: 0;
        font-size: 12px;
        line-height: 1.6;
        color: #d3dcea;
      }

      .qt-service__lane {
        position: relative;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border: 1px solid rgba(41, 79, 125, 0.6);
        background:
          linear-gradient(90deg, transparent 0 34px, color-mix(in srgb, var(--c) 30%, transparent) 34px calc(100% - 34px), transparent calc(100% - 34px)) center / 100% 1px no-repeat,
          #040913;
        padding: 0 6px;
        overflow: hidden;
      }

      .qt-service__node,
      .qt-service__relay {
        position: relative;
        z-index: 1;
        display: grid;
        place-items: center;
        width: 28px;
        height: 28px;
        border: 1px solid var(--c);
        background: #0b1830;
        font-size: 9px;
        font-weight: 700;
        color: var(--c);
      }

      .qt-service__relay {
        transform: rotate(45deg);
        width: 20px;
        height: 20px;
      }

      .qt-service__relay b {
        transform: rotate(-45deg);
      }

      .qt-service__packet,
      .qt-service__receipt,
      .qt-service__lost {
        position: absolute;
        top: 50%;
        width: 6px;
        height: 6px;
        margin-top: -3px;
        background: var(--c);
        box-shadow: 0 0 8px var(--c);
        left: 36px;
        animation: qtLane 2.6s linear infinite;
      }

      .qt-service__packet--2 { animation-delay: -1.3s; }

      .qt-service__receipt {
        background: #4cff87;
        box-shadow: 0 0 8px #4cff87;
        animation: qtReceipt 2.6s linear infinite;
        animation-delay: -0.6s;
      }

      .qt-service__lost {
        animation: qtLost 2.6s linear infinite;
        animation-delay: -0.4s;
      }

      @keyframes qtLane {
        from { left: 36px; opacity: 1; }
        to { left: calc(100% - 42px); opacity: 1; }
      }

      @keyframes qtReceipt {
        0%, 50% { left: calc(50% - 3px); opacity: 0; }
        51% { opacity: 1; }
        100% { left: 36px; opacity: 1; }
      }

      @keyframes qtLost {
        0% { left: 36px; opacity: 1; transform: scale(1); }
        48% { left: 52%; opacity: 1; transform: scale(1); background: var(--c); }
        52% { left: 54%; opacity: 1; transform: scale(2.4); background: #ff3b5c; box-shadow: 0 0 14px #ff3b5c; }
        60%, 100% { left: 54%; opacity: 0; transform: scale(3); background: #ff3b5c; }
      }

      /* ---------- Ch4 ---------- */
      .qt-rules {
        display: grid;
        gap: 12px;
        margin-bottom: 22px;
      }

      @media (min-width: 900px) { .qt-rules { grid-template-columns: repeat(3, minmax(0, 1fr)); } }

      .qt-rule {
        height: 100%;
        padding: 14px 16px;
        border: 1px solid rgba(41, 79, 125, 0.8);
        background: rgba(7, 13, 26, 0.92);
      }

      .qt-rule__k {
        font-family: 'VT323', monospace;
        font-size: 28px;
        line-height: 1;
        color: #ff5a6e;
      }

      .qt-rule:nth-child(1) .qt-rule__k { color: #ff5a6e; }

      .qt-rule__t {
        margin: 4px 0 6px;
        font-family: 'Orbitron', sans-serif;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 2px;
        color: #fff;
      }

      .qt-rule p {
        margin: 0;
        font-size: 12px;
        line-height: 1.6;
        color: #a7b4c9;
      }

      /* ---------- Ch5 ---------- */
      .qt-pool {
        padding: 20px;
        border: 1px solid #1d4f83;
        background: linear-gradient(180deg, rgba(7, 13, 26, 0.96), rgba(4, 8, 18, 0.98));
        box-shadow: 0 0 0 3px rgba(5, 11, 23, 0.98), 0 0 36px rgba(4, 74, 148, 0.16);
      }

      .qt-pool__title {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        gap: 4px 16px;
        margin-bottom: 18px;
        padding-bottom: 12px;
        border-bottom: 1px dashed rgba(41, 79, 125, 0.7);
        font-family: 'Orbitron', sans-serif;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 2px;
        color: #fff;
      }

      .qt-pool__title em {
        font-style: normal;
        font-size: 9px;
        letter-spacing: 1.5px;
        color: #63f6ff;
      }

      .qt-pool__row + .qt-pool__row { margin-top: 18px; }

      .qt-pool__head {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-bottom: 8px;
        font-family: 'Orbitron', sans-serif;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 2px;
        color: #a7b4c9;
      }

      .qt-pool__head strong {
        font-family: 'VT323', monospace;
        font-size: 28px;
        letter-spacing: 0;
        color: #fff;
      }

      .qt-pool__head strong em {
        margin-left: 8px;
        font-family: 'Orbitron', sans-serif;
        font-size: 9px;
        font-style: normal;
        letter-spacing: 1.2px;
        color: #7e90ab;
      }

      .qt-pool__bar {
        display: flex;
        gap: 3px;
        height: 46px;
      }

      .qt-pool__seg {
        position: relative;
        width: 0;
        min-width: 0;
        overflow: hidden;
        border: 1px solid var(--c);
        background:
          repeating-linear-gradient(135deg, color-mix(in srgb, var(--c) 30%, transparent) 0 6px, color-mix(in srgb, var(--c) 16%, transparent) 6px 12px);
        transition: width 1100ms cubic-bezier(0.16, 1, 0.3, 1);
      }

      /* Small holdings keep enough width to show their amount. */
      .reveal--visible .qt-pool__seg { width: var(--w); min-width: 44px; }

      .qt-pool__seg span {
        position: absolute;
        left: 8px;
        top: 5px;
        right: 4px;
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 0.6px;
        color: #fff;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .qt-pool__seg b {
        display: block;
        font-family: 'VT323', monospace;
        font-size: 20px;
        font-weight: 400;
        line-height: 1.1;
        color: var(--c);
      }

      .qt-pool__room {
        flex: 1;
        min-width: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 10px;
        border: 1px dashed rgba(167, 180, 201, 0.4);
        overflow: hidden;
      }

      .qt-pool__room span {
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 1px;
        color: #7e90ab;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .qt-pool__facts {
        display: flex;
        flex-wrap: wrap;
        gap: 10px 28px;
        margin-top: 18px;
        font-family: 'Orbitron', sans-serif;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 1.5px;
        color: #a7b4c9;
      }

      .qt-pool__facts b {
        margin-right: 4px;
        font-family: 'VT323', monospace;
        font-size: 24px;
        font-weight: 400;
        letter-spacing: 0;
        color: #fff;
      }

      .qt-pool__facts em {
        display: block;
        font-style: normal;
        font-size: 8px;
        letter-spacing: 1.2px;
        color: #63f6ff;
      }

      .qt-pool__rules {
        display: grid;
        gap: 8px;
        margin: 20px 0 0;
        padding: 16px 0 0;
        list-style: none;
        border-top: 1px dashed rgba(41, 79, 125, 0.7);
      }

      @media (min-width: 900px) { .qt-pool__rules { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; } }

      .qt-pool__rules li {
        position: relative;
        padding-left: 18px;
        font-size: 12px;
        line-height: 1.6;
        color: #b8c4d6;
      }

      .qt-pool__rules li::before {
        content: '';
        position: absolute;
        left: 0;
        top: 6px;
        width: 8px;
        height: 8px;
        background: #FA4616;
      }

      @media (max-width: 640px) {
        .qt-pool__seg span { font-size: 0; }
        .qt-pool__seg b { font-size: 16px; }
      }

      .qt-cases {
        display: grid;
        gap: 14px;
        margin-top: 22px;
      }

      @media (min-width: 768px) { .qt-cases { grid-template-columns: repeat(2, minmax(0, 1fr)); } }

      .qt-case {
        height: 100%;
        display: flex;
        flex-direction: column;
        padding: 20px;
        border: 1px solid rgba(41, 79, 125, 0.9);
        background:
          linear-gradient(180deg, rgba(9, 16, 30, 0.97), rgba(4, 8, 18, 0.98));
        transition: transform 200ms ease, border-color 200ms ease, box-shadow 200ms ease;
      }

      .qt-case:hover {
        transform: translateY(-4px);
        border-color: #FA4616;
        box-shadow: 0 0 26px rgba(250, 70, 22, 0.18);
      }

      .qt-case__top {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 1.4px;
      }

      .qt-case__tag { color: #FA4616; }
      .qt-case__floor { color: #63f6ff; text-align: right; }

      .qt-case h4 {
        margin: 10px 0 10px;
        font-family: 'Orbitron', sans-serif;
        font-size: 24px;
        font-weight: 800;
        letter-spacing: 2px;
        color: #fff;
      }

      .qt-case__route {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
      }

      .qt-case__route span {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 9px;
        border: 1px solid var(--c, #294f7d);
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 1px;
        color: var(--c, #9cc9ff);
        text-transform: uppercase;
      }

      .qt-case__route span::before {
        content: '';
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--c, #9cc9ff);
        box-shadow: 0 0 8px var(--c, #9cc9ff);
      }

      .qt-case__route--any span::before { display: none; }

      .qt-case__route em {
        font-style: normal;
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 1.2px;
        color: #7e90ab;
      }

      .qt-case__route i {
        font-style: normal;
        font-weight: 700;
        color: #fff4c8;
      }

      .qt-case__ask {
        flex: 1;
        margin: 0 0 14px;
        font-size: 13px;
        line-height: 1.7;
        color: #d3dcea;
      }

      .qt-case__done {
        padding: 10px 12px;
        border-left: 2px solid #4cff87;
        background: rgba(76, 255, 135, 0.05);
        font-size: 12px;
        line-height: 1.6;
        color: #b8c4d6;
      }

      .qt-case__done span {
        display: block;
        margin-bottom: 2px;
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 1.5px;
        color: #4cff87;
      }

      .qt-futures {
        display: grid;
        gap: 22px;
      }

      .qt-futures__copy {
        display: grid;
        gap: 14px 28px;
      }

      @media (min-width: 900px) {
        .qt-futures__copy { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      }

      .qt-futures__copy p {
        margin: 0;
        font-size: 14px;
        line-height: 1.8;
        color: #b8c4d6;
      }

      .qt-futures__copy strong { color: #fff; }

      /* ---------- Ch6 ---------- */
      .qt-never {
        display: grid;
        gap: 14px;
      }

      @media (min-width: 640px) { .qt-never { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
      @media (min-width: 1100px) { .qt-never { grid-template-columns: repeat(4, minmax(0, 1fr)); } }

      .qt-never__card {
        height: 100%;
        padding: 18px;
        border: 1px solid rgba(41, 79, 125, 0.8);
        border-top: 3px solid #ffb84d;
        background: rgba(7, 13, 26, 0.92);
      }

      .qt-never__card h4 {
        margin: 0 0 8px;
        font-family: 'Orbitron', sans-serif;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 2px;
        color: #ffb84d;
      }

      .qt-never__card p {
        margin: 0;
        font-size: 13px;
        line-height: 1.65;
        color: #b8c4d6;
      }

      .qt-banner {
        margin-top: 22px;
        padding: 24px;
        border: 2px solid #FA4616;
        background:
          repeating-linear-gradient(135deg, rgba(250, 70, 22, 0.06) 0 10px, transparent 10px 20px),
          rgba(7, 13, 26, 0.95);
        text-align: center;
      }

      .qt-banner p {
        margin: 0;
        font-family: 'Press Start 2P', monospace;
        font-size: clamp(11px, 1.4vw, 15px);
        line-height: 1.9;
        color: #fff;
      }

      .qt-banner strong { color: #FA4616; font-weight: 400; }

      .qt-banner .qt-banner__sub {
        max-width: 760px;
        margin: 14px auto 0;
        font-family: 'Space Mono', monospace;
        font-size: 13px;
        line-height: 1.7;
        color: #b8c4d6;
      }

      /* ---------- Ch7 ---------- */
      .qt-docs {
        display: grid;
        gap: 16px;
      }

      @media (min-width: 1000px) { .qt-docs { grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.4fr); } }

      .qt-doc {
        position: relative;
        height: 100%;
        padding: 22px;
        border: 1px solid rgba(99, 246, 255, 0.4);
        background:
          repeating-linear-gradient(180deg, transparent 0 27px, rgba(99, 150, 220, 0.06) 27px 28px),
          rgba(7, 13, 26, 0.95);
        box-shadow: 6px 6px 0 rgba(4, 74, 148, 0.5);
      }

      .qt-doc__pages {
        position: absolute;
        right: 16px;
        top: 16px;
        padding: 3px 7px;
        border: 1px solid #FA4616;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 1.2px;
        color: #FA4616;
      }

      .qt-doc h4 {
        margin: 0 0 12px;
        font-family: 'Orbitron', sans-serif;
        font-size: 18px;
        font-weight: 800;
        letter-spacing: 2px;
        color: #fff;
      }

      .qt-doc p {
        margin: 0 0 12px;
        font-size: 13px;
        line-height: 1.75;
        color: #b8c4d6;
      }

      .qt-doc .qt-doc__warn {
        padding: 10px 12px;
        border-left: 2px solid #ffb84d;
        background: rgba(255, 184, 77, 0.06);
        color: #ffe2b0;
      }

      .qt-evidence {
        display: grid;
        gap: 10px;
      }

      @media (min-width: 640px) { .qt-evidence { grid-template-columns: 1fr 1fr; } }

      .qt-evidence__item {
        display: flex;
        gap: 10px;
      }

      .qt-evidence__code {
        flex: none;
        display: grid;
        place-items: center;
        width: 34px;
        height: 34px;
        border: 1px solid #63f6ff;
        font-family: 'Press Start 2P', monospace;
        font-size: 10px;
        color: #63f6ff;
      }

      .qt-evidence__code--s { border-color: #FA4616; color: #FA4616; }

      .qt-evidence__item strong {
        display: block;
        font-size: 11px;
        letter-spacing: 1.2px;
        color: #fff;
      }

      .qt-evidence__item p {
        margin: 2px 0 0;
        font-size: 12px;
        line-height: 1.55;
        color: #a7b4c9;
      }

      .qt-score {
        display: grid;
        gap: 14px;
        padding: 22px;
        border: 1px solid #1d4f83;
        background: linear-gradient(180deg, rgba(7, 13, 26, 0.96), rgba(4, 8, 18, 0.98));
        box-shadow: 0 0 0 3px rgba(5, 11, 23, 0.98), 0 0 36px rgba(4, 74, 148, 0.16);
      }

      .qt-score__row {
        display: grid;
        grid-template-columns: 70px minmax(0, 1fr);
        gap: 16px;
        align-items: start;
      }

      .qt-score__points {
        font-family: 'Press Start 2P', monospace;
        font-size: 26px;
        line-height: 1.2;
        color: #fff4c8;
        text-shadow: 0 0 16px rgba(255, 200, 90, 0.35);
      }

      .qt-score__label {
        font-family: 'Orbitron', sans-serif;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 2px;
        color: #fff;
      }

      .qt-score__bar {
        height: 10px;
        margin: 8px 0;
        background: #0b1830;
        border: 1px solid rgba(41, 79, 125, 0.7);
      }

      .qt-score__bar i {
        display: block;
        height: 100%;
        width: 0;
        background: repeating-linear-gradient(90deg, #FA4616 0 10px, #ff7a4a 10px 12px);
        box-shadow: 0 0 12px rgba(250, 70, 22, 0.5);
        transition: width 1200ms cubic-bezier(0.16, 1, 0.3, 1);
      }

      .reveal--visible .qt-score__bar i { width: var(--w); }

      .qt-score__row p {
        margin: 0;
        font-size: 12px;
        line-height: 1.6;
        color: #a7b4c9;
      }

      @media (max-width: 640px) {
        .qt-score__row { grid-template-columns: 48px minmax(0, 1fr); gap: 10px; }
        .qt-score__points { font-size: 18px; }
      }

      .qt-endgame {
        display: grid;
        gap: 16px;
        margin-top: 22px;
      }

      @media (min-width: 900px) { .qt-endgame { grid-template-columns: 1fr 1fr; } }

      .qt-zero,
      .qt-moves {
        height: 100%;
        padding: 20px;
        background: rgba(7, 13, 26, 0.95);
      }

      .qt-zero { border: 1px solid rgba(255, 59, 92, 0.6); }
      .qt-moves { border: 1px solid rgba(76, 255, 135, 0.5); }

      .qt-zero h4,
      .qt-moves h4 {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 0 0 14px;
        font-family: 'Orbitron', sans-serif;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 2px;
      }

      .qt-zero h4 { color: #ff5a6e; }
      .qt-moves h4 { color: #4cff87; }

      .qt-zero h4 span {
        padding: 3px 7px;
        background: #ff3b5c;
        color: #02040a;
        font-size: 10px;
      }

      .qt-zero ul,
      .qt-moves ol {
        margin: 0;
        padding: 0;
        list-style: none;
        display: grid;
        gap: 10px;
      }

      .qt-zero li {
        position: relative;
        padding-left: 24px;
        font-size: 13px;
        line-height: 1.6;
        color: #b8c4d6;
        text-decoration: line-through;
        text-decoration-color: rgba(255, 59, 92, 0.6);
      }

      .qt-zero li::before {
        content: '✕';
        position: absolute;
        left: 0;
        color: #ff5a6e;
        font-weight: 700;
      }

      .qt-moves ol { counter-reset: move; }

      .qt-moves li {
        position: relative;
        padding-left: 34px;
        font-size: 13px;
        line-height: 1.6;
        color: #d3dcea;
        counter-increment: move;
      }

      .qt-moves li::before {
        content: counter(move);
        position: absolute;
        left: 0;
        top: 0;
        display: grid;
        place-items: center;
        width: 22px;
        height: 22px;
        border: 1px solid #4cff87;
        font-family: 'Press Start 2P', monospace;
        font-size: 9px;
        color: #4cff87;
      }

      .qt-moves__who {
        margin: 16px 0 0;
        padding-top: 14px;
        border-top: 1px dashed rgba(41, 79, 125, 0.7);
        font-size: 12px;
        line-height: 1.7;
        color: #a7b4c9;
      }

      /* ---------- Final ---------- */
      .qt-final {
        padding: 110px 0 90px;
      }

      .qt-final__panel {
        position: relative;
        overflow: hidden;
        padding: clamp(32px, 6vw, 64px) clamp(20px, 5vw, 56px);
        border: 2px solid #044a94;
        background:
          radial-gradient(circle at 50% 120%, rgba(250, 70, 22, 0.22), transparent 55%),
          radial-gradient(circle at 50% -20%, rgba(99, 246, 255, 0.14), transparent 50%),
          #070c18;
        box-shadow: 0 0 0 3px rgba(5, 11, 23, 0.98), 0 0 60px rgba(4, 74, 148, 0.3);
        text-align: center;
      }

      .qt-final__orbit {
        position: absolute;
        left: 50%;
        top: 50%;
        width: 0;
        height: 0;
        pointer-events: none;
      }

      .qt-final__orbit i {
        position: absolute;
        left: 50%;
        top: 50%;
        border: 1px dashed rgba(99, 150, 220, 0.18);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        animation: qtSpin 40s linear infinite;
      }

      .qt-final__orbit i:nth-child(1) { width: 320px; height: 320px; }
      .qt-final__orbit i:nth-child(2) { width: 560px; height: 560px; animation-duration: 70s; animation-direction: reverse; }
      .qt-final__orbit i:nth-child(3) { width: 820px; height: 820px; animation-duration: 110s; }

      .qt-final__orbit i::after {
        content: '';
        position: absolute;
        top: 50%;
        left: -4px;
        width: 7px;
        height: 7px;
        background: #63f6ff;
        box-shadow: 0 0 10px #63f6ff;
      }

      .qt-final__orbit i:nth-child(2)::after { background: #FA4616; box-shadow: 0 0 10px #FA4616; }

      .qt-final__kicker {
        position: relative;
        font-family: 'Orbitron', sans-serif;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 3px;
        color: #FA4616;
        margin-bottom: 14px;
      }

      .qt-final h2 {
        position: relative;
        margin: 0 0 16px;
        font-family: 'Press Start 2P', monospace;
        font-size: clamp(16px, 3vw, 34px);
        line-height: 1.4;
        color: #fff;
        text-shadow: 0 0 24px rgba(99, 246, 255, 0.35);
      }

      .qt-final p {
        position: relative;
        max-width: 620px;
        margin: 0 auto 26px;
        font-size: 14px;
        line-height: 1.75;
        color: #b8c4d6;
      }

      .qt-final__actions {
        position: relative;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 12px;
      }

      .qt-final .qt-final__fine {
        margin: 28px auto 0;
        font-size: 10px;
        line-height: 1.6;
        color: #5f7390;
      }

      @media (prefers-reduced-motion: reduce) {
        .qt-in,
        .qt-emblem i,
        .qt-final__orbit i,
        .qt-service__packet,
        .qt-service__receipt,
        .qt-service__lost,
        .qt-hero__cue i {
          animation: none !important;
        }
        .qt-back, .qt-hero__badge, .qt-hero__signal { opacity: 1 !important; }
        .qt-pool__seg { width: var(--w); transition: none; }
        .qt-score__bar i { width: var(--w); transition: none; }
      }
    `}</style>
  );
}
