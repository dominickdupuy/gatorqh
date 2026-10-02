import { useEffect, useMemo, useRef, useState } from 'react';
import { SETTLEMENTS, formatMinutes, lightFlight, type SettlementId } from './orbits';

export const SETTLEMENT_COLORS: Record<SettlementId, string> = {
  Mercury: '#bdb6ab',
  Venus: '#f0c987',
  Earth: '#4fa3ff',
  Mars: '#ff6a3d',
  Ceres: '#b8aa91',
  Jupiter: '#e3a86a',
  Saturn: '#ecd28e',
  Uranus: '#86e8ea',
  Neptune: '#5b7bff',
};

// However far the farthest settlement is, the race runs this long on screen.
const RACE_SECONDS = 10;

function formatClock(minutes: number) {
  const totalSeconds = Math.floor(minutes * 60);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function LightRace() {
  const [origin, setOrigin] = useState<SettlementId>('Earth');
  const [clock, setClock] = useState(0);
  const [runId, setRunId] = useState(0);
  const [started, setStarted] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Light-time at the epoch, receiver motion included (brief §2).
  const rows = useMemo(
    () =>
      SETTLEMENTS.filter((id) => id !== origin)
        .map((id) => ({ id, flight: lightFlight(origin, id, 0) }))
        .sort((a, b) => a.flight.flightMinutes - b.flight.flightMinutes),
    [origin]
  );
  const farthest = rows[rows.length - 1];
  const span = farthest.flight.flightMinutes;
  const rate = span / RACE_SECONDS;

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setClock(span * 1.02);
      return;
    }
    let raf = 0;
    const begin = performance.now();
    setClock(0);
    const tick = (now: number) => {
      const next = ((now - begin) / 1000) * rate;
      setClock(Math.min(next, span * 1.02));
      if (next < span * 1.02) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, runId, span, rate]);

  const tickStep = span > 180 ? 60 : span > 60 ? 30 : span > 20 ? 10 : 5;

  return (
    <div ref={rootRef} className="lr">
      <div className="lr-top">
        <div>
          <div className="lr-label">TRANSMIT FROM</div>
          <div className="lr-origins" role="group" aria-label="Origin settlement">
            {SETTLEMENTS.map((id) => (
              <button
                key={id}
                type="button"
                className={`lr-origin ${origin === id ? 'lr-origin--on' : ''}`}
                style={{ ['--c' as string]: SETTLEMENT_COLORS[id] }}
                onClick={() => {
                  setOrigin(id);
                  setStarted(true);
                  setRunId((value) => value + 1);
                }}
              >
                {id}
              </button>
            ))}
          </div>
        </div>
        <div className="lr-clock" aria-live="off">
          <div className="lr-label">LIGHT HAS TRAVELLED FOR</div>
          <div className="lr-clock__value">T+ {formatClock(Math.min(clock, span))}</div>
          <div className="lr-clock__sub">
            PLAYBACK ×{Math.round(rate * 60).toLocaleString()} ·{' '}
            <button type="button" onClick={() => setRunId((value) => value + 1)} className="lr-replay">
              ↻ REPLAY
            </button>
          </div>
        </div>
      </div>

      <div className="lr-board">
        <div className="lr-axis" aria-hidden="true">
          {Array.from({ length: Math.floor(span / tickStep) + 1 }, (_, index) => index * tickStep).map((minute) => (
            <span key={minute} style={{ left: `${(minute / span) * 100}%` }}>
              {minute >= 60 ? `${minute / 60}h` : `${minute}m`}
            </span>
          ))}
        </div>
        {rows.map(({ id, flight }) => {
          const arrived = clock >= flight.flightMinutes;
          const progress = Math.min(clock, flight.flightMinutes) / span;
          const target = flight.flightMinutes / span;
          return (
            <div
              key={`${origin}-${id}`}
              className={`lr-row ${arrived ? 'lr-row--arrived' : ''} ${flight.blocked ? 'lr-row--blocked' : ''}`}
              style={{ ['--c' as string]: SETTLEMENT_COLORS[id] }}
            >
              <div className="lr-row__name">
                <span className="lr-row__dot" />
                {id}
              </div>
              <div className="lr-row__track">
                <span className="lr-row__target" style={{ left: `${target * 100}%` }} />
                <span className="lr-row__fill" style={{ width: `${progress * 100}%` }}>
                  {!arrived && clock > 0 && <span className="lr-row__photon" />}
                </span>
              </div>
              <div className="lr-row__time">{formatMinutes(flight.flightMinutes)}</div>
              <div className="lr-row__status">
                {flight.blocked ? 'SUN IN THE WAY' : arrived ? 'RECEIVED' : clock > 0 ? 'IN FLIGHT' : 'STANDBY'}
              </div>
            </div>
          );
        })}
      </div>

      <p className="lr-note">
        From <strong style={{ color: SETTLEMENT_COLORS[origin] }}>{origin}</strong> on 22 September 2126, the
        farthest settlement is <strong style={{ color: SETTLEMENT_COLORS[farthest.id] }}>{farthest.id}</strong>,{' '}
        {formatMinutes(span)} away at light speed. A question and its answer take twice that.
        {rows.some((row) => row.flight.blocked) && ' A red row means the straight path clips the Sun and cannot be used at all.'}
      </p>

      <style>{`
        .lr {
          font-family: 'Space Mono', monospace;
          border: 1px solid #1d4f83;
          background: linear-gradient(180deg, rgba(7, 13, 26, 0.96), rgba(4, 8, 18, 0.98));
          box-shadow: 0 0 0 3px rgba(5, 11, 23, 0.98), 0 0 36px rgba(4, 74, 148, 0.16);
          padding: 18px;
        }

        .lr-top {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 18px;
        }

        .lr-label {
          font-family: 'Orbitron', sans-serif;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 2px;
          color: #7e90ab;
          margin-bottom: 6px;
        }

        .lr-origins {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .lr-origin {
          padding: 5px 9px;
          border: 1px solid rgba(41, 79, 125, 0.9);
          background: #07101d;
          color: #a7b4c9;
          font-size: 11px;
          font-weight: 700;
          transition: border-color 150ms ease, color 150ms ease, box-shadow 150ms ease;
        }

        .lr-origin:hover {
          border-color: var(--c);
          color: #fff;
        }

        .lr-origin--on {
          border-color: var(--c);
          color: #02040a;
          background: var(--c);
          box-shadow: 0 0 14px var(--c);
        }

        .lr-clock {
          text-align: right;
        }

        .lr-clock__value {
          font-family: 'VT323', monospace;
          font-size: clamp(34px, 5vw, 48px);
          line-height: 1;
          color: #fff4c8;
          text-shadow: 0 0 14px rgba(255, 200, 90, 0.55);
        }

        .lr-clock__sub {
          font-size: 10px;
          letter-spacing: 1px;
          color: #7e90ab;
          margin-top: 4px;
        }

        .lr-replay {
          color: #63f6ff;
          font-weight: 700;
          letter-spacing: 1px;
        }

        .lr-replay:hover { color: #fff; }

        .lr-board {
          position: relative;
          display: grid;
          gap: 8px;
          padding-top: 22px;
        }

        .lr-axis {
          position: absolute;
          top: 0;
          left: calc(96px + 12px);
          right: calc(80px + 110px + 24px);
          height: 16px;
          font-size: 9px;
          color: #5f7390;
        }

        .lr-axis span {
          position: absolute;
          transform: translateX(-50%);
        }

        .lr-row {
          display: grid;
          grid-template-columns: 96px minmax(0, 1fr) 80px 110px;
          align-items: center;
          gap: 12px;
          font-size: 12px;
        }

        .lr-row__name {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          color: #d3dcea;
        }

        .lr-row__dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: var(--c);
          box-shadow: 0 0 8px var(--c);
        }

        .lr-row__track {
          position: relative;
          height: 12px;
          background:
            repeating-linear-gradient(90deg, rgba(88, 140, 210, 0.12) 0 1px, transparent 1px 12px),
            #060d19;
          border: 1px solid rgba(41, 79, 125, 0.7);
        }

        .lr-row__target {
          position: absolute;
          top: -4px;
          bottom: -4px;
          width: 2px;
          margin-left: -1px;
          background: var(--c);
          opacity: 0.45;
        }

        .lr-row__fill {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          background: linear-gradient(90deg, rgba(255, 244, 200, 0.05), rgba(255, 220, 140, 0.55));
        }

        .lr-row__photon {
          position: absolute;
          right: -5px;
          top: 50%;
          width: 10px;
          height: 10px;
          margin-top: -5px;
          background: #fff8dc;
          box-shadow: 0 0 10px #ffd27a, 0 0 22px #ffb84d;
        }

        .lr-row--arrived .lr-row__fill {
          background: linear-gradient(90deg, rgba(255, 244, 200, 0.05), var(--c));
          box-shadow: 0 0 12px var(--c);
        }

        .lr-row--arrived .lr-row__target {
          opacity: 1;
          animation: lrPing 700ms ease-out 1;
        }

        @keyframes lrPing {
          from { box-shadow: 0 0 0 0 var(--c); }
          to { box-shadow: 0 0 0 10px transparent; }
        }

        .lr-row__time {
          text-align: right;
          font-weight: 700;
          color: #e8fbff;
        }

        .lr-row__status {
          font-size: 10px;
          letter-spacing: 1px;
          color: #5f7390;
        }

        .lr-row--arrived .lr-row__status { color: #4cff87; }

        .lr-row--blocked .lr-row__track {
          border-color: rgba(255, 59, 92, 0.7);
          background: repeating-linear-gradient(135deg, rgba(255, 59, 92, 0.18) 0 6px, transparent 6px 12px), #12060b;
        }

        .lr-row--blocked .lr-row__fill { display: none; }
        .lr-row--blocked .lr-row__status { color: #ff5a6e; }

        .lr-note {
          margin: 16px 0 0;
          font-size: 13px;
          line-height: 1.7;
          color: #a7b4c9;
        }

        @media (max-width: 640px) {
          .lr-row {
            grid-template-columns: 72px minmax(0, 1fr) 70px;
            gap: 8px;
            font-size: 11px;
          }
          .lr-row__status { display: none; }
          .lr-axis { left: calc(72px + 8px); right: calc(70px + 8px); }
          .lr-clock { text-align: left; }
        }
      `}</style>
    </div>
  );
}
