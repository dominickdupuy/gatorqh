import { useEffect, useRef, useState, type ChangeEvent } from 'react';

// Rubric from guide §11, applied to the one official 100-packet run.
const SCORED_PACKETS = 84;
const SCORED_ACTIONS = 168;
const REF_LATENCY_MS = 16.626;
const REF_LUTS = 542;

type Inputs = { packets: number; actions: number; latency: number; luts: number };

const PRESETS: { label: string; values: Inputs }[] = [
  { label: 'FLAWLESS', values: { packets: 84, actions: 168, latency: 17, luts: 542 } },
  { label: 'RIGHT BUT BIG', values: { packets: 84, actions: 168, latency: 17, luts: 1100 } },
  { label: 'SLOW BUT RIGHT', values: { packets: 84, actions: 168, latency: 25, luts: 600 } },
  { label: 'TIMEOUT AT #60', values: { packets: 44, actions: 88, latency: 17, luts: 480 } },
  { label: 'SLOT-SWAP BUG', values: { packets: 72, actions: 150, latency: 17, luts: 520 } },
];

const score = ({ packets, actions, latency, luts }: Inputs) => {
  const correctness = packets / SCORED_PACKETS;
  const locked = correctness < 0.95;
  const ratio = latency / REF_LATENCY_MS;
  const lockNote = `LOCKED AT 0 · packet correctness ${(correctness * 100).toFixed(1)}% is below 95%`;
  return [
    {
      key: 'packets',
      label: 'PACKET CORRECTNESS',
      max: 50,
      points: 50 * correctness,
      tiers: ['50 × correct ÷ 84'],
      tier: 0,
      locked: false,
      note: `${packets} of ${SCORED_PACKETS} scored packets fully correct`,
    },
    {
      key: 'actions',
      label: 'ACTION CORRECTNESS',
      max: 20,
      points: 20 * (actions / SCORED_ACTIONS),
      tiers: ['20 × correct ÷ 168'],
      tier: 0,
      locked: false,
      note: `${actions} of ${SCORED_ACTIONS} scored actions correct`,
    },
    {
      key: 'latency',
      label: 'LATENCY',
      max: 15,
      points: locked ? 0 : ratio <= 1.25 ? 15 : ratio <= 2 ? 8 : 0,
      tiers: ['≤ 1.25× → 15', '≤ 2× → 8', '> 2× → 0'],
      tier: locked ? -1 : ratio <= 1.25 ? 0 : ratio <= 2 ? 1 : 2,
      locked,
      note: locked ? lockNote : `${latency.toFixed(1)} ms average is ${ratio.toFixed(2)}× the ${REF_LATENCY_MS} ms reference`,
    },
    {
      key: 'luts',
      label: 'LUT USAGE',
      max: 15,
      points: locked ? 0 : 15 * Math.min(1, REF_LUTS / luts),
      tiers: [`15 × min(1, ${REF_LUTS} ÷ LUTs)`],
      tier: locked ? -1 : 0,
      locked,
      note: locked ? lockNote : `${luts} LUTs against the ${REF_LUTS}-LUT reference design`,
    },
  ];
};

export function ScoreSim() {
  const [inputs, setInputs] = useState<Inputs>(PRESETS[0].values);
  const [shown, setShown] = useState(0);
  const shownRef = useRef(0);
  const rows = score(inputs);
  const total = rows.reduce((sum, row) => sum + row.points, 0);

  // The total rolls toward its new value like an odometer.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      shownRef.current = total;
      setShown(total);
      return;
    }
    let raf = 0;
    const from = shownRef.current;
    const begin = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - begin) / 500);
      const value = from + (total - from) * (1 - (1 - t) ** 3);
      shownRef.current = value;
      setShown(value);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [total]);

  const set = (key: keyof Inputs) => (event: ChangeEvent<HTMLInputElement>) =>
    setInputs((current) => ({ ...current, [key]: Number(event.target.value) }));

  const verdict = total >= 99.95 ? 'PERFECT RUN' : total >= 90 ? 'SYSTEMS NOMINAL' : total >= 70 ? 'MOSTLY NOMINAL' : 'CHECK YOUR CSV';

  const sliders: { key: keyof Inputs; label: string; min: number; max: number; step: number; format: (value: number) => string }[] = [
    { key: 'packets', label: 'CORRECT PACKETS', min: 0, max: SCORED_PACKETS, step: 1, format: (value) => `${value} / ${SCORED_PACKETS}` },
    { key: 'actions', label: 'CORRECT ACTIONS', min: 0, max: SCORED_ACTIONS, step: 1, format: (value) => `${value} / ${SCORED_ACTIONS}` },
    { key: 'latency', label: 'AVERAGE LATENCY', min: 14, max: 40, step: 0.1, format: (value) => `${value.toFixed(1)} ms` },
    { key: 'luts', label: 'TOTAL LUTS', min: 200, max: 2000, step: 10, format: (value) => `${value}` },
  ];

  return (
    <div className="ss">
      <div className="ss-top">
        <span>SCORE SIMULATOR · THE OFFICIAL RUN</span>
        <em>DRAG THE SLIDERS OR LOAD A SCENARIO</em>
      </div>

      <div className="ss-presets" role="group" aria-label="Example scenarios">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            className={`ss-preset ${JSON.stringify(preset.values) === JSON.stringify(inputs) ? 'ss-preset--on' : ''}`}
            onClick={() => setInputs(preset.values)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="ss-grid">
        <div className="ss-sliders">
          {sliders.map((slider) => (
            <label key={slider.key} className="ss-slider">
              <span>
                {slider.label}
                <b>{slider.format(inputs[slider.key])}</b>
              </span>
              <input
                type="range"
                min={slider.min}
                max={slider.max}
                step={slider.step}
                value={inputs[slider.key]}
                onChange={set(slider.key)}
                style={{ ['--fill' as string]: `${((inputs[slider.key] - slider.min) / (slider.max - slider.min)) * 100}%` }}
              />
            </label>
          ))}
          <div className="ss-total">
            <div className="ss-total__num">
              {shown.toFixed(1)}
              <small>/100</small>
            </div>
            <div className={`ss-total__verdict ${total >= 90 ? 'ss-total__verdict--good' : total >= 70 ? '' : 'ss-total__verdict--bad'}`}>{verdict}</div>
          </div>
        </div>

        <div className="ss-rows">
          {rows.map((row) => (
            <div key={row.key} className={`ss-row ${row.locked ? 'ss-row--locked' : ''}`}>
              <div className="ss-row__head">
                <span>{row.label}</span>
                <b>
                  {row.points % 1 === 0 ? row.points : row.points.toFixed(1)}
                  <small>/{row.max}</small>
                </b>
              </div>
              <div className="ss-row__bar">
                <i style={{ width: `${(row.points / row.max) * 100}%` }} />
              </div>
              <div className="ss-row__tiers">
                {row.tiers.map((tier, index) => (
                  <em key={tier} className={row.tier === index ? 'ss-tier--on' : ''}>
                    {tier}
                  </em>
                ))}
              </div>
              <p>{row.note}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .ss {
          font-family: 'Space Mono', monospace;
          border: 1px solid #1d4f83;
          background: linear-gradient(180deg, rgba(7, 13, 26, 0.96), rgba(4, 8, 18, 0.98));
          box-shadow: 0 0 0 3px rgba(5, 11, 23, 0.98), 0 0 36px rgba(4, 74, 148, 0.16);
          padding: 18px;
        }

        .ss-top {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          gap: 4px 16px;
          margin-bottom: 12px;
          padding-bottom: 10px;
          border-bottom: 1px dashed rgba(41, 79, 125, 0.7);
          font-family: 'Orbitron', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2px;
          color: #fff;
        }

        .ss-top em {
          font-style: normal;
          font-size: 9px;
          letter-spacing: 1.4px;
          color: #63f6ff;
        }

        .ss-presets {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 16px;
        }

        .ss-preset {
          padding: 6px 10px;
          border: 1px solid #294f7d;
          background: #07101d;
          color: #9cc9ff;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1px;
        }

        .ss-preset:hover { border-color: #63f6ff; color: #fff; }
        .ss-preset--on { border-color: #FA4616; background: #FA4616; color: #fff; }

        .ss-grid {
          display: grid;
          gap: 18px;
        }

        @media (min-width: 960px) {
          .ss-grid { grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr); }
        }

        .ss-sliders {
          display: grid;
          gap: 14px;
          align-content: start;
        }

        .ss-slider span {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 6px;
          font-family: 'Orbitron', sans-serif;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.5px;
          color: #7e90ab;
        }

        .ss-slider b {
          font-family: 'VT323', monospace;
          font-size: 22px;
          font-weight: 400;
          letter-spacing: 0;
          color: #fff4c8;
        }

        .ss-slider input {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 8px;
          background: linear-gradient(90deg, #FA4616, #ffb84d var(--fill), #12233a var(--fill));
          border: 1px solid #294f7d;
          outline: none;
        }

        .ss-slider input::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 20px;
          background: #fff4c8;
          border: 2px solid #FA4616;
          box-shadow: 0 0 12px rgba(250, 70, 22, 0.8);
          cursor: pointer;
        }

        .ss-slider input::-moz-range-thumb {
          width: 12px;
          height: 18px;
          background: #fff4c8;
          border: 2px solid #FA4616;
          border-radius: 0;
          cursor: pointer;
        }

        .ss-total {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 8px 16px;
          margin-top: 6px;
          padding: 14px 16px;
          border: 2px solid #FA4616;
          background:
            repeating-linear-gradient(135deg, rgba(250, 70, 22, 0.07) 0 10px, transparent 10px 20px),
            rgba(7, 13, 26, 0.95);
        }

        .ss-total__num {
          font-family: 'Press Start 2P', monospace;
          font-size: clamp(28px, 4vw, 40px);
          color: #fff;
          text-shadow: 0 0 20px rgba(250, 70, 22, 0.5);
        }

        .ss-total__num small {
          font-size: 0.4em;
          color: #7e90ab;
        }

        .ss-total__verdict {
          font-family: 'Orbitron', sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 2px;
          color: #ffb84d;
        }

        .ss-total__verdict--good { color: #4cff87; }
        .ss-total__verdict--bad { color: #ff5a6e; }

        .ss-rows {
          display: grid;
          gap: 12px;
        }

        .ss-row {
          padding: 10px 12px;
          border: 1px solid rgba(41, 79, 125, 0.6);
          background: rgba(4, 9, 19, 0.9);
          transition: border-color 200ms ease;
        }

        .ss-row--locked { border-color: rgba(255, 90, 110, 0.6); }

        .ss-row__head {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          font-family: 'Orbitron', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.6px;
          color: #fff;
        }

        .ss-row__head b {
          font-family: 'VT323', monospace;
          font-size: 26px;
          font-weight: 400;
          letter-spacing: 0;
          color: #fff4c8;
        }

        .ss-row__head small { font-size: 16px; color: #5f7390; }

        .ss-row__bar {
          height: 8px;
          margin: 4px 0 8px;
          border: 1px solid rgba(41, 79, 125, 0.7);
          background: #0b1830;
        }

        .ss-row__bar i {
          display: block;
          height: 100%;
          background: repeating-linear-gradient(90deg, #FA4616 0 10px, #ff7a4a 10px 12px);
          box-shadow: 0 0 10px rgba(250, 70, 22, 0.5);
          transition: width 450ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .ss-row__tiers {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-bottom: 6px;
        }

        .ss-row__tiers em {
          padding: 2px 6px;
          border: 1px solid rgba(41, 79, 125, 0.7);
          font-style: normal;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.6px;
          color: #5f7390;
          transition: all 160ms ease;
        }

        .ss-row__tiers .ss-tier--on {
          border-color: #4cff87;
          background: rgba(76, 255, 135, 0.14);
          color: #4cff87;
        }

        .ss-row p {
          margin: 0;
          font-size: 11px;
          line-height: 1.55;
          color: #a7b4c9;
        }

        .ss-row--locked p { color: #ff8a98; }
      `}</style>
    </div>
  );
}
