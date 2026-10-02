import { useEffect, useRef } from 'react';
import { gaussian, mulberry32 } from '../market';
import { frameGate } from '../../../performance';

// Hero backdrop for the Massive challenge: a price path streams in, an 8-K
// drops, and the chain's implied move fans out ahead of it as a cone. Then the
// realized path either escapes the cone (the market under-priced the news) or
// stays inside it (the market over-charged).

type Outcome = 'pending' | 'out' | 'in';
type FieldEvent = {
  start: number;
  price: number;
  implied: number;
  label: string;
  outcome: Outcome;
  resolvedAt: number;
  resolvedIndex: number;
};

const STEP = 6;
const CONE_STEPS = 44;
const GAP_STEPS = 22;
const SPEED = 0.011;
const CATEGORIES = ['CFO_APPOINTMENT', 'BUYBACK', 'GUIDANCE_RAISED', 'LITIGATION', 'M&A_COMPLETED', 'CEO_DEPARTURE', 'DIVIDEND_INCREASE', 'RESTRUCTURING'];

export function EventField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const rand = mulberry32(8);

    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;
    let last = performance.now();
    let visible = false;
    let clock = 0;
    let frac = 0;
    let head = 0;
    let lo = 90;
    let hi = 110;
    const prices: number[] = [];
    const events: FieldEvent[] = [];
    let nextEventAt = 30;
    let pendingJump = 0;
    let quietVol = 0.004;

    const generate = () => {
      const prev = prices.length ? prices[prices.length - 1] : 100;
      let r = 0.0015 * gaussian(rand);
      const active = events[events.length - 1];
      if (active && prices.length > active.start && prices.length <= active.start + CONE_STEPS) r = quietVol * gaussian(rand);
      if (pendingJump) {
        r += pendingJump;
        pendingJump = 0;
      }
      // A slow pull back toward 100 keeps the path on screen forever.
      r += (100 - prev) * 0.0015 / 100;
      prices.push(prev * (1 + r));
    };

    const spawn = (index: number) => {
      const price = prices[index];
      const implied = 0.04 + rand() * 0.05;
      events.push({
        start: index,
        price,
        implied,
        label: CATEGORIES[Math.floor(rand() * CATEGORIES.length)],
        outcome: 'pending',
        resolvedAt: 0,
        resolvedIndex: 0,
      });
      if (events.length > 6) events.shift();
      // About half the 8-Ks surprise the chain; the rest drift inside the cone.
      const escapes = rand() < 0.5;
      pendingJump = escapes ? (rand() < 0.5 ? -1 : 1) * implied * (1.15 + rand() * 0.6) : 0;
      quietVol = escapes ? 0.0035 : (implied * 0.5) / Math.sqrt(CONE_STEPS);
      nextEventAt = index + CONE_STEPS + GAP_STEPS + Math.floor(rand() * 18);
    };

    const advance = () => {
      head += 1;
      while (prices.length <= head + 1) generate();
      if (head >= nextEventAt) spawn(head);
      for (const event of events) {
        if (event.outcome !== 'pending') continue;
        const k = head - event.start;
        if (k <= 0) continue;
        const half = event.price * event.implied * Math.sqrt(Math.min(1, k / CONE_STEPS));
        if (Math.abs(prices[head] - event.price) > half) {
          event.outcome = 'out';
          event.resolvedAt = clock;
          event.resolvedIndex = head;
        } else if (k >= CONE_STEPS) {
          event.outcome = 'in';
          event.resolvedAt = clock;
          event.resolvedIndex = head;
        }
      }
    };

    const layout = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    };

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = '#02040a';
      ctx.fillRect(0, 0, width, height);

      const narrow = width < 900;
      const left = narrow ? 0 : width * 0.38;
      const top = height * (narrow ? 0.08 : 0.16);
      const bottom = height * (narrow ? 0.6 : 0.84);
      // "Now" sits short of the right edge so the newest cone has room to fan out.
      const cursorX = left + (width - left) * (narrow ? 0.62 : 0.66);
      const xOf = (index: number) => cursorX - (head - index + 1 - frac) * STEP;
      const firstIndex = Math.max(0, Math.floor(head - (cursorX - left) / STEP) - 2);

      // Grid
      ctx.strokeStyle = 'rgba(41, 79, 125, 0.16)';
      ctx.lineWidth = 1;
      const pitch = STEP * 8;
      for (let x = left - ((head + frac) * STEP) % pitch; x < width; x += pitch) {
        if (x < left) continue;
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

      // Ease the price scale toward what is on screen, cones included.
      let wantLo = Infinity;
      let wantHi = -Infinity;
      for (let i = firstIndex; i <= head; i += 1) {
        wantLo = Math.min(wantLo, prices[i]);
        wantHi = Math.max(wantHi, prices[i]);
      }
      for (const event of events) {
        if (xOf(event.start) < left - CONE_STEPS * STEP) continue;
        wantLo = Math.min(wantLo, event.price * (1 - event.implied));
        wantHi = Math.max(wantHi, event.price * (1 + event.implied));
      }
      const pad = (wantHi - wantLo) * 0.12 || 1;
      const ease = reduced ? 1 : 0.05;
      lo += (wantLo - pad - lo) * ease;
      hi += (wantHi + pad - hi) * ease;
      const yOf = (price: number) => bottom - ((price - lo) / (hi - lo)) * (bottom - top);

      ctx.save();
      ctx.beginPath();
      ctx.rect(left, 0, width - left, height);
      ctx.clip();

      // Cones
      for (const event of events) {
        const x0 = xOf(event.start);
        const x1 = xOf(event.start + CONE_STEPS);
        if (x1 < left) continue;
        const live = event.outcome === 'pending';
        const alpha = live ? 1 : 0.45;
        ctx.beginPath();
        for (let k = 0; k <= CONE_STEPS; k += 2) {
          const half = event.price * event.implied * Math.sqrt(k / CONE_STEPS);
          const x = xOf(event.start + k);
          if (k === 0) ctx.moveTo(x, yOf(event.price + half));
          else ctx.lineTo(x, yOf(event.price + half));
        }
        for (let k = CONE_STEPS; k >= 0; k -= 2) {
          const half = event.price * event.implied * Math.sqrt(k / CONE_STEPS);
          ctx.lineTo(xOf(event.start + k), yOf(event.price - half));
        }
        ctx.closePath();
        ctx.fillStyle = `rgba(255, 184, 77, ${0.08 * alpha})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(255, 184, 77, ${0.55 * alpha})`;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // The 8-K marker
        ctx.strokeStyle = `rgba(157, 140, 255, ${0.7 * alpha})`;
        ctx.setLineDash([2, 3]);
        ctx.beginPath();
        ctx.moveTo(Math.round(x0) + 0.5, top);
        ctx.lineTo(Math.round(x0) + 0.5, bottom);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.font = '700 9px "Space Mono", monospace';
        const tag = `8-K · ${event.label}`;
        const tagW = ctx.measureText(tag).width + 12;
        const tagY = top - 2;
        ctx.fillStyle = `rgba(20, 14, 48, ${0.92 * alpha})`;
        ctx.fillRect(x0 - 1, tagY - 15, tagW, 16);
        ctx.strokeStyle = `rgba(157, 140, 255, ${0.9 * alpha})`;
        ctx.strokeRect(Math.round(x0 - 1) + 0.5, Math.round(tagY - 15) + 0.5, tagW, 16);
        ctx.fillStyle = `rgba(212, 204, 255, ${alpha})`;
        ctx.fillText(tag, x0 + 5, tagY - 4);

        // The verdict flashes where the path resolved, then settles.
        if (event.outcome !== 'pending') {
          const age = clock - event.resolvedAt;
          const flash = reduced ? 1 : Math.max(0.35, 1 - age / 2600);
          const out = event.outcome === 'out';
          const text = out ? 'REALIZED > IMPLIED' : 'INSIDE THE CONE';
          const rx = xOf(event.resolvedIndex);
          const ry = yOf(prices[event.resolvedIndex]) + (out ? (prices[event.resolvedIndex] > event.price ? -14 : 20) : -14);
          ctx.font = '700 10px "Space Mono", monospace';
          const w = ctx.measureText(text).width;
          ctx.fillStyle = out ? `rgba(51, 209, 122, ${flash})` : `rgba(99, 246, 255, ${flash})`;
          if (out && !reduced && age < 900 && Math.floor(age / 150) % 2 === 1) ctx.fillStyle = 'rgba(51, 209, 122, 0.25)';
          ctx.fillText(text, Math.min(width - w - 8, rx - w / 2), ry);
        }
      }

      // The price path
      ctx.beginPath();
      for (let i = firstIndex; i <= head; i += 1) {
        const x = i === head ? cursorX : xOf(i);
        const y = yOf(i === head ? prices[head - 1] + (prices[head] - prices[head - 1]) * frac : prices[i]);
        if (i === firstIndex) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(201, 212, 228, 0.85)';
      ctx.lineWidth = 1.6;
      ctx.shadowColor = 'rgba(156, 201, 255, 0.6)';
      ctx.shadowBlur = 6;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.lineWidth = 1;
      ctx.restore();

      // The live price, and the session the chart has reached.
      const nowPrice = prices[head - 1] + (prices[head] - prices[head - 1]) * frac;
      const nowY = yOf(nowPrice);
      ctx.fillStyle = '#c9d4e4';
      ctx.beginPath();
      ctx.arc(cursorX, nowY, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(156, 201, 255, 0.2)';
      ctx.setLineDash([2, 4]);
      ctx.beginPath();
      ctx.moveTo(Math.round(cursorX) + 0.5, top);
      ctx.lineTo(Math.round(cursorX) + 0.5, bottom);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = '700 9px "Space Mono", monospace';
      ctx.fillStyle = 'rgba(126, 144, 171, 0.8)';
      ctx.fillText('TODAY', cursorX + 5, bottom - 6);
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
      clock += dt;
      frac += dt * SPEED;
      while (frac >= 1) {
        frac -= 1;
        advance();
      }
      draw();
    };

    // Warm up so the first frame already has history and an event in flight.
    for (let k = 0; k < 140; k += 1) advance();
    if (reduced) {
      while (events.length === 0 || events[events.length - 1].start + CONE_STEPS * 0.6 > head) advance();
      events.forEach((event) => {
        if (event.outcome !== 'pending') event.resolvedAt = clock;
      });
    }
    lo = Math.min(...prices.slice(-80)) * 0.97;
    hi = Math.max(...prices.slice(-80)) * 1.03;

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

  return <canvas ref={canvasRef} className="mv-field" aria-hidden="true" />;
}
