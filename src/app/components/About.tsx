export function About() {
  return (
    <section id="about" className="about-crt relative overflow-hidden bg-[#0F0F1F] pb-8 pt-8 md:pb-10 md:pt-12">
      <style>{`
        .about-crt::before {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.02;
          background-image: repeating-linear-gradient(
            0deg,
            rgba(255, 255, 255, 1) 0px,
            rgba(255, 255, 255, 1) 1px,
            transparent 1px,
            transparent 4px
          );
        }

        @keyframes typewriter {
          from {
            width: 0;
          }
          to {
            width: 100%;
          }
        }
      `}</style>

      <div className="relative z-20 max-w-[1200px] mx-auto px-6">
        {/* Section Label - Top Left */}
        <div className="mb-7 md:mb-9">
          <span
            className="pixel-ribbon"
            style={{
              ['--ribbon-bg' as string]: '#ffe66e',
              ['--ribbon-text' as string]: '#8f1d00',
              ['--ribbon-border' as string]: '#111',
              ['--ribbon-shadow' as string]: '#7a1a00',
              ['--ribbon-depth' as string]: 'rgba(250,70,22,0.18)',
              fontFamily: "'Space Mono', monospace",
              fontSize: 'clamp(11px, 1.3vw, 13px)',
              fontWeight: 600,
              letterSpacing: '1.35px',
              lineHeight: 1.2,
              padding: '0.72rem 1.55rem 0.76rem 2.55rem',
              textAlign: 'center',
            }}
          >
            WHAT IS THE GQH ARCADE ARENA?
          </span>
        </div>

        {/* Two Column Layout */}
        <div className="mb-4 md:mb-6">
          <div className="max-w-[960px]">
            <div
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '13px',
                color: '#00FFB3',
                fontStyle: 'italic',
                marginBottom: '18px',
                letterSpacing: '1px',
                overflow: 'hidden',
                whiteSpace: 'pre-line',
                width: '100%',
                animation: 'typewriter 3s steps(24, end)',
              }}
            >
              {"INCOMING TRANSMISSION...\nThe market is open. Volatility is spiking.\n36 hours remain on the clock.\nYour models are the only thing standing between\norder and chaos.\nINSERT COIN TO CONTINUE..."}
            </div>

            {/* Heading */}
            <h2
              className="text-white mb-6"
              style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: '36px',
                fontWeight: 700,
                lineHeight: 1.3,
              }}
            >
              The Quantitative Challenge
            </h2>

            {/* Paragraph 1 */}
            <p
              className="text-white mb-5 leading-relaxed"
              style={{ fontFamily: "'Space Mono', monospace", fontSize: '18px', lineHeight: 1.7 }}
            >
              Gator Quant Competition is a 36-hour competitive event where students and professionals
              build algorithmic trading systems, risk analytics platforms, and predictive market models.
            </p>

            {/* Paragraph 2 */}
            <p
              className="text-[#B0B0C0] mb-0 leading-relaxed"
              style={{ fontFamily: "'Space Mono', monospace", fontSize: '18px', lineHeight: 1.7 }}
            >
              Compete across three challenging tracks, collaborate with brilliant minds, and showcase 
              your skills to top quantitative firms and fintech companies.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
