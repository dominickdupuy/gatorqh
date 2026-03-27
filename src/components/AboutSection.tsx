import { useEffect, useRef, useState } from "react";

export function AboutSection() {
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
    <section ref={sectionRef} className="relative py-20 bg-black overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 animate-pulse" style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,188,212,0.5) 2px, rgba(0,188,212,0.5) 4px)`,
          backgroundSize: '100% 40px',
          animation: 'slide 20s linear infinite'
        }} />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
              opacity: 0.3 + Math.random() * 0.3
            }}
          />
        ))}
      </div>

      {/* Glowing accent lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50 animate-pulse" />
      
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-block mb-4">
            <span className="text-cyan-400 font-mono text-sm tracking-widest animate-pulse">ABOUT</span>
          </div>
          <h2 className="text-4xl md:text-5xl text-white mb-6 font-bold">
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 animate-gradient">Quantitative</span> Challenge
          </h2>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto leading-relaxed">
            Gator Quant Hackathon brings together the brightest minds in mathematics, computer science, and finance 
            for an intensive 48-hour competition. Build algorithms, analyze markets, and create the next 
            generation of financial technology.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Algorithm Design",
              description: "Develop cutting-edge trading algorithms and predictive models using machine learning and statistical analysis.",
              icon: "∫"
            },
            {
              title: "Market Analysis",
              description: "Dive deep into real market data, identifying patterns and opportunities using advanced quantitative techniques.",
              icon: "Σ"
            },
            {
              title: "Risk Management",
              description: "Build sophisticated risk assessment tools and portfolio optimization strategies for the modern market.",
              icon: "√"
            }
          ].map((item, index) => (
            <div 
              key={index} 
              className={`group relative p-8 bg-gradient-to-b from-[#001f3f] to-black border border-cyan-400/20 hover:border-cyan-400/50 transition-all duration-500 overflow-hidden transform hover:scale-105 hover:-translate-y-2 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              {/* Card glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-cyan-400/20 to-transparent blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              
              {/* Animated border */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-400 to-transparent animate-border-flow" />
              </div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 bg-cyan-400/10 border border-cyan-400/30 mb-6 flex items-center justify-center font-mono text-cyan-400 text-4xl font-bold group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
                  {item.icon}
                </div>
                <h3 className="text-xl text-white mb-4 font-bold group-hover:text-cyan-400 transition-colors">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Additional info section */}
        <div className={`mt-20 p-8 bg-gradient-to-r from-[#001f3f] via-black to-[#001f3f] border border-cyan-400/20 relative overflow-hidden transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '600ms' }}>
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(0,188,212,0.1)_50%,transparent_100%)] animate-shimmer" />
          <div className="relative z-10 text-center">
            <h3 className="text-2xl text-white mb-4 font-bold">Open to All Skill Levels</h3>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto">
              Whether you're a seasoned quant developer or exploring quantitative finance for the first time, 
              Gator Quant Hackathon provides workshops, mentorship, and resources to help you succeed. Join us for an 
              unforgettable weekend of learning and innovation.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        @keyframes slide {
          0% { transform: translateY(0); }
          100% { transform: translateY(40px); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes border-flow {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-float {
          animation: float linear infinite;
        }
        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }
        .animate-border-flow {
          animation: border-flow 2s linear infinite;
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </section>
  );
}