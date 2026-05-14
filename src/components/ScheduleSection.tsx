import { useEffect, useRef, useState } from "react";

export function ScheduleSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeDay, setActiveDay] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const schedule = [
    {
      day: "Day 1 - Friday, October 2",
      events: [
        { time: "5:00 PM", title: "Check-in Opens", description: "Pick up your swag and meet fellow participants" },
        { time: "6:00 PM", title: "Commencement Ceremony", description: "Welcome to Gator Quant Hacks" },
        { time: "6:05 PM", title: "Opening Remarks", description: "Event overview and logistics" },
        { time: "6:15 PM", title: "Sponsor Introductions", description: "Meet our amazing partners" },
        { time: "6:30 PM", title: "MLH Segment", description: "Major League Hacking presentation" },
        { time: "6:45 PM", title: "Hacking Begins", description: "Let the building begin!" },
        { time: "7:30 PM", title: "Dinner Served", description: "Fuel up for the competition" },
        { time: "9:00 PM", title: "MLH Mini-Event", description: "Interactive challenge from Major League Hacking" }
      ]
    },
    {
      day: "Day 2 - Saturday, October 3",
      events: [
        { time: "8:00 AM", title: "Breakfast Served", description: "Start your day with fuel" },
        { time: "9:00 AM", title: "Workshop & Mini-Events", description: "Hands-on sessions and activities" },
        { time: "12:00 PM", title: "Lunch Served", description: "Midday meal break" },
        { time: "2:00 PM", title: "Afternoon Workshop", description: "Advanced technical sessions" },
        { time: "7:45 PM", title: "Dinner Served", description: "Evening meal service" },
        { time: "8:30 PM", title: "MLH Mini-Event", description: "Interactive challenge from Major League Hacking" },
        { time: "12:00 AM", title: "Midnight Snack", description: "Keep the energy going" }
      ]
    },
    {
      day: "Day 3 - Sunday, October 4",
      events: [
        { time: "8:30 AM", title: "Breakfast Served", description: "Final day fuel-up" },
        { time: "12:00 PM", title: "Lunch Served", description: "Meal service" },
        { time: "12:00 PM", title: "Submission Soft Deadline", description: "Get your work ready for judging" },
        { time: "1:00 PM", title: "Hacking Ends", description: "Final submissions deadline" },
        { time: "1:30 PM", title: "Expo & Judging Begins", description: "Showcase your projects to judges" },
        { time: "3:00 PM", title: "Judging Closes", description: "Expo concludes" },
        { time: "3:20 PM", title: "Sponsor Challenge Winners", description: "Special prizes announced" },
        { time: "3:35 PM", title: "Overall Winners Announced", description: "Grand prizes and recognition" },
        { time: "3:45 PM", title: "MLH Closing Segment", description: "Final words from Major League Hacking" },
        { time: "3:50 PM", title: "Closing Remarks", description: "Thank you and wrap-up" },
        { time: "4:00 PM", title: "Event Ends", description: "Thanks for competing at Gator Quant Hacks!" }
      ]
    },
  ];

  return (
    <section ref={sectionRef} className="relative py-24 bg-black overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 animate-radar" style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(0,188,212,0.3) 1px, transparent 1px)`,
          backgroundSize: '30px 30px'
        }} />
      </div>

      {/* Animated data streams */}
      <div className="absolute left-0 top-1/4 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent animate-data-flow" />
      <div className="absolute left-0 top-2/4 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent animate-data-flow" style={{ animationDelay: '1s' }} />
      <div className="absolute left-0 top-3/4 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent animate-data-flow" style={{ animationDelay: '2s' }} />

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-pulse" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-block mb-4">
            <span className="text-cyan-400 font-mono text-sm tracking-widest animate-pulse">SCHEDULE</span>
          </div>
          <h2 className="text-4xl md:text-5xl text-white mb-6 font-bold">
            Event <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 animate-gradient">Timeline</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            36 hours packed with workshops, mentorship sessions, and non-stop building.
          </p>
        </div>
        
        {/* Day selector */}
        <div className="flex justify-center gap-4 mb-12">
          {schedule.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveDay(index)}
              className={`px-6 py-3 font-mono text-sm border transition-all duration-300 ${
                activeDay === index
                  ? 'bg-cyan-400 text-black border-cyan-400 shadow-[0_0_20px_rgba(0,188,212,0.5)]'
                  : 'bg-transparent text-cyan-400 border-cyan-400/30 hover:border-cyan-400'
              }`}
            >
              Day {index + 1}
            </button>
          ))}
        </div>

        <div className="relative min-h-[600px]">
          {schedule.map((day, dayIndex) => (
            <div 
              key={dayIndex} 
              className={`transition-all duration-500 ${
                activeDay === dayIndex 
                  ? 'opacity-100 scale-100 relative' 
                  : 'opacity-0 scale-95 absolute top-0 left-0 right-0 pointer-events-none'
              }`}
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center font-mono text-black font-bold animate-pulse-glow">
                  {dayIndex + 1}
                </div>
                <h3 className="text-2xl text-white font-bold font-mono">{day.day}</h3>
                <div className="flex-1 h-px bg-gradient-to-r from-cyan-400/50 to-transparent" />
              </div>

              <div className="space-y-4 pl-4">
                {day.events.map((event, eventIndex) => (
                  <div 
                    key={eventIndex} 
                    className={`group flex gap-6 relative transition-all duration-500 ${activeDay === dayIndex && isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}
                    style={{ transitionDelay: `${eventIndex * 100}ms` }}
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-0 top-3 w-3 h-3 bg-cyan-400 border-4 border-black group-hover:scale-150 group-hover:animate-ping-slow transition-transform" />
                    
                    {/* Connecting line */}
                    <div className="absolute left-[5px] top-6 w-0.5 h-full bg-gradient-to-b from-cyan-400/50 to-transparent" />
                    
                    <div className="w-28 flex-shrink-0 pl-8">
                      <span className="text-sm font-mono text-cyan-400 group-hover:text-white transition-colors">{event.time}</span>
                    </div>
                    
                    <div className="flex-1 pb-6 border-l-2 border-cyan-400/20 pl-8 group-hover:border-cyan-400/50 transition-all">
                      <div className="bg-gradient-to-r from-[#001f3f]/50 to-transparent p-4 border-l-2 border-cyan-400/30 group-hover:border-cyan-400 group-hover:bg-[#001f3f]/70 group-hover:translate-x-2 transition-all duration-300 relative overflow-hidden">
                        {/* Scanning effect on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent opacity-0 group-hover:opacity-100 animate-scan-horizontal" />
                        
                        <div className="font-bold text-white mb-1 text-lg relative z-10">{event.title}</div>
                        <div className="text-sm text-gray-400 relative z-10">{event.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div className={`mt-16 text-center p-6 border border-cyan-400/30 bg-cyan-400/5 relative overflow-hidden transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/5 to-transparent animate-shimmer-slow" />
          <p className="text-gray-400 relative z-10">
            Schedule subject to change. All times are in <span className="text-cyan-400 font-mono">EST</span>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes radar {
          0% { transform: scale(1) rotate(0deg); opacity: 0.5; }
          100% { transform: scale(1.5) rotate(360deg); opacity: 0; }
        }
        @keyframes data-flow {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 10px rgba(0,188,212,0.5); }
          50% { box-shadow: 0 0 20px rgba(0,188,212,0.8), 0 0 30px rgba(0,188,212,0.3); }
        }
        @keyframes ping-slow {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        @keyframes scan-horizontal {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes shimmer-slow {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-radar {
          animation: radar 4s ease-out infinite;
        }
        .animate-data-flow {
          animation: data-flow 5s ease-in-out infinite;
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        .animate-ping-slow {
          animation: ping-slow 1s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .animate-scan-horizontal {
          animation: scan-horizontal 2s ease-in-out infinite;
        }
        .animate-shimmer-slow {
          animation: shimmer-slow 5s ease-in-out infinite;
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </section>
  );
}
