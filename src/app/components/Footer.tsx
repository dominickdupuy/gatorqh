import { Github, Twitter, Linkedin, Mail, MapPin } from 'lucide-react';
import quantClubLogo from './GQHLogo.JPG';

export function Footer() {
  return (
    <footer className="bg-[#1A1A2E] border-t-2 border-[#2A2A3E]">
      <div className="mx-auto max-w-[1200px] px-6 py-10 md:py-12">
        <div className="mb-8 grid gap-8 md:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden border-2 border-[#044a94] bg-[#0B0D14]">
                <img
                  src={quantClubLogo}
                  alt="Gator Quant Club logo"
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="text-white" style={{ fontFamily: "'Space Mono', monospace", fontSize: '14px' }}>
                QuantED
              </span>
            </div>
            <p
              className="mb-4 text-[#9A9A9A]"
              style={{ fontFamily: "'Space Mono', monospace", fontSize: '13px', lineHeight: 1.6 }}
            >
              Building the future of quantitative finance, one hackathon at a time.
            </p>
          </div>

          <div>
            <h3
              className="mb-4 text-white"
              style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '16px', fontWeight: 700 }}
            >
              Quick Links
            </h3>
            <ul className="space-y-2">
              {['About', 'Game Modes', 'Schedule', 'Sponsors', 'FAQ'].map((link) => (
                <li key={link}>
                  <a
                    href={`#${link.toLowerCase().replace(' ', '-')}`}
                    className="text-[#9A9A9A] transition-colors hover:text-[#044a94]"
                    style={{ fontFamily: "'Space Mono', monospace", fontSize: '13px' }}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3
              className="mb-4 text-white"
              style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '16px', fontWeight: 700 }}
            >
              Contact
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 shrink-0 text-[#044a94]" size={16} />
                <a
                  href="mailto:team@gatorquant.com"
                  className="text-[#9A9A9A] transition-colors hover:text-[#044a94]"
                  style={{ fontFamily: "'Space Mono', monospace", fontSize: '13px' }}
                >
                  team@gatorquant.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 shrink-0 text-[#044a94]" size={16} />
                <span
                  className="text-[#9A9A9A]"
                  style={{ fontFamily: "'Space Mono', monospace", fontSize: '13px' }}
                >
                  Reitz Union
                  <br />
                  Gainesville, FL
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h3
              className="mb-4 text-white"
              style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '16px', fontWeight: 700 }}
            >
              Follow Us
            </h3>
            <div className="flex gap-3">
              {[
                { Icon: Twitter, href: '#' },
                { Icon: Linkedin, href: '#' },
                { Icon: Github, href: '#' },
              ].map(({ Icon, href }, index) => (
                <a
                  key={index}
                  href={href}
                  className="flex h-10 w-10 items-center justify-center border-2 border-[#2A2A3E] text-[#9A9A9A] transition-all hover:border-[#044a94] hover:text-[#044a94] hover:shadow-[0_0_20px_rgba(4,74,148,0.3)]"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t-2 border-[#2A2A3E] pt-6 md:pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p
              className="text-center text-[#9A9A9A] md:text-left"
              style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px' }}
            >
              © 2026 Gator Quant Hackathon. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              <a
                href="#"
                className="text-[#9A9A9A] transition-colors hover:text-[#044a94]"
                style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px' }}
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-[#9A9A9A] transition-colors hover:text-[#044a94]"
                style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px' }}
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-[#9A9A9A] transition-colors hover:text-[#044a94]"
                style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px' }}
              >
                Code of Conduct
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
