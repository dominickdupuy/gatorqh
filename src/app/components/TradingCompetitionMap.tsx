import { useEffect, useMemo, useState } from 'react';
import { geoAlbersUsa, geoPath, type GeoPermissibleObjects, type GeoProjection } from 'd3-geo';
import { scaleSqrt } from 'd3-scale';
import { max } from 'd3-array';
import { feature as topoFeature, mesh as topoMesh } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { FeatureCollection, Feature, Geometry } from 'geojson';

const W = 980;
const H = 640;
const VIEW_W = 1180;
const VIEW_H = 640;
const GUTTER_X = 1000;
const MAX_R = 34;

const GEO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3.0.1/states-10m.json';
const GEO_FALLBACK_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json';

type City = {
  id: string;
  short: string;
  city: string;
  n: number;
  lat: number;
  lon: number;
  dir?: 1 | -1;
  dy?: number;
  gutter?: number;
  leader?: boolean;
  nodot?: boolean;
  home?: boolean;
};

/*  Order matters: later entries paint on top, so keep this sorted by n descending.
    dir / dy place a label beside the bubble; gutter parks it in the right-hand
    column with a leader line, for the crowded Northeast.  */
export const CITIES: City[] = [
  { id: 'chi', short: 'UChicago', city: 'Chicago, IL', n: 10, lat: 41.7886, lon: -87.5987, dir: -1, dy: -30 },
  { id: 'cam', short: 'MIT', city: 'Cambridge, MA', n: 10, lat: 42.3601, lon: -71.0942, gutter: 160 },
  { id: 'bky', short: 'UC Berkeley', city: 'Berkeley, CA', n: 9, lat: 37.8719, lon: -122.2585, dir: 1, dy: 30 },
  { id: 'nyc', short: 'New York City', city: 'New York, NY', n: 5, lat: 40.7561, lon: -73.95, gutter: 288 },
  { id: 'aa', short: 'Michigan', city: 'Ann Arbor, MI', n: 5, lat: 42.2808, lon: -83.743, dir: -1, dy: -46, leader: true },
  { id: 'pit', short: 'Carnegie Mellon', city: 'Pittsburgh, PA', n: 3, lat: 40.4433, lon: -79.9436, dir: -1, dy: 52, leader: true },
  { id: 'nh', short: 'Yale', city: 'New Haven, CT', n: 1, lat: 41.3163, lon: -72.9223, gutter: 224, nodot: true },
  { id: 'dc', short: 'Georgetown', city: 'Washington, DC', n: 1, lat: 38.9076, lon: -77.0723, gutter: 352 },
  { id: 'gnv', short: 'Gator Quant Hacks', city: 'Gainesville, FL', n: 1, lat: 29.6436, lon: -82.3549, dir: -1, dy: -80, home: true },
];

const CSS = `
.tcm{--tcm-blue:#4da6ff;--tcm-red:#ff3b30;--tcm-fg:#F4F4F4;--tcm-muted:#9A9AA8;
  background:#0D0D1A;padding:28px 24px 20px;font-family:"Space Mono",ui-monospace,monospace;margin:0}
.tcm *{box-sizing:border-box}
.tcm-inner{max-width:1180px;margin:0 auto}
.tcm-title{font-family:"Orbitron",sans-serif;font-weight:700;color:#fff;text-align:center;
  text-transform:uppercase;font-size:clamp(10px,2vw,16px);line-height:1.7;margin:0 0 20px}
.tcm svg{display:block;width:100%;height:auto}
.tcm .state{fill:#101a2c}
.tcm .state-mesh{fill:none;stroke:#283a56;stroke-width:1}
.tcm .nation{fill:none;stroke:#41618f;stroke-width:1.8}
.tcm .halo{fill:rgba(77,166,255,.12)}
.tcm .disc{fill:rgba(77,166,255,.22);stroke:var(--tcm-blue);stroke-width:2}
.tcm .dot{fill:#fff}
.tcm .cnt{font-weight:700;fill:#fff;text-anchor:middle;dominant-baseline:central}
.tcm .lbl{font-family:"Orbitron",sans-serif;font-weight:700;font-size:13px;letter-spacing:1.4px;
  fill:var(--tcm-fg);text-transform:uppercase}
.tcm .lbl2{font-size:12px;fill:var(--tcm-muted)}
.tcm .leader{fill:none;stroke:#3a4d6d;stroke-width:1}
.tcm .home .halo{fill:rgba(255,59,48,.16)}
.tcm .home .disc{fill:rgba(255,59,48,.28);stroke:var(--tcm-red)}
.tcm .home .dot{fill:#ffd9d5}
.tcm .home .lbl{fill:var(--tcm-fg)}
.tcm .home .lbl2{font-family:"Orbitron",sans-serif;font-weight:700;font-size:30px;letter-spacing:1.5px;
  fill:var(--tcm-red);text-transform:uppercase}
.tcm .home .leader{stroke:#8a3a34}
.tcm .ring{fill:none;stroke:rgba(255,59,48,.5);stroke-width:1.5;stroke-dasharray:3 5;
  transform-box:fill-box;transform-origin:center;animation:tcm-spin 14s linear infinite}
@keyframes tcm-spin{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){.tcm .ring{animation:none}}
`;

type Geometry3 = {
  nation: FeatureCollection | Feature;
  states: FeatureCollection | null;
  borders: Geometry | null;
};

async function loadGeometry(url: string, fallbackUrl: string): Promise<Geometry3> {
  try {
    const topo: Topology = await fetch(url).then((r) => {
      if (!r.ok) throw new Error(`us-atlas ${r.status}`);
      return r.json();
    });
    return {
      nation: topoFeature(topo, topo.objects.nation as GeometryCollection),
      states: topoFeature(topo, topo.objects.states as GeometryCollection) as FeatureCollection,
      borders: topoMesh(topo, topo.objects.states as GeometryCollection, (a, b) => a !== b),
    };
  } catch (err) {
    console.warn('us-atlas unavailable, falling back to world-atlas', err);
    const world: Topology = await fetch(fallbackUrl).then((r) => r.json());
    const countries = topoFeature(world, world.objects.countries as GeometryCollection) as FeatureCollection;
    const us = countries.features.find(
      (f) => f.properties && (f.properties as { name?: string }).name === 'United States of America'
    );
    return { nation: { type: 'FeatureCollection', features: us ? [us] : [] }, states: null, borders: null };
  }
}

type Geom = {
  x: number;
  y: number;
  rad: number;
  big: boolean;
  lx: number;
  ly: number;
  anchor: 'start' | 'end';
  leader?: string;
  sub: string;
};

/*  Resolves a city into everything the SVG needs: projected point, radius,
    label anchor, and an optional leader path.  */
function layout(city: City, proj: GeoProjection, r: (n: number) => number): Geom | null {
  const point = proj([city.lon, city.lat]);
  if (!point) return null;

  const [x, y] = point;
  const rad = city.home ? r(city.n) * 2 : r(city.n);
  const big = rad >= 13;

  let lx: number, ly: number, anchor: 'start' | 'end', leader: string | undefined;
  if (city.gutter !== undefined) {
    lx = GUTTER_X;
    ly = city.gutter;
    anchor = 'start';
    leader = `M${x + rad + 3},${y} L${GUTTER_X - 30},${y} L${GUTTER_X - 14},${ly} L${GUTTER_X - 6},${ly}`;
  } else {
    const dir = city.dir ?? 1;
    const dy = city.dy ?? 0;
    lx = x + dir * (rad + 12);
    ly = y + dy;
    anchor = dir < 0 ? 'end' : 'start';
    if (city.leader) {
      leader = `M${x + (dir * rad) / 2},${y + rad * 0.72} L${lx + dir * 6},${ly - 12}`;
    }
  }

  return {
    x, y, rad, big, lx, ly, anchor, leader,
    sub: city.short + (big ? '' : `  ·  ${city.n} event${city.n > 1 ? 's' : ''}`),
  };
}

export default function TradingCompetitionMap({
  cities = CITIES,
  geoUrl = GEO_URL,
  fallbackGeoUrl = GEO_FALLBACK_URL,
  className = '',
}: {
  cities?: City[];
  geoUrl?: string;
  fallbackGeoUrl?: string;
  className?: string;
}) {
  const [geo, setGeo] = useState<Geometry3 | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    loadGeometry(geoUrl, fallbackGeoUrl)
      .then((g) => live && setGeo(g))
      .catch((err) => {
        console.error('Trading competition map: geometry failed to load', err);
        if (live) setFailed(true);
      });
    return () => {
      live = false;
    };
  }, [geoUrl, fallbackGeoUrl]);

  const { path, marks } = useMemo(() => {
    if (!geo) return { path: null, marks: [] as { city: City; geom: Geom }[] };
    const proj = geoAlbersUsa().fitSize([W, H], geo.nation as GeoPermissibleObjects);
    const p = geoPath(proj);
    const r = scaleSqrt()
      .domain([0, max(cities, (c) => c.n) ?? 1])
      .range([0, MAX_R]);
    return {
      path: p,
      marks: cities
        .map((c) => ({ city: c, geom: layout(c, proj, r) }))
        .filter((m): m is { city: City; geom: Geom } => m.geom !== null),
    };
  }, [geo, cities]);

  return (
    <figure className={`tcm ${className}`.trim()}>
      <style>{CSS}</style>
      <div className="tcm-inner">
        <h2 className="tcm-title">First Quant Competition in the Southeast</h2>
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          role="img"
          aria-label="Map of United States collegiate trading competition host cities, 2016 to 2026"
        >
          {failed && (
            <text x={VIEW_W / 2} y={VIEW_H / 2} textAnchor="middle" fill="#9A9AA8"
                  style={{ font: "13px 'Space Mono', monospace" }}>
              Map geometry could not be loaded.
            </text>
          )}

          {path && geo?.states && (
            <g>
              {geo.states.features.map((f) => (
                <path key={String(f.id)} className="state" d={path(f as GeoPermissibleObjects) ?? undefined} />
              ))}
            </g>
          )}
          {path && geo?.borders && <path className="state-mesh" d={path(geo.borders as GeoPermissibleObjects) ?? undefined} />}
          {path && geo && <path className="nation" d={path(geo.nation as GeoPermissibleObjects) ?? undefined} />}

          {marks.map(({ city, geom }) => (
            <g key={city.id} className={city.home ? 'home' : undefined}>
              {geom.leader && <path className="leader" d={geom.leader} />}
              <circle className="halo" cx={geom.x} cy={geom.y} r={geom.rad + 9} />
              {city.home && <circle className="ring" cx={geom.x} cy={geom.y} r={geom.rad + 15} />}
              <circle className="disc" cx={geom.x} cy={geom.y} r={geom.rad} />

              {geom.big ? (
                <text className="cnt" x={geom.x} y={geom.y}
                      style={{ fontSize: geom.rad > 18 ? 17 : 14 }}>
                  {city.n}
                </text>
              ) : (
                !city.nodot && <circle className="dot" cx={geom.x} cy={geom.y} r={2.6} />
              )}

              <text className="lbl" x={geom.lx} y={geom.ly} textAnchor={geom.anchor}>
                {city.city}
              </text>
              <text className="lbl2" x={geom.lx} y={geom.ly + (city.home ? 34 : 15)} textAnchor={geom.anchor}>
                {geom.sub}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </figure>
  );
}
