export function About() {
  return (
    <section id="about" className="about-crt relative bg-[#0F0F1F] py-16 md:py-24 overflow-hidden">
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
        <div className="mb-12 md:mb-16">
          <span
            className="pixel-ribbon"
            style={{
              ['--ribbon-bg' as string]: '#ffe66e',
              ['--ribbon-text' as string]: '#8f1d00',
              ['--ribbon-border' as string]: '#111',
              ['--ribbon-shadow' as string]: '#7a1a00',
              ['--ribbon-depth' as string]: 'rgba(250,70,22,0.18)',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '13px',
              fontWeight: 600,
              letterSpacing: '1.5px',
            }}
          >
            03 / WHAT IS THE GQH ARCADE ARENA?
          </span>
        </div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-[60%_40%] gap-8 md:gap-12 mb-12 md:mb-16">
          {/* Left: Content 60% */}
          <div>
            <div
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '13px',
                color: '#00FFB3',
                fontStyle: 'italic',
                marginBottom: '24px',
                letterSpacing: '1px',
                overflow: 'hidden',
                whiteSpace: 'pre-line',
                width: '100%',
                animation: 'typewriter 3s steps(24, end)',
              }}
            >
              {"// INCOMING TRANSMISSION...\nThe market is open. Volatility is spiking.\n48 hours remain on the clock.\nYour models are the only thing standing between\norder and chaos.\nINSERT COIN TO CONTINUE..."}
            </div>

            {/* Heading */}
            <h2
              className="text-white mb-6"
              style={{
                fontFamily: "'Rajdhani', sans-serif",
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
              Gator Quant Hackathon is a 48-hour competitive event where students and professionals 
              build algorithmic trading systems, risk analytics platforms, and predictive market models.
            </p>

            {/* Paragraph 2 */}
            <p
              className="text-[#B0B0C0] mb-0 leading-relaxed"
              style={{ fontFamily: "'Space Mono', monospace", fontSize: '18px', lineHeight: 1.7 }}
            >
              Compete across four challenging tracks, collaborate with brilliant minds, and showcase 
              your skills to top quantitative firms and fintech companies.
            </p>
          </div>

          {/* Right: Placeholder Box 40% - Hidden on mobile */}
          <div className="hidden md:flex items-start justify-center">
            <div className="relative w-full max-w-[320px] aspect-square">
              {/* Dark placeholder box */}
              <div className="absolute inset-0 bg-[#0A0A0A]/60 backdrop-blur-sm border-2 border-[#1A1A2E]" />
              
              {/* Cyan corner brackets */}
              <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-[#044a94]" />
              <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-[#044a94]" />
              <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-[#044a94]" />
              <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-[#044a94]" />
              
              {/* Optional subtle inner glow */}
              <div 
                className="absolute inset-0 opacity-20"
                style={{
                  background: 'radial-gradient(circle at center, #044a9420, transparent 70%)',
                }}
              />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
