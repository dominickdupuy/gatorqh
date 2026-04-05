import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import quantClubLogo from './GQHLogo.png';

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [coinCount, setCoinCount] = useState(0);
  const [coinFlash, setCoinFlash] = useState(false);

  useEffect(() => {
    if (!coinFlash) return;
    const timeout = window.setTimeout(() => setCoinFlash(false), 150);
    return () => window.clearTimeout(timeout);
  }, [coinFlash]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  const launchFaqTerminal = () => {
    window.dispatchEvent(new CustomEvent('faq-terminal-launch'));
    window.setTimeout(() => {
      scrollToSection('faq');
    }, 300);
  };

  const insertCoin = () => {
    const nextCount = Math.min(coinCount + 1, 3);
    setCoinCount(nextCount);
    setCoinFlash(true);

    if (nextCount >= 3) {
      scrollToSection('register');
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#050508]/95 shadow-lg' : 'bg-[#050508]/75 backdrop-blur-sm'
      }`}
    >
      <style>{`
        .nav-link {
          position: relative;
          transition: color 200ms ease;
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #FA4616, #044a94);
          box-shadow: 0 0 8px #044a94;
          transition: width 250ms cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .nav-link:hover::after {
          width: 100%;
        }

        .coin-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: #FA4616;
          opacity: 0;
          transition: opacity 150ms ease;
        }

        .coin-btn:hover::after {
          opacity: 0.1;
        }

        .coin-btn:hover {
          box-shadow:
            6px 6px 0px #7a1a00,
            0 0 20px rgba(250,70,22,0.3),
            inset 0 0 30px rgba(250,70,22,0.08);
          transform: translate(-1px, -1px);
        }

        .coin-btn:active {
          transform: translate(4px, 4px);
          box-shadow: 0px 0px 0px #7a1a00;
        }

        @keyframes coinflash {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 1; }
          100% { transform: scale(1); opacity: 0; }
        }

        @keyframes creditblink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

      `}</style>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#044a94]/60 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#FA4616]/50 to-transparent" />

      <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 border border-[#253047] bg-[#0B0D14]/95 px-3 py-2 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]">
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden bg-[#0B0D14] border-2 border-[#044a94] shadow-[0_0_18px_rgba(4,74,148,0.18)]">
            <img
              src={quantClubLogo}
              alt="Gator Quant Club logo"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="hidden md:block">
            <div
              className="text-white"
              style={{ fontFamily: "'Space Mono', monospace", fontSize: '18px', fontWeight: 700, lineHeight: 1.1 }}
            >
              GQH
            </div>
            <div
              className="text-[#9A9AA8]"
              style={{ fontFamily: "'Space Mono', monospace", fontSize: '13px', letterSpacing: '1px', lineHeight: 1.1 }}
            >
              PLAYER 1 READY
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => scrollToSection('about')}
            className="nav-link text-[#F4F4F4] hover:text-[#044a94] transition-colors"
            style={{ fontFamily: "'Space Mono', monospace", fontSize: '13px', fontWeight: 700, letterSpacing: '1px' }}
          >
            About
          </button>
          <button
            onClick={() => scrollToSection('game-modes')}
            className="nav-link text-[#F4F4F4] hover:text-[#044a94] transition-colors"
            style={{ fontFamily: "'Space Mono', monospace", fontSize: '13px', fontWeight: 700, letterSpacing: '1px' }}
          >
            Game Modes
          </button>
          <button
            onClick={() => scrollToSection('schedule')}
            className="nav-link text-[#F4F4F4] hover:text-[#044a94] transition-colors"
            style={{ fontFamily: "'Space Mono', monospace", fontSize: '13px', fontWeight: 700, letterSpacing: '1px' }}
          >
            Schedule
          </button>
          <button
            onClick={() => scrollToSection('sponsors')}
            className="nav-link text-[#F4F4F4] hover:text-[#044a94] transition-colors"
            style={{ fontFamily: "'Space Mono', monospace", fontSize: '13px', fontWeight: 700, letterSpacing: '1px' }}
          >
            Sponsors
          </button>
          <button
            onClick={launchFaqTerminal}
            className="nav-link text-[#F4F4F4] hover:text-[#044a94] transition-colors"
            style={{ fontFamily: "'Space Mono', monospace", fontSize: '13px', fontWeight: 700, letterSpacing: '1px' }}
          >
            FAQ
          </button>
        </div>

        <button
          onClick={insertCoin}
          className="coin-btn hidden md:block"
          style={{
            background: 'transparent',
            border: '1px solid rgba(250,70,22,0.4)',
            color: '#FA4616',
            padding: '10px 20px',
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '11px',
            letterSpacing: '2px',
            position: 'relative',
            cursor: 'pointer',
            boxShadow: '4px 4px 0px #7a1a00, -1px -1px 0px rgba(250,70,22,0.2)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-2px',
              left: '-2px',
              width: '10px',
              height: '10px',
              borderTop: '3px solid #FA4616',
              borderLeft: '3px solid #FA4616',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              width: '10px',
              height: '10px',
              borderTop: '3px solid #FA4616',
              borderRight: '3px solid #FA4616',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-2px',
              left: '-2px',
              width: '10px',
              height: '10px',
              borderBottom: '3px solid #FA4616',
              borderLeft: '3px solid #FA4616',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-2px',
              right: '-2px',
              width: '10px',
              height: '10px',
              borderBottom: '3px solid #FA4616',
              borderRight: '3px solid #FA4616',
            }}
          />
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '6px',
              minWidth: '180px',
            }}
          >
            <span
              style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: '11px',
                color: '#FA4616',
              }}
            >
              {`CREDITS: ${coinCount}`}
            </span>
            <span
              style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: '11px',
                color: coinCount >= 3 ? '#4cff87' : '#FA4616',
                animation: coinCount === 0 ? 'creditblink 1s infinite' : 'none',
              }}
            >
              {coinCount >= 3 ? 'PLAYER 1 READY' : 'INSERT COIN_'}
            </span>
            {coinFlash && (
              <span
                style={{
                  position: 'absolute',
                  right: '-4px',
                  top: '0',
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: '11px',
                  color: '#FA4616',
                  animation: 'coinflash 150ms ease-out',
                }}
              >
                +1
              </span>
            )}
          </div>
        </button>

        <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0A0A0A] border-t border-[#2A2A3E]">
          <div className="flex flex-col px-6 py-4 gap-4">
            <button
              onClick={() => scrollToSection('about')}
              className="nav-link text-[#F4F4F4] hover:text-[#044a94] text-left transition-colors"
              style={{ fontFamily: "'Space Mono', monospace", fontSize: '13px', fontWeight: 700, letterSpacing: '1px' }}
            >
              About
            </button>
            <button
              onClick={() => scrollToSection('game-modes')}
              className="nav-link text-[#F4F4F4] hover:text-[#044a94] text-left transition-colors"
              style={{ fontFamily: "'Space Mono', monospace", fontSize: '13px', fontWeight: 700, letterSpacing: '1px' }}
            >
              Game Modes
            </button>
            <button
              onClick={() => scrollToSection('schedule')}
              className="nav-link text-[#F4F4F4] hover:text-[#044a94] text-left transition-colors"
              style={{ fontFamily: "'Space Mono', monospace", fontSize: '13px', fontWeight: 700, letterSpacing: '1px' }}
            >
              Schedule
            </button>
            <button
              onClick={() => scrollToSection('sponsors')}
              className="nav-link text-[#F4F4F4] hover:text-[#044a94] text-left transition-colors"
              style={{ fontFamily: "'Space Mono', monospace", fontSize: '13px', fontWeight: 700, letterSpacing: '1px' }}
            >
              Sponsors
            </button>
            <button
              onClick={launchFaqTerminal}
              className="nav-link text-[#F4F4F4] hover:text-[#044a94] text-left transition-colors"
              style={{ fontFamily: "'Space Mono', monospace", fontSize: '13px', fontWeight: 700, letterSpacing: '1px' }}
            >
              FAQ
            </button>
            <button className="bg-[#FA4616] hover:bg-[#FA4616]/90 text-white px-6 py-3 border-2 border-[#044a94] shadow-[0_0_20px_rgba(4,74,148,0.3)] transition-all">
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '14px', fontWeight: 600 }}>
                INSERT COIN -&gt;
              </span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}



