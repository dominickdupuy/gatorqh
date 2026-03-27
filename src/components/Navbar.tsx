import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import logo from "../assets/logo.png";

export function Navbar({ onNavigate }: { onNavigate?: (page: "home" | "register") => void }) {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "About", href: "#about" },
    { name: "Schedule", href: "#schedule" },
    { name: "Tracks", href: "#tracks" },
    { name: "FAQ", href: "#faq" },
    { name: "Sponsors", href: "#sponsors" }
  ];

  const handleLogoClick = () => {
    if (onNavigate) {
      onNavigate("home");
    }
  };

  const handleRegisterClick = () => {
    if (onNavigate) {
      onNavigate("register");
      setIsOpen(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-lg border-b border-cyan-400/20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={handleLogoClick} className="text-white text-xl font-bold font-mono hover:text-cyan-400 transition-colors flex items-center gap-2">
            <div className="w-2 h-2 bg-cyan-400 animate-pulse" />
            GATOR QUANT
          </button>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a 
                key={link.name}
                href={link.href}
                className="text-gray-300 hover:text-cyan-400 transition-colors text-sm font-mono tracking-wide"
              >
                {link.name}
              </a>
            ))}
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-cyan-400 to-blue-500 text-black hover:from-cyan-300 hover:to-blue-400 font-bold shadow-[0_0_15px_rgba(0,188,212,0.3)] hover:shadow-[0_0_20px_rgba(0,188,212,0.5)] transition-all" 
              onClick={handleRegisterClick}
            >
              Register
            </Button>
            {/* GQH Logo as home button */}
            <button 
              onClick={handleLogoClick} 
              className="hover:opacity-80 transition-all hover:scale-110 transform relative group"
            >
              <img 
                src={logo} 
                alt="GQH Logo" 
                className="h-14 w-auto drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] group-hover:drop-shadow-[0_0_20px_rgba(0,188,212,0.8)]" 
              />
            </button>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white hover:text-cyan-400 transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-cyan-400/20">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a 
                  key={link.name}
                  href={link.href}
                  className="text-gray-300 hover:text-cyan-400 transition-colors font-mono"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <Button 
                className="bg-gradient-to-r from-cyan-400 to-blue-500 text-black hover:from-cyan-300 hover:to-blue-400 font-bold w-full" 
                onClick={handleRegisterClick}
              >
                Register
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}