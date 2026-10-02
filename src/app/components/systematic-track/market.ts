// A small, deterministic market simulator and backtester for the Systematic
// Trading briefing. Everything here is illustrative: synthetic prices with a
// slow-moving drift (so trend-following has a modest, real edge) and clustered
// volatility (so drawdowns and regimes look like markets, not coin flips).

export const DAYS_PER_YEAR = 252;
export const START_YEAR = 2014;
export const YEARS = 12;
export const DAYS = DAYS_PER_YEAR * YEARS;

export const mulberry32 = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

// Box-Muller on top of a seeded uniform source.
export const gaussian = (rand: () => number) => {
  let u = 0;
  while (u === 0) u = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
};

export type Market = {
  seed: number;
  returns: Float64Array;
  prices: Float64Array;
  // Calendar year of each bar, for the by-year breakdown.
  years: Int16Array;
};

// trend: how much persistent drift the market carries. 0 is a pure random walk
// with no edge for any rule to find.
export const makeMarket = (seed: number, days = DAYS, trend = 1): Market => {
  const rand = mulberry32(seed * 2654435761 + 97);
  const returns = new Float64Array(days);
  const prices = new Float64Array(days);
  const years = new Int16Array(days);
  const baseVol = 0.16 / Math.sqrt(DAYS_PER_YEAR);
  let drift = 0;
  let variance = baseVol * baseVol;
  let price = 100;
  for (let t = 0; t < days; t += 1) {
    // Persistent drift: an AR(1) that wanders slowly, the source of the trend edge.
    drift = 0.994 * drift + 0.00011 * trend * gaussian(rand);
    const shock = gaussian(rand);
    // Rare crashes keep the tails honest.
    const jump = rand() < 0.0008 ? -(0.03 + rand() * 0.04) : 0;
    const r = 0.00035 + drift + Math.sqrt(variance) * shock + jump;
    // GARCH(1,1)-style clustering around the base volatility.
    variance = 0.000002 * 0.02 + 0.9 * variance + 0.08 * r * r + 0.02 * baseVol * baseVol;
    returns[t] = r;
    price *= 1 + r;
    prices[t] = price;
    years[t] = START_YEAR + Math.floor(t / DAYS_PER_YEAR);
  }
  return { seed, returns, prices, years };
};

// The brief's rule: hold out the most recent 20% of history or the most recent
// two years, whichever is shorter.
export const holdoutDays = (totalDays: number) => Math.min(Math.round(totalDays * 0.2), 2 * DAYS_PER_YEAR);

export type StrategyParams = {
  // Time-series momentum lookback, in bars.
  lookback: number;
  // Bars between computing a signal and earning its return. 0 is lookahead.
  lag: 0 | 1;
  // One-way cost in basis points per unit of position traded.
  costBps: number;
  // Scale positions so the strategy targets a constant volatility.
  volTarget: boolean;
};

export type Backtest = {
  position: Float64Array;
  gross: Float64Array;
  net: Float64Array;
  equity: Float64Array;
  grossEquity: Float64Array;
};

const VOL_WINDOW = 20;
const TARGET_VOL = 0.12 / Math.sqrt(DAYS_PER_YEAR);
const MAX_LEVERAGE = 2;

export const runBacktest = (returns: Float64Array, params: StrategyParams): Backtest => {
  const n = returns.length;
  const position = new Float64Array(n);
  const gross = new Float64Array(n);
  const net = new Float64Array(n);
  const equity = new Float64Array(n);
  const grossEquity = new Float64Array(n);

  // Signal formed with information through bar t (inclusive).
  const signal = new Float64Array(n);
  let window = 0;
  let sq = 0;
  for (let t = 0; t < n; t += 1) {
    window += returns[t];
    if (t >= params.lookback) window -= returns[t - params.lookback];
    sq += returns[t] * returns[t];
    if (t >= VOL_WINDOW) sq -= returns[t - VOL_WINDOW] * returns[t - VOL_WINDOW];
    if (t + 1 < params.lookback) continue;
    let s = window > 0 ? 1 : window < 0 ? -1 : 0;
    if (params.volTarget && t + 1 >= VOL_WINDOW) {
      const realized = Math.sqrt(Math.max(sq / VOL_WINDOW, 1e-10));
      s *= Math.min(MAX_LEVERAGE, TARGET_VOL / realized);
    }
    signal[t] = s;
  }

  let eq = 1;
  let geq = 1;
  let prev = 0;
  for (let t = 0; t < n; t += 1) {
    // With lag 1 the bar-t return is earned by the signal formed at t-1.
    // With lag 0 the signal already contains r[t]: that is the lookahead bug.
    const pos = params.lag === 1 ? (t > 0 ? signal[t - 1] : 0) : signal[t];
    const traded = Math.abs(pos - prev);
    prev = pos;
    position[t] = pos;
    gross[t] = pos * returns[t];
    net[t] = gross[t] - traded * (params.costBps / 10000);
    eq *= 1 + net[t];
    geq *= 1 + gross[t];
    equity[t] = eq;
    grossEquity[t] = geq;
  }
  return { position, gross, net, equity, grossEquity };
};

export type Metrics = {
  annReturn: number;
  annVol: number;
  sharpe: number;
  maxDrawdown: number;
  // Average yearly trading, in multiples of capital (one-way).
  turnover: number;
  skew: number;
  worstMonth: number;
  days: number;
};

export const metrics = (bt: Pick<Backtest, 'net' | 'position'>, from = 0, to = bt.net.length): Metrics => {
  const n = Math.max(1, to - from);
  let sum = 0;
  for (let t = from; t < to; t += 1) sum += bt.net[t];
  const mean = sum / n;
  let m2 = 0;
  let m3 = 0;
  for (let t = from; t < to; t += 1) {
    const d = bt.net[t] - mean;
    m2 += d * d;
    m3 += d * d * d;
  }
  const variance = m2 / Math.max(1, n - 1);
  const sd = Math.sqrt(variance);

  let eq = 1;
  let peak = 1;
  let maxDrawdown = 0;
  let traded = 0;
  for (let t = from; t < to; t += 1) {
    eq *= 1 + bt.net[t];
    peak = Math.max(peak, eq);
    maxDrawdown = Math.min(maxDrawdown, eq / peak - 1);
    const before = t > 0 ? bt.position[t - 1] : 0;
    traded += Math.abs(bt.position[t] - before);
  }

  let worstMonth = 0;
  for (let start = from; start < to; start += 21) {
    let month = 1;
    for (let t = start; t < Math.min(to, start + 21); t += 1) month *= 1 + bt.net[t];
    worstMonth = Math.min(worstMonth, month - 1);
  }

  return {
    annReturn: Math.pow(eq, DAYS_PER_YEAR / n) - 1,
    annVol: sd * Math.sqrt(DAYS_PER_YEAR),
    sharpe: sd > 0 ? (mean / sd) * Math.sqrt(DAYS_PER_YEAR) : 0,
    maxDrawdown,
    turnover: (traded / n) * DAYS_PER_YEAR,
    skew: sd > 0 ? m3 / n / (sd * sd * sd) : 0,
    worstMonth,
    days: n,
  };
};

export const yearlyReturns = (net: Float64Array, years: Int16Array) => {
  const out: { year: number; ret: number }[] = [];
  let year = years[0];
  let growth = 1;
  for (let t = 0; t < net.length; t += 1) {
    if (years[t] !== year) {
      out.push({ year, ret: growth - 1 });
      year = years[t];
      growth = 1;
    }
    growth *= 1 + net[t];
  }
  out.push({ year, ret: growth - 1 });
  return out;
};

// Acklam's rational approximation to the inverse normal CDF.
export const normInv = (p: number) => {
  const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
  const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
  const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
  const lo = 0.02425;
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  if (p < lo) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  if (p > 1 - lo) {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  const q = p - 0.5;
  const r = q * q;
  return ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
};

// Bailey & López de Prado: the Sharpe ratio you should expect from the best of
// `trials` strategies that have no edge at all, given `years` of data.
export const expectedMaxSharpe = (trials: number, years: number) => {
  if (trials <= 1) return 0;
  const gamma = 0.5772156649;
  const spread = Math.sqrt(1 / years);
  return spread * ((1 - gamma) * normInv(1 - 1 / trials) + gamma * normInv(1 - 1 / (trials * Math.E)));
};

export const pct = (value: number, digits = 1) => `${value >= 0 ? '' : '−'}${Math.abs(value * 100).toFixed(digits)}%`;
export const num = (value: number, digits = 2) => `${value >= 0 ? '' : '−'}${Math.abs(value).toFixed(digits)}`;
