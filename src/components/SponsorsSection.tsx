import { useEffect, useRef, useState } from "react";

export function SponsorsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative py-24 bg-black overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-5 animate-grid-pulse" style={{
          backgroundImage: `
            repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(0,188,212,0.5) 50px, rgba(0,188,212,0.5) 51px),
            repeating-linear-gradient(0deg, transparent, transparent 50px, rgba(0,188,212,0.5) 50px, rgba(0,188,212,0.5) 51px)
          `,
        }} />
      </div>

      {/* Floating hexagons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute border border-cyan-400/10 animate-float-hex"
            style={{
              width: '80px',
              height: '80px',
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 2) * 40}%`,
              animationDelay: `${i * 1.2}s`,
              animationDuration: `${10 + (i % 3) * 3}s`,
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
            }}
          />
        ))}
      </div>

      {/* Accent lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-pulse" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-block mb-4">
            <span className="text-cyan-400 font-mono text-sm tracking-widest animate-pulse">SPONSORS</span>
          </div>
          <h2 className="text-4xl md:text-5xl text-white mb-6 font-bold">
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 animate-gradient">Partners</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto mb-8">
            Made possible by the support of leading companies in finance and technology.
          </p>
        </div>
        
        {/* Platinum Sponsors */}
        <div className={`mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '200ms' }}>
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-cyan-400/30" />
            <h3 className="text-center text-cyan-400 uppercase tracking-widest text-sm font-mono">Platinum Tier</h3>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-cyan-400/30" />
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className="group h-40 bg-gradient-to-br from-[#001f3f] to-black border border-cyan-400/30 hover:border-cyan-400 transition-all duration-500 flex items-center justify-center relative overflow-hidden transform hover:scale-105 hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* Scanning line */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100">
                  <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-scan-vertical" />
                </div>
                
                <span className="text-gray-600 text-sm font-mono relative z-10 group-hover:text-gray-500 transition-colors">Sponsor Logo</span>
                
                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400 animate-corner-pulse" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400 animate-corner-pulse" style={{ animationDelay: '0.5s' }} />
              </div>
            ))}
          </div>
        </div>
        
        {/* Gold Sponsors */}
        <div className={`mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '400ms' }}>
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-cyan-400/30" />
            <h3 className="text-center text-cyan-400 uppercase tracking-widest text-sm font-mono">Gold Tier</h3>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-cyan-400/30" />
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i} 
                className="group h-32 bg-gradient-to-br from-[#001f3f] to-black border border-cyan-400/20 hover:border-cyan-400/60 transition-all duration-300 flex items-center justify-center relative overflow-hidden hover:scale-105"
              >
                <div className="absolute inset-0 bg-cyan-400/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* Particle burst */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100">
                  {[...Array(4)].map((_, j) => (
                    <div
                      key={j}
                      className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-particle-burst"
                      style={{
                        left: '50%',
                        top: '50%',
                        animationDelay: `${j * 0.1}s`
                      }}
                    />
                  ))}
                </div>
                
                <span className="text-gray-600 text-xs font-mono relative z-10">Sponsor Logo</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Silver Sponsors */}
        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '600ms' }}>
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-cyan-400/30" />
            <h3 className="text-center text-cyan-400 uppercase tracking-widest text-sm font-mono">Silver Tier</h3>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-cyan-400/30" />
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div 
                key={i} 
                className="group h-24 bg-[#001f3f]/50 border border-cyan-400/20 hover:border-cyan-400/40 transition-all duration-300 flex items-center justify-center relative hover:bg-[#001f3f]/70"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="text-gray-600 text-xs font-mono relative z-10">Logo</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className={`text-center mt-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '800ms' }}>
          <div className="p-8 bg-gradient-to-r from-[#001f3f]/50 via-cyan-400/5 to-[#001f3f]/50 border border-cyan-400/30 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 animate-wave">
              <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent" />
            </div>
            <p className="text-gray-400 mb-6 text-lg relative z-10">Interested in sponsoring Gator Quant Hackathon?</p>
            <a 
              href="#" 
              className="inline-block px-8 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold hover:from-cyan-300 hover:to-blue-400 transition-all shadow-[0_0_20px_rgba(0,188,212,0.3)] hover:shadow-[0_0_30px_rgba(0,188,212,0.5)] hover:scale-105 relative z-10"
            >
              View Sponsorship Deck
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes grid-pulse {
          0%, 100% { opacity: 0.05; }
          50% { opacity: 0.1; }
        }
        @keyframes float-hex {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.1; }
          50% { transform: translateY(-30px) rotate(180deg); opacity: 0.3; }
        }
        @keyframes scan-vertical {
          0% { top: 0%; }
          100% { top: 100%; }
        }
        @keyframes corner-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
        @keyframes particle-burst {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(var(--tx, 20px), var(--ty, -20px)) scale(0); opacity: 0; }
        }
        @keyframes wave {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-grid-pulse {
          animation: grid-pulse 3s ease-in-out infinite;
        }
        .animate-float-hex {
          animation: float-hex linear infinite;
        }
        .animate-scan-vertical {
          animation: scan-vertical 2s ease-in-out infinite;
        }
        .animate-corner-pulse {
          animation: corner-pulse 2s ease-in-out infinite;
        }
        .animate-particle-burst {
          animation: particle-burst 1s ease-out infinite;
          --tx: 30px;
          --ty: -30px;
        }
        .animate-particle-burst:nth-child(2) {
          --tx: -30px;
          --ty: -30px;
        }
        .animate-particle-burst:nth-child(3) {
          --tx: 30px;
          --ty: 30px;
        }
        .animate-particle-burst:nth-child(4) {
          --tx: -30px;
          --ty: 30px;
        }
        .animate-wave {
          animation: wave 5s ease-in-out infinite;
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </section>
  );
}