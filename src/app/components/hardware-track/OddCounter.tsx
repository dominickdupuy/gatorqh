import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { frameGate } from '../../performance';

// The guide's worked example (§3): a counter that walks 1 → 3 → 5 → 7 every
// 0.5 s on a 27 MHz clock, with two asynchronous resets on buttons S1 and S2.
const HALF_SEC = 13_500_000;
const TICK_MS = 500;

type Reset = 'rst0' | 'rst4' | null;

const CODE: { text: string; group?: 'rst0' | 'rst4' | 'tick' | 'led' }[] = [
  { text: 'process(clk, rst0, rst4)' },
  { text: 'begin' },
  { text: "  if rst0 = '1' then", group: 'rst0' },
  { text: '    cnt <= "000";', group: 'rst0' },
  { text: "  elsif rst4 = '1' then", group: 'rst4' },
  { text: '    cnt <= "100";', group: 'rst4' },
  { text: '  elsif rising_edge(clk) then', group: 'tick' },
  { text: "    if tick = '1' then", group: 'tick' },
  { text: "      cnt(0) <= '1';", group: 'tick' },
  { text: '      cnt(1) <= not cnt(1);', group: 'tick' },
  { text: '      cnt(2) <= cnt(2) xor cnt(1);', group: 'tick' },
  { text: '    end if;' },
  { text: '  end if;' },
  { text: 'end process;' },
  { text: '' },
  { text: 'led <= "111" & not cnt;', group: 'led' },
];

const next = (cnt: number) => {
  const q1 = (cnt >> 1) & 1;
  const q2 = (cnt >> 2) & 1;
  return (((q2 ^ q1) & 1) << 2) | ((q1 ^ 1) << 1) | 1;
};

const bits = (value: number) => value.toString(2).padStart(3, '0');

export function OddCounter() {
  const [cnt, setCnt] = useState(1);
  const [reset, setReset] = useState<Reset>(null);
  const [running, setRunning] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [flash, setFlash] = useState(0);
  const divRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const resetRef = useRef<Reset>(null);
  resetRef.current = reset;

  useEffect(() => {
    if (reset === 'rst0') setCnt(0);
    if (reset === 'rst4') setCnt(4);
  }, [reset]);

  useEffect(() => {
    if (!running) return;
    const node = rootRef.current;
    if (!node) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let visible = false;
    let phase = 0;
    let last = performance.now();

    // Held to AMBIENT_FPS; see app/performance.ts.
    const gate = frameGate();
    const frame = (now: number) => {
      raf = 0;
      if (!gate(now)) {
        if (visible) raf = requestAnimationFrame(frame);
        return;
      }
      phase += Math.min(100, now - last);
      last = now;
      if (phase >= TICK_MS) {
        phase -= TICK_MS;
        if (!resetRef.current) {
          setCnt((value) => next(value));
          setFlash((value) => value + 1);
        }
      }
      const fraction = phase / TICK_MS;
      if (divRef.current) divRef.current.textContent = Math.floor(fraction * HALF_SEC).toLocaleString();
      if (barRef.current) barRef.current.style.width = `${fraction * 100}%`;
      if (visible) raf = requestAnimationFrame(frame);
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && !reduced;
      if (visible && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    });
    observer.observe(node);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [running]);

  const step = () => {
    if (reset) return;
    setCnt((value) => next(value));
    setFlash((value) => value + 1);
  };

  const holdProps = (which: Exclude<Reset, null>) => ({
    onPointerDown: (event: PointerEvent<HTMLButtonElement>) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      setReset(which);
    },
    onPointerUp: () => setReset(null),
    onPointerCancel: () => setReset(null),
    onKeyDown: (event: KeyboardEvent) => {
      if ((event.key === 'Enter' || event.key === ' ') && !event.repeat) {
        event.preventDefault();
        setReset(which);
      }
    },
    onKeyUp: (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') setReset(null);
    },
    onBlur: () => setReset(null),
  });

  const led = `111${bits(cnt ^ 0b111)}`;
  const activeGroup = reset ?? 'tick';

  return (
    <div ref={rootRef} className="oc">
      <div className="oc-top">
        <span>FIRST BLINK · THE GUIDE’S ODD COUNTER</span>
        <em>Q0⁺ = 1 · Q1⁺ = Q1′ · Q2⁺ = Q2 ⊕ Q1</em>
      </div>

      <div className="oc-grid">
        <div className="oc-board">
          <div className="oc-clock">
            <div className="oc-clock__label">
              CLOCK DIVIDER <b>div</b>
              <span>
                <span ref={divRef}>0</span> / {(HALF_SEC - 1).toLocaleString()}
              </span>
            </div>
            <div className="oc-clock__bar">
              <span ref={barRef} />
            </div>
            <p>
              At 27 MHz, counting to 13,500,000 takes half a second. When <code>div</code> reaches the top, <code>tick</code>{' '}
              pulses high for one clock and the counter steps.
            </p>
          </div>

          <div className="oc-leds" aria-label={`LEDs showing ${cnt}`}>
            {Array.from({ length: 6 }, (_, index) => {
              const position = 5 - index;
              const on = led[index] === '0';
              return (
                <div key={position} className="oc-led">
                  <span className={`oc-led__lamp ${on ? 'oc-led__lamp--on' : ''} ${position > 2 ? 'oc-led__lamp--idle' : ''}`} />
                  <em>{position}</em>
                </div>
              );
            })}
          </div>

          <div className="oc-readout">
            <div>
              <span>cnt (Q2 Q1 Q0)</span>
              <strong key={`${cnt}-${flash}`} className="oc-pop">
                {bits(cnt)}
              </strong>
            </div>
            <div>
              <span>DECIMAL</span>
              <strong key={`d-${cnt}-${flash}`} className="oc-pop">
                {cnt}
              </strong>
            </div>
            <div>
              <span>led(5..0)</span>
              <strong className="oc-led-vec">{led}</strong>
            </div>
          </div>

          <div className="oc-seq" aria-hidden="true">
            {[1, 3, 5, 7].map((value) => (
              <span key={value} className={cnt === value ? 'oc-seq--on' : ''}>
                {value}
              </span>
            ))}
            <i>↺</i>
          </div>

          <div className="oc-controls">
            <button type="button" className="oc-btn" onClick={() => setRunning((value) => !value)}>
              {running ? '❚❚ PAUSE CLOCK' : '▶ RUN CLOCK'}
            </button>
            <button type="button" className="oc-btn" onClick={step} disabled={running}>
              STEP ▸
            </button>
            <button type="button" className={`oc-btn oc-btn--reset ${reset === 'rst0' ? 'oc-btn--held' : ''}`} {...holdProps('rst0')}>
              HOLD S1 · rst0
            </button>
            <button type="button" className={`oc-btn oc-btn--reset ${reset === 'rst4' ? 'oc-btn--held' : ''}`} {...holdProps('rst4')}>
              HOLD S2 · rst4
            </button>
          </div>
        </div>

        <pre className="oc-code" aria-label="VHDL for the counter process">
          {CODE.map((line, index) => {
            const hot = line.group === 'led' || (line.group && line.group === activeGroup);
            return (
              <span
                key={`${index}-${line.group === 'tick' ? flash : 0}`}
                className={`oc-line ${hot ? 'oc-line--hot' : ''} ${line.group === 'tick' && !reset && flash > 0 ? 'oc-line--flash' : ''}`}
              >
                <i>{String(index + 1).padStart(2, '0')}</i>
                {line.text || ' '}
              </span>
            );
          })}
        </pre>
      </div>

      <p className="oc-note">
        <span>WHY IT WORKS</span>
        <span>
          Holding Q0 at 1 keeps every value odd while Q2 Q1 count through 00, 01, 10, 11. The resets are asynchronous:
          they sit in the sensitivity list and win before any clock edge, so the LEDs jump the instant you press. The
          board’s LEDs are active-low, which is why the last line inverts <code>cnt</code>.
        </span>
      </p>

      <style>{`
        .oc {
          font-family: 'Space Mono', monospace;
          border: 1px solid #1d4f83;
          background: linear-gradient(180deg, rgba(7, 13, 26, 0.96), rgba(4, 8, 18, 0.98));
          box-shadow: 0 0 0 3px rgba(5, 11, 23, 0.98), 0 0 36px rgba(4, 74, 148, 0.16);
          padding: 18px;
        }

        .oc code {
          padding: 0 4px;
          background: rgba(99, 246, 255, 0.08);
          color: #63f6ff;
          font-size: 0.95em;
        }

        .oc-top {
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

        .oc-top em {
          font-family: 'Space Mono', monospace;
          font-style: normal;
          font-size: 11px;
          letter-spacing: 0.5px;
          color: #ffb84d;
        }

        .oc-grid {
          display: grid;
          gap: 16px;
        }

        @media (min-width: 960px) {
          .oc-grid { grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); }
        }

        .oc-board {
          display: grid;
          gap: 14px;
          align-content: start;
        }

        .oc-clock__label {
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          gap: 8px;
          font-family: 'Orbitron', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.6px;
          color: #7e90ab;
        }

        .oc-clock__label b { color: #63f6ff; }

        .oc-clock__label > span {
          margin-left: auto;
          font-family: 'VT323', monospace;
          font-size: 22px;
          letter-spacing: 0;
          color: #fff4c8;
        }

        .oc-clock__bar {
          height: 8px;
          margin: 6px 0 8px;
          border: 1px solid #294f7d;
          background: #0b1830;
        }

        .oc-clock__bar span {
          display: block;
          height: 100%;
          width: 0;
          background: repeating-linear-gradient(90deg, #63f6ff 0 6px, #2bb5c0 6px 8px);
          box-shadow: 0 0 10px rgba(99, 246, 255, 0.5);
        }

        .oc-clock p {
          margin: 0;
          font-size: 12px;
          line-height: 1.6;
          color: #a7b4c9;
        }

        .oc-leds {
          display: flex;
          justify-content: center;
          gap: clamp(10px, 3vw, 22px);
          padding: 18px 10px 12px;
          border: 1px solid rgba(76, 255, 135, 0.3);
          background: #07120d;
        }

        .oc-led {
          display: grid;
          justify-items: center;
          gap: 6px;
        }

        .oc-led em {
          font-style: normal;
          font-size: 10px;
          font-weight: 700;
          color: #5f7390;
        }

        .oc-led__lamp {
          width: 22px;
          height: 30px;
          border: 2px solid #2a3a4f;
          background: #141c2a;
          transition: background 80ms linear, box-shadow 80ms linear;
        }

        .oc-led__lamp--on {
          border-color: #ffb84d;
          background: #ffd27a;
          box-shadow: 0 0 18px #ffb84d, 0 0 40px rgba(255, 184, 77, 0.45);
        }

        .oc-led__lamp--idle { opacity: 0.45; }

        .oc-readout {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
        }

        .oc-readout div {
          padding: 8px 10px;
          border: 1px solid rgba(41, 79, 125, 0.7);
          background: rgba(4, 9, 19, 0.9);
        }

        .oc-readout span {
          display: block;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1px;
          color: #5f7390;
        }

        .oc-readout strong {
          display: inline-block;
          font-family: 'VT323', monospace;
          font-size: 30px;
          font-weight: 400;
          line-height: 1.1;
          color: #fff;
        }

        .oc-readout .oc-led-vec { color: #ffb84d; font-size: 26px; }

        .oc-pop { animation: ocPop 260ms ease-out; }

        @keyframes ocPop {
          from { transform: scale(1.35); color: #4cff87; }
          to { transform: scale(1); }
        }

        .oc-seq {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'Press Start 2P', monospace;
          font-size: 12px;
        }

        .oc-seq span {
          display: grid;
          place-items: center;
          width: 34px;
          height: 34px;
          border: 1px solid #294f7d;
          color: #5f7390;
          transition: all 150ms ease;
        }

        .oc-seq .oc-seq--on {
          border-color: #FA4616;
          color: #fff;
          background: rgba(250, 70, 22, 0.18);
          box-shadow: 0 0 14px rgba(250, 70, 22, 0.45);
        }

        .oc-seq i {
          font-style: normal;
          color: #5f7390;
          font-family: 'Space Mono', monospace;
          font-size: 18px;
        }

        .oc-controls {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .oc-btn {
          padding: 8px 12px;
          border: 1px solid #294f7d;
          background: #07101d;
          color: #9cc9ff;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          touch-action: none;
          user-select: none;
          transition: border-color 150ms ease, background 150ms ease, color 150ms ease;
        }

        .oc-btn:hover:not(:disabled) { border-color: #63f6ff; color: #fff; }
        .oc-btn:disabled { opacity: 0.35; cursor: not-allowed; }

        .oc-btn--reset { border-color: rgba(255, 90, 110, 0.6); color: #ff8a98; }

        .oc-btn--held {
          border-color: #ff5a6e;
          background: rgba(255, 90, 110, 0.25);
          color: #fff;
          box-shadow: 0 0 14px rgba(255, 90, 110, 0.4);
        }

        .oc-code {
          margin: 0;
          padding: 12px 0;
          border: 1px solid rgba(41, 79, 125, 0.7);
          background: #040913;
          font-family: 'Space Mono', monospace;
          font-size: 12px;
          line-height: 1.75;
          color: #7e90ab;
          overflow-x: auto;
        }

        .oc-line {
          display: block;
          padding: 0 14px 0 0;
          white-space: pre;
          border-left: 3px solid transparent;
          transition: color 200ms ease, background 200ms ease;
        }

        .oc-line i {
          display: inline-block;
          width: 36px;
          padding-right: 10px;
          font-style: normal;
          text-align: right;
          color: #2c4466;
        }

        .oc-line--hot {
          border-left-color: #FA4616;
          background: rgba(250, 70, 22, 0.08);
          color: #fff;
        }

        .oc-line--flash { animation: ocFlash 450ms ease-out; }

        @keyframes ocFlash {
          from { background: rgba(76, 255, 135, 0.3); }
          to { background: rgba(250, 70, 22, 0.08); }
        }

        .oc-note {
          display: flex;
          flex-wrap: wrap;
          gap: 6px 12px;
          align-items: baseline;
          margin: 14px 0 0;
          padding: 10px 12px;
          border-left: 3px solid #4cff87;
          background: rgba(76, 255, 135, 0.05);
          font-size: 12px;
          line-height: 1.65;
          color: #d3dcea;
        }

        .oc-note > span:first-child {
          font-family: 'Orbitron', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.6px;
          color: #4cff87;
        }

        @media (max-width: 520px) {
          .oc-readout strong { font-size: 24px; }
          .oc-readout .oc-led-vec { font-size: 20px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .oc-pop, .oc-line--flash { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
