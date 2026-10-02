import { useEffect, useMemo, useRef, useState } from 'react';
import { backboneLoss, directLoss, distance, formatPercent, nodePosition, type SettlementId } from './orbits';
import { frameGate } from '../../performance';

const PRESET_PAIRS: [SettlementId, SettlementId][] = [
  ['Earth', 'Venus'],
  ['Earth', 'Mars'],
  ['Earth', 'Jupiter'],
  ['Earth', 'Uranus'],
  ['Earth', 'Neptune'],
];

const MAX_AU = 40;
const LANE_SECONDS = 1.7;
const SPAWN_SECONDS = 0.2;

type Packet = { u: number; lostAt: number | null };
type Spark = { x: number; y: number; vx: number; vy: number; life: number };
type Lane = { packets: Packet[]; sparks: Spark[]; sent: number; arrived: number; clock: number };

export function PacketLossLab() {
  const presets = useMemo(
    () =>
      PRESET_PAIRS.map(([a, b]) => ({
        label: b.toUpperCase(),
        au: distance(nodePosition(a, 0), nodePosition(b, 0)),
      })),
    []
  );
  const [au, setAu] = useState(presets[1].au);
  const [copies, setCopies] = useState(1);
  const [counts, setCounts] = useState({ backbone: [0, 0], direct: [0, 0] });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lossRef = useRef({ backbone: backboneLoss(au), direct: directLoss(au) });
  const resetRef = useRef(false);

  const pb = backboneLoss(au);
  const pd = directLoss(au);

  useEffect(() => {
    lossRef.current = { backbone: pb, direct: pd };
    resetRef.current = true;
  }, [pb, pd]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const lanes: Record<'backbone' | 'direct', Lane> = {
      backbone: { packets: [], sparks: [], sent: 0, arrived: 0, clock: 0 },
      direct: { packets: [], sparks: [], sent: 0, arrived: 0, clock: 0.1 },
    };
    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;
    let last = performance.now();
    let lastSync = 0;
    let visible = false;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    const laneY = (index: number) => height * (index === 0 ? 0.3 : 0.74);
    const x0 = 64;
    const x1 = () => width - 64;

    const drawLane = (lane: Lane, index: number, color: string, dt: number, loss: number) => {
      const y = laneY(index);
      const xEnd = x1();

      ctx.strokeStyle = 'rgba(88, 140, 210, 0.25)';
      ctx.setLineDash([2, 6]);
      ctx.beginPath();
      ctx.moveTo(x0, y);
      ctx.lineTo(xEnd, y);
      ctx.stroke();
      ctx.setLineDash([]);

      for (const [x, label] of [
        [x0, 'TX'],
        [xEnd, 'RX'],
      ] as const) {
        ctx.fillStyle = '#0b1830';
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.fillRect(x - 14, y - 14, 28, 28);
        ctx.strokeRect(x - 13.5, y - 13.5, 27, 27);
        ctx.fillStyle = color;
        ctx.font = '700 9px "Space Mono", monospace';
        ctx.fillText(label, x - 7, y + 3);
      }

      if (!reduced) {
        lane.clock -= dt;
        if (lane.clock <= 0) {
          lane.clock = SPAWN_SECONDS;
          lane.packets.push({ u: 0, lostAt: Math.random() < loss ? 0.15 + Math.random() * 0.75 : null });
          lane.sent += 1;
        }
      }

      for (let k = lane.packets.length - 1; k >= 0; k -= 1) {
        const packet = lane.packets[k];
        packet.u += dt / LANE_SECONDS;
        const x = x0 + 16 + (xEnd - x0 - 32) * packet.u;
        if (packet.lostAt !== null && packet.u >= packet.lostAt) {
          for (let s = 0; s < 8; s += 1) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 20 + Math.random() * 50;
            lane.sparks.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 0.6 });
          }
          lane.packets.splice(k, 1);
          continue;
        }
        if (packet.u >= 1) {
          lane.arrived += 1;
          lane.packets.splice(k, 1);
          continue;
        }
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        ctx.fillRect(Math.round(x - 3), Math.round(y - 3), 6, 6);
        ctx.shadowBlur = 0;
      }

      for (let k = lane.sparks.length - 1; k >= 0; k -= 1) {
        const spark = lane.sparks[k];
        spark.life -= dt;
        if (spark.life <= 0) {
          lane.sparks.splice(k, 1);
          continue;
        }
        spark.x += spark.vx * dt;
        spark.y += spark.vy * dt;
        ctx.fillStyle = `rgba(255, 59, 92, ${Math.min(1, spark.life * 2)})`;
        ctx.fillRect(Math.round(spark.x), Math.round(spark.y), 2, 2);
      }
    };

    // Held to AMBIENT_FPS; see app/performance.ts.
    const gate = frameGate();
    const frame = (now: number) => {
      raf = 0;
      if (!gate(now)) {
        if (visible) raf = requestAnimationFrame(frame);
        return;
      }
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;

      if (resetRef.current) {
        resetRef.current = false;
        for (const lane of Object.values(lanes)) {
          lane.sent = 0;
          lane.arrived = 0;
        }
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#040913';
      ctx.fillRect(0, 0, width, height);

      ctx.font = '700 10px "Space Mono", monospace';
      ctx.fillStyle = '#63f6ff';
      ctx.fillText('BACKBONE', x0 - 14, laneY(0) - 24);
      ctx.fillStyle = '#ffb84d';
      ctx.fillText('DIRECT', x0 - 14, laneY(1) - 24);

      drawLane(lanes.backbone, 0, '#63f6ff', dt, lossRef.current.backbone);
      drawLane(lanes.direct, 1, '#ffb84d', dt, lossRef.current.direct);

      if (now - lastSync > 250) {
        lastSync = now;
        const settled = (lane: Lane) => lane.sent - lane.packets.length;
        setCounts({
          backbone: [lanes.backbone.arrived, settled(lanes.backbone)],
          direct: [lanes.direct.arrived, settled(lanes.direct)],
        });
      }

      if (visible) raf = requestAnimationFrame(frame);
    };

    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    });
    intersection.observe(canvas);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      intersection.disconnect();
    };
  }, []);

  const allCopiesFail = pd ** copies;
  const retriesFail = pb ** 4;
  const rate = ([arrived, settled]: number[]) => (settled > 0 ? `${arrived}/${settled} ARRIVED` : 'WARMING UP');

  return (
    <div className="pl">
      <div className="pl-controls">
        <label className="pl-slider">
          <span className="pl-label">
            PATH LENGTH <strong>d = {au.toFixed(2)} AU</strong>
            <em>({(au * 8.317).toFixed(1)} light-min)</em>
          </span>
          <input
            type="range"
            min={0.1}
            max={MAX_AU}
            step={0.01}
            value={au}
            onChange={(event) => setAu(Number(event.target.value))}
            style={{ ['--fill' as string]: `${(au / MAX_AU) * 100}%` }}
          />
        </label>
        <div className="pl-presets" role="group" aria-label="Real distances from Earth at the epoch">
          <span className="pl-presets__label">FROM EARTH AT T=0 →</span>
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className={`pl-preset ${Math.abs(preset.au - au) < 0.005 ? 'pl-preset--on' : ''}`}
              onClick={() => setAu(preset.au)}
            >
              {preset.label} · {preset.au.toFixed(1)} AU
            </button>
          ))}
        </div>
      </div>

      <canvas ref={canvasRef} className="pl-canvas" aria-hidden="true" />

      <div className="pl-readouts">
        <div className="pl-readout pl-readout--backbone">
          <div className="pl-readout__head">
            <span>BACKBONE · PER LAUNCH</span>
            <span className="pl-live">{rate(counts.backbone)}</span>
          </div>
          <div className="pl-formula">
            p = 1 − e<sup>−0.02 × {au.toFixed(2)}</sup> = <strong>{formatPercent(pb)}</strong>
          </div>
          <p>
            Each hop retries until a receipt comes back, up to 4 launches. If those launches were independent, all four
            would fail with probability p⁴ = <strong>{formatPercent(retriesFail, retriesFail < 0.001 ? 4 : 2)}</strong>.
          </p>
        </div>
        <div className="pl-readout pl-readout--direct">
          <div className="pl-readout__head">
            <span>DIRECT · PER PACKET</span>
            <span className="pl-live">{rate(counts.direct)}</span>
          </div>
          <div className="pl-formula">
            p = 1 − e<sup>−0.08 × {au.toFixed(2)}</sup> = <strong>{formatPercent(pd)}</strong>
          </div>
          <div className="pl-copies">
            <span>SEND</span>
            <button type="button" onClick={() => setCopies((n) => Math.max(1, n - 1))} aria-label="Fewer copies">
              −
            </button>
            <strong>{copies}</strong>
            <button type="button" onClick={() => setCopies((n) => Math.min(6, n + 1))} aria-label="More copies">
              +
            </button>
            <span>{copies === 1 ? 'COPY' : 'COPIES'}</span>
          </div>
          <p>
            No receipts, no retries. With {copies} independent {copies === 1 ? 'copy' : 'copies'}, at least one
            arrives with probability 1 − p{copies > 1 ? <sup>{copies}</sup> : ''} ={' '}
            <strong>{formatPercent(1 - allCopiesFail)}</strong>, and every copy spends quota.
          </p>
        </div>
      </div>
      <p className="pl-warning">
        <span>CATCH</span>
        Multiplying probabilities only works when the copies are truly independent. Copies that share a Sun closure, a
        forced-loss window or a queue fail together, and the brief marks down math that pretends otherwise.
      </p>

      <style>{`
        .pl {
          font-family: 'Space Mono', monospace;
          border: 1px solid #1d4f83;
          background: linear-gradient(180deg, rgba(7, 13, 26, 0.96), rgba(4, 8, 18, 0.98));
          box-shadow: 0 0 0 3px rgba(5, 11, 23, 0.98), 0 0 36px rgba(4, 74, 148, 0.16);
          padding: 18px;
        }

        .pl-controls {
          display: grid;
          gap: 10px;
          margin-bottom: 14px;
        }

        .pl-label {
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          gap: 8px;
          font-family: 'Orbitron', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.8px;
          color: #7e90ab;
          margin-bottom: 8px;
        }

        .pl-label strong {
          font-family: 'VT323', monospace;
          font-size: 26px;
          letter-spacing: 1px;
          color: #fff4c8;
        }

        .pl-label em {
          font-family: 'Space Mono', monospace;
          font-style: normal;
          font-size: 11px;
          letter-spacing: 0;
          color: #a7b4c9;
        }

        .pl-slider input {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 8px;
          background: linear-gradient(90deg, #63f6ff, #ffb84d var(--fill), #12233a var(--fill));
          border: 1px solid #294f7d;
          outline: none;
        }

        .pl-slider input::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 20px;
          background: #fff4c8;
          border: 2px solid #ffb84d;
          box-shadow: 0 0 12px rgba(255, 184, 77, 0.8);
          cursor: pointer;
        }

        .pl-slider input::-moz-range-thumb {
          width: 12px;
          height: 18px;
          background: #fff4c8;
          border: 2px solid #ffb84d;
          border-radius: 0;
          cursor: pointer;
        }

        .pl-presets {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .pl-presets__label {
          align-self: center;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.2px;
          color: #5f7390;
          margin-right: 2px;
        }

        .pl-preset {
          padding: 5px 9px;
          border: 1px solid rgba(41, 79, 125, 0.9);
          background: #07101d;
          color: #9cc9ff;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.6px;
        }

        .pl-preset:hover { border-color: #63f6ff; color: #fff; }

        .pl-preset--on {
          border-color: #ffb84d;
          color: #02040a;
          background: #ffb84d;
        }

        .pl-canvas {
          display: block;
          width: 100%;
          height: 150px;
          border: 1px solid rgba(41, 79, 125, 0.6);
          image-rendering: auto;
        }

        .pl-readouts {
          display: grid;
          gap: 12px;
          margin-top: 14px;
        }

        @media (min-width: 768px) {
          .pl-readouts { grid-template-columns: 1fr 1fr; }
        }

        .pl-readout {
          border: 1px solid;
          padding: 12px 14px;
          background: rgba(4, 9, 19, 0.9);
        }

        .pl-readout--backbone { border-color: rgba(99, 246, 255, 0.45); }
        .pl-readout--direct { border-color: rgba(255, 184, 77, 0.45); }

        .pl-readout__head {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          font-family: 'Orbitron', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.6px;
          margin-bottom: 8px;
        }

        .pl-readout--backbone .pl-readout__head { color: #63f6ff; }
        .pl-readout--direct .pl-readout__head { color: #ffb84d; }

        .pl-live {
          font-family: 'Space Mono', monospace;
          font-size: 9px;
          color: #7e90ab;
        }

        .pl-formula {
          font-size: 13px;
          color: #d3dcea;
          margin-bottom: 8px;
        }

        .pl-formula strong {
          font-family: 'VT323', monospace;
          font-size: 26px;
          color: #fff;
          margin-left: 4px;
        }

        .pl-readout p {
          margin: 0;
          font-size: 12px;
          line-height: 1.65;
          color: #a7b4c9;
        }

        .pl-readout p strong { color: #fff; }

        .pl-copies {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1px;
          color: #7e90ab;
        }

        .pl-copies button {
          width: 26px;
          height: 26px;
          border: 1px solid #ffb84d;
          color: #ffb84d;
          font-size: 16px;
          line-height: 1;
        }

        .pl-copies button:hover { background: rgba(255, 184, 77, 0.15); }

        .pl-copies strong {
          font-family: 'VT323', monospace;
          font-size: 26px;
          color: #fff;
          min-width: 16px;
          text-align: center;
        }

        .pl-warning {
          display: flex;
          gap: 10px;
          align-items: baseline;
          margin: 14px 0 0;
          padding: 10px 12px;
          border-left: 3px solid #ff3b5c;
          background: rgba(255, 59, 92, 0.07);
          font-size: 12px;
          line-height: 1.65;
          color: #d3dcea;
        }

        .pl-warning span {
          font-family: 'Orbitron', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.6px;
          color: #ff5a6e;
        }
      `}</style>
    </div>
  );
}
