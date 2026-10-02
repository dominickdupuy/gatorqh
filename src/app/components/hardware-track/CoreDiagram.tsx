import { useEffect, useRef, useState, type ReactNode } from 'react';

// Blocks follow the guide's suggested starting point (§8). The guide leaves the
// internal structure to each team; only the external ports and protocol are fixed.
type BlockId =
  | 'top'
  | 'uartrx'
  | 'pktrx'
  | 'router'
  | 'engine'
  | 'window'
  | 'sum'
  | 'avg'
  | 'cross'
  | 'act'
  | 'builder'
  | 'pkttx'
  | 'uarttx'
  | 'cst'
  | 'quick'
  | 'robust';

const BLOCKS: { id: BlockId; label: string; kind: string; role: string }[] = [
  { id: 'top', label: 'TOP LEVEL', kind: 'YOUR DESIGN', role: 'Any name you like, set as Top Module/Entity in Gowin. Its ports must be exactly sys_clk, reset_btn, uart_rx_i, uart_tx_o, led0_n and led1_n, as in the .cst.' },
  { id: 'uartrx', label: 'UART RX', kind: 'YOUR DESIGN', role: 'Samples uart_rx_i at 115,200 baud (8N1, least significant bit first) and hands over one byte at a time.' },
  { id: 'pktrx', label: '8-BYTE PACKET RX', kind: 'YOUR DESIGN', role: 'Collects the 8 request bytes and only then signals that a packet is ready. Never respond before all 8 are in.' },
  { id: 'router', label: 'ITEM ROUTER', kind: 'YOUR DESIGN', role: 'Sends each slot’s price to the engine for its item ID (0x11 → A, 0x22 → B). The tester may put either item in either slot on any packet.' },
  { id: 'engine', label: 'MOVING-AVERAGE ENGINE × 2', kind: 'YOUR DESIGN · ONE PER ITEM', role: 'Completely independent state per item: the 16-price window, its sum, the previous price and the last action. Index 0 clears all of it.' },
  { id: 'window', label: '16-PRICE WINDOW', kind: 'INSIDE EACH ENGINE', role: 'The item’s last 16 prices. Indices 0–15 only fill it; from index 16 the oldest price falls out as the newest shifts in.' },
  { id: 'sum', label: 'ROLLING SUM · 20 BIT', kind: 'INSIDE EACH ENGINE', role: 'new_sum = old_sum − oldest + current. Sixteen 16-bit prices top out at 1,048,560, which fits in 20 bits.' },
  { id: 'avg', label: 'SUM >> 4', kind: 'INSIDE EACH ENGINE', role: 'The average is the sum shifted right 4 bits: floor division by 16, fraction discarded. Take it once before the slide (old) and once after (new).' },
  { id: 'cross', label: 'CROSSING DETECTOR', kind: 'INSIDE EACH ENGINE', role: 'BUY if previous ≤ old average and current > new average. SELL if previous ≥ old average and current < new average.' },
  { id: 'act', label: 'HELD ACTION', kind: 'INSIDE EACH ENGINE', role: 'Remembers the last action and repeats it when there is no crossing. It is NONE only before the item’s first crossing.' },
  { id: 'builder', label: 'OUTPUT PACKET BUILDER', kind: 'YOUR DESIGN', role: 'Echoes the index and both item IDs in the request’s slot order, adds the two action codes, and sets reserved to 0x0000.' },
  { id: 'pkttx', label: '8-BYTE PACKET TX', kind: 'YOUR DESIGN', role: 'Splits the response back into 8 bytes, most significant first, with idle time between bytes so the BL616 doesn’t drop any.' },
  { id: 'uarttx', label: 'UART TX', kind: 'YOUR DESIGN', role: 'Drives uart_tx_o one byte at a time: start bit, 8 data bits least significant first, stop bit.' },
  { id: 'cst', label: '19_tang_nano_20k.cst', kind: 'ORGANIZER FILE', role: 'The board pin mappings. Add it as the physical constraint file. Don’t recreate the pins in FloorPlanner.' },
  { id: 'quick', label: '21_quick_uart_test.py', kind: 'ORGANIZER FILE', role: 'Quick sanity test of basic communication and packet format. Run it first. Change only PORT.' },
  { id: 'robust', label: '22_robust_uart_test.py', kind: 'ORGANIZER FILE', role: 'Scoring-style test against a software reference model. Run it second, and keep the CSV it saves.' },
];

const BY_ID = Object.fromEntries(BLOCKS.map((block) => [block.id, block])) as Record<BlockId, (typeof BLOCKS)[number]>;
const SUPPLIED = new Set<BlockId>(['cst', 'quick', 'robust']);

const FLOW: { id: BlockId; status: string }[] = [
  { id: 'uartrx', status: 'BITS ARRIVE ON uart_rx_i' },
  { id: 'pktrx', status: 'EIGHT BYTES BECOME ONE REQUEST' },
  { id: 'router', status: 'EACH SLOT ROUTED BY ITEM ID' },
  { id: 'avg', status: 'OLD AVERAGE = OLD SUM >> 4' },
  { id: 'window', status: 'OLDEST PRICE OUT, CURRENT PRICE IN' },
  { id: 'sum', status: 'NEW SUM = OLD SUM − OLDEST + CURRENT' },
  { id: 'avg', status: 'NEW AVERAGE = NEW SUM >> 4' },
  { id: 'cross', status: 'PREVIOUS VS OLD AVG · CURRENT VS NEW AVG' },
  { id: 'act', status: 'ACTION HELD UNTIL THE NEXT CROSSING' },
  { id: 'builder', status: 'RESPONSE BUILT IN THE REQUEST’S SLOT ORDER' },
  { id: 'pkttx', status: 'SPLIT BACK INTO EIGHT BYTES' },
  { id: 'uarttx', status: 'BYTES LEAVE ON uart_tx_o, WITH IDLE GAPS' },
];

export function CoreDiagram() {
  const [selected, setSelected] = useState<BlockId>('router');
  const [stage, setStage] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = rootRef.current;
    if (!node || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let timer = 0;
    const observer = new IntersectionObserver(([entry]) => {
      window.clearInterval(timer);
      if (entry.isIntersecting) timer = window.setInterval(() => setStage((value) => (value + 1) % FLOW.length), 620);
    });
    observer.observe(node);
    return () => {
      window.clearInterval(timer);
      observer.disconnect();
    };
  }, []);

  const hot = FLOW[stage].id;
  const info = BY_ID[selected];

  // Plain render helpers rather than nested components, so the blocks are not
  // remounted every time the flow animation advances.
  const block = (id: BlockId, wide = false) => (
    <button
      key={id}
      type="button"
      className={`cd-block ${wide ? 'cd-block--wide' : ''} ${hot === id ? 'cd-block--hot' : ''} ${selected === id ? 'cd-block--sel' : ''} ${SUPPLIED.has(id) ? 'cd-block--supplied' : ''}`}
      onClick={() => setSelected(id)}
      onMouseEnter={() => setSelected(id)}
      onFocus={() => setSelected(id)}
    >
      {BY_ID[id].label}
    </button>
  );

  const box = (id: BlockId, children: ReactNode) => (
    <div key={id} className={`cd-box ${selected === id ? 'cd-box--sel' : ''}`}>
      <button type="button" className="cd-box__tab" onClick={() => setSelected(id)} onMouseEnter={() => setSelected(id)} onFocus={() => setSelected(id)}>
        {BY_ID[id].label}
      </button>
      {children}
    </div>
  );

  return (
    <div ref={rootRef} className="cd">
      <div className="cd-top">
        <span>THE CORE · A SUGGESTED BREAKDOWN</span>
        <em>THE GUIDE’S STARTING POINT · ORGANIZE YOUR HDL HOWEVER YOU LIKE</em>
      </div>

      <div className="cd-grid">
        <div className="cd-diagram">
          <div className="cd-status" aria-live="off">
            <i />
            {FLOW[stage].status}
          </div>
          {box(
            'top',
            <>
              <div className="cd-row">
                {block('uartrx')}
                <em className="cd-arrow">→</em>
                {block('pktrx')}
              </div>
              <em className="cd-arrow cd-arrow--down">↓</em>
              {block('router', true)}
              <em className="cd-arrow cd-arrow--down">↓</em>
              {box(
                'engine',
                <>
                  <div className="cd-row">
                    {block('window')}
                    {block('sum')}
                    {block('avg')}
                  </div>
                  <div className="cd-row">
                    {block('cross')}
                    <em className="cd-arrow">→</em>
                    {block('act')}
                  </div>
                </>
              )}
              <em className="cd-arrow cd-arrow--down">↓</em>
              {block('builder', true)}
              <em className="cd-arrow cd-arrow--down">↓</em>
              <div className="cd-row">
                {block('pkttx')}
                <em className="cd-arrow">→</em>
                {block('uarttx')}
              </div>
            </>
          )}
          <div className="cd-extras">
            <span>SUPPLIED</span>
            {block('cst')}
            {block('quick')}
            {block('robust')}
          </div>
        </div>

        <div className="cd-side">
          <div className="cd-info" aria-live="polite">
            <div className="cd-info__file">
              {info.kind}
              {SUPPLIED.has(selected) && <b>SUPPLIED</b>}
            </div>
            <h4>{info.label}</h4>
            <p>{info.role}</p>
          </div>
          <ol className="cd-order">
            <li className="cd-order__title">A VALID PROJECT ONLY NEEDS</li>
            <li>A synthesizable top-level entity/module, set as Top Module/Entity in Gowin</li>
            <li>The external ports and names from the supplied .cst</li>
            <li>The UART packet protocol, exactly</li>
            <li>The moving-average behavior, exactly</li>
          </ol>
        </div>
      </div>

      <style>{`
        .cd {
          font-family: 'Space Mono', monospace;
          border: 1px solid #1d4f83;
          background: linear-gradient(180deg, rgba(7, 13, 26, 0.96), rgba(4, 8, 18, 0.98));
          box-shadow: 0 0 0 3px rgba(5, 11, 23, 0.98), 0 0 36px rgba(4, 74, 148, 0.16);
          padding: 18px;
        }

        .cd-top {
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

        .cd-top em {
          font-style: normal;
          font-size: 9px;
          letter-spacing: 1.4px;
          color: #ffb84d;
        }

        .cd-grid {
          display: grid;
          gap: 16px;
        }

        @media (min-width: 1000px) {
          .cd-grid { grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr); }
        }

        .cd-status {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.3px;
          color: #4cff87;
        }

        .cd-status i {
          width: 8px;
          height: 8px;
          background: #4cff87;
          box-shadow: 0 0 8px #4cff87;
          animation: blink 0.6s step-end infinite;
        }

        .cd-box {
          position: relative;
          display: grid;
          justify-items: stretch;
          gap: 6px;
          padding: 26px 10px 10px;
          border: 1px solid rgba(99, 150, 220, 0.4);
          background: rgba(9, 20, 38, 0.35);
          transition: border-color 200ms ease, box-shadow 200ms ease;
        }

        .cd-box .cd-box { background: rgba(9, 20, 38, 0.55); }
        .cd-box--sel { border-color: #FA4616; box-shadow: inset 0 0 24px rgba(250, 70, 22, 0.1); }

        .cd-box__tab {
          position: absolute;
          left: 8px;
          top: 6px;
          display: inline-flex;
          gap: 6px;
          font-family: 'Orbitron', sans-serif;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.4px;
          color: #9cc9ff;
        }

        .cd-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .cd-arrow {
          font-style: normal;
          font-weight: 700;
          color: #3d5577;
          text-align: center;
        }

        .cd-block {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 10px;
          border: 1px solid #294f7d;
          background: #07101d;
          color: #c9d4e4;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1px;
          transition: border-color 160ms ease, background 160ms ease, box-shadow 160ms ease, color 160ms ease;
        }

        .cd-block--wide { justify-content: center; width: 100%; }

        .cd-block--supplied {
          border-style: dashed;
          border-color: rgba(76, 255, 135, 0.55);
          color: #a8ffc4;
          letter-spacing: 0.3px;
          text-transform: none;
        }

        .cd-block--hot {
          border-color: #4cff87;
          background: rgba(76, 255, 135, 0.14);
          color: #fff;
          box-shadow: 0 0 16px rgba(76, 255, 135, 0.45);
        }

        .cd-block--sel {
          border-color: #FA4616;
          box-shadow: 0 0 14px rgba(250, 70, 22, 0.45);
          color: #fff;
        }

        .cd-extras {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px;
          margin-top: 10px;
        }

        .cd-extras > span {
          font-family: 'Orbitron', sans-serif;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.4px;
          color: #4cff87;
        }

        .cd-side {
          display: grid;
          gap: 12px;
          align-content: start;
        }

        .cd-info {
          padding: 14px;
          border: 1px solid rgba(250, 70, 22, 0.5);
          background: rgba(4, 9, 19, 0.9);
        }

        .cd-info__file {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 700;
          color: #63f6ff;
        }

        .cd-info__file b {
          padding: 1px 6px;
          background: #4cff87;
          color: #02040a;
          font-size: 9px;
          letter-spacing: 1px;
        }

        .cd-info h4 {
          margin: 6px 0;
          font-family: 'Orbitron', sans-serif;
          font-size: 17px;
          font-weight: 800;
          letter-spacing: 1.5px;
          color: #fff;
        }

        .cd-info p {
          margin: 0;
          min-height: 60px;
          font-size: 12px;
          line-height: 1.65;
          color: #b8c4d6;
        }

        .cd-order {
          display: grid;
          gap: 6px;
          margin: 0;
          padding: 12px 14px;
          border: 1px solid rgba(41, 79, 125, 0.6);
          list-style: none;
          counter-reset: need;
        }

        .cd-order__title {
          margin-bottom: 2px;
          font-family: 'Orbitron', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2px;
          color: #FA4616;
        }

        .cd-order li:not(.cd-order__title) {
          position: relative;
          padding-left: 22px;
          font-size: 11px;
          line-height: 1.55;
          color: #b8c4d6;
          counter-increment: need;
        }

        .cd-order li:not(.cd-order__title)::before {
          content: counter(need);
          position: absolute;
          left: 0;
          color: #4cff87;
          font-weight: 700;
        }

        @media (max-width: 520px) {
          .cd-block { font-size: 9px; padding: 6px 7px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .cd-status i { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
