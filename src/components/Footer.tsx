import { Mail, Instagram, Linkedin, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-black to-[#001f3f] text-white py-12 overflow-hidden">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(0,188,212,0.5) 20px, rgba(0,188,212,0.5) 21px)`
        }} />
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-2xl mb-4 font-bold font-mono">GATOR QUANT</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              The premier quantitative finance hackathon for students and professionals.
            </p>
            <div className="mt-4 w-16 h-1 bg-gradient-to-r from-cyan-400 to-transparent" />
          </div>
          
          <div>
            <h4 className="mb-4 text-cyan-400 font-mono text-sm tracking-wider">QUICK LINKS</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#about" className="hover:text-cyan-400 transition-colors">About</a></li>
              <li><a href="#schedule" className="hover:text-cyan-400 transition-colors">Schedule</a></li>
              <li><a href="#faq" className="hover:text-cyan-400 transition-colors">FAQ</a></li>
              <li><a href="#sponsors" className="hover:text-cyan-400 transition-colors">Sponsors</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="mb-4 text-cyan-400 font-mono text-sm tracking-wider">RESOURCES</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Code of Conduct</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Rules</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Past Projects</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Media Kit</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="mb-4 text-cyan-400 font-mono text-sm tracking-wider">CONNECT</h4>
            <div className="flex gap-3">
              <a 
                href="#" 
                className="w-10 h-10 bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center hover:bg-cyan-400/20 hover:border-cyan-400 transition-all group"
              >
                <Mail className="w-5 h-5 text-cyan-400" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center hover:bg-cyan-400/20 hover:border-cyan-400 transition-all group"
              >
                <Instagram className="w-5 h-5 text-cyan-400" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center hover:bg-cyan-400/20 hover:border-cyan-400 transition-all group"
              >
                <Linkedin className="w-5 h-5 text-cyan-400" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center hover:bg-cyan-400/20 hover:border-cyan-400 transition-all group"
              >
                <Twitter className="w-5 h-5 text-cyan-400" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-cyan-400/20 text-center">
          <p className="text-sm text-gray-400 font-mono">
            &copy; 2026 Gator Quant Hackathon. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}