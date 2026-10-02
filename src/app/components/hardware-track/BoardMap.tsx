import { useState, type KeyboardEvent } from 'react';

type PartId = 'usb' | 'bl616' | 'fpga' | 'clock' | 'reset' | 'leds' | 'uart';

type Part = {
  id: PartId;
  name: string;
  tag: string;
  detail: string;
  pins?: string[];
};

// Pin numbers and comments come straight from the guide's supplied mappings (§9).
export const PIN_MAP = [
  { name: 'sys_clk', pin: '4', comment: 'On-board 27 MHz clock', part: 'clock' as PartId },
  { name: 'reset_btn', pin: '87', comment: 'User reset button; pull-down (optional)', part: 'reset' as PartId },
  { name: 'uart_rx_i', pin: '70', comment: 'BL616 → FPGA (UART input)', part: 'uart' as PartId },
  { name: 'uart_tx_o', pin: '69', comment: 'FPGA → BL616 (UART output)', part: 'uart' as PartId },
  { name: 'led0_n', pin: '15', comment: 'Active-low status LED (optional)', part: 'leds' as PartId },
  { name: 'led1_n', pin: '16', comment: 'Active-low status LED (optional)', part: 'leds' as PartId },
];

const PARTS: Part[] = [
  {
    id: 'fpga',
    name: 'GW2AR-18 FPGA',
    tag: 'THE CHIP YOU PROGRAM',
    detail:
      'Part GW2AR-LV18QN88C8/I7: series GW2AR, package QFN88, device GW2AR-18, version C. Your VHDL becomes real wiring inside this chip.',
  },
  {
    id: 'clock',
    name: '27 MHz CLOCK',
    tag: 'sys_clk · PIN 4',
    detail: 'Everything sequential in your design steps on this clock: 27 million rising edges a second, one every 37 ns. You may swap in a different internal clock signal.',
    pins: ['sys_clk'],
  },
  {
    id: 'uart',
    name: 'UART LINK',
    tag: 'uart_rx_i · 70 / uart_tx_o · 69',
    detail:
      'The serial lines between the FPGA and the BL616. The judge’s packets arrive on uart_rx_i and your responses leave on uart_tx_o. The port names are fixed by the .cst.',
    pins: ['uart_rx_i', 'uart_tx_o'],
  },
  {
    id: 'bl616',
    name: 'BL616 BRIDGE',
    tag: 'ONBOARD DEBUGGER',
    detail:
      'Turns USB into JTAG for programming and into UART for the PC. It can drop or corrupt bytes sent back-to-back, so leave idle time between response bytes. Ask an organizer before changing its firmware or your Windows USB drivers.',
  },
  {
    id: 'usb',
    name: 'USB-C PORT',
    tag: 'POWER · PROGRAM · SERIAL',
    detail:
      'Use a data-capable USB-C cable plugged straight into your computer, not through a hub. The board shows up as a “USBJTAG/serial device”.',
  },
  {
    id: 'reset',
    name: 'RESET BUTTON',
    tag: 'reset_btn · PIN 87',
    detail: 'An optional user reset button with a pull-down. Judges do not press it: index 0 starts a new session, so your design must clear its own state.',
    pins: ['reset_btn'],
  },
  {
    id: 'leds',
    name: 'STATUS LEDS',
    tag: 'led0_n · led1_n',
    detail: 'Optional status LEDs on pins 15 and 16. They are active-low: drive a 0 to light one. If you don’t use them, keep the ports and drive them high.',
    pins: ['led0_n', 'led1_n'],
  },
];

export function BoardMap() {
  const [active, setActive] = useState<PartId>('fpga');
  const part = PARTS.find((item) => item.id === active) ?? PARTS[0];

  const hotspot = (id: PartId) => ({
    className: `bm-hot ${active === id ? 'bm-hot--on' : ''}`,
    tabIndex: 0,
    role: 'button',
    'aria-label': PARTS.find((item) => item.id === id)?.name,
    'aria-pressed': active === id,
    onMouseEnter: () => setActive(id),
    onFocus: () => setActive(id),
    onClick: () => setActive(id),
    onKeyDown: (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setActive(id);
      }
    },
  });

  return (
    <div className="bm">
      <div className="bm-top">
        <span>TANG NANO 20K · FIELD MAP</span>
        <em>STYLIZED · NOT TO SCALE · HOVER OR TAP A PART</em>
      </div>

      <div className="bm-grid">
        <svg viewBox="0 0 640 270" className="bm-svg">
          <defs>
            <pattern id="bmWeave" width="8" height="8" patternUnits="userSpaceOnUse">
              <path d="M0 8 L8 0" stroke="rgba(76,255,135,0.05)" strokeWidth="1" />
            </pattern>
          </defs>

          <rect x="24" y="34" width="592" height="200" rx="10" className="bm-pcb" />
          <rect x="24" y="34" width="592" height="200" rx="10" fill="url(#bmWeave)" />

          {/* Header pins along both long edges */}
          {Array.from({ length: 26 }, (_, index) => (
            <g key={index}>
              <rect x={74 + index * 20} y={40} width="9" height="9" className="bm-header" />
              <rect x={74 + index * 20} y={220} width="9" height="9" className="bm-header" />
            </g>
          ))}

          {/* Board traces */}
          <path d="M70 134 H150" className="bm-trace" />
          <path d="M220 120 H272" className="bm-trace" />
          <path d="M248 88 V108 H272" className="bm-trace" />
          <path d="M392 150 H450 V168" className="bm-trace" />
          <path d="M392 120 H520" className="bm-trace" />

          <g {...hotspot('usb')}>
            <rect x="16" y="112" width="52" height="44" rx="6" className="bm-part bm-part--usb" />
            <rect x="26" y="126" width="32" height="16" rx="6" className="bm-usb-slot" />
            <text x="42" y="174" className="bm-label">USB-C</text>
          </g>

          <g {...hotspot('bl616')}>
            <rect x="150" y="102" width="70" height="62" className="bm-part" />
            <circle cx="160" cy="112" r="3" className="bm-dot" />
            <text x="185" y="138" className="bm-chip-text">BL616</text>
            <text x="185" y="182" className="bm-label">BRIDGE</text>
          </g>

          <g {...hotspot('uart')}>
            <path d="M220 146 H272" className="bm-uart" />
            <path d="M220 146 H272" className="bm-uart-flow" />
            <text x="246" y="162" className="bm-label bm-label--small">UART</text>
          </g>

          <g {...hotspot('fpga')}>
            <rect x="272" y="74" width="120" height="120" className="bm-part bm-part--fpga" />
            {Array.from({ length: 10 }, (_, index) => (
              <g key={index}>
                <rect x={280 + index * 11} y={68} width="5" height="6" className="bm-pin" />
                <rect x={280 + index * 11} y={194} width="5" height="6" className="bm-pin" />
                <rect x={266} y={82 + index * 11} width="6" height="5" className="bm-pin" />
                <rect x={392} y={82 + index * 11} width="6" height="5" className="bm-pin" />
              </g>
            ))}
            <circle cx="284" cy="86" r="3.5" className="bm-dot bm-dot--orange" />
            <text x="332" y="130" className="bm-chip-text bm-chip-text--big">GW2AR-18</text>
            <text x="332" y="148" className="bm-chip-sub">QFN88 · GOWIN</text>
          </g>

          <g {...hotspot('clock')}>
            <rect x="232" y="64" width="32" height="22" rx="4" className="bm-part bm-part--xtal" />
            <circle cx="248" cy="75" r="14" className="bm-ring" />
            <text x="248" y="58" className="bm-label bm-label--small">27 MHz</text>
          </g>

          <g {...hotspot('reset')}>
            <rect x="436" y="168" width="28" height="28" className="bm-part" />
            <circle cx="450" cy="182" r="8" className="bm-button" />
            <text x="450" y="210" className="bm-label bm-label--small">RESET</text>
          </g>

          <g {...hotspot('leds')}>
            {Array.from({ length: 6 }, (_, index) => (
              <rect
                key={index}
                x={520 + index * 13}
                y={112}
                width="8"
                height="14"
                className={`bm-led ${index < 2 ? 'bm-led--status' : ''}`}
                style={{ animationDelay: `${index * 0.35}s` }}
              />
            ))}
            <text x="553" y="146" className="bm-label bm-label--small">LEDS</text>
          </g>
        </svg>

        <div className="bm-info" aria-live="polite">
          <div className="bm-info__tag">{part.tag}</div>
          <h4>{part.name}</h4>
          <p>{part.detail}</p>
          <table className="bm-table">
            <thead>
              <tr>
                <th>PORT</th>
                <th>PIN</th>
                <th>COMMENT</th>
              </tr>
            </thead>
            <tbody>
              {PIN_MAP.map((row) => (
                <tr key={row.name} className={part.pins?.includes(row.name) ? 'bm-row--on' : ''}>
                  <td>{row.name}</td>
                  <td>{row.pin}</td>
                  <td>{row.comment}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="bm-cst">SUPPLIED IN 19_tang_nano_20k.cst · PORT NAMES ARE FIXED: MATCH THEM EXACTLY</div>
        </div>
      </div>

      <style>{`
        .bm {
          font-family: 'Space Mono', monospace;
          border: 1px solid #1d4f83;
          background: linear-gradient(180deg, rgba(7, 13, 26, 0.96), rgba(4, 8, 18, 0.98));
          box-shadow: 0 0 0 3px rgba(5, 11, 23, 0.98), 0 0 36px rgba(4, 74, 148, 0.16);
          padding: 18px;
        }

        .bm-top {
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

        .bm-top em {
          font-style: normal;
          font-size: 9px;
          letter-spacing: 1.4px;
          color: #4cff87;
        }

        .bm-grid {
          display: grid;
          gap: 16px;
        }

        @media (min-width: 1000px) {
          .bm-grid { grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr); align-items: center; }
        }

        .bm-svg {
          width: 100%;
          height: auto;
          overflow: visible;
        }

        .bm-pcb {
          fill: #08130f;
          stroke: rgba(76, 255, 135, 0.35);
          stroke-width: 2;
        }

        .bm-header { fill: #1b2a22; stroke: rgba(255, 210, 122, 0.45); stroke-width: 1; }
        .bm-trace { fill: none; stroke: rgba(76, 255, 135, 0.28); stroke-width: 2; }

        .bm-hot { cursor: pointer; outline: none; }

        .bm-part {
          fill: #0c1424;
          stroke: #294f7d;
          stroke-width: 2;
          transition: stroke 200ms ease, filter 200ms ease;
        }

        .bm-part--fpga { fill: #0a0f1a; stroke: #9cc9ff; }
        .bm-part--usb { fill: #11192a; }
        .bm-part--xtal { fill: #1a2233; }

        .bm-hot:hover .bm-part,
        .bm-hot:focus-visible .bm-part,
        .bm-hot--on .bm-part {
          stroke: #FA4616;
          filter: drop-shadow(0 0 8px rgba(250, 70, 22, 0.7));
        }

        .bm-usb-slot { fill: #02040a; stroke: #7e90ab; stroke-width: 1.5; }
        .bm-pin { fill: rgba(200, 210, 225, 0.7); }
        .bm-dot { fill: #63f6ff; }
        .bm-dot--orange { fill: #FA4616; }

        .bm-chip-text {
          fill: #F4F4F4;
          font-family: 'Orbitron', sans-serif;
          font-size: 12px;
          font-weight: 700;
          text-anchor: middle;
          letter-spacing: 1px;
        }

        .bm-chip-text--big { font-size: 15px; }

        .bm-chip-sub {
          fill: #7e90ab;
          font-size: 9px;
          font-weight: 700;
          text-anchor: middle;
          letter-spacing: 1px;
        }

        .bm-label {
          fill: #9cc9ff;
          font-size: 10px;
          font-weight: 700;
          text-anchor: middle;
          letter-spacing: 1.2px;
        }

        .bm-label--small { font-size: 9px; }
        .bm-hot--on .bm-label { fill: #FA4616; }

        .bm-uart { stroke: #294f7d; stroke-width: 6; }
        .bm-hot--on .bm-uart { stroke: rgba(250, 70, 22, 0.45); }

        .bm-uart-flow {
          stroke: #4cff87;
          stroke-width: 2;
          stroke-dasharray: 3 9;
          animation: bmFlow 0.9s linear infinite;
        }

        @keyframes bmFlow { to { stroke-dashoffset: -24; } }

        .bm-ring {
          fill: none;
          stroke: #63f6ff;
          stroke-width: 1.5;
          transform-box: fill-box;
          transform-origin: center;
          animation: bmTick 1s ease-out infinite;
        }

        @keyframes bmTick {
          from { transform: scale(0.6); opacity: 0.9; }
          to { transform: scale(1.6); opacity: 0; }
        }

        .bm-button { fill: #2b3448; stroke: #7e90ab; stroke-width: 1.5; }

        .bm-led {
          fill: #1a2233;
          stroke: #4a5b75;
          stroke-width: 1;
        }

        .bm-led--status {
          animation: bmLed 2.1s step-end infinite;
        }

        @keyframes bmLed {
          0%, 100% { fill: #1a2233; filter: none; }
          50% { fill: #4cff87; filter: drop-shadow(0 0 6px #4cff87); }
        }

        .bm-info {
          padding: 16px;
          border: 1px solid rgba(250, 70, 22, 0.5);
          background: rgba(4, 9, 19, 0.9);
        }

        .bm-info__tag {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.4px;
          color: #4cff87;
        }

        .bm-info h4 {
          margin: 6px 0 8px;
          font-family: 'Orbitron', sans-serif;
          font-size: 20px;
          font-weight: 800;
          letter-spacing: 1.5px;
          color: #fff;
        }

        .bm-info p {
          margin: 0 0 14px;
          min-height: 66px;
          font-size: 12px;
          line-height: 1.65;
          color: #b8c4d6;
        }

        .bm-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
        }

        .bm-table th {
          text-align: left;
          font-size: 9px;
          letter-spacing: 1.2px;
          color: #5f7390;
          padding: 0 6px 6px;
          border-bottom: 1px solid rgba(41, 79, 125, 0.7);
        }

        .bm-table td {
          padding: 6px;
          color: #a7b4c9;
          border-bottom: 1px dashed rgba(41, 79, 125, 0.4);
          transition: color 200ms ease, background 200ms ease;
        }

        .bm-table td:first-child { color: #9cc9ff; font-weight: 700; }
        .bm-table td:nth-child(2) { font-family: 'VT323', monospace; font-size: 18px; color: #fff4c8; }

        .bm-table .bm-row--on td {
          background: rgba(250, 70, 22, 0.12);
          color: #fff;
        }

        .bm-cst {
          margin-top: 12px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.2px;
          color: #63f6ff;
        }

        @media (prefers-reduced-motion: reduce) {
          .bm-uart-flow, .bm-ring, .bm-led--status { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
