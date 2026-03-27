import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { useEffect, useRef, useState } from "react";

export function FAQSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

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

  const faqs = [
    {
      question: "Who can participate?",
      answer: "Gator Quant Hackathon is open to all university students, including both undergraduate and graduate students. No prior experience in finance is required, but basic programming skills are recommended."
    },
    {
      question: "How much does it cost?",
      answer: "Gator Quant Hackathon is completely free to attend! We provide meals, snacks, swag, and access to all workshops and mentorship sessions at no cost to participants."
    },
    {
      question: "Do I need a team?",
      answer: "You can participate solo or in teams of up to 4 people. We'll also have a team formation session at the beginning of the event if you'd like to find teammates."
    },
    {
      question: "What should I bring?",
      answer: "Bring your laptop, charger, and any personal items you'll need. We recommend bringing a change of clothes if you plan to stay overnight. We'll provide everything else!"
    },
    {
      question: "What kind of data and APIs will be available?",
      answer: "We'll provide access to historical market data, real-time data feeds, and various financial APIs. Our sponsors will also share their proprietary datasets and tools for the hackathon."
    },
    {
      question: "Will there be travel reimbursement?",
      answer: "Unfortunately, we are not able to offer travel reimbursements at this time. However, the event is completely free to attend with meals and accommodations provided."
    },
    {
      question: "What technologies can we use?",
      answer: "You're free to use any programming languages, frameworks, and tools you prefer. Popular choices include Python, R, JavaScript, and various ML libraries."
    },
    {
      question: "How are projects judged?",
      answer: "Projects are judged on innovation, technical complexity, practical application, presentation quality, and potential market impact. Industry professionals will serve as judges."
    }
  ];

  return (
    <section ref={sectionRef} className="relative py-24 bg-gradient-to-b from-black via-[#001f3f]/20 to-black overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-5 animate-matrix" style={{
          backgroundImage: `linear-gradient(45deg, rgba(0,188,212,0.5) 1px, transparent 1px), linear-gradient(-45deg, rgba(0,188,212,0.5) 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }} />
      </div>

      {/* Binary rain effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute text-cyan-400/20 text-xs font-mono animate-binary-fall"
            style={{
              left: `${10 + i * 12}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${8 + (i % 3) * 2}s`
            }}
          >
            {Array.from({ length: 20 }, () => Math.random() > 0.5 ? '1' : '0').join(' ')}
          </div>
        ))}
      </div>

      {/* Accent lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-pulse" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-block mb-4">
            <span className="text-cyan-400 font-mono text-sm tracking-widest animate-pulse">FAQ</span>
          </div>
          <h2 className="text-4xl md:text-5xl text-white mb-6 font-bold">
            Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 animate-gradient">Questions</span>
          </h2>
          <p className="text-gray-400 text-lg">
            Got questions? We've got answers.
          </p>
        </div>
        
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className={`bg-gradient-to-r from-[#001f3f]/80 to-black/80 border border-cyan-400/20 data-[state=open]:border-cyan-400 backdrop-blur-sm overflow-hidden transition-all duration-500 hover:translate-x-2 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <AccordionTrigger className="text-white hover:no-underline py-6 px-6 hover:text-cyan-400 transition-colors group">
                <div className="flex items-center gap-4 w-full">
                  <span className="flex-shrink-0 w-8 h-8 bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center font-mono text-cyan-400 text-sm group-hover:bg-cyan-400/20 group-hover:scale-110 transition-all">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="text-left flex-1">{faq.question}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-gray-400 px-6 pb-6 pl-20">
                <div className="border-l-2 border-cyan-400/30 pl-4 relative">
                  <div className="absolute left-0 top-0 w-0.5 h-0 bg-cyan-400 animate-expand-line" />
                  {faq.answer}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Contact section */}
        <div className={`mt-16 text-center p-8 bg-gradient-to-r from-transparent via-cyan-400/5 to-transparent border-y border-cyan-400/20 relative overflow-hidden transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '800ms' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent animate-shimmer-slow" />
          <p className="text-gray-400 mb-4 relative z-10">
            Still have questions?
          </p>
          <a 
            href="mailto:info@gatorquanthackathon.com" 
            className="text-cyan-400 hover:text-cyan-300 font-mono transition-all hover:scale-110 inline-block relative z-10"
          >
            info@gatorquanthackathon.com
          </a>
        </div>
      </div>

      <style>{`
        @keyframes matrix {
          0% { transform: translateY(0); }
          100% { transform: translateY(20px); }
        }
        @keyframes binary-fall {
          0% { transform: translateY(-100%); opacity: 0; }
          10% { opacity: 0.2; }
          90% { opacity: 0.2; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        @keyframes expand-line {
          0% { height: 0%; }
          100% { height: 100%; }
        }
        @keyframes shimmer-slow {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-matrix {
          animation: matrix 10s linear infinite;
        }
        .animate-binary-fall {
          animation: binary-fall linear infinite;
        }
        .animate-expand-line {
          animation: expand-line 0.3s ease-out forwards;
        }
        .animate-shimmer-slow {
          animation: shimmer-slow 5s ease-in-out infinite;
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        [data-state="open"] .animate-expand-line {
          animation: expand-line 0.3s ease-out forwards;
        }
      `}</style>
    </section>
  );
}