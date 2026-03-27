export function StatsBar() {
  const stats = [
    { label: 'Registered Players', value: '256+', color: '#044a94' },
    { label: 'Treasure Vault', value: '$50,000', color: '#FA4616' },
    { label: 'Duration', value: '48 Hours', color: '#9B5DE5' },
    { label: 'Power Sponsors', value: '12+', color: '#044a94' },
  ];

  return (
    <div className="relative bg-[#0C0E17] border-y-2 border-[#2A2A3E] overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      <div className="max-w-[1200px] mx-auto px-6 py-6">
        <div className="mb-4 text-center">
          <span
            className="pixel-frame-tag"
            style={{
              ['--frame-bg' as string]: '#5d8fd8',
              ['--frame-text' as string]: '#eef4ff',
              ['--frame-border' as string]: '#171717',
              ['--frame-shadow' as string]: '#182952',
              ['--frame-depth' as string]: 'rgba(18,49,124,0.24)',
              ['--frame-node' as string]: '#4646b8',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '2px',
            }}
          >
            ARCADE STATUS BOARD
          </span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="text-center border border-[#253047] bg-[#121522] px-4 py-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]">
              <div
                className="mb-2"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 'clamp(24px, 3vw, 36px)',
                  fontWeight: 700,
                  color: stat.color,
                  textShadow: `0 0 10px ${stat.color}40`,
                }}
              >
                {stat.value}
              </div>
              <div
                className="text-[#9A9A9A]"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '1px',
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
