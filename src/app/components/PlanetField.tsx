import { memo, useCallback, useEffect, useRef, useState } from 'react';
import bluePlanet from './bluePlanet.png';
import orangePlanet from './orangePlanet.png';

type PlanetId = 'cygnus' | 'ember' | 'gaia';

type PlanetSpec = {
  id: PlanetId;
  // Cygnus and Ember are raster sprites; Gaia has no image and renders as a
  // hand-built pixel-grid SVG instead (see GaiaSphere).
  image?: string;
  ticker: string;
  accent: string;
  basePrice: number;
  volatility: number;
  hudAlign: 'left' | 'right';
};

type Quote = {
  open: number;
  price: number;
  history: number[];
};

const PLANETS: PlanetSpec[] = [
  {
    id: 'cygnus',
    image: bluePlanet,
    ticker: '$CYGNUS',
    accent: '#63f6ff',
    basePrice: 412.6,
    volatility: 0.012,
    hudAlign: 'right',
  },
  {
    id: 'ember',
    image: orangePlanet,
    ticker: '$EMBER',
    accent: '#FA4616',
    basePrice: 88.2,
    volatility: 0.018,
    hudAlign: 'left',
  },
  {
    id: 'gaia',
    ticker: '$GAIA',
    accent: '#33d17a',
    basePrice: 64.8,
    volatility: 0.021,
    hudAlign: 'right',
  },
];

const HISTORY_LENGTH = 16;
// Wider release than lock radius so a cursor resting on the edge doesn't flicker.
const LOCK_PADDING = 78;
const RELEASE_PADDING = 118;
const IDLE_DELAY_MS = 4200;
const ATTRACT_HOLD_MS = 3800;
const ATTRACT_GAP_MS = 1400;
const TICK_MS = 620;
const UP_COLOR = '#3AE36C';
const DOWN_COLOR = '#FF5A3C';

// Ember's moon rides a shallow ellipse rather than a flat circle, so the orbit
// reads as a tilted plane: the top half runs behind the planet, the bottom half
// crosses in front. Positions are snapped to whole pixels and stepped rather
// than eased, so the sprite ticks around the ring the way an 8-bit one would.
const ORBIT_STEPS = 32;
const ORBIT_RADIUS_X = 104;
const ORBIT_RADIUS_Y = 28;
const ORBIT_DURATION = '7.5s';
// Depth is sold with three whole-pixel sprite sizes rather than a fractional
// scale(), which would resample the sprite and soften its edges.
const MOON_SIZES = [8, 12, 16];

const buildMoonOrbitFrames = () => {
  const frames: string[] = [];

  for (let step = 0; step <= ORBIT_STEPS; step += 1) {
    const progress = step / ORBIT_STEPS;
    const angle = progress * Math.PI * 2;
    const x = Math.round(Math.sin(angle) * ORBIT_RADIUS_X);
    const y = Math.round(-Math.cos(angle) * ORBIT_RADIUS_Y);
    // 0 at the far point of the orbit, 1 at the near point.
    const nearness = (1 - Math.cos(angle)) / 2;
    const size = MOON_SIZES[Math.min(MOON_SIZES.length - 1, Math.floor(nearness * MOON_SIZES.length))];

    frames.push(
      `${(progress * 100).toFixed(3)}% { ` +
        `transform: translate3d(${x}px, ${y}px, 0); ` +
        `width: ${size}px; height: ${size}px; ` +
        `margin: ${-size / 2}px 0 0 ${-size / 2}px; }`
    );
  }

  return frames.join('\n          ');
};

const MOON_ORBIT_FRAMES = buildMoonOrbitFrames();

// Each planet wanders its own closed Lissajous path. The frequency pair decides
// the shape (2:1 is a figure-eight), and the periods are deliberately coprime-ish
// so the two bodies never settle into a visible rhythm with each other.
const buildDriftFrames = ({
  amplitudeX,
  amplitudeY,
  cyclesX,
  cyclesY,
  phase,
}: {
  amplitudeX: number;
  amplitudeY: number;
  cyclesX: number;
  cyclesY: number;
  phase: number;
}) => {
  const steps = 48;
  const frames: string[] = [];

  for (let step = 0; step <= steps; step += 1) {
    const progress = step / steps;
    const x = (Math.sin(2 * Math.PI * cyclesX * progress) * amplitudeX).toFixed(1);
    const y = (Math.sin(2 * Math.PI * cyclesY * progress + phase) * amplitudeY).toFixed(1);

    frames.push(`${(progress * 100).toFixed(2)}% { transform: translate3d(${x}px, ${y}px, 0); }`);
  }

  return frames.join('\n          ');
};

const CYGNUS_DRIFT_FRAMES = buildDriftFrames({
  amplitudeX: 26,
  amplitudeY: 18,
  cyclesX: 1,
  cyclesY: 2,
  phase: 0,
});

const EMBER_DRIFT_FRAMES = buildDriftFrames({
  amplitudeX: 19,
  amplitudeY: 13,
  cyclesX: 2,
  cyclesY: 3,
  phase: Math.PI / 4,
});

const GAIA_DRIFT_FRAMES = buildDriftFrames({
  amplitudeX: 22,
  amplitudeY: 15,
  cyclesX: 3,
  cyclesY: 2,
  phase: Math.PI / 3,
});

// Gaia has no sprite sheet, so its sphere is a hand-built pixel grid instead
// of a smooth CSS gradient — a blocky circle with a stepped, banded palette
// so it reads as pixel art next to Cygnus and Ember's raster sprites.
const GAIA_GRID = 34;
const GAIA_PALETTE = ['#e6ffee', '#a8f0c6', '#69d99b', '#3ab876', '#1f8a57', '#0e5636', '#062f1e'];

const buildGaiaPixels = () => {
  const cells: { x: number; y: number; color: string }[] = [];
  const mid = (GAIA_GRID - 1) / 2;
  const radius = GAIA_GRID / 2 - 0.5;
  // Light source sits up and to the left, matching the sibling sprites.
  const lightX = GAIA_GRID * 0.3;
  const lightY = GAIA_GRID * 0.26;

  for (let row = 0; row < GAIA_GRID; row += 1) {
    for (let col = 0; col < GAIA_GRID; col += 1) {
      const dx = col - mid;
      const dy = row - mid;
      if (Math.sqrt(dx * dx + dy * dy) > radius) continue;

      const lightDistance = Math.hypot(col - lightX, row - lightY) / GAIA_GRID;
      // A little diagonal dither on the band seams so rows don't read as
      // perfectly flat stripes — the same trick the sprite sheets use.
      const dither = (col * 3 + row * 5) % 7 === 0 ? 0.05 : 0;
      const band = Math.max(
        0,
        Math.min(GAIA_PALETTE.length - 1, Math.round((lightDistance + dither) * (GAIA_PALETTE.length - 1) * 1.55))
      );

      cells.push({ x: col, y: row, color: GAIA_PALETTE[band] });
    }
  }

  return cells;
};

const GAIA_PIXELS = buildGaiaPixels();

// Tiny debris orbiting Gaia's ring band. Rotating the ring elements
// themselves would spin their clip-path split out of alignment with the
// sphere (the far/near halves are cut in the ring's own local space before
// its static tilt), so instead each asteroid's left/top is keyframed around
// the same ellipse the ring traces — real motion, ring geometry untouched.
const RING_ASTEROID_COUNT = 18;
const RING_ORBIT_LANES = ['inner', 'mid', 'outer'] as const;
const RING_ORBIT_RADII: Record<(typeof RING_ORBIT_LANES)[number], number> = {
  inner: 44,
  mid: 50,
  outer: 56,
};

const buildOrbitFrames = (radius: number) => {
  const steps = 24;
  const frames: string[] = [];

  for (let step = 0; step <= steps; step += 1) {
    const progress = step / steps;
    const angle = progress * Math.PI * 2;
    const left = (50 + Math.cos(angle) * radius).toFixed(2);
    const top = (50 + Math.sin(angle) * radius).toFixed(2);

    frames.push(`${(progress * 100).toFixed(3)}% { left: ${left}%; top: ${top}%; }`);
  }

  return frames.join('\n          ');
};

const RING_ORBIT_FRAMES: Record<(typeof RING_ORBIT_LANES)[number], string> = {
  inner: buildOrbitFrames(RING_ORBIT_RADII.inner),
  mid: buildOrbitFrames(RING_ORBIT_RADII.mid),
  outer: buildOrbitFrames(RING_ORBIT_RADII.outer),
};

const buildRingAsteroids = () => {
  const asteroids: { lane: (typeof RING_ORBIT_LANES)[number]; size: number; delay: number; duration: number }[] = [];

  for (let i = 0; i < RING_ASTEROID_COUNT; i += 1) {
    const duration = 30 + ((i * 13) % 3) * 6;

    asteroids.push({
      lane: RING_ORBIT_LANES[i % RING_ORBIT_LANES.length],
      size: 1.5 + ((i * 5) % 3),
      // A negative delay starts the loop already in progress, at a phase
      // spread evenly around the ring instead of every rock starting together.
      delay: -((i / RING_ASTEROID_COUNT) * duration),
      duration,
    });
  }

  return asteroids;
};

const RING_ASTEROIDS = buildRingAsteroids();

// A handful of small blue flashes across Cygnus. The sprite's visible disc
// sits inset from the sprite's own transparent padding, so sparks stay at a
// modest radius — well clear of the rim — to land on the planet itself.
const CYGNUS_SPARK_COUNT = 6;

const buildCygnusSparks = () => {
  const sparks: { left: number; top: number; size: number; delay: number; duration: number }[] = [];

  for (let i = 0; i < CYGNUS_SPARK_COUNT; i += 1) {
    const angle = (i / CYGNUS_SPARK_COUNT) * Math.PI * 2 + i * 0.9;
    const radius = 8 + ((i * 11) % 16);

    sparks.push({
      left: 50 + Math.cos(angle) * radius,
      top: 50 + Math.sin(angle) * radius,
      size: 5 + (i % 3) * 2,
      delay: i * 0.55,
      duration: 2.6 + (i % 3) * 0.4,
    });
  }

  return sparks;
};

const CYGNUS_SPARKS = buildCygnusSparks();

// The hero re-renders this whole tree every ~600ms when a price ticks, so
// these shared visuals are memoized — none of their props ever change after
// mount, so memo lets React skip reconciling their (sometimes 900+ node)
// subtrees entirely instead of re-diffing static markup on every tick.
export const GaiaSphere = memo(function GaiaSphere({ className }: { className?: string }) {
  return (
    <svg
      viewBox={`0 0 ${GAIA_GRID} ${GAIA_GRID}`}
      className={className}
      shapeRendering="crispEdges"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      {GAIA_PIXELS.map((cell) => (
        <rect key={`${cell.x}-${cell.y}`} x={cell.x} y={cell.y} width={1} height={1} fill={cell.color} />
      ))}
    </svg>
  );
});

// Shared so the same spark burst, ring system, and moon orbit show up
// wherever a planet appears — the hero field and the GameModes track icons.
export const CygnusSparks = memo(function CygnusSparks() {
  return (
    <div className="planet__sparks">
      {CYGNUS_SPARKS.map((spark, index) => (
        <span
          key={index}
          className="planet__spark"
          style={{
            left: `${spark.left}%`,
            top: `${spark.top}%`,
            width: spark.size,
            height: spark.size,
            animationDelay: `${spark.delay}s`,
            animationDuration: `${spark.duration}s`,
          }}
        />
      ))}
    </div>
  );
});

export const GaiaRings = memo(function GaiaRings({ half }: { half: 'far' | 'near' }) {
  return (
    <>
      <span className={`planet__saturn-ring planet__saturn-ring--outer planet__saturn-ring--${half}`} />
      <span className={`planet__saturn-ring planet__saturn-ring--${half}`} />
      <span className={`planet__saturn-ring planet__saturn-ring--inner planet__saturn-ring--${half}`} />
      <span className={`planet__ring-debris planet__ring-debris--${half}`}>
        {RING_ASTEROIDS.map((rock, index) => (
          <span
            key={`${half}-${index}`}
            className={`planet__asteroid planet__asteroid--${rock.lane}`}
            style={{
              width: rock.size,
              height: rock.size,
              animationDuration: `${rock.duration}s`,
              animationDelay: `${rock.delay}s`,
            }}
          />
        ))}
      </span>
    </>
  );
});

export const EmberOrbit = memo(function EmberOrbit({ half }: { half: 'far' | 'near' }) {
  return (
    <>
      <span className={`planet__ring planet__ring--${half}`} />
      <span className={`planet__moon planet__moon--${half}`} />
    </>
  );
});

const nextPrice = (price: number, volatility: number) =>
  Math.max(1, price * (1 + (Math.random() - 0.5) * volatility));

const seedQuote = ({ basePrice, volatility }: PlanetSpec): Quote => {
  const history: number[] = [];
  let price = basePrice;

  for (let index = 0; index < HISTORY_LENGTH; index += 1) {
    price = nextPrice(price, volatility);
    history.push(price);
  }

  return { open: basePrice, price, history };
};

const seedQuotes = () =>
  PLANETS.reduce(
    (quotes, planet) => ({ ...quotes, [planet.id]: seedQuote(planet) }),
    {} as Record<PlanetId, Quote>
  );

export function PlanetField({ isIntroActive = false }: { isIntroActive?: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const planetRefs = useRef<Record<PlanetId, HTMLDivElement | null>>({ cygnus: null, ember: null, gaia: null });
  const centersRef = useRef<Partial<Record<PlanetId, { x: number; y: number; radius: number }>>>({});
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const lockedRef = useRef<PlanetId | null>(null);
  const idleTimerRef = useRef(0);

  const [booted, setBooted] = useState(false);
  const [lockedId, setLockedId] = useState<PlanetId | null>(null);
  const [scanId, setScanId] = useState<PlanetId | null>(null);
  const [pointerIdle, setPointerIdle] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [quotes, setQuotes] = useState<Record<PlanetId, Quote>>(seedQuotes);

  const activeId = lockedId ?? (pointerIdle ? scanId : null);

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setReducedMotion(motionQuery.matches);

    updateMotion();
    motionQuery.addEventListener('change', updateMotion);

    return () => motionQuery.removeEventListener('change', updateMotion);
  }, []);

  // The planets power on once the rocket intro clears the screen.
  useEffect(() => {
    if (isIntroActive) return;

    const timer = window.setTimeout(() => setBooted(true), 120);
    return () => window.clearTimeout(timer);
  }, [isIntroActive]);

  const measure = useCallback(() => {
    const centers: Partial<Record<PlanetId, { x: number; y: number; radius: number }>> = {};

    PLANETS.forEach(({ id }) => {
      const node = planetRefs.current[id];
      if (!node) return;

      const rect = node.getBoundingClientRect();
      centers[id] = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        radius: rect.width / 2,
      };
    });

    centersRef.current = centers;
  }, []);

  // The cursor selects which asset is being watched; it never moves the field.
  const applyPointer = useCallback(() => {
    const pointer = pointerRef.current;
    if (!pointer) return;

    let nearest: PlanetId | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;

    PLANETS.forEach(({ id }) => {
      const center = centersRef.current[id];
      if (!center) return;

      const distance = Math.hypot(pointer.x - center.x, pointer.y - center.y);
      const padding = lockedRef.current === id ? RELEASE_PADDING : LOCK_PADDING;

      if (distance < center.radius + padding && distance < nearestDistance) {
        nearest = id;
        nearestDistance = distance;
      }
    });

    if (nearest !== lockedRef.current) {
      lockedRef.current = nearest;
      setLockedId(nearest);
    }
  }, []);

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    let frame = 0;

    const onPointerMove = (event: PointerEvent) => {
      pointerRef.current = { x: event.clientX, y: event.clientY };

      setPointerIdle(false);
      window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = window.setTimeout(() => setPointerIdle(true), IDLE_DELAY_MS);

      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        applyPointer();
      });
    };

    measure();
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.clearTimeout(idleTimerRef.current);
      window.cancelAnimationFrame(frame);
    };
  }, [applyPointer, measure]);

  // Planet centres move with the page, so the cached rects follow scroll/resize.
  useEffect(() => {
    let frame = 0;

    const onViewportChange = () => {
      const root = rootRef.current;
      if (root && !reducedMotion) {
        root.style.setProperty('--sy', String(Math.min(window.scrollY, 900)));
      }

      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        measure();
      });
    };

    onViewportChange();
    window.addEventListener('scroll', onViewportChange, { passive: true });
    window.addEventListener('resize', onViewportChange);

    return () => {
      window.removeEventListener('scroll', onViewportChange);
      window.removeEventListener('resize', onViewportChange);
      window.cancelAnimationFrame(frame);
    };
  }, [measure, reducedMotion]);

  // Attract mode: with the cursor parked, the field scans each asset in turn.
  useEffect(() => {
    if (!booted || reducedMotion || lockedId || !pointerIdle) {
      setScanId(null);
      return;
    }

    let index = 0;
    let holdTimer = 0;
    let gapTimer = 0;

    const runCycle = () => {
      setScanId(PLANETS[index % PLANETS.length].id);

      holdTimer = window.setTimeout(() => {
        setScanId(null);
        index += 1;
        gapTimer = window.setTimeout(runCycle, ATTRACT_GAP_MS);
      }, ATTRACT_HOLD_MS);
    };

    gapTimer = window.setTimeout(runCycle, ATTRACT_GAP_MS);

    return () => {
      window.clearTimeout(holdTimer);
      window.clearTimeout(gapTimer);
    };
  }, [booted, lockedId, pointerIdle, reducedMotion]);

  // The market only trades while something is being watched.
  useEffect(() => {
    if (!activeId || reducedMotion) return;

    const planet = PLANETS.find((item) => item.id === activeId);
    if (!planet) return;

    const interval = window.setInterval(() => {
      setQuotes((current) => {
        const quote = current[activeId];
        const price = nextPrice(quote.price, planet.volatility);

        return {
          ...current,
          [activeId]: {
            ...quote,
            price,
            history: [...quote.history.slice(1), price],
          },
        };
      });
    }, TICK_MS);

    return () => window.clearInterval(interval);
  }, [activeId, reducedMotion]);

  return (
    <div
      ref={rootRef}
      className={`planet-field ${booted ? 'planet-field--booted' : ''}`}
      aria-hidden="true"
    >
      <style>{`
        .planet-field {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .planet {
          position: absolute;
          opacity: 0;
          transition: opacity 460ms ease;
          transform: translate3d(0, calc(var(--sy, 0) * var(--drift) * 1px), 0);
          will-change: transform;
        }

        .planet--cygnus {
          top: 11%;
          right: 11%;
          width: 240px;
          height: 240px;
          --drift: -0.1;
        }

        .planet--ember {
          top: 33%;
          left: 10%;
          width: 145px;
          height: 145px;
          --drift: -0.07;
        }

        .planet--gaia {
          top: 55%;
          right: 10%;
          width: 128px;
          height: 128px;
          --drift: -0.05;
        }

        .planet-field--booted .planet {
          opacity: 1;
        }

        .planet-field--booted .planet--ember {
          transition-delay: 60ms;
        }

        .planet-field--booted .planet--cygnus {
          transition-delay: 240ms;
        }

        .planet-field--booted .planet--gaia {
          transition-delay: 420ms;
        }

        .planet__boot {
          position: relative;
          width: 100%;
          height: 100%;
          transform: scale(0.88);
          transition: transform 620ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .planet-field--booted .planet__boot {
          transform: scale(1);
        }

        /* Self-directed wander — the whole body, its ring and its moon travel
           together, on a period long enough to read as drift rather than motion. */
        .planet__drift {
          position: relative;
          width: 100%;
          height: 100%;
          animation: planetDriftCygnus 54s linear infinite;
        }

        .planet--ember .planet__drift {
          animation: planetDriftEmber 43s linear infinite;
        }

        .planet--gaia .planet__drift {
          animation: planetDriftGaia 49s linear infinite;
        }

        @keyframes planetDriftCygnus {
          ${CYGNUS_DRIFT_FRAMES}
        }

        @keyframes planetDriftEmber {
          ${EMBER_DRIFT_FRAMES}
        }

        @keyframes planetDriftGaia {
          ${GAIA_DRIFT_FRAMES}
        }

        /* Explicit layer so the far half of the orbit paints behind the planet
           and the near half in front of it. */
        .planet__bob {
          position: relative;
          z-index: 2;
          width: 100%;
          height: 100%;
          animation: planetBob 7s ease-in-out infinite;
        }

        .planet--ember .planet__bob {
          animation-duration: 5.5s;
          animation-delay: -2.4s;
        }

        @keyframes planetBob {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .planet__img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: contain;
          image-rendering: pixelated;
        }

        .planet--cygnus .planet__img {
          animation: planetGlowBlue 6s ease-in-out infinite;
        }

        .planet--ember .planet__img {
          animation: planetGlowOrange 6s ease-in-out infinite;
          animation-delay: -2.8s;
        }

        @keyframes planetGlowBlue {
          0%, 100% { filter: drop-shadow(8px 8px 0 #000820) drop-shadow(0 0 14px rgba(99,246,255,0.18)); }
          50% { filter: drop-shadow(8px 8px 0 #000820) drop-shadow(0 0 28px rgba(99,246,255,0.38)); }
        }

        @keyframes planetGlowOrange {
          0%, 100% { filter: drop-shadow(4px 4px 0 #000820) drop-shadow(0 0 12px rgba(250,70,22,0.18)); }
          50% { filter: drop-shadow(4px 4px 0 #000820) drop-shadow(0 0 24px rgba(250,70,22,0.38)); }
        }

        /* Small electrical flashes across Cygnus's surface. The clip circle
           is inset a bit further than the sprite's own square canvas so a
           burst can never paint past the visible sphere into the padding. */
        .planet__sparks {
          position: absolute;
          z-index: 3;
          inset: 9%;
          border-radius: 50%;
          overflow: hidden;
          pointer-events: none;
        }

        /* An 8-point pixel-art sparkle — hard-edged, two flat tones, no
           gradient blur — instead of a soft radial-gradient burst. */
        .planet__spark {
          position: absolute;
          clip-path: polygon(
            50% 0%, 63% 32%, 95% 18%, 68% 45%,
            100% 50%, 68% 55%, 95% 82%, 63% 68%,
            50% 100%, 37% 68%, 5% 82%, 32% 55%,
            0% 50%, 32% 45%, 5% 18%, 37% 32%
          );
          background: linear-gradient(135deg, #f2ffff 0 50%, #63d9ff 50% 100%);
          transform: translate(-50%, -50%) scale(0);
          opacity: 0;
          animation: planetSparkBurst 3s steps(6, end) infinite;
        }

        @keyframes planetSparkBurst {
          0%, 100% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
          8% { transform: translate(-50%, -50%) scale(1.3); opacity: 1; }
          24% { transform: translate(-50%, -50%) scale(0.3); opacity: 0; }
        }

        /* Gaia has no sprite — its sphere is a hand-built pixel grid (see
           GaiaSphere) so it reads as blocky pixel art like Cygnus and Ember. */
        .planet__sphere {
          position: relative;
          z-index: 2;
          display: block;
          width: 100%;
          height: 100%;
          animation: planetGlowGreen 6s ease-in-out infinite;
          animation-delay: -1.4s;
        }

        @keyframes planetGlowGreen {
          0%, 100% { filter: drop-shadow(6px 6px 0 #000820) drop-shadow(0 0 12px rgba(51,209,122,0.2)); }
          50% { filter: drop-shadow(6px 6px 0 #000820) drop-shadow(0 0 26px rgba(51,209,122,0.42)); }
        }

        /* Saturn-style bands — three concentric flattened-ellipse outlines
           split at the equator, unlike Ember's thin dashed moon orbit.
           Rotating these rings would spin their clip-path split (cut in the
           ring's own local space, before its static tilt) out of alignment
           with the sphere, so "movement" here is a breathing pulse instead —
           real spin is left to the orbiting debris below. */
        .planet__saturn-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 168%;
          height: 58%;
          margin: -29% 0 0 -84%;
          border-radius: 50%;
          border: 5px solid rgba(120, 255, 180, 0.55);
          border-top-color: rgba(210, 255, 226, 0.32);
          border-bottom-color: rgba(60, 170, 110, 0.75);
          filter: drop-shadow(0 0 6px rgba(51, 209, 122, 0.35));
          transition: border-color 260ms ease;
          animation: planetRingPulse 5.5s ease-in-out infinite;
        }

        @keyframes planetRingPulse {
          0%, 100% { transform: rotate(-13deg) scale(1); }
          50% { transform: rotate(-13deg) scale(1.035); }
        }

        .planet__saturn-ring--outer {
          width: 182%;
          height: 64%;
          margin: -32% 0 0 -91%;
          border-width: 3px;
          border-color: rgba(90, 220, 155, 0.3);
          border-top-color: rgba(180, 255, 210, 0.18);
          border-bottom-color: rgba(40, 140, 90, 0.42);
          animation-duration: 7s;
          animation-delay: -1.6s;
        }

        .planet__saturn-ring--inner {
          width: 154%;
          height: 52%;
          margin: -26% 0 0 -77%;
          border-width: 3px;
          border-color: rgba(200, 255, 220, 0.65);
          border-top-color: rgba(230, 255, 240, 0.4);
          border-bottom-color: rgba(90, 210, 150, 0.85);
          animation-duration: 4.2s;
          animation-delay: -3s;
        }

        .planet__saturn-ring--far {
          z-index: 0;
          clip-path: inset(0 0 50% 0);
        }

        .planet__saturn-ring--near {
          z-index: 3;
          clip-path: inset(50% 0 0 0);
        }

        /* Debris field shares the mid ring's exact box so each speck's
           percentage position lands on the band; the field itself doesn't
           rotate (same clip-path reasoning as the rings above) — instead
           each asteroid orbits within it via its own left/top keyframes. */
        .planet__ring-debris {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 168%;
          height: 58%;
          margin: -29% 0 0 -84%;
          transform: rotate(-13deg);
          pointer-events: none;
        }

        .planet__ring-debris--far {
          z-index: 0;
          clip-path: inset(0 0 50% 0);
        }

        .planet__ring-debris--near {
          z-index: 3;
          clip-path: inset(50% 0 0 0);
        }

        .planet__asteroid {
          position: absolute;
          top: 50%;
          left: 50%;
          border-radius: 50%;
          background: #dce8dd;
          box-shadow: 0 0 3px rgba(200, 255, 220, 0.7);
          transform: translate(-50%, -50%);
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        .planet__asteroid--inner { animation-name: planetAsteroidOrbitInner; }
        .planet__asteroid--mid { animation-name: planetAsteroidOrbitMid; }
        .planet__asteroid--outer { animation-name: planetAsteroidOrbitOuter; }

        @keyframes planetAsteroidOrbitInner {
          ${RING_ORBIT_FRAMES.inner}
        }

        @keyframes planetAsteroidOrbitMid {
          ${RING_ORBIT_FRAMES.mid}
        }

        @keyframes planetAsteroidOrbitOuter {
          ${RING_ORBIT_FRAMES.outer}
        }

        /* The orbital plane, split at the horizon so the far arc sits behind
           the planet and the near arc crosses in front of it. */
        .planet__ring {
          position: absolute;
          top: 50%;
          left: 50%;
          width: ${ORBIT_RADIUS_X * 2}px;
          height: ${ORBIT_RADIUS_Y * 2}px;
          margin: ${-ORBIT_RADIUS_Y}px 0 0 ${-ORBIT_RADIUS_X}px;
          border: 2px dashed var(--planet-ring, rgba(250, 70, 22, 0.3));
          border-radius: 50%;
          transition: border-color 260ms ease;
        }

        .planet__ring--far {
          z-index: 0;
          clip-path: inset(0 0 50% 0);
        }

        .planet__ring--near {
          z-index: 3;
          clip-path: inset(50% 0 0 0);
        }

        .planet__moon {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 12px;
          height: 12px;
          margin: -6px 0 0 -6px;
          /* Octagonal silhouette — how a small circle gets drawn in pixel art. */
          clip-path: polygon(
            33.333% 0, 66.667% 0, 100% 33.333%, 100% 66.667%,
            66.667% 100%, 33.333% 100%, 0 66.667%, 0 33.333%
          );
          /* Two flat tones with a hard terminator, no gradient ramp. */
          background: linear-gradient(135deg, #ffe8e0 0 50%, #d9614a 50% 100%);
          box-shadow: 0 0 0 2px rgba(255, 138, 91, 0.16);
          animation:
            planetMoonOrbit ${ORBIT_DURATION} step-end infinite,
            planetMoonPhase ${ORBIT_DURATION} step-end infinite;
        }

        .planet__moon--far {
          z-index: 1;
          filter: brightness(0.58) saturate(0.8);
        }

        .planet__moon--near {
          z-index: 4;
          animation-name: planetMoonOrbit, planetMoonPhaseNear;
        }

        @keyframes planetMoonOrbit {
          ${MOON_ORBIT_FRAMES}
        }

        /* Hard cut at each horizon crossing — the sprite pops behind the planet
           rather than fading through it. */
        @keyframes planetMoonPhase {
          0%, 24.99% { opacity: 1; }
          25%, 74.99% { opacity: 0; }
          75%, 100% { opacity: 1; }
        }

        @keyframes planetMoonPhaseNear {
          0%, 24.99% { opacity: 0; }
          25%, 74.99% { opacity: 1; }
          75%, 100% { opacity: 0; }
        }

        /* Targeting reticle — same corner-bracket language as the mission console. */
        .planet__reticle {
          position: absolute;
          inset: -14%;
          z-index: 5;
          opacity: 0;
          transform: scale(1.12);
          transition: opacity 200ms ease, transform 240ms cubic-bezier(0.2, 0.9, 0.25, 1);
        }

        .planet.is-active .planet__reticle {
          opacity: 1;
          transform: scale(1);
        }

        /* Cygnus is the biggest sprite, so the same percentage inset as its
           siblings puts the corner brackets noticeably far from the disc —
           pull them in specifically for this planet. */
        .planet--cygnus .planet__reticle {
          inset: 4%;
        }

        .planet.is-active .planet__ring {
          border-color: var(--planet-ring-active, rgba(250, 70, 22, 0.72));
        }

        .planet__corner {
          position: absolute;
          width: 22px;
          height: 22px;
        }

        .planet__corner::before,
        .planet__corner::after {
          content: '';
          position: absolute;
          background: var(--planet-accent);
          box-shadow: 0 0 8px var(--planet-accent);
        }

        .planet__corner::before { width: 22px; height: 2px; }
        .planet__corner::after { width: 2px; height: 22px; }

        .planet__corner--tl { top: 0; left: 0; }
        .planet__corner--tl::before { top: 0; left: 0; }
        .planet__corner--tl::after { top: 0; left: 0; }

        .planet__corner--tr { top: 0; right: 0; }
        .planet__corner--tr::before { top: 0; right: 0; }
        .planet__corner--tr::after { top: 0; right: 0; }

        .planet__corner--bl { bottom: 0; left: 0; }
        .planet__corner--bl::before { bottom: 0; left: 0; }
        .planet__corner--bl::after { bottom: 0; left: 0; }

        .planet__corner--br { bottom: 0; right: 0; }
        .planet__corner--br::before { bottom: 0; right: 0; }
        .planet__corner--br::after { bottom: 0; right: 0; }

        /* Quote panel */
        .planet-hud {
          position: absolute;
          top: calc(100% + 22px);
          width: 208px;
          padding: 9px 11px 11px;
          border: 1px solid var(--planet-hud-border);
          background: rgba(6, 10, 20, 0.92);
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.02), 0 0 22px rgba(4, 74, 148, 0.16);
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 200ms ease, transform 240ms cubic-bezier(0.2, 0.9, 0.25, 1);
        }

        .planet-hud--right { right: 0; }
        .planet-hud--left { left: 0; }

        .planet.is-active .planet-hud {
          opacity: 1;
          transform: translateY(0);
        }

        /* Tether tying the readout back to the body it describes. */
        .planet-hud::before {
          content: '';
          position: absolute;
          top: -22px;
          width: 1px;
          height: 22px;
          background: linear-gradient(180deg, transparent, var(--planet-hud-border));
        }

        .planet-hud--right::before { right: 24px; }
        .planet-hud--left::before { left: 24px; }

        .planet-hud__header {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 7px;
          padding-bottom: 6px;
          border-bottom: 1px solid var(--planet-hud-border);
          font-family: 'Space Mono', monospace;
          font-size: 8.5px;
          letter-spacing: 1.1px;
          color: #7f92ae;
        }

        .planet-hud__mode { color: var(--planet-accent); }

        .planet-hud__caret { animation: planetCaretBlink 1s step-end infinite; }

        @keyframes planetCaretBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        .planet-hud__row {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 8px;
        }

        .planet-hud__ticker {
          font-family: 'Orbitron', sans-serif;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.6px;
          color: #eef4ff;
        }

        .planet-hud__delta {
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.4px;
        }

        .planet-hud__quote {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 10px;
          margin-top: 6px;
        }

        .planet-hud__price {
          font-family: 'DS-Digital', 'Orbitron', sans-serif;
          font-size: 26px;
          line-height: 1;
          letter-spacing: 1px;
          color: var(--planet-accent);
        }

        .planet-hud__spark {
          display: flex;
          align-items: flex-end;
          gap: 2px;
          height: 22px;
        }

        .planet-hud__bar {
          width: 3px;
          background: var(--planet-accent);
        }

        @media (max-width: 1279px) {
          .planet-hud,
          .planet__reticle {
            display: none;
          }
        }

        @media (max-width: 767px) {
          .planet--cygnus { right: -30%; }
          .planet--ember { left: -14%; }
          .planet--gaia { right: -20%; top: 58%; }
        }

        @media (prefers-reduced-motion: reduce) {
          .planet__drift,
          .planet__bob,
          .planet__img,
          .planet__sphere,
          .planet__moon,
          .planet__spark,
          .planet__saturn-ring,
          .planet__asteroid,
          .planet-hud__caret {
            animation: none !important;
          }

          .planet__spark,
          .planet__asteroid {
            display: none;
          }

          .planet__saturn-ring {
            transform: rotate(-13deg) !important;
          }

          .planet,
          .planet__boot,
          .planet__reticle,
          .planet-hud {
            transition: none !important;
          }
        }
      `}</style>

      {PLANETS.map((planet) => {
        const quote = quotes[planet.id];
        const change = ((quote.price - quote.open) / quote.open) * 100;
        const isUp = change >= 0;
        const changeColor = isUp ? UP_COLOR : DOWN_COLOR;
        const low = Math.min(...quote.history);
        const high = Math.max(...quote.history);
        const span = high - low || 1;
        const isActive = activeId === planet.id;

        return (
          <div
            key={planet.id}
            ref={(node) => {
              planetRefs.current[planet.id] = node;
            }}
            className={`planet planet--${planet.id} ${isActive ? 'is-active' : ''}`}
            style={
              {
                '--planet-accent': planet.accent,
                '--planet-hud-border': `${planet.accent}59`,
                '--planet-ring': `${planet.accent}4d`,
                '--planet-ring-active': `${planet.accent}b8`,
              } as React.CSSProperties
            }
          >
            <div className="planet__boot">
              <div className="planet__drift">
                {planet.id === 'ember' && <EmberOrbit half="far" />}
                {planet.id === 'gaia' && <GaiaRings half="far" />}

                <div className="planet__reticle">
                  <span className="planet__corner planet__corner--tl" />
                  <span className="planet__corner planet__corner--tr" />
                  <span className="planet__corner planet__corner--bl" />
                  <span className="planet__corner planet__corner--br" />
                </div>

                <div className="planet__bob">
                  {planet.image ? (
                    <img src={planet.image} alt="" className="planet__img" />
                  ) : (
                    <GaiaSphere className="planet__sphere" />
                  )}

                  {planet.id === 'cygnus' && <CygnusSparks />}
                </div>

                {planet.id === 'ember' && <EmberOrbit half="near" />}
                {planet.id === 'gaia' && <GaiaRings half="near" />}
              </div>
            </div>

            <div className={`planet-hud planet-hud--${planet.hudAlign}`}>
              <div className="planet-hud__header">
                <span>SPACE MARKET</span>
                <span className="planet-hud__mode">
                  {lockedId === planet.id ? 'LOCKED' : 'AUTO-SCAN'}
                  <span className="planet-hud__caret">_</span>
                </span>
              </div>

              <div className="planet-hud__row">
                <span className="planet-hud__ticker">{planet.ticker}</span>
                <span className="planet-hud__delta" style={{ color: changeColor }}>
                  {isUp ? '▲' : '▼'} {isUp ? '+' : ''}
                  {change.toFixed(2)}%
                </span>
              </div>

              <div className="planet-hud__quote">
                <span className="planet-hud__price">{quote.price.toFixed(2)}</span>
                <span className="planet-hud__spark">
                  {quote.history.map((value, index) => (
                    <span
                      key={index}
                      className="planet-hud__bar"
                      style={{
                        height: `${4 + ((value - low) / span) * 16}px`,
                        opacity: 0.35 + (index / (quote.history.length - 1)) * 0.65,
                        background: index === quote.history.length - 1 ? changeColor : undefined,
                      }}
                    />
                  ))}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
