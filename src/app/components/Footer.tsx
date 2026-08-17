import { Linkedin, Instagram } from 'lucide-react';

// Keep in sync with DISCORD_INVITE_URL in ApplicationForm.tsx and Code.gs.
const DISCORD_INVITE_URL = 'https://discord.gg/PhEnUQXCp';

// lucide-react dropped brand icons, so the Discord mark is inlined.
function DiscordIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
    </svg>
  );
}

const footerLinks = [
  { label: 'Contact Us', href: 'mailto:dominickdupuy@ufl.edu' },
  { label: 'Sponsor Us', href: 'mailto:dominickdupuy@ufl.edu?subject=Power%20Sponsor%20Inquiry' },
  { label: 'Join the Discord', href: DISCORD_INVITE_URL },
  { label: 'Apply', href: '/apply' },
];

const socialLinks = [
  { Icon: Instagram, href: 'https://www.instagram.com/gqh_2026/', label: 'Instagram' },
  { Icon: Linkedin, href: 'https://www.linkedin.com/company/gator-quant-hacks', label: 'LinkedIn' },
  { Icon: DiscordIcon, href: DISCORD_INVITE_URL, label: 'Discord', brand: true },
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
