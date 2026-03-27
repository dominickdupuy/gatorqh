import { useEffect, useMemo, useState } from 'react';

type FaqItem = {
  command: string;
  prompt: string;
  answer: string;
};

const faqItems: FaqItem[] = [
  {
    command: 'WHO CAN PARTICIPATE?',
    prompt: 'Open to all university students.',
    answer:
      'Gator Quant Hackathon is open to all university students, including both undergraduate and graduate students. No prior experience in finance is required, but basic programming skills are recommended.',
  },
  {
    command: 'WHAT SHOULD I BRING?',
    prompt: 'Laptop, chargers, and your build energy.',
    answer:
      "Bring your laptop, chargers, and any hardware you need. We'll provide WiFi, food, drinks, and plenty of energy drinks. Don't forget a sleeping bag or pillow if you plan to rest during the event!",
  },
  {
    command: 'HOW DO TEAMS WORK?',
    prompt: 'Solo run or full squad accepted.',
    answer:
      'Teams can be 1-4 people. You can form teams before the event or during the team formation session on Day 1. Solo participants are welcome too!',
  },
  {
    command: 'ARE THERE PRIZES?',
    prompt: 'Treasure vault is live.',
    answer:
      'Yes. We have a $50,000 prize pool distributed across all four tracks, plus special prizes from sponsors. Winners also get mentorship opportunities and fast-tracked interviews.',
  },
  {
    command: 'WHAT KIND OF WORKSHOPS ARE OFFERED?',
    prompt: 'Power-ups from industry experts.',
    answer:
      "We'll have workshops on machine learning for trading, risk analytics, blockchain development, and more. Industry experts will lead hands-on sessions throughout the weekend.",
  },
  {
    command: 'IS THERE FINANCIAL AID FOR TRAVEL?',
    prompt: 'Travel reimbursement offline.',
    answer: 'No, we will not be offering travel reimbursement for participants.',
  },
  {
    command: 'WHAT TECHNOLOGIES CAN I USE?',
    prompt: 'Bring your preferred toolkit.',
    answer:
      "Any. Popular choices include Python (pandas, scikit-learn, TensorFlow), R, JavaScript, Solidity, and various APIs. Use whatever you're most comfortable with or want to learn.",
  },
  {
    command: 'HOW ARE PROJECTS JUDGED?',
    prompt: 'Boss-fight scoring rubric.',
    answer:
      'Projects are evaluated on innovation, technical execution, practical applicability, presentation quality, and alignment with the chosen track. Judges include industry professionals and academics.',
  },
];

export function FAQ() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [takeoverPhase, setTakeoverPhase] = useState<'idle' | 'blackout' | 'wipe'>('idle');
  const [staticBurst, setStaticBurst] = useState(false);
  const [screenFlicker, setScreenFlicker] = useState(false);

  const selectedFaq = faqItems[selectedIndex];

  const terminalTime = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(new Date());
  }, [takeoverPhase, selectedIndex]);

  useEffect(() => {
    const triggerTakeover = () => {
      setTakeoverPhase('blackout');
      setTimeout(() => setTakeoverPhase('wipe'), 300);
      setTimeout(() => setTakeoverPhase('idle'), 950);

      try {
        const audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext!)();
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        oscillator.type = 'square';
        oscillator.frequency.value = 880;
        gain.gain.value = 0.015;
        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.08);
      } catch {
        // Ignore audio errors and continue the transition.
      }
    };

    window.addEventListener('faq-terminal-launch', triggerTakeover);
    return () => window.removeEventListener('faq-terminal-launch', triggerTakeover);
  }, []);

  useEffect(() => {
    let staticTimeout = 0;
    let staticReset = 0;

    const scheduleStatic = () => {
      const delay = 12000 + Math.random() * 6000;
      staticTimeout = window.setTimeout(() => {
        setStaticBurst(true);
        staticReset = window.setTimeout(() => setStaticBurst(false), 90);
        scheduleStatic();
      }, delay);
    };

    scheduleStatic();

    return () => {
      window.clearTimeout(staticTimeout);
      window.clearTimeout(staticReset);
    };
  }, []);

  useEffect(() => {
    let flickerTimeout = 0;
    let flickerReset = 0;

    const scheduleFlicker = () => {
      const delay = 4000 + Math.random() * 3000;
      flickerTimeout = window.setTimeout(() => {
        setScreenFlicker(true);
        flickerReset = window.setTimeout(() => setScreenFlicker(false), 70);
        scheduleFlicker();
      }, delay);
    };

    scheduleFlicker();

    return () => {
      window.clearTimeout(flickerTimeout);
      window.clearTimeout(flickerReset);
    };
  }, []);

  return (
    <section
      id="faq"
      className={`relative overflow-hidden bg-[#001100] py-24 md:min-h-screen md:py-28 ${
        screenFlicker ? 'opacity-[0.997]' : ''
      }`}
      style={{ filter: 'url(#crt)' }}
    >
      <style>{`
        .faq-help-screen {
          text-shadow:
            0 0 7px rgba(105, 215, 255, 0.24),
            1px 0 0 rgba(250, 70, 22, 0.05),
            -1px 0 0 rgba(4, 74, 148, 0.06);
        }

        .faq-terminal-shell::before {
          content: '';
          position: absolute;
          inset: 18px;
          pointer-events: none;
          background: radial-gradient(circle at center, rgba(4, 74, 148, 0.07), transparent 65%);
          box-shadow: inset 0 0 72px rgba(4, 74, 148, 0.14);
          border-radius: 28px;
        }

        .faq-terminal-shell::after {
          content: 'GATOR QUANT // HELP_SCREEN v1.337';
          position: absolute;
          top: 14px;
          left: 50%;
          transform: translateX(-50%);
          color: rgba(149, 160, 149, 0.8);
          font-family: 'Press Start 2P', monospace;
          font-size: 10px;
          letter-spacing: 2px;
          white-space: nowrap;
          text-shadow: none;
        }

        .faq-terminal-lines {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image:
            repeating-linear-gradient(
              0deg,
              rgba(0, 0, 0, 0) 0px,
              rgba(0, 0, 0, 0) 2px,
              rgba(0, 0, 0, 0.12) 2px,
              rgba(0, 0, 0, 0.12) 3px
            );
          mix-blend-mode: multiply;
          opacity: 0.72;
        }

        .faq-terminal-glow {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(
            180deg,
            rgba(4, 74, 148, 0) 0%,
            rgba(4, 74, 148, 0.025) 45%,
            rgba(105, 215, 255, 0.06) 50%,
            rgba(4, 74, 148, 0.025) 55%,
            rgba(4, 74, 148, 0) 100%
          );
          animation: faqPhosphorSweep 10s linear infinite;
        }

        .faq-static-burst {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0;
          background-image:
            repeating-linear-gradient(0deg, rgba(255,255,255,0.2) 0 1px, transparent 1px 3px),
            repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 4px);
          mix-blend-mode: screen;
        }

        .faq-static-burst.active {
          opacity: 0.16;
        }

        .faq-cursor::before {
          content: '>';
          display: inline-block;
          width: 18px;
          color: #fa4616;
          opacity: 0;
          animation: faqCursorBlink 1s step-end infinite;
        }

        .faq-command:hover .faq-cursor::before,
        .faq-command[data-active='true'] .faq-cursor::before {
          opacity: 1;
        }

        .faq-launch-overlay {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 100000;
        }

        .faq-launch-overlay.blackout {
          background: #000;
          animation: faqBlackout 300ms linear forwards;
        }

        .faq-launch-overlay.wipe {
          background:
            linear-gradient(180deg, rgba(0, 255, 65, 0.25), rgba(0, 255, 65, 0.02)),
            #000;
          animation: faqScanlineWipe 650ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes faqCursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.25; }
        }

        @keyframes faqPhosphorSweep {
          from { transform: translateY(-110%); }
          to { transform: translateY(110%); }
        }

        @keyframes faqBlackout {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes faqScanlineWipe {
          0% {
            opacity: 1;
            clip-path: inset(0 0 100% 0);
          }
          30% {
            opacity: 1;
            clip-path: inset(0 0 45% 0);
          }
          100% {
            opacity: 0;
            clip-path: inset(100% 0 0 0);
          }
        }
      `}</style>

      {takeoverPhase !== 'idle' && (
        <div
          className={`faq-launch-overlay ${takeoverPhase}`}
          aria-hidden="true"
        />
      )}

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(4,74,148,0.16)_0%,rgba(0,17,0,0)_52%,rgba(0,0,0,0.82)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_105%_at_50%_50%,transparent_55%,rgba(0,0,0,0.45)_75%,rgba(0,0,0,0.8)_100%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1320px] px-4 md:px-6">
        <div className="faq-terminal-shell faq-help-screen relative overflow-hidden rounded-[36px] border-[18px] border-[#050505] bg-[#06101a] px-5 pb-6 pt-14 md:px-8 md:pb-8 md:pt-16 shadow-[0_0_0_2px_#151515,0_40px_90px_rgba(0,0,0,0.7),0_0_40px_rgba(4,74,148,0.16),inset_0_0_40px_rgba(4,74,148,0.08)]">
          <div className="faq-terminal-lines" />
          <div className="faq-terminal-glow" />
          <div className={`faq-static-burst ${staticBurst ? 'active' : ''}`} />

          <div className="relative z-10">
            <div className="mb-5 grid gap-3 border border-[#26456f] bg-[#0a1726]/95 px-4 py-4 md:mb-6 md:grid-cols-[1.4fr_1fr] md:px-5 shadow-[0_0_24px_rgba(4,74,148,0.12)]">
              <div>
                <p
                  className="mb-2 text-[#69d7ff]"
                  style={{
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: '11px',
                    letterSpacing: '2px',
                  }}
                >
                  [ GATOR QUANT ONBOARD COMPUTER ]
                </p>
                <p
                  className="text-[#dce9ff]"
                  style={{
                    fontFamily: "'VT323', 'Press Start 2P', monospace",
                    fontSize: '22px',
                    letterSpacing: '2px',
                  }}
                >
                  // HELP_SCREEN ACTIVE // TERMINAL TIME {terminalTime}
                </p>
              </div>
              <div className="flex flex-col justify-center gap-2 md:items-end">
                <p
                  className="text-[#fa4616]"
                  style={{
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: '10px',
                    letterSpacing: '1.5px',
                  }}
                >
                  [ VOLATILITY INDEX: 4,820 PTS ]
                </p>
                <p
                  className="text-[#9cc9ff]"
                  style={{
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: '10px',
                    letterSpacing: '1.5px',
                  }}
                >
                  [ INSERT COIN TO SAVE LOG ]
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-[0.95fr_1.4fr]">
              <div className="border border-[#26456f] bg-[#08131f]/96 p-4 shadow-[0_0_24px_rgba(4,74,148,0.08),inset_0_0_20px_rgba(4,74,148,0.07)] md:p-5">
                <div className="mb-4 flex items-center justify-between border-b border-[#1d3353] pb-3">
                  <span
                    className="text-[#69d7ff]"
                    style={{
                      fontFamily: "'Press Start 2P', monospace",
                      fontSize: '11px',
                      letterSpacing: '1.6px',
                    }}
                  >
                    COMMAND LIST
                  </span>
                  <span
                    className="text-[#fa4616]"
                    style={{
                      fontFamily: "'VT323', 'Press Start 2P', monospace",
                      fontSize: '20px',
                      letterSpacing: '2px',
                    }}
                  >
                    {`[0${selectedIndex + 1}]`}
                  </span>
                </div>

                <div className="space-y-2">
                  {faqItems.map((faq, index) => {
                    const isActive = index === selectedIndex;
                    return (
                      <button
                        key={faq.command}
                        type="button"
                        data-active={isActive}
                        className="faq-command flex w-full items-start gap-2 border border-transparent px-2 py-3 text-left transition-colors hover:border-[#26456f] hover:bg-[#0c2239] focus:border-[#26456f] focus:bg-[#0c2239] focus:outline-none"
                        style={isActive ? { boxShadow: 'inset 0 0 0 1px rgba(105,215,255,0.12), 0 0 18px rgba(4,74,148,0.12)' } : undefined}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex((value) => (value === index ? null : value))}
                        onFocus={() => setHoveredIndex(index)}
                        onBlur={() => setHoveredIndex((value) => (value === index ? null : value))}
                        onClick={() => setSelectedIndex(index)}
                      >
                        <span className="faq-cursor mt-[2px]" />
                        <span className="min-w-0">
                          <span
                            className={`${isActive ? 'text-[#ffffff]' : 'text-[#9cc9ff]'}`}
                            style={{
                              display: 'block',
                              fontFamily: "'VT323', 'Press Start 2P', monospace",
                              fontSize: '26px',
                              letterSpacing: '1px',
                              lineHeight: 1.05,
                            }}
                          >
                            ? {faq.command}
                          </span>
                          <span
                            className={`${isActive || hoveredIndex === index ? 'text-[#ffd0be]' : 'text-[#7f8da3]'}`}
                            style={{
                              display: 'block',
                              marginTop: '4px',
                              fontFamily: "'Space Mono', monospace",
                              fontSize: '12px',
                              letterSpacing: '1px',
                            }}
                          >
                            {faq.prompt}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="border border-[#26456f] bg-[#0a1420]/98 p-4 shadow-[0_0_28px_rgba(4,74,148,0.1),inset_0_0_28px_rgba(4,74,148,0.08)] md:p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#1d3353] pb-3">
                  <div>
                    <p
                      className="text-[#69d7ff]"
                      style={{
                        fontFamily: "'Press Start 2P', monospace",
                        fontSize: '11px',
                        letterSpacing: '1.6px',
                      }}
                    >
                      OUTPUT PANE
                    </p>
                    <p
                      className="mt-2 text-[#f4f7ff]"
                      style={{
                        fontFamily: "'VT323', 'Press Start 2P', monospace",
                        fontSize: '30px',
                        letterSpacing: '1px',
                        lineHeight: 1,
                      }}
                    >
                      {selectedFaq.command}
                    </p>
                  </div>
                  <div
                    className="text-[#faad94]"
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '12px',
                      letterSpacing: '1px',
                    }}
                  >
                    {`> LOG ENTRY // 0${selectedIndex + 1}`}
                  </div>
                </div>

                <div className="min-h-[280px] rounded-[18px] border border-[#1f4270] bg-[#07101a] px-4 py-4 shadow-[0_0_26px_rgba(4,74,148,0.12),inset_0_0_24px_rgba(4,74,148,0.06)] md:min-h-[360px] md:px-5 md:py-5">
                  <p
                    className="mb-4 text-[#faad94]"
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '13px',
                      letterSpacing: '1px',
                    }}
                  >
                    {`SYSTEM>// ${selectedFaq.prompt.toUpperCase()}`}
                  </p>
                  <p
                    className="max-w-[58ch] text-[#f3f8ff]"
                    style={{
                      fontFamily: "'VT323', 'Press Start 2P', monospace",
                      fontSize: '30px',
                      lineHeight: 1.22,
                      letterSpacing: '0.2px',
                    }}
                  >
                    {selectedFaq.answer}
                  </p>

                  <div className="mt-8 border-t border-dashed border-[#1d3353] pt-4">
                    <p
                      className="text-[#9cc9ff]"
                      style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '12px',
                        letterSpacing: '1px',
                      }}
                    >
                      {`team@gatorquant.com // TRANSMISSION CHANNEL OPEN`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
