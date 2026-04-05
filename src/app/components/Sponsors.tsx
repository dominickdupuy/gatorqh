import { ShatterButton } from '@/components/ui/shatter-button';

export function Sponsors() {
  const sponsors = [
    'Placeholder A',
    'Placeholder B',
    'Placeholder C',
    'Placeholder D',
    'Placeholder E',
    'Placeholder F',
    'Placeholder G',
    'Placeholder H',
    'Placeholder I',
    'Placeholder J',
    'Placeholder K',
    'Placeholder L',
  ];

  return (
    <section id="sponsors" className="bg-[#0D0D1A] py-16 md:py-24">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-12 md:mb-16">
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
              // POWERED_BY
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
            // 12 PLACEHOLDERS CONFIRMED
          </p>
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
          {sponsors.map((sponsor) => (
            <div
              key={sponsor}
              className="group relative flex flex-col items-center justify-center gap-2 border border-[#1a1a2e] bg-[#0D0D1A] transition-all duration-200 cursor-pointer hover:bg-[#111128] hover:border-[#FA4616] hover:z-[2] hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(250,70,22,0.2)]"
              style={{ aspectRatio: '16 / 9' }}
            >
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
                {sponsor}
              </div>
            </div>
          ))}
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
            // INTERESTED IN JOINING THE ROSTER?
          </p>
          <div className="flex justify-center">
            <ShatterButton
              onClick={() => {
                window.location.href = 'mailto:team@gatorquant.com?subject=Power%20Sponsor%20Inquiry';
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
