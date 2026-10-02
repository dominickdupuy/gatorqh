import { useEffect, useRef } from 'react';
import { frameGate } from '../../performance';

// Hero backdrop: the GW2AR-18 package with PCB traces fanning out of its pins.
// Orange pulses are price packets heading in; green ones are actions heading out.

type Trace = { points: [number, number][]; lengths: number[]; total: number };
type Pulse = { trace: Trace; s: number; inbound: boolean; speed: number };
type Cell = { col: number; row: number; life: number };

const PINS_PER_SIDE = 11;
const DIE_CELLS = 10;

const buildTrace = (points: [number, number][]): Trace => {
  const lengths = [0];
  for (let index = 1; index < points.length; index += 1) {
    const [x0, y0] = points[index - 1];
    const [x1, y1] = points[index];
    lengths.push(lengths[index - 1] + Math.hypot(x1 - x0, y1 - y0));
  }
  return { points, lengths, total: lengths[lengths.length - 1] };
};

const pointAt = (trace: Trace, s: number): [number, number] => {
  const clamped = Math.max(0, Math.min(trace.total, s));
  for (let index = 1; index < trace.points.length; index += 1) {
    if (clamped <= trace.lengths[index]) {
      const span = trace.lengths[index] - trace.lengths[index - 1] || 1;
      const t = (clamped - trace.lengths[index - 1]) / span;
      const [x0, y0] = trace.points[index - 1];
      const [x1, y1] = trace.points[index];
      return [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t];
    }
  }
  return trace.points[trace.points.length - 1];
};

export function FabricField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let chip = { x: 0, y: 0, size: 0 };
    let traces: Trace[] = [];
    // How far along a trace pulses travel before they leave the visible canvas.
    let reach = 600;
    let staticLayer: HTMLCanvasElement | null = null;
    const pulses: Pulse[] = [];
    const lit: Cell[] = [];
    const fabric: Cell[] = [];
    let spawnClock = 0;
    let raf = 0;
    let last = performance.now();
    let visible = false;

    const layout = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      const narrow = width < 900;
      const size = Math.max(120, Math.min(height * 0.34, width * (narrow ? 0.42 : 0.24), 290));
      chip = { x: width * (narrow ? 0.62 : 0.72), y: height * (narrow ? 0.36 : 0.5), size };
      reach = Math.max(width, height) * 0.5;

      // Each pin runs straight out, kinks 45 degrees, then runs to the edge.
      traces = [];
      const half = size / 2;
      const pitch = size / (PINS_PER_SIDE + 1);
      const sides: [number, number, number, number][] = [
        [0, -1, 1, 0],
        [0, 1, 1, 0],
        [-1, 0, 0, 1],
        [1, 0, 0, 1],
      ];
      for (const [nx, ny, tx, ty] of sides) {
        for (let pin = 1; pin <= PINS_PER_SIDE; pin += 1) {
          const offset = -half + pin * pitch;
          const start: [number, number] = [chip.x + nx * (half + 6) + tx * offset, chip.y + ny * (half + 6) + ty * offset];
          const run = 18 + ((pin * 37) % 5) * 14;
          const bend: [number, number] = [start[0] + nx * run, start[1] + ny * run];
          const fan = (pin - (PINS_PER_SIDE + 1) / 2) / ((PINS_PER_SIDE - 1) / 2);
          const diag = 30 + Math.abs(fan) * 70;
          const kinked: [number, number] = [
            bend[0] + nx * diag + tx * fan * diag,
            bend[1] + ny * diag + ty * fan * diag,
          ];
          const far = Math.max(width, height) * 1.2;
          const end: [number, number] = [kinked[0] + nx * far, kinked[1] + ny * far];
          traces.push(buildTrace([start, bend, kinked, end]));
        }
      }

      // The background fabric: a sparse lattice of logic tiles.
      fabric.length = 0;
      const cell = 22;
      const cols = Math.ceil(width / cell);
      const rows = Math.ceil(height / cell);
      for (let col = 0; col < cols; col += 1) {
        for (let row = 0; row < rows; row += 1) {
          if ((col * 7 + row * 13) % 5 === 0) fabric.push({ col, row, life: 0 });
        }
      }

      staticLayer = document.createElement('canvas');
      staticLayer.width = canvas.width;
      staticLayer.height = canvas.height;
      const s = staticLayer.getContext('2d');
      if (!s) return;
      s.setTransform(dpr, 0, 0, dpr, 0, 0);
      s.fillStyle = '#02040a';
      s.fillRect(0, 0, width, height);

      for (const tile of fabric) {
        s.strokeStyle = 'rgba(70, 120, 190, 0.12)';
        s.lineWidth = 1;
        s.strokeRect(tile.col * cell + 6.5, tile.row * cell + 6.5, 9, 9);
      }

      s.lineWidth = 1.2;
      s.strokeStyle = 'rgba(76, 255, 135, 0.13)';
      for (const trace of traces) {
        s.beginPath();
        trace.points.forEach(([x, y], index) => (index === 0 ? s.moveTo(x, y) : s.lineTo(x, y)));
        s.stroke();
        const [vx, vy] = trace.points[2];
        s.fillStyle = 'rgba(76, 255, 135, 0.3)';
        s.beginPath();
        s.arc(vx, vy, 2.4, 0, Math.PI * 2);
        s.fill();
      }

      // Package body, pins and die.
      const x0 = chip.x - half;
      const y0 = chip.y - half;
      s.fillStyle = '#0a0f1a';
      s.fillRect(x0, y0, size, size);
      s.strokeStyle = 'rgba(156, 201, 255, 0.55)';
      s.lineWidth = 2;
      s.strokeRect(x0, y0, size, size);
      s.fillStyle = 'rgba(200, 210, 225, 0.75)';
      for (let pin = 1; pin <= PINS_PER_SIDE; pin += 1) {
        const offset = -half + pin * pitch;
        s.fillRect(chip.x + offset - 2, y0 - 7, 4, 7);
        s.fillRect(chip.x + offset - 2, y0 + size, 4, 7);
        s.fillRect(x0 - 7, chip.y + offset - 2, 7, 4);
        s.fillRect(x0 + size, chip.y + offset - 2, 7, 4);
      }
      s.fillStyle = '#FA4616';
      s.beginPath();
      s.arc(x0 + 12, y0 + 12, 3.5, 0, Math.PI * 2);
      s.fill();

      const die = size * 0.56;
      const dieX = chip.x - die / 2;
      const dieY = chip.y - die / 2 - size * 0.04;
      s.strokeStyle = 'rgba(99, 246, 255, 0.35)';
      s.lineWidth = 1;
      s.strokeRect(dieX, dieY, die, die);
      const step = die / DIE_CELLS;
      s.strokeStyle = 'rgba(99, 246, 255, 0.1)';
      for (let col = 0; col < DIE_CELLS; col += 1) {
        for (let row = 0; row < DIE_CELLS; row += 1) {
          s.strokeRect(dieX + col * step + 2, dieY + row * step + 2, step - 4, step - 4);
        }
      }

      s.textAlign = 'center';
      s.fillStyle = 'rgba(244, 244, 244, 0.85)';
      s.font = `700 ${Math.round(size * 0.075)}px Orbitron, sans-serif`;
      s.fillText('GW2AR-18', chip.x, chip.y + size * 0.4);
      s.fillStyle = 'rgba(126, 144, 171, 0.9)';
      s.font = `700 ${Math.max(8, Math.round(size * 0.045))}px "Space Mono", monospace`;
      s.fillText('LV18QN88C8/I7 · 27 MHz', chip.x, chip.y + size * 0.47);
    };

    const dieGeometry = () => {
      const die = chip.size * 0.56;
      return { x: chip.x - die / 2, y: chip.y - die / 2 - chip.size * 0.04, step: die / DIE_CELLS };
    };

    const spawn = () => {
      if (!traces.length) return;
      const trace = traces[Math.floor(Math.random() * traces.length)];
      const inbound = Math.random() < 0.6;
      pulses.push({ trace, inbound, s: inbound ? Math.min(trace.total, reach) : 0, speed: 200 + Math.random() * 160 });
    };

    const draw = (dt: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (staticLayer) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.drawImage(staticLayer, 0, 0);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      // Logic tiles toggle on and off like LUTs settling each clock.
      if (Math.random() < 0.5 && fabric.length) {
        const tile = fabric[Math.floor(Math.random() * fabric.length)];
        tile.life = 1;
      }
      for (const tile of fabric) {
        if (tile.life <= 0) continue;
        tile.life -= dt * 0.9;
        ctx.fillStyle = `rgba(250, 70, 22, ${Math.max(0, tile.life) * 0.45})`;
        ctx.fillRect(tile.col * 22 + 7, tile.row * 22 + 7, 8, 8);
      }

      const die = dieGeometry();
      for (let index = lit.length - 1; index >= 0; index -= 1) {
        const cell = lit[index];
        cell.life -= dt * 1.6;
        if (cell.life <= 0) {
          lit.splice(index, 1);
          continue;
        }
        ctx.fillStyle = `rgba(99, 246, 255, ${cell.life * 0.75})`;
        ctx.fillRect(die.x + cell.col * die.step + 3, die.y + cell.row * die.step + 3, die.step - 6, die.step - 6);
      }

      for (let index = pulses.length - 1; index >= 0; index -= 1) {
        const pulse = pulses[index];
        pulse.s += (pulse.inbound ? -1 : 1) * pulse.speed * dt;
        const done = pulse.inbound ? pulse.s <= 0 : pulse.s >= Math.min(pulse.trace.total, reach);
        if (done) {
          if (pulse.inbound) {
            for (let k = 0; k < 3; k += 1) {
              lit.push({ col: Math.floor(Math.random() * DIE_CELLS), row: Math.floor(Math.random() * DIE_CELLS), life: 1 });
            }
          }
          pulses.splice(index, 1);
          continue;
        }
        const color = pulse.inbound ? '250, 70, 22' : '76, 255, 135';
        const tail = 46;
        const steps = 8;
        for (let k = steps; k >= 0; k -= 1) {
          const behind = pulse.s + (pulse.inbound ? 1 : -1) * (tail * k) / steps;
          const [x, y] = pointAt(pulse.trace, behind);
          ctx.fillStyle = `rgba(${color}, ${(1 - k / steps) * 0.55})`;
          ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
        }
        const [hx, hy] = pointAt(pulse.trace, pulse.s);
        ctx.shadowColor = `rgb(${color})`;
        ctx.shadowBlur = 10;
        ctx.fillStyle = `rgb(${color})`;
        ctx.fillRect(hx - 2.5, hy - 2.5, 5, 5);
        ctx.shadowBlur = 0;
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
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      spawnClock -= dt;
      if (spawnClock <= 0) {
        spawnClock = 0.09 + Math.random() * 0.12;
        spawn();
      }
      draw(dt);
      if (visible) raf = requestAnimationFrame(frame);
    };

    layout();
    if (reduced) {
      draw(0);
    }

    const resizeObserver = new ResizeObserver(() => {
      layout();
      pulses.length = 0;
      lit.length = 0;
      if (reduced) draw(0);
    });
    resizeObserver.observe(canvas);

    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && !reduced;
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

  return <canvas ref={canvasRef} className="hw-fabric" aria-hidden="true" />;
}
