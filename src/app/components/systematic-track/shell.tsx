import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Reveal } from '../Reveal';

// Shared pieces of the Systematic Trading briefing pages: the main track page and
// its sub-tracks use the same chapters, rail, checklist and stylesheet.

export const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const GLYPHS = '#%&*+=?<>/\\[]{}01$▲▼ABCDEFGHJKLMNPQRSTUVWXYZ';

// Characters resolve left to right out of random glyphs, like a quote feed locking on.
export function DecodeText({ text, active, delay = 0 }: { text: string; active: boolean; delay?: number }) {
  const [out, setOut] = useState(() => text.replace(/\S/g, ' '));

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
        else next += ' ';
      }
      setOut(next);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, delay, text]);

  return <span aria-hidden="true">{out}</span>;
}


// Arriving from inside the site: the page types its boot log, then powers on
// like an old CRT.
export function BootArrival({ lines: bootLines, ok, onDone }: { lines: string[]; ok: string; onDone: () => void }) {
  const doneRef = useRef(onDone);
  const [lines, setLines] = useState(0);
  const [phase, setPhase] = useState<'boot' | 'on' | 'out'>('boot');
  doneRef.current = onDone;

  useEffect(() => {
    const timers = bootLines.map((_, index) => window.setTimeout(() => setLines(index + 1), 80 + index * 150));
    timers.push(window.setTimeout(() => setPhase('on'), 1050));
    timers.push(window.setTimeout(() => setPhase('out'), 1300));
    timers.push(window.setTimeout(() => doneRef.current(), 1750));
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  return (
    <div className={`st-boot st-boot--${phase}`} aria-hidden="true">
      <div className="st-boot__screen">
        {bootLines.slice(0, lines).map((line) => (
          <div key={line} className="st-boot__line">
            {line}
          </div>
        ))}
        {lines >= bootLines.length && (
          <>
            <div className="st-boot__bar">
              <i />
            </div>
            <div className="st-boot__ok">{ok}</div>
          </>
        )}
      </div>
    </div>
  );
}

export function Chapter({
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
    <section id={id} className="st-chapter" data-chapter={index}>
      <div className="st-wrap">
        <Reveal className="st-chapter__head">
          <div className="st-chapter__ghost" aria-hidden="true">
            {String(index).padStart(2, '0')}
          </div>
          <div className="st-chapter__kicker">
            <span>CH {String(index).padStart(2, '0')}</span>
            {kicker}
          </div>
          <h2 className="st-chapter__title">{title}</h2>
          {lede && <p className="st-lede">{lede}</p>}
        </Reveal>
        {children}
      </div>
    </section>
  );
}

export function SubHead({ children }: { children: ReactNode }) {
  return (
    <Reveal className="st-subhead">
      <span />
      <h3>{children}</h3>
      <span />
    </Reveal>
  );
}

// A slim chapter rail in the left gutter; hover or click to jump between chapters.
export type ChapterLink = { id: string; label: string };

export function BriefingHud({ chapters, active, visible }: { chapters: ChapterLink[]; active: number; visible: boolean }) {
  const [open, setOpen] = useState(false);
  const current = Math.max(0, active);

  useEffect(() => {
    if (!visible) setOpen(false);
  }, [visible]);

  return (
    <nav className={`st-hud ${visible ? 'st-hud--on' : ''}`} aria-label="Page sections">
      <button
        type="button"
        className="st-hud__main"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={`Chapter ${current + 1} of ${chapters.length}: ${chapters[current].label}`}
      >
        <span className="st-hud__count">
          {String(current + 1).padStart(2, '0')}
          <small>/{String(chapters.length).padStart(2, '0')}</small>
        </span>
        <span className="st-hud__bar" aria-hidden="true">
          {chapters.map((chapter, index) => (
            <i
              key={chapter.id}
              className={`${index <= active ? 'st-hud__tick--on' : ''} ${index === active ? 'st-hud__tick--now' : ''}`}
            />
          ))}
        </span>
      </button>
      <ol className={`st-hud__list ${open ? 'st-hud__list--open' : ''}`}>
        <li className="st-hud__list-title">ON THIS PAGE</li>
        {chapters.map((chapter, index) => (
          <li key={chapter.id}>
            <button
              type="button"
              className={index === active ? 'st-hud__item--on' : ''}
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


// Sunday, October 4, 2026, Eastern Daylight Time (UTC−4).
const DEVPOST_DEADLINE = Date.UTC(2026, 9, 4, 14, 0, 0);
const CODE_FREEZE = Date.UTC(2026, 9, 4, 15, 0, 0);

const pad2 = (value: number) => String(value).padStart(2, '0');

export function DeadlineClock() {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const clocks = [
    { label: 'DEVPOST SUBMISSION', when: 'SUN OCT 4 · 10:00 AM', at: DEVPOST_DEADLINE, note: 'Late submissions are not judged.', tone: 'orange' },
    { label: 'FINAL CODE PUSH', when: 'SUN OCT 4 · 11:00 AM', at: CODE_FREEZE, note: 'Commits after 11:00 AM are not reviewed.', tone: 'amber' },
  ];

  return (
    <div className="st-clock">
      {clocks.map((clock) => {
        const left = clock.at - now;
        const closed = left <= 0;
        const days = Math.floor(left / 86400000);
        const hours = Math.floor((left % 86400000) / 3600000);
        const minutes = Math.floor((left % 3600000) / 60000);
        const seconds = Math.floor((left % 60000) / 1000);
        return (
          <div key={clock.label} className={`st-clock__card st-clock__card--${clock.tone}`}>
            <span className="st-clock__label">{clock.label}</span>
            <strong className="st-clock__when">{clock.when}</strong>
            <div className="st-clock__count" aria-label={closed ? 'Closed' : `${days} days ${hours} hours ${minutes} minutes left`}>
              {closed ? (
                <span className="st-clock__closed">CLOSED</span>
              ) : (
                <>
                  <span>
                    {pad2(days)}
                    <small>D</small>
                  </span>
                  <span>
                    {pad2(hours)}
                    <small>H</small>
                  </span>
                  <span>
                    {pad2(minutes)}
                    <small>M</small>
                  </span>
                  <span>
                    {pad2(seconds)}
                    <small>S</small>
                  </span>
                </>
              )}
            </div>
            <em>{clock.note}</em>
          </div>
        );
      })}
      <div className="st-clock__tz">EASTERN TIME</div>
    </div>
  );
}

export function FinalChecklist({ items, storageKey, goText }: { items: string[]; storageKey: string; goText: string }) {
  const [checked, setChecked] = useState<boolean[]>(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(storageKey) ?? '[]');
      return items.map((_, index) => Boolean(saved[index]));
    } catch {
      return items.map(() => false);
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(checked));
    } catch {
      // Storage can be unavailable (private windows); the list still works for this visit.
    }
  }, [checked]);

  const done = checked.filter(Boolean).length;
  const all = done === items.length;

  return (
    <div className={`st-list ${all ? 'st-list--go' : ''}`}>
      <div className="st-list__head">
        <div>
          <span>SUBMISSION CHECKLIST</span>
          <em>SAVED IN THIS BROWSER ONLY</em>
        </div>
        <strong>
          {done}
          <small>/{items.length}</small>
        </strong>
      </div>
      <div className="st-list__meter" aria-hidden="true">
        {items.map((item, index) => (
          <i key={item} className={index < done ? 'st-list__seg--on' : ''} />
        ))}
      </div>
      <ul>
        {items.map((item, index) => (
          <li key={item}>
            <label className={checked[index] ? 'st-list__item--on' : ''}>
              <input
                type="checkbox"
                checked={checked[index]}
                onChange={() => setChecked((current) => current.map((value, k) => (k === index ? !value : value)))}
              />
              <span className="st-list__box" aria-hidden="true" />
              {item}
            </label>
          </li>
        ))}
      </ul>
      <div className="st-list__foot">
        {all ? (
          <strong className="st-list__go">{goText}</strong>
        ) : (
          <span>{items.length - done} TO GO</span>
        )}
        {done > 0 && (
          <button type="button" onClick={() => setChecked(items.map(() => false))}>
            RESET
          </button>
        )}
      </div>
    </div>
  );
}

// A command or config snippet with a copy button. Shared by the starter-kit
// sections; colors come from the --st-kit-* variables so each page can tint it.
export function CopyBlock({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="st-copy">
      <div className="st-copy__bar">
        <span>{label}</span>
        <button type="button" onClick={copy}>
          {copied ? 'COPIED ✓' : 'COPY'}
        </button>
      </div>
      <pre>{text}</pre>
    </div>
  );
}

export function TrackStyles() {
  return (
    <style>{`
      .st-page {
        position: relative;
        background: #050508;
        color: #F4F4F4;
        font-family: 'Space Mono', monospace;
      }

      .st-page a { color: #63f6ff; text-decoration: underline; text-underline-offset: 3px; }
      .st-page a:hover { color: #fff; }

      .st-page code {
        padding: 0 4px;
        background: rgba(51, 209, 122, 0.08);
        color: #7cf0ad;
        font-family: 'Space Mono', monospace;
        font-size: 0.95em;
        white-space: nowrap;
      }

      .st-wrap {
        position: relative;
        max-width: 1260px;
        margin: 0 auto;
        padding: 0 24px;
      }

      @media (max-width: 640px) {
        .st-wrap { padding: 0 16px; }
      }

      .st-in { animation: stIn 700ms cubic-bezier(0.16, 1, 0.3, 1) both; }

      @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
      }

      @keyframes stIn {
        from { opacity: 0; transform: translateY(16px); }
        to { opacity: 1; transform: none; }
      }

      .st-back:not(.st-in),
      .st-hero__badge:not(.st-in),
      .st-hero__signal:not(.st-in) {
        opacity: 0;
      }

      /* ---------- Boot ---------- */
      .st-boot {
        position: fixed;
        inset: 0;
        z-index: 9000;
        display: grid;
        place-items: center;
        background: #02040a;
        transition: opacity 450ms ease;
      }

      .st-boot__screen {
        width: min(520px, calc(100vw - 48px));
        min-height: 170px;
        font-family: 'VT323', monospace;
        font-size: 22px;
        line-height: 1.25;
        color: #33d17a;
        text-shadow: 0 0 10px rgba(51, 209, 122, 0.6);
      }

      .st-boot__line { animation: stIn 160ms ease-out both; }

      .st-boot__bar {
        height: 12px;
        margin: 8px 0;
        border: 1px solid #33d17a;
      }

      .st-boot__bar i {
        display: block;
        height: 100%;
        background: repeating-linear-gradient(90deg, #33d17a 0 8px, transparent 8px 10px);
        animation: stBootBar 380ms steps(10) forwards;
      }

      @keyframes stBootBar {
        from { width: 0; }
        to { width: 100%; }
      }

      .st-boot__ok {
        color: #ffb84d;
        text-shadow: 0 0 12px rgba(255, 184, 77, 0.7);
        animation: blink 0.4s step-end 3;
      }

      .st-boot--on .st-boot__screen,
      .st-boot--out .st-boot__screen {
        animation: stCrt 420ms cubic-bezier(0.7, 0, 0.3, 1) forwards;
      }

      @keyframes stCrt {
        0% { transform: scale(1, 1); filter: brightness(1); }
        45% { transform: scale(1.04, 0.012); filter: brightness(3); }
        100% { transform: scale(0, 0.012); filter: brightness(5); }
      }

      .st-boot--out { opacity: 0; pointer-events: none; }

      /* ---------- Hero ---------- */
      .st-hero {
        position: relative;
        min-height: 100vh;
        min-height: 100svh;
        display: flex;
        align-items: center;
        overflow: hidden;
        padding: 128px 0 110px;
        background: #02040a;
      }

      .st-tape {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        display: block;
        image-rendering: auto;
      }

      .st-hero__shade {
        position: absolute;
        inset: 0;
        pointer-events: none;
        background:
          linear-gradient(90deg, rgba(2, 4, 10, 0.95) 0%, rgba(2, 4, 10, 0.75) 38%, rgba(2, 4, 10, 0.05) 66%),
          linear-gradient(180deg, rgba(5, 5, 8, 0) 70%, #050508 100%);
      }

      @media (max-width: 900px) {
        .st-hero__shade {
          background:
            linear-gradient(180deg, rgba(2, 4, 10, 0.45) 0%, rgba(2, 4, 10, 0.82) 45%, rgba(2, 4, 10, 0.94) 80%, #050508 100%);
        }
      }

      .st-hero__scan {
        position: absolute;
        inset: 0;
        pointer-events: none;
        opacity: 0.35;
        background: repeating-linear-gradient(0deg, transparent 0 2px, rgba(255, 255, 255, 0.025) 2px 4px);
      }

      .st-hero__content {
        z-index: 2;
        width: 100%;
      }

      .st-page .st-back {
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

      .st-page .st-back:hover { border-color: #33d17a; color: #fff; }

      .st-hero__badge {
        display: inline-flex;
        align-items: center;
        gap: 14px;
        margin-bottom: 18px;
        padding: 8px 14px 8px 10px;
        border: 1px solid rgba(51, 209, 122, 0.55);
        background: rgba(6, 20, 13, 0.85);
        font-family: 'Orbitron', sans-serif;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 2px;
        color: #9ff5c3;
        animation-delay: 80ms;
      }

      .st-hero__badge em {
        display: block;
        margin-top: 3px;
        font-family: 'Space Mono', monospace;
        font-style: normal;
        font-size: 9px;
        letter-spacing: 1.2px;
        color: #7e90ab;
      }

      /* Gaia, the track's planet, drawn in CSS to match the tracks section. */
      .st-emblem {
        position: relative;
        width: 38px;
        height: 38px;
        flex: none;
      }

      .st-emblem b {
        position: absolute;
        inset: 4px;
        border-radius: 50%;
        background:
          radial-gradient(circle at 32% 30%, #b9ffd6 0 8%, transparent 9%),
          radial-gradient(circle at 60% 65%, #0f6b3a 0 22%, transparent 23%),
          radial-gradient(circle at 40% 40%, #33d17a, #11804a 70%);
        box-shadow: 0 0 12px rgba(51, 209, 122, 0.6);
      }

      .st-emblem i {
        position: absolute;
        inset: -5px;
        border: 1px dashed rgba(51, 209, 122, 0.6);
        border-radius: 50%;
        animation: stSpin 9s linear infinite;
      }

      .st-emblem i::after {
        content: '';
        position: absolute;
        top: -3px;
        left: 50%;
        width: 5px;
        height: 5px;
        background: #ffb84d;
        box-shadow: 0 0 8px #ffb84d;
      }

      @keyframes stSpin { to { transform: rotate(360deg); } }

      .st-hero__signal {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 14px;
        font-size: 11px;
        letter-spacing: 1.4px;
        color: #33d17a;
        animation-delay: 160ms;
      }

      .st-dot {
        display: inline-block;
        flex: none;
        width: 8px;
        height: 8px;
        background: #FA4616;
        box-shadow: 0 0 10px #FA4616;
        animation: blink 1s step-end infinite;
      }

      .st-dot--green {
        background: #33d17a;
        box-shadow: 0 0 10px #33d17a;
      }

      .st-hero__title {
        margin: 0 0 26px;
        font-family: 'Press Start 2P', monospace;
        font-weight: 400;
        line-height: 1.15;
        text-transform: uppercase;
      }

      .st-hero__line {
        display: block;
        white-space: nowrap;
      }

      .st-hero__line--0 {
        font-size: clamp(14px, 1.9vw, 22px);
        color: #9ff5c3;
        margin-bottom: 14px;
      }

      .st-hero__line--1 {
        font-size: clamp(44px, 9vw, 120px);
        color: #fff;
        text-shadow: 0 0 30px rgba(51, 209, 122, 0.35), 6px 6px 0 #0c4a2a;
      }

      .st-hero__line--2 {
        margin-top: 14px;
        font-size: clamp(15px, 3.2vw, 40px);
        color: #ffb84d;
        text-shadow: 0 0 24px rgba(255, 184, 77, 0.35), 3px 3px 0 #4a2e05;
      }

      .st-hero__specs {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin: 0;
        max-width: 640px;
      }

      .st-hero__specs div {
        padding: 6px 10px;
        border: 1px solid rgba(51, 209, 122, 0.35);
        background: rgba(4, 14, 10, 0.8);
        opacity: 0;
      }

      .st-hero__specs--in div { animation: stIn 600ms cubic-bezier(0.16, 1, 0.3, 1) both; }

      .st-hero__specs dt {
        font-size: 8px;
        font-weight: 700;
        letter-spacing: 1.4px;
        color: #5f8a72;
      }

      .st-hero__specs dd {
        margin: 0;
        font-family: 'VT323', monospace;
        font-size: 22px;
        line-height: 1;
        color: #c9ffd9;
      }

      .st-page .st-btn {
        display: inline-block;
        padding: 13px 20px;
        border: 2px solid #294f7d;
        background: rgba(8, 16, 30, 0.85);
        color: #F4F4F4;
        font-family: 'Space Mono', monospace;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 1.2px;
        text-decoration: none;
        transition: transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease;
      }

      .st-page .st-btn:hover {
        transform: translateY(-2px);
        border-color: #33d17a;
        color: #fff;
        box-shadow: 0 0 20px rgba(51, 209, 122, 0.25);
      }

      .st-page .st-btn--primary {
        border-color: #044a94;
        background: #FA4616;
        box-shadow: 0 0 22px rgba(250, 70, 22, 0.35), 4px 4px 0 #044a94;
      }

      .st-page .st-btn--primary:hover {
        border-color: #044a94;
        box-shadow: 0 0 30px rgba(250, 70, 22, 0.55), 4px 4px 0 #044a94;
      }

      .st-hero__live {
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

      .st-hero__cue {
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

      .st-hero__cue i {
        width: 10px;
        height: 10px;
        border-right: 2px solid #33d17a;
        border-bottom: 2px solid #33d17a;
        transform: rotate(45deg);
        animation: stBob 1.4s ease-in-out infinite;
      }

      @keyframes stBob {
        0%, 100% { transform: translateY(0) rotate(45deg); opacity: 0.5; }
        50% { transform: translateY(6px) rotate(45deg); opacity: 1; }
      }

      @media (max-width: 900px) {
        .st-hero__live { display: none; }
      }

      @media (max-width: 640px) {
        .st-hero__signal { font-size: 9px; align-items: flex-start; }
        .st-hero__badge { font-size: 10px; letter-spacing: 1.4px; }
      }

      /* ---------- Massive bonus entry points ---------- */
      .st-page .st-bonus-cta {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 10px 14px;
        margin-top: 22px;
        padding: 10px 14px;
        border: 1px solid rgba(157, 140, 255, 0.65);
        background: rgba(14, 10, 30, 0.88);
        box-shadow: 0 0 22px rgba(157, 140, 255, 0.2);
        color: #d6cfff;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 1.5px;
        text-align: left;
        transition: border-color 150ms ease, box-shadow 150ms ease, transform 150ms ease;
      }

      .st-page .st-bonus-cta:not(.st-in) { opacity: 0; }
      .st-page .st-bonus-cta:hover { transform: translateY(-2px); border-color: #c4b9ff; box-shadow: 0 0 30px rgba(157, 140, 255, 0.4); }
      .st-bonus-cta img { width: 84px; height: auto; image-rendering: auto; }
      .st-bonus-cta__tag { padding: 2px 7px; background: #9d8cff; color: #0b0720; }
      .st-bonus-cta i { font-style: normal; font-size: 14px; color: #c4b9ff; }

      .st-bonus {
        display: grid;
        gap: 16px;
        margin-bottom: 8px;
        padding: 22px;
        border: 1px solid rgba(157, 140, 255, 0.6);
        background:
          radial-gradient(circle at 100% 0%, rgba(157, 140, 255, 0.18), transparent 50%),
          rgba(7, 13, 26, 0.94);
        box-shadow: 0 0 30px rgba(157, 140, 255, 0.12);
      }

      .st-bonus__head { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
      .st-bonus__head span { font-family: 'Orbitron', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 2px; color: #c4b9ff; }
      .st-bonus__head img { width: 110px; height: auto; image-rendering: auto; }

      .st-bonus__body h3 {
        margin: 0 0 10px;
        font-family: 'Orbitron', sans-serif;
        font-size: clamp(22px, 3vw, 32px);
        font-weight: 800;
        letter-spacing: 1px;
        text-transform: uppercase;
        color: #fff;
        text-shadow: 0 0 24px rgba(157, 140, 255, 0.35);
      }

      .st-bonus__body p { margin: 0 0 12px; max-width: 780px; font-size: 14px; line-height: 1.75; color: #d3dcea; }
      .st-bonus__body ul { margin: 0; padding: 0; list-style: none; display: grid; gap: 6px; }
      .st-bonus__body li { position: relative; padding-left: 18px; font-size: 13px; line-height: 1.6; color: #c9d4e4; }
      .st-bonus__body li::before { content: '◆'; position: absolute; left: 0; top: 3px; font-size: 10px; color: #9d8cff; }
      .st-bonus__go { justify-self: start; }

      /* ---------- HUD ---------- */
      .st-hud {
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

      @media (min-width: 1280px) {
        .st-hud { display: block; }
      }

      .st-hud--on {
        opacity: 1;
        transform: translate(0, -50%);
        pointer-events: auto;
      }

      .st-hud__main {
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

      .st-hud__main:hover { border-color: #33d17a; }

      .st-hud__count {
        font-family: 'VT323', monospace;
        font-size: 20px;
        line-height: 0.9;
        color: #33d17a;
        text-align: center;
      }

      .st-hud__count small {
        display: block;
        font-size: 13px;
        color: #5f7390;
      }

      .st-hud__bar {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .st-hud__bar i {
        width: 4px;
        height: 14px;
        background: #12233a;
        transition: background 300ms ease, box-shadow 300ms ease;
      }

      .st-hud__bar .st-hud__tick--on { background: rgba(51, 209, 122, 0.55); }

      .st-hud__bar .st-hud__tick--now {
        background: #ffb84d;
        box-shadow: 0 0 8px #ffb84d;
      }

      .st-hud__list {
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

      .st-hud:hover .st-hud__list,
      .st-hud__list--open {
        display: block;
      }

      .st-hud__list-title {
        padding: 4px 8px 6px;
        font-family: 'Orbitron', sans-serif;
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 2px;
        color: #FA4616;
      }

      .st-hud__list button {
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

      .st-hud__list button span { color: #5f7390; }
      .st-hud__list button:hover { color: #fff; background: rgba(51, 209, 122, 0.08); }
      .st-hud__list .st-hud__item--on { color: #33d17a; }

      /* ---------- Chapters ---------- */
      .st-chapter {
        position: relative;
        padding: 110px 0 40px;
        scroll-margin-top: 70px;
      }

      .st-chapter::before {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(51, 209, 122, 0.45), rgba(255, 184, 77, 0.45), transparent);
      }

      .st-chapter__head {
        position: relative;
        max-width: 860px;
        margin-bottom: 40px;
      }

      .st-chapter__ghost {
        position: absolute;
        right: -40px;
        top: -50px;
        font-family: 'Press Start 2P', monospace;
        font-size: clamp(80px, 12vw, 150px);
        line-height: 1;
        color: transparent;
        -webkit-text-stroke: 1px rgba(51, 209, 122, 0.13);
        pointer-events: none;
        user-select: none;
      }

      @media (max-width: 900px) {
        .st-chapter__ghost { right: 0; top: -30px; }
      }

      .st-chapter__kicker {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 14px;
        font-family: 'Orbitron', sans-serif;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 3px;
        color: #ffb84d;
      }

      .st-chapter__kicker span {
        padding: 3px 7px;
        border: 1px solid rgba(51, 209, 122, 0.55);
        font-size: 10px;
        letter-spacing: 1.5px;
        color: #33d17a;
      }

      .st-chapter__title {
        margin: 0 0 16px;
        font-family: 'Orbitron', sans-serif;
        font-size: clamp(28px, 4.4vw, 52px);
        font-weight: 800;
        line-height: 1.04;
        letter-spacing: 1px;
        text-transform: uppercase;
        color: #fff;
        text-shadow: 0 0 30px rgba(51, 209, 122, 0.22);
      }

      .st-lede {
        margin: 0;
        font-size: clamp(14px, 1.25vw, 16px);
        line-height: 1.8;
        color: #b8c4d6;
      }

      .st-subhead {
        display: flex;
        align-items: center;
        gap: 14px;
        margin: 64px 0 22px;
      }

      .st-subhead span {
        flex: 1;
        height: 1px;
        background: linear-gradient(90deg, transparent, #2b5a45);
      }

      .st-subhead span:last-child {
        background: linear-gradient(90deg, #2b5a45, transparent);
      }

      .st-subhead h3 {
        margin: 0;
        font-family: 'Orbitron', sans-serif;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 3px;
        color: #9cc9ff;
        text-align: center;
      }

      .st-note {
        display: flex;
        flex-wrap: wrap;
        gap: 6px 14px;
        align-items: baseline;
        margin: 22px 0 0;
        padding: 14px 16px;
        border-left: 3px solid #33d17a;
        background: rgba(51, 209, 122, 0.06);
        font-size: 13px;
        line-height: 1.7;
        color: #d3dcea;
      }

      .st-note > span:first-child {
        font-family: 'Orbitron', sans-serif;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 2px;
        color: #33d17a;
        white-space: nowrap;
      }

      .st-note--cyan { border-color: #63f6ff; background: rgba(99, 246, 255, 0.05); }
      .st-note--cyan > span:first-child { color: #63f6ff; }
      .st-note--amber { border-color: #ffb84d; background: rgba(255, 184, 77, 0.06); }
      .st-note--amber > span:first-child { color: #ffb84d; }
      .st-note--red { border-color: #ff3b5c; background: rgba(255, 59, 92, 0.07); }
      .st-note--red > span:first-child { color: #ff5a6e; }


      /* ---------- Story ---------- */
      .st-story {
        --st-gutter: 150px;
        --st-spine: calc(var(--st-gutter) + 24px);
        max-width: 940px;
      }

      .st-story__beat {
        position: relative;
        display: grid;
        grid-template-columns: var(--st-gutter) minmax(0, 1fr);
        column-gap: 48px;
        padding-bottom: 34px;
      }

      .st-story__beat::before {
        content: '';
        position: absolute;
        left: var(--st-spine);
        top: 0;
        bottom: 0;
        width: 1px;
        background: rgba(51, 209, 122, 0.3);
      }

      .st-story__beat:first-child::before { top: 10px; }

      .st-story__beat::after {
        content: '';
        position: absolute;
        left: calc(var(--st-spine) - 4px);
        top: 6px;
        width: 9px;
        height: 9px;
        background: #33d17a;
        box-shadow: 0 0 10px #33d17a;
      }

      .st-story__stamp {
        padding-top: 2px;
        text-align: right;
        font-family: 'Orbitron', sans-serif;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 1.8px;
        line-height: 1.7;
      }

      .st-story__stamp > span {
        display: block;
        color: #5d7596;
      }

      .st-story__stamp b {
        display: block;
        font-weight: 700;
        color: #33d17a;
      }

      .st-story__text {
        margin: 0;
        font-size: 15px;
        line-height: 1.75;
        color: #c9d4e4;
      }

      .st-story__beat--premise .st-story__text {
        font-size: clamp(16px, 1.5vw, 18px);
        color: #fff;
      }

      .st-story__beat--open { padding-bottom: 30px; }

      .st-story__beat--open::before {
        background: linear-gradient(180deg, rgba(51, 209, 122, 0.3), #FA4616 14px);
      }

      .st-story__beat--open::after {
        background: #FA4616;
        box-shadow: 0 0 12px #FA4616;
        animation: blink 1s step-end infinite;
      }

      .st-story__beat--open .st-story__stamp b { color: #FA4616; }

      .st-story__beat--open .st-story__text {
        font-family: 'Press Start 2P', monospace;
        font-size: 12px;
        line-height: 1.9;
        color: #fff;
      }

      .st-story__beat--task { padding-bottom: 0; }

      .st-story__beat--task::before {
        background: linear-gradient(180deg, #FA4616, rgba(250, 70, 22, 0.35) 70%, transparent);
      }

      .st-story__beat--task::after { display: none; }

      .st-story__beat--task .st-story__stamp > span { color: #ffb84d; }
      .st-story__beat--task .st-story__stamp b { color: #ffd9a0; }

      .st-story__brief {
        margin: 0 0 16px;
        font-size: clamp(17px, 1.7vw, 21px);
        line-height: 1.65;
        color: #fff;
      }

      .st-story__brief strong { color: #33d17a; }

      .st-story__fine {
        margin: 0 0 20px;
        max-width: 660px;
        font-size: 13px;
        line-height: 1.75;
        color: #a7b4c9;
      }

      .st-story__scope {
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

      .st-story__scope span {
        margin-right: 14px;
        color: #ffb84d;
      }

      .st-story__scope em {
        font-style: normal;
        color: #9cc9ff;
      }

      .st-story__scope em:not(:last-child)::after {
        content: '·';
        margin: 0 9px;
        color: #3b5a82;
      }

      @media (max-width: 720px) {
        .st-story { --st-spine: 4px; }

        .st-story__beat {
          grid-template-columns: minmax(0, 1fr);
          row-gap: 8px;
          padding-left: 30px;
        }

        .st-story__stamp { text-align: left; }
        .st-story__stamp > span,
        .st-story__stamp b { display: inline; }
        .st-story__stamp > span::after { content: ' · '; }
      }

      /* ---------- Rule tiles ---------- */
      .st-rules {
        display: grid;
        gap: 14px;
      }

      @media (min-width: 640px) {
        .st-rules--four,
        .st-rules--six { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      }

      @media (min-width: 1000px) {
        .st-rules--four { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        .st-rules--six { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      }

      .st-rule {
        height: 100%;
        padding: 16px 18px;
        border: 1px solid rgba(41, 79, 125, 0.8);
        border-top: 2px solid #33d17a;
        background: rgba(7, 13, 26, 0.92);
      }

      .st-rule__k {
        font-family: 'VT323', monospace;
        font-size: 22px;
        line-height: 1;
        color: #ffb84d;
      }

      .st-rule__t {
        margin: 8px 0 8px;
        font-family: 'Orbitron', sans-serif;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 1.8px;
        color: #fff;
      }

      .st-rule p {
        margin: 0;
        font-size: 13px;
        line-height: 1.65;
        color: #b8c4d6;
      }

      /* ---------- Key terms ---------- */
      .st-decoded {
        display: grid;
        gap: 14px;
      }

      @media (min-width: 640px) { .st-decoded { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
      @media (min-width: 1000px) { .st-decoded { grid-template-columns: repeat(3, minmax(0, 1fr)); } }

      .st-decoded__card {
        height: 100%;
        padding: 18px;
        border: 1px solid rgba(41, 79, 125, 0.8);
        background: rgba(7, 13, 26, 0.92);
        transition: transform 200ms ease, border-color 200ms ease, box-shadow 200ms ease;
      }

      .st-decoded__card:hover {
        transform: translateY(-4px);
        border-color: #33d17a;
        box-shadow: 0 0 24px rgba(51, 209, 122, 0.15);
      }

      .st-decoded__glyph {
        display: grid;
        place-items: center;
        min-width: 42px;
        width: fit-content;
        height: 42px;
        padding: 0 6px;
        margin-bottom: 14px;
        border: 2px solid #33d17a;
        font-family: 'Press Start 2P', monospace;
        font-size: 13px;
        color: #33d17a;
        box-shadow: 3px 3px 0 #4a2e05;
      }

      .st-decoded__card h4 {
        margin: 0 0 8px;
        font-family: 'Orbitron', sans-serif;
        font-size: 14px;
        font-weight: 700;
        letter-spacing: 2px;
        color: #fff;
      }

      .st-decoded__card p {
        margin: 0;
        font-size: 13px;
        line-height: 1.65;
        color: #b8c4d6;
      }

      .st-decoded__card .st-decoded__twist {
        margin-top: 10px;
        padding-top: 10px;
        border-top: 1px dashed rgba(41, 79, 125, 0.7);
        color: #ffd27a;
      }

      /* ---------- Data ---------- */
      .st-sources {
        display: grid;
        gap: 14px;
      }

      @media (min-width: 640px) { .st-sources { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
      @media (min-width: 1100px) { .st-sources { grid-template-columns: repeat(4, minmax(0, 1fr)); } }

      .st-source {
        position: relative;
        height: 100%;
        padding: 18px;
        border: 1px solid rgba(41, 79, 125, 0.8);
        background: rgba(7, 13, 26, 0.92);
      }

      .st-source::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 3px;
        background: var(--st-c);
        box-shadow: 0 0 12px var(--st-c);
      }

      .st-source--green { --st-c: #33d17a; }
      .st-source--cyan { --st-c: #63f6ff; }

      .st-source__tag {
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 1.5px;
        color: var(--st-c);
      }

      .st-source h4 {
        margin: 8px 0;
        font-family: 'Orbitron', sans-serif;
        font-size: 15px;
        font-weight: 800;
        letter-spacing: 2px;
        color: #fff;
      }

      .st-source p {
        margin: 0 0 12px;
        font-size: 13px;
        line-height: 1.6;
        color: #b8c4d6;
      }

      .st-page .st-source a {
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 1.4px;
      }

      .st-assets {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
        margin-top: 18px;
        padding: 14px 16px;
        border: 1px dashed rgba(41, 79, 125, 0.9);
      }

      .st-assets__title {
        margin-right: 8px;
        font-family: 'Orbitron', sans-serif;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 2px;
        color: #ffb84d;
      }

      .st-assets__chip {
        padding: 4px 10px;
        border: 1px solid rgba(51, 209, 122, 0.45);
        background: rgba(51, 209, 122, 0.06);
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 1.4px;
        color: #9ff5c3;
      }

      /* ---------- Gotcha cards ---------- */
      .st-gotchas {
        display: grid;
        gap: 14px;
        margin-top: 28px;
      }

      @media (min-width: 900px) { .st-gotchas { grid-template-columns: repeat(3, minmax(0, 1fr)); } }

      .st-gotcha {
        height: 100%;
        padding: 18px;
        border: 1px solid rgba(41, 79, 125, 0.8);
        border-top: 3px solid var(--st-c);
        background: rgba(7, 13, 26, 0.92);
      }

      .st-gotcha--amber { --st-c: #ffb84d; }
      .st-gotcha--cyan { --st-c: #63f6ff; }
      .st-gotcha--red { --st-c: #ff5a6e; }

      .st-gotcha h4 {
        margin: 0 0 8px;
        font-family: 'Orbitron', sans-serif;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 2px;
        color: var(--st-c);
      }

      .st-gotcha p {
        margin: 0;
        font-size: 13px;
        line-height: 1.7;
        color: #c9d4e4;
      }

      .st-gotcha strong { color: #fff; }

      /* ---------- Pitfalls ---------- */
      .st-pits__head {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 14px;
        font-family: 'Orbitron', sans-serif;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 2px;
        color: #7e90ab;
      }

      .st-pits__head em {
        font-style: normal;
        color: #33d17a;
      }

      .st-pits__grid {
        display: grid;
        gap: 12px;
      }

      @media (min-width: 640px) { .st-pits__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
      @media (min-width: 1000px) { .st-pits__grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }

      .st-pits__grid > div { height: 100%; }

      .st-pit {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        min-height: 210px;
        padding: 16px 18px;
        border: 1px solid rgba(255, 90, 110, 0.45);
        background:
          repeating-linear-gradient(135deg, rgba(255, 90, 110, 0.04) 0 10px, transparent 10px 20px),
          rgba(14, 8, 14, 0.92);
        color: inherit;
        font-family: 'Space Mono', monospace;
        font-weight: 400;
        text-transform: none;
        letter-spacing: normal;
        text-align: left;
        cursor: pointer;
        transition: border-color 200ms ease, box-shadow 200ms ease, transform 200ms ease, background 200ms ease;
      }

      .st-pit:hover {
        transform: translateY(-3px);
        box-shadow: 0 0 22px rgba(255, 90, 110, 0.18);
      }

      .st-pit:focus-visible { outline: 2px solid #ffb84d; outline-offset: 2px; }

      .st-pit--fixed {
        border-color: rgba(51, 209, 122, 0.6);
        background: rgba(6, 20, 13, 0.92);
      }

      .st-pit--fixed:hover { box-shadow: 0 0 22px rgba(51, 209, 122, 0.18); }

      .st-pit__top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
      }

      .st-pit__n {
        font-family: 'VT323', monospace;
        font-size: 22px;
        line-height: 1;
        color: #5f7390;
      }

      .st-pit__state {
        padding: 2px 7px;
        border: 1px solid #ff5a6e;
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 1.5px;
        color: #ff5a6e;
      }

      .st-pit--fixed .st-pit__state { border-color: #33d17a; color: #33d17a; }

      .st-pit__name {
        font-family: 'Orbitron', sans-serif;
        font-size: 15px;
        font-weight: 800;
        letter-spacing: 1.5px;
        color: #fff;
      }

      .st-pit__sub {
        margin-top: 4px;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 1.5px;
        color: #ff8a98;
      }

      .st-pit--fixed .st-pit__sub { color: #7cf0ad; }

      .st-pit__label {
        margin-top: 14px;
        padding-top: 10px;
        border-top: 1px dashed rgba(41, 79, 125, 0.7);
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 1.5px;
        color: #7e90ab;
      }

      .st-pit__text {
        margin-top: 6px;
        font-size: 13px;
        line-height: 1.65;
        color: #c9d4e4;
        animation: stIn 320ms ease-out both;
      }

      /* ---------- Risk controls ---------- */
      .st-controls {
        display: grid;
        gap: 14px;
      }

      @media (min-width: 640px) { .st-controls { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
      @media (min-width: 1100px) { .st-controls { grid-template-columns: repeat(4, minmax(0, 1fr)); } }

      .st-control {
        height: 100%;
        padding: 18px;
        border: 1px solid rgba(41, 79, 125, 0.8);
        background: rgba(7, 13, 26, 0.92);
      }

      .st-control__glyph {
        display: grid;
        place-items: center;
        width: 42px;
        height: 42px;
        margin-bottom: 14px;
        border: 2px solid #ffb84d;
        font-size: 20px;
        color: #ffb84d;
        box-shadow: 3px 3px 0 #0c4a2a;
      }

      .st-control h4 {
        margin: 0 0 8px;
        font-family: 'Orbitron', sans-serif;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 2px;
        color: #fff;
      }

      .st-control p {
        margin: 0;
        font-size: 13px;
        line-height: 1.65;
        color: #b8c4d6;
      }

      /* ---------- Submission ---------- */
      .st-clock {
        position: relative;
        display: grid;
        gap: 14px;
      }

      @media (min-width: 760px) { .st-clock { grid-template-columns: repeat(2, minmax(0, 1fr)); } }

      .st-clock__card {
        padding: 18px 20px;
        border: 1px solid rgba(41, 79, 125, 0.8);
        border-left: 3px solid var(--st-c);
        background: rgba(7, 13, 26, 0.92);
      }

      .st-clock__card--orange { --st-c: #FA4616; }
      .st-clock__card--amber { --st-c: #ffb84d; }

      .st-clock__label {
        display: block;
        font-family: 'Orbitron', sans-serif;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 2px;
        color: var(--st-c);
      }

      .st-clock__when {
        display: block;
        margin: 6px 0 10px;
        font-size: 14px;
        letter-spacing: 1.2px;
        color: #fff;
      }

      .st-clock__count {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 10px;
      }

      .st-clock__count span {
        min-width: 64px;
        padding: 4px 8px;
        border: 1px solid rgba(41, 79, 125, 0.8);
        background: #02040a;
        font-family: 'VT323', monospace;
        font-size: 40px;
        line-height: 1;
        color: var(--st-c);
        text-shadow: 0 0 14px var(--st-c);
        text-align: center;
      }

      .st-clock__count small {
        margin-left: 2px;
        font-size: 18px;
        color: #7e90ab;
        text-shadow: none;
      }

      .st-clock__count .st-clock__closed { min-width: 0; color: #ff5a6e; }

      .st-clock__card em {
        font-style: normal;
        font-size: 12px;
        color: #a7b4c9;
      }

      .st-clock__tz {
        position: absolute;
        right: 0;
        top: -22px;
        font-size: 9px;
        letter-spacing: 1.5px;
        color: #5f7390;
      }

      .st-official {
        display: grid;
        gap: 1px;
        margin-top: 18px;
        border: 1px solid rgba(41, 79, 125, 0.8);
        background: rgba(41, 79, 125, 0.8);
      }

      @media (min-width: 640px) { .st-official { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
      @media (min-width: 1000px) { .st-official { grid-template-columns: repeat(4, minmax(0, 1fr)); } }

      .st-official > div {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
        padding: 14px 16px;
        background: rgba(7, 13, 26, 0.96);
      }

      .st-official span:first-child {
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 1.6px;
        color: #7e90ab;
      }

      .st-official b {
        font-size: 13px;
        letter-spacing: 1px;
        color: #fff;
      }

      .st-page .st-official a {
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 1.2px;
      }

      .st-repo {
        display: grid;
        gap: 18px;
        margin-top: 28px;
      }

      @media (min-width: 900px) { .st-repo { grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); } }

      .st-repo__card {
        height: 100%;
        padding: 20px;
        border: 1px solid rgba(41, 79, 125, 0.8);
        background: rgba(7, 13, 26, 0.92);
      }

      .st-repo__card h4 {
        margin: 0 0 12px;
        font-family: 'Orbitron', sans-serif;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 2px;
        color: #33d17a;
      }

      .st-repo__card .st-repo__never-title { margin-top: 20px; color: #ff5a6e; }

      .st-repo__card ul {
        margin: 0;
        padding: 0;
        list-style: none;
      }

      .st-repo__card li {
        position: relative;
        padding: 0 0 8px 20px;
        font-size: 13px;
        line-height: 1.6;
        color: #c9d4e4;
      }

      .st-repo__card li::before {
        content: '✓';
        position: absolute;
        left: 0;
        color: #33d17a;
      }

      .st-repo__card .st-repo__never li::before { content: '✕'; color: #ff5a6e; }

      .st-repo__fine {
        margin: 14px 0 0;
        font-size: 12px;
        line-height: 1.6;
        color: #8ea0bb;
      }

      .st-tree {
        margin: 0;
        padding: 18px 20px;
        overflow-x: auto;
        border: 1px solid rgba(51, 209, 122, 0.35);
        background: #02060a;
        font-family: 'Space Mono', monospace;
        font-size: 13px;
        line-height: 1.85;
      }

      .st-tree__line {
        display: flex;
        flex-wrap: wrap;
        gap: 4px 14px;
        animation: stIn 400ms ease-out both;
      }

      .st-tree__line b {
        font-weight: 400;
        color: #c9ffd9;
        white-space: pre;
      }

      .st-tree__line em {
        font-style: normal;
        color: #ffb84d;
        opacity: 0.85;
      }

      .st-tree__line em::before { content: '# '; color: #5f7390; }

      .st-tree__caption {
        margin: 8px 0 0;
        font-size: 9px;
        letter-spacing: 1.5px;
        color: #5f7390;
      }

      /* ---------- Checklist ---------- */
      .st-list {
        padding: 20px;
        border: 1px solid rgba(41, 79, 125, 0.8);
        background: rgba(7, 13, 26, 0.92);
        transition: border-color 300ms ease, box-shadow 300ms ease;
      }

      .st-list--go {
        border-color: #33d17a;
        box-shadow: 0 0 30px rgba(51, 209, 122, 0.2);
      }

      .st-list__head {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 12px;
      }

      .st-list__head span {
        display: block;
        font-family: 'Orbitron', sans-serif;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 2px;
        color: #fff;
      }

      .st-list__head em {
        font-style: normal;
        font-size: 9px;
        letter-spacing: 1.4px;
        color: #5f7390;
      }

      .st-list__head strong {
        font-family: 'VT323', monospace;
        font-size: 44px;
        line-height: 0.9;
        color: #33d17a;
      }

      .st-list__head strong small { font-size: 22px; color: #5f7390; }

      .st-list__meter {
        display: flex;
        gap: 3px;
        margin: 14px 0 16px;
      }

      .st-list__meter i {
        flex: 1;
        height: 8px;
        background: #12233a;
        transition: background 250ms ease;
      }

      .st-list__meter .st-list__seg--on { background: #33d17a; box-shadow: 0 0 8px rgba(51, 209, 122, 0.5); }

      .st-list ul {
        display: grid;
        gap: 4px 24px;
        margin: 0;
        padding: 0;
        list-style: none;
      }

      @media (min-width: 900px) { .st-list ul { grid-template-columns: repeat(2, minmax(0, 1fr)); } }

      .st-list label {
        position: relative;
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 8px 6px;
        font-size: 13px;
        line-height: 1.55;
        color: #c9d4e4;
        cursor: pointer;
        transition: color 150ms ease, background 150ms ease;
      }

      .st-list label:hover { background: rgba(51, 209, 122, 0.05); }

      .st-list input {
        position: absolute;
        opacity: 0;
        width: 1px;
        height: 1px;
      }

      .st-list__box {
        flex: none;
        width: 16px;
        height: 16px;
        margin-top: 2px;
        border: 2px solid #294f7d;
        transition: background 150ms ease, border-color 150ms ease;
      }

      .st-list input:focus-visible + .st-list__box { outline: 2px solid #ffb84d; outline-offset: 2px; }

      .st-list .st-list__item--on { color: #7e90ab; text-decoration: line-through; text-decoration-color: rgba(51, 209, 122, 0.6); }

      .st-list__item--on .st-list__box {
        border-color: #33d17a;
        background: #33d17a;
        box-shadow: inset 0 0 0 2px #02060a;
      }

      .st-list__foot {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        margin-top: 14px;
        padding-top: 12px;
        border-top: 1px dashed rgba(41, 79, 125, 0.7);
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 1.5px;
        color: #7e90ab;
      }

      .st-list__go {
        color: #33d17a;
        animation: blink 1s step-end 3;
      }

      .st-list__foot button {
        padding: 4px 10px;
        border: 1px solid #294f7d;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 1.4px;
        color: #9cc9ff;
      }

      .st-list__foot button:hover { border-color: #ff5a6e; color: #ff5a6e; }

      /* ---------- Library ---------- */
      .st-library {
        display: grid;
        gap: 14px;
      }

      @media (min-width: 760px) { .st-library { grid-template-columns: repeat(2, minmax(0, 1fr)); } }

      .st-shelf {
        height: 100%;
        padding: 18px 20px;
        border: 1px solid rgba(41, 79, 125, 0.8);
        border-top: 3px solid var(--st-c);
        background: rgba(7, 13, 26, 0.92);
      }

      .st-shelf--green { --st-c: #33d17a; }
      .st-shelf--cyan { --st-c: #63f6ff; }
      .st-shelf--amber { --st-c: #ffb84d; }
      .st-shelf--orange { --st-c: #FA4616; }

      .st-shelf h4 {
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        justify-content: space-between;
        gap: 6px;
        margin: 0 0 14px;
        font-family: 'Orbitron', sans-serif;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 2px;
        color: var(--st-c);
      }

      .st-shelf h4 em {
        font-family: 'Space Mono', monospace;
        font-style: normal;
        font-size: 9px;
        letter-spacing: 1.4px;
        color: #7e90ab;
      }

      .st-shelf ul {
        margin: 0;
        padding: 0;
        list-style: none;
      }

      .st-shelf li {
        padding: 8px 0;
        border-bottom: 1px dashed rgba(41, 79, 125, 0.6);
      }

      .st-shelf li:last-child { border-bottom: 0; }

      .st-shelf cite {
        display: block;
        font-style: italic;
        font-size: 13px;
        color: #fff;
      }

      .st-shelf li span {
        display: block;
        margin-top: 2px;
        font-size: 11px;
        color: #8ea0bb;
      }

      .st-shelf li small {
        display: block;
        margin-top: 3px;
        font-size: 11px;
        color: #ffd27a;
      }

      .st-shelf__links {
        display: grid;
        gap: 8px;
        margin-bottom: 16px;
      }

      .st-page .st-shelf__links a { font-size: 13px; }

      .st-shelf__libs {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      /* ---------- Final ---------- */
      .st-final { padding: 100px 0 90px; }

      .st-final__panel {
        position: relative;
        overflow: hidden;
        padding: 56px 28px;
        border: 1px solid #294f7d;
        background:
          radial-gradient(circle at 50% 0%, rgba(51, 209, 122, 0.14), transparent 60%),
          rgba(6, 10, 22, 0.95);
        text-align: center;
      }

      .st-final__curve {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 45%;
        opacity: 0.35;
        pointer-events: none;
      }

      .st-final__curve svg { width: 100%; height: 100%; }

      .st-final__curve path {
        fill: none;
        stroke: #33d17a;
        stroke-width: 2;
        vector-effect: non-scaling-stroke;
        filter: drop-shadow(0 0 6px rgba(51, 209, 122, 0.8));
      }

      .st-final__kicker {
        position: relative;
        font-family: 'Orbitron', sans-serif;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 3px;
        color: #ffb84d;
      }

      .st-final__panel h2 {
        position: relative;
        margin: 14px 0;
        font-family: 'Orbitron', sans-serif;
        font-size: clamp(24px, 3.6vw, 40px);
        font-weight: 800;
        letter-spacing: 1px;
        text-transform: uppercase;
        color: #fff;
      }

      .st-final__panel > p {
        position: relative;
        max-width: 620px;
        margin: 0 auto;
        font-size: 14px;
        line-height: 1.7;
        color: #b8c4d6;
      }

      .st-final__actions {
        position: relative;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 14px;
        margin: 28px 0 24px;
      }

      .st-final__panel .st-final__fine {
        font-size: 11px;
        color: #6f819c;
      }

      /* Starter kits: download panel, file list and copyable snippets. */
      .st-page {
        --st-kit: #63f6ff;
        --st-kit-line: rgba(99, 246, 255, 0.4);
        --st-kit-edge: rgba(99, 246, 255, 0.55);
        --st-kit-glow: rgba(99, 246, 255, 0.12);
        --st-kit-ink: #9ff6ff;
        --st-kit-text: #d7fbff;
      }

      .st-download {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        padding: 20px 22px;
        border: 1px solid var(--st-kit-edge);
        background:
          radial-gradient(circle at 0% 50%, var(--st-kit-glow), transparent 55%),
          rgba(7, 13, 26, 0.92);
      }

      .st-download span { display: block; font-size: 9px; font-weight: 700; letter-spacing: 1.6px; color: var(--st-kit-ink); }
      .st-download strong { display: block; margin: 6px 0 4px; font-family: 'Orbitron', sans-serif; font-size: clamp(15px, 2vw, 19px); letter-spacing: 1px; color: #fff; }
      .st-download em { font-style: normal; font-size: 12px; color: #a7b4c9; }
      .st-download__actions { display: flex; flex-wrap: wrap; gap: 10px; }

      .st-kit { display: grid; margin-top: 10px; border: 1px solid rgba(41, 79, 125, 0.8); background: rgba(7, 13, 26, 0.92); }
      .st-kit__row { display: grid; gap: 4px 16px; padding: 9px 16px; border-top: 1px solid rgba(41, 79, 125, 0.45); font-size: 12px; color: #a7b4c9; }
      .st-kit__row:first-child { border-top: 0; }
      .st-kit__row code { color: var(--st-kit-ink); overflow-wrap: anywhere; }
      @media (min-width: 720px) { .st-kit__row { grid-template-columns: 340px minmax(0, 1fr); } }

      .st-copy { min-width: 0; border: 1px solid var(--st-kit-line); background: #04050c; }

      .st-copy__bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        border-bottom: 1px solid var(--st-kit-line);
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 1.5px;
        color: var(--st-kit-ink);
      }

      .st-page .st-copy__bar button {
        padding: 3px 10px;
        border: 1px solid var(--st-kit);
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 1.4px;
        color: #fff;
      }

      .st-copy pre {
        margin: 0;
        padding: 14px 16px;
        overflow-x: auto;
        font-family: 'Space Mono', monospace;
        font-size: 13px;
        line-height: 1.75;
        color: var(--st-kit-text);
      }

      @media (prefers-reduced-motion: reduce) {
        .st-page *, .st-page *::before, .st-page *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
    `}</style>
  );
}
