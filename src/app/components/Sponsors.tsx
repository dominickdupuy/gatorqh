import { ShatterButton } from '@/components/ui/shatter-button';
import algoGatorsLogo from '../../assets/AlgoGators.png';
import citadelLogo from '../../assets/Citadel.png';
import databentoLogo from '../../assets/Databento.png';
import elevenLabsLogo from '../../assets/ElevenLabs.jpg';
import janeStreetLogo from '../../assets/jane-street.png';
import massiveLogo from '../../assets/Massive.png';
import oldMissionLogo from '../../assets/OldMission.png';
import ufMathLogo from '../../assets/UFMath.png';
import webullLogo from '../../assets/Webull.png';

type Sponsor = {
  name: string;
  logo?: string;
  href?: string;
  invertLogo?: boolean;
  logoClassName?: string;
};

const leadSponsor: Sponsor = {
  name: 'Webull',
  logo: webullLogo,
  href: 'https://www.webull.com/',
};

export function Sponsors() {
  const sponsors: Sponsor[] = [
    {
      name: 'Jane Street',
      logo: janeStreetLogo,
      href: 'https://www.janestreet.com/',
      invertLogo: true,
      logoClassName: 'max-w-[94%] max-h-[84%] md:max-w-[88%] md:max-h-[78%]',
    },
    {
      name: 'Citadel',
      logo: citadelLogo,
      href: 'https://www.citadel.com/',
      logoClassName: 'max-w-[94%] max-h-[84%] md:max-w-[88%] md:max-h-[78%]',
    },
    {
      name: 'Old Mission',
      logo: oldMissionLogo,
      href: 'https://www.oldmissioncapital.com/',
    },
    {
      name: 'Databento',
      logo: databentoLogo,
      href: 'https://databento.com/',
      logoClassName: 'max-w-[94%] max-h-[84%] md:max-w-[88%] md:max-h-[78%]',
    },
    {
      name: 'Massive',
      logo: massiveLogo,
      href: 'https://massive.com/',
    },
    {
      name: 'Algo Gators',
      logo: algoGatorsLogo,
      href: 'https://algogators.com/',
      logoClassName: 'max-w-[80%] max-h-[70%] md:max-w-[70%] md:max-h-[62%]',
    },
    {
      name: 'UF Mathematics',
      logo: ufMathLogo,
      href: 'https://math.ufl.edu/',
      logoClassName: 'max-w-[96%] max-h-[96%] md:max-w-[85%] md:max-h-[85%]',
    },
    {
      name: 'ElevenLabs',
      logo: elevenLabsLogo,
      href: 'https://elevenlabs.io/',
      logoClassName:
        'max-w-[94%] max-h-[84%] md:max-w-[88%] md:max-h-[78%] mix-blend-screen',
    },
  ];

  return (
    <section id="sponsors" className="bg-[#0D0D1A] pb-16 pt-3 md:pb-24 md:pt-5">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="mb-9 text-center md:mb-12">
          <div className="mb-4">
            <span
              className="pixel-pill"
              style={{
                ['--pill-bg' as string]: '#ff4040',
                ['--pill-text' as string]: '#fff4bf',
                ['--pill-border' as string]: '#171717',
                ['--pill-shadow' as string]: '#5c1200',
                ['--pill-depth' as string]: 'rgba(90,0,0,0.18)',
                fontFamily: "'Space Mono', monospace",
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              POWERED BY
            </span>
          </div>
          <h2
            className="text-white mb-4 text-center"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 'clamp(10px, 2vw, 16px)',
              lineHeight: 1.7,
            }}
          >
            THESE COMPANIES BUILT THE TREASURE VAULT
          </h2>
          <p
            className="text-[#9A9AA8] text-center"
            style={{ fontFamily: "'Space Mono', monospace", fontSize: '12px' }}
          >
            9 SPONSORS CONFIRMED
          </p>
        </div>

        <div className="mb-6 md:mb-8">
          <div className="mb-3 text-center">
            <span
              className="pixel-pill"
              style={{
                ['--pill-bg' as string]: '#ffe66e',
                ['--pill-text' as string]: '#5c3a00',
                ['--pill-border' as string]: '#171717',
                ['--pill-shadow' as string]: '#7a5200',
                ['--pill-depth' as string]: 'rgba(122,82,0,0.18)',
                fontFamily: "'Space Mono', monospace",
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              LEAD SPONSOR
            </span>
          </div>
          <a
            href={leadSponsor.href}
            target="_blank"
            rel="noreferrer"
            aria-label={`Visit ${leadSponsor.name}`}
            className="group relative mx-auto flex max-w-[560px] flex-col items-center justify-center gap-2 border-2 border-[#ffe66e] bg-[#0D0D1A] p-6 transition-all duration-200 hover:bg-[#111128] hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(255,230,110,0.25)] md:p-10"
            style={{ aspectRatio: '16 / 7' }}
          >
            <img
              src={leadSponsor.logo}
              alt={`${leadSponsor.name} logo`}
              className="max-h-[70%] max-w-[80%] object-contain md:max-h-[75%] md:max-w-[85%]"
              style={{ imageRendering: 'auto' }}
            />
          </a>
        </div>

        <div
          className="w-full mb-[2px]"
          style={{
            height: '1px',
            background:
              'linear-gradient(90deg, transparent, #FA4616 20%, #00FFB3 50%, #003087 80%, transparent)',
          }}
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-[2px] w-full">
          {sponsors.map((sponsor) => {
            const content = (
              <>
                {sponsor.logo ? (
                  <img
                    src={sponsor.logo}
                    alt={`${sponsor.name} logo`}
                    className={`${
                      sponsor.logoClassName ?? 'max-w-[90%] max-h-[80%] md:max-w-[80%] md:max-h-[70%]'
                    } object-contain ${
                      sponsor.invertLogo ? 'invert' : ''
                    }`}
                    style={{ imageRendering: 'auto' }}
                  />
                ) : (
                  <>
                    <div
                      className="flex items-center justify-center border border-[#2a2a3e] bg-[#1a1a2e]"
                      style={{ width: '80px', height: '40px' }}
                    >
                      <span
                        style={{
                          fontFamily: "'Space Mono', monospace",
                          fontSize: '10px',
                          color: '#444',
                        }}
                      >
                        LOGO
                      </span>
                    </div>
                    <div
                      className="text-center"
                      style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '12px',
                        color: '#9A9AA8',
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {sponsor.name}
                    </div>
                  </>
                )}
              </>
            );
              const className =
              'group relative flex flex-col items-center justify-center gap-2 border border-[#1a1a2e] bg-[#0D0D1A] transition-all duration-200 cursor-pointer hover:bg-[#111128] hover:border-[#FA4616] hover:z-[2] hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(250,70,22,0.2)] p-3 md:p-6';

            return sponsor.href ? (
              <a
                key={sponsor.name}
                href={sponsor.href}
                target="_blank"
                rel="noreferrer"
                aria-label={`Visit ${sponsor.name}`}
                className={className}
                style={{ aspectRatio: '16 / 9' }}
              >
                {content}
              </a>
            ) : (
              <div key={sponsor.name} className={className} style={{ aspectRatio: '16 / 9' }}>
                {content}
              </div>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <p
            className="mb-2"
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '12px',
              color: '#9A9AA8',
              textAlign: 'center',
            }}
          >
            INTERESTED IN JOINING THE ROSTER?
          </p>
          <div className="flex justify-center">
            <ShatterButton
              onClick={() => {
                window.location.href = 'mailto:dominickdupuy@ufl.edu?subject=Power%20Sponsor%20Inquiry';
              }}
              shatterColor="#FA4616"
              className="pixel-arrow-cta inline-block border-0"
              style={{
                ['--arrow-bg-top' as string]: '#d63a32',
                ['--arrow-bg-bottom' as string]: '#a41f16',
                ['--arrow-text' as string]: '#fff4bf',
                ['--arrow-border' as string]: '#171717',
                ['--arrow-shadow' as string]: '#5c1200',
                ['--arrow-depth' as string]: 'rgba(92,18,0,0.28)',
              }}
            >
              <span
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '12px',
                  letterSpacing: '1px',
                }}
              >
                BECOME A POWER SPONSOR
              </span>
            </ShatterButton>
          </div>
        </div>
      </div>
    </section>
  );
}
