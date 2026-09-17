import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import wallieImage from './WALLIE.jpg';

type AppPage = 'home' | 'apply';

type NavigationProps = {
  page?: AppPage;
  onNavigate?: (page: AppPage) => void;
};

export function Navigation({ page = 'home', onNavigate }: NavigationProps = {}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const run = () => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        setMobileMenuOpen(false);
      }
    };

    if (page === 'apply' && onNavigate) {
      onNavigate('home');
      window.setTimeout(run, 80);
      return;
    }
    run();
  };

  const goHome = () => {
    onNavigate?.('home');
    window.setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 80);
  };

  const launchFaqTerminal = () => {
    window.dispatchEvent(new CustomEvent('faq-terminal-launch'));
    window.setTimeout(() => {
      scrollToSection('faq');
    }, 300);
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

      `}</style>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#044a94]/60 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#FA4616]/50 to-transparent" />

      <div className="mx-auto flex max-w-[1260px] items-center justify-between px-6 py-4 md:pr-[130px]">
        <button
          type="button"
          onClick={goHome}
          className="flex items-center gap-4 border border-[#253047] bg-[#0B0D14]/95 px-3 py-2 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)] text-left"
        >
          <div className="flex h-[4.25rem] w-[4.25rem] items-center justify-center overflow-hidden bg-white border-2 border-[#044a94] shadow-[0_0_18px_rgba(4,74,148,0.18)]">
            <img
              src={wallieImage}
              alt="Wallie"
              className="h-full w-full scale-110 object-cover object-[40%_center]"
            />
          </div>
          <div className="hidden md:block">
            <div
              className="text-white"
              style={{ fontFamily: "'Space Mono', monospace", fontSize: '22px', fontWeight: 700, lineHeight: 1.1 }}
            >
              GQH
            </div>
            <div
              className="text-[#9A9AA8]"
              style={{ fontFamily: "'Space Mono', monospace", fontSize: '15px', letterSpacing: '1px', lineHeight: 1.1 }}
            >
              SYSTEMS NOMINAL
            </div>
          </div>
        </button>

        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => scrollToSection('about')}
            className="nav-link text-[#F4F4F4] hover:text-[#044a94] transition-colors"
            style={{ fontFamily: "'Space Mono', monospace", fontSize: '15px', fontWeight: 700, letterSpacing: '1px' }}
          >
            About
          </button>
          <button
            onClick={() => scrollToSection('game-modes')}
            className="nav-link text-[#F4F4F4] hover:text-[#044a94] transition-colors"
            style={{ fontFamily: "'Space Mono', monospace", fontSize: '15px', fontWeight: 700, letterSpacing: '1px' }}
          >
            Tracks
          </button>
          <button
            onClick={() => scrollToSection('schedule')}
            className="nav-link text-[#F4F4F4] hover:text-[#044a94] transition-colors"
            style={{ fontFamily: "'Space Mono', monospace", fontSize: '15px', fontWeight: 700, letterSpacing: '1px' }}
          >
            Schedule
          </button>
          <button
            onClick={() => scrollToSection('sponsors')}
            className="nav-link text-[#F4F4F4] hover:text-[#044a94] transition-colors"
            style={{ fontFamily: "'Space Mono', monospace", fontSize: '15px', fontWeight: 700, letterSpacing: '1px' }}
          >
            Sponsors
          </button>
          <button
            onClick={launchFaqTerminal}
            className="nav-link text-[#F4F4F4] hover:text-[#044a94] transition-colors"
            style={{ fontFamily: "'Space Mono', monospace", fontSize: '15px', fontWeight: 700, letterSpacing: '1px' }}
          >
            FAQ
          </button>
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('apply')}
              className={`nav-link transition-colors ${
                page === 'apply' ? 'text-[#FA4616]' : 'text-[#F4F4F4] hover:text-[#044a94]'
              }`}
              style={{ fontFamily: "'Space Mono', monospace", fontSize: '15px', fontWeight: 700, letterSpacing: '1px' }}
            >
              Apply
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => scrollToSection('register')}
          className="hidden md:inline-block bg-[#FA4616] hover:bg-[#FA4616]/90 text-white px-6 py-3 border-2 border-[#044a94] shadow-[0_0_20px_rgba(4,74,148,0.3)] transition-all"
          style={{ fontFamily: "'Space Mono', monospace", fontSize: '14px', fontWeight: 700, letterSpacing: '1px' }}
        >
          BOARD NOW -&gt;
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
              style={{ fontFamily: "'Space Mono', monospace", fontSize: '15px', fontWeight: 700, letterSpacing: '1px' }}
            >
              About
            </button>
            <button
              onClick={() => scrollToSection('game-modes')}
              className="nav-link text-[#F4F4F4] hover:text-[#044a94] text-left transition-colors"
              style={{ fontFamily: "'Space Mono', monospace", fontSize: '15px', fontWeight: 700, letterSpacing: '1px' }}
            >
              Tracks
            </button>
            <button
              onClick={() => scrollToSection('schedule')}
              className="nav-link text-[#F4F4F4] hover:text-[#044a94] text-left transition-colors"
              style={{ fontFamily: "'Space Mono', monospace", fontSize: '15px', fontWeight: 700, letterSpacing: '1px' }}
            >
              Schedule
            </button>
            <button
              onClick={() => scrollToSection('sponsors')}
              className="nav-link text-[#F4F4F4] hover:text-[#044a94] text-left transition-colors"
              style={{ fontFamily: "'Space Mono', monospace", fontSize: '15px', fontWeight: 700, letterSpacing: '1px' }}
            >
              Sponsors
            </button>
            <button
              onClick={launchFaqTerminal}
              className="nav-link text-[#F4F4F4] hover:text-[#044a94] text-left transition-colors"
              style={{ fontFamily: "'Space Mono', monospace", fontSize: '15px', fontWeight: 700, letterSpacing: '1px' }}
            >
              FAQ
            </button>
            {onNavigate && (
              <button
                type="button"
                onClick={() => {
                  onNavigate('apply');
                  setMobileMenuOpen(false);
                }}
                className={`nav-link text-left transition-colors ${
                  page === 'apply' ? 'text-[#FA4616]' : 'text-[#F4F4F4] hover:text-[#044a94]'
                }`}
                style={{ fontFamily: "'Space Mono', monospace", fontSize: '15px', fontWeight: 700, letterSpacing: '1px' }}
              >
                Apply
              </button>
            )}
            <button
              type="button"
              onClick={() => scrollToSection('register')}
              className="bg-[#FA4616] hover:bg-[#FA4616]/90 text-white px-6 py-3 border-2 border-[#044a94] shadow-[0_0_20px_rgba(4,74,148,0.3)] transition-all"
            >
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '15px', fontWeight: 600 }}>
                BOARD NOW -&gt;
              </span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}



