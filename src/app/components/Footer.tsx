import { Linkedin, Instagram } from 'lucide-react';
import { FaDiscord } from 'react-icons/fa';

const footerLinks = [
  { label: 'Contact Us', href: 'mailto:dominickdupuy@ufl.edu' },
  { label: 'Sponsor Us', href: 'mailto:dominickdupuy@ufl.edu?subject=Power%20Sponsor%20Inquiry' },
  { label: 'Interest Form', href: '/interest-form' },
];

const socialLinks = [
  { Icon: FaDiscord, href: 'https://discord.gg/d9YTGA7DR', label: 'Discord', brand: true },
  { Icon: Instagram, href: 'https://www.instagram.com/uf_quanted/', label: 'Instagram' },
  { Icon: Linkedin, href: 'https://www.linkedin.com/company/gator-quant-hacks', label: 'LinkedIn' },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t-2 border-[#173154] bg-[#080d16]">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            'linear-gradient(120deg, rgba(156,201,255,0.08) 0 1px, transparent 1px), radial-gradient(circle at 50% 0%, rgba(4,74,148,0.2), transparent 34%), radial-gradient(circle at 86% 70%, rgba(250,70,22,0.08), transparent 22%)',
          backgroundSize: '18px 18px, auto, auto',
        }}
      />

      <div className="relative mx-auto grid max-w-[1440px] items-center gap-8 px-8 pb-8 pt-6 text-white md:grid-cols-[1fr_1.15fr_1fr] md:px-10 md:pb-9 md:pt-8">
        <div className="flex min-h-40 flex-col items-center justify-center gap-5 text-center md:items-start md:text-left">
          <h2
            className="uppercase"
            style={{
              fontFamily: 'var(--font-title)',
              fontSize: 'clamp(42px, 4.8vw, 72px)',
              lineHeight: 0.9,
              letterSpacing: '0.01em',
              textShadow: '0 4px 0 rgba(0,0,0,0.3)',
            }}
          >
            GQH 2026
          </h2>
          <div className="flex justify-center gap-5 md:justify-start">
            {socialLinks.map(({ Icon, href, label, brand }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel={href.startsWith('http') ? 'noreferrer' : undefined}
                aria-label={label}
                className="text-[#9cc9ff] transition-colors hover:text-[#FA4616]"
              >
                <Icon size={34} strokeWidth={brand ? undefined : 2.4} />
              </a>
            ))}
          </div>
        </div>

        <div className="flex min-h-40 flex-col items-center justify-center text-center">
          <div className="mb-5 flex h-28 w-28 items-center justify-center overflow-hidden border-2 border-[#0b1f3a] bg-white shadow-[0_0_0_2px_rgba(8,13,25,0.95),0_0_18px_rgba(99,246,255,0.18),0_0_34px_rgba(4,74,148,0.24)]">
            <img
              src="/quantGatorTransparent.png"
              alt="GQH logo"
              className="h-full w-full scale-110 object-cover object-[40%_center] drop-shadow-[0_0_8px_rgba(4,74,148,0.28)]"
            />
          </div>
          <p
            className="uppercase text-[#9A9AA8] md:whitespace-nowrap"
            style={{ fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 700, letterSpacing: '0.04em' }}
          >
            &copy; 2026 Gator Quant Hacks. All rights reserved.
          </p>
        </div>

        <div className="flex min-h-40 flex-col items-center justify-center gap-4 text-center md:items-end md:text-right">
          {footerLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[#9cc9ff] underline decoration-[#044a94] decoration-2 underline-offset-4 transition-colors hover:text-[#FA4616] hover:decoration-[#FA4616]"
              style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700 }}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
