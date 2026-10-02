import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BACKBONE_LINKS,
  JULIAN_YEAR_DAYS,
  MAINTENANCE,
  RELAYS,
  SETTLEMENTS,
  SOLAR_EXCLUSION_AU,
  backboneLoss,
  backboneRoutes,
  directPath,
  distance,
  formatMinutes,
  formatPercent,
  isRelay,
  nodePosition,
  orbitPath,
  orbitalPeriodDays,
  radius,
  semiMajorAxis,
  storyDate,
  sunClearance,
  LIGHT_MINUTES_PER_AU,
  type NodeId,
  type SettlementId,
  type Vec3,
} from './orbits';
import { frameGate } from '../../performance';

type ScaleMode = 'compressed' | 'inner' | 'full';

const SCALE_MODES: { id: ScaleMode; label: string }[] = [
  { id: 'compressed', label: 'COMPRESSED' },
  { id: 'inner', label: 'TRUE · INNER' },
  { id: 'full', label: 'TRUE · FULL' },
];

// Maps AU to a normalized view radius (1 = edge of the stage). The compressed
// map is logarithmic so Mercury and Neptune fit on one screen; it is radial and
// monotonic, so a path's closest approach to the Sun is preserved on screen.
const LOG_R0 = 0.35;
const LOG_MAX = 32;
function mapRadius(mode: ScaleMode, r: number) {
  if (mode === 'compressed') return Math.log1p(r / LOG_R0) / Math.log1p(LOG_MAX / LOG_R0);
  if (mode === 'inner') return r / 3.4;
  return r / 31.5;
}

// A linear map keeps straight lines straight on screen (perspective included),
// so a segment needs no intermediate samples.
const isLinearMap = (mode: ScaleMode) => mode !== 'compressed';

const SCALE_RINGS: Record<ScaleMode, number[]> = {
  compressed: [1, 5, 10, 20, 30],
  inner: [0.5, 1, 2, 3],
  full: [5, 10, 20, 30],
};

const BODY_STYLE: Record<NodeId, { color: string; size: number }> = {
  Mercury: { color: '#bdb6ab', size: 3.2 },
  Venus: { color: '#f0c987', size: 4.6 },
  Earth: { color: '#4fa3ff', size: 5 },
  Mars: { color: '#ff6a3d', size: 4.2 },
  Ceres: { color: '#b8aa91', size: 2.8 },
  Jupiter: { color: '#e3a86a', size: 9 },
  Saturn: { color: '#ecd28e', size: 7.4 },
  Uranus: { color: '#86e8ea', size: 6.2 },
  Neptune: { color: '#5b7bff', size: 6.2 },
  'Relay A': { color: '#63f6ff', size: 4.6 },
  'Relay B': { color: '#33d17a', size: 4.6 },
};

export const SETTLEMENT_BRIEFS: Record<SettlementId, { role: string; detail: string }> = {
  Mercury: {
    role: 'OPEN SETTLEMENT',
    detail: "Closest to the Sun, with an 88-day year. Its lines of sight swing past the Sun more often than anyone else's.",
  },
  Venus: {
    role: 'OPEN SETTLEMENT',
    detail: 'Every settlement must support local participation, including at least one product whose payment depends on later prices.',
  },
  Earth: {
    role: 'IN THE STORY · INVESTORS',
    detail: 'In the story, investors here buy Ares Habitat shares from Mars. Which of your accounts sit here is up to your balance sheet.',
  },
  Mars: {
    role: 'IN THE STORY · HABITAT & FACTORIES',
    detail: 'In the story, Ares Habitat is built here, and factories here buy asteroid metal on long-term contracts.',
  },
  Ceres: {
    role: 'IN THE STORY · ASTEROID MINING',
    detail: 'In the story, miners here sell metal forward. The worked futures example puts its price source here: each signed observation is released at one settlement only.',
  },
  Jupiter: {
    role: 'GIANT-PLANET GATEWAY',
    detail: 'Represented by its planetary gateway. A 12-year orbit keeps it on the same side of the Sun for months at a time.',
  },
  Saturn: {
    role: 'GIANT-PLANET GATEWAY',
    detail: 'Represented by its planetary gateway. About 70 light-minutes from Earth at the epoch.',
  },
  Uranus: {
    role: 'GIANT-PLANET GATEWAY',
    detail: 'Represented by its planetary gateway. More than two and a half light-hours from Earth at the epoch.',
  },
  Neptune: {
    role: 'THE FARTHEST SETTLEMENT',
    detail: 'About four light-hours from Earth. An account placed here is a good way to find where your design strains.',
  },
};

const RELAY_BRIEF = {
  role: 'BACKBONE RELAY',
  detail: 'Circles the Sun at √8 ≈ 2.83 AU, once every ~1,737 days. Relays move bytes; they never decide what the bytes mean financially.',
};

type Scenario = {
  id: string;
  label: string;
  from: SettlementId;
  to: SettlementId;
  tDays: number;
  mode: ScaleMode;
  caption: string;
};

export const SCENARIOS: Scenario[] = [
  {
    id: 'equity',
    label: 'EQUITY · EARTH ⇄ MARS',
    from: 'Earth',
    to: 'Mars',
    tDays: 0,
    mode: 'compressed',
    caption:
      'Hour 0. A buyer on Earth and a seller on Mars want to swap $10,000 for 100 Ares Habitat shares. They sit about a quarter of an hour apart at light speed, and every question and every answer pays that toll.',
  },
  {
    id: 'futures',
    label: 'FUTURES · CERES → MARS',
    from: 'Ceres',
    to: 'Mars',
    tDays: 0,
    mode: 'inner',
    caption:
      'In the worked example, the metal price is published at Ceres and nowhere else. How, when, and by which route it reaches the Mars manufacturer (and whoever keeps the margin ledger) is part of your design.',
  },
  {
    id: 'transfer',
    label: 'TRANSFER · NEPTUNE → EARTH',
    from: 'Neptune',
    to: 'Earth',
    tDays: 0,
    mode: 'compressed',
    caption:
      "A participant on Neptune wants assets usable on Earth. Four light-hours away, only about 1 in 10 direct packets survives the trip, and Relay B's Neptune link is down for maintenance from hour 2 to hour 26.",
  },
  {
    id: 'blocked',
    label: 'SUN BLOCK · MERCURY ✕ URANUS',
    from: 'Mercury',
    to: 'Uranus',
    tDays: 0,
    mode: 'compressed',
    caption:
      'At the epoch the straight line from Mercury to Uranus grazes the Sun at about 0.015 AU, deep inside the 0.10 AU exclusion sphere. The direct path is dead; the backbone has to go around through a relay.',
  },
  {
    id: 'conjunction',
    label: 'CONJUNCTION · DAY 545',
    from: 'Earth',
    to: 'Mars',
    tDays: 545,
    mode: 'inner',
    caption:
      'From roughly day 519 to day 572 the Sun sits between Earth and Mars. For about seven weeks no direct message can cross; only relay routes get around it. Nobody hands you a timetable. You compute it.',
  },
  {
    id: 'century',
    label: '+100 YEARS',
    from: 'Earth',
    to: 'Neptune',
    tDays: 100 * JULIAN_YEAR_DAYS,
    mode: 'compressed',
    caption:
      'A century later, same rules. The market has no end date: the brief re-runs your design at +1, +10 and +100 years and asks you to scan at least 200 years of geometry.',
  },
];

const SPEEDS = [
  { label: '1 HR/S', daysPerSecond: 1 / 24 },
  { label: '1 DAY/S', daysPerSecond: 1 },
  { label: '1 WK/S', daysPerSecond: 7 },
  { label: '1 MO/S', daysPerSecond: 30.44 },
  { label: '1 YR/S', daysPerSecond: JULIAN_YEAR_DAYS },
];

const MAX_DAYS = 200 * JULIAN_YEAR_DAYS;
const ALL_NODES: NodeId[] = [...SETTLEMENTS, ...RELAYS];
const CAMERA_DISTANCE = 3.4;
const UI_SYNC_MS = 120;

function rgba(hex: string, alpha: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

const easeInOut = (x: number) => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerpVec = (a: Vec3, b: Vec3, k: number): Vec3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

type Projected = { x: number; y: number; depth: number; scale: number };

type Pulse = {
  a: NodeId;
  b: NodeId;
  u: number;
  duration: number;
  lostAt: number | null;
};

type Burst = { x: number; y: number; vx: number; vy: number; life: number; color: string };

type RouteRunner = {
  key: string;
  hop: number;
  u: number;
  attempt: number;
  lostAt: number | null;
  wait: number;
  receipt: { a: NodeId; b: NodeId; u: number } | null;
  flash: { text: string; node: NodeId; life: number; color: string } | null;
};

type DirectRunner = { key: string; u: number; lostAt: number | null; wait: number; flash: number };

const STAR_COUNT = 260;

function buildStars() {
  return Array.from({ length: STAR_COUNT }, () => ({
    x: Math.random(),
    y: Math.random(),
    size: Math.random() < 0.85 ? 1 : 2,
    phase: Math.random() * Math.PI * 2,
    speed: 0.6 + Math.random() * 1.8,
    alpha: 0.2 + Math.random() * 0.6,
  }));
}

// Twinkle is bucketed into a few alpha levels with prebuilt styles, so a frame
// sets fillStyle once per level instead of building a string per star.
const STAR_LEVELS = 10;
const STAR_ALPHA_MAX = 0.8;
const STAR_STYLES = Array.from(
  { length: STAR_LEVELS },
  (_, level) => `rgba(190, 215, 255, ${(((level + 0.5) / STAR_LEVELS) * STAR_ALPHA_MAX).toFixed(3)})`
);

type RouteSnapshot = {
  from: SettlementId;
  to: SettlementId;
  routes: ReturnType<typeof backboneRoutes>;
  direct: ReturnType<typeof directPath>;
};

export function SolarSystemModel({
  variant = 'interactive',
  className = '',
}: {
  variant?: 'interactive' | 'ambient';
  className?: string;
}) {
  const ambient = variant === 'ambient';
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  const [uiDays, setUiDays] = useState(0);
  const [playing, setPlaying] = useState(!reducedMotion);
  const [speedIndex, setSpeedIndex] = useState(ambient ? 3 : 2);
  const [mode, setMode] = useState<ScaleMode>('compressed');
  const [is3d, setIs3d] = useState(ambient);
  const [from, setFrom] = useState<SettlementId>('Earth');
  const [to, setTo] = useState<SettlementId>('Mars');
  const [selected, setSelected] = useState<NodeId>('Earth');
  const [scenarioId, setScenarioId] = useState('');
  const [showLinks, setShowLinks] = useState(true);

  const sim = useRef({
    t: 0,
    playing: !reducedMotion,
    speed: SPEEDS[ambient ? 3 : 2].daysPerSecond,
    azimuth: ambient ? -0.5 : 0,
    tilt: ambient ? 1.02 : 0,
    targetTilt: ambient ? 1.02 : 0,
    modeFrom: 'compressed' as ScaleMode,
    modeTo: 'compressed' as ScaleMode,
    modeBlend: 1,
    hovered: null as NodeId | null,
    selected: 'Earth' as NodeId,
    showLinks: true,
    route: null as RouteSnapshot | null,
    dragging: false,
  });

  const snapshot = useMemo<RouteSnapshot>(
    () => ({ from, to, routes: backboneRoutes(from, to, uiDays), direct: directPath(from, to, uiDays) }),
    [from, to, uiDays]
  );
  const bestRoute = snapshot.routes[0];

  useEffect(() => {
    sim.current.route = ambient ? null : snapshot;
  }, [ambient, snapshot]);

  useEffect(() => {
    sim.current.selected = selected;
  }, [selected]);

  useEffect(() => {
    sim.current.showLinks = showLinks;
  }, [showLinks]);

  useEffect(() => {
    sim.current.speed = SPEEDS[speedIndex].daysPerSecond;
  }, [speedIndex]);

  useEffect(() => {
    sim.current.targetTilt = is3d ? 0.98 : 0;
  }, [is3d]);

  useEffect(() => {
    const s = sim.current;
    if (s.modeTo === mode) return;
    s.modeFrom = s.modeTo;
    s.modeTo = mode;
    s.modeBlend = 0;
  }, [mode]);

  // Render loop. Everything that changes per frame lives in `sim` so React only
  // re-renders for the throttled readouts.
  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Offscreen layers for what only changes with the camera: the backdrop, and
    // the distance rings and orbits. Stars twinkle between the two.
    const backdropLayer = document.createElement('canvas');
    const guideLayer = document.createElement('canvas');
    const backdropCtx = backdropLayer.getContext('2d');
    const guideCtx = guideLayer.getContext('2d');
    if (!backdropCtx || !guideCtx) return;
    let backdropStale = true;
    let guideKey = '';

    const s = sim.current;
    const stars = buildStars();
    const starLevels: (typeof stars)[] = Array.from({ length: STAR_LEVELS }, () => []);
    // Planet glows are soft and only change size, so each is rendered once per dpr.
    const glowSprites = new Map<NodeId, HTMLCanvasElement>();
    const orbits = ALL_NODES.map((id) => ({ id, points: orbitPath(id, isRelay(id) ? 180 : 260) }));
    const pulses: Pulse[] = [];
    const bursts: Burst[] = [];
    const screen = new Map<NodeId, Projected>();
    let routeRunner: RouteRunner | null = null;
    let directRunner: DirectRunner | null = null;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;
    let last = performance.now();
    let lastSync = 0;
    let visible = true;
    let spawnClock = 0;

    const resize = () => {
      const rect = stage.getBoundingClientRect();
      // The ambient backdrop is dim and decorative, so it renders at 1x.
      dpr = ambient ? 1 : Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      backdropLayer.width = canvas.width;
      backdropLayer.height = canvas.height;
      // Ambient draws its guides straight onto the canvas, so it skips this layer.
      if (!ambient) {
        guideLayer.width = canvas.width;
        guideLayer.height = canvas.height;
      }
      backdropStale = true;
      guideKey = '';
      glowSprites.clear();
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(stage);

    // Web fonts arrive after the first frame; the cached AU labels need a redraw.
    const invalidateGuides = () => {
      guideKey = '';
    };
    document.fonts?.addEventListener('loadingdone', invalidateGuides);

    const radiusMap = (r: number) => {
      const target = mapRadius(s.modeTo, r);
      if (s.modeBlend >= 1) return target;
      return lerp(mapRadius(s.modeFrom, r), target, easeInOut(s.modeBlend));
    };

    const makeProjector = () => {
      // The ambient backdrop sits behind left-aligned hero copy, so its Sun moves right.
      const cx = width / 2 + (ambient && width > 900 ? width * 0.17 : 0);
      const cy = height / 2 + (ambient ? height * 0.06 : 0);
      const ct = Math.cos(s.tilt);
      const st = Math.sin(s.tilt);
      const ca = Math.cos(s.azimuth);
      const sa = Math.sin(s.azimuth);
      const fill = ambient ? 0.62 : 0.46;
      const unit =
        Math.min(width * fill, (height * fill) / Math.max(ct, ambient ? 0.42 : 0.5)) / (1 + 0.3 * st);
      return (v: Vec3): Projected => {
        const r = Math.hypot(v[0], v[1], v[2]);
        const k = r > 0 ? radiusMap(r) / r : 0;
        const x = v[0] * k;
        const y = v[1] * k;
        const z = v[2] * k;
        const x1 = x * ca - y * sa;
        const y1 = x * sa + y * ca;
        const screenY = y1 * ct + z * st;
        const depth = -y1 * st + z * ct;
        const scale = CAMERA_DISTANCE / (CAMERA_DISTANCE - depth);
        return { x: cx + x1 * unit * scale, y: cy - screenY * unit * scale, depth, scale };
      };
    };

    // Only the log map bends a segment, and only while settled; mid-blend is conservative.
    const strokeSegment = (project: (v: Vec3) => Projected, a: Vec3, b: Vec3, curved = 10) => {
      const samples = s.modeBlend >= 1 && isLinearMap(s.modeTo) ? 2 : curved;
      ctx.beginPath();
      for (let k = 0; k <= samples; k += 1) {
        const p = project(lerpVec(a, b, k / samples));
        if (k === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    };

    const burst = (x: number, y: number, color: string) => {
      for (let k = 0; k < 10; k += 1) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 30 + Math.random() * 60;
        bursts.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 0.7, color });
      }
    };

    const linkIsDown = (a: NodeId, b: NodeId, positions: Map<NodeId, Vec3>) => {
      const hour = s.t * 24;
      const maintenance = MAINTENANCE.some(
        (w) => ((w.a === a && w.b === b) || (w.a === b && w.b === a)) && hour >= w.startHour && hour < w.endHour
      );
      const blocked = sunClearance(positions.get(a)!, positions.get(b)!) < SOLAR_EXCLUSION_AU;
      return { maintenance, blocked };
    };

    // One glow per body, drawn at the largest size the depth scale can give it
    // and scaled down to fit, so the gradient is never rebuilt per frame.
    const glowSprite = (id: NodeId) => {
      const cached = glowSprites.get(id);
      if (cached) return cached;
      const { color, size } = BODY_STYLE[id];
      const reach = size * 3.4 * 1.15;
      const px = Math.max(2, Math.ceil(reach * 2 * dpr));
      const sprite = document.createElement('canvas');
      sprite.width = sprite.height = px;
      const sctx = sprite.getContext('2d');
      if (sctx) {
        const glow = sctx.createRadialGradient(px / 2, px / 2, 0, px / 2, px / 2, px / 2);
        glow.addColorStop(0, rgba(color, 0.35));
        glow.addColorStop(1, rgba(color, 0));
        sctx.fillStyle = glow;
        sctx.fillRect(0, 0, px, px);
      }
      glowSprites.set(id, sprite);
      return sprite;
    };

    const drawPlanet = (id: NodeId, p: Projected, sun: Projected, now: number) => {
      const { color, size } = BODY_STYLE[id];
      const r = size * (0.75 + 0.25 * p.scale);

      const halo = r * 3.4;
      ctx.drawImage(glowSprite(id), p.x - halo, p.y - halo, halo * 2, halo * 2);

      if (isRelay(id)) {
        const spin = now / 1400;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.strokeStyle = rgba(color, 0.9);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-r * 2.2, 0);
        ctx.lineTo(r * 2.2, 0);
        ctx.stroke();
        ctx.fillStyle = rgba(color, 0.55);
        ctx.fillRect(-r * 2.4, -r * 0.45, r * 0.9, r * 0.9);
        ctx.fillRect(r * 1.5, -r * 0.45, r * 0.9, r * 0.9);
        ctx.rotate(Math.PI / 4 + Math.sin(spin) * 0.15);
        ctx.fillStyle = color;
        ctx.fillRect(-r * 0.7, -r * 0.7, r * 1.4, r * 1.4);
        ctx.restore();
        return r;
      }

      // Lit from the Sun's side of the screen.
      const dx = sun.x - p.x;
      const dy = sun.y - p.y;
      const len = Math.hypot(dx, dy) || 1;
      const hx = p.x + (dx / len) * r * 0.45;
      const hy = p.y + (dy / len) * r * 0.45;
      const body = ctx.createRadialGradient(hx, hy, r * 0.1, p.x, p.y, r * 1.05);
      body.addColorStop(0, '#ffffff');
      body.addColorStop(0.25, color);
      body.addColorStop(1, rgba(color, 0.35));
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();

      if (id === 'Jupiter' || id === 'Saturn') {
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.clip();
        ctx.fillStyle = 'rgba(80, 40, 10, 0.25)';
        ctx.fillRect(p.x - r, p.y - r * 0.32, r * 2, r * 0.18);
        ctx.fillRect(p.x - r, p.y + r * 0.22, r * 2, r * 0.14);
        ctx.restore();
      }

      if (id === 'Saturn') {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(-0.4);
        ctx.strokeStyle = rgba('#f5e3b0', 0.75);
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 2.1, r * (0.45 + 0.35 * Math.sin(s.tilt)), 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
      return r;
    };

    // Layers are device-pixel sized, so they blit 1:1 with the transform reset.
    const blit = (layer: HTMLCanvasElement) => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(layer, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const refreshBackdrop = () => {
      if (!backdropStale) return;
      backdropStale = false;
      backdropCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const bg = backdropCtx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) * 0.7);
      bg.addColorStop(0, '#0a1222');
      bg.addColorStop(1, '#02040a');
      backdropCtx.fillStyle = bg;
      backdropCtx.fillRect(0, 0, width, height);
    };

    const drawGuides = (g: CanvasRenderingContext2D, project: (v: Vec3) => Projected) => {
      // Distance rings: a sense of scale that survives the compressed map.
      const rings = SCALE_RINGS[s.modeTo];
      g.lineWidth = 1;
      g.font = '600 9px "Space Mono", monospace';
      for (const au of rings) {
        if (radiusMap(au) > 1.08) continue;
        g.strokeStyle = 'rgba(88, 140, 210, 0.13)';
        g.setLineDash([2, 6]);
        g.beginPath();
        for (let k = 0; k <= 96; k += 1) {
          const angle = (k / 96) * Math.PI * 2;
          const p = project([au * Math.cos(angle), au * Math.sin(angle), 0]);
          if (k === 0) g.moveTo(p.x, p.y);
          else g.lineTo(p.x, p.y);
        }
        g.stroke();
        g.setLineDash([]);
        if (!ambient) {
          const angle = -Math.PI / 4 - s.azimuth;
          const p = project([au * Math.cos(angle), au * Math.sin(angle), 0]);
          g.fillStyle = 'rgba(120, 165, 225, 0.45)';
          g.fillText(`${au} AU`, p.x + 4, p.y + 12);
        }
      }

      // Orbits.
      for (const orbit of orbits) {
        const { color } = BODY_STYLE[orbit.id];
        const relay = isRelay(orbit.id);
        g.strokeStyle = relay ? rgba('#63f6ff', 0.22) : rgba(color, s.selected === orbit.id ? 0.55 : 0.2);
        g.lineWidth = s.selected === orbit.id ? 1.4 : 1;
        if (relay) g.setLineDash([6, 6]);
        g.beginPath();
        orbit.points.forEach((point, index) => {
          const p = project(point);
          if (index === 0) g.moveTo(p.x, p.y);
          else g.lineTo(p.x, p.y);
        });
        g.stroke();
        g.setLineDash([]);
        if (relay) break; // Both relays share one circle.
      }
    };

    // Rings and orbits only move with the camera, so redraw them when it does.
    // (Ambient spins every frame, so it draws them live instead; see draw.)
    const refreshGuides = (project: (v: Vec3) => Projected) => {
      const key = `${s.tilt}|${s.azimuth}|${s.modeBlend}|${s.modeFrom}|${s.modeTo}|${s.selected}|${width}|${height}|${dpr}|${ambient}`;
      if (key === guideKey) return;
      guideKey = key;
      guideCtx.setTransform(1, 0, 0, 1, 0, 0);
      guideCtx.clearRect(0, 0, guideLayer.width, guideLayer.height);
      guideCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawGuides(guideCtx, project);
    };

    const draw = (now: number, dt: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      refreshBackdrop();
      blit(backdropLayer);

      for (const level of starLevels) level.length = 0;
      for (const star of stars) {
        const twinkle = 0.55 + 0.45 * Math.sin(now / 1000 * star.speed + star.phase);
        const level = Math.min(STAR_LEVELS - 1, Math.floor((star.alpha * twinkle / STAR_ALPHA_MAX) * STAR_LEVELS));
        starLevels[level].push(star);
      }
      for (let level = 0; level < STAR_LEVELS; level += 1) {
        const group = starLevels[level];
        if (!group.length) continue;
        ctx.fillStyle = STAR_STYLES[level];
        for (const star of group) {
          ctx.fillRect(Math.round(star.x * width), Math.round(star.y * height), star.size, star.size);
        }
      }

      const project = makeProjector();
      const sun = project([0, 0, 0]);
      const positions = new Map<NodeId, Vec3>();
      for (const id of ALL_NODES) positions.set(id, nodePosition(id, s.t));

      if (ambient) {
        drawGuides(ctx, project);
      } else {
        refreshGuides(project);
        blit(guideLayer);
      }

      // Solar exclusion sphere, measured along the screen's unforeshortened axis.
      const exclusionEdge = project([
        SOLAR_EXCLUSION_AU * Math.cos(-s.azimuth),
        SOLAR_EXCLUSION_AU * Math.sin(-s.azimuth),
        0,
      ]);
      const exclusionRadius = Math.abs(exclusionEdge.x - sun.x);

      const route = s.route;
      const routeHops = new Set<string>();
      if (route) {
        const best = route.routes[0];
        for (let k = 0; k < best.nodes.length - 1; k += 1) {
          routeHops.add(`${best.nodes[k]}|${best.nodes[k + 1]}`);
          routeHops.add(`${best.nodes[k + 1]}|${best.nodes[k]}`);
        }
      }

      // Backbone links.
      const downLinks: [NodeId, NodeId, boolean][] = [];
      if (s.showLinks) {
        for (const [a, b] of BACKBONE_LINKS) {
          if (routeHops.has(`${a}|${b}`)) continue;
          const { maintenance, blocked } = linkIsDown(a, b, positions);
          if (blocked || maintenance) {
            downLinks.push([a, b, maintenance]);
            continue;
          }
          ctx.strokeStyle = ambient ? 'rgba(99, 190, 255, 0.1)' : 'rgba(99, 190, 255, 0.14)';
          ctx.lineWidth = 1;
          strokeSegment(project, positions.get(a)!, positions.get(b)!);
        }
        for (const [a, b, maintenance] of downLinks) {
          ctx.strokeStyle = maintenance ? 'rgba(255, 184, 77, 0.55)' : 'rgba(255, 59, 92, 0.5)';
          ctx.lineWidth = 1.2;
          ctx.setLineDash(maintenance ? [8, 5] : [3, 5]);
          ctx.lineDashOffset = -now / 60;
          strokeSegment(project, positions.get(a)!, positions.get(b)!);
          ctx.setLineDash([]);
        }
      }

      // Direct path for the planner.
      if (route) {
        const a = positions.get(route.from)!;
        const b = positions.get(route.to)!;
        const blocked = sunClearance(a, b) < SOLAR_EXCLUSION_AU;
        ctx.strokeStyle = blocked ? 'rgba(255, 59, 92, 0.85)' : 'rgba(255, 184, 77, 0.6)';
        ctx.lineWidth = 1.4;
        ctx.setLineDash(blocked ? [2, 4] : [7, 6]);
        ctx.lineDashOffset = -now / 40;
        strokeSegment(project, a, b, 16);
        ctx.setLineDash([]);
      }

      // Selected backbone route.
      if (route) {
        const best = route.routes[0];
        best.hops.forEach((hop, index) => {
          const a = positions.get(best.nodes[index])!;
          const b = positions.get(best.nodes[index + 1])!;
          const down = !hop.available;
          ctx.strokeStyle = down ? 'rgba(255, 59, 92, 0.3)' : 'rgba(250, 70, 22, 0.28)';
          ctx.lineWidth = 7;
          strokeSegment(project, a, b, 16);
          ctx.strokeStyle = down ? 'rgba(255, 90, 110, 0.95)' : 'rgba(255, 140, 90, 0.95)';
          ctx.lineWidth = 1.8;
          if (down) ctx.setLineDash([4, 5]);
          strokeSegment(project, a, b, 16);
          ctx.setLineDash([]);
        });
      }

      // Sun, then bodies back-to-front.
      const drawSun = () => {
        const sunGlow = ctx.createRadialGradient(sun.x, sun.y, 0, sun.x, sun.y, 46 * sun.scale);
        sunGlow.addColorStop(0, 'rgba(255, 236, 170, 0.95)');
        sunGlow.addColorStop(0.18, 'rgba(255, 170, 60, 0.55)');
        sunGlow.addColorStop(0.5, 'rgba(250, 70, 22, 0.14)');
        sunGlow.addColorStop(1, 'rgba(250, 70, 22, 0)');
        ctx.fillStyle = sunGlow;
        ctx.beginPath();
        ctx.arc(sun.x, sun.y, 46 * sun.scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff4c8';
        ctx.beginPath();
        ctx.arc(sun.x, sun.y, Math.min(5, Math.max(2.5, exclusionRadius * 0.45)), 0, Math.PI * 2);
        ctx.fill();
        if (exclusionRadius > 5) {
          ctx.strokeStyle = 'rgba(255, 59, 92, 0.75)';
          ctx.lineWidth = 1.2;
          ctx.setLineDash([3, 3]);
          ctx.lineDashOffset = now / 90;
          ctx.beginPath();
          ctx.arc(sun.x, sun.y, exclusionRadius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      };

      const order = ALL_NODES.map((id) => ({ id, p: project(positions.get(id)!) }));
      order.sort((x, y) => x.p.depth - y.p.depth);
      let sunDrawn = false;
      screen.clear();
      const radii = new Map<NodeId, number>();
      for (const { id, p } of order) {
        if (!sunDrawn && p.depth > sun.depth) {
          drawSun();
          sunDrawn = true;
        }
        const onStage = p.x > -20 && p.x < width + 20 && p.y > -20 && p.y < height + 20;
        if (!onStage) continue;
        radii.set(id, drawPlanet(id, p, sun, now));
        screen.set(id, p);
      }
      if (!sunDrawn) drawSun();

      // Ambient traffic: random launches on open links, some lost en route.
      if (ambient && !reducedMotion) {
        spawnClock -= dt;
        if (spawnClock <= 0) {
          spawnClock = 0.16 + Math.random() * 0.2;
          const [a, b] = BACKBONE_LINKS[Math.floor(Math.random() * BACKBONE_LINKS.length)];
          const { blocked, maintenance } = linkIsDown(a, b, positions);
          if (!blocked && !maintenance) {
            const reverse = Math.random() < 0.5;
            const loss = backboneLoss(distance(positions.get(a)!, positions.get(b)!));
            pulses.push({
              a: reverse ? b : a,
              b: reverse ? a : b,
              u: 0,
              duration: 1.4 + Math.random() * 1.2,
              lostAt: Math.random() < loss ? 0.3 + Math.random() * 0.5 : null,
            });
          }
        }
        for (let k = pulses.length - 1; k >= 0; k -= 1) {
          const pulse = pulses[k];
          pulse.u += dt / pulse.duration;
          const pa = positions.get(pulse.a)!;
          const pb = positions.get(pulse.b)!;
          if (pulse.lostAt !== null && pulse.u >= pulse.lostAt) {
            const p = project(lerpVec(pa, pb, pulse.lostAt));
            burst(p.x, p.y, '#ff3b5c');
            pulses.splice(k, 1);
            continue;
          }
          if (pulse.u >= 1) {
            pulses.splice(k, 1);
            continue;
          }
          drawPacket(project, pa, pb, pulse.u, '#9fe8ff', 0.05);
        }
      }

      // Planner packets: backbone with hop retries, direct with silent loss.
      if (route && !reducedMotion) {
        runRoute(project, positions, route, dt);
        runDirect(project, positions, route, dt);
      }

      for (let k = bursts.length - 1; k >= 0; k -= 1) {
        const b = bursts[k];
        b.life -= dt;
        if (b.life <= 0) {
          bursts.splice(k, 1);
          continue;
        }
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        ctx.fillStyle = rgba(b.color, Math.min(1, b.life * 1.6));
        ctx.fillRect(Math.round(b.x), Math.round(b.y), 2, 2);
      }

      // Selection and hover rings.
      for (const id of [s.selected, s.hovered]) {
        if (!id) continue;
        const p = screen.get(id);
        if (!p) continue;
        const r = (radii.get(id) ?? 5) + 7;
        ctx.strokeStyle = id === s.selected ? 'rgba(99, 246, 255, 0.9)' : 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 4]);
        ctx.lineDashOffset = now / 50;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      drawLabels();
      if (s.modeTo === 'inner' && s.modeBlend >= 1) drawOffstageMarkers(project, positions);
      if (!ambient && s.hovered) drawTooltip(s.hovered, positions);
    };

    const drawPacket = (
      project: (v: Vec3) => Projected,
      a: Vec3,
      b: Vec3,
      u: number,
      color: string,
      trail: number
    ) => {
      for (let k = 6; k >= 0; k -= 1) {
        const tu = Math.max(0, u - k * trail * 0.2);
        const p = project(lerpVec(a, b, tu));
        const alpha = k === 0 ? 1 : 0.5 - k * 0.07;
        ctx.fillStyle = rgba(color, Math.max(0.05, alpha));
        const size = k === 0 ? 4 : 3;
        ctx.fillRect(Math.round(p.x - size / 2), Math.round(p.y - size / 2), size, size);
      }
      const head = project(lerpVec(a, b, u));
      const glow = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 10);
      glow.addColorStop(0, rgba(color, 0.55));
      glow.addColorStop(1, rgba(color, 0));
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(head.x, head.y, 10, 0, Math.PI * 2);
      ctx.fill();
    };

    const flashText = (text: string, node: NodeId, color: string, alpha: number) => {
      const p = screen.get(node);
      if (!p) return;
      ctx.font = '700 10px "Space Mono", monospace';
      ctx.fillStyle = rgba(color, alpha);
      ctx.fillText(text, p.x + 12, p.y - 14);
    };

    const runRoute = (
      project: (v: Vec3) => Projected,
      positions: Map<NodeId, Vec3>,
      route: RouteSnapshot,
      dt: number
    ) => {
      const best = route.routes[0];
      const key = best.nodes.join('>');
      if (!routeRunner || routeRunner.key !== key) {
        routeRunner = { key, hop: 0, u: 0, attempt: 1, lostAt: null, wait: 0.4, receipt: null, flash: null };
      }
      const runner = routeRunner;
      if (runner.flash) {
        runner.flash.life -= dt;
        flashText(runner.flash.text, runner.flash.node, runner.flash.color, Math.min(1, runner.flash.life * 2));
        if (runner.flash.life <= 0) runner.flash = null;
      }
      if (!best.available) return;

      const hop = best.hops[runner.hop];
      const totalFlight = best.hops.reduce((sum, h) => sum + h.flightMinutes, 0);
      const duration = 0.45 + 2.1 * (hop.flightMinutes / totalFlight);
      const a = positions.get(best.nodes[runner.hop])!;
      const b = positions.get(best.nodes[runner.hop + 1])!;

      // Hop receipt flying back to the sender that launched it.
      if (runner.receipt) {
        runner.receipt.u += dt / 0.55;
        if (runner.receipt.u < 1) {
          drawPacket(project, positions.get(runner.receipt.b)!, positions.get(runner.receipt.a)!, runner.receipt.u, '#33d17a', 0.02);
        } else {
          runner.receipt = null;
        }
      }

      if (runner.wait > 0) {
        runner.wait -= dt;
        if (runner.wait <= 0) {
          runner.lostAt = Math.random() < hop.loss ? 0.25 + Math.random() * 0.55 : null;
        }
        return;
      }

      runner.u += dt / duration;
      if (runner.lostAt !== null && runner.u >= runner.lostAt) {
        const p = project(lerpVec(a, b, runner.lostAt));
        burst(p.x, p.y, '#ff3b5c');
        runner.u = 0;
        runner.attempt += 1;
        if (runner.attempt > 4) {
          runner.flash = { text: 'HOP ABANDONED', node: best.nodes[runner.hop], life: 1.4, color: '#ff3b5c' };
          runner.hop = 0;
          runner.attempt = 1;
          runner.wait = 1.4;
        } else {
          runner.flash = { text: `NO RECEIPT · RETRY ${runner.attempt}/4`, node: best.nodes[runner.hop], life: 1.1, color: '#ffb84d' };
          runner.wait = 0.5;
        }
        return;
      }
      if (runner.u >= 1) {
        runner.receipt = { a: best.nodes[runner.hop], b: best.nodes[runner.hop + 1], u: 0 };
        runner.u = 0;
        runner.attempt = 1;
        if (runner.hop < best.hops.length - 1) {
          runner.hop += 1;
          runner.wait = 0.12;
        } else {
          runner.flash = { text: 'DELIVERED', node: best.nodes[best.nodes.length - 1], life: 1.2, color: '#4cff87' };
          runner.hop = 0;
          runner.wait = 1.3;
        }
        return;
      }
      drawPacket(project, a, b, runner.u, '#ffb38a', 0.03);
    };

    const runDirect = (
      project: (v: Vec3) => Projected,
      positions: Map<NodeId, Vec3>,
      route: RouteSnapshot,
      dt: number
    ) => {
      const key = `${route.from}>${route.to}`;
      if (!directRunner || directRunner.key !== key) {
        directRunner = { key, u: 0, lostAt: null, wait: 1, flash: 0 };
      }
      const runner = directRunner;
      const a = positions.get(route.from)!;
      const b = positions.get(route.to)!;
      if (sunClearance(a, b) < SOLAR_EXCLUSION_AU) return;
      if (runner.flash > 0) {
        runner.flash -= dt;
        const mid = project(lerpVec(a, b, runner.lostAt ?? 0.5));
        ctx.font = '700 10px "Space Mono", monospace';
        ctx.fillStyle = rgba('#ff3b5c', Math.min(1, runner.flash * 2));
        ctx.fillText('LOST · NOBODY IS TOLD', mid.x + 8, mid.y + 16);
      }
      if (runner.wait > 0) {
        runner.wait -= dt;
        if (runner.wait <= 0) {
          runner.u = 0;
          runner.lostAt = Math.random() < route.direct.loss ? 0.25 + Math.random() * 0.6 : null;
        }
        return;
      }
      runner.u += dt / 2.3;
      if (runner.lostAt !== null && runner.u >= runner.lostAt) {
        const p = project(lerpVec(a, b, runner.lostAt));
        burst(p.x, p.y, '#ffb84d');
        runner.flash = 1.2;
        runner.wait = 1.1;
        return;
      }
      if (runner.u >= 1) {
        runner.wait = 1.1;
        return;
      }
      drawPacket(project, a, b, runner.u, '#ffcf7a', 0.03);
    };

    const drawLabels = () => {
      const placed: { x: number; y: number; w: number; h: number }[] = [];
      const route = s.route;
      const priority = (id: NodeId) =>
        (id === s.selected ? 10 : 0) + (route && (id === route.from || id === route.to) ? 8 : 0) + (isRelay(id) ? 2 : 0) + BODY_STYLE[id].size / 10;
      const ids = [...screen.keys()].sort((x, y) => priority(y) - priority(x));
      ctx.font = `700 ${ambient ? 9 : 10}px "Space Mono", monospace`;
      for (const id of ids) {
        const p = screen.get(id)!;
        const r = BODY_STYLE[id].size;
        const label = (isRelay(id) ? id.replace('Relay ', 'RELAY ') : id).toUpperCase();
        const tag = route && id === route.from ? ' · TX' : route && id === route.to ? ' · RX' : '';
        const text = label + tag;
        const w = ctx.measureText(text).width;
        const x = p.x + r + 8;
        const y = p.y - r - 4;
        const box = { x: x - 2, y: y - 10, w: w + 4, h: 13 };
        const clash = placed.some(
          (o) => box.x < o.x + o.w && box.x + box.w > o.x && box.y < o.y + o.h && box.y + box.h > o.y
        );
        if (clash && priority(id) < 8) continue;
        placed.push(box);
        ctx.fillStyle = 'rgba(2, 5, 12, 0.6)';
        ctx.fillRect(box.x, box.y, box.w, box.h);
        ctx.fillStyle = tag ? '#ffb38a' : rgba(BODY_STYLE[id].color, ambient ? 0.7 : 0.95);
        ctx.fillText(text, x, y);
      }
    };

    const drawOffstageMarkers = (project: (v: Vec3) => Projected, positions: Map<NodeId, Vec3>) => {
      const cx = width / 2;
      const cy = height / 2;
      const inset = 18;
      ctx.font = '700 9px "Space Mono", monospace';
      for (const id of ALL_NODES) {
        const p = project(positions.get(id)!);
        if (p.x > inset && p.x < width - inset && p.y > inset && p.y < height - inset) continue;
        const dx = p.x - cx;
        const dy = p.y - cy;
        const k = Math.min(
          Math.abs((width / 2 - inset) / (dx || 1e-6)),
          Math.abs((height / 2 - inset) / (dy || 1e-6))
        );
        const x = cx + dx * k;
        const y = cy + dy * k;
        const angle = Math.atan2(dy, dx);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.fillStyle = BODY_STYLE[id].color;
        ctx.beginPath();
        ctx.moveTo(6, 0);
        ctx.lineTo(-4, -5);
        ctx.lineTo(-4, 5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        const text = `${id.toUpperCase()} ${radius(positions.get(id)!).toFixed(1)} AU`;
        const w = ctx.measureText(text).width;
        const tx = Math.min(width - inset - w, Math.max(inset, x - (dx > 0 ? w + 10 : -10)));
        const ty = Math.min(height - inset, Math.max(inset + 8, y + (dy > 0 ? -8 : 16)));
        ctx.fillStyle = rgba(BODY_STYLE[id].color, 0.85);
        ctx.fillText(text, tx, ty);
      }
    };

    const drawTooltip = (id: NodeId, positions: Map<NodeId, Vec3>) => {
      const p = screen.get(id);
      if (!p) return;
      const r = radius(positions.get(id)!);
      const lines = [
        id.toUpperCase(),
        `${r.toFixed(2)} AU FROM SUN`,
        `${formatMinutes(r * LIGHT_MINUTES_PER_AU)} OF LIGHT`,
      ];
      ctx.font = '700 10px "Space Mono", monospace';
      const w = Math.max(...lines.map((line) => ctx.measureText(line).width)) + 16;
      const h = lines.length * 14 + 10;
      let x = p.x + 14;
      let y = p.y + 12;
      if (x + w > width - 6) x = p.x - w - 14;
      if (y + h > height - 6) y = p.y - h - 12;
      ctx.fillStyle = 'rgba(6, 12, 24, 0.94)';
      ctx.strokeStyle = rgba(BODY_STYLE[id].color, 0.8);
      ctx.lineWidth = 1;
      ctx.fillRect(x, y, w, h);
      ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
      lines.forEach((line, index) => {
        ctx.fillStyle = index === 0 ? BODY_STYLE[id].color : '#a7b4c9';
        ctx.fillText(line, x + 8, y + 17 + index * 14);
      });
    };

    // The ambient backdrop is held to 30 fps; the interactive model follows
    // AMBIENT_FPS (see app/performance.ts). Skipped frames leave `last` alone,
    // so the next drawn frame's dt covers them.
    const gate = frameGate(ambient ? 30 : undefined);
    const looping = () => visible && !document.hidden && !(reducedMotion && ambient);
    const frame = (now: number) => {
      raf = 0;
      // A hidden tab pauses here; onVisibility restarts the loop.
      if (document.hidden) return;
      if (!gate(now)) {
        if (looping()) raf = requestAnimationFrame(frame);
        return;
      }
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;

      if (s.playing) {
        s.t = Math.min(MAX_DAYS, s.t + s.speed * dt);
        if (s.t >= MAX_DAYS) s.playing = false;
      }
      if (ambient && !reducedMotion) s.azimuth += dt * 0.035;
      if (!s.dragging) s.tilt += (s.targetTilt - s.tilt) * Math.min(1, dt * 3.5);
      if (s.modeBlend < 1) s.modeBlend = Math.min(1, s.modeBlend + dt / 0.9);

      draw(now, dt);

      if (!ambient && now - lastSync > UI_SYNC_MS) {
        lastSync = now;
        setUiDays((current) => (current === s.t ? current : s.t));
        setPlaying((current) => (current === s.playing ? current : s.playing));
      }
      if (looping()) raf = requestAnimationFrame(frame);
    };

    const intersection = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !document.hidden && !raf) {
          last = performance.now();
          raf = requestAnimationFrame(frame);
        }
      },
      { rootMargin: '120px' }
    );
    intersection.observe(stage);
    raf = requestAnimationFrame(frame);

    const onVisibility = () => {
      if (document.hidden || !visible || raf) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    document.addEventListener('visibilitychange', onVisibility);

    // Pointer: hover/select bodies, drag to orbit the camera.
    let drag: { x: number; y: number; moved: boolean; pointer: string } | null = null;
    const pick = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      let best: NodeId | null = null;
      let bestDistance = 18;
      screen.forEach((p, id) => {
        const d = Math.hypot(p.x - x, p.y - y);
        if (d < bestDistance) {
          bestDistance = d;
          best = id;
        }
      });
      return best as NodeId | null;
    };

    const onPointerDown = (event: PointerEvent) => {
      drag = { x: event.clientX, y: event.clientY, moved: false, pointer: event.pointerType };
    };
    const onPointerMove = (event: PointerEvent) => {
      if (drag && (event.buttons & 1 || drag.pointer !== 'mouse')) {
        const dx = event.clientX - drag.x;
        const dy = event.clientY - drag.y;
        if (!drag.moved && Math.hypot(dx, dy) > 4) {
          drag.moved = true;
          s.dragging = true;
        }
        if (drag.moved) {
          s.azimuth += dx * 0.006;
          if (drag.pointer === 'mouse') {
            s.tilt = Math.min(1.25, Math.max(0, s.tilt + dy * 0.005));
            s.targetTilt = s.tilt;
          }
          drag.x = event.clientX;
          drag.y = event.clientY;
        }
        return;
      }
      if (event.pointerType === 'mouse') {
        s.hovered = pick(event);
        canvas.style.cursor = s.hovered ? 'pointer' : 'grab';
      }
    };
    const onPointerUp = (event: PointerEvent) => {
      if (drag && !drag.moved) {
        const hit = pick(event);
        if (hit) setSelected(hit);
      }
      if (drag?.moved && s.tilt > 0.05) setIs3d(true);
      drag = null;
      s.dragging = false;
    };
    const onPointerLeave = () => {
      s.hovered = null;
    };
    // The browser took the gesture over (usually a vertical scroll on touch).
    const onPointerCancel = () => {
      drag = null;
      s.dragging = false;
    };

    if (!ambient) {
      canvas.addEventListener('pointerdown', onPointerDown);
      canvas.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      canvas.addEventListener('pointercancel', onPointerCancel);
      canvas.addEventListener('pointerleave', onPointerLeave);
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      intersection.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      document.fonts?.removeEventListener('loadingdone', invalidateGuides);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerCancel);
      canvas.removeEventListener('pointerleave', onPointerLeave);
    };
  }, [ambient, reducedMotion]);

  // The render loop reads `sim`, so writes go there first and state follows.
  const jumpTo = (days: number) => {
    sim.current.t = days;
    setUiDays(days);
  };

  const setPlay = (value: boolean) => {
    sim.current.playing = value;
    setPlaying(value);
  };

  // A scenario caption describes one frozen moment, so moving the clock ends it.
  const takeControl = () => setScenarioId('');

  const applyScenario = (scenario: Scenario) => {
    setScenarioId(scenario.id);
    setFrom(scenario.from);
    setTo(scenario.to);
    setSelected(scenario.to);
    setMode(scenario.mode);
    jumpTo(scenario.tDays);
    setPlay(false);
  };

  const scenario = SCENARIOS.find((item) => item.id === scenarioId);

  if (ambient) {
    return (
      <div ref={stageRef} className={`absolute inset-0 ${className}`} aria-hidden="true">
        <canvas ref={canvasRef} className="block h-full w-full" />
      </div>
    );
  }

  const selectedBrief = isRelay(selected) ? RELAY_BRIEF : SETTLEMENT_BRIEFS[selected];
  const selectedDistance = radius(nodePosition(selected, uiDays));
  const hours = uiDays * 24;
  const years = uiDays / JULIAN_YEAR_DAYS;
  const elapsed =
    uiDays < 2 ? `T+ ${hours.toFixed(1)} h` : uiDays < 730 ? `T+ ${uiDays.toFixed(1)} d` : `T+ ${years.toFixed(2)} yr`;

  return (
    <div className={`ssm ${className}`}>
      <ModelStyles />

      <div className="ssm-scenarios" role="group" aria-label="Guided scenarios">
        <span className="ssm-scenarios__label">GUIDED TOUR</span>
        {SCENARIOS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`ssm-chip ${item.id === scenarioId ? 'ssm-chip--active' : ''}`}
            onClick={() => applyScenario(item)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="ssm-grid">
        <div className="ssm-stage-wrap">
          <div ref={stageRef} className="ssm-stage">
            <canvas
              ref={canvasRef}
              className="ssm-canvas"
              role="img"
              aria-label={`Solar system model on ${storyDate(uiDays)}. Best backbone route from ${from} to ${to}: ${bestRoute.nodes.join(' to ')}, one-way ${formatMinutes(bestRoute.delayMinutes)}.`}
            />

            <div className="ssm-hud ssm-hud--tl">
              <div className="ssm-hud__kicker">MODEL DATE</div>
              <div className="ssm-hud__date">{storyDate(uiDays)}</div>
              <div className="ssm-hud__sub">{elapsed} FROM EPOCH</div>
            </div>

            <div className="ssm-hud ssm-hud--tr">
              <div className="ssm-seg" role="group" aria-label="Scale">
                {SCALE_MODES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`ssm-seg__btn ${mode === item.id ? 'ssm-seg__btn--on' : ''}`}
                    onClick={() => setMode(item.id)}
                    aria-pressed={mode === item.id}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="ssm-seg" role="group" aria-label="View">
                <button
                  type="button"
                  className={`ssm-seg__btn ${is3d ? 'ssm-seg__btn--on' : ''}`}
                  onClick={() => setIs3d((value) => !value)}
                  aria-pressed={is3d}
                >
                  3D TILT
                </button>
                <button
                  type="button"
                  className={`ssm-seg__btn ${showLinks ? 'ssm-seg__btn--on' : ''}`}
                  onClick={() => setShowLinks((value) => !value)}
                  aria-pressed={showLinks}
                >
                  ALL LINKS
                </button>
              </div>
            </div>

            <div className="ssm-legend">
              <span><i className="ssm-key ssm-key--route" />YOUR ROUTE</span>
              <span><i className="ssm-key ssm-key--direct" />DIRECT PATH</span>
              <span><i className="ssm-key ssm-key--open" />OPEN LINK</span>
              <span><i className="ssm-key ssm-key--blocked" />SUN-BLOCKED</span>
              <span><i className="ssm-key ssm-key--maint" />MAINTENANCE</span>
            </div>
            <div className="ssm-hint">CLICK A WORLD · DRAG TO ORBIT</div>
          </div>

          <div className="ssm-transport">
            <button
              type="button"
              className="ssm-play"
              onClick={() => {
                takeControl();
                setPlay(!playing);
              }}
              aria-label={playing ? 'Pause' : 'Play'}
            >
              {playing ? '❚❚' : '▶'}
            </button>
            <div className="ssm-seg" role="group" aria-label="Speed">
              {SPEEDS.map((speed, index) => (
                <button
                  key={speed.label}
                  type="button"
                  className={`ssm-seg__btn ${speedIndex === index ? 'ssm-seg__btn--on' : ''}`}
                  onClick={() => {
                    takeControl();
                    setSpeedIndex(index);
                    setPlay(true);
                  }}
                >
                  {speed.label}
                </button>
              ))}
            </div>
            <label className="ssm-scrub">
              <span className="sr-only">Model time</span>
              <input
                type="range"
                min={0}
                max={MAX_DAYS}
                step={0.25}
                value={uiDays}
                onChange={(event) => {
                  takeControl();
                  jumpTo(Number(event.target.value));
                }}
                style={{ ['--fill' as string]: `${(uiDays / MAX_DAYS) * 100}%` }}
              />
              <span className="ssm-scrub__caption">
                <span>EPOCH</span>
                <span>200-YEAR VALIDATION SPAN</span>
                <span>+200 YR</span>
              </span>
            </label>
            <div className="ssm-seg" role="group" aria-label="Shifted epochs">
              {[0, 1, 10, 100].map((offset) => (
                <button
                  key={offset}
                  type="button"
                  className={`ssm-seg__btn ${Math.abs(uiDays - offset * JULIAN_YEAR_DAYS) < 0.01 ? 'ssm-seg__btn--on' : ''}`}
                  onClick={() => {
                    takeControl();
                    jumpTo(offset * JULIAN_YEAR_DAYS);
                  }}
                >
                  {offset === 0 ? 'T=0' : `+${offset} YR`}
                </button>
              ))}
            </div>
          </div>
        </div>

        <aside className="ssm-panel">
          <div className="ssm-panel__title">ROUTE PLANNER</div>
          <div className="ssm-od">
            <label className="ssm-field">
              <span>FROM</span>
              <select
                value={from}
                onChange={(event) => {
                  const next = event.target.value as SettlementId;
                  if (next === to) setTo(from);
                  setFrom(next);
                  takeControl();
                }}
              >
                {SETTLEMENTS.map((id) => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="ssm-swap"
              onClick={() => {
                setFrom(to);
                setTo(from);
                takeControl();
              }}
              aria-label="Swap origin and destination"
            >
              ⇄
            </button>
            <label className="ssm-field">
              <span>TO</span>
              <select
                value={to}
                onChange={(event) => {
                  const next = event.target.value as SettlementId;
                  if (next === from) setFrom(to);
                  setTo(next);
                  takeControl();
                }}
              >
                {SETTLEMENTS.map((id) => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className={`ssm-card ${bestRoute.available ? '' : 'ssm-card--down'}`}>
            <div className="ssm-card__head">
              <span>BACKBONE</span>
              <span className="ssm-card__who">OPERATORS ONLY</span>
            </div>
            <div className="ssm-path">
              {bestRoute.nodes.map((node, index) => (
                <span key={`${node}-${index}`} className="ssm-path__node">
                  {index > 0 && <span className="ssm-path__arrow">→</span>}
                  <span style={{ color: BODY_STYLE[node].color }}>{node.replace('Relay ', 'R-').toUpperCase()}</span>
                </span>
              ))}
            </div>
            <dl className="ssm-stats">
              <div>
                <dt>ONE-WAY</dt>
                <dd>{formatMinutes(bestRoute.delayMinutes)}</dd>
              </div>
              <div>
                <dt>HOP LOSS</dt>
                <dd>{bestRoute.hops.map((hop) => formatPercent(hop.loss)).join(' · ')}</dd>
              </div>
              <div>
                <dt>ALL HOPS, 1ST TRY</dt>
                <dd>{formatPercent(bestRoute.firstTryProbability)}</dd>
              </div>
            </dl>
            <div className="ssm-status">
              {bestRoute.available
                ? 'OPEN · RECEIPTS + UP TO 4 LAUNCHES PER HOP'
                : 'NO OPEN ROUTE · PACKETS WAIT IN QUEUE'}
            </div>
            <details className="ssm-alts">
              <summary>ALL {snapshot.routes.length} CANDIDATE ROUTES (≤ 3 LINKS)</summary>
              <ul>
                {snapshot.routes.map((route) => (
                  <li key={route.nodes.join('>')} className={route.available ? '' : 'ssm-alts__down'}>
                    <span>{route.nodes.map((node) => node.replace('Relay ', 'R-').slice(0, 3).toUpperCase()).join('→')}</span>
                    <span>
                      {route.available
                        ? formatMinutes(route.delayMinutes)
                        : route.hops.some((hop) => hop.blocked)
                          ? 'SUN'
                          : 'MAINT'}
                    </span>
                  </li>
                ))}
              </ul>
            </details>
          </div>

          <div className={`ssm-card ssm-card--direct ${snapshot.direct.blocked ? 'ssm-card--down' : ''}`}>
            <div className="ssm-card__head">
              <span>DIRECT</span>
              <span className="ssm-card__who">CLIENTS ONLY</span>
            </div>
            <dl className="ssm-stats">
              <div>
                <dt>ONE-WAY</dt>
                <dd>{formatMinutes(snapshot.direct.delayMinutes)}</dd>
              </div>
              <div>
                <dt>LOSS</dt>
                <dd>{formatPercent(snapshot.direct.loss)}</dd>
              </div>
              <div>
                <dt>SUN CLEARANCE</dt>
                <dd>{snapshot.direct.clearanceAu.toFixed(3)} AU</dd>
              </div>
            </dl>
            <div className="ssm-status">
              {snapshot.direct.blocked ? 'BLOCKED · PATH CROSSES 0.10 AU OF THE SUN' : 'CLEAR · NO RECEIPT, NO RETRY'}
            </div>
          </div>

          <div className="ssm-body">
            <div className="ssm-body__head">
              <span className="ssm-body__dot" style={{ background: BODY_STYLE[selected].color }} />
              <span className="ssm-body__name">{selected.toUpperCase()}</span>
            </div>
            <div className="ssm-body__role">{selectedBrief.role}</div>
            <p className="ssm-body__detail">{selectedBrief.detail}</p>
            <dl className="ssm-stats ssm-stats--tight">
              <div>
                <dt>FROM SUN</dt>
                <dd>{selectedDistance.toFixed(2)} AU</dd>
              </div>
              <div>
                <dt>ORBIT</dt>
                <dd>{formatPeriod(orbitalPeriodDays(selected))}</dd>
              </div>
              <div>
                <dt>SEMI-MAJOR AXIS</dt>
                <dd>{semiMajorAxis(selected).toFixed(2)} AU</dd>
              </div>
            </dl>
            {!isRelay(selected) && (
              <div className="ssm-body__actions">
                <button
                  type="button"
                  onClick={() => {
                    const id = selected as SettlementId;
                    if (id === to) setTo(from);
                    setFrom(id);
                    takeControl();
                  }}
                >
                  SEND FROM HERE
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const id = selected as SettlementId;
                    if (id === from) setFrom(to);
                    setTo(id);
                    takeControl();
                  }}
                >
                  SEND TO HERE
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>

      <div className="ssm-caption" aria-live="polite">
        <span className="ssm-caption__tag">{scenario ? scenario.label : 'FREE FLIGHT'}</span>
        <p>
          {scenario
            ? scenario.caption
            : 'Pick any two settlements. The planner solves the light-time equation with moving receivers, checks every hop against the 0.10 AU solar exclusion and the maintenance windows, and picks the fastest open backbone route of at most three links.'}
        </p>
      </div>
      <p className="ssm-footnote">
        Positions propagate the brief&apos;s frozen JPL elements as fixed Kepler ellipses from 2026-09-22 00:00 TDB
        (labelled 2126 in the story). Link colours on the map use instantaneous geometry; the planner numbers include
        light-time, 1 s serialization per launch and 1 s relay processing. A teaching model, not the reference
        propagator.
      </p>
    </div>
  );
}

function formatPeriod(days: number) {
  return days < 800 ? `${days.toFixed(0)} DAYS` : `${(days / JULIAN_YEAR_DAYS).toFixed(1)} YR`;
}

function ModelStyles() {
  return (
    <style>{`
      .ssm {
        --ssm-line: #1d4f83;
        --ssm-panel: rgba(7, 12, 24, 0.94);
        font-family: 'Space Mono', monospace;
      }

      .ssm-scenarios {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
        margin-bottom: 14px;
      }

      .ssm-scenarios__label {
        font-family: 'Orbitron', sans-serif;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 2px;
        color: #7e90ab;
        margin-right: 4px;
      }

      .ssm-chip {
        border: 1px solid #294f7d;
        background: rgba(8, 16, 30, 0.9);
        color: #9cc9ff;
        padding: 7px 11px;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 1px;
        transition: border-color 160ms ease, color 160ms ease, box-shadow 160ms ease, transform 160ms ease;
      }

      .ssm-chip:hover {
        border-color: #63f6ff;
        color: #e8fbff;
        transform: translateY(-1px);
      }

      .ssm-chip--active {
        border-color: #FA4616;
        color: #fff;
        background: rgba(250, 70, 22, 0.14);
        box-shadow: 0 0 16px rgba(250, 70, 22, 0.25);
      }

      .ssm-grid {
        display: grid;
        gap: 14px;
      }

      @media (min-width: 1024px) {
        .ssm-grid {
          grid-template-columns: minmax(0, 1fr) 320px;
        }
      }

      .ssm-stage-wrap {
        border: 1px solid var(--ssm-line);
        background: #02040a;
        box-shadow: 0 0 0 3px rgba(5, 11, 23, 0.98), 0 0 40px rgba(4, 74, 148, 0.18);
        min-width: 0;
      }

      .ssm-stage {
        position: relative;
        height: clamp(380px, 58vw, 640px);
        overflow: hidden;
      }

      .ssm-canvas {
        display: block;
        width: 100%;
        height: 100%;
        touch-action: pan-y;
        cursor: grab;
        image-rendering: auto;
      }

      .ssm-hud {
        position: absolute;
        pointer-events: none;
      }

      .ssm-hud > * {
        pointer-events: auto;
      }

      .ssm-hud--tl {
        top: 12px;
        left: 12px;
        padding: 8px 10px;
        border: 1px solid rgba(41, 79, 125, 0.8);
        background: rgba(4, 8, 18, 0.78);
        backdrop-filter: blur(3px);
      }

      .ssm-hud__kicker {
        font-family: 'Orbitron', sans-serif;
        font-size: 9px;
        letter-spacing: 2px;
        color: #7e90ab;
      }

      .ssm-hud__date {
        font-family: 'VT323', monospace;
        font-size: 30px;
        line-height: 1;
        color: #63f6ff;
        text-shadow: 0 0 12px rgba(99, 246, 255, 0.45);
      }

      .ssm-hud__sub {
        font-size: 10px;
        color: #a7b4c9;
        letter-spacing: 1px;
      }

      .ssm-hud--tr {
        top: 12px;
        right: 12px;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 6px;
      }

      .ssm-seg {
        display: inline-flex;
        flex-wrap: wrap;
        border: 1px solid #294f7d;
        background: rgba(4, 8, 18, 0.85);
      }

      .ssm-seg__btn {
        padding: 6px 9px;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.8px;
        color: #7e90ab;
        border-right: 1px solid rgba(41, 79, 125, 0.6);
        transition: color 140ms ease, background 140ms ease;
      }

      .ssm-seg__btn:last-child {
        border-right: 0;
      }

      .ssm-seg__btn:hover {
        color: #e8fbff;
      }

      .ssm-seg__btn--on {
        color: #02040a;
        background: #63f6ff;
      }

      .ssm-seg__btn--on:hover {
        color: #02040a;
      }

      .ssm-legend {
        position: absolute;
        left: 12px;
        bottom: 12px;
        display: flex;
        flex-wrap: wrap;
        gap: 6px 12px;
        max-width: calc(100% - 24px);
        padding: 6px 9px;
        border: 1px solid rgba(41, 79, 125, 0.6);
        background: rgba(4, 8, 18, 0.72);
        font-size: 9px;
        letter-spacing: 0.8px;
        color: #a7b4c9;
        pointer-events: none;
      }

      .ssm-legend span {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }

      .ssm-key {
        display: inline-block;
        width: 16px;
        height: 0;
        border-top: 2px solid;
      }

      .ssm-key--route { border-color: #ff8c5a; box-shadow: 0 0 6px #FA4616; }
      .ssm-key--direct { border-top-style: dashed; border-color: #ffb84d; }
      .ssm-key--open { border-color: rgba(99, 190, 255, 0.6); border-top-width: 1px; }
      .ssm-key--blocked { border-top-style: dotted; border-color: #ff3b5c; }
      .ssm-key--maint { border-top-style: dashed; border-color: #ffb84d; opacity: 0.7; }

      .ssm-hint {
        position: absolute;
        right: 12px;
        bottom: 12px;
        font-size: 9px;
        letter-spacing: 1.2px;
        color: rgba(167, 180, 201, 0.55);
        pointer-events: none;
      }

      @media (max-width: 767px) {
        .ssm-hint { display: none; }
        .ssm-legend { font-size: 8px; gap: 4px 8px; }
        .ssm-hud__date { font-size: 24px; }
      }

      /* The view controls wrap to two rows here, so the date drops below them. */
      @media (max-width: 640px) {
        .ssm-stage { height: 480px; }
        .ssm-hud--tl { top: 84px; padding: 6px 8px; }
      }

      .ssm-transport {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 10px 12px;
        padding: 10px 12px;
        border-top: 1px solid var(--ssm-line);
        background: linear-gradient(180deg, #07101d, #050a14);
      }

      .ssm-play {
        width: 38px;
        height: 32px;
        border: 1px solid #FA4616;
        background: rgba(250, 70, 22, 0.14);
        color: #ffb38a;
        font-size: 12px;
        box-shadow: 0 0 12px rgba(250, 70, 22, 0.25);
      }

      .ssm-scrub {
        flex: 1 1 220px;
        min-width: 180px;
        display: flex;
        flex-direction: column;
        gap: 3px;
      }

      .ssm-scrub input {
        -webkit-appearance: none;
        appearance: none;
        width: 100%;
        height: 6px;
        background: linear-gradient(90deg, #63f6ff 0 var(--fill), #12233a var(--fill) 100%);
        border: 1px solid #294f7d;
        outline: none;
      }

      .ssm-scrub input::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 12px;
        height: 16px;
        background: #e8fbff;
        border: 2px solid #63f6ff;
        box-shadow: 0 0 10px rgba(99, 246, 255, 0.7);
        cursor: pointer;
      }

      .ssm-scrub input::-moz-range-thumb {
        width: 10px;
        height: 14px;
        background: #e8fbff;
        border: 2px solid #63f6ff;
        border-radius: 0;
        cursor: pointer;
      }

      .ssm-scrub__caption {
        display: flex;
        justify-content: space-between;
        font-size: 8px;
        letter-spacing: 1px;
        color: #5f7390;
      }

      .ssm-panel {
        display: flex;
        flex-direction: column;
        gap: 10px;
        min-width: 0;
      }

      .ssm-panel__title {
        font-family: 'Orbitron', sans-serif;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 2.4px;
        color: #FA4616;
      }

      .ssm-od {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        align-items: end;
        gap: 6px;
      }

      .ssm-field {
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-size: 9px;
        letter-spacing: 1.5px;
        color: #7e90ab;
      }

      .ssm-field select {
        width: 100%;
        padding: 7px 8px;
        border: 1px solid #294f7d;
        background: #07101d;
        color: #e8fbff;
        font-family: 'Space Mono', monospace;
        font-size: 12px;
        font-weight: 700;
      }

      .ssm-swap {
        height: 34px;
        padding: 0 9px;
        border: 1px solid #294f7d;
        background: #07101d;
        color: #63f6ff;
        font-size: 14px;
      }

      .ssm-swap:hover { border-color: #63f6ff; }

      .ssm-card {
        position: relative;
        border: 1px solid rgba(250, 70, 22, 0.55);
        background: var(--ssm-panel);
        padding: 10px 12px;
        transition: border-color 200ms ease;
      }

      .ssm-card--direct {
        border-color: rgba(255, 184, 77, 0.45);
      }

      .ssm-card--down {
        border-color: rgba(255, 59, 92, 0.8);
        box-shadow: inset 0 0 24px rgba(255, 59, 92, 0.12);
      }

      .ssm-card__head {
        display: flex;
        justify-content: space-between;
        font-family: 'Orbitron', sans-serif;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 1.6px;
        color: #F4F4F4;
        margin-bottom: 6px;
      }

      .ssm-card__who {
        font-family: 'Space Mono', monospace;
        font-size: 9px;
        color: #7e90ab;
      }

      .ssm-path {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        font-size: 12px;
        font-weight: 700;
        margin-bottom: 6px;
      }

      .ssm-path__arrow {
        color: #5f7390;
        margin-right: 4px;
      }

      .ssm-stats {
        display: grid;
        gap: 3px;
        margin: 0;
      }

      .ssm-stats div {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        font-size: 11px;
      }

      .ssm-stats dt {
        color: #7e90ab;
        letter-spacing: 0.8px;
      }

      .ssm-stats dd {
        margin: 0;
        color: #e8fbff;
        font-weight: 700;
        text-align: right;
      }

      .ssm-stats--tight div { font-size: 10px; }

      .ssm-status {
        margin-top: 8px;
        padding-top: 6px;
        border-top: 1px dashed rgba(41, 79, 125, 0.7);
        font-size: 9px;
        letter-spacing: 1px;
        color: #4cff87;
      }

      .ssm-card--down .ssm-status { color: #ff5a6e; }

      .ssm-alts {
        margin-top: 6px;
        font-size: 9px;
        color: #7e90ab;
      }

      .ssm-alts summary {
        cursor: pointer;
        letter-spacing: 1px;
      }

      .ssm-alts summary:hover { color: #9cc9ff; }

      .ssm-alts ul {
        margin: 6px 0 0;
        padding: 0;
        list-style: none;
        display: grid;
        gap: 2px;
      }

      .ssm-alts li {
        display: flex;
        justify-content: space-between;
        color: #a7b4c9;
      }

      .ssm-alts li:first-child { color: #ffb38a; }
      .ssm-alts .ssm-alts__down { color: #ff5a6e; }

      .ssm-body {
        border: 1px solid rgba(99, 246, 255, 0.35);
        background: var(--ssm-panel);
        padding: 10px 12px;
      }

      .ssm-body__head {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .ssm-body__dot {
        width: 10px;
        height: 10px;
        box-shadow: 0 0 10px currentColor;
      }

      .ssm-body__name {
        font-family: 'Orbitron', sans-serif;
        font-size: 14px;
        font-weight: 700;
        letter-spacing: 1.5px;
        color: #F4F4F4;
      }

      .ssm-body__role {
        margin: 4px 0 6px;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 1px;
        color: #63f6ff;
      }

      .ssm-body__detail {
        margin: 0 0 8px;
        font-size: 11px;
        line-height: 1.6;
        color: #a7b4c9;
      }

      .ssm-body__actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 6px;
        margin-top: 8px;
      }

      .ssm-body__actions button {
        padding: 6px 4px;
        border: 1px solid #294f7d;
        background: #07101d;
        color: #9cc9ff;
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 1px;
      }

      .ssm-body__actions button:hover {
        border-color: #FA4616;
        color: #fff;
      }

      .ssm-caption {
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        gap: 8px 14px;
        margin-top: 14px;
        padding: 12px 14px;
        border-left: 3px solid #FA4616;
        background: rgba(250, 70, 22, 0.06);
      }

      .ssm-caption__tag {
        font-family: 'Orbitron', sans-serif;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 1.8px;
        color: #FA4616;
        white-space: nowrap;
      }

      .ssm-caption p {
        flex: 1 1 320px;
        margin: 0;
        font-size: 13px;
        line-height: 1.7;
        color: #d3dcea;
      }

      .ssm-footnote {
        margin-top: 10px;
        font-size: 10px;
        line-height: 1.6;
        color: #5f7390;
      }
    `}</style>
  );
}
