import { Button } from "./ui/button";
import { Calendar, MapPin } from "lucide-react";
import { useEffect, useRef } from "react";

export function HeroSection({ onNavigate }: { onNavigate?: (page: "home" | "register") => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Floating numbers and symbols
    const symbols = ["π", "Σ", "∫", "√", "∂", "∞", "α", "β", "γ", "λ", "$", "€", "¥", "₿"];
    const particles: Array<{
      x: number;
      y: number;
      symbol: string;
      speed: number;
      opacity: number;
      size: number;
    }> = [];

    // Create particles
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        speed: 0.2 + Math.random() * 0.5,
        opacity: 0.1 + Math.random() * 0.3,
        size: 16 + Math.random() * 12
      });
    }

    // Grid lines
    const drawGrid = () => {
      ctx.strokeStyle = "rgba(0, 188, 212, 0.1)";
      ctx.lineWidth = 1;

      // Vertical lines
      for (let x = 0; x < canvas.width; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = 0; y < canvas.height; y += 60) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    };

    // Animation loop
    const animate = () => {
      ctx.fillStyle = "#001f3f";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawGrid();

      // Draw and update particles
      particles.forEach((particle) => {
        ctx.fillStyle = `rgba(0, 188, 212, ${particle.opacity})`;
        ctx.font = `${particle.size}px monospace`;
        ctx.fillText(particle.symbol, particle.x, particle.y);

        particle.y -= particle.speed;

        // Reset particle when it goes off screen
        if (particle.y < -20) {
          particle.y = canvas.height + 20;
          particle.x = Math.random() * canvas.width;
        }
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleRegisterClick = () => {
    if (onNavigate) {
      onNavigate("register");
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Canvas Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#001f3f]/50 via-transparent to-black/80" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
      
      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="inline-block px-6 py-2 mb-8 bg-cyan-400/10 backdrop-blur-sm rounded-full border border-cyan-400/30 shadow-[0_0_20px_rgba(0,188,212,0.3)]">
          <span className="text-cyan-400 text-sm font-mono tracking-wider">REGISTRATION OPENS SOON</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl text-white mb-6 tracking-tight font-bold">
          GATOR QUANT
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 animate-pulse">
            HACKATHON
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto leading-relaxed">
          Build the future of quantitative finance.
        </p>
        <p className="text-lg md:text-xl text-cyan-400 mb-12 font-mono">
          48 hours of innovation, collaboration, and competition.
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-6 mb-14">
          <div className="flex items-center gap-3 text-white bg-white/5 backdrop-blur-sm px-5 py-3 rounded-full border border-white/10">
            <Calendar className="w-5 h-5 text-cyan-400" />
            <span className="font-mono">September 25-26th</span>
          </div>
          <a 
            href="https://www.google.com/maps/place/Reitz+Union/@29.6434215,-82.3491298,17z/data=!3m1!4b1!4m6!3m5!1s0x88e8a376866319c9:0x7b1a9b6c4f5c9b7!8m2!3d29.6434215!4d-82.3465549!16s%2Fg%2F1tdk5nc7"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-white bg-white/5 backdrop-blur-sm px-5 py-3 rounded-full border border-white/10 hover:border-cyan-400/50 hover:bg-white/10 transition-all"
          >
            <MapPin className="w-5 h-5 text-cyan-400" />
            <span className="font-mono">Reitz Union, Gainesville</span>
          </a>
        </div>
        
        <div className="flex flex-wrap gap-4 justify-center mb-20">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-cyan-400 to-blue-500 text-black hover:from-cyan-300 hover:to-blue-400 font-bold px-8 py-6 text-lg shadow-[0_0_30px_rgba(0,188,212,0.5)] hover:shadow-[0_0_40px_rgba(0,188,212,0.7)] transition-all"
            onClick={handleRegisterClick}
          >
            Register Now
          </Button>
          <Button 
            size="lg" 
            className="bg-transparent border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 font-bold px-8 py-6 text-lg backdrop-blur-sm transition-all"
          >
            Become a Sponsor
          </Button>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {[
            { number: "TBD", label: "Participants" },
            { number: "TBD", label: "In Prizes" },
            { number: "TBD", label: "Hours" },
            { number: "TBD", label: "Sponsors" }
          ].map((stat, index) => (
            <div 
              key={index} 
              className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:border-cyan-400/50 transition-all"
            >
              <div className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-2 font-mono">
                {stat.number}
              </div>
              <div className="text-gray-400 uppercase text-sm tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black via-black/50 to-transparent" />
    </section>
  );
}