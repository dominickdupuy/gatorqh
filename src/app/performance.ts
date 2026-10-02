// How much ambient motion this device can afford.
//
// Low-power mode turns off the decorative background animation (see the
// html.low-power rules in styles/index.css) and caps canvas animation at 30 fps.
// It switches on for machines with few CPU threads or little memory, or when
// the browser asks to save data. Hardware hints miss most older phones, which
// report eight cores, so the page also times its own frames once the intro has
// cleared (see `probeFrameRate`, called from App) and drops to low power if it
// can't hold a smooth frame rate.
// `?power=low` or `?power=full` in the URL overrides all of this, for testing.

type NavigatorHints = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

// A device that failed the frame check stays in low power on later visits, so
// it doesn't have to stutter through the full effects again before the check
// catches it. The verdict expires so a one-off busy moment isn't permanent.
const STORAGE_KEY = 'gqh-low-power-until';
const REMEMBER_MS = 7 * 24 * 60 * 60 * 1000;

const readOverride = () => {
  if (typeof window === 'undefined') return null;
  const value = new URLSearchParams(window.location.search).get('power');
  return value === 'low' || value === 'full' ? value : null;
};

const rememberedLowPower = () => {
  try {
    return Number(window.localStorage.getItem(STORAGE_KEY)) > Date.now();
  } catch {
    return false;
  }
};

const detectLowPower = () => {
  if (typeof window === 'undefined') return false;

  const override = readOverride();
  if (override) return override === 'low';

  const nav = navigator as NavigatorHints;
  if (nav.connection?.saveData) return true;
  if (nav.hardwareConcurrency && nav.hardwareConcurrency <= 4) return true;
  if (nav.deviceMemory && nav.deviceMemory <= 4) return true;
  return rememberedLowPower();
};

let lowPower = detectLowPower();

export const isLowPower = () => lowPower;

// High-refresh displays would otherwise redraw ambient canvases 120–165 times
// a second for no visible gain.
export const ambientFps = () => (lowPower ? 30 : 60);

const setLowPower = () => {
  lowPower = true;
  document.documentElement.classList.add('low-power');
  try {
    window.localStorage.setItem(STORAGE_KEY, String(Date.now() + REMEMBER_MS));
  } catch {
    // Storage can be blocked; the check simply runs again next visit.
  }
};

// Lets the intro overlay fade and the hero settle before sampling.
const PROBE_DELAY_MS = 1500;
const PROBE_DURATION_MS = 2000;
// A median frame slower than this is under ~40 fps with the page otherwise
// idle. iOS Low Power Mode caps the page at 30 fps, which lands here too, and
// that's a fair request to go easy.
const SLOW_FRAME_MS = 25;

// Background tabs throttle requestAnimationFrame, which would read as a slow
// device, so sampling only happens while the tab is visible.
const probeWhenVisible = () => {
  const onVisible = () => {
    if (document.visibilityState !== 'visible') return;
    document.removeEventListener('visibilitychange', onVisible);
    window.setTimeout(sampleFrames, PROBE_DELAY_MS);
  };
  document.addEventListener('visibilitychange', onVisible);
};

let probeScheduled = false;

/** Times the page for a couple of seconds, once per visit, and switches to
 * low-power mode if frames are coming too slowly. */
export const probeFrameRate = () => {
  if (probeScheduled || lowPower || readOverride()) return;
  probeScheduled = true;
  window.setTimeout(sampleFrames, PROBE_DELAY_MS);
};

const sampleFrames = () => {
  if (document.visibilityState !== 'visible') {
    probeWhenVisible();
    return;
  }

  const intervals: number[] = [];
  let start = 0;
  let last = 0;
  let frame = 0;

  const onHidden = () => {
    if (document.visibilityState === 'visible') return;
    window.cancelAnimationFrame(frame);
    document.removeEventListener('visibilitychange', onHidden);
    probeWhenVisible();
  };

  const tick = (now: number) => {
    if (!start) start = now;
    else intervals.push(now - last);
    last = now;

    if (now - start < PROBE_DURATION_MS) {
      frame = window.requestAnimationFrame(tick);
      return;
    }

    document.removeEventListener('visibilitychange', onHidden);
    intervals.sort((a, b) => a - b);
    const median = intervals[Math.floor(intervals.length / 2)];
    if (median > SLOW_FRAME_MS) setLowPower();
  };

  document.addEventListener('visibilitychange', onHidden);
  frame = window.requestAnimationFrame(tick);
};

export const applyPowerClass = () => {
  document.documentElement.classList.toggle('low-power', lowPower);
};

/**
 * Returns a check for a requestAnimationFrame loop: true when this frame should
 * advance and draw, false when it should be skipped to hold the frame rate at
 * `fps`. Skipped frames leave the loop's own clock alone, so the next drawn
 * frame's dt covers the time that passed. Without an explicit `fps` it follows
 * the ambient rate, which drops if the device turns out to be slow.
 */
export const frameGate = (fps?: number) => {
  let lastDrawn = -Infinity;

  return (now: number) => {
    // A couple of ms of slack so a 60 Hz display isn't held to every other
    // frame by timestamp jitter.
    const interval = 1000 / (fps ?? ambientFps()) - 2;
    if (now - lastDrawn < interval) return false;
    lastDrawn = now;
    return true;
  };
};
