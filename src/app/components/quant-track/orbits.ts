// Orbital model for the MultiPlanetary Exchange track page.
//
// Elements are the frozen JPL-derived set from the participant data archive
// (orbital_elements.json / network_model.json, epoch 2026-09-22 00:00 TDB), and
// propagation follows the brief: independent fixed Kepler ellipses, relays on
// circles of radius √8 AU. At t = 0 this reproduces the brief's epoch check
// positions to the printed 6 decimals. It drives visuals and explanations only;
// teams must use the supplied reference propagator for scored work.

export type Vec3 = [number, number, number];

export const SETTLEMENTS = [
  'Mercury',
  'Venus',
  'Earth',
  'Mars',
  'Ceres',
  'Jupiter',
  'Saturn',
  'Uranus',
  'Neptune',
] as const;

export type SettlementId = (typeof SETTLEMENTS)[number];
export type RelayId = 'Relay A' | 'Relay B';
export type NodeId = SettlementId | RelayId;

export const RELAYS: RelayId[] = ['Relay A', 'Relay B'];

type Elements = {
  a: number; // AU
  e: number;
  i: number; // deg
  node: number; // deg
  peri: number; // deg
  m0: number; // deg at epoch
  n: number; // deg per day
};

const ELEMENTS: Record<SettlementId, Elements> = {
  Mercury: { a: 0.3870972529131369, e: 0.2056391287772749, i: 7.003376739406431, node: 48.297318639624, peri: 29.20135514716107, m0: 158.0266899039272, n: 4.092361365466381 },
  Venus: { a: 0.7233373086832101, e: 0.006766699201958504, i: 3.394338290322743, node: 76.60588195307673, peri: 54.91973283689823, m0: 208.0494051543445, n: 1.602113597941237 },
  Earth: { a: 0.9995049145908903, e: 0.0170555221835682, i: 0.005393396667292408, node: 176.6206272557732, peri: 287.7740198972571, m0: 256.1404947503081, n: 0.9863415430204476 },
  Mars: { a: 1.523653063744921, e: 0.09341941434148233, i: 1.847457546777179, node: 49.4809684852205, peri: 286.6331106769099, m0: 94.16517233830973, n: 0.5240527569294179 },
  Ceres: { a: 2.76595234413872, e: 0.07975569623146875, i: 10.58746044459709, node: 80.24898646132206, peri: 73.20145111086198, m0: 297.0156759369557, n: 0.2142579938193311 },
  Jupiter: { a: 5.203098453421111, e: 0.04811720556041555, i: 1.303413902448638, node: 100.5134326632505, peri: 273.6311561624746, m0: 111.2497988019995, n: 0.08308415302323827 },
  Saturn: { a: 9.540477417533626, e: 0.05517598618913071, i: 2.48865020495108, node: 113.7050072792812, peri: 338.628023118351, m0: 284.392757877648, n: 0.03345114340526617 },
  Uranus: { a: 19.26360048570033, e: 0.04751104687977423, i: 0.7703427738092589, node: 74.05272032650134, peri: 92.45259678574354, m0: 261.3717598156659, n: 0.01165755195958871 },
  Neptune: { a: 30.06405108492006, e: 0.009773760473970381, i: 1.775337461214952, node: 131.9885078888837, peri: 281.8372243167906, m0: 309.6507012967161, n: 0.005979212745910185 },
};

export const LIGHT_MINUTES_PER_AU = 8.317;
export const SOLAR_EXCLUSION_AU = 0.1;
export const RELAY_RADIUS_AU = 2 * Math.SQRT2;
export const RELAY_PERIOD_DAYS = 365.2568983 * RELAY_RADIUS_AU ** 1.5;
const RELAY_PHASE_DEG: Record<RelayId, number> = { 'Relay A': 45, 'Relay B': 135 };

export const JULIAN_YEAR_DAYS = 365.25;
const MINUTES_PER_DAY = 1440;
const ONE_SECOND_DAYS = 1 / 86400;

export const BACKBONE_LOSS_RATE = 0.02;
export const DIRECT_LOSS_RATE = 0.08;
export const backboneLoss = (au: number) => 1 - Math.exp(-BACKBONE_LOSS_RATE * au);
export const directLoss = (au: number) => 1 - Math.exp(-DIRECT_LOSS_RATE * au);

const DEG = Math.PI / 180;

export function isRelay(id: NodeId): id is RelayId {
  return id === 'Relay A' || id === 'Relay B';
}

export function orbitalPeriodDays(id: NodeId) {
  return isRelay(id) ? RELAY_PERIOD_DAYS : 360 / ELEMENTS[id].n;
}

export function semiMajorAxis(id: NodeId) {
  return isRelay(id) ? RELAY_RADIUS_AU : ELEMENTS[id].a;
}

function solveKepler(meanAnomaly: number, e: number) {
  let E = e < 0.8 ? meanAnomaly : Math.PI;
  for (let step = 0; step < 30; step += 1) {
    const delta = (E - e * Math.sin(E) - meanAnomaly) / (1 - e * Math.cos(E));
    E -= delta;
    if (Math.abs(delta) < 1e-13) break;
  }
  return E;
}

// Per-body terms that never change, computed once: ellipsePoint runs for every
// node on every frame and every orbit-path sample.
const FIXED_TERMS = new WeakMap(
  SETTLEMENTS.map((id) => {
    const el = ELEMENTS[id];
    return [
      el,
      {
        cw: Math.cos(el.peri * DEG),
        sw: Math.sin(el.peri * DEG),
        ci: Math.cos(el.i * DEG),
        si: Math.sin(el.i * DEG),
        cO: Math.cos(el.node * DEG),
        sO: Math.sin(el.node * DEG),
        minor: Math.sqrt(1 - el.e * el.e),
      },
    ] as const;
  })
);

function ellipsePoint(el: Elements, eccentricAnomaly: number): Vec3 {
  const { cw, sw, ci, si, cO, sO, minor } = FIXED_TERMS.get(el)!;
  const xp = el.a * (Math.cos(eccentricAnomaly) - el.e);
  const yp = el.a * minor * Math.sin(eccentricAnomaly);
  return [
    (cO * cw - sO * sw * ci) * xp + (-cO * sw - sO * cw * ci) * yp,
    (sO * cw + cO * sw * ci) * xp + (-sO * sw + cO * cw * ci) * yp,
    sw * si * xp + cw * si * yp,
  ];
}

export function nodePosition(id: NodeId, tDays: number): Vec3 {
  if (isRelay(id)) {
    const angle = (RELAY_PHASE_DEG[id] + (360 * tDays) / RELAY_PERIOD_DAYS) * DEG;
    return [RELAY_RADIUS_AU * Math.cos(angle), RELAY_RADIUS_AU * Math.sin(angle), 0];
  }
  const el = ELEMENTS[id];
  const meanAnomaly = ((((el.m0 + el.n * tDays) % 360) + 360) % 360) * DEG;
  return ellipsePoint(el, solveKepler(meanAnomaly, el.e));
}

// The full ellipse, sampled evenly in eccentric anomaly, for drawing orbits.
export function orbitPath(id: NodeId, samples = 240): Vec3[] {
  const points: Vec3[] = [];
  for (let k = 0; k <= samples; k += 1) {
    const angle = (k / samples) * Math.PI * 2;
    if (isRelay(id)) {
      points.push([RELAY_RADIUS_AU * Math.cos(angle), RELAY_RADIUS_AU * Math.sin(angle), 0]);
    } else {
      points.push(ellipsePoint(ELEMENTS[id], angle));
    }
  }
  return points;
}

export const distance = (p: Vec3, q: Vec3) => Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2]);
export const radius = (p: Vec3) => Math.hypot(p[0], p[1], p[2]);

// Closest approach of the straight segment p→q to the Sun at the origin.
export function sunClearance(p: Vec3, q: Vec3) {
  const dx = q[0] - p[0];
  const dy = q[1] - p[1];
  const dz = q[2] - p[2];
  const lengthSq = dx * dx + dy * dy + dz * dz;
  const s = lengthSq === 0 ? 0 : Math.min(1, Math.max(0, -(p[0] * dx + p[1] * dy + p[2] * dz) / lengthSq));
  return Math.hypot(p[0] + s * dx, p[1] + s * dy, p[2] + s * dz);
}

export type Flight = {
  from: NodeId;
  to: NodeId;
  emitDays: number;
  arriveDays: number;
  flightMinutes: number;
  pathAu: number;
  clearanceAu: number;
  blocked: boolean;
};

// Brief §2: solve t_a − t_e = 8.317 min/AU × |r_receiver(t_a) − r_sender(t_e)|
// by fixed-point iteration to 1 ms in t_a.
export function lightFlight(from: NodeId, to: NodeId, emitDays: number): Flight {
  const sender = nodePosition(from, emitDays);
  let arriveDays = emitDays;
  let receiver = nodePosition(to, arriveDays);
  for (let step = 0; step < 12; step += 1) {
    const next = emitDays + (distance(sender, receiver) * LIGHT_MINUTES_PER_AU) / MINUTES_PER_DAY;
    const converged = Math.abs(next - arriveDays) < 0.001 / 86400;
    arriveDays = next;
    receiver = nodePosition(to, arriveDays);
    if (converged) break;
  }
  const clearanceAu = sunClearance(sender, receiver);
  return {
    from,
    to,
    emitDays,
    arriveDays,
    flightMinutes: (arriveDays - emitDays) * MINUTES_PER_DAY,
    pathAu: distance(sender, receiver),
    clearanceAu,
    blocked: clearanceAu < SOLAR_EXCLUSION_AU,
  };
}

// One-time scheduled maintenance (brief §5), both directions.
export const MAINTENANCE = [
  { a: 'Relay B' as NodeId, b: 'Neptune' as NodeId, startHour: 2, endHour: 26 },
  { a: 'Relay B' as NodeId, b: 'Ceres' as NodeId, startHour: 240, endHour: 264 },
];

// A launch fails if its flight interval [t_e, t_a] overlaps the window (C4).
export function maintenanceOverlaps(a: NodeId, b: NodeId, fromDays: number, toDays: number) {
  return MAINTENANCE.some(
    (window) =>
      ((window.a === a && window.b === b) || (window.a === b && window.b === a)) &&
      fromDays * 24 < window.endHour &&
      toDays * 24 >= window.startHour
  );
}

// The 19 candidate backbone links: every gateway to each relay, plus A–B.
export const BACKBONE_LINKS: [NodeId, NodeId][] = [
  ...SETTLEMENTS.flatMap((s) => [
    [s, 'Relay A'] as [NodeId, NodeId],
    [s, 'Relay B'] as [NodeId, NodeId],
  ]),
  ['Relay A', 'Relay B'],
];

export type Hop = Flight & { loss: number; maintenance: boolean; available: boolean };

export type Route = {
  nodes: NodeId[];
  hops: Hop[];
  delayMinutes: number;
  // Chance a single launch on every hop survives, before any retries.
  firstTryProbability: number;
  available: boolean;
};

// Serialization (1 s) before every launch, 1 s processing at each relay, and no
// local access for backbone launches (C14).
function traceRoute(nodes: NodeId[], startDays: number): Route {
  const hops: Hop[] = [];
  let readyDays = startDays;
  for (let index = 0; index < nodes.length - 1; index += 1) {
    const emitDays = readyDays + ONE_SECOND_DAYS;
    const flight = lightFlight(nodes[index], nodes[index + 1], emitDays);
    const maintenance = maintenanceOverlaps(flight.from, flight.to, flight.emitDays, flight.arriveDays);
    hops.push({
      ...flight,
      loss: backboneLoss(flight.pathAu),
      maintenance,
      available: !flight.blocked && !maintenance,
    });
    readyDays = flight.arriveDays + ONE_SECOND_DAYS;
  }
  const last = hops[hops.length - 1];
  return {
    nodes,
    hops,
    delayMinutes: (last.arriveDays - startDays) * MINUTES_PER_DAY,
    firstTryProbability: hops.reduce((product, hop) => product * (1 - hop.loss), 1),
    available: hops.every((hop) => hop.available),
  };
}

// Every simple backbone route of at most three links between two gateways.
export function backboneRoutes(from: SettlementId, to: SettlementId, tDays: number): Route[] {
  const candidates: NodeId[][] = [
    [from, 'Relay A', to],
    [from, 'Relay B', to],
    [from, 'Relay A', 'Relay B', to],
    [from, 'Relay B', 'Relay A', to],
  ];
  return candidates
    .map((nodes) => traceRoute(nodes, tDays))
    .sort((x, y) => Number(y.available) - Number(x.available) || x.delayMinutes - y.delayMinutes);
}

export type DirectPath = Flight & { delayMinutes: number; loss: number };

// Direct service (C13): 1 s local access each end, 1 s serialization, flight.
export function directPath(from: SettlementId, to: SettlementId, tDays: number): DirectPath {
  const flight = lightFlight(from, to, tDays + 2 * ONE_SECOND_DAYS);
  return {
    ...flight,
    delayMinutes: flight.flightMinutes + 3 / 60,
    loss: directLoss(flight.pathAu),
  };
}

export function formatMinutes(minutes: number) {
  if (minutes < 1) return `${(minutes * 60).toFixed(0)} s`;
  if (minutes < 60) return `${minutes.toFixed(1)} min`;
  const hours = Math.floor(minutes / 60);
  const rest = Math.round(minutes - hours * 60);
  return rest === 60 ? `${hours + 1} h 00 min` : `${hours} h ${String(rest).padStart(2, '0')} min`;
}

export function formatPercent(probability: number, digits = 1) {
  return `${(probability * 100).toFixed(digits)}%`;
}

// The story runs a century ahead of the physics: positions are 2026's, the
// calendar label is 2126's.
const STORY_EPOCH_MS = Date.UTC(2126, 8, 22);

export function storyDate(tDays: number) {
  return new Date(STORY_EPOCH_MS + tDays * 86400000).toISOString().slice(0, 10);
}
