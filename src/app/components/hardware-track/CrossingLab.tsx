import { useEffect, useMemo, useRef, useState } from 'react';

// The guide's exact algorithm (§10.3): indices 0–15 only fill each item's
// window; from index 16 the previous price is compared with the old floored
// average and the current price with the new one. Price paths are illustrative;
// the judge uses its own unpublished seed.
const PACKETS = 100;
const WINDOW = 16;
const SWAP_AT = 50;

const ITEMS = [
  { id: 0x11, name: 'A', color: '#FA4616' },
  { id: 0x22, name: 'B', color: '#63f6ff' },
];

const ACTION_NAMES = ['NONE', 'SELL', 'BUY'];

type Mode = 'item' | 'slot';
type Event = 'FILL' | 'BUY' | 'SELL' | 'HOLD';
type Held = { price: number; item: number };
type Out = { action: number; event: Event; sum: number; avg: number | null; oldAvg: number | null; prev: number | null; window: Held[] };
type Step = { slots: [number, number]; prices: [number, number]; out: [Out, Out] };

const mulberry32 = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const pricePath = (seed: number, item: number) => {
  const rand = mulberry32(seed * 7919 + item * 104729 + 17);
  const base = item === 0 ? 100 : 165;
  let price = base + (rand() - 0.5) * 12;
  let drift = 0;
  return Array.from({ length: PACKETS }, () => {
    drift = drift * 0.75 + (rand() - 0.5) * 6;
    price += drift + (base - price) * 0.08;
    return Math.max(1, Math.round(price));
  });
};

// Tracking state by item ID is correct. Tracking it by packet slot works only
// until the judge swaps which item rides in which slot.
const simulate = (paths: number[][], swap: boolean, mode: Mode): Step[] => {
  const states = [0, 1].map(() => ({ window: [] as Held[], sum: 0, prev: null as number | null, action: 0 }));
  return Array.from({ length: PACKETS }, (_, index) => {
    const slots: [number, number] = swap && index >= SWAP_AT ? [1, 0] : [0, 1];
    const prices: [number, number] = [paths[slots[0]][index], paths[slots[1]][index]];
    const out = slots.map((item, slot) => {
      const state = states[mode === 'item' ? item : slot];
      const price = prices[slot];
      const prev = state.prev;
      state.prev = price;

      if (index < WINDOW) {
        state.window.push({ price, item });
        state.sum += price;
        return { action: 0, event: 'FILL' as Event, sum: state.sum, avg: null, oldAvg: null, prev, window: [...state.window] };
      }
      const oldAvg = state.sum >> 4;
      state.sum += price - state.window.shift()!.price;
      state.window.push({ price, item });
      const avg = state.sum >> 4;
      let event: Event = 'HOLD';
      if (prev! <= oldAvg && price > avg) event = 'BUY';
      else if (prev! >= oldAvg && price < avg) event = 'SELL';
      if (event === 'BUY') state.action = 2;
      if (event === 'SELL') state.action = 1;
      return { action: state.action, event, sum: state.sum, avg, oldAvg, prev, window: [...state.window] };
    }) as [Out, Out];
    return { slots, prices, out };
  });
};

const hex = (value: number) => value.toString(16).toUpperCase().padStart(2, '0');

const W = 640;
const H = 250;
const PAD = { left: 40, right: 14, top: 18, bottom: 28 };
const xOf = (index: number) => PAD.left + (index / (PACKETS - 1)) * (W - PAD.left - PAD.right);

export function CrossingLab() {
  const [seed, setSeed] = useState(1);
  const [swap, setSwap] = useState(true);
  const [mode, setMode] = useState<Mode>('item');
  const [focus, setFocus] = useState(0);
  const [n, setN] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [fast, setFast] = useState(false);
  const [visible, setVisible] = useState(false);
  const autoStarted = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const paths = useMemo(() => [pricePath(seed, 0), pricePath(seed, 1)], [seed]);
  const truth = useMemo(() => simulate(paths, swap, 'item'), [paths, swap]);
  const steps = useMemo(() => (mode === 'item' ? truth : simulate(paths, swap, 'slot')), [mode, paths, swap, truth]);

  const minPrice = Math.min(...paths[0], ...paths[1]) - 8;
  const maxPrice = Math.max(...paths[0], ...paths[1]) + 8;
  const yOf = (price: number) => PAD.top + ((maxPrice - price) / (maxPrice - minPrice)) * (H - PAD.top - PAD.bottom);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.3 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || autoStarted.current) return;
    autoStarted.current = true;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setN(PACKETS - 1);
      return;
    }
    setPlaying(true);
  }, [visible]);

  useEffect(() => {
    if (!playing || !visible) return;
    const timer = window.setInterval(() => setN((value) => Math.min(PACKETS - 1, value + 1)), fast ? 70 : 230);
    return () => window.clearInterval(timer);
  }, [playing, visible, fast]);

  useEffect(() => {
    if (n >= PACKETS - 1) setPlaying(false);
  }, [n]);

  const restart = () => {
    setN(0);
    setPlaying(true);
  };

  const step = steps[n];
  // Which slot carries the focused item right now.
  const slotOf = (s: Step, item: number) => (s.slots[0] === item ? 0 : 1);
  const focusOut = step.out[slotOf(step, focus)];
  const price = step.prices[slotOf(step, focus)];

  const linePath = (values: (number | null)[]) => {
    let d = '';
    let pen = false;
    values.forEach((value, index) => {
      if (value === null) {
        pen = false;
        return;
      }
      d += `${pen ? 'L' : 'M'} ${xOf(index).toFixed(1)} ${yOf(value).toFixed(1)} `;
      pen = true;
    });
    return d;
  };

  const shown = steps.slice(0, n + 1);
  const marks = ITEMS.flatMap((_, item) =>
    shown.flatMap((s, index) => {
      const out = s.out[slotOf(s, item)];
      if (out.event !== 'BUY' && out.event !== 'SELL') return [];
      return [{ item, index, event: out.event, price: s.prices[slotOf(s, item)] }];
    })
  );

  const wrong = mode === 'slot'
    ? shown.flatMap((s, index) =>
        ITEMS.flatMap((_, item) => {
          const mine = s.out[slotOf(s, item)].action;
          const right = truth[index].out[slotOf(truth[index], item)].action;
          return mine !== right ? [{ index, item, price: s.prices[slotOf(s, item)] }] : [];
        })
      )
    : [];

  const log = marks
    .slice()
    .sort((a, b) => b.index - a.index)
    .slice(0, 5);

  const request = [0, n, ITEMS[step.slots[0]].id, step.prices[0] >> 8, step.prices[0] & 255, ITEMS[step.slots[1]].id, step.prices[1] >> 8, step.prices[1] & 255];
  const actionByte = (out: Out) => hex(out.action);

  const comparison = () => {
    if (focusOut.avg === null || focusOut.oldAvg === null || focusOut.prev === null) {
      return <span className="cl-cmp__fill">WARM-UP · {focusOut.window.length}/{WINDOW} PRICES · RESPOND NONE</span>;
    }
    const prevSide = focusOut.prev < focusOut.oldAvg ? '<' : focusOut.prev > focusOut.oldAvg ? '>' : '=';
    const nowSide = price > focusOut.avg ? '>' : price < focusOut.avg ? '<' : '=';
    return (
      <>
        <span>
          PREV <b>{focusOut.prev}</b> {prevSide} OLD AVG <b>{focusOut.oldAvg}</b>
        </span>
        <span>
          NOW <b>{price}</b> {nowSide} NEW AVG <b>{focusOut.avg}</b>
        </span>
        <strong
          className={`cl-cmp__verdict cl-cmp__verdict--${focusOut.event.toLowerCase()}`}
          key={focusOut.event === 'HOLD' ? 'hold' : `${n}-${focus}`}
        >
          {focusOut.event === 'BUY' && '▲ BUY · CROSSED UP'}
          {focusOut.event === 'SELL' && '▼ SELL · CROSSED DOWN'}
          {focusOut.event === 'HOLD' && `HOLD · KEEP ${ACTION_NAMES[focusOut.action]}`}
        </strong>
      </>
    );
  };

  return (
    <div ref={rootRef} className="cl">
      <div className="cl-top">
        <span>CROSSING LAB · ONE 100-PACKET RUN</span>
        <em>ILLUSTRATIVE PRICES · 22_robust_uart_test.py IS GROUND TRUTH</em>
      </div>

      <div className="cl-controls">
        <div className="cl-group">
          <button type="button" className="cl-btn cl-btn--main" onClick={() => (n >= PACKETS - 1 ? restart() : setPlaying((value) => !value))}>
            {playing ? '❚❚ PAUSE' : n >= PACKETS - 1 ? '↺ REPLAY' : '▶ PLAY'}
          </button>
          <button type="button" className="cl-btn" onClick={() => setN((value) => Math.min(PACKETS - 1, value + 1))} disabled={playing}>
            STEP ▸
          </button>
          <button type="button" className={`cl-btn ${fast ? 'cl-btn--on' : ''}`} onClick={() => setFast((value) => !value)} aria-pressed={fast}>
            ▸▸ FAST
          </button>
        </div>
        <div className="cl-group" role="group" aria-label="Price seed">
          <span>SEED</span>
          {[1, 2, 3].map((value) => (
            <button key={value} type="button" className={`cl-btn ${seed === value ? 'cl-btn--on' : ''}`} onClick={() => { setSeed(value); restart(); }}>
              {value}
            </button>
          ))}
        </div>
        <div className="cl-group">
          <button type="button" className={`cl-btn ${swap ? 'cl-btn--amber' : ''}`} onClick={() => { setSwap((value) => !value); restart(); }} aria-pressed={swap}>
            SLOT SWAP @ #{SWAP_AT} {swap ? 'ON' : 'OFF'}
          </button>
        </div>
        <div className="cl-group" role="group" aria-label="Track state by">
          <span>TRACK STATE BY</span>
          <button type="button" className={`cl-btn ${mode === 'item' ? 'cl-btn--green' : ''}`} onClick={() => setMode('item')}>
            ITEM ID ✓
          </button>
          <button type="button" className={`cl-btn ${mode === 'slot' ? 'cl-btn--red' : ''}`} onClick={() => setMode('slot')}>
            SLOT ✗
          </button>
        </div>
      </div>

      <div className="cl-grid">
        <div className="cl-chart-wrap">
          <div className="cl-legend" role="group" aria-label="Focus item">
            {ITEMS.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className={`cl-legend__item ${focus === index ? 'cl-legend__item--on' : ''}`}
                style={{ ['--c' as string]: item.color }}
                onClick={() => setFocus(index)}
                aria-pressed={focus === index}
              >
                <i /> ITEM {item.name} · 0x{hex(item.id)}
              </button>
            ))}
            <span className="cl-legend__key">
              <i className="cl-key-line" /> PRICE <i className="cl-key-dash" /> 16-PRICE AVERAGE
            </span>
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} className="cl-chart" role="img" aria-label={`Prices and 16-price averages for items A and B up to packet ${n}.`}>
            <rect x={PAD.left} y={PAD.top} width={xOf(WINDOW - 1) - PAD.left} height={H - PAD.top - PAD.bottom} className="cl-fill-zone" />
            <text x={PAD.left + 6} y={PAD.top + 12} className="cl-zone-label">
              WARM-UP · 0–15
            </text>
            {[0, 25, 50, 75, 99].map((index) => (
              <text key={index} x={xOf(index)} y={H - 10} textAnchor="middle" className="cl-axis">
                #{index}
              </text>
            ))}
            {[0, 0.5, 1].map((t) => {
              const value = Math.round(minPrice + (maxPrice - minPrice) * t);
              return (
                <g key={t}>
                  <line x1={PAD.left} x2={W - PAD.right} y1={yOf(value)} y2={yOf(value)} className="cl-gridline" />
                  <text x={PAD.left - 6} y={yOf(value) + 3} textAnchor="end" className="cl-axis">
                    {value}
                  </text>
                </g>
              );
            })}
            {swap && (
              <g>
                <line x1={xOf(SWAP_AT)} x2={xOf(SWAP_AT)} y1={PAD.top} y2={H - PAD.bottom} className="cl-swap" />
                <text x={xOf(SWAP_AT) + 5} y={PAD.top + 12} className="cl-swap-label">
                  SLOTS SWAP
                </text>
              </g>
            )}

            {ITEMS.map((item, index) => {
              const dim = focus !== index;
              const pricesShown = paths[index].map((value, i) => (i <= n ? value : null));
              const avgShown = steps.map((s, i) => (i <= n ? s.out[slotOf(s, index)].avg : null));
              return (
                <g key={item.id} style={{ opacity: dim ? 0.28 : 1 }}>
                  <path d={linePath(pricesShown)} stroke={item.color} className="cl-price" />
                  <path d={linePath(avgShown)} stroke={item.color} className="cl-avg" />
                </g>
              );
            })}

            {marks.map((mark) => {
              const x = xOf(mark.index);
              const y = yOf(mark.price);
              const up = mark.event === 'BUY';
              return (
                <path
                  key={`${mark.item}-${mark.index}`}
                  d={up ? `M ${x} ${y + 7} l 5 8 h -10 Z` : `M ${x} ${y - 7} l 5 -8 h -10 Z`}
                  className={`cl-mark ${up ? 'cl-mark--buy' : 'cl-mark--sell'}`}
                  style={{ opacity: focus === mark.item ? 1 : 0.3 }}
                />
              );
            })}

            {wrong.map((miss) => (
              <text key={`w-${miss.item}-${miss.index}`} x={xOf(miss.index)} y={yOf(miss.price) + 4} textAnchor="middle" className="cl-wrong" style={{ opacity: focus === miss.item ? 1 : 0.35 }}>
                ✕
              </text>
            ))}

            <line x1={xOf(n)} x2={xOf(n)} y1={PAD.top} y2={H - PAD.bottom} className="cl-cursor" />
          </svg>

          <div className="cl-packet">
            <div>
              <span>REQ #{n}</span>
              {request.map((value, index) => (
                <b key={index} className={index === 2 || index === 5 ? 'cl-packet__item' : ''} style={index === 2 || index === 5 ? { color: ITEMS[step.slots[index === 2 ? 0 : 1]].color } : undefined}>
                  {hex(value)}
                </b>
              ))}
            </div>
            <div>
              <span>RESP</span>
              <b>00</b>
              <b>{hex(n)}</b>
              <b style={{ color: ITEMS[step.slots[0]].color }}>{hex(ITEMS[step.slots[0]].id)}</b>
              <b className="cl-packet__act">{actionByte(step.out[0])}</b>
              <b style={{ color: ITEMS[step.slots[1]].color }}>{hex(ITEMS[step.slots[1]].id)}</b>
              <b className="cl-packet__act">{actionByte(step.out[1])}</b>
              <b>00</b>
              <b>00</b>
            </div>
          </div>
        </div>

        <div className="cl-side">
          <div className="cl-router">
            {step.slots.map((item, slot) => (
              <div key={slot} className="cl-router__row">
                <span>SLOT {slot + 1}</span>
                <i style={{ color: ITEMS[item].color }}>0x{hex(ITEMS[item].id)}</i>
                <em>→</em>
                <strong style={{ color: mode === 'item' ? ITEMS[item].color : '#c9d4e4' }}>
                  {mode === 'item' ? `ENGINE ${ITEMS[item].name}` : `ENGINE ${slot + 1}`}
                </strong>
              </div>
            ))}
          </div>

          <div className="cl-window">
            <div className="cl-window__head">
              <span>
                {mode === 'item' ? `ITEM ${ITEMS[focus].name}` : `SLOT ${slotOf(step, focus) + 1}`} · LAST 16 PRICES
              </span>
              <em>OLDEST → NEWEST</em>
            </div>
            <div className="cl-cells">
              {Array.from({ length: WINDOW }, (_, index) => {
                const held = focusOut.window[index - (WINDOW - focusOut.window.length)];
                const newest = index === WINDOW - 1 && held;
                const above = held && focusOut.avg !== null ? held.price > focusOut.avg : null;
                return (
                  <span
                    key={newest ? `new-${n}-${focus}` : index}
                    className={`cl-cell ${held ? '' : 'cl-cell--empty'} ${newest ? 'cl-cell--new' : ''} ${above === true ? 'cl-cell--above' : above === false ? 'cl-cell--below' : ''}`}
                    style={held ? { ['--c' as string]: ITEMS[held.item].color } : undefined}
                  >
                    {held ? held.price : '·'}
                  </span>
                );
              })}
            </div>
            <div className="cl-sum">
              <div>
                <span>ROLLING SUM</span>
                <b>{focusOut.sum.toLocaleString()}</b>
              </div>
              <div>
                <span>SUM &gt;&gt; 4 = AVERAGE</span>
                <b>{focusOut.avg === null ? '—' : focusOut.avg}</b>
              </div>
              <div>
                <span>ACTION REGISTER</span>
                <b className={`cl-reg cl-reg--${focusOut.action}`}>{ACTION_NAMES[focusOut.action]}</b>
              </div>
            </div>
          </div>

          <div className="cl-cmp" aria-live="polite">
            {comparison()}
          </div>

          {mode === 'slot' ? (
            <div className="cl-alert">
              <b>{wrong.length}</b> WRONG ACTIONS SO FAR
              <span>
                {swap
                  ? n < SWAP_AT
                    ? 'Fine so far. Watch what happens at the swap.'
                    : 'For 16 packets after the swap, each window mixes both items’ prices, so the averages and actions go wrong.'
                  : 'Turn the slot swap on to see this design break.'}
              </span>
            </div>
          ) : (
            <ul className="cl-log">
              {log.length === 0 && <li className="cl-log__empty">NO CROSSINGS YET</li>}
              {log.map((entry) => (
                <li key={`${entry.item}-${entry.index}`} className={entry.event === 'BUY' ? 'cl-log--buy' : 'cl-log--sell'}>
                  <span>#{String(entry.index).padStart(2, '0')}</span>
                  <i style={{ color: ITEMS[entry.item].color }}>ITEM {ITEMS[entry.item].name}</i>
                  <b>{entry.event === 'BUY' ? '▲ BUY' : '▼ SELL'}</b>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <style>{`
        .cl {
          font-family: 'Space Mono', monospace;
          border: 1px solid #1d4f83;
          background: linear-gradient(180deg, rgba(7, 13, 26, 0.96), rgba(4, 8, 18, 0.98));
          box-shadow: 0 0 0 3px rgba(5, 11, 23, 0.98), 0 0 36px rgba(4, 74, 148, 0.16);
          padding: 18px;
        }

        .cl-top {
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

        .cl-top em {
          font-style: normal;
          font-size: 9px;
          letter-spacing: 1.4px;
          color: #ffb84d;
        }

        .cl-controls {
          display: flex;
          flex-wrap: wrap;
          gap: 10px 18px;
          margin-bottom: 14px;
        }

        .cl-group {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px;
        }

        .cl-group > span {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.2px;
          color: #5f7390;
        }

        .cl-btn {
          padding: 6px 10px;
          border: 1px solid #294f7d;
          background: #07101d;
          color: #9cc9ff;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1px;
          transition: border-color 150ms ease, background 150ms ease, color 150ms ease;
        }

        .cl-btn:hover:not(:disabled) { border-color: #63f6ff; color: #fff; }
        .cl-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .cl-btn--main { border-color: #FA4616; color: #fff; background: rgba(250, 70, 22, 0.16); }
        .cl-btn--on { border-color: #63f6ff; background: #63f6ff; color: #02040a; }
        .cl-btn--amber { border-color: #ffb84d; background: rgba(255, 184, 77, 0.16); color: #ffd27a; }
        .cl-btn--green { border-color: #4cff87; background: #4cff87; color: #02040a; }
        .cl-btn--red { border-color: #ff5a6e; background: #ff5a6e; color: #02040a; }

        .cl-grid {
          display: grid;
          gap: 16px;
        }

        @media (min-width: 1000px) {
          .cl-grid { grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr); }
        }

        .cl-legend {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px 10px;
          margin-bottom: 6px;
        }

        .cl-legend__item {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 8px;
          border: 1px solid rgba(41, 79, 125, 0.8);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1px;
          color: #7e90ab;
        }

        .cl-legend__item i {
          width: 10px;
          height: 10px;
          background: var(--c);
          box-shadow: 0 0 8px var(--c);
        }

        .cl-legend__item--on { border-color: var(--c); color: #fff; }

        .cl-legend__key {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-left: auto;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1px;
          color: #5f7390;
        }

        .cl-key-line, .cl-key-dash {
          display: inline-block;
          width: 18px;
          height: 0;
          border-top: 2px solid #a7b4c9;
        }

        .cl-key-dash { border-top-style: dashed; }

        .cl-chart {
          display: block;
          width: 100%;
          height: auto;
          border: 1px solid rgba(41, 79, 125, 0.6);
          background: #040913;
        }

        .cl-fill-zone { fill: rgba(255, 184, 77, 0.05); }
        .cl-zone-label { fill: rgba(255, 184, 77, 0.6); font-size: 9px; font-weight: 700; letter-spacing: 1px; }
        .cl-gridline { stroke: rgba(88, 140, 210, 0.12); }
        .cl-axis { fill: #5f7390; font-size: 9px; font-family: 'Space Mono', monospace; }
        .cl-swap { stroke: #ffb84d; stroke-dasharray: 4 4; }
        .cl-swap-label { fill: #ffb84d; font-size: 9px; font-weight: 700; letter-spacing: 1px; }

        .cl-price {
          fill: none;
          stroke-width: 2;
          stroke-linejoin: round;
        }

        .cl-avg {
          fill: none;
          stroke-width: 1.5;
          stroke-dasharray: 5 4;
          opacity: 0.85;
        }

        .cl-mark--buy { fill: #4cff87; filter: drop-shadow(0 0 4px #4cff87); }
        .cl-mark--sell { fill: #ff5a6e; filter: drop-shadow(0 0 4px #ff5a6e); }

        .cl-wrong {
          fill: #ff3b5c;
          font-size: 13px;
          font-weight: 700;
        }

        .cl-cursor { stroke: rgba(255, 244, 200, 0.55); stroke-width: 1; }

        .cl-packet {
          display: grid;
          gap: 6px;
          margin-top: 10px;
        }

        .cl-packet div {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 4px;
        }

        .cl-packet span {
          width: 64px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1px;
          color: #5f7390;
        }

        .cl-packet b {
          min-width: 30px;
          padding: 2px 4px;
          border: 1px solid rgba(41, 79, 125, 0.7);
          font-family: 'VT323', monospace;
          font-size: 19px;
          font-weight: 400;
          text-align: center;
          color: #c9d4e4;
        }

        .cl-packet .cl-packet__act { border-color: #4cff87; color: #4cff87; }

        .cl-side {
          display: grid;
          gap: 10px;
          align-content: start;
        }

        .cl-router {
          display: grid;
          gap: 4px;
          padding: 10px;
          border: 1px solid rgba(41, 79, 125, 0.7);
          background: rgba(4, 9, 19, 0.9);
        }

        .cl-router__row {
          display: grid;
          grid-template-columns: 56px 48px 18px minmax(0, 1fr);
          align-items: center;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
        }

        .cl-router__row span { color: #5f7390; font-size: 9px; }
        .cl-router__row i { font-style: normal; font-family: 'VT323', monospace; font-size: 18px; }
        .cl-router__row em { font-style: normal; color: #5f7390; }

        .cl-window {
          padding: 10px;
          border: 1px solid rgba(41, 79, 125, 0.7);
          background: rgba(4, 9, 19, 0.9);
        }

        .cl-window__head {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 8px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.2px;
          color: #fff;
        }

        .cl-window__head em { font-style: normal; color: #5f7390; }

        .cl-cells {
          display: grid;
          grid-template-columns: repeat(8, minmax(0, 1fr));
          gap: 3px;
        }

        .cl-cell {
          padding: 4px 0;
          border: 1px solid color-mix(in srgb, var(--c, #294f7d) 55%, transparent);
          background: color-mix(in srgb, var(--c, #294f7d) 8%, #040913);
          font-family: 'VT323', monospace;
          font-size: 17px;
          line-height: 1;
          text-align: center;
          color: #e8eef7;
        }

        .cl-cell--empty { color: #2c4466; border-style: dashed; }
        .cl-cell--above { box-shadow: inset 0 -3px 0 rgba(76, 255, 135, 0.7); }
        .cl-cell--below { box-shadow: inset 0 -3px 0 rgba(255, 90, 110, 0.7); }
        .cl-cell--new { animation: clNew 160ms ease-out; outline: 1px solid #fff; }

        @keyframes clNew {
          from { transform: translateY(-8px); opacity: 0; }
          to { transform: none; opacity: 1; }
        }

        .cl-sum {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 6px;
          margin-top: 10px;
        }

        .cl-sum span {
          display: block;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 1px;
          color: #5f7390;
        }

        .cl-sum b {
          font-family: 'VT323', monospace;
          font-size: 22px;
          font-weight: 400;
          color: #fff4c8;
        }

        .cl-reg--1 { color: #ff5a6e !important; }
        .cl-reg--2 { color: #4cff87 !important; }

        .cl-cmp {
          display: grid;
          gap: 4px;
          min-height: 86px;
          padding: 10px 12px;
          border-left: 3px solid #FA4616;
          background: rgba(250, 70, 22, 0.06);
          font-size: 12px;
          color: #a7b4c9;
        }

        .cl-cmp b {
          font-family: 'VT323', monospace;
          font-size: 19px;
          font-weight: 400;
          color: #fff;
        }

        .cl-cmp__fill { align-self: center; font-size: 11px; font-weight: 700; letter-spacing: 1px; color: #ffb84d; }

        .cl-cmp__verdict {
          font-family: 'Orbitron', sans-serif;
          font-size: 12px;
          letter-spacing: 1.5px;
          animation: clVerdict 200ms ease-out;
        }

        .cl-cmp__verdict--buy { color: #4cff87; }
        .cl-cmp__verdict--sell { color: #ff5a6e; }
        .cl-cmp__verdict--hold { color: #9cc9ff; }

        @keyframes clVerdict {
          from { transform: translateX(-6px); opacity: 0; }
          to { transform: none; opacity: 1; }
        }

        .cl-log {
          display: grid;
          gap: 4px;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .cl-log li {
          display: grid;
          grid-template-columns: 40px 70px 1fr;
          padding: 4px 8px;
          border: 1px solid rgba(41, 79, 125, 0.5);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
        }

        .cl-log li span { color: #5f7390; }
        .cl-log li i { font-style: normal; }
        .cl-log--buy b { color: #4cff87; }
        .cl-log--sell b { color: #ff5a6e; }
        .cl-log .cl-log__empty { display: block; color: #5f7390; font-size: 10px; }

        .cl-alert {
          padding: 10px 12px;
          border: 1px solid #ff3b5c;
          background: rgba(255, 59, 92, 0.08);
          font-family: 'Orbitron', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.4px;
          color: #ff8a98;
        }

        .cl-alert b {
          font-family: 'VT323', monospace;
          font-size: 30px;
          font-weight: 400;
          color: #fff;
          margin-right: 6px;
        }

        .cl-alert span {
          display: block;
          margin-top: 4px;
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0;
          line-height: 1.6;
          color: #d3dcea;
        }

        @media (prefers-reduced-motion: reduce) {
          .cl-cell--new, .cl-cmp__verdict { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
