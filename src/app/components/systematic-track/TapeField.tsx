import { useEffect, useRef } from 'react';
import { gaussian, mulberry32 } from './market';
import { frameGate } from '../../performance';

// Hero backdrop: a price tape streams in from the right while the strategy
// trades it. Faint equity curves fan out behind it, the hundreds of backtests
// you could run, with the one honest strategy drawn on top.

type Candle = { open: number; high: number; low: number; close: number };

const CANDLE_W = 9;
const MA_SLOW = 30;
const FAN_PATHS = 46;
const FAN_STEPS = 120;

export function TapeField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const rand = mulberry32(2026);

    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;
    let last = performance.now();
    let visible = false;
    let scroll = 0;
    let drift = 0;
    let price = 100;
    const candles: Candle[] = [];
    let fan: number[][] = [];
    let hero: number[] = [];

    const nextCandle = (): Candle => {
      drift = 0.97 * drift + 0.0016 * gaussian(rand);
      const open = price;
      let high = open;
      let low = open;
      for (let k = 0; k < 4; k += 1) {
        price *= 1 + drift * 0.25 + 0.0045 * gaussian(rand);
        high = Math.max(high, price);
        low = Math.min(low, price);
      }
      return { open, high: high * (1 + rand() * 0.002), low: low * (1 - rand() * 0.002), close: price };
    };

    const buildFan = () => {
      const fanRand = mulberry32(77);
      fan = Array.from({ length: FAN_PATHS }, () => {
        let value = 0;
        const edge = (fanRand() - 0.5) * 0.004;
        return Array.from({ length: FAN_STEPS }, () => {
          value += edge + 0.018 * gaussian(fanRand);
          return value;
        });
      });
      let value = 0;
      hero = Array.from({ length: FAN_STEPS }, () => {
        value += 0.006 + 0.012 * gaussian(fanRand);
        return value;
      });
    };

    const layout = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      const needed = Math.ceil(width / CANDLE_W) + MA_SLOW + 4;
      while (candles.length < needed) candles.push(nextCandle());
    };

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = '#02040a';
      ctx.fillRect(0, 0, width, height);

      const narrow = width < 900;
      const left = narrow ? 0 : width * 0.38;
      const top = height * (narrow ? 0.08 : 0.14);
      const bottom = height * (narrow ? 0.62 : 0.84);

      // Grid
      ctx.strokeStyle = 'rgba(41, 79, 125, 0.18)';
      ctx.lineWidth = 1;
      for (let x = left - (scroll % (CANDLE_W * 8)); x < width; x += CANDLE_W * 8) {
        ctx.beginPath();
        ctx.moveTo(Math.round(x) + 0.5, top);
        ctx.lineTo(Math.round(x) + 0.5, bottom);
        ctx.stroke();
      }
      for (let k = 0; k <= 6; k += 1) {
        const y = Math.round(top + ((bottom - top) * k) / 6) + 0.5;
        ctx.beginPath();
        ctx.moveTo(left, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Backtest fan behind the tape.
      const fanTop = top + (bottom - top) * 0.1;
      const fanBottom = bottom - (bottom - top) * 0.05;
      const fanMid = (fanTop + fanBottom) / 2;
      const fanScale = (fanBottom - fanTop) / 2.4;
      const stepX = (width - left) / (FAN_STEPS - 1);
      ctx.lineWidth = 1;
      for (const path of fan) {
        const end = path[path.length - 1];
        ctx.strokeStyle = end > 0.3 ? 'rgba(51, 209, 122, 0.08)' : end < -0.3 ? 'rgba(255, 90, 110, 0.07)' : 'rgba(156, 201, 255, 0.06)';
        ctx.beginPath();
        path.forEach((value, index) => {
          const x = left + index * stepX;
          const y = fanMid - value * fanScale;
          if (index === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
      }

      // Candles, newest at the right edge.
      const shown = candles.slice(-Math.ceil((width - left) / CANDLE_W) - MA_SLOW - 2);
      let lo = Infinity;
      let hi = -Infinity;
      shown.forEach((c) => {
        lo = Math.min(lo, c.low);
        hi = Math.max(hi, c.high);
      });
      const pad = (hi - lo) * 0.12 || 1;
      lo -= pad;
      hi += pad;
      const yOf = (value: number) => bottom - ((value - lo) / (hi - lo)) * (bottom - top);
      const offset = scroll % CANDLE_W;
      const xOf = (index: number) => width - (shown.length - index) * CANDLE_W - offset + CANDLE_W;

      // Slow moving average and the long/short regime it implies.
      const ma: (number | null)[] = shown.map((_, index) => {
        if (index < MA_SLOW) return null;
        let sum = 0;
        for (let k = index - MA_SLOW + 1; k <= index; k += 1) sum += shown[k].close;
        return sum / MA_SLOW;
      });

      shown.forEach((c, index) => {
        const avg = ma[index];
        const x = xOf(index);
        if (x < left - CANDLE_W) return;
        if (avg !== null) {
          // Each band is the position held on that bar, decided one bar earlier.
          const prevAvg = ma[index - 1];
          const prev = shown[index - 1];
          const long = prevAvg !== null && prev ? prev.close > prevAvg : c.close > avg;
          ctx.fillStyle = long ? 'rgba(51, 209, 122, 0.05)' : 'rgba(255, 90, 110, 0.04)';
          ctx.fillRect(x - CANDLE_W / 2, top, CANDLE_W, bottom - top);
        }
      });

      shown.forEach((c, index) => {
        const x = xOf(index);
        if (x < left - CANDLE_W) return;
        const up = c.close >= c.open;
        const color = up ? '#33d17a' : '#ff5a6e';
        const fade = Math.min(1, Math.max(0, (x - left) / 140));
        ctx.globalAlpha = 0.25 + 0.65 * fade;
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(Math.round(x) + 0.5, yOf(c.high));
        ctx.lineTo(Math.round(x) + 0.5, yOf(c.low));
        ctx.stroke();
        ctx.fillStyle = up ? 'rgba(51, 209, 122, 0.85)' : 'rgba(255, 90, 110, 0.85)';
        const y0 = yOf(Math.max(c.open, c.close));
        const y1 = yOf(Math.min(c.open, c.close));
        ctx.fillRect(Math.round(x - CANDLE_W / 2 + 2), y0, CANDLE_W - 4, Math.max(1, y1 - y0));
      });
      ctx.globalAlpha = 1;

      ctx.strokeStyle = 'rgba(255, 184, 77, 0.9)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      let pen = false;
      ma.forEach((value, index) => {
        if (value === null) return;
        const x = xOf(index);
        if (x < left) return;
        if (!pen) ctx.moveTo(x, yOf(value));
        else ctx.lineTo(x, yOf(value));
        pen = true;
      });
      ctx.stroke();
      ctx.setLineDash([]);

      // Crossing markers.
      for (let index = 1; index < shown.length; index += 1) {
        const a = ma[index - 1];
        const b = ma[index];
        if (a === null || b === null) continue;
        const was = shown[index - 1].close > a;
        const now = shown[index].close > b;
        if (was === now) continue;
        const x = xOf(index);
        if (x < left) continue;
        const y = yOf(shown[index].close);
        ctx.fillStyle = now ? '#33d17a' : '#ff5a6e';
        ctx.beginPath();
        if (now) {
          ctx.moveTo(x, y + 10);
          ctx.lineTo(x + 5, y + 18);
          ctx.lineTo(x - 5, y + 18);
        } else {
          ctx.moveTo(x, y - 10);
          ctx.lineTo(x + 5, y - 18);
          ctx.lineTo(x - 5, y - 18);
        }
        ctx.fill();
      }

      // The honest strategy, drawn over the fan.
      ctx.strokeStyle = 'rgba(51, 209, 122, 0.55)';
      ctx.shadowColor = 'rgba(51, 209, 122, 0.6)';
      ctx.shadowBlur = 8;
      ctx.lineWidth = 2;
      ctx.beginPath();
      hero.forEach((value, index) => {
        const x = left + index * stepX;
        const y = fanMid - value * fanScale * 0.6;
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Last price tag.
      const lastCandle = shown[shown.length - 1];
      const tagY = yOf(lastCandle.close);
      ctx.fillStyle = lastCandle.close >= lastCandle.open ? '#33d17a' : '#ff5a6e';
      ctx.fillRect(width - 64, tagY - 9, 64, 18);
      ctx.fillStyle = '#02040a';
      ctx.font = '700 11px "Space Mono", monospace';
      ctx.fillText(lastCandle.close.toFixed(2), width - 58, tagY + 4);
    };

    // Held to AMBIENT_FPS; see app/performance.ts.
    const gate = frameGate();
    const tick = (now: number) => {
      raf = 0;
      if (!visible) return;
      raf = requestAnimationFrame(tick);
      if (!gate(now)) return;
      const dt = Math.min(64, now - last);
      last = now;
      scroll += dt * 0.018;
      while (scroll >= CANDLE_W) {
        scroll -= CANDLE_W;
        candles.push(nextCandle());
        if (candles.length > 600) candles.splice(0, candles.length - 600);
      }
      draw();
    };

    buildFan();
    layout();
    draw();

    const resize = new ResizeObserver(() => {
      layout();
      draw();
    });
    resize.observe(canvas);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf && !reduced) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    });
    observer.observe(canvas);
    if (!reduced) raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      resize.disconnect();
      observer.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="st-tape" aria-hidden="true" />;
}
