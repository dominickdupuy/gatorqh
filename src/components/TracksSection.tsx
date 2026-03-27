import { useEffect, useRef, useState } from "react";

export function TracksSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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

    const handleMouseMove = (e: MouseEvent) => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const tracks = [
    {
      title: "Algorithmic Trading",
      description: "Design and implement high-frequency trading algorithms, backtesting frameworks, and execution strategies.",
      tech: ["Python", "C++", "ML/AI", "Time Series"],
      symbol: "∫dx"
    },
    {
      title: "Risk Analytics",
      description: "Build models for portfolio optimization, VaR calculation, stress testing, and market risk assessment.",
      tech: ["Statistics", "Monte Carlo", "Derivatives", "Python"],
      symbol: "σ²"
    },
    {
      title: "Market Prediction",
      description: "Create predictive models using machine learning, sentiment analysis, and alternative data sources.",
      tech: ["Neural Networks", "NLP", "Big Data", "TensorFlow"],
      symbol: "Σ(x)"
    },
    {
      title: "Blockchain Finance",
      description: "Develop DeFi protocols, trading bots for crypto markets, or blockchain-based financial instruments.",
      tech: ["Solidity", "Web3", "Smart Contracts", "DeFi"],
      symbol: "₿"
    }
  ];

  return (
    <section ref={sectionRef} className="relative py-20 bg-gradient-to-b from-black via-[#001f3f]/30 to-black overflow-hidden">
      {/* Animated grid background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 animate-grid-flow" style={{
          backgroundImage: `
            linear-gradient(90deg, rgba(0,188,212,0.05) 1px, transparent 1px),
            linear-gradient(0deg, rgba(0,188,212,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Mouse follower glow */}
      <div 
        className="absolute w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none transition-all duration-300"
        style={{
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
        }}
      />

      {/* Floating math symbols */}
      <div className="absolute inset-0 overflow-hidden">
        {["+", "×", "÷", "=", "∞", "π", "√", "∑"].map((symbol, i) => (
          <div
            key={i}
            className="absolute text-cyan-400/10 text-6xl font-bold animate-float-slow"
            style={{
              left: `${10 + (i * 12)}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${8 + (i % 3) * 2}s`
            }}
          >
            {symbol}
          </div>
        ))}
      </div>

      {/* Glowing lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-pulse" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-pulse" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-block mb-4">
            <span className="text-cyan-400 font-mono text-sm tracking-widest animate-pulse">COMPETITION TRACKS</span>
          </div>
          <h2 className="text-4xl md:text-5xl text-white mb-6 font-bold">
            Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 animate-gradient">Challenge</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Pick a track that matches your interests and compete for specialized prizes in each category.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {tracks.map((track, index) => (
            <div
              key={index}
              className={`group relative p-8 bg-black/50 backdrop-blur-sm border border-cyan-400/30 hover:border-cyan-400 transition-all duration-500 overflow-hidden transform hover:scale-[1.02] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              {/* Animated gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/0 via-cyan-400/0 to-blue-500/0 group-hover:from-cyan-400/10 group-hover:via-blue-500/5 group-hover:to-cyan-400/10 transition-all duration-500" />
              
              {/* Scanning line effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-scan" />
              </div>
              
              {/* Corner decorations */}
              <div className="absolute top-0 left-0 w-2 h-2 bg-cyan-400 animate-pulse" />
              <div className="absolute top-0 right-0 w-2 h-2 bg-cyan-400 opacity-50 animate-pulse" style={{ animationDelay: '0.5s' }} />
              <div className="absolute bottom-0 left-0 w-2 h-2 bg-cyan-400 opacity-50 animate-pulse" style={{ animationDelay: '1s' }} />
              <div className="absolute bottom-0 right-0 w-2 h-2 bg-cyan-400 animate-pulse" style={{ animationDelay: '1.5s' }} />

              {/* Particle effect on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-particle"
                    style={{
                      left: `${20 + i * 20}%`,
                      animationDelay: `${i * 0.2}s`
                    }}
                  />
                ))}
              </div>

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-2xl text-white font-bold group-hover:text-cyan-400 transition-colors duration-300">
                      {track.title}
                    </h3>
                  </div>
                  <div className="w-16 h-16 border border-cyan-400/30 flex items-center justify-center font-mono text-cyan-400 text-2xl group-hover:border-cyan-400 group-hover:bg-cyan-400/10 group-hover:scale-110 group-hover:animate-spin-360 transition-all duration-500">
                    {track.symbol}
                  </div>
                </div>
                
                <p className="text-gray-400 mb-6 leading-relaxed">
                  {track.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {track.tech.map((tech, techIndex) => (
                    <span
                      key={techIndex}
                      className="px-3 py-1 text-xs font-mono bg-cyan-400/10 text-cyan-400 border border-cyan-400/30 group-hover:bg-cyan-400/20 group-hover:border-cyan-400/50 group-hover:scale-105 transition-all duration-300"
                      style={{ transitionDelay: `${techIndex * 50}ms` }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Hover effect line */}
              <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:w-full transition-all duration-700" />
            </div>
          ))}
        </div>

        {/* Prize pool callout */}
        <div className={`mt-12 text-center p-8 bg-gradient-to-r from-transparent via-cyan-400/5 to-transparent border-y border-cyan-400/20 relative overflow-hidden transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '600ms' }}>
          <div className="absolute inset-0 animate-shimmer-slow">
            <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent" />
          </div>
          <p className="text-cyan-400 font-mono text-lg mb-2 animate-pulse">TOTAL PRIZE POOL</p>
          <p className="text-5xl md:text-6xl font-bold text-white font-mono animate-number-glow">$50,000</p>
          <p className="text-gray-400 mt-2">Distributed across all tracks and special categories</p>
        </div>
      </div>

      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.1; }
          50% { transform: translateY(-30px) rotate(5deg); opacity: 0.2; }
        }
        @keyframes grid-flow {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        @keyframes scan {
          0% { top: 0%; }
          100% { top: 100%; }
        }
        @keyframes particle {
          0% { transform: translateY(0) scale(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(-100px) scale(1); opacity: 0; }
        }
        @keyframes shimmer-slow {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes number-glow {
          0%, 100% { text-shadow: 0 0 10px rgba(0,188,212,0.5); }
          50% { text-shadow: 0 0 20px rgba(0,188,212,0.8), 0 0 30px rgba(0,188,212,0.5); }
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes spin-360 {
          0% { transform: scale(1.1) rotate(0deg); }
          100% { transform: scale(1.1) rotate(360deg); }
        }
        .animate-float-slow {
          animation: float-slow linear infinite;
        }
        .animate-grid-flow {
          animation: grid-flow 20s linear infinite;
        }
        .animate-scan {
          animation: scan 3s ease-in-out infinite;
        }
        .animate-particle {
          animation: particle 2s ease-out infinite;
        }
        .animate-shimmer-slow {
          animation: shimmer-slow 5s ease-in-out infinite;
        }
        .animate-number-glow {
          animation: number-glow 2s ease-in-out infinite;
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        .animate-spin-360 {
          animation: spin-360 0.6s ease-in-out;
        }
      `}</style>
    </section>
  );
}