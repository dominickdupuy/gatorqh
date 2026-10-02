import { useEffect, useRef, useState } from 'react';

// Protocol from guide §10.1, default values from its worked example (§10.4).
const BAUD = 115_200;
const CLOCK_HZ = 27_000_000;
const BYTE_MS = 260;

type FieldId = 'index' | 'item1' | 'price1' | 'item2' | 'price2' | 'action1' | 'action2' | 'reserved';

const FIELD_META: Record<FieldId, { label: string; color: string }> = {
  index: { label: 'INDEX', color: '#fff4c8' },
  item1: { label: 'ITEM 1', color: '#FA4616' },
  price1: { label: 'PRICE 1', color: '#ffb38a' },
  action1: { label: 'ACTION 1', color: '#ffb38a' },
  item2: { label: 'ITEM 2', color: '#63f6ff' },
  price2: { label: 'PRICE 2', color: '#a8f0ff' },
  action2: { label: 'ACTION 2', color: '#a8f0ff' },
  reserved: { label: 'RESERVED', color: '#7e90ab' },
};

const REQUEST_LAYOUT: FieldId[] = ['index', 'index', 'item1', 'price1', 'price1', 'item2', 'price2', 'price2'];
const RESPONSE_LAYOUT: FieldId[] = ['index', 'index', 'item1', 'action1', 'item2', 'action2', 'reserved', 'reserved'];

export const ACTIONS = ['NONE', 'SELL', 'BUY'] as const;

const hex = (value: number) => value.toString(16).toUpperCase().padStart(2, '0');
const itemName = (id: number) => (id === 0x11 ? 'Item A' : id === 0x22 ? 'Item B' : 'not a valid item ID');
const clamp = (value: number, max: number) => Math.max(0, Math.min(max, Math.round(Number.isFinite(value) ? value : 0)));

type Phase = 'idle' | 'request' | 'compute' | 'response' | 'done';

export function PacketScope() {
  const [index, setIndex] = useState(16);
  const [item1, setItem1] = useState(0x11);
  const [price1, setPrice1] = useState(80);
  const [item2, setItem2] = useState(0x22);
  const [price2, setPrice2] = useState(200);
  const [action1, setAction1] = useState(1);
  const [action2, setAction2] = useState(2);
  const [selected, setSelected] = useState(2);
  const [hoverField, setHoverField] = useState<FieldId | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [sent, setSent] = useState(0);
  const [run, setRun] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  const request = [index >> 8, index & 255, item1, price1 >> 8, price1 & 255, item2, price2 >> 8, price2 & 255];
  const response = [index >> 8, index & 255, item1, action1, item2, action2, 0, 0];
  const all = [...request, ...response];
  const selectedByte = all[selected];
  const selectedField = selected < 8 ? REQUEST_LAYOUT[selected] : RESPONSE_LAYOUT[selected - 8];
  const frame = [0, ...Array.from({ length: 8 }, (_, bit) => (selectedByte >> bit) & 1), 1];

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRun((value) => value + 1);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (run === 0) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setSent(16);
      setPhase('done');
      return;
    }
    const timers: number[] = [];
    setSent(0);
    setPhase('request');
    for (let k = 1; k <= 8; k += 1) timers.push(window.setTimeout(() => setSent(k), k * BYTE_MS));
    timers.push(window.setTimeout(() => setPhase('compute'), 8 * BYTE_MS + 100));
    timers.push(window.setTimeout(() => setPhase('response'), 8 * BYTE_MS + 800));
    for (let k = 9; k <= 16; k += 1) timers.push(window.setTimeout(() => setSent(k), 8 * BYTE_MS + 800 + (k - 8) * BYTE_MS));
    timers.push(window.setTimeout(() => setPhase('done'), 16 * BYTE_MS + 900));
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [run]);

  const rxCount = Math.min(8, sent);
  const txCount = Math.max(0, sent - 8);

  const byteCell = (value: number, position: number, field: FieldId) => {
    const meta = FIELD_META[field];
    const delivered = position < sent;
    return (
      <button
        key={position}
        type="button"
        className={`ps-byte ${selected === position ? 'ps-byte--sel' : ''} ${hoverField === field ? 'ps-byte--hover' : ''} ${delivered ? 'ps-byte--sent' : ''}`}
        style={{ ['--c' as string]: meta.color }}
        onClick={() => setSelected(position)}
        onMouseEnter={() => setHoverField(field)}
        onMouseLeave={() => setHoverField(null)}
        onFocus={() => setHoverField(field)}
        onBlur={() => setHoverField(null)}
        aria-label={`Byte ${position % 8}: 0x${hex(value)}, ${meta.label}`}
      >
        {hex(value)}
      </button>
    );
  };

  const fieldLabels = (layout: FieldId[]) => {
    const groups: { field: FieldId; span: number }[] = [];
    layout.forEach((field) => {
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.field === field) lastGroup.span += 1;
      else groups.push({ field, span: 1 });
    });
    return groups.map((group, position) => (
      <span
        key={`${group.field}-${position}`}
        className={`ps-field ${hoverField === group.field ? 'ps-field--on' : ''}`}
        style={{ gridColumn: `span ${group.span}`, ['--c' as string]: FIELD_META[group.field].color }}
      >
        {FIELD_META[group.field].label}
        <em>{group.span} B</em>
      </span>
    ));
  };

  const decode: { field: FieldId; bytes: string; text: string }[] = [
    { field: 'index', bytes: `${hex(index >> 8)} ${hex(index & 255)}`, text: `= ${index}: packet index, echoed back` },
    { field: 'item1', bytes: hex(item1), text: `= ${item1}: ${itemName(item1)} in slot 1` },
    { field: 'price1', bytes: `${hex(price1 >> 8)} ${hex(price1 & 255)}`, text: `= ${price1}: its price` },
    { field: 'item2', bytes: hex(item2), text: `= ${item2}: ${itemName(item2)} in slot 2` },
    { field: 'price2', bytes: `${hex(price2 >> 8)} ${hex(price2 & 255)}`, text: `= ${price2}: its price` },
  ];

  const bitUs = 1e6 / BAUD;

  return (
    <div ref={rootRef} className="ps">
      <div className="ps-top">
        <span>PACKET SCOPE · ONE ROUND TRIP</span>
        <em>WORKED EXAMPLE FROM THE GUIDE · EDIT ANY FIELD</em>
      </div>

      <div className="ps-wire" aria-hidden="true">
        <div className="ps-node">
          <b>JUDGE PC</b>
          <span>COM PORT</span>
        </div>
        <div className="ps-lane">
          <div className="ps-lane__track" />
          {phase === 'request' && sent > 0 && sent <= 8 && (
            <span key={`rq-${sent}`} className="ps-flyer ps-flyer--right" style={{ ['--c' as string]: FIELD_META[REQUEST_LAYOUT[sent - 1]].color }}>
              {hex(request[sent - 1])}
            </span>
          )}
          {phase === 'response' && sent > 8 && (
            <span key={`rs-${sent}`} className="ps-flyer ps-flyer--left" style={{ ['--c' as string]: FIELD_META[RESPONSE_LAYOUT[sent - 9]].color }}>
              {hex(response[sent - 9])}
            </span>
          )}
          <span className="ps-lane__label">
            {phase === 'idle' && 'STANDBY'}
            {phase === 'request' && `REQUEST · ${rxCount}/8 BYTES IN`}
            {phase === 'compute' && 'ALL 8 IN · CORE THINKING'}
            {phase === 'response' && `RESPONSE · ${txCount}/8 BYTES OUT`}
            {phase === 'done' && 'ONE REQUEST · ONE RESPONSE ✓'}
          </span>
        </div>
        <div className={`ps-node ps-node--fpga ${phase === 'compute' ? 'ps-node--busy' : ''}`}>
          <b>FPGA</b>
          <span>RX {rxCount}/8</span>
        </div>
      </div>

      <div className="ps-packets">
        <div className="ps-packet">
          <div className="ps-packet__head">
            <span>REQUEST · JUDGE → FPGA</span>
            <em>8 BYTES · MOST SIGNIFICANT BYTE FIRST</em>
          </div>
          <div className="ps-bytes">{request.map((value, position) => byteCell(value, position, REQUEST_LAYOUT[position]))}</div>
          <div className="ps-fields">{fieldLabels(REQUEST_LAYOUT)}</div>
        </div>
        <div className="ps-packet">
          <div className="ps-packet__head">
            <span>RESPONSE · FPGA → JUDGE</span>
            <em>ECHO INDEX + ITEMS · RESERVED = 0x0000</em>
          </div>
          <div className="ps-bytes">{response.map((value, position) => byteCell(value, position + 8, RESPONSE_LAYOUT[position]))}</div>
          <div className="ps-fields">{fieldLabels(RESPONSE_LAYOUT)}</div>
        </div>
      </div>

      <div className="ps-lower">
        <div className="ps-edit">
          <div className="ps-edit__grid">
            <label>
              INDEX
              <input type="number" min={0} max={99} value={index} onChange={(event) => setIndex(clamp(Number(event.target.value), 65535))} />
            </label>
            <label>
              ITEM 1 <em>0x{hex(item1)}</em>
              <input type="number" min={0} max={255} value={item1} onChange={(event) => setItem1(clamp(Number(event.target.value), 255))} />
            </label>
            <label>
              PRICE 1
              <input type="number" min={0} max={65535} value={price1} onChange={(event) => setPrice1(clamp(Number(event.target.value), 65535))} />
            </label>
            <label>
              ITEM 2 <em>0x{hex(item2)}</em>
              <input type="number" min={0} max={255} value={item2} onChange={(event) => setItem2(clamp(Number(event.target.value), 255))} />
            </label>
            <label>
              PRICE 2
              <input type="number" min={0} max={65535} value={price2} onChange={(event) => setPrice2(clamp(Number(event.target.value), 65535))} />
            </label>
          </div>
          <div className="ps-actions">
            {[
              { label: 'ACTION 1', value: action1, set: setAction1 },
              { label: 'ACTION 2', value: action2, set: setAction2 },
            ].map((row) => (
              <div key={row.label} className="ps-actions__row" role="group" aria-label={row.label}>
                <span>{row.label}</span>
                {ACTIONS.map((name, code) => (
                  <button
                    key={name}
                    type="button"
                    className={`ps-action ps-action--${name.toLowerCase()} ${row.value === code ? 'ps-action--on' : ''}`}
                    onClick={() => row.set(code)}
                    aria-pressed={row.value === code}
                  >
                    {name} <em>0x{hex(code)}</em>
                  </button>
                ))}
              </div>
            ))}
          </div>
          <ul className="ps-decode">
            {decode.map((row) => (
              <li key={row.field} className={hoverField === row.field ? 'ps-decode--on' : ''} style={{ ['--c' as string]: FIELD_META[row.field].color }}>
                <b>{row.bytes}</b> {row.text}
              </li>
            ))}
          </ul>
          <button type="button" className="ps-send" onClick={() => setRun((value) => value + 1)}>
            ▶ TRANSMIT AGAIN <em>SLOWED ABOUT 3,000×</em>
          </button>
        </div>

        <div className="ps-uart">
          <div className="ps-uart__head">
            <span>UART FRAME · BYTE {selected % 8} OF THE {selected < 8 ? 'REQUEST' : 'RESPONSE'}</span>
            <strong style={{ color: FIELD_META[selectedField].color }}>
              0x{hex(selectedByte)} = {selectedByte.toString(2).padStart(8, '0')}
            </strong>
          </div>
          <svg key={`${selected}-${selectedByte}`} viewBox="0 0 520 150" className="ps-wave" role="img" aria-label={`UART frame for 0x${hex(selectedByte)}: start bit, data bits least significant first ${frame.slice(1, 9).join(' ')}, stop bit.`}>
            {frame.map((bit, position) => {
              const x = 40 + position * 44;
              const isData = position > 0 && position < 9;
              return (
                <g key={position}>
                  <rect x={x} y={20} width={44} height={88} className={`ps-cell ${isData ? 'ps-cell--data' : ''}`} style={{ ['--c' as string]: FIELD_META[selectedField].color }} />
                  <text x={x + 22} y={14} className="ps-bit">
                    {bit}
                  </text>
                  <text x={x + 22} y={126} className="ps-bit-label">
                    {position === 0 ? 'START' : position === 9 ? 'STOP' : `D${position - 1}`}
                  </text>
                </g>
              );
            })}
            <path
              className="ps-trace"
              d={(() => {
                const level = (bit: number) => (bit ? 36 : 92);
                let d = `M 0 ${level(1)} H 40`;
                frame.forEach((bit, position) => {
                  const x = 40 + position * 44;
                  d += ` V ${level(bit)} H ${x + 44}`;
                });
                d += ` V ${level(1)} H 520`;
                return d;
              })()}
            />
            <text x={4} y={30} className="ps-axis">1</text>
            <text x={4} y={98} className="ps-axis">0</text>
            <text x={20} y={146} className="ps-axis">IDLE</text>
            <text x={492} y={146} className="ps-axis">IDLE</text>
            <rect x={40} y={20} width={2} height={88} className="ps-cursor" />
          </svg>
          <div className="ps-timing">
            <div>
              <b>{bitUs.toFixed(2)} µs</b>
              <span>PER BIT · {(CLOCK_HZ / BAUD).toFixed(1)} CLOCKS</span>
            </div>
            <div>
              <b>{(bitUs * 10).toFixed(1)} µs</b>
              <span>PER BYTE · 10 BITS ON THE WIRE</span>
            </div>
            <div>
              <b>{((bitUs * 80) / 1000).toFixed(3)} ms</b>
              <span>PER 8-BYTE PACKET</span>
            </div>
          </div>
        </div>
      </div>

      <p className="ps-note">
        <span>TWO BYTE ORDERS</span>
        Across the packet, the most significant byte goes first, so price 200 is sent as 00 then C8. Inside each byte on
        the wire, the least significant bit goes first. Mixing these up is the classic first bug.
      </p>

      <style>{`
        .ps {
          font-family: 'Space Mono', monospace;
          border: 1px solid #1d4f83;
          background: linear-gradient(180deg, rgba(7, 13, 26, 0.96), rgba(4, 8, 18, 0.98));
          box-shadow: 0 0 0 3px rgba(5, 11, 23, 0.98), 0 0 36px rgba(4, 74, 148, 0.16);
          padding: 18px;
        }

        .ps-top {
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

        .ps-top em {
          font-style: normal;
          font-size: 9px;
          letter-spacing: 1.4px;
          color: #63f6ff;
        }

        .ps-wire {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
        }

        .ps-node {
          display: grid;
          gap: 2px;
          min-width: 92px;
          padding: 8px 10px;
          border: 1px solid #294f7d;
          background: #07101d;
          text-align: center;
        }

        .ps-node b {
          font-family: 'Orbitron', sans-serif;
          font-size: 11px;
          letter-spacing: 1.5px;
          color: #fff;
        }

        .ps-node span {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1px;
          color: #7e90ab;
        }

        .ps-node--fpga { border-color: rgba(250, 70, 22, 0.6); }
        .ps-node--fpga span { color: #ffb38a; }

        .ps-node--busy {
          animation: psBusy 0.25s step-end infinite;
        }

        @keyframes psBusy {
          50% { box-shadow: 0 0 18px rgba(250, 70, 22, 0.6); border-color: #FA4616; }
        }

        .ps-lane {
          position: relative;
          height: 52px;
          overflow: hidden;
        }

        .ps-lane__track {
          position: absolute;
          left: 0;
          right: 0;
          top: 20px;
          height: 2px;
          background: repeating-linear-gradient(90deg, #294f7d 0 6px, transparent 6px 10px);
        }

        .ps-lane__label {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          text-align: center;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.3px;
          color: #9cc9ff;
        }

        .ps-flyer {
          position: absolute;
          top: 9px;
          padding: 2px 5px;
          border: 1px solid var(--c);
          background: #02040a;
          color: var(--c);
          font-family: 'VT323', monospace;
          font-size: 18px;
          line-height: 1;
          box-shadow: 0 0 10px var(--c);
        }

        .ps-flyer--right { animation: psRight ${BYTE_MS}ms linear forwards; }
        .ps-flyer--left { animation: psLeft ${BYTE_MS}ms linear forwards; }

        @keyframes psRight {
          from { left: 0; }
          to { left: calc(100% - 28px); }
        }

        @keyframes psLeft {
          from { left: calc(100% - 28px); }
          to { left: 0; }
        }

        .ps-packets {
          display: grid;
          gap: 14px;
        }

        @media (min-width: 900px) {
          .ps-packets { grid-template-columns: 1fr 1fr; }
        }

        .ps-packet__head {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          gap: 2px 10px;
          margin-bottom: 8px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.2px;
          color: #fff;
        }

        .ps-packet__head em {
          font-style: normal;
          font-size: 9px;
          color: #5f7390;
        }

        .ps-bytes,
        .ps-fields {
          display: grid;
          grid-template-columns: repeat(8, minmax(0, 1fr));
          gap: 4px;
        }

        .ps-byte {
          padding: 8px 0;
          border: 1px solid color-mix(in srgb, var(--c) 45%, transparent);
          background: color-mix(in srgb, var(--c) 7%, #050a14);
          color: color-mix(in srgb, var(--c) 45%, #3a4a60);
          font-family: 'VT323', monospace;
          font-size: clamp(20px, 2.4vw, 28px);
          line-height: 1;
          transition: color 200ms ease, border-color 200ms ease, box-shadow 200ms ease, transform 150ms ease;
        }

        .ps-byte--sent { color: var(--c); }
        .ps-byte:hover { transform: translateY(-2px); }

        .ps-byte--hover {
          border-color: var(--c);
          box-shadow: 0 0 12px color-mix(in srgb, var(--c) 45%, transparent);
        }

        .ps-byte--sel {
          border: 2px solid #fff;
          color: #fff;
          box-shadow: 0 0 14px color-mix(in srgb, var(--c) 70%, transparent);
        }

        .ps-fields { margin-top: 4px; }

        .ps-field {
          padding: 4px 0 0;
          border-top: 2px solid var(--c);
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.8px;
          color: var(--c);
          text-align: center;
          opacity: 0.75;
          transition: opacity 150ms ease;
        }

        .ps-field em {
          display: block;
          font-style: normal;
          color: #5f7390;
        }

        .ps-field--on { opacity: 1; }

        .ps-lower {
          display: grid;
          gap: 16px;
          margin-top: 18px;
        }

        @media (min-width: 1000px) {
          .ps-lower { grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr); }
        }

        .ps-edit__grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(92px, 1fr));
          gap: 8px;
        }

        .ps-edit label {
          display: grid;
          gap: 4px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.2px;
          color: #7e90ab;
        }

        .ps-edit label em {
          font-style: normal;
          color: #63f6ff;
        }

        .ps-edit input {
          width: 100%;
          padding: 6px 8px;
          border: 1px solid #294f7d;
          background: #040913;
          color: #fff4c8;
          font-family: 'VT323', monospace;
          font-size: 22px;
          outline: none;
        }

        .ps-edit input:focus { border-color: #FA4616; }

        .ps-actions {
          display: grid;
          gap: 6px;
          margin: 12px 0;
        }

        .ps-actions__row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px;
        }

        .ps-actions__row > span {
          width: 72px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.2px;
          color: #7e90ab;
        }

        .ps-action {
          padding: 5px 9px;
          border: 1px solid #294f7d;
          background: #07101d;
          color: #7e90ab;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1px;
        }

        .ps-action em { font-style: normal; opacity: 0.6; }
        .ps-action--none.ps-action--on { border-color: #9cc9ff; color: #02040a; background: #9cc9ff; }
        .ps-action--sell.ps-action--on { border-color: #ff5a6e; color: #02040a; background: #ff5a6e; }
        .ps-action--buy.ps-action--on { border-color: #4cff87; color: #02040a; background: #4cff87; }

        .ps-decode {
          display: grid;
          gap: 4px;
          margin: 0 0 12px;
          padding: 0;
          list-style: none;
        }

        .ps-decode li {
          padding: 3px 8px;
          border-left: 2px solid color-mix(in srgb, var(--c) 40%, transparent);
          font-size: 12px;
          color: #a7b4c9;
          transition: background 150ms ease, border-color 150ms ease;
        }

        .ps-decode b {
          font-family: 'VT323', monospace;
          font-size: 18px;
          font-weight: 400;
          color: var(--c);
        }

        .ps-decode .ps-decode--on {
          border-color: var(--c);
          background: color-mix(in srgb, var(--c) 10%, transparent);
          color: #fff;
        }

        .ps-send {
          padding: 8px 12px;
          border: 1px solid #FA4616;
          background: rgba(250, 70, 22, 0.12);
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
        }

        .ps-send em {
          margin-left: 6px;
          font-style: normal;
          font-size: 9px;
          color: #ffb38a;
        }

        .ps-send:hover { box-shadow: 0 0 16px rgba(250, 70, 22, 0.4); }

        .ps-uart {
          padding: 14px;
          border: 1px solid rgba(99, 246, 255, 0.35);
          background: #040913;
        }

        .ps-uart__head {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: baseline;
          gap: 4px 12px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.2px;
          color: #7e90ab;
        }

        .ps-uart__head strong {
          font-family: 'VT323', monospace;
          font-size: 24px;
          font-weight: 400;
          letter-spacing: 1px;
        }

        .ps-wave {
          display: block;
          width: 100%;
          height: auto;
          margin: 8px 0 10px;
          overflow: visible;
        }

        .ps-cell {
          fill: transparent;
          stroke: rgba(41, 79, 125, 0.55);
          stroke-dasharray: 2 4;
        }

        .ps-cell--data { fill: color-mix(in srgb, var(--c) 6%, transparent); }

        .ps-bit {
          fill: #fff;
          font-family: 'VT323', monospace;
          font-size: 18px;
          text-anchor: middle;
        }

        .ps-bit-label {
          fill: #5f7390;
          font-size: 10px;
          font-weight: 700;
          text-anchor: middle;
        }

        .ps-axis { fill: #3d5577; font-size: 9px; font-weight: 700; }

        .ps-trace {
          fill: none;
          stroke: #4cff87;
          stroke-width: 2.5;
          filter: drop-shadow(0 0 4px rgba(76, 255, 135, 0.8));
          stroke-dasharray: 1400;
          animation: psDraw 1.4s ease-out both;
        }

        @keyframes psDraw {
          from { stroke-dashoffset: 1400; }
          to { stroke-dashoffset: 0; }
        }

        .ps-cursor {
          fill: #FA4616;
          opacity: 0.8;
          animation: psSweep 2.4s linear infinite;
        }

        @keyframes psSweep {
          from { transform: translateX(0); }
          to { transform: translateX(440px); }
        }

        .ps-timing {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
        }

        .ps-timing div {
          padding: 8px;
          border: 1px solid rgba(41, 79, 125, 0.6);
        }

        .ps-timing b {
          display: block;
          font-family: 'VT323', monospace;
          font-size: 24px;
          font-weight: 400;
          color: #fff4c8;
        }

        .ps-timing span {
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 1px;
          color: #7e90ab;
        }

        .ps-note {
          display: flex;
          flex-wrap: wrap;
          gap: 6px 12px;
          align-items: baseline;
          margin: 16px 0 0;
          padding: 10px 12px;
          border-left: 3px solid #ffb84d;
          background: rgba(255, 184, 77, 0.06);
          font-size: 12px;
          line-height: 1.65;
          color: #d3dcea;
        }

        .ps-note span {
          font-family: 'Orbitron', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.6px;
          color: #ffb84d;
        }

        @media (max-width: 560px) {
          .ps-wire { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
          .ps-lane { grid-column: 1 / -1; grid-row: 2; }
          .ps-field { font-size: 0; }
          .ps-field em { font-size: 8px; }
          .ps-timing b { font-size: 18px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .ps-trace, .ps-cursor, .ps-flyer, .ps-node--busy { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
