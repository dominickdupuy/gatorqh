import { useEffect, useRef, useState } from 'react';

// Thirty days: the lifetime of a packet created at hour 0.
const END_HOUR = 720;
const SWEEP_SECONDS = 9;

type Tone = 'cyan' | 'amber' | 'green' | 'red' | 'muted';

type Span = { row: number; start: number; end: number; label: string; tone: Tone; detail: string };
type Point = { row: number; hour: number; label: string; detail: string };

const ROWS = ['MAINTENANCE', 'YOUR INCIDENT · S2', 'EXAMPLE FUTURES', 'EXAMPLE PRICES'];
const INCIDENT_ROW = 1;

// The maintenance windows are fixed by the brief. Everything else here is the
// worked futures example, so the labels say so.
const SPANS: Span[] = [
  {
    row: 0,
    start: 2,
    end: 26,
    label: 'B ↔ NEPTUNE',
    tone: 'amber',
    detail: 'Scheduled: Relay B to Neptune down in both directions. It is known in advance, so senders wait instead of launching into it.',
  },
  {
    row: 0,
    start: 240,
    end: 264,
    label: 'B ↔ CERES',
    tone: 'amber',
    detail: 'Scheduled: Relay B to Ceres down in both directions. In the example, this begins as the second price is published at Ceres.',
  },
  {
    row: 2,
    start: 0,
    end: 480,
    label: 'OPEN · AT LEAST 240 h',
    tone: 'muted',
    detail: "Example contract open: both sides' margin encumbered and the position recorded at the clearing ledger. Marks and margin calls between exchanges ride the backbone.",
  },
  {
    row: 2,
    start: 480,
    end: END_HOUR,
    label: 'SETTLE · YOU REPORT WHEN',
    tone: 'green',
    detail: 'Report the discharge, backed-claim and spendable moments separately. There is no deadline to hit; each time carries its probability.',
  },
];

const POINTS: Point[] = [
  { row: 3, hour: 0, label: '100', detail: 'Opening observation, $100, released at the example price source on Ceres.' },
  { row: 3, hour: 240, label: '120 / 80', detail: 'Second observation: $120 in the rising run, $80 in the falling run. Each path must move at least 20% at some point.' },
  { row: 3, hour: 480, label: '125 / 75', detail: 'Final observation and expiry: $125 or $75.' },
];

type IncidentId = 'forced' | 'isolation' | 'reset';

// One example placement per incident kind. Teams pick the kind, the node and the
// start time that hurt their own design most.
const INCIDENTS: Record<IncidentId, { name: string; start: number; end: number; label: string; detail: string }> = {
  forced: {
    name: '6 h FORCED LOSS',
    start: 240,
    end: 246,
    label: 'RELAY A · FORCED LOSS',
    detail: 'Example pick: every launch on a link touching Relay A fails for six hours. With Relay B to Ceres already in maintenance, Ceres has no working backbone link as the second price lands.',
  },
  isolation: {
    name: '72 h ISOLATION',
    start: 240,
    end: 312,
    label: 'CERES ISOLATED',
    detail: 'Example pick: every launch to or from Ceres fails for 72 hours, backbone and direct alike. Local access still works there, but the second price cannot leave Ceres until the window closes.',
  },
  reset: {
    name: 'ENDPOINT RESET',
    start: 240,
    end: 241,
    label: 'CLEARING RESET',
    detail: 'Example pick: the clearing service loses every session, send window, retry timer and unsent queue at once. It keeps its financial records and packet IDs, and each replacement session costs a quota packet.',
  },
};

const INCIDENT_ORDER: IncidentId[] = ['forced', 'isolation', 'reset'];

const TICKS = [0, 240, 480, 720];

const pct = (hour: number) => `${(hour / END_HOUR) * 100}%`;

export function StressTimeline() {
  const [cursor, setCursor] = useState(240);
  const [incidentId, setIncidentId] = useState<IncidentId>('forced');
  const [sweeping, setSweeping] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const userTookOver = useRef(false);

  useEffect(() => {
    const node = rootRef.current;
    if (!node || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSweeping(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!sweeping) return;
    let raf = 0;
    const begin = performance.now();
    const tick = (now: number) => {
      if (userTookOver.current) return;
      const progress = Math.min(1, (now - begin) / 1000 / SWEEP_SECONDS);
      // Ease out and come to rest on the hour-240 pile-up.
      const eased = 1 - (1 - progress) ** 3;
      setCursor(progress < 1 ? eased * END_HOUR : 240);
      if (progress < 1) raf = requestAnimationFrame(tick);
      else setSweeping(false);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [sweeping]);

  const scrub = (clientX: number) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const hour = Math.round(Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)) * END_HOUR);
    userTookOver.current = true;
    setSweeping(false);
    setCursor(hour);
  };

  const hour = Math.round(cursor);
  const incident = INCIDENTS[incidentId];
  const spans: Span[] = [
    ...SPANS,
    { row: INCIDENT_ROW, start: incident.start, end: incident.end, label: incident.label, tone: 'red', detail: incident.detail },
  ];
  const active = [
    ...POINTS.filter((point) => Math.abs(point.hour - hour) <= 6).map((point) => ({ key: `p${point.hour}`, tone: 'cyan' as Tone, text: point.detail })),
    ...spans.filter((span) => hour >= span.start && hour < span.end).map((span) => ({
      key: `s${span.row}${span.start}`,
      tone: span.tone,
      text: span.detail,
    })),
    ...(hour >= END_HOUR - 6
      ? [{ key: 'expiry', tone: 'muted' as Tone, text: 'Day 30: a packet created at hour 0 expires here. The obligation it carried does not.' }]
      : []),
  ];

  return (
    <div ref={rootRef} className="st">
      <div className="st-pick" role="group" aria-label="Incident kind for the S2 stress run">
        <span className="st-pick__label">YOUR S2 INCIDENT · PICK ONE KIND</span>
        {INCIDENT_ORDER.map((id) => (
          <button
            key={id}
            type="button"
            className={`st-pick__btn ${id === incidentId ? 'st-pick__btn--on' : ''}`}
            aria-pressed={id === incidentId}
            onClick={() => {
              setIncidentId(id);
              userTookOver.current = true;
              setSweeping(false);
              setCursor(INCIDENTS[id].start);
            }}
          >
            {INCIDENTS[id].name}
          </button>
        ))}
      </div>

      <div className="st-body">
        <div className="st-labels" aria-hidden="true">
          {ROWS.map((row) => (
            <div key={row} className="st-label">
              {row}
            </div>
          ))}
        </div>

        <div
          ref={trackRef}
          className="st-track"
          onPointerMove={(event) => {
            if (event.pointerType === 'mouse' || event.buttons) scrub(event.clientX);
          }}
          onPointerDown={(event) => scrub(event.clientX)}
          role="slider"
          tabIndex={0}
          aria-label="Simulation hour"
          aria-valuemin={0}
          aria-valuemax={END_HOUR}
          aria-valuenow={hour}
          onKeyDown={(event) => {
            const step = event.shiftKey ? 24 : 6;
            if (event.key === 'ArrowRight') setCursor((value) => Math.min(END_HOUR, value + step));
            if (event.key === 'ArrowLeft') setCursor((value) => Math.max(0, value - step));
            userTookOver.current = true;
          }}
        >
          {Array.from({ length: END_HOUR / 24 + 1 }, (_, day) => (
            <span key={day} className={`st-day ${day % 7 === 0 ? 'st-day--week' : ''}`} style={{ left: pct(day * 24) }} />
          ))}
          <div className="st-pileup" style={{ left: pct(240), width: pct(24) }} />

          {ROWS.map((row, index) => (
            <div key={row} className="st-row">
              {spans.filter((span) => span.row === index).map((span) => (
                <div
                  key={`${span.start}-${span.label}`}
                  className={`st-span st-span--${span.tone} ${hour >= span.start && hour < span.end ? 'st-span--hot' : ''}`}
                  style={{ left: pct(span.start), width: pct(span.end - span.start) }}
                >
                  <span className={span.end - span.start < 90 ? 'st-span__label st-span__label--out' : 'st-span__label'}>
                    {span.label}
                  </span>
                </div>
              ))}
              {POINTS.filter((point) => point.row === index).map((point) => (
                <div
                  key={point.hour}
                  className={`st-point ${Math.abs(point.hour - hour) <= 6 ? 'st-point--hot' : ''}`}
                  style={{ left: pct(point.hour) }}
                >
                  <span className="st-point__label">{point.label}</span>
                </div>
              ))}
            </div>
          ))}

          <div className="st-cursor" style={{ left: pct(cursor) }}>
            <span className="st-cursor__tag">h{hour}</span>
          </div>

          <div className="st-axis" aria-hidden="true">
            {TICKS.map((tick) => (
              <span key={tick} style={{ left: pct(tick) }}>
                h{tick}
                <em>DAY {tick / 24}</em>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="st-readout" aria-live="polite">
        <div className="st-readout__time">
          <span>HOUR {hour}</span>
          <em>DAY {(hour / 24).toFixed(1)}</em>
        </div>
        <ul>
          {active.length === 0 ? (
            <li className="st-tone--muted">Nothing scheduled. Natural Sun blockages can still close links at any hour.</li>
          ) : (
            active.map((item) => (
              <li key={item.key} className={`st-tone--${item.tone}`}>
                {item.text}
              </li>
            ))
          )}
        </ul>
        <div className="st-readout__hint">DRAG ACROSS THE TIMELINE · ← → KEYS · INCIDENT PLACEMENTS ARE EXAMPLES</div>
      </div>

      <style>{`
        .st {
          font-family: 'Space Mono', monospace;
          border: 1px solid #1d4f83;
          background: linear-gradient(180deg, rgba(7, 13, 26, 0.96), rgba(4, 8, 18, 0.98));
          box-shadow: 0 0 0 3px rgba(5, 11, 23, 0.98), 0 0 36px rgba(4, 74, 148, 0.16);
          padding: 18px 18px 14px;
        }

        .st-pick {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
          margin-bottom: 14px;
          padding-bottom: 12px;
          border-bottom: 1px dashed rgba(41, 79, 125, 0.7);
        }

        .st-pick__label {
          margin-right: 6px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.4px;
          color: #ff5a6e;
        }

        .st-pick__btn {
          padding: 6px 10px;
          border: 1px solid rgba(255, 59, 92, 0.45);
          background: transparent;
          font-family: inherit;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1px;
          color: #d3dcea;
          cursor: pointer;
          transition: background 160ms ease, color 160ms ease, box-shadow 160ms ease;
        }

        .st-pick__btn:hover { border-color: #ff3b5c; }

        .st-pick__btn:focus-visible { outline: 1px solid #ff3b5c; outline-offset: 2px; }

        .st-pick__btn--on {
          border-color: #ff3b5c;
          background: rgba(255, 59, 92, 0.16);
          color: #fff;
          box-shadow: 0 0 14px rgba(255, 59, 92, 0.3);
        }

        .st-body {
          display: grid;
          grid-template-columns: 132px minmax(0, 1fr);
          gap: 12px;
        }

        .st-labels {
          display: grid;
          grid-template-rows: repeat(4, 40px);
          padding-top: 6px;
        }

        .st-label {
          display: flex;
          align-items: center;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.2px;
          color: #7e90ab;
        }

        .st-track {
          position: relative;
          display: grid;
          grid-template-rows: repeat(4, 40px);
          padding: 6px 0 42px;
          cursor: crosshair;
          touch-action: pan-y;
          outline: none;
        }

        .st-track:focus-visible {
          box-shadow: 0 0 0 1px #63f6ff;
        }

        .st-day {
          position: absolute;
          top: 0;
          bottom: 36px;
          width: 1px;
          background: rgba(88, 140, 210, 0.08);
        }

        .st-day--week { background: rgba(88, 140, 210, 0.2); }

        .st-pileup {
          position: absolute;
          top: 0;
          bottom: 36px;
          background: repeating-linear-gradient(135deg, rgba(255, 59, 92, 0.1) 0 4px, transparent 4px 9px);
          border-left: 1px solid rgba(255, 59, 92, 0.5);
        }

        .st-row {
          position: relative;
        }

        .st-span {
          position: absolute;
          top: 9px;
          height: 22px;
          min-width: 5px;
          border: 1px solid;
          display: flex;
          align-items: center;
          transition: box-shadow 200ms ease, filter 200ms ease;
        }

        .st-span--cyan { border-color: #63f6ff; background: rgba(99, 246, 255, 0.14); color: #63f6ff; }
        .st-span--amber { border-color: #ffb84d; background: repeating-linear-gradient(135deg, rgba(255, 184, 77, 0.22) 0 5px, rgba(255, 184, 77, 0.08) 5px 10px); color: #ffb84d; }
        .st-span--green { border-color: #4cff87; background: rgba(76, 255, 135, 0.12); color: #4cff87; }
        .st-span--red { border-color: #ff3b5c; background: #ff3b5c; color: #ff5a6e; }
        .st-span--muted { border-color: rgba(167, 180, 201, 0.35); background: rgba(167, 180, 201, 0.06); color: #7e90ab; }

        .st-span--hot {
          box-shadow: 0 0 16px currentColor;
          filter: brightness(1.25);
        }

        .st-span__label {
          padding: 0 6px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.8px;
          white-space: nowrap;
          overflow: hidden;
        }

        .st-span__label--out {
          position: absolute;
          left: calc(100% + 4px);
          overflow: visible;
          padding: 0;
        }

        .st-point {
          position: absolute;
          top: 13px;
          width: 14px;
          height: 14px;
          margin-left: -7px;
          transform: rotate(45deg);
          background: #0b1830;
          border: 2px solid #63f6ff;
          transition: background 200ms ease, box-shadow 200ms ease;
        }

        .st-point--hot {
          background: #63f6ff;
          box-shadow: 0 0 14px #63f6ff;
        }

        .st-point__label {
          position: absolute;
          left: 16px;
          top: -12px;
          transform: rotate(-45deg);
          transform-origin: left top;
          font-size: 10px;
          font-weight: 700;
          color: #e8fbff;
          white-space: nowrap;
        }

        .st-cursor {
          position: absolute;
          top: 0;
          bottom: 30px;
          width: 2px;
          margin-left: -1px;
          background: #fff;
          box-shadow: 0 0 10px #63f6ff, 0 0 22px rgba(99, 246, 255, 0.6);
          pointer-events: none;
        }

        .st-cursor__tag {
          position: absolute;
          bottom: -18px;
          left: 50%;
          transform: translateX(-50%);
          padding: 1px 5px;
          background: #fff;
          color: #02040a;
          font-size: 10px;
          font-weight: 700;
        }

        .st-axis {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 28px;
          font-size: 10px;
          color: #a7b4c9;
        }

        .st-axis span {
          position: absolute;
          transform: translateX(-50%);
          text-align: center;
          font-weight: 700;
          white-space: nowrap;
        }

        .st-axis span:first-child { transform: none; text-align: left; }
        .st-axis span:last-child { transform: translateX(-100%); text-align: right; }

        .st-axis em {
          display: block;
          font-style: normal;
          font-weight: 400;
          font-size: 8px;
          color: #5f7390;
        }

        .st-readout {
          display: grid;
          gap: 8px 16px;
          margin-top: 10px;
          padding-top: 12px;
          border-top: 1px dashed rgba(41, 79, 125, 0.7);
        }

        @media (min-width: 768px) {
          .st-readout { grid-template-columns: 150px minmax(0, 1fr); }
          .st-readout__hint { grid-column: 2; }
        }

        .st-readout__time span {
          display: block;
          font-family: 'VT323', monospace;
          font-size: 32px;
          line-height: 1;
          color: #fff;
        }

        .st-readout__time em {
          font-style: normal;
          font-size: 10px;
          letter-spacing: 1.2px;
          color: #7e90ab;
        }

        .st-readout ul {
          margin: 0;
          padding: 0;
          list-style: none;
          display: grid;
          gap: 4px;
          min-height: 72px;
        }

        .st-readout li {
          padding-left: 14px;
          position: relative;
          font-size: 12px;
          line-height: 1.55;
          color: #d3dcea;
        }

        .st-readout li::before {
          content: '';
          position: absolute;
          left: 0;
          top: 7px;
          width: 6px;
          height: 6px;
          background: currentColor;
        }

        .st-tone--cyan::before { color: #63f6ff; }
        .st-tone--amber::before { color: #ffb84d; }
        .st-tone--green::before { color: #4cff87; }
        .st-tone--red::before { color: #ff3b5c; }
        .st-tone--muted::before { color: #5f7390; }
        .st-readout .st-tone--muted { color: #7e90ab; }

        .st-readout__hint {
          font-size: 9px;
          letter-spacing: 1.2px;
          color: #5f7390;
        }

        @media (max-width: 640px) {
          .st-body { grid-template-columns: 78px minmax(0, 1fr); gap: 8px; }
          .st-label { font-size: 8px; letter-spacing: 0.4px; }
          .st-span__label { font-size: 8px; }
          .st-axis em { display: none; }
          .st-pick__label { width: 100%; }
        }
      `}</style>
    </div>
  );
}
