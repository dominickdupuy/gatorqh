import { Reveal } from './Reveal';
import dominickPhoto from '../../assets/team/dominick-dupuy.jpg';
import annaClairePhoto from '../../assets/team/anna-claire-skipper.jpg';
import alicePhoto from '../../assets/team/alice-krupitsky.jpg';
import kenziePhoto from '../../assets/team/kenzie-kemerson.jpg';
import xanderPhoto from '../../assets/team/xander-robbins.jpg';
import jaiPhoto from '../../assets/team/jai-patel.jpg';
import christophePhoto from '../../assets/team/christophe-muracciole.jpg';
import baderPhoto from '../../assets/team/bader-al-saloum.jpg';

type TeamMember = {
  name: string;
  role: string;
  photo: string;
  linkedin?: string;
  objectPosition?: string;
};

const team: TeamMember[] = [
  {
    name: 'Dominick Dupuy',
    role: 'Co-Founder',
    photo: dominickPhoto,
    linkedin: 'https://www.linkedin.com/in/dominick-dupuy/',
  },
  {
    name: 'Anna Claire Skipper',
    role: 'Co-Founder',
    photo: annaClairePhoto,
    linkedin: 'https://www.linkedin.com/in/anna-claire-skipper/',
  },
  {
    name: 'Xander Robbins',
    role: 'Vice President',
    photo: xanderPhoto,
    linkedin: 'https://www.linkedin.com/in/xander-robbins/',
  },
  {
    name: 'Alice Krupitsky',
    role: 'Head of Marketing',
    photo: alicePhoto,
    linkedin: 'https://www.linkedin.com/in/alicekrupitsky/',
  },
  {
    name: 'Kenzie Kemerson',
    role: 'Digital Designer & Photographer',
    photo: kenziePhoto,
    linkedin: 'https://www.linkedin.com/in/kenzie-kemerson-b2529731b/',
    objectPosition: 'center 15%',
  },
];

const volunteers: TeamMember[] = [
  {
    name: 'Jai Patel',
    role: 'Volunteer',
    photo: jaiPhoto,
    linkedin: 'https://www.linkedin.com/in/jai-patel-jp/',
  },
  {
    name: 'Christophe Muracciole',
    role: 'Volunteer',
    photo: christophePhoto,
    linkedin: 'https://www.linkedin.com/in/christophe-muracciole/',
  },
  {
    name: 'Bader Al-Saloum',
    role: 'Volunteer',
    photo: baderPhoto,
    linkedin: 'https://www.linkedin.com/in/bader-al-saloum/',
  },
];

const nameStyle = {
  fontFamily: "'Orbitron', sans-serif",
  fontSize: '14px',
  letterSpacing: '0.5px',
};

function MemberCard({ member }: { member: TeamMember }) {
  return (
    <div
      className="group flex flex-col items-center gap-4 border border-[#1a1a2e] bg-[#0D0D1A] p-6 transition-all duration-200 hover:bg-[#111128] hover:border-[#00FFB3] hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,255,179,0.15)]"
    >
      <img
        src={member.photo}
        alt={member.name}
        className="h-48 w-48 md:h-56 md:w-56 rounded-full object-cover border-2 border-[#2a2a3e] group-hover:border-[#00FFB3] transition-colors duration-200"
        style={{ imageRendering: 'auto', objectPosition: member.objectPosition ?? 'center' }}
      />
      <div className="text-center">
        {member.linkedin ? (
          <a
            href={member.linkedin}
            target="_blank"
            rel="noreferrer"
            aria-label={`${member.name} on LinkedIn`}
            className="text-white mb-1 inline-block hover:text-[#00FFB3] hover:underline transition-colors duration-200"
            style={nameStyle}
          >
            {member.name}
          </a>
        ) : (
          <p className="text-white mb-1" style={nameStyle}>
            {member.name}
          </p>
        )}
        <p
          className="text-[#00FFB3]"
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '12px',
            letterSpacing: '1px',
            textTransform: 'uppercase',
          }}
        >
          {member.role}
        </p>
      </div>
    </div>
  );
}

export function Team() {
  return (
    <section id="team" className="bg-[#0D0D1A] pb-16 pt-3 md:pb-24 md:pt-5">
      <div className="max-w-[1200px] mx-auto px-6">
        <Reveal className="mb-9 text-center md:mb-12">
          <div className="mb-4">
            <span
              className="pixel-pill"
              style={{
                ['--pill-bg' as string]: '#00FFB3',
                ['--pill-text' as string]: '#003021',
                ['--pill-border' as string]: '#171717',
                ['--pill-shadow' as string]: '#005c3f',
                ['--pill-depth' as string]: 'rgba(0,90,60,0.18)',
                fontFamily: "'Space Mono', monospace",
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              THE CREW
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
            MEET THE TEAM BEHIND GATOR QUANT HACKS
          </h2>
        </Reveal>

        <div
          className="w-full mb-8"
          style={{
            height: '1px',
            background:
              'linear-gradient(90deg, transparent, #FA4616 20%, #00FFB3 50%, #003087 80%, transparent)',
          }}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {team.map((member, index) => (
            <Reveal key={member.name} delay={index * 110}>
              <MemberCard member={member} />
            </Reveal>
          ))}
        </div>

        <Reveal className="mb-8 mt-16 text-center md:mt-20">
          <h3
            className="text-white text-center"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 'clamp(10px, 2vw, 16px)',
              lineHeight: 1.7,
            }}
          >
            VOLUNTEERS
          </h3>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {volunteers.map((member, index) => (
            <Reveal key={member.name} delay={index * 110}>
              <MemberCard member={member} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
