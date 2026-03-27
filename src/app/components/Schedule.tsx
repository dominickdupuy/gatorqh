import { useState } from 'react';

type NodeType =
  | 'coin'
  | 'gate'
  | 'dock'
  | 'start'
  | 'crate'
  | 'fuel'
  | 'breakfast'
  | 'scanner'
  | 'lunch'
  | 'riskcore'
  | 'dinner'
  | 'snack'
  | 'shutdown'
  | 'boss'
  | 'awards'
  | 'closing';

type ScheduleEvent = {
  time: string;
  title: string;
  subtitle: string;
  type: 'key' | 'powerup' | 'standard';
  nodeType: NodeType;
};

type ScheduleDay = {
  label: string;
  date: string;
  sector: string;
  sectorColor: string;
  sectorGlow: string;
  events: ScheduleEvent[];
};

const days: ScheduleDay[] = [
  {
    label: 'Day 1',
    date: 'Friday, Sep 25',
    sector: 'LAUNCH SECTOR',
    sectorColor: '#FA4616',
    sectorGlow: 'rgba(250,70,22,0.16)',
    events: [
      { time: '05:00 PM', title: 'Insert Coin Portal', subtitle: 'Registration & Check-In', type: 'standard', nodeType: 'coin' },
      { time: '06:00 PM', title: 'Game Boot Sequence', subtitle: 'Opening Ceremony & Keynote', type: 'key', nodeType: 'gate' },
      { time: '07:00 PM', title: 'Guild Formation', subtitle: 'Team Formation & Networking', type: 'standard', nodeType: 'dock' },
      { time: '08:00 PM', title: 'Hacking Begins - System Online', subtitle: 'Official Hackathon Start', type: 'key', nodeType: 'start' },
      { time: '09:00 PM', title: 'Power-Up: Market Data APIs', subtitle: 'Workshop on Financial Data Integration', type: 'powerup', nodeType: 'crate' },
      { time: '11:00 PM', title: 'Midnight Fuel Station', subtitle: 'Late Night Snacks & Drinks', type: 'standard', nodeType: 'fuel' },
    ],
  },
  {
    label: 'Day 2',
    date: 'Saturday, Sep 26',
    sector: 'VOLATILITY CORE',
    sectorColor: '#044a94',
    sectorGlow: 'rgba(4,74,148,0.18)',
    events: [
      { time: '09:00 AM', title: 'Morning Energy Boost', subtitle: 'Breakfast & Coffee', type: 'standard', nodeType: 'breakfast' },
      { time: '10:00 AM', title: 'Power-Up: ML for Trading', subtitle: 'Machine Learning Models Workshop', type: 'powerup', nodeType: 'scanner' },
      { time: '12:00 PM', title: 'Fuel Station + Sponsor Scouting', subtitle: 'Lunch & Networking with Sponsors', type: 'standard', nodeType: 'lunch' },
      { time: '03:00 PM', title: 'Power-Up: Risk Management Systems', subtitle: 'Portfolio & VaR Analytics Workshop', type: 'powerup', nodeType: 'riskcore' },
      { time: '06:00 PM', title: 'Dinner & Recharge', subtitle: 'Dinner Served', type: 'standard', nodeType: 'dinner' },
      { time: '09:00 PM', title: 'Energy Boost Activated', subtitle: 'Midnight Snacks & Final Sprint', type: 'standard', nodeType: 'snack' },
    ],
  },
  {
    label: 'Day 3',
    date: 'Sunday, Sep 27',
    sector: 'FINAL BOSS APPROACH',
    sectorColor: '#9B5DE5',
    sectorGlow: 'rgba(155,93,229,0.18)',
    events: [
      { time: '08:00 AM', title: 'Hacking Ends - Models Down', subtitle: 'Final Submission Deadline', type: 'key', nodeType: 'shutdown' },
      { time: '09:00 AM', title: 'Boss Battles', subtitle: 'Project Demos & Live Judging', type: 'key', nodeType: 'boss' },
      { time: '11:30 AM', title: 'Final Fuel Break', subtitle: 'Lunch & Socializing', type: 'standard', nodeType: 'fuel' },
      { time: '12:00 PM', title: 'High Score Champions Announced', subtitle: 'Awards Ceremony & Prizes', type: 'key', nodeType: 'awards' },
      { time: '01:00 PM', title: 'Game Over - See You Next Year', subtitle: 'Closing & Photos', type: 'standard', nodeType: 'closing' },
    ],
  },
];

function StageSprite({ nodeType, accentColor }: { nodeType: NodeType; accentColor: string }) {
  return (
    <div className={`stage-sprite stage-sprite--${nodeType}`}>
      {nodeType === 'coin' && (
        <>
          <span className="coin-slot" />
          <span className="coin-disc" />
          <span className="coin-ship" />
          <span className="status-chip status-chip--inserted">INSERTED</span>
        </>
      )}

      {nodeType === 'gate' && (
        <>
          <span className="boss-gate boss-gate--left" />
          <span className="boss-gate boss-gate--right" />
          <span className="boss-core" />
          <span className="flame-bar flame-bar--left" />
          <span className="flame-bar flame-bar--right" />
          <span className="status-chip status-chip--key">KEY EVENT</span>
        </>
      )}

      {nodeType === 'dock' && (
        <>
          <span className="team-satellite" />
          <span className="dock-ship dock-ship--1" />
          <span className="dock-ship dock-ship--2" />
          <span className="dock-ship dock-ship--3" />
          <span className="energy-beam energy-beam--1" />
          <span className="energy-beam energy-beam--2" />
        </>
      )}

      {nodeType === 'start' && (
        <>
          <span className="start-asteroid" />
          <span className="start-text">START</span>
          <span className="code-rain code-rain--1" />
          <span className="code-rain code-rain--2" />
          <span className="code-rain code-rain--3" />
        </>
      )}

      {nodeType === 'crate' && (
        <>
          <span className="power-crate" />
          <span className="lightning lightning--1" />
          <span className="lightning lightning--2" />
          <span className="status-chip status-chip--power">POWER-UP ACQUIRED</span>
          <span className="speed-line speed-line--1" />
          <span className="speed-line speed-line--2" />
        </>
      )}

      {nodeType === 'fuel' && (
        <>
          <span className="fuel-item fuel-item--canister" />
          <span className="fuel-item fuel-item--slice" />
          <span className="crumb crumb--1" />
          <span className="crumb crumb--2" />
          <span className="crumb crumb--3" />
        </>
      )}

      {nodeType === 'breakfast' && (
        <>
          <span className="morning-core" />
          <span className="satellite-ring" />
        </>
      )}

      {nodeType === 'scanner' && (
        <>
          <span className="scan-crate" />
          <span className="scan-pulse scan-pulse--1" />
          <span className="scan-pulse scan-pulse--2" />
        </>
      )}

      {nodeType === 'lunch' && (
        <>
          <span className="sponsor-station" />
          <span className="station-orb station-orb--1" />
          <span className="station-orb station-orb--2" />
        </>
      )}

      {nodeType === 'riskcore' && (
        <>
          <span className="risk-core" />
          <span className="risk-ring risk-ring--1" />
          <span className="risk-ring risk-ring--2" />
        </>
      )}

      {nodeType === 'dinner' && (
        <>
          <span className="fuel-item fuel-item--plate" />
          <span className="crumb crumb--1" />
          <span className="crumb crumb--2" />
        </>
      )}

      {nodeType === 'snack' && (
        <>
          <span className="spark-core" />
          <span className="spark-ring" />
        </>
      )}

      {nodeType === 'shutdown' && (
        <>
          <span className="shutdown-node" />
          <span className="shutdown-bar shutdown-bar--1" />
          <span className="shutdown-bar shutdown-bar--2" />
        </>
      )}

      {nodeType === 'boss' && (
        <>
          <span className="boss-skull" />
          <span className="boss-wing boss-wing--1" />
          <span className="boss-wing boss-wing--2" />
          <span className="status-chip status-chip--key">FINAL BOSS</span>
        </>
      )}

      {nodeType === 'awards' && (
        <>
          <span className="award-core" />
          <span className="award-spike award-spike--1" />
          <span className="award-spike award-spike--2" />
          <span className="award-spike award-spike--3" />
          <span className="award-spike award-spike--4" />
        </>
      )}

      {nodeType === 'closing' && (
        <>
          <span className="closing-gate" />
          <span className="closing-star closing-star--1" />
          <span className="closing-star closing-star--2" />
        </>
      )}

      <div className="sprite-glow" style={{ boxShadow: `0 0 32px ${accentColor}55` }} />
    </div>
  );
}

export function Schedule() {
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState(0);

  const getBadge = (type: ScheduleEvent['type']) => {
    if (type === 'key') return { label: 'KEY EVENT', color: '#FA4616' };
    if (type === 'powerup') return { label: 'POWER-UP', color: '#044a94' };
    return { label: 'STAGE NODE', color: '#9B5DE5' };
  };

  return (
    <section id="schedule" className="relative overflow-hidden bg-[#0F0F1F] py-16 md:py-24">
      <style>{`
        @keyframes sectorFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }

        @keyframes coinSpin {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(360deg); }
        }

        @keyframes insertedFlash {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }

        @keyframes flamePulse {
          0%, 100% { opacity: 0.45; transform: scaleY(1); }
          50% { opacity: 0.95; transform: scaleY(1.35); }
        }

        @keyframes beamLink {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.9; }
        }

        @keyframes orbitShip {
          from { transform: rotate(0deg) translateX(20px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(20px) rotate(-360deg); }
        }

        @keyframes crackOpen {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08) rotate(-3deg); }
        }

        @keyframes codeFall {
          from { transform: translateY(0); opacity: 0; }
          20% { opacity: 0.9; }
          to { transform: translateY(22px); opacity: 0; }
        }

        @keyframes pulseRing {
          0% { transform: translate(-50%, -50%) scale(0.65); opacity: 0; }
          35% { opacity: 0.6; }
          100% { transform: translate(-50%, -50%) scale(1.2); opacity: 0; }
        }

        @keyframes bobItem {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }

        @keyframes crumbTrail {
          from { transform: translateY(0); opacity: 0; }
          30% { opacity: 1; }
          to { transform: translateY(18px); opacity: 0; }
        }

        @keyframes stageBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }

        .sector-panel {
          animation: sectorFloat 8s ease-in-out infinite;
        }

        .stage-node:hover .coin-disc {
          animation: coinSpin 0.8s linear infinite;
        }

        .stage-node:hover .status-chip--inserted,
        .stage-node:hover .status-chip--power,
        .stage-node:hover .status-chip--key {
          animation: insertedFlash 0.6s steps(2, end) infinite;
          opacity: 1;
        }

        .stage-node:hover .flame-bar,
        .stage-node:hover .spark-ring {
          animation: flamePulse 0.45s steps(2, end) infinite;
        }

        .stage-node:hover .dock-ship {
          animation: orbitShip 2s linear infinite;
          opacity: 1;
        }

        .stage-node:hover .dock-ship--2 { animation-duration: 2.6s; }
        .stage-node:hover .dock-ship--3 { animation-duration: 3s; }

        .stage-node:hover .energy-beam {
          animation: beamLink 0.5s ease-in-out infinite;
          opacity: 1;
        }

        .stage-node:hover .start-asteroid,
        .stage-node:hover .boss-skull {
          animation: crackOpen 0.8s ease-in-out infinite;
        }

        .stage-node:hover .code-rain {
          animation: codeFall 0.8s linear infinite;
          opacity: 1;
        }

        .stage-node:hover .signal-orbit,
        .stage-node:hover .scan-pulse,
        .stage-node:hover .risk-ring {
          animation: pulseRing 1.5s ease-out infinite;
          opacity: 1;
        }

        .stage-node:hover .scan-pulse--2,
        .stage-node:hover .risk-ring--2 {
          animation-delay: 0.3s;
        }

        .stage-node:hover .fuel-item,
        .stage-node:hover .morning-core,
        .stage-node:hover .sponsor-station,
        .stage-node:hover .shutdown-node,
        .stage-node:hover .award-core,
        .stage-node:hover .closing-gate {
          animation: bobItem 1s ease-in-out infinite;
        }

        .stage-node:hover .crumb {
          animation: crumbTrail 0.8s linear infinite;
          opacity: 1;
        }

        .stage-node:hover .crumb--2 { animation-delay: 0.12s; }
        .stage-node:hover .crumb--3 { animation-delay: 0.24s; }

        .stage-node:hover .status-led {
          animation: stageBlink 0.9s step-end infinite;
        }

        .stage-sprite {
          position: relative;
          width: 104px;
          height: 104px;
          display: flex;
          align-items: center;
          justify-content: center;
          image-rendering: pixelated;
        }

        .stage-sprite span,
        .stage-sprite div {
          position: absolute;
          image-rendering: pixelated;
        }

        .sprite-glow {
          inset: 32px;
          border-radius: 999px;
          opacity: 0.35;
          pointer-events: none;
        }

        .coin-slot {
          width: 38px;
          height: 58px;
          background: #221408;
          border: 4px solid #ff8a32;
          box-shadow: inset 0 0 0 4px #5e2d00;
        }

        .coin-slot::after {
          content: '';
          position: absolute;
          left: 8px;
          right: 8px;
          top: 10px;
          height: 8px;
          background: #050505;
        }

        .coin-disc {
          top: 10px;
          left: 50%;
          width: 18px;
          height: 18px;
          margin-left: -9px;
          background: #ffd348;
          box-shadow: inset 0 0 0 4px #ff8a32;
        }

        .coin-ship {
          bottom: 16px;
          width: 18px;
          height: 8px;
          background: #9cc9ff;
          box-shadow: 4px 0 0 #044a94, -4px 0 0 #044a94, 0 4px 0 #fa4616;
        }

        .status-chip {
          bottom: 2px;
          left: 50%;
          transform: translateX(-50%);
          padding: 2px 6px;
          font-family: 'Press Start 2P', monospace;
          font-size: 7px;
          letter-spacing: 1px;
          white-space: nowrap;
          opacity: 0;
        }

        .status-chip--inserted {
          color: #ffd348;
        }

        .status-chip--key {
          color: #fa4616;
        }

        .status-chip--power {
          color: #9cc9ff;
        }

        .boss-gate {
          top: 18px;
          width: 18px;
          height: 48px;
          background: #6a0900;
          border: 3px solid #fa4616;
        }

        .boss-gate--left { left: 18px; }
        .boss-gate--right { right: 18px; }

        .boss-core {
          top: 34px;
          left: 50%;
          width: 20px;
          height: 20px;
          margin-left: -10px;
          background: #ffd348;
          box-shadow: 0 0 0 4px #fa4616;
        }

        .flame-bar {
          bottom: 16px;
          width: 10px;
          height: 18px;
          background: #ff9d2a;
          opacity: 0.55;
        }

        .flame-bar--left { left: 14px; }
        .flame-bar--right { right: 14px; }

        .team-satellite {
          width: 30px;
          height: 30px;
          background: #7a4bb3;
          box-shadow: 0 0 0 4px #9b5de5;
        }

        .dock-ship {
          top: 50%;
          left: 50%;
          width: 8px;
          height: 8px;
          margin-left: -4px;
          margin-top: -4px;
          background: #9cc9ff;
          opacity: 0.7;
        }

        .energy-beam {
          top: 50%;
          left: 50%;
          width: 32px;
          height: 1px;
          background: linear-gradient(90deg, transparent, #c48dff, transparent);
          opacity: 0.2;
        }

        .energy-beam--1 { transform: rotate(28deg); }
        .energy-beam--2 { transform: rotate(-28deg); }

        .start-asteroid {
          width: 56px;
          height: 56px;
          background: #7d1b12;
          box-shadow: inset 0 0 0 4px #fa4616;
          clip-path: polygon(18% 0, 86% 8%, 100% 38%, 90% 100%, 28% 92%, 0 62%, 6% 20%);
        }

        .start-text {
          font-family: 'Press Start 2P', monospace;
          font-size: 10px;
          color: #f4f7ff;
          letter-spacing: 1px;
        }

        .code-rain {
          top: 68px;
          width: 2px;
          height: 18px;
          background: linear-gradient(180deg, #00ff41, transparent);
          opacity: 0;
        }

        .code-rain--1 { left: 38px; }
        .code-rain--2 { left: 50px; }
        .code-rain--3 { left: 62px; }

        .power-crate,
        .scan-crate {
          width: 38px;
          height: 38px;
          background: #10325a;
          border: 4px solid #4fb4ff;
          box-shadow: inset 0 0 0 4px #044a94;
        }

        .lightning {
          width: 10px;
          height: 18px;
          background: #9cc9ff;
          clip-path: polygon(44% 0, 100% 0, 58% 44%, 100% 44%, 0 100%, 36% 56%, 0 56%);
        }

        .lightning--1 { left: 18px; top: 14px; }
        .lightning--2 { right: 18px; top: 18px; }

        .speed-line {
          right: 6px;
          width: 22px;
          height: 2px;
          background: linear-gradient(90deg, transparent, #9cc9ff);
          opacity: 0;
        }

        .speed-line--1 { top: 40px; }
        .speed-line--2 { top: 48px; }

        .fuel-item {
          animation: none;
        }

        .fuel-item--canister {
          width: 24px;
          height: 40px;
          background: #7a4bb3;
          border: 4px solid #9b5de5;
        }

        .fuel-item--slice {
          right: 18px;
          top: 24px;
          width: 0;
          height: 0;
          border-left: 12px solid transparent;
          border-right: 12px solid transparent;
          border-top: 20px solid #ffb347;
          transform: rotate(18deg);
        }

        .fuel-item--plate {
          width: 40px;
          height: 18px;
          background: #9b5de5;
          border: 4px solid #c48dff;
        }

        .crumb {
          width: 4px;
          height: 4px;
          background: #ffd348;
          opacity: 0;
        }

        .crumb--1 { left: 20px; bottom: 12px; }
        .crumb--2 { left: 48px; bottom: 16px; }
        .crumb--3 { left: 62px; bottom: 10px; }

        .morning-core,
        .spark-core,
        .award-core {
          width: 26px;
          height: 26px;
          background: #9cc9ff;
          box-shadow: 0 0 0 4px #044a94;
        }

        .satellite-ring,
        .spark-ring {
          width: 54px;
          height: 54px;
          border: 2px solid #9cc9ff;
          border-radius: 999px;
          opacity: 0.5;
        }

        .scan-pulse,
        .risk-ring {
          top: 50%;
          left: 50%;
          width: 46px;
          height: 46px;
          border-radius: 999px;
          border: 2px solid #9cc9ff;
          transform: translate(-50%, -50%);
          opacity: 0;
        }

        .risk-core {
          width: 30px;
          height: 30px;
          background: #9b5de5;
          box-shadow: 0 0 0 4px #6530a3;
          clip-path: polygon(25% 6%, 75% 6%, 94% 50%, 75% 94%, 25% 94%, 6% 50%);
        }

        .risk-ring {
          border-color: #c48dff;
        }

        .sponsor-station {
          width: 44px;
          height: 28px;
          background: #1a3f6d;
          border: 4px solid #044a94;
        }

        .station-orb {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: #9cc9ff;
        }

        .station-orb--1 { left: 20px; top: 18px; }
        .station-orb--2 { right: 20px; bottom: 18px; }

        .shutdown-node {
          width: 40px;
          height: 40px;
          background: #65211d;
          border: 4px solid #fa4616;
        }

        .shutdown-bar {
          width: 48px;
          height: 4px;
          background: #fa4616;
        }

        .shutdown-bar--1 { transform: rotate(45deg); }
        .shutdown-bar--2 { transform: rotate(-45deg); }

        .boss-skull {
          width: 34px;
          height: 34px;
          background: #fa4616;
          clip-path: polygon(18% 0, 82% 0, 100% 42%, 76% 100%, 24% 100%, 0 42%);
        }

        .boss-wing {
          width: 18px;
          height: 28px;
          background: #7b1b12;
          border: 3px solid #fa4616;
          top: 34px;
        }

        .boss-wing--1 { left: 14px; }
        .boss-wing--2 { right: 14px; }

        .award-spike {
          width: 4px;
          height: 18px;
          background: #ffd348;
        }

        .award-spike--1 { top: 8px; transform: rotate(0deg); }
        .award-spike--2 { top: 18px; transform: rotate(45deg); }
        .award-spike--3 { top: 18px; transform: rotate(-45deg); }
        .award-spike--4 { bottom: 8px; transform: rotate(90deg); }

        .closing-gate {
          width: 44px;
          height: 18px;
          background: #2d3752;
          border: 4px solid #7d95b1;
        }

        .closing-star {
          width: 4px;
          height: 4px;
          background: #dce9ff;
        }

        .closing-star--1 { top: 18px; left: 24px; }
        .closing-star--2 { right: 24px; bottom: 18px; }
      `}</style>

      <div className="max-w-[1320px] mx-auto px-6">
        <div className="mb-12 md:mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#FA4616]" />
              <div className="w-2 h-2 bg-[#044a94]" />
              <div className="w-2 h-2 bg-[#9B5DE5]" />
            </div>
            <span
              className="pixel-ribbon"
              style={{
                ['--ribbon-bg' as string]: '#ffe66e',
                ['--ribbon-text' as string]: '#8f1d00',
                ['--ribbon-border' as string]: '#171717',
                ['--ribbon-shadow' as string]: '#7a1a00',
                ['--ribbon-depth' as string]: 'rgba(250,70,22,0.18)',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '2px',
              }}
            >
              05 / 48-HOUR QUEST
            </span>
          </div>

          <h2
            className="text-white mb-4"
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(18px, 4vw, 40px)',
              lineHeight: 1.3,
            }}
          >
            LEVEL PROGRESSION
          </h2>
          <p
            className="text-[#9A9AA8] max-w-3xl"
            style={{ fontFamily: "'Space Mono', monospace", fontSize: '15px', lineHeight: 1.6 }}
          >
            Three sectors. One playable route through launch, volatility, and final boss approach. Hover each node like a collectible stage object.
          </p>
        </div>

        <div className="mb-10 flex flex-wrap justify-center gap-3 md:gap-4">
          {days.map((day, index) => (
            <button
              key={day.label}
              type="button"
              onClick={() => {
                setActiveDay(index);
                setActiveNode(null);
              }}
              className={`pixel-soft-pill relative transition-all ${
                activeDay === index
                  ? 'text-white'
                  : 'hover:brightness-110'
              }`}
              style={{
                ['--soft-bg' as string]: activeDay === index ? days[index].sectorColor : '#2b3356',
                ['--soft-text' as string]: activeDay === index ? '#f7fbff' : '#d4dcf7',
                ['--soft-border' as string]: activeDay === index ? '#171717' : '#1a2140',
                ['--soft-shadow' as string]: activeDay === index ? '#171717' : '#1a2140',
                ['--soft-depth' as string]: activeDay === index ? 'rgba(0,0,0,0.18)' : 'rgba(0,0,0,0.14)',
                boxShadow: activeDay === index ? `0 0 24px ${days[index].sectorGlow}` : undefined,
                padding: '0.9rem 1.4rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'center',
                gap: '4px',
                minWidth: '240px',
              }}
            >
              <div
                style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: '20px',
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                {day.label}
              </div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '11px',
                  letterSpacing: '1px',
                  lineHeight: 1,
                  opacity: 0.82,
                  whiteSpace: 'nowrap',
                }}
              >
                {day.date}
              </div>
            </button>
          ))}
        </div>

        <div className="mx-auto grid max-w-[980px] gap-8">
          {days
            .filter((_, index) => index === activeDay)
            .map((day, dayIndex) => (
              <div
                key={day.label}
                className="sector-panel relative overflow-hidden border border-[#253047] bg-[#121522]/92 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]"
                style={{
                  boxShadow: `0 0 50px ${day.sectorGlow}, inset 0 0 0 1px rgba(255,255,255,0.02)`,
                  animationDelay: `${dayIndex * 0.6}s`,
                }}
              >
              <div
                className="absolute inset-x-0 top-0 h-1"
                style={{ backgroundColor: day.sectorColor }}
              />
              <div
                className="absolute right-0 top-0 h-32 w-32 blur-3xl opacity-30"
                style={{ backgroundColor: day.sectorGlow }}
              />

              <div className="relative z-10 mb-6 border-b border-[#253047] pb-4">
                <p
                  style={{
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: '9px',
                    color: day.sectorColor,
                    letterSpacing: '1.4px',
                  }}
                >
                  {day.sector}
                </p>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <div>
                    <h3
                      className="text-white"
                      style={{
                        fontFamily: "'Rajdhani', sans-serif",
                        fontSize: '28px',
                        fontWeight: 700,
                      }}
                    >
                      {day.label}
                    </h3>
                    <p
                      className="text-[#9A9AA8]"
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '11px',
                        letterSpacing: '1px',
                      }}
                    >
                      {day.date}
                    </p>
                  </div>
                  <span
                    style={{
                      fontFamily: "'DS-Digital', 'Orbitron', sans-serif",
                      fontSize: '26px',
                      color: day.sectorColor,
                      letterSpacing: '2px',
                      textShadow: `0 0 14px ${day.sectorColor}50`,
                    }}
                  >
                    S{dayIndex + 1}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {day.events.map((event, index) => {
                  const badge = getBadge(event.type);
                  const nodeId = `${day.label}-${event.title}`;
                  const isActive = activeNode === nodeId;

                  return (
                    <button
                      key={nodeId}
                      type="button"
                      className="stage-node group relative flex w-full items-center gap-4 border border-[#253047] bg-[#0C1220]/92 px-4 py-4 text-left transition-all duration-300 hover:-translate-y-1 hover:border-[#44608c]"
                      onMouseEnter={() => setActiveNode(nodeId)}
                      onFocus={() => setActiveNode(nodeId)}
                      onMouseLeave={() => setActiveNode((value) => (value === nodeId ? null : value))}
                      onBlur={() => setActiveNode((value) => (value === nodeId ? null : value))}
                      onClick={() => setActiveNode(nodeId)}
                      style={{
                        boxShadow: isActive ? `0 0 26px ${day.sectorGlow}` : 'none',
                      }}
                    >
                      <div className="relative flex h-[110px] w-[110px] flex-shrink-0 items-center justify-center overflow-hidden border border-[#253047] bg-[#0A0F19]">
                        <StageSprite nodeType={event.nodeType} accentColor={day.sectorColor} />
                        <div
                          className="status-led absolute bottom-2 right-2 border px-2 py-1"
                          style={{
                            borderColor: `${day.sectorColor}55`,
                            background: '#05080f',
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "'DS-Digital', 'Orbitron', sans-serif",
                              fontSize: '18px',
                              color: day.sectorColor,
                              letterSpacing: '1px',
                              textShadow: `0 0 12px ${day.sectorColor}70`,
                            }}
                          >
                            {event.time}
                          </span>
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span
                            className="inline-flex border px-2 py-1"
                            style={{
                              borderColor: `${badge.color}66`,
                              color: badge.color,
                              background: `${badge.color}10`,
                              fontFamily: "'JetBrains Mono', monospace",
                              fontSize: '10px',
                              fontWeight: 700,
                              letterSpacing: '0.8px',
                            }}
                          >
                            {badge.label}
                          </span>
                        </div>

                        <h4
                          className="text-white"
                          style={{
                            fontFamily: "'Rajdhani', sans-serif",
                            fontSize: '23px',
                            fontWeight: 700,
                            lineHeight: 1.05,
                          }}
                        >
                          {event.title}
                        </h4>
                        <p
                          className="mt-2 text-[#9A9AA8]"
                          style={{
                            fontFamily: "'Space Mono', monospace",
                            fontSize: '13px',
                            lineHeight: 1.55,
                          }}
                        >
                          {event.subtitle}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}
