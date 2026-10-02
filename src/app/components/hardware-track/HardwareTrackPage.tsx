import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Reveal } from '../Reveal';
import { Footer } from '../Footer';
import orangePlanet from '../orangePlanet.webp';
import { FabricField } from './FabricField';
import { BoardMap } from './BoardMap';
import { OddCounter } from './OddCounter';
import { PacketScope } from './PacketScope';
import { CrossingLab } from './CrossingLab';
import { CoreDiagram } from './CoreDiagram';
import { ScoreSim } from './ScoreSim';

type AppPage = 'home' | 'apply';

const PAGE_TITLE = 'Hardware Track: The Silicon Trade Core | Gator Quant Hacks 2026';

const DISCORD_URL = 'https://discord.gg/9qPMtN4UB';
const CONTACT_EMAIL = 'IoTStudentsClub@ece.ufl.edu';
const DEVPOST_URL = 'https://gqhacks.devpost.com';
const SUBMISSION_GUIDE_URL = 'https://github.com/ShayanNazir/GQH-Hardware-Track-Submission';
const PARTICIPANT_GUIDE_URL = '/hardware/GQH_Hardware_Track_Participant_Guide.pdf';
const GOWIN_DOWNLOAD_URL ='https://www.gowinsemi.com/en/support/download_eda/';
const EXAMPLE_SHA = '7fe929310cd84d0e1f1d6c1234567890abcdef12';

const CHAPTERS = [
  { id: 'hw-mission', label: 'THE MISSION' },
  { id: 'hw-board', label: 'THE BOARD' },
  { id: 'hw-toolchain', label: 'THE TOOLCHAIN' },
  { id: 'hw-protocol', label: 'THE PROTOCOL' },
  { id: 'hw-strategy', label: 'THE STRATEGY' },
  { id: 'hw-core', label: 'THE CORE' },
  { id: 'hw-judging', label: 'JUDGING' },
  { id: 'hw-submit', label: 'THE SUBMISSION' },
];

const HERO_LINES = ['BUILD THE', 'SILICON', 'TRADE CORE'];

const HERO_SPECS = [
  ['FPGA', 'GW2AR-18'],
  ['CLOCK', '27 MHz'],
  ['LINK', '115200 8N1'],
  ['JUDGING', '1 RUN × 100 PACKETS'],
];

type StoryEntry = { log: string; label: string; text: string };

const STORY_LOG: StoryEntry[] = [
  {
    log: 'T + 0',
    label: 'JUDGE PC',
    text: 'The judge’s script opens your board’s COM port and sends packet 16: two item IDs and their latest prices, eight bytes in all.',
  },
  {
    log: 'T + 0.69 ms',
    label: 'UART → FPGA',
    text: 'At 115,200 baud those eight bytes take about 0.69 milliseconds to arrive, one bit at a time. Your design may not answer until the last one is in.',
  },
  {
    log: 'YOUR CLOCK',
    label: 'INSIDE THE CHIP',
    text: 'Each item’s last 16 prices update, its average moves, and your logic checks whether the price just crossed that average.',
  },
  {
    log: 'RESPONSE',
    label: 'FPGA → JUDGE',
    text: 'Eight bytes go back: the same index and item IDs, plus a BUY, SELL or NONE for each item.',
  },
];

const SCOPE = ['VHDL / VERILOG', 'UART', 'STATE MACHINES', 'DATAPATHS', 'MOVING AVERAGES', 'TESTBENCHES', 'LATENCY', 'LUT COUNT'];

const DECODED = [
  {
    glyph: '[#]',
    term: 'FPGA',
    plain: 'A chip full of configurable logic that you wire up with code. Your design becomes real circuits, not a program running on a CPU.',
    twist: 'Everything in your architecture runs in parallel, on every clock edge.',
  },
  {
    glyph: '</>',
    term: 'VHDL',
    plain: 'A hardware description language (Verilog works too). A VHDL file has libraries, an entity (the pins) and an architecture (what happens inside).',
    twist: 'Clocked processes hold state; concurrent assignments are permanent wires.',
  },
  {
    glyph: '01',
    term: 'UART',
    plain: 'A simple serial link: bytes travel one bit at a time at an agreed speed, framed by a start bit and a stop bit.',
    twist: 'Here: 115,200 baud, 8 data bits, no parity, 1 stop bit, least significant bit first.',
  },
  {
    glyph: '/16',
    term: 'MOVING AVERAGE',
    plain: 'The average of an item’s last 16 prices. Each new price pushes the oldest one out and nudges the average.',
    twist: 'A crossing, when the price moves through its own average, is the trading signal.',
  },
];

const FIXED = [
  'The board: a Tang Nano 20K, with its pin mappings and port names fixed by the supplied .cst',
  'The wire protocol: UART 115200 8N1, 8-byte requests and 8-byte responses',
  'The trading rule: 16-price moving-average crossings, per item',
  'How judging runs: one official run of 100 packets, the same unpublished seed for every team',
  'The 100-point rubric',
];

const YOURS = [
  'How the HDL is organized inside, and what the top-level entity is called',
  'Your state machines and datapath, and how quickly they finish',
  'How small it is: LUT usage is scored',
  'How each item keeps its own history when the slots swap',
  'How you verify it: testbench, simulation, the supplied UART tests and their CSVs',
  'A README a judge can reproduce your build from',
];

const LOAN_ENDS = [
  {
    day: 'FRI · OCT 2',
    title: 'PICKUP',
    time: '7:15 PM',
    where: 'Reitz Room 2345',
    requirement: 'Your team is registered and every member has signed the FPGA Loan Agreement on the sign-up form.',
  },
  {
    day: 'SUN · OCT 4',
    title: 'DROP-OFF',
    time: '11:00 AM',
    where: 'Reitz Room 2345',
    requirement: 'Your final code is submitted to GitHub and Devpost, and the FPGA is handed to the judges.',
  },
];

const PRIORITY = [
  { size: 4, label: 'TEAMS OF 4' },
  { size: 3, label: 'TEAMS OF 3' },
  { size: 2, label: 'TEAMS OF 2' },
  { size: 1, label: 'INDIVIDUALS' },
];

const CHECKOUT = {
  bring: ['At least one team member, ideally the one the board is checked out under', 'A student ID', 'A bag or case to carry the board safely'],
  steps: [
    'Give your team name and show a student ID to the officer at the table.',
    'The officer confirms your team is registered and every member signed the loan agreement.',
    'The officer records the board’s serial number or asset tag next to your team name.',
    'Inspect the board and accessories together. Report any existing damage or missing items before you leave.',
    'Sign the check-out sheet to confirm you received the board in working condition.',
  ],
};

const CHECKIN = {
  bring: [
    'Push your final code to GitHub and complete your Devpost entry with the repository link and full commit SHA',
    'Make sure your final .fs file is in the repository. Judges program your board from it',
    'Power down and disconnect the board',
    'Every accessory you received: cables, power supply, and the box or bag',
  ],
  steps: [
    'Give your team name to the officer at the table.',
    'The officer confirms your GitHub submission was received.',
    'The officer matches the board’s serial number or asset tag to your check-out record.',
    'Inspect the board and accessories together for damage or missing items.',
    'Sign the check-in sheet. The loan closes once the officer marks the board returned.',
  ],
};

const MISHAPS = [
  { title: 'CAN’T MAKE DROP-OFF', text: 'Contact an organizer before the deadline to arrange another time. Another team member may return the board for you.' },
  { title: 'DAMAGED BOARD', text: 'Report it at drop-off rather than hiding it. The officer notes the damage on the check-in sheet.' },
  { title: 'LOST OR STOLEN', text: 'Notify an organizer as soon as you notice the board is missing.' },
];

type ToolStep = {
  n: string;
  title: string;
  head: string;
  paths?: string[];
  items: string[];
  device?: boolean;
  code?: string;
  link?: { label: string; href: string };
};

const TOOL_STEPS: ToolStep[] = [
  {
    n: '01',
    title: 'INSTALL',
    head: 'Gowin EDA V1.9.11.03 Education',
    items: [
      'Create a GOWIN Semiconductor account and select V1.9.11.03 Education. On Windows, choose “Windows x64”.',
      'Linux: use the Linux tab, unzip the download and run gw_ide from the /IDE/BIN folder.',
      'The download page lists Windows and Linux builds only.',
      'Plug the board in with a data-capable USB-C cable. It should appear as a “USBJTAG/serial device”.',
    ],
    link: { label: 'GOWIN EDA DOWNLOADS ↗', href: GOWIN_DOWNLOAD_URL },
  },
  {
    n: '02',
    title: 'PROJECT',
    head: 'A new FPGA design project',
    paths: ['File → New → FPGA Design Project', 'File → New → VHDL File', 'Project → Configuration → Synthesize → General'],
    items: [
      'Choose a name and folder, then select the device using the settings below.',
      'Add source files with File → New, or right-click the project to add existing ones. Keep the correct extension (.vhd or .v).',
      'Set Top Module/Entity to your design’s actual top-level entity/module. The name is up to you.',
      'What matters: the right entity is the synthesis root, its port names match the supplied .cst, and it obeys the UART packet protocol.',
    ],
    device: true,
  },
  {
    n: '03',
    title: 'CODE',
    head: 'Libraries, entity, architecture',
    items: [
      'Warm-up only: these examples use ports (clk, btn, rst0, rst4, led) that aren’t in the competition .cst, so they won’t run on the board as written.',
      'Libraries bring in the logic types (std_logic_1164) and vector math (numeric_std).',
      'The entity lists the ports: signals entering and leaving the block. Generics are constants that configure it without being pins.',
      'The architecture is what happens inside, and everything in it runs in parallel.',
      'Use a clocked process when the output depends on stored values. Use concurrent assignments for pure wiring: gates, muxes, decoders, adders.',
    ],
    code: `entity top is
  generic ( CLK_FREQ : natural := 27_000_000 );
  port (
    clk : in  std_logic;
    btn : in  std_logic;
    led : out std_logic_vector(5 downto 0)
  );
end entity;`,
  },
  {
    n: '04',
    title: 'PINS',
    head: 'The supplied constraint file',
    paths: ['Design tab', 'Right-click → Add Files', '19_tang_nano_20k.cst'],
    items: [
      'The organizers supply the Tang Nano 20K constraint file, 19_tang_nano_20k.cst. You don’t create your own or work out pin assignments.',
      'Open your project, select the Design tab on the left, right-click and choose Add Files to add it as the physical constraint file.',
      'Your top-level port names must match it exactly. They are fixed for the competition, so don’t rename any port.',
      'Don’t recreate the competition pin assignments in FloorPlanner.',
    ],
  },
  {
    n: '05',
    title: 'PROGRAM',
    head: 'Load the bitstream',
    paths: ['Synthesize', 'Place & Route', 'Tools → Programmer', 'Program/Configure'],
    items: [
      'Run Synthesize, then Place & Route. Both must finish without errors. The bitstream is written to impl/pnr/<project>.fs.',
      'With the board plugged in, open the Programmer and click Scan Device. Select the GW2AR-18C row.',
      'Double-click the row to open Device Configuration, set SRAM Mode and SRAM Program (below), browse to the .fs file and click Save.',
      'Click Program/Configure and check the console status.',
    ],
  },
];

const DEVICE = [
  ['SERIES', 'GW2AR'],
  ['PACKAGE', 'QFN88'],
  ['DEVICE', 'GW2AR-18'],
  ['VERSION', 'C'],
  ['PART NUMBER', 'GW2AR-LV18QN88C8/I7'],
];

const PROGRAM_MODES = [
  {
    id: 'sram',
    title: 'SRAM PROGRAM',
    sub: 'What you use, and what judges use',
    rows: [
      ['ACCESS MODE', 'SRAM Mode'],
      ['OPERATION', 'SRAM Program'],
      ['FILE', 'impl/pnr/<project>.fs'],
    ],
  },
  {
    id: 'flash',
    title: 'NO FLASH NEEDED',
    sub: 'Judges reprogram every board',
    rows: [
      ['EXTERNAL FLASH', 'Not required'],
      ['POWER REMOVED', 'SRAM contents are lost'],
      ['JUDGING', 'Your .fs, loaded in SRAM mode'],
    ],
  },
];

const LOADER_COMMANDS = `pacman -Syu
pacman -S mingw-w64-ucrt-x86_64-openFPGALoader
openFPGALoader --Version
openFPGALoader --list-boards | grep tangnano20k

# -b selects the board; omitting -f means volatile SRAM programming.
openFPGALoader -b tangnano20k "/c/path/to/project.fs"`;

const FIXES = [
  'Close Python, serial terminals and any other Programmer windows.',
  'Plug the board directly into the PC, not through a hub.',
  'Use a USB-C cable you know carries data.',
  'Click Scan Device again.',
  'Try another detected “USB Debugger A/…” location.',
  'Use the latest standalone Gowin Programmer.',
  'Fall back to openFPGALoader (Plan B above).',
  'Still stuck? Ask an organizer before changing Windows USB drivers or the BL616 firmware.',
];

const MANUALS = [
  { label: 'Sipeed Tang Nano 20K', href: 'https://wiki.sipeed.com/hardware/en/tang/tang-nano-20k/nano-20k.html' },
  { label: 'Sipeed Nano 20K Gowin tutorial', href: 'https://wiki.sipeed.com/hardware/en/tang/tang-nano-20k/example/led.html' },
  { label: 'Sipeed Education Edition install', href: 'https://wiki.sipeed.com/hardware/en/tang/common-doc/get_started/install-the-ide.html' },
  { label: 'Sipeed Tang troubleshooting', href: 'https://wiki.sipeed.com/hardware/en/tang/common-doc/questions.html' },
  { label: 'Sipeed debugger firmware', href: 'https://wiki.sipeed.com/hardware/en/tang/common-doc/update_debugger.html' },
  { label: 'Gowin Programmer User Guide', href: 'https://cdn.gowinsemi.com.cn/SUG502E.pdf' },
  { label: 'openFPGALoader first steps', href: 'https://trabucayre.github.io/openFPGALoader/guide/first-steps.html' },
  { label: 'openFPGALoader supported boards', href: 'https://trabucayre.github.io/openFPGALoader/compatibility/board.html' },
  { label: 'Intel FPGA / Questa installation', href: 'https://www.intel.com/content/www/us/en/support/programmable/licensing/installation-and-licensing.html' },
  { label: 'Questa-Intel FPGA quick start', href: 'https://www.intel.com/programmable/technical-pdfs/703090.pdf' },
  { label: 'MSYS2', href: 'https://www.msys2.org/' },
  { label: 'GQH instructions repository', href: SUBMISSION_GUIDE_URL },
];

const PROTOCOL_RULES = [
  { k: '1 : 1', t: 'ONE FOR ONE', d: 'Exactly one response per request. Never send unsolicited bytes.' },
  { k: '8 / 8', t: 'WAIT FOR ALL EIGHT', d: 'Never start a response before all 8 request bytes have arrived.' },
  { k: 'ECHO', t: 'MIRROR THE REQUEST', d: 'Echo the index and both item IDs in the request’s slot order. The last two bytes are always 0x0000.' },
];

const ITEM_IDS = [
  { code: '0x11', name: 'ITEM A' },
  { code: '0x22', name: 'ITEM B' },
];

const ACTION_CODES = [
  { code: '0x00', name: 'NONE', tone: 'none' },
  { code: '0x01', name: 'SELL', tone: 'sell' },
  { code: '0x02', name: 'BUY', tone: 'buy' },
];

// Derived from the guide's 27 MHz clock and 115200 8N1 link, plus the reference
// latency (§11) and the per-packet timeout (§10.2).
const TIME_SCALES = [
  { label: 'ONE CLOCK', value: '37 ns', seconds: 1 / 27e6, note: '27 MHz', level: 0 },
  { label: 'ONE UART BIT', value: '8.68 µs', seconds: 1 / 115200, note: '≈ 234 clocks', level: 1 },
  { label: 'ONE BYTE', value: '86.8 µs', seconds: 10 / 115200, note: 'start + 8 data + stop', level: 0 },
  { label: 'ONE PACKET', value: '694 µs', seconds: 80 / 115200, note: '18,750 clocks', level: 2 },
  { label: 'REF ROUND TRIP', value: '16.6 ms', seconds: 0.016626, note: 'judge PC, measured', level: 1 },
  { label: 'TIMEOUT', value: '1 s', seconds: 1, note: 'ends the run', level: 0 },
];
const SCALE_MIN = Math.log10(1e-8);
const SCALE_MAX = Math.log10(1);

const RULE_CARDS = [
  { tone: 'buy', name: 'BUY', glyph: '▲', cond: 'previous ≤ old avg  AND  current > new avg', text: 'Upward crossing.' },
  { tone: 'sell', name: 'SELL', glyph: '▼', cond: 'previous ≥ old avg  AND  current < new avg', text: 'Downward crossing.' },
  { tone: 'hold', name: 'HOLD', glyph: '═', cond: 'any other case', text: 'No crossing: repeat the last action. It is NONE only before the item’s first crossing.' },
];

const RULE_EXAMPLES = [
  { before: 95, now: 105, action: 'BUY', note: 'CROSSED UP' },
  { before: 105, now: 94, action: 'SELL', note: 'CROSSED DOWN' },
  { before: 105, now: 120, action: 'HOLD', note: 'NO CROSSING' },
];

const RUN_RULES = [
  { k: '1', t: 'OFFICIAL RUN', d: '100 packets, indices 0–99. The judge sends one request and waits for its complete response before sending the next.' },
  { k: '0–15', t: 'WARM-UP', d: 'These packets fill the windows and are answered with NONE. That leaves 84 scored packets and 168 scored actions.' },
  { k: 'SEED', t: 'SAME FOR ALL, UNPUBLISHED', d: 'The organizers choose one price seed for every team and don’t publish it in advance, so don’t hardcode price patterns.' },
  { k: 'SRAM', t: 'PROGRAMMED BY THE JUDGES', d: 'Judges SRAM-program the .fs from your submitted commit on a single judging PC, with Gowin Programmer and serial terminals closed.' },
  { k: '1 s', t: 'A TIMEOUT ENDS THE RUN', d: 'If all 8 response bytes don’t arrive within 1 second, the packet is logged TIMEOUT, counts as incorrect and ends the run. Packets never sent score zero.' },
  { k: '1×', t: 'ONE RERUN', d: 'If a run fails for a reason outside your design, like a cable or the wrong COM port, judges may reprogram and rerun once.' },
];

const RUBRIC = [
  { points: 50, label: 'PACKET CORRECTNESS', detail: 'Packets with the right index, both item IDs and both actions, out of 84 scored packets: 50 × (correct ÷ 84).' },
  { points: 20, label: 'ACTION CORRECTNESS', detail: 'Individual actions, out of 168 scored actions: 20 × (correct ÷ 168).' },
  { points: 15, label: 'LATENCY', detail: 'Average round trip of received packets against the organizer reference design (16.626 ms) on the same judge PC: within 1.25× (about 20.8 ms) earns 15, within 2× (about 33.3 ms) earns 8, slower earns 0. Zero if packet correctness is below 95%.' },
  { points: 15, label: 'LUT USAGE', detail: 'Total LUT count from the Gowin synthesis report against the reference (542 LUTs): 15 × min(1, 542 ÷ your LUTs). Zero if packet correctness is below 95%.' },
];

const REPO_MUST = [
  'Final HDL source files used by the FPGA design',
  'Tang Nano 20K constraint file(s), including the organizer-supplied .cst',
  'Gowin project/build files needed to reproduce the design',
  'The generated .fs file, built from that exact source. Judges program the board from it',
  'A complete README.md',
  'Any host-side test or demo code (it is not run during judging)',
  'Testbench and simulation files, if used',
  'Supporting data or configuration files needed to reproduce it',
];

const REPO_TREE: [string, string][] = [
  ['team-project/', ''],
  ['├── README.md', ''],
  ['├── src/', 'HDL source files'],
  ['├── constraints/', '19_tang_nano_20k.cst'],
  ['├── testbench/', 'testbench files'],
  ['├── gowin/', 'Gowin project/build files'],
  ['├── bitstream/', 'final .fs file'],
  ['└── results/', 'optional test CSVs and benchmarks'],
];

const README_NEEDS = [
  'Team / project name and members',
  'Brief project description',
  'What runs on the FPGA',
  'Host-side tooling used for local testing, if any',
  'Board: Tang Nano 20K',
  'HDL / languages used',
  'Gowin EDA version',
  'Top-level entity/module name',
  'Build instructions',
  'FPGA programming instructions',
  'Inputs and expected outputs',
  'How to reproduce the final demo',
  'Testing / verification procedure',
  'Performance results, including your LUT count',
  'External libraries, IP cores, starter code or datasets used',
  'Known limitations or incomplete features',
];

const PREFLIGHT = [
  'The project synthesizes',
  'Place & Route completes',
  'The correct Tang Nano 20K .cst is included',
  'Top-level port names match the .cst',
  'The design programs onto the Tang Nano 20K',
  'The quick and robust UART tests pass on your board',
];

const FREEZE_LINES = [
  { cmd: 'git status' },
  { cmd: 'git add .' },
  { cmd: 'git commit -m "Final hackathon submission"' },
  { cmd: 'git push' },
  { cmd: 'git rev-parse HEAD', out: EXAMPLE_SHA },
];

const ACCESS = [
  { title: 'PUBLIC REPO', tone: 'green', text: 'Check that the link works while you are logged out of GitHub.' },
  { title: 'PRIVATE REPO', tone: 'cyan', text: 'Follow the organizer’s judging-access instructions and grant access before the deadline.' },
  { title: 'NO SECRETS', tone: 'red', text: 'Never commit passwords, API keys, access tokens, private keys or personal credentials.' },
];

const FINAL_CHECKS = [
  'Final source code is pushed to GitHub',
  'Repository is accessible to judges',
  'Tang Nano 20K .cst file is included',
  'Gowin project/build files and the final .fs file are included',
  'README is complete',
  'Top-level entity/module is documented',
  'Build and FPGA programming instructions are included',
  'Project successfully synthesizes',
  'Place & Route successfully completes',
  'Final design has been tested on the Tang Nano 20K',
  'External resources are disclosed',
  'Final Git commit has been pushed',
  'Full final commit SHA has been recorded',
  'GitHub repository URL is included in Devpost',
  'Final commit SHA is included in Devpost/project documentation',
  'Demo video is included, if required',
  'Devpost submission is complete before 11:00 AM EDT on October 4',
  'Board and accessories are dropped off at Reitz Room 2345 by 11:00 AM on October 4',
];

const CHECKLIST_KEY = 'gqh-hardware-checklist-v2';

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const GLYPHS = '#%&*+=?<>/\\[]{}01ABCDEFGHJKLMNPQRSTUVWXYZ';

// Characters resolve left to right out of random glyphs, like a signal locking on.
function DecodeText({ text, active, delay = 0 }: { text: string; active: boolean; delay?: number }) {
  const [out, setOut] = useState(() => text.replace(/\S/g, ' '));

  useEffect(() => {
    if (!active) return;
    if (reducedMotion()) {
      setOut(text);
      return;
    }
    let raf = 0;
    const begin = performance.now() + delay;
    const tick = (now: number) => {
      const progress = Math.min(1, Math.max(0, (now - begin) / 1100));
      let next = '';
      for (let index = 0; index < text.length; index += 1) {
        const revealAt = (index / text.length) * 0.65;
        if (progress >= revealAt + 0.35) next += text[index];
        else if (progress >= revealAt) next += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        else next += ' ';
      }
      setOut(next);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, delay, text]);

  return <span aria-hidden="true">{out}</span>;
}

const BOOT_LINES = [
  '> SCAN DEVICE',
  '  GW2AR-18C FOUND · USB DEBUGGER A',
  '> LOAD impl/pnr/trade_core.fs',
  '> SRAM PROGRAM',
];

// Arriving from the tracks section: the page "programs" itself onto the board,
// then powers on like an old CRT.
function BootArrival({ onDone }: { onDone: () => void }) {
  const doneRef = useRef(onDone);
  const [lines, setLines] = useState(0);
  const [phase, setPhase] = useState<'boot' | 'on' | 'out'>('boot');
  doneRef.current = onDone;

  useEffect(() => {
    const timers = BOOT_LINES.map((_, index) => window.setTimeout(() => setLines(index + 1), 80 + index * 150));
    timers.push(window.setTimeout(() => setPhase('on'), 1050));
    timers.push(window.setTimeout(() => setPhase('out'), 1300));
    timers.push(window.setTimeout(() => doneRef.current(), 1750));
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  return (
    <div className={`hw-boot hw-boot--${phase}`} aria-hidden="true">
      <div className="hw-boot__screen">
        {BOOT_LINES.slice(0, lines).map((line) => (
          <div key={line} className="hw-boot__line">
            {line}
          </div>
        ))}
        {lines >= BOOT_LINES.length && (
          <>
            <div className="hw-boot__bar">
              <i />
            </div>
            <div className="hw-boot__ok">CONFIGURATION DONE · TRACK 01 ONLINE</div>
          </>
        )}
      </div>
    </div>
  );
}

function Chapter({
  id,
  index,
  kicker,
  title,
  lede,
  children,
}: {
  id: string;
  index: number;
  kicker: string;
  title: string;
  lede?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="hw-chapter" data-chapter={index}>
      <div className="hw-wrap">
        <Reveal className="hw-chapter__head">
          <div className="hw-chapter__ghost" aria-hidden="true">
            {String(index).padStart(2, '0')}
          </div>
          <div className="hw-chapter__kicker">
            <span>CH {String(index).padStart(2, '0')}</span>
            {kicker}
          </div>
          <h2 className="hw-chapter__title">{title}</h2>
          {lede && <p className="hw-lede">{lede}</p>}
        </Reveal>
        {children}
      </div>
    </section>
  );
}

function SubHead({ children }: { children: ReactNode }) {
  return (
    <Reveal className="hw-subhead">
      <span />
      <h3>{children}</h3>
      <span />
    </Reveal>
  );
}

// A slim chapter rail in the left gutter; hover or click to jump between chapters.
function BriefingHud({ active, visible }: { active: number; visible: boolean }) {
  const [open, setOpen] = useState(false);
  const current = Math.max(0, active);

  useEffect(() => {
    if (!visible) setOpen(false);
  }, [visible]);

  return (
    <nav className={`hw-hud ${visible ? 'hw-hud--on' : ''}`} aria-label="Briefing chapters">
      <button
        type="button"
        className="hw-hud__main"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={`Chapter ${current + 1} of ${CHAPTERS.length}: ${CHAPTERS[current].label}`}
      >
        <span className="hw-hud__count">
          {String(current + 1).padStart(2, '0')}
          <small>/{String(CHAPTERS.length).padStart(2, '0')}</small>
        </span>
        <span className="hw-hud__bar" aria-hidden="true">
          {CHAPTERS.map((chapter, index) => (
            <i
              key={chapter.id}
              className={`${index <= active ? 'hw-hud__tick--on' : ''} ${index === active ? 'hw-hud__tick--now' : ''}`}
            />
          ))}
        </span>
      </button>
      <ol className={`hw-hud__list ${open ? 'hw-hud__list--open' : ''}`}>
        <li className="hw-hud__list-title">MISSION FILE</li>
        {CHAPTERS.map((chapter, index) => (
          <li key={chapter.id}>
            <button
              type="button"
              className={index === active ? 'hw-hud__item--on' : ''}
              onClick={() => {
                document.getElementById(chapter.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setOpen(false);
              }}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              {chapter.label}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function Toolchain() {
  const [active, setActive] = useState(0);
  const step = TOOL_STEPS[active];

  return (
    <div className="hw-tool">
      <div className="hw-tool__rail" role="tablist" aria-label="Toolchain steps">
        <div className="hw-tool__line" aria-hidden="true">
          <i style={{ width: `${(active / (TOOL_STEPS.length - 1)) * 100}%` }} />
        </div>
        {TOOL_STEPS.map((item, index) => (
          <button
            key={item.n}
            type="button"
            role="tab"
            aria-selected={active === index}
            className={`hw-tool__node ${index <= active ? 'hw-tool__node--done' : ''} ${index === active ? 'hw-tool__node--on' : ''}`}
            onClick={() => setActive(index)}
          >
            <span>{item.n}</span>
            {item.title}
          </button>
        ))}
      </div>

      <div className="hw-tool__panel" key={step.n} role="tabpanel">
        <div className="hw-tool__copy">
          <h4>
            <span>STEP {step.n}</span>
            {step.head}
          </h4>
          {step.paths && (
            <div className="hw-tool__paths">
              {step.paths.map((path) => (
                <code key={path}>{path}</code>
              ))}
            </div>
          )}
          <ul>
            {step.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          {step.link && (
            <a className="hw-tool__link" href={step.link.href} target="_blank" rel="noreferrer">
              {step.link.label}
            </a>
          )}
        </div>
        <div className="hw-tool__aside">
          {step.device && (
            <table className="hw-device">
              <tbody>
                {DEVICE.map(([key, value]) => (
                  <tr key={key}>
                    <th>{key}</th>
                    <td>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {step.code && <pre className="hw-code">{step.code}</pre>}
          {!step.device && !step.code && (
            <div className="hw-pipeline" aria-hidden="true">
              {['SYNTHESIZE', 'PLACE & ROUTE', '.fs BITSTREAM', 'PROGRAM'].map((stage, index) => (
                <div key={stage} className="hw-pipeline__stage" style={{ animationDelay: `${index * 0.55}s` }}>
                  <i style={{ animationDelay: `${index * 0.55}s` }} />
                  {stage}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="hw-tool__nav">
        <button type="button" onClick={() => setActive((value) => Math.max(0, value - 1))} disabled={active === 0}>
          ← PREV
        </button>
        <button type="button" onClick={() => setActive((value) => Math.min(TOOL_STEPS.length - 1, value + 1))} disabled={active === TOOL_STEPS.length - 1}>
          NEXT STEP →
        </button>
      </div>
    </div>
  );
}

function FaultFinder() {
  const [step, setStep] = useState(0);
  const [fixed, setFixed] = useState(false);

  return (
    <div className="hw-fault">
      <div className="hw-fault__error">
        <span>ERROR</span>
        “Cable failed to open via the location” <em>or</em> “No Gowin devices found”
      </div>
      {fixed ? (
        <div className="hw-fault__fixed">
          <strong>BOARD FOUND ✓</strong>
          <p>Fixed at step {step + 1} of {FIXES.length}. Back to building.</p>
          <button type="button" onClick={() => { setStep(0); setFixed(false); }}>
            ↺ START OVER
          </button>
        </div>
      ) : (
        <>
          <div className="hw-fault__progress" aria-hidden="true">
            {FIXES.map((_, index) => (
              <i key={index} className={index < step ? 'hw-fault__pip--tried' : index === step ? 'hw-fault__pip--now' : ''} />
            ))}
          </div>
          <div className="hw-fault__step" key={step} aria-live="polite">
            <span>TRY {String(step + 1).padStart(2, '0')}</span>
            <p>{FIXES[step]}</p>
          </div>
          <div className="hw-fault__actions">
            <button type="button" className="hw-fault__ok" onClick={() => setFixed(true)}>
              IT WORKED ✓
            </button>
            {step < FIXES.length - 1 ? (
              <button type="button" onClick={() => setStep((value) => value + 1)}>
                STILL FAILING → NEXT FIX
              </button>
            ) : (
              <a href={DISCORD_URL} target="_blank" rel="noreferrer">
                ASK ON DISCORD ↗
              </a>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function CopyBlock({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="hw-copy">
      <div className="hw-copy__bar">
        <span>{label}</span>
        <button type="button" onClick={copy}>
          {copied ? 'COPIED ✓' : 'COPY'}
        </button>
      </div>
      <pre>{text}</pre>
    </div>
  );
}

// Types the freeze commands out once the terminal scrolls into view.
function FreezeTerminal() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [chars, setChars] = useState(0);
  const script = FREEZE_LINES.map((line) => line.cmd).join('');
  const total = script.length;

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    if (reducedMotion()) {
      setChars(total);
      return;
    }
    let timer = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        timer = window.setInterval(() => {
          setChars((value) => {
            if (value >= total) {
              window.clearInterval(timer);
              return value;
            }
            return value + 1;
          });
        }, 38);
      },
      { threshold: 0.5 }
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      window.clearInterval(timer);
    };
  }, [total]);

  let remaining = chars;
  return (
    <div ref={rootRef} className="hw-term">
      <div className="hw-term__bar">
        <i />
        <i />
        <i />
        <span>team-project · main</span>
      </div>
      <div className="hw-term__body">
        {FREEZE_LINES.map((line) => {
          const typed = Math.max(0, Math.min(line.cmd.length, remaining));
          const started = remaining > 0;
          const finished = remaining >= line.cmd.length;
          remaining -= line.cmd.length;
          if (!started && typed === 0) return null;
          return (
            <div key={line.cmd}>
              <div className="hw-term__line">
                <b>$</b> {line.cmd.slice(0, typed)}
                {!finished && <span className="hw-term__caret" />}
              </div>
              {finished && line.out && (
                <div className="hw-term__out">
                  {line.out}
                  <em>← SAVE THE FULL SHA</em>
                </div>
              )}
            </div>
          );
        })}
        {chars >= total && (
          <div className="hw-term__line">
            <b>$</b> <span className="hw-term__caret" />
          </div>
        )}
      </div>
    </div>
  );
}

function FinalChecklist() {
  const [checked, setChecked] = useState<boolean[]>(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(CHECKLIST_KEY) ?? '[]');
      return FINAL_CHECKS.map((_, index) => Boolean(saved[index]));
    } catch {
      return FINAL_CHECKS.map(() => false);
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(CHECKLIST_KEY, JSON.stringify(checked));
    } catch {
      // Storage can be unavailable (private windows); the list still works for this visit.
    }
  }, [checked]);

  const done = checked.filter(Boolean).length;
  const all = done === FINAL_CHECKS.length;

  return (
    <div className={`hw-list ${all ? 'hw-list--go' : ''}`}>
      <div className="hw-list__head">
        <div>
          <span>FINAL SUBMISSION CHECKLIST</span>
          <em>SAVED IN THIS BROWSER ONLY</em>
        </div>
        <strong>
          {done}
          <small>/{FINAL_CHECKS.length}</small>
        </strong>
      </div>
      <div className="hw-list__meter" aria-hidden="true">
        {FINAL_CHECKS.map((item, index) => (
          <i key={item} className={index < done ? 'hw-list__seg--on' : ''} />
        ))}
      </div>
      <ul>
        {FINAL_CHECKS.map((item, index) => (
          <li key={item}>
            <label className={checked[index] ? 'hw-list__item--on' : ''}>
              <input
                type="checkbox"
                checked={checked[index]}
                onChange={() => setChecked((current) => current.map((value, k) => (k === index ? !value : value)))}
              />
              <span className="hw-list__box" aria-hidden="true" />
              {item}
            </label>
          </li>
        ))}
      </ul>
      <div className="hw-list__foot">
        {all ? (
          <strong className="hw-list__go">ALL SYSTEMS GO · SUBMIT ON DEVPOST, THEN RETURN THE BOARD</strong>
        ) : (
          <span>{FINAL_CHECKS.length - done} TO GO</span>
        )}
        {done > 0 && (
          <button type="button" onClick={() => setChecked(FINAL_CHECKS.map(() => false))}>
            RESET
          </button>
        )}
      </div>
    </div>
  );
}

function CrossGlyph({ before, now, action }: { before: number; now: number; action: string }) {
  const y = (value: number) => 30 - (value - 100) * 1.1;
  const color = action === 'BUY' ? '#4cff87' : action === 'SELL' ? '#ff5a6e' : '#9cc9ff';
  return (
    <svg viewBox="0 0 120 60" className="hw-glyph" aria-hidden="true">
      <line x1="4" x2="116" y1="30" y2="30" className="hw-glyph__avg" />
      <text x="116" y="26" textAnchor="end" className="hw-glyph__label">
        AVG 100
      </text>
      <line x1="28" x2="92" y1={y(before)} y2={y(now)} stroke={color} className="hw-glyph__move" />
      <circle cx="28" cy={y(before)} r="4" fill="#0b1830" stroke={color} strokeWidth="2" />
      <circle cx="92" cy={y(now)} r="5" fill={color} className="hw-glyph__now" />
    </svg>
  );
}

export default function HardwareTrackPage({
  onNavigate,
  isIntroActive = false,
}: {
  onNavigate?: (page: AppPage) => void;
  isIntroActive?: boolean;
}) {
  // Only boot in when arriving from inside the site; a direct visit already
  // gets the rocket intro.
  const [booting, setBooting] = useState(() => !isIntroActive && !reducedMotion());
  const [activeChapter, setActiveChapter] = useState(-1);
  const [heroInView, setHeroInView] = useState(true);
  const heroRef = useRef<HTMLElement>(null);
  const heroReady = !isIntroActive && !booting;

  useEffect(() => {
    const previous = document.title;
    document.title = PAGE_TITLE;
    return () => {
      document.title = previous;
    };
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const heroObserver = new IntersectionObserver(([entry]) => setHeroInView(entry.isIntersecting), {
      threshold: 0.25,
    });
    heroObserver.observe(hero);

    const chapterObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveChapter(CHAPTERS.findIndex((chapter) => chapter.id === entry.target.id));
          }
        }
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    CHAPTERS.forEach((chapter) => {
      const node = document.getElementById(chapter.id);
      if (node) chapterObserver.observe(node);
    });

    return () => {
      heroObserver.disconnect();
      chapterObserver.disconnect();
    };
  }, []);

  const backToTracks = () => {
    onNavigate?.('home');
    window.setTimeout(() => {
      document.getElementById('game-modes')?.scrollIntoView({ behavior: 'instant' as ScrollBehavior, block: 'start' });
    }, 60);
  };

  const beginBriefing = () => {
    document.getElementById(CHAPTERS[0].id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="hw-page">
      <TrackStyles />
      {booting && <BootArrival onDone={() => setBooting(false)} />}

      <section ref={heroRef} className="hw-hero">
        <FabricField />
        <div className="hw-hero__shade" aria-hidden="true" />
        <div className="hw-hero__scan" aria-hidden="true" />

        <div className="hw-wrap hw-hero__content">
          <button type="button" className={`hw-back ${heroReady ? 'hw-in' : ''}`} onClick={backToTracks}>
            ← ALL TRACKS
          </button>

          <div className={`hw-hero__badge ${heroReady ? 'hw-in' : ''}`}>
            <span className="hw-emblem" aria-hidden="true">
              <img src={orangePlanet} alt="" />
              <i />
            </span>
            <span>
              TRACK 01 · HARDWARE
              <em>MISSION FILE: FPGA TRADE CORE · TANG NANO 20K</em>
            </span>
          </div>

          <div className={`hw-hero__signal ${heroReady ? 'hw-in' : ''}`}>
            <span className="hw-dot" /> INCOMING PACKET · JUDGE PC → COM PORT · 115200 BAUD · 8N1
          </div>

          <h1 className="hw-hero__title">
            <span className="sr-only">Build the Silicon Trade Core</span>
            {HERO_LINES.map((line, index) => (
              <span key={line} className={`hw-hero__line hw-hero__line--${index}`}>
                <DecodeText text={line} active={heroReady} delay={150 + index * 260} />
              </span>
            ))}
          </h1>

          <dl className={`hw-hero__specs ${heroReady ? 'hw-hero__specs--in' : ''}`}>
            {HERO_SPECS.map(([key, value], index) => (
              <div key={key} style={{ animationDelay: `${900 + index * 120}ms` }}>
                <dt>{key}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="hw-hero__live" aria-hidden="true">
          <span className="hw-dot hw-dot--green" /> LIVE MODEL · PRICE PACKETS IN, ACTIONS OUT
        </div>
        <button type="button" className="hw-hero__cue" onClick={beginBriefing} aria-label="Scroll to the mission">
          <span>READ THE MISSION</span>
          <i />
        </button>
      </section>

      <BriefingHud active={activeChapter} visible={!heroInView && activeChapter >= 0} />

      <Chapter
        id="hw-mission"
        index={1}
        kicker="THE MISSION"
        title="Put a trading strategy in silicon"
        lede="In the Hardware Track, your team borrows a Tang Nano 20K FPGA and turns a simple trading rule into a circuit. The judge’s PC fires price packets at your board over a serial link, and your design answers each one with a BUY, SELL or NONE for two items. You are scored on correctness, latency and how few LUTs your design uses."
      >
        <Reveal>
          <div className="hw-files">
            <div>
              <span>MISSION FILE · OFFICIAL GUIDE</span>
              <strong>GQH Hardware Track Participant Guide</strong>
              <em>The official guide covers FPGA pickup and drop-off, setting up the Tang Nano 20K, judging and submission.</em>
            </div>
            <div className="hw-files__actions">
              <a className="hw-btn hw-btn--primary" href={PARTICIPANT_GUIDE_URL} target="_blank" rel="noreferrer">
                READ THE GUIDE (PDF)
              </a>
            </div>
          </div>
        </Reveal>

        <div className="hw-story">
          {STORY_LOG.map((entry, index) => (
            <Reveal key={entry.log} delay={index * 90} className={`hw-story__beat ${index === 0 ? 'hw-story__beat--premise' : ''}`}>
              <div className="hw-story__stamp">
                <span>{entry.log}</span>
                <b>{entry.label}</b>
              </div>
              <p className="hw-story__text">{entry.text}</p>
            </Reveal>
          ))}

          <Reveal delay={STORY_LOG.length * 90} className="hw-story__beat hw-story__beat--open">
            <div className="hw-story__stamp">
              <span>THEN</span>
              <b>× 100</b>
            </div>
            <p className="hw-story__text">
              Now do it a hundred times in a row in one official run, with prices moving and either item free to ride in
              either slot. A single timeout ends the run.
            </p>
          </Reveal>

          <Reveal delay={(STORY_LOG.length + 1) * 90} className="hw-story__beat hw-story__beat--task">
            <div className="hw-story__stamp">
              <span>YOUR TASK</span>
              <b>OCT 2–4</b>
            </div>
            <div>
              <p className="hw-story__brief">
                Design, build and program a <strong>trade core in VHDL or Verilog</strong> that obeys the protocol
                exactly, keeps a 16-price moving average for every item, and answers <strong>every packet correctly
                and fast</strong>, in as few LUTs as you can.
              </p>
              <p className="hw-story__fine">
                How you organize the HDL inside is up to you. The organizers supply the board’s pin constraints and two
                Python UART tests, so your weekend goes into the design rather than pin hunting. During the official run
                no team-supplied host software is executed: all UART parsing, state, computation and response
                generation happen on the FPGA.
              </p>
              <p className="hw-story__scope">
                <span>IN SCOPE</span>
                {SCOPE.map((item) => (
                  <em key={item}>{item}</em>
                ))}
              </p>
            </div>
          </Reveal>
        </div>

        <SubHead>KEY TERMS</SubHead>
        <div className="hw-decoded">
          {DECODED.map((card, index) => (
            <Reveal key={card.term} delay={index * 90}>
              <article className="hw-decoded__card">
                <div className="hw-decoded__glyph">{card.glyph}</div>
                <h4>{card.term}</h4>
                <p>{card.plain}</p>
                <p className="hw-decoded__twist">{card.twist}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <div className="hw-split">
          <Reveal>
            <div className="hw-split__col hw-split__col--fixed">
              <h4>THE GUIDE FIXES</h4>
              <ul>
                {FIXED.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="hw-split__col hw-split__col--yours">
              <h4>YOU DESIGN</h4>
              <ul>
                {YOURS.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
        <Reveal>
          <p className="hw-note">
            <span>THE ONE HARD RULE</span>
            Your design must obey the external protocol exactly. Inside the chip, organize it however you like.
          </p>
        </Reveal>
        <Reveal>
          <p className="hw-note hw-note--green">
            <span>MINIMUM VIABLE SUBMISSION</span>
            Receive 8 bytes → decode items A and B → maintain two independent 16-price windows → compute crossings →
            send exactly 8 bytes back → pass 21_quick_uart_test.py → pass 22_robust_uart_test.py.
          </p>
        </Reveal>
      </Chapter>

      <Chapter
        id="hw-board"
        index={2}
        kicker="THE BOARD"
        title="Borrow a Tang Nano 20K"
        lede="Each registered team borrows one FPGA board from the Internet of Things Club on Friday and returns it on Sunday. Every board is checked out and checked back in individually so the club can track its equipment, so treat yours like lab gear."
      >
        <Reveal>
          <div className="hw-loan">
            {LOAN_ENDS.map((end, index) => (
              <div key={end.title} className={`hw-loan__end hw-loan__end--${index === 0 ? 'out' : 'in'}`}>
                <div className="hw-loan__day">{end.day}</div>
                <h4>{end.title}</h4>
                <dl>
                  <div>
                    <dt>TIME</dt>
                    <dd>{end.time}</dd>
                  </div>
                  <div>
                    <dt>WHERE</dt>
                    <dd>{end.where}</dd>
                  </div>
                </dl>
                <p>
                  <span>REQUIRES</span>
                  {end.requirement}
                </p>
              </div>
            ))}
            <div className="hw-loan__track" aria-hidden="true">
              <i />
              <span>BUILD · TEST · SUBMIT</span>
            </div>
          </div>
        </Reveal>

        <SubHead>IF BOARDS RUN SHORT</SubHead>
        <div className="hw-priority">
          {PRIORITY.map((tier, index) => (
            <Reveal key={tier.label} delay={index * 90}>
              <div className="hw-priority__tier" style={{ ['--w' as string]: `${100 - index * 18}%` }}>
                <span className="hw-priority__rank">{index + 1}</span>
                <span className="hw-priority__people" aria-hidden="true">
                  {Array.from({ length: tier.size }, (_, k) => (
                    <i key={k} />
                  ))}
                </span>
                <b>{tier.label}</b>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <p className="hw-note hw-note--cyan">
            <span>TIEBREAK</span>
            Within the same team size, boards go out in the order teams completed sign-up. Teams that don’t receive a
            board are notified by email before the event.
          </p>
        </Reveal>

        <SubHead>AT THE TABLE</SubHead>
        <div className="hw-desk">
          {[
            { title: 'CHECK-OUT · FRIDAY', bringLabel: 'BRING', data: CHECKOUT, tone: 'out' },
            { title: 'CHECK-IN · SUNDAY', bringLabel: 'BEFORE YOU COME', data: CHECKIN, tone: 'in' },
          ].map((desk, index) => (
            <Reveal key={desk.title} delay={index * 120}>
              <article className={`hw-desk__card hw-desk__card--${desk.tone}`}>
                <h4>{desk.title}</h4>
                <div className="hw-desk__bring">
                  <span>{desk.bringLabel}</span>
                  <ul>
                    {desk.data.bring.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <ol>
                  {desk.data.steps.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ol>
              </article>
            </Reveal>
          ))}
        </div>

        <div className="hw-mishaps">
          {MISHAPS.map((item, index) => (
            <Reveal key={item.title} delay={index * 90}>
              <article className="hw-mishap">
                <h4>{item.title}</h4>
                <p>{item.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <p className="hw-note hw-note--red">
            <span>THE LOAN AGREEMENT</span>
            <span>
              Its terms apply to every board, including late returns, damage and replacement costs. Questions about
              pickup or drop-off go to the organizers on{' '}
              <a href={DISCORD_URL} target="_blank" rel="noreferrer">
                Discord
              </a>{' '}
              or <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
            </span>
          </p>
        </Reveal>

        <Reveal>
          <p className="hw-note hw-note--cyan">
            <span>AFTER DROP-OFF</span>
            Judges program each board in SRAM mode with the .fs file from your submitted commit and test it on a single
            judging PC. You don’t keep it powered or connected, and changes pushed after drop-off are not judged.
          </p>
        </Reveal>

        <SubHead>KNOW YOUR BOARD</SubHead>
        <Reveal>
          <BoardMap />
        </Reveal>
      </Chapter>

      <Chapter
        id="hw-toolchain"
        index={3}
        kicker="THE TOOLCHAIN"
        title="From VHDL to a glowing LED"
        lede="You write VHDL or Verilog in Gowin EDA, run Synthesize and Place & Route to get a bitstream (a .fs file) and load it onto the board over USB-C. Get a blinking LED working early and the rest of the weekend gets much easier."
      >
        <Reveal>
          <Toolchain />
        </Reveal>

        <SubHead>FIRST BLINK</SubHead>
        <Reveal>
          <OddCounter />
        </Reveal>
        <Reveal>
          <p className="hw-note hw-note--red">
            <span>WARM-UP ONLY</span>
            This example’s ports (clk, rst0, rst4, led) aren’t in the competition .cst, so it won’t run on the board as
            written. Your competition design must use the fixed port names from the supplied .cst.
          </p>
        </Reveal>

        <SubHead>SRAM PROGRAMMING</SubHead>
        <div className="hw-modes">
          {PROGRAM_MODES.map((mode, index) => (
            <Reveal key={mode.id} delay={index * 120}>
              <article className={`hw-mode hw-mode--${mode.id}`}>
                <div className="hw-mode__chip" aria-hidden="true">
                  <i />
                </div>
                <h4>
                  {mode.title}
                  <em>{mode.sub}</em>
                </h4>
                <dl>
                  {mode.rows.map(([key, value]) => (
                    <div key={key}>
                      <dt>{key}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <p className="hw-note hw-note--cyan">
            <span>JUDGING USES SRAM</span>
            You don’t need to write to external flash. SRAM contents are lost when power is removed, so reprogram after
            every unplug.
          </p>
        </Reveal>

        <SubHead>PLAN B · SIMULATION &amp; PROGRAMMING</SubHead>
        <div className="hw-planb">
          <Reveal>
            <div className="hw-planb__col">
              <h4>SIMULATE WITH</h4>
              <p>
                Recommended, not required. Gowin EDA doesn’t simulate designs, so check your logic with a separate
                simulator and your own testbench before you synthesize.
              </p>
              <ol>
                <li>A university- or company-licensed Siemens Questa installation.</li>
                <li>
                  Questa-Intel FPGA Starter Edition. See Intel’s{' '}
                  <a href="https://www.intel.com/content/www/us/en/support/programmable/licensing/installation-and-licensing.html" target="_blank" rel="noreferrer">
                    installation and licensing
                  </a>{' '}
                  and{' '}
                  <a href="https://www.intel.com/programmable/technical-pdfs/703090.pdf" target="_blank" rel="noreferrer">
                    quick start
                  </a>
                  .
                </li>
                <li>GHDL with GTKWave: free and open source, but not supported by the organizers.</li>
              </ol>
              <p className="hw-planb__warn">Don’t add a simulation-only testbench to the synthesis sources.</p>
              <h4>PROGRAM WITH OPENFPGALOADER</h4>
              <p>
                Only if the Gowin Programmer can’t program the board. Install{' '}
                <a href="https://www.msys2.org/" target="_blank" rel="noreferrer">
                  MSYS2
                </a>
                , open <strong>MSYS2 UCRT64</strong> (not the normal Command Prompt) and run the commands. If MSYS2 asks you
                to close and reopen the terminal, reopen UCRT64 and run <code>pacman -Syu</code> again.
              </p>
              <p className="hw-planb__warn">
                Don’t add <code>-f</code> unless you deliberately want persistent external-flash programming.
              </p>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <CopyBlock text={LOADER_COMMANDS} label="MSYS2 UCRT64" />
          </Reveal>
        </div>

        <SubHead>THE PROGRAMMER CAN’T FIND THE BOARD</SubHead>
        <Reveal>
          <FaultFinder />
        </Reveal>

        <SubHead>FIELD MANUALS</SubHead>
        <div className="hw-manuals">
          {MANUALS.map((manual, index) => (
            <Reveal key={manual.href + manual.label} delay={(index % 4) * 60}>
              <a className="hw-manual" href={manual.href} target="_blank" rel="noreferrer">
                <span>{String(index + 1).padStart(2, '0')}</span>
                {manual.label}
                <i>↗</i>
              </a>
            </Reveal>
          ))}
        </div>
      </Chapter>

      <Chapter
        id="hw-protocol"
        index={4}
        kicker="THE PROTOCOL"
        title="Eight bytes in, eight bytes out"
        lede="The judge talks to your board over UART at 115,200 baud: 8 data bits, no parity, 1 stop bit, least significant bit first. Every request is exactly 8 bytes and so is every response. The guide’s worked example is loaded below; click any byte to see it on the wire."
      >
        <Reveal>
          <PacketScope />
        </Reveal>

        <div className="hw-rules">
          {PROTOCOL_RULES.map((rule, index) => (
            <Reveal key={rule.t} delay={index * 90}>
              <div className="hw-rule">
                <div className="hw-rule__k">{rule.k}</div>
                <div className="hw-rule__t">{rule.t}</div>
                <p>{rule.d}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="hw-codes">
            <span className="hw-codes__title">ITEM IDS · FIXED</span>
            {ITEM_IDS.map((item) => (
              <div key={item.code} className="hw-codes__chip hw-codes__chip--none">
                <b>{item.code}</b>
                {item.name}
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal>
          <div className="hw-codes">
            <span className="hw-codes__title">ACTION CODES</span>
            {ACTION_CODES.map((action) => (
              <div key={action.code} className={`hw-codes__chip hw-codes__chip--${action.tone}`}>
                <b>{action.code}</b>
                {action.name}
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal>
          <p className="hw-note hw-note--red">
            <span>WATCH THE BL616</span>
            The board’s USB-serial bridge can drop or corrupt bytes, and the judge then logs a TIMEOUT, if your design
            sends response bytes back-to-back with no idle time. A design with correct logic can still fail this way, so
            leave idle time or buffering between response bytes. That delay counts toward latency: test with
            22_robust_uart_test.py and keep the CSV.
          </p>
        </Reveal>

        <SubHead>TIME SCALES</SubHead>
        <Reveal>
          <div className="hw-scale">
            <div className="hw-scale__plot">
            <div className="hw-scale__axis" aria-hidden="true">
              {['10 ns', '100 ns', '1 µs', '10 µs', '100 µs', '1 ms', '10 ms', '100 ms', '1 s'].map((tick) => (
                <span key={tick}>{tick}</span>
              ))}
            </div>
            <div className="hw-scale__track">
              {TIME_SCALES.map((item, index) => {
                const position = ((Math.log10(item.seconds) - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100;
                return (
                  <div
                    key={item.label}
                    className={`hw-scale__mark hw-scale__mark--l${item.level}`}
                    style={{ left: `${position}%`, transitionDelay: `${300 + index * 220}ms` }}
                  >
                    <i />
                    <b>{item.value}</b>
                    <span>{item.label}</span>
                    <em>{item.note}</em>
                  </div>
                );
              })}
            </div>
            </div>
            <p>
              Just receiving one request takes about <strong>18,750 clock cycles</strong>, and one whole transaction
              needs only about 1.39 ms of wire time. Yet the reference design measures <strong>about 16.6 ms</strong>{' '}
              per round trip on the judge PC, almost all of it BL616, USB, operating-system and serial-buffering
              overhead. Expect only small latency differences between correct designs.
            </p>
          </div>
        </Reveal>
      </Chapter>

      <Chapter
        id="hw-strategy"
        index={5}
        kicker="THE STRATEGY"
        title="Trade the crossing"
        lede="For every item, the core keeps the last 16 prices and their sum. Indices 0–15 only fill the window and are answered with NONE. From index 16 on, the previous price is checked against the old average and the current price against the new one: up through it is a BUY, down through it is a SELL, and anything else repeats the last action."
      >
        <div className="hw-signals">
          {RULE_CARDS.map((rule, index) => (
            <Reveal key={rule.name} delay={index * 100}>
              <article className={`hw-signal hw-signal--${rule.tone}`}>
                <div className="hw-signal__glyph">{rule.glyph}</div>
                <h4>{rule.name}</h4>
                <code>{rule.cond}</code>
                <p>{rule.text}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="hw-example">
            <div className="hw-example__title">
              <span>THE GUIDE’S EXAMPLE</span>
              <em>ITEM B · AVERAGE = 100</em>
            </div>
            <div className="hw-example__rows">
              {RULE_EXAMPLES.map((row) => (
                <div key={row.note} className={`hw-example__row hw-example__row--${row.action.toLowerCase()}`}>
                  <CrossGlyph before={row.before} now={row.now} action={row.action} />
                  <div className="hw-example__nums">
                    <span>
                      BEFORE <b>{row.before}</b>
                    </span>
                    <span>
                      NOW <b>{row.now}</b>
                    </span>
                  </div>
                  <strong>{row.action}</strong>
                  <em>{row.note}</em>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <SubHead>CROSSING LAB</SubHead>
        <Reveal>
          <CrossingLab />
        </Reveal>

        <div className="hw-gotchas">
          <Reveal>
            <article className="hw-gotcha hw-gotcha--amber">
              <h4>TRACK BY ITEM, NOT BY SLOT</h4>
              <p>
                The tester may place either item in either slot on any packet. Route by item ID, never by packet index
                or slot, and answer in the request’s slot order. Switch the lab to <strong>SLOT ✗</strong> to watch
                the bug happen.
              </p>
            </article>
          </Reveal>
          <Reveal delay={100}>
            <article className="hw-gotcha hw-gotcha--cyan">
              <h4>INDEX 0 = NEW SESSION</h4>
              <p>
                The board isn’t reset or reprogrammed between runs. On index 0, first clear every window, sum, previous
                price and last action, then take index 0’s prices as the first samples of the new window.
              </p>
            </article>
          </Reveal>
          <Reveal delay={200}>
            <article className="hw-gotcha hw-gotcha--red">
              <h4>FLOOR, OLD THEN NEW</h4>
              <p>
                Average = sum &gt;&gt; 4: floor division by 16, fraction discarded, never rounded. The previous price
                meets the old average; the current price meets the new average, which already includes it.
              </p>
            </article>
          </Reveal>
        </div>
      </Chapter>

      <Chapter
        id="hw-core"
        index={6}
        kicker="THE CORE"
        title="One request in, one response out"
        lede="How you organize your HDL is up to you: combine, split or rename modules however you like. If you want a starting point, the guide suggests the breakdown below: serial bytes in, an item router, one moving-average engine per item, serial bytes out. Hover any block to see what it does."
      >
        <Reveal>
          <CoreDiagram />
        </Reveal>

        <div className="hw-supplied">
          <Reveal>
            <article className="hw-supplied__card">
              <h4>SUPPLIED BY THE ORGANIZERS</h4>
              <ul>
                <li>
                  <code>19_tang_nano_20k.cst</code> board pin mappings. Pin discovery isn’t the intended challenge, so
                  it’s handed to you.
                </li>
                <li>
                  <code>21_quick_uart_test.py</code> a quick sanity test of communication and packet format. Run it first.
                </li>
                <li>
                  <code>22_robust_uart_test.py</code> a scoring-style test with a software reference model. Run it
                  second, and keep the CSV of every packet it saves.
                </li>
                <li>
                  Both need Python 3 and pyserial (<code>pip install pyserial</code>). Change only <code>PORT</code>, never
                  the protocol or scoring logic.
                </li>
              </ul>
            </article>
          </Reveal>
          <Reveal delay={100}>
            <article className="hw-supplied__card hw-supplied__card--warn">
              <h4>PROJECT SETUP</h4>
              <ul>
                <li>The UART modules, packet logic and testbenches are yours to write.</li>
                <li>Set Top Module/Entity to your design’s actual top level. The name is up to you.</li>
                <li>Add the supplied .cst as the physical constraint file. No FloorPlanner work needed.</li>
                <li>
                  Top-level port names must match the .cst exactly. Keep unused optional ports in the port list and leave
                  them unconnected; drive an unused LED high.
                </li>
                <li>Never add a simulation-only testbench to the synthesis sources.</li>
              </ul>
            </article>
          </Reveal>
        </div>
      </Chapter>

      <Chapter
        id="hw-judging"
        index={7}
        kicker="JUDGING"
        title="One run, one hundred packets"
        lede="After drop-off, judges program your board from your submitted commit, open its COM port and stream packets at it. Every team faces the same unpublished price seed, so the scores compare directly."
      >
        <Reveal>
          <div className="hw-runs">
            <div className="hw-runs__row">
              <span className="hw-runs__label">RUN</span>
              <div className="hw-runs__cells">
                {Array.from({ length: 100 }, (_, index) => (
                  <i
                    key={index}
                    className={index === 0 ? 'hw-runs__cell--zero' : index < 16 ? 'hw-runs__cell--warm' : ''}
                    style={{ transitionDelay: `${index * 9}ms` }}
                  />
                ))}
              </div>
              <span className="hw-runs__seed">SEED ?</span>
            </div>
            <div className="hw-runs__legend">
              <span>
                <i className="hw-runs__key--zero" /> INDEX 0 · NEW SESSION
              </span>
              <span>
                <i className="hw-runs__key--warm" /> WARM-UP · ANSWER NONE
              </span>
              <span>
                <i /> SCORED PACKET · 16–99
              </span>
            </div>
          </div>
        </Reveal>

        <div className="hw-rules hw-rules--six">
          {RUN_RULES.map((rule, index) => (
            <Reveal key={rule.t} delay={(index % 3) * 90}>
              <div className="hw-rule">
                <div className="hw-rule__k">{rule.k}</div>
                <div className="hw-rule__t">{rule.t}</div>
                <p>{rule.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <p className="hw-note hw-note--green">
            <span>KEEP EVERY CSV</span>
            Keep the CSV from every local run you do. It is your best debugging tool.
          </p>
        </Reveal>

        <SubHead>HOW IT IS SCORED · 100 POINTS</SubHead>
        <Reveal>
          <div className="hw-score">
            {RUBRIC.map((item, index) => (
              <div key={item.label} className="hw-score__row" style={{ ['--w' as string]: `${(item.points / 50) * 100}%` }}>
                <div className="hw-score__points">{item.points}</div>
                <div className="hw-score__body">
                  <div className="hw-score__label">{item.label}</div>
                  <div className="hw-score__bar">
                    <i style={{ transitionDelay: `${250 + index * 140}ms` }} />
                  </div>
                  <p>{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal>
          <p className="hw-note hw-note--cyan">
            <span>READING YOUR LUT COUNT</span>
            After synthesis, double-click Synthesis Report in the Process pane and open Resource → Resource Usage
            Summary. Judging uses the total LUT count, not the LUT2 / LUT3 / LUT4 breakdown.
          </p>
        </Reveal>

        <SubHead>RUN THE NUMBERS</SubHead>
        <Reveal>
          <ScoreSim />
        </Reveal>
      </Chapter>

      <Chapter
        id="hw-submit"
        index={8}
        kicker="THE SUBMISSION"
        title="Freeze it, ship it, return it"
        lede="Devpost is the official submission portal. Each team submits its own GitHub repository there, pinned to one exact commit. Don’t upload your project code to the GQH instructions repository."
      >
        <Reveal>
          <div className="hw-official">
            <div>
              <span>DEVPOST LINK</span>
              <a href={DEVPOST_URL} target="_blank" rel="noreferrer">
                GQHACKS.DEVPOST.COM ↗
              </a>
            </div>
            <div>
              <span>DEADLINE</span>
              <b>SUN OCT 4 · 11:00 AM EDT</b>
            </div>
            <div>
              <span>SUPPORT</span>
              <a href={DISCORD_URL} target="_blank" rel="noreferrer">
                HARDWARE TRACK CHANNEL ↗
              </a>
            </div>
            <div>
              <span>READ FIRST</span>
              <a href={SUBMISSION_GUIDE_URL} target="_blank" rel="noreferrer">
                SUBMISSION GUIDE ↗
              </a>
            </div>
          </div>
        </Reveal>

        <div className="hw-repo">
          <Reveal>
            <article className="hw-repo__card">
              <h4>WHAT GOES IN YOUR REPO</h4>
              <ul>
                {REPO_MUST.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="hw-repo__fine">
                It must be the same project and version you hand in at drop-off. Use the GQH repository only for
                requirements, layout guidance, the README template and the checklist.
              </p>
            </article>
          </Reveal>
          <Reveal delay={120}>
            <pre className="hw-tree" aria-label="Recommended repository layout">
              {REPO_TREE.map(([path, note], index) => (
                <span key={path} className="hw-tree__line" style={{ animationDelay: `${index * 90}ms` }}>
                  <b>{path}</b>
                  {note && <em>{note}</em>}
                </span>
              ))}
            </pre>
          </Reveal>
        </div>

        <SubHead>THE README</SubHead>
        <Reveal>
          <div className="hw-readme">
            <p>It should let a judge understand and reproduce your project without guessing. Include:</p>
            <div className="hw-readme__chips">
              {README_NEEDS.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
            <p className="hw-readme__fine">
              The guide’s reference setup is Gowin EDA V1.9.11.03 Education targeting GW2AR-LV18QN88C8/I7. Document
              your actual final configuration.
            </p>
          </div>
        </Reveal>

        <SubHead>VERIFY, THEN FREEZE</SubHead>
        <div className="hw-freeze">
          <Reveal>
            <div className="hw-preflight">
              <h4>PREFLIGHT</h4>
              <ul>
                {PREFLIGHT.map((item, index) => (
                  <li key={item} style={{ transitionDelay: `${300 + index * 260}ms` }}>
                    <i />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div>
              <FreezeTerminal />
              <p className="hw-freeze__fine">
                The full SHA pins exactly what gets judged. A repository URL alone can keep changing after the deadline.
              </p>
            </div>
          </Reveal>
        </div>

        <div className="hw-access">
          {ACCESS.map((item, index) => (
            <Reveal key={item.title} delay={index * 90}>
              <article className={`hw-access__card hw-access__card--${item.tone}`}>
                <h4>{item.title}</h4>
                <p>{item.text}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <SubHead>ON DEVPOST</SubHead>
        <div className="hw-devpost">
          <Reveal>
            <div className="hw-devpost__copy">
              <p>Your Devpost submission should include or clearly reference:</p>
              <ul>
                <li>Your GitHub repository URL</li>
                <li>The full final Git commit SHA</li>
                <li>A demo video, if required</li>
                <li>The project description and any other required fields</li>
              </ul>
              <p>If Devpost has no field for the SHA, put a block like this in your project description and your README.</p>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <CopyBlock text={`Final GitHub Submission\nRepository:       https://github.com/team-name/project-name\nFinal Commit SHA: ${EXAMPLE_SHA}`} label="EXAMPLE BLOCK" />
          </Reveal>
        </div>

        <SubHead>LAUNCH CHECKLIST</SubHead>
        <Reveal>
          <FinalChecklist />
        </Reveal>

        <Reveal>
          <div className="hw-banner">
            <p>
              Judging is based on the <strong>final commit SHA</strong> in your submission.
            </p>
            <p className="hw-banner__sub">
              Changes pushed after the deadline may not be considered part of the judged submission. Once it’s in, power
              the board down, gather every accessory and return it to Reitz Room 2345 by 11:00 AM.
            </p>
          </div>
        </Reveal>
      </Chapter>

      <section className="hw-final">
        <div className="hw-wrap">
          <Reveal>
            <div className="hw-final__panel">
              <div className="hw-final__traces" aria-hidden="true">
                <i />
                <i />
                <i />
                <i />
              </div>
              <div className="hw-final__kicker">END OF MISSION FILE</div>
              <h2>Ready to put your strategy in silicon?</h2>
              <p>Join the Hardware Track at Gator Quant Hacks, October 2–4, 2026.</p>
              <div className="hw-final__actions">
                <button type="button" className="hw-btn hw-btn--primary" onClick={() => onNavigate?.('apply')}>
                  APPLY NOW →
                </button>
                <a className="hw-btn" href={PARTICIPANT_GUIDE_URL} target="_blank" rel="noreferrer">
                  READ THE GUIDE (PDF)
                </a>
                <button type="button" className="hw-btn" onClick={backToTracks}>
                  ← BACK TO ALL TRACKS
                </button>
              </div>
              <p className="hw-final__fine">
                This page is a plain-language tour of the GQH Hardware Track Participant Guide. Where anything here differs
                from the guide or an organizer announcement, those govern.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function TrackStyles() {
  return (
    <style>{`
      .hw-page {
        position: relative;
        background: #050508;
        color: #F4F4F4;
        font-family: 'Space Mono', monospace;
      }

      .hw-page a { color: #63f6ff; text-decoration: underline; text-underline-offset: 3px; }
      .hw-page a:hover { color: #fff; }

      .hw-page code {
        padding: 0 4px;
        background: rgba(99, 246, 255, 0.08);
        color: #63f6ff;
        font-family: 'Space Mono', monospace;
        font-size: 0.95em;
        white-space: nowrap;
      }

      .hw-wrap {
        position: relative;
        max-width: 1260px;
        margin: 0 auto;
        padding: 0 24px;
      }

      @media (max-width: 640px) {
        .hw-wrap { padding: 0 16px; }
      }

      .hw-in {
        animation: hwIn 700ms cubic-bezier(0.16, 1, 0.3, 1) both;
      }

      /* Hero.tsx and GameModes.tsx define this too, but neither is mounted here. */
      @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
      }

      @keyframes hwIn {
        from { opacity: 0; transform: translateY(16px); }
        to { opacity: 1; transform: none; }
      }

      .hw-back:not(.hw-in),
      .hw-hero__badge:not(.hw-in),
      .hw-hero__signal:not(.hw-in) {
        opacity: 0;
      }

      /* ---------- Boot ---------- */
      .hw-boot {
        position: fixed;
        inset: 0;
        z-index: 9000;
        display: grid;
        place-items: center;
        background: #02040a;
        transition: opacity 450ms ease;
      }

      .hw-boot__screen {
        width: min(520px, calc(100vw - 48px));
        min-height: 170px;
        font-family: 'VT323', monospace;
        font-size: 22px;
        line-height: 1.25;
        color: #4cff87;
        text-shadow: 0 0 10px rgba(76, 255, 135, 0.6);
      }

      .hw-boot__line { animation: hwIn 160ms ease-out both; }

      .hw-boot__bar {
        height: 12px;
        margin: 8px 0;
        border: 1px solid #4cff87;
      }

      .hw-boot__bar i {
        display: block;
        height: 100%;
        background: repeating-linear-gradient(90deg, #4cff87 0 8px, transparent 8px 10px);
        animation: hwBootBar 380ms steps(10) forwards;
      }

      @keyframes hwBootBar {
        from { width: 0; }
        to { width: 100%; }
      }

      .hw-boot__ok {
        color: #FA4616;
        text-shadow: 0 0 12px rgba(250, 70, 22, 0.7);
        animation: blink 0.4s step-end 3;
      }

      .hw-boot--on .hw-boot__screen,
      .hw-boot--out .hw-boot__screen {
        animation: hwCrt 420ms cubic-bezier(0.7, 0, 0.3, 1) forwards;
      }

      @keyframes hwCrt {
        0% { transform: scale(1, 1); filter: brightness(1); }
        45% { transform: scale(1.04, 0.012); filter: brightness(3); }
        100% { transform: scale(0, 0.012); filter: brightness(5); }
      }

      .hw-boot--out { opacity: 0; pointer-events: none; }

      /* ---------- Hero ---------- */
      .hw-hero {
        position: relative;
        min-height: 100vh;
        min-height: 100svh;
        display: flex;
        align-items: center;
        overflow: hidden;
        padding: 128px 0 110px;
        background: #02040a;
      }

      .hw-fabric {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        display: block;
        image-rendering: auto;
      }

      .hw-hero__shade {
        position: absolute;
        inset: 0;
        pointer-events: none;
        background:
          linear-gradient(90deg, rgba(2, 4, 10, 0.94) 0%, rgba(2, 4, 10, 0.72) 40%, rgba(2, 4, 10, 0.05) 68%),
          linear-gradient(180deg, rgba(5, 5, 8, 0) 70%, #050508 100%);
      }

      @media (max-width: 900px) {
        .hw-hero__shade {
          background:
            linear-gradient(180deg, rgba(2, 4, 10, 0.5) 0%, rgba(2, 4, 10, 0.82) 45%, rgba(2, 4, 10, 0.92) 80%, #050508 100%);
        }
      }

      .hw-hero__scan {
        position: absolute;
        inset: 0;
        pointer-events: none;
        opacity: 0.35;
        background: repeating-linear-gradient(0deg, transparent 0 2px, rgba(255, 255, 255, 0.025) 2px 4px);
      }

      .hw-hero__content {
        z-index: 2;
        width: 100%;
      }

      .hw-back {
        display: block;
        margin-bottom: 26px;
        padding: 6px 10px;
        border: 1px solid #294f7d;
        background: rgba(8, 16, 30, 0.8);
        color: #9cc9ff;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 1.5px;
        transition: border-color 150ms ease, color 150ms ease;
      }

      .hw-back:hover { border-color: #FA4616; color: #fff; }

      .hw-hero__badge {
        display: inline-flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 18px;
        padding: 8px 14px 8px 8px;
        border: 1px solid rgba(250, 70, 22, 0.55);
        background: rgba(20, 12, 10, 0.85);
        font-family: 'Orbitron', sans-serif;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 2px;
        color: #ffb38a;
        animation-delay: 80ms;
      }

      .hw-hero__badge em {
        display: block;
        margin-top: 3px;
        font-family: 'Space Mono', monospace;
        font-style: normal;
        font-size: 9px;
        letter-spacing: 1.2px;
        color: #7e90ab;
      }

      .hw-emblem {
        position: relative;
        width: 40px;
        height: 40px;
        flex: none;
      }

      .hw-emblem img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        image-rendering: pixelated;
        filter: drop-shadow(0 0 8px rgba(250, 70, 22, 0.55));
      }

      .hw-emblem i {
        position: absolute;
        inset: -6px;
        border: 1px dashed rgba(250, 70, 22, 0.55);
        border-radius: 50%;
        animation: hwSpin 9s linear infinite;
      }

      .hw-emblem i::after {
        content: '';
        position: absolute;
        top: -3px;
        left: 50%;
        width: 5px;
        height: 5px;
        background: #4cff87;
        box-shadow: 0 0 8px #4cff87;
      }

      @keyframes hwSpin { to { transform: rotate(360deg); } }

      .hw-hero__signal {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 14px;
        font-size: 11px;
        letter-spacing: 1.4px;
        color: #4cff87;
        animation-delay: 160ms;
      }

      .hw-dot {
        display: inline-block;
        flex: none;
        width: 8px;
        height: 8px;
        background: #FA4616;
        box-shadow: 0 0 10px #FA4616;
        animation: blink 1s step-end infinite;
      }

      .hw-dot--green {
        background: #4cff87;
        box-shadow: 0 0 10px #4cff87;
      }

      .hw-hero__title {
        margin: 0 0 26px;
        font-family: 'Press Start 2P', monospace;
        font-weight: 400;
        line-height: 1.15;
        text-transform: uppercase;
      }

      .hw-hero__line {
        display: block;
        white-space: nowrap;
      }

      .hw-hero__line--0 {
        font-size: clamp(14px, 1.9vw, 22px);
        color: #ffb38a;
        margin-bottom: 14px;
      }

      .hw-hero__line--1 {
        font-size: clamp(30px, 6.6vw, 88px);
        color: #fff;
        text-shadow: 0 0 26px rgba(76, 255, 135, 0.3), 5px 5px 0 #0e4a2a;
      }

      .hw-hero__line--2 {
        margin-top: 12px;
        font-size: clamp(22px, 4.8vw, 64px);
        color: #FA4616;
        text-shadow: 0 0 26px rgba(250, 70, 22, 0.4), 4px 4px 0 #3a1003;
      }

      .hw-hero__specs {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin: 0;
        max-width: 620px;
      }

      .hw-hero__specs div {
        padding: 6px 10px;
        border: 1px solid rgba(76, 255, 135, 0.35);
        background: rgba(4, 14, 10, 0.8);
        opacity: 0;
      }

      .hw-hero__specs--in div { animation: hwIn 600ms cubic-bezier(0.16, 1, 0.3, 1) both; }

      .hw-hero__specs dt {
        font-size: 8px;
        font-weight: 700;
        letter-spacing: 1.4px;
        color: #5f8a72;
      }

      .hw-hero__specs dd {
        margin: 0;
        font-family: 'VT323', monospace;
        font-size: 22px;
        line-height: 1;
        color: #c9ffd9;
      }

      .hw-btn {
        padding: 13px 20px;
        border: 2px solid #294f7d;
        background: rgba(8, 16, 30, 0.85);
        color: #F4F4F4;
        font-family: 'Space Mono', monospace;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 1.2px;
        transition: transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease;
      }

      .hw-btn:hover {
        transform: translateY(-2px);
        border-color: #4cff87;
        box-shadow: 0 0 20px rgba(76, 255, 135, 0.25);
      }

      a.hw-btn {
        display: inline-block;
        text-decoration: none;
      }

      .hw-files {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        max-width: 920px;
        margin-bottom: 40px;
        padding: 20px 22px;
        border: 1px solid rgba(76, 255, 135, 0.5);
        background:
          radial-gradient(circle at 0% 50%, rgba(76, 255, 135, 0.1), transparent 55%),
          rgba(7, 13, 26, 0.92);
      }

      .hw-files span { display: block; font-size: 9px; font-weight: 700; letter-spacing: 1.6px; color: #c9ffd9; }
      .hw-files strong { display: block; margin: 6px 0 4px; font-family: 'Orbitron', sans-serif; font-size: clamp(15px, 2vw, 19px); letter-spacing: 1px; color: #fff; }
      .hw-files em { display: block; max-width: 520px; font-style: normal; font-size: 12px; line-height: 1.6; color: #a7b4c9; }
      .hw-files__actions { display: flex; flex-wrap: wrap; gap: 10px; }

      .hw-btn--primary {
        border-color: #044a94;
        background: #FA4616;
        box-shadow: 0 0 22px rgba(250, 70, 22, 0.35), 4px 4px 0 #044a94;
      }

      .hw-btn--primary:hover {
        border-color: #044a94;
        box-shadow: 0 0 30px rgba(250, 70, 22, 0.55), 4px 4px 0 #044a94;
      }

      .hw-hero__live {
        position: absolute;
        right: 24px;
        bottom: 26px;
        z-index: 2;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 9px;
        letter-spacing: 1.3px;
        color: rgba(167, 180, 201, 0.7);
      }

      .hw-hero__cue {
        position: absolute;
        left: 50%;
        bottom: 22px;
        z-index: 2;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        transform: translateX(-50%);
        font-size: 9px;
        letter-spacing: 3px;
        color: #7e90ab;
      }

      .hw-hero__cue i {
        width: 10px;
        height: 10px;
        border-right: 2px solid #4cff87;
        border-bottom: 2px solid #4cff87;
        transform: rotate(45deg);
        animation: hwBob 1.4s ease-in-out infinite;
      }

      @keyframes hwBob {
        0%, 100% { transform: translateY(0) rotate(45deg); opacity: 0.5; }
        50% { transform: translateY(6px) rotate(45deg); opacity: 1; }
      }

      @media (max-width: 900px) {
        .hw-hero__live { display: none; }
      }

      /* ---------- HUD ---------- */
      .hw-hud {
        display: none;
        position: fixed;
        left: 34px;
        top: 50%;
        z-index: 40;
        opacity: 0;
        transform: translate(-10px, -50%);
        pointer-events: none;
        transition: opacity 250ms ease, transform 250ms ease;
      }

      /* Only wide screens have a gutter the rail can sit in without covering copy. */
      @media (min-width: 1280px) {
        .hw-hud { display: block; }
      }

      .hw-hud--on {
        opacity: 1;
        transform: translate(0, -50%);
        pointer-events: auto;
      }

      .hw-hud__main {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        width: 42px;
        padding: 10px 0 12px;
        border: 1px solid #294f7d;
        background: rgba(4, 8, 18, 0.92);
        box-shadow: 0 0 24px rgba(4, 74, 148, 0.3);
      }

      .hw-hud__main:hover { border-color: #4cff87; }

      .hw-hud__count {
        font-family: 'VT323', monospace;
        font-size: 20px;
        line-height: 0.9;
        color: #4cff87;
        text-align: center;
      }

      .hw-hud__count small {
        display: block;
        font-size: 13px;
        color: #5f7390;
      }

      .hw-hud__bar {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .hw-hud__bar i {
        width: 4px;
        height: 16px;
        background: #12233a;
        transition: background 300ms ease, box-shadow 300ms ease;
      }

      .hw-hud__bar .hw-hud__tick--on { background: rgba(76, 255, 135, 0.55); }

      .hw-hud__bar .hw-hud__tick--now {
        background: #FA4616;
        box-shadow: 0 0 8px #FA4616;
      }

      .hw-hud__list {
        position: absolute;
        left: calc(100% + 8px);
        top: 50%;
        display: none;
        margin: 0;
        padding: 6px;
        list-style: none;
        white-space: nowrap;
        transform: translateY(-50%);
        border: 1px solid #294f7d;
        background: rgba(4, 8, 18, 0.96);
        box-shadow: 0 0 24px rgba(4, 74, 148, 0.3);
      }

      .hw-hud:hover .hw-hud__list,
      .hw-hud__list--open {
        display: block;
      }

      .hw-hud__list-title {
        padding: 4px 8px 6px;
        font-family: 'Orbitron', sans-serif;
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 2px;
        color: #FA4616;
      }

      .hw-hud__list button {
        display: flex;
        gap: 10px;
        width: 100%;
        padding: 6px 8px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 1px;
        color: #a7b4c9;
        text-align: left;
      }

      .hw-hud__list button span { color: #5f7390; }
      .hw-hud__list button:hover { color: #fff; background: rgba(76, 255, 135, 0.08); }
      .hw-hud__list .hw-hud__item--on { color: #4cff87; }

      /* ---------- Chapters ---------- */
      .hw-chapter {
        position: relative;
        padding: 110px 0 40px;
        scroll-margin-top: 70px;
      }

      .hw-chapter::before {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(76, 255, 135, 0.45), rgba(250, 70, 22, 0.45), transparent);
      }

      .hw-chapter__head {
        position: relative;
        max-width: 840px;
        margin-bottom: 40px;
      }

      .hw-chapter__ghost {
        position: absolute;
        right: -40px;
        top: -50px;
        font-family: 'Press Start 2P', monospace;
        font-size: clamp(80px, 12vw, 150px);
        line-height: 1;
        color: transparent;
        -webkit-text-stroke: 1px rgba(76, 255, 135, 0.13);
        pointer-events: none;
        user-select: none;
      }

      @media (max-width: 900px) {
        .hw-chapter__ghost { right: 0; top: -30px; }
      }

      .hw-chapter__kicker {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 14px;
        font-family: 'Orbitron', sans-serif;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 3px;
        color: #FA4616;
      }

      .hw-chapter__kicker span {
        padding: 3px 7px;
        border: 1px solid rgba(76, 255, 135, 0.55);
        font-size: 10px;
        letter-spacing: 1.5px;
        color: #4cff87;
      }

      .hw-chapter__title {
        margin: 0 0 16px;
        font-family: 'Orbitron', sans-serif;
        font-size: clamp(28px, 4.4vw, 52px);
        font-weight: 800;
        line-height: 1.04;
        letter-spacing: 1px;
        text-transform: uppercase;
        color: #fff;
        text-shadow: 0 0 30px rgba(250, 70, 22, 0.25);
      }

      .hw-lede {
        margin: 0;
        font-size: clamp(14px, 1.25vw, 16px);
        line-height: 1.8;
        color: #b8c4d6;
      }

      .hw-subhead {
        display: flex;
        align-items: center;
        gap: 14px;
        margin: 64px 0 22px;
      }

      .hw-subhead span {
        flex: 1;
        height: 1px;
        background: linear-gradient(90deg, transparent, #2b5a45);
      }

      .hw-subhead span:last-child {
        background: linear-gradient(90deg, #2b5a45, transparent);
      }

      .hw-subhead h3 {
        margin: 0;
        font-family: 'Orbitron', sans-serif;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 3px;
        color: #9cc9ff;
        text-align: center;
      }

      .hw-note {
        display: flex;
        flex-wrap: wrap;
        gap: 6px 14px;
        align-items: baseline;
        margin: 22px 0 0;
        padding: 14px 16px;
        border-left: 3px solid #FA4616;
        background: rgba(250, 70, 22, 0.06);
        font-size: 13px;
        line-height: 1.7;
        color: #d3dcea;
      }

      .hw-note > span:first-child {
        font-family: 'Orbitron', sans-serif;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 2px;
        color: #FA4616;
        white-space: nowrap;
      }

      .hw-note--cyan { border-color: #63f6ff; background: rgba(99, 246, 255, 0.05); }
      .hw-note--cyan > span:first-child { color: #63f6ff; }
      .hw-note--green { border-color: #4cff87; background: rgba(76, 255, 135, 0.05); }
      .hw-note--green > span:first-child { color: #4cff87; }
      .hw-note--red { border-color: #ff3b5c; background: rgba(255, 59, 92, 0.07); }
      .hw-note--red > span:first-child { color: #ff5a6e; }

      /* ---------- Ch1 ---------- */
      .hw-story {
        --hw-gutter: 150px;
        --hw-spine: calc(var(--hw-gutter) + 24px);
        max-width: 920px;
      }

      .hw-story__beat {
        position: relative;
        display: grid;
        grid-template-columns: var(--hw-gutter) minmax(0, 1fr);
        column-gap: 48px;
        padding-bottom: 34px;
      }

      .hw-story__beat::before {
        content: '';
        position: absolute;
        left: var(--hw-spine);
        top: 0;
        bottom: 0;
        width: 1px;
        background: rgba(76, 255, 135, 0.3);
      }

      .hw-story__beat:first-child::before { top: 10px; }

      .hw-story__beat::after {
        content: '';
        position: absolute;
        left: calc(var(--hw-spine) - 4px);
        top: 6px;
        width: 9px;
        height: 9px;
        background: #4cff87;
        box-shadow: 0 0 10px #4cff87;
      }

      .hw-story__stamp {
        padding-top: 2px;
        text-align: right;
        font-family: 'Orbitron', sans-serif;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 1.8px;
        line-height: 1.7;
      }

      .hw-story__stamp > span {
        display: block;
        color: #5d7596;
      }

      .hw-story__stamp b {
        display: block;
        font-weight: 700;
        color: #4cff87;
      }

      .hw-story__text {
        margin: 0;
        font-size: 15px;
        line-height: 1.75;
        color: #c9d4e4;
      }

      .hw-story__beat--premise .hw-story__text {
        font-size: clamp(16px, 1.5vw, 18px);
        color: #fff;
      }

      .hw-story__beat--open { padding-bottom: 30px; }

      .hw-story__beat--open::before {
        background: linear-gradient(180deg, rgba(76, 255, 135, 0.3), #FA4616 14px);
      }

      .hw-story__beat--open::after {
        background: #FA4616;
        box-shadow: 0 0 12px #FA4616;
        animation: blink 1s step-end infinite;
      }

      .hw-story__beat--open .hw-story__stamp b { color: #FA4616; }

      .hw-story__beat--open .hw-story__text {
        font-family: 'Press Start 2P', monospace;
        font-size: 13px;
        line-height: 1.9;
        color: #fff;
      }

      .hw-story__beat--task { padding-bottom: 0; }

      .hw-story__beat--task::before {
        background: linear-gradient(180deg, #FA4616, rgba(250, 70, 22, 0.35) 70%, transparent);
      }

      .hw-story__beat--task::after { display: none; }

      .hw-story__beat--task .hw-story__stamp > span { color: #FA4616; }
      .hw-story__beat--task .hw-story__stamp b { color: #ffb38a; }

      .hw-story__brief {
        margin: 0 0 16px;
        font-size: clamp(17px, 1.7vw, 21px);
        line-height: 1.65;
        color: #fff;
      }

      .hw-story__brief strong { color: #4cff87; }

      .hw-story__fine {
        margin: 0 0 20px;
        max-width: 640px;
        font-size: 13px;
        line-height: 1.75;
        color: #a7b4c9;
      }

      .hw-story__scope {
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        gap: 4px 0;
        margin: 0;
        font-family: 'Orbitron', sans-serif;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 1.5px;
      }

      .hw-story__scope span {
        margin-right: 14px;
        color: #FA4616;
      }

      .hw-story__scope em {
        font-style: normal;
        color: #9cc9ff;
      }

      .hw-story__scope em:not(:last-child)::after {
        content: '·';
        margin: 0 9px;
        color: #3b5a82;
      }

      @media (max-width: 720px) {
        .hw-story { --hw-spine: 4px; }

        .hw-story__beat {
          grid-template-columns: minmax(0, 1fr);
          row-gap: 8px;
          padding-left: 30px;
        }

        .hw-story__stamp { text-align: left; }
        .hw-story__stamp > span,
        .hw-story__stamp b { display: inline; }
        .hw-story__stamp > span::after { content: ' · '; }
      }

      .hw-decoded {
        display: grid;
        gap: 14px;
      }

      @media (min-width: 640px) { .hw-decoded { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
      @media (min-width: 1100px) { .hw-decoded { grid-template-columns: repeat(4, minmax(0, 1fr)); } }

      .hw-decoded__card {
        height: 100%;
        padding: 18px;
        border: 1px solid rgba(41, 79, 125, 0.8);
        background: rgba(7, 13, 26, 0.92);
        transition: transform 200ms ease, border-color 200ms ease, box-shadow 200ms ease;
      }

      .hw-decoded__card:hover {
        transform: translateY(-4px);
        border-color: #4cff87;
        box-shadow: 0 0 24px rgba(76, 255, 135, 0.15);
      }

      .hw-decoded__glyph {
        display: grid;
        place-items: center;
        min-width: 42px;
        width: fit-content;
        height: 42px;
        padding: 0 6px;
        margin-bottom: 14px;
        border: 2px solid #FA4616;
        font-family: 'Press Start 2P', monospace;
        font-size: 14px;
        color: #FA4616;
        box-shadow: 3px 3px 0 #0e4a2a;
      }

      .hw-decoded__card h4 {
        margin: 0 0 8px;
        font-family: 'Orbitron', sans-serif;
        font-size: 14px;
        font-weight: 700;
        letter-spacing: 2px;
        color: #fff;
      }

      .hw-decoded__card p {
        margin: 0;
        font-size: 13px;
        line-height: 1.65;
        color: #b8c4d6;
      }

      .hw-decoded__card .hw-decoded__twist {
        margin-top: 10px;
        padding-top: 10px;
        border-top: 1px dashed rgba(41, 79, 125, 0.7);
        font-size: 12px;
        color: #ffb38a;
      }

      .hw-split {
        display: grid;
        gap: 14px;
        margin-top: 40px;
      }

      @media (min-width: 768px) { .hw-split { grid-template-columns: 1fr 1fr; } }

      .hw-split__col {
        height: 100%;
        padding: 20px;
        border: 1px solid;
        background: rgba(7, 13, 26, 0.9);
      }

      .hw-split__col--fixed { border-color: rgba(167, 180, 201, 0.35); }
      .hw-split__col--yours { border-color: rgba(250, 70, 22, 0.6); box-shadow: inset 0 0 40px rgba(250, 70, 22, 0.06); }

      .hw-split__col h4 {
        margin: 0 0 14px;
        font-family: 'Orbitron', sans-serif;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 2.5px;
      }

      .hw-split__col--fixed h4 { color: #a7b4c9; }
      .hw-split__col--yours h4 { color: #FA4616; }

      .hw-split__col ul {
        margin: 0;
        padding: 0;
        list-style: none;
        display: grid;
        gap: 9px;
      }

      .hw-split__col li {
        position: relative;
        padding-left: 24px;
        font-size: 13px;
        line-height: 1.6;
        color: #d3dcea;
      }

      .hw-split__col li::before {
        position: absolute;
        left: 0;
        top: 0;
        font-weight: 700;
      }

      .hw-split__col--fixed li::before { content: '■'; color: #5f7390; font-size: 10px; top: 2px; }
      .hw-split__col--yours li::before { content: '▶'; color: #FA4616; font-size: 11px; top: 1px; }

      /* ---------- Ch2 ---------- */
      .hw-loan {
        position: relative;
        display: grid;
        gap: 14px;
      }

      @media (min-width: 860px) {
        .hw-loan { grid-template-columns: minmax(0, 1fr) 160px minmax(0, 1fr); align-items: stretch; }
        .hw-loan__end--in { grid-column: 3; grid-row: 1; }
        .hw-loan__track { grid-column: 2; grid-row: 1; }
      }

      .hw-loan__end--out { order: 0; }
      .hw-loan__track { order: 1; }
      .hw-loan__end--in { order: 2; }

      .hw-loan__end {
        padding: 20px;
        border: 2px solid;
        background: linear-gradient(180deg, rgba(9, 16, 30, 0.97), rgba(4, 8, 18, 0.98));
      }

      .hw-loan__end--out { border-color: #FA4616; box-shadow: 0 0 30px rgba(250, 70, 22, 0.14); }
      .hw-loan__end--in { border-color: #4cff87; box-shadow: 0 0 30px rgba(76, 255, 135, 0.12); }

      .hw-loan__day {
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 1.6px;
        color: #7e90ab;
      }

      .hw-loan__end h4 {
        margin: 4px 0 14px;
        font-family: 'Press Start 2P', monospace;
        font-size: clamp(18px, 2.4vw, 26px);
        font-weight: 400;
      }

      .hw-loan__end--out h4 { color: #FA4616; }
      .hw-loan__end--in h4 { color: #4cff87; }

      .hw-loan__end dl {
        display: grid;
        gap: 8px;
        margin: 0 0 14px;
      }

      .hw-loan__end dl div {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .hw-loan__end dt {
        width: 52px;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 1.4px;
        color: #5f7390;
      }

      .hw-loan__end dd { margin: 0; font-size: 13px; font-weight: 700; letter-spacing: 1px; color: #fff; }

      .hw-loan__end p {
        margin: 0;
        padding-top: 12px;
        border-top: 1px dashed rgba(41, 79, 125, 0.7);
        font-size: 13px;
        line-height: 1.65;
        color: #d3dcea;
      }

      .hw-loan__end p span {
        display: block;
        margin-bottom: 4px;
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 1.5px;
        color: #9cc9ff;
      }

      .hw-loan__track {
        position: relative;
        display: grid;
        place-items: center;
        min-height: 48px;
      }

      .hw-loan__track i {
        position: absolute;
        left: 0;
        right: 0;
        top: 50%;
        height: 4px;
        margin-top: -2px;
        background: linear-gradient(90deg, #FA4616, #ffb84d, #4cff87);
        background-size: 200% 100%;
        animation: hwFlow 2.4s linear infinite;
        box-shadow: 0 0 12px rgba(255, 184, 77, 0.45);
      }

      @keyframes hwFlow {
        from { background-position: 0 0; }
        to { background-position: -200% 0; }
      }

      .hw-loan__track span {
        position: relative;
        transform: translateY(-18px);
        padding: 3px 6px;
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 1.3px;
        color: #ffd27a;
        text-align: center;
      }

      @media (max-width: 859px) {
        .hw-loan__track i { left: 50%; right: auto; top: 0; bottom: 0; width: 4px; height: auto; margin: 0 0 0 -2px; }
        .hw-loan__track span { transform: none; margin-left: 120px; }
      }

      .hw-priority {
        display: grid;
        gap: 8px;
      }

      .hw-priority__tier {
        display: flex;
        align-items: center;
        gap: 14px;
        width: var(--w);
        min-width: min(100%, 280px);
        padding: 10px 14px;
        border: 1px solid rgba(250, 70, 22, 0.55);
        background: linear-gradient(90deg, rgba(250, 70, 22, 0.16), rgba(7, 13, 26, 0.9));
      }

      .hw-priority__rank {
        font-family: 'Press Start 2P', monospace;
        font-size: 16px;
        color: #FA4616;
      }

      .hw-priority__people {
        display: flex;
        gap: 4px;
        width: 64px;
      }

      .hw-priority__people i {
        width: 10px;
        height: 14px;
        background: #ffb38a;
        clip-path: polygon(30% 0, 70% 0, 70% 35%, 100% 35%, 100% 100%, 0 100%, 0 35%, 30% 35%);
      }

      .hw-priority b {
        font-family: 'Orbitron', sans-serif;
        font-size: 12px;
        letter-spacing: 2px;
        color: #fff;
      }

      .hw-desk {
        display: grid;
        gap: 14px;
      }

      @media (min-width: 900px) { .hw-desk { grid-template-columns: 1fr 1fr; } }

      .hw-desk__card {
        height: 100%;
        padding: 20px;
        border: 1px solid rgba(41, 79, 125, 0.9);
        border-top: 3px solid;
        background: rgba(7, 13, 26, 0.95);
      }

      .hw-desk__card--out { border-top-color: #FA4616; }
      .hw-desk__card--in { border-top-color: #4cff87; }

      .hw-desk__card h4 {
        margin: 0 0 14px;
        font-family: 'Orbitron', sans-serif;
        font-size: 14px;
        font-weight: 800;
        letter-spacing: 2px;
        color: #fff;
      }

      .hw-desk__bring {
        margin-bottom: 14px;
        padding: 10px 12px;
        background: rgba(99, 246, 255, 0.05);
        border-left: 2px solid #63f6ff;
      }

      .hw-desk__bring span {
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 1.5px;
        color: #63f6ff;
      }

      .hw-desk__bring ul {
        margin: 6px 0 0;
        list-style: square;
        padding-left: 16px;
        font-size: 12px;
        line-height: 1.6;
        color: #c9d4e4;
      }

      .hw-desk__card ol {
        margin: 0;
        padding: 0;
        list-style: none;
        display: grid;
        gap: 10px;
        counter-reset: desk;
      }

      .hw-desk__card ol li {
        position: relative;
        padding-left: 34px;
        font-size: 13px;
        line-height: 1.6;
        color: #d3dcea;
        counter-increment: desk;
      }

      .hw-desk__card ol li::before {
        content: counter(desk);
        position: absolute;
        left: 0;
        top: 0;
        display: grid;
        place-items: center;
        width: 22px;
        height: 22px;
        border: 1px solid currentColor;
        font-family: 'Press Start 2P', monospace;
        font-size: 9px;
      }

      .hw-desk__card--out ol li::before { color: #FA4616; }
      .hw-desk__card--in ol li::before { color: #4cff87; }

      .hw-mishaps {
        display: grid;
        gap: 14px;
        margin-top: 22px;
      }

      @media (min-width: 900px) { .hw-mishaps { grid-template-columns: repeat(3, minmax(0, 1fr)); } }

      .hw-mishap {
        height: 100%;
        padding: 16px 18px;
        border: 1px solid rgba(41, 79, 125, 0.8);
        border-top: 3px solid #ffb84d;
        background: rgba(7, 13, 26, 0.92);
      }

      .hw-mishap h4 {
        margin: 0 0 8px;
        font-family: 'Orbitron', sans-serif;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 2px;
        color: #ffb84d;
      }

      .hw-mishap p {
        margin: 0;
        font-size: 13px;
        line-height: 1.65;
        color: #b8c4d6;
      }

      /* ---------- Ch3 ---------- */
      .hw-tool {
        padding: 18px;
        border: 1px solid #1d4f83;
        background: linear-gradient(180deg, rgba(7, 13, 26, 0.96), rgba(4, 8, 18, 0.98));
        box-shadow: 0 0 0 3px rgba(5, 11, 23, 0.98), 0 0 36px rgba(4, 74, 148, 0.16);
      }

      .hw-tool__rail {
        position: relative;
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 6px;
        margin-bottom: 18px;
      }

      .hw-tool__line {
        position: absolute;
        left: 10%;
        right: 10%;
        top: 17px;
        height: 2px;
        background: #12233a;
      }

      .hw-tool__line i {
        display: block;
        height: 100%;
        background: linear-gradient(90deg, #FA4616, #4cff87);
        box-shadow: 0 0 10px rgba(76, 255, 135, 0.6);
        transition: width 500ms cubic-bezier(0.16, 1, 0.3, 1);
      }

      .hw-tool__node {
        position: relative;
        display: grid;
        justify-items: center;
        gap: 6px;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 1.4px;
        color: #5f7390;
      }

      .hw-tool__node span {
        display: grid;
        place-items: center;
        width: 36px;
        height: 36px;
        border: 2px solid #294f7d;
        background: #07101d;
        font-family: 'Press Start 2P', monospace;
        font-size: 10px;
        color: #5f7390;
        transition: all 250ms ease;
      }

      .hw-tool__node--done { color: #9cc9ff; }
      .hw-tool__node--done span { border-color: #4cff87; color: #4cff87; }

      .hw-tool__node--on { color: #fff; }

      .hw-tool__node--on span {
        border-color: #FA4616;
        background: #FA4616;
        color: #fff;
        box-shadow: 0 0 18px rgba(250, 70, 22, 0.6);
      }

      .hw-tool__panel {
        display: grid;
        gap: 18px;
        animation: hwIn 400ms cubic-bezier(0.16, 1, 0.3, 1) both;
      }

      @media (min-width: 960px) {
        .hw-tool__panel { grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); }
      }

      .hw-tool__copy h4 {
        margin: 0 0 12px;
        font-family: 'Orbitron', sans-serif;
        font-size: 20px;
        font-weight: 800;
        letter-spacing: 1.2px;
        color: #fff;
      }

      .hw-tool__copy h4 span {
        display: block;
        margin-bottom: 4px;
        font-size: 10px;
        letter-spacing: 2px;
        color: #FA4616;
      }

      .hw-tool__paths {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 12px;
      }

      .hw-page .hw-tool__paths code {
        padding: 4px 8px;
        border: 1px solid rgba(99, 246, 255, 0.35);
        font-size: 11px;
        white-space: normal;
      }

      .hw-tool__copy ul {
        margin: 0;
        padding: 0;
        list-style: none;
        display: grid;
        gap: 9px;
      }

      .hw-tool__copy li {
        position: relative;
        padding-left: 22px;
        font-size: 13px;
        line-height: 1.65;
        color: #d3dcea;
      }

      .hw-tool__copy li::before {
        content: '▶';
        position: absolute;
        left: 0;
        top: 1px;
        font-size: 10px;
        color: #4cff87;
      }

      .hw-page .hw-tool__link {
        display: inline-block;
        margin-top: 14px;
        padding: 7px 12px;
        border: 1px solid #FA4616;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 1.2px;
        color: #fff;
        text-decoration: none;
      }

      .hw-page .hw-tool__link:hover { background: rgba(250, 70, 22, 0.16); }

      .hw-device {
        width: 100%;
        border-collapse: collapse;
        border: 1px solid rgba(76, 255, 135, 0.35);
      }

      .hw-device th,
      .hw-device td {
        padding: 9px 12px;
        border-bottom: 1px dashed rgba(41, 79, 125, 0.6);
        text-align: left;
      }

      .hw-device th {
        width: 40%;
        font-size: 10px;
        letter-spacing: 1.4px;
        color: #5f8a72;
      }

      .hw-device td {
        font-family: 'VT323', monospace;
        font-size: 22px;
        color: #c9ffd9;
      }

      .hw-code {
        margin: 0;
        padding: 14px;
        border: 1px solid rgba(41, 79, 125, 0.7);
        background: #040913;
        font-family: 'Space Mono', monospace;
        font-size: 12px;
        line-height: 1.7;
        color: #9cc9ff;
        overflow-x: auto;
      }

      .hw-pipeline {
        display: grid;
        gap: 8px;
        height: 100%;
        align-content: center;
      }

      .hw-pipeline__stage {
        position: relative;
        overflow: hidden;
        padding: 10px 12px;
        border: 1px solid #294f7d;
        background: #07101d;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 1.5px;
        color: #9cc9ff;
      }

      /* The fill slides in from the left inside the stage's clip rather than
         animating width, so it stays on the compositor. At rest only its 2px
         leading edge shows, as before. */
      .hw-pipeline__stage i {
        position: absolute;
        inset: 0 auto 0 0;
        width: 100%;
        background: rgba(76, 255, 135, 0.14);
        border-right: 2px solid #4cff87;
        transform: translateX(calc(-100% + 2px));
        animation: hwStage 2.2s ease-in-out infinite;
      }

      @keyframes hwStage {
        0% { transform: translateX(calc(-100% + 2px)); opacity: 1; }
        25% { transform: translateX(0); opacity: 1; }
        90% { transform: translateX(0); opacity: 1; }
        100% { transform: translateX(0); opacity: 0; }
      }

      .hw-tool__nav {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        margin-top: 18px;
        padding-top: 14px;
        border-top: 1px dashed rgba(41, 79, 125, 0.7);
      }

      .hw-tool__nav button {
        padding: 8px 12px;
        border: 1px solid #294f7d;
        background: #07101d;
        color: #9cc9ff;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 1.2px;
      }

      .hw-tool__nav button:hover:not(:disabled) { border-color: #4cff87; color: #fff; }
      .hw-tool__nav button:disabled { opacity: 0.3; cursor: not-allowed; }

      @media (max-width: 560px) {
        .hw-tool__node { font-size: 0; }
        .hw-tool__node span { width: 30px; height: 30px; font-size: 9px; }
        .hw-tool__line { top: 14px; }
      }

      .hw-modes {
        display: grid;
        gap: 14px;
      }

      @media (min-width: 900px) { .hw-modes { grid-template-columns: 1fr 1fr; } }

      .hw-mode {
        position: relative;
        height: 100%;
        padding: 20px;
        border: 2px solid;
        background: linear-gradient(180deg, rgba(9, 16, 30, 0.97), rgba(4, 8, 18, 0.98));
      }

      .hw-mode--sram { border-color: #63f6ff; }
      .hw-mode--flash { border-color: #ffb84d; }

      .hw-mode__chip {
        position: absolute;
        right: 18px;
        top: 18px;
        width: 34px;
        height: 34px;
        border: 2px solid currentColor;
      }

      .hw-mode--sram .hw-mode__chip { color: #63f6ff; }
      .hw-mode--flash .hw-mode__chip { color: #ffb84d; }

      .hw-mode__chip i {
        position: absolute;
        inset: 6px;
        background: currentColor;
      }

      .hw-mode--sram .hw-mode__chip i { animation: blink 1.6s step-end infinite; }

      .hw-mode h4 {
        margin: 0 0 14px;
        padding-right: 50px;
        font-family: 'Orbitron', sans-serif;
        font-size: 20px;
        font-weight: 800;
        letter-spacing: 2px;
        color: #fff;
      }

      .hw-mode h4 em {
        display: block;
        margin-top: 4px;
        font-family: 'Space Mono', monospace;
        font-size: 12px;
        font-style: normal;
        font-weight: 400;
        letter-spacing: 0.5px;
        color: #a7b4c9;
      }

      .hw-mode dl { margin: 0; }

      .hw-mode dl div {
        display: grid;
        grid-template-columns: 110px minmax(0, 1fr);
        gap: 12px;
        padding: 8px 0;
        border-top: 1px dashed rgba(41, 79, 125, 0.6);
      }

      .hw-mode dt {
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 1.2px;
        color: #7e90ab;
      }

      .hw-mode dd {
        margin: 0;
        font-size: 12px;
        line-height: 1.6;
        color: #fff;
      }

      .hw-planb {
        display: grid;
        gap: 16px;
      }

      @media (min-width: 960px) { .hw-planb { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); align-items: start; } }

      .hw-planb__col h4 {
        margin: 0 0 10px;
        font-family: 'Orbitron', sans-serif;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 2px;
        color: #9cc9ff;
      }

      .hw-planb__col h4:not(:first-child) { margin-top: 20px; }

      .hw-planb__col ol {
        margin: 0;
        list-style: decimal;
        padding-left: 20px;
        font-size: 13px;
        line-height: 1.7;
        color: #d3dcea;
      }

      .hw-planb__col p {
        margin: 0 0 10px;
        font-size: 13px;
        line-height: 1.7;
        color: #d3dcea;
      }

      .hw-planb__col strong { color: #fff; }

      .hw-planb__col .hw-planb__warn {
        padding: 10px 12px;
        border-left: 2px solid #ffb84d;
        background: rgba(255, 184, 77, 0.06);
        color: #ffe2b0;
      }

      .hw-copy {
        border: 1px solid rgba(76, 255, 135, 0.4);
        background: #030806;
      }

      .hw-copy__bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 6px 10px;
        border-bottom: 1px solid rgba(76, 255, 135, 0.25);
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 1.4px;
        color: #5f8a72;
      }

      .hw-copy__bar button {
        padding: 3px 9px;
        border: 1px solid #4cff87;
        color: #4cff87;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 1px;
      }

      .hw-copy__bar button:hover { background: rgba(76, 255, 135, 0.15); }

      .hw-copy pre {
        margin: 0;
        padding: 14px;
        font-family: 'Space Mono', monospace;
        font-size: 12px;
        line-height: 1.75;
        color: #c9ffd9;
        white-space: pre-wrap;
        word-break: break-word;
      }

      .hw-fault {
        padding: 18px;
        border: 1px solid rgba(255, 59, 92, 0.55);
        background:
          repeating-linear-gradient(135deg, rgba(255, 59, 92, 0.04) 0 10px, transparent 10px 20px),
          rgba(7, 13, 26, 0.95);
      }

      .hw-fault__error {
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        gap: 6px 12px;
        margin-bottom: 16px;
        font-size: 13px;
        color: #ff8a98;
      }

      .hw-fault__error span {
        padding: 2px 7px;
        background: #ff3b5c;
        color: #02040a;
        font-family: 'Orbitron', sans-serif;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 1.5px;
      }

      .hw-fault__error em { font-style: normal; color: #7e90ab; }

      .hw-fault__progress {
        display: flex;
        gap: 4px;
        margin-bottom: 14px;
      }

      .hw-fault__progress i {
        flex: 1;
        height: 6px;
        background: #12233a;
        transition: background 250ms ease;
      }

      .hw-fault__progress .hw-fault__pip--tried { background: rgba(255, 90, 110, 0.55); }

      .hw-fault__progress .hw-fault__pip--now {
        background: #ffb84d;
        box-shadow: 0 0 10px rgba(255, 184, 77, 0.6);
      }

      .hw-fault__step {
        display: grid;
        grid-template-columns: 90px minmax(0, 1fr);
        align-items: center;
        gap: 14px;
        min-height: 64px;
        animation: hwIn 300ms ease-out both;
      }

      .hw-fault__step span {
        font-family: 'Press Start 2P', monospace;
        font-size: 12px;
        color: #ffb84d;
      }

      .hw-fault__step p {
        margin: 0;
        font-size: clamp(14px, 1.4vw, 17px);
        line-height: 1.6;
        color: #fff;
      }

      .hw-fault__actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 14px;
      }

      .hw-fault__actions button,
      .hw-page .hw-fault__actions a,
      .hw-fault__fixed button {
        padding: 8px 12px;
        border: 1px solid #294f7d;
        background: #07101d;
        color: #9cc9ff;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 1.2px;
        text-decoration: none;
      }

      .hw-fault__actions button:hover,
      .hw-fault__fixed button:hover { border-color: #ffb84d; color: #fff; }

      .hw-fault__actions .hw-fault__ok { border-color: #4cff87; color: #4cff87; }
      .hw-fault__actions .hw-fault__ok:hover { background: rgba(76, 255, 135, 0.14); border-color: #4cff87; }

      .hw-fault__fixed { animation: hwIn 350ms ease-out both; }

      .hw-fault__fixed strong {
        display: block;
        font-family: 'Press Start 2P', monospace;
        font-size: 16px;
        color: #4cff87;
        text-shadow: 0 0 14px rgba(76, 255, 135, 0.6);
      }

      .hw-fault__fixed p {
        margin: 10px 0 14px;
        font-size: 13px;
        color: #c9d4e4;
      }

      .hw-manuals {
        display: grid;
        gap: 8px;
      }

      @media (min-width: 640px) { .hw-manuals { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
      @media (min-width: 1100px) { .hw-manuals { grid-template-columns: repeat(4, minmax(0, 1fr)); } }

      .hw-page .hw-manual {
        display: flex;
        align-items: center;
        gap: 10px;
        height: 100%;
        padding: 12px 14px;
        border: 1px solid rgba(41, 79, 125, 0.8);
        background: rgba(7, 13, 26, 0.92);
        font-size: 12px;
        font-weight: 700;
        color: #d3dcea;
        text-decoration: none;
        transition: border-color 150ms ease, transform 150ms ease, color 150ms ease;
      }

      .hw-page .hw-manual:hover { border-color: #4cff87; color: #fff; transform: translateY(-2px); }
      .hw-manual span { font-family: 'VT323', monospace; font-size: 18px; color: #FA4616; }
      .hw-manual i { margin-left: auto; font-style: normal; color: #4cff87; }

      /* ---------- Ch4 ---------- */
      .hw-rules {
        display: grid;
        gap: 12px;
        margin-top: 22px;
      }

      @media (min-width: 900px) { .hw-rules { grid-template-columns: repeat(3, minmax(0, 1fr)); } }

      .hw-rules--six { margin-bottom: 0; }

      .hw-rule {
        height: 100%;
        padding: 14px 16px;
        border: 1px solid rgba(41, 79, 125, 0.8);
        background: rgba(7, 13, 26, 0.92);
        transition: border-color 200ms ease, transform 200ms ease;
      }

      .hw-rule:hover { border-color: #FA4616; transform: translateY(-3px); }

      .hw-rule__k {
        font-family: 'VT323', monospace;
        font-size: 30px;
        line-height: 1;
        color: #4cff87;
      }

      .hw-rule__t {
        margin: 4px 0 6px;
        font-family: 'Orbitron', sans-serif;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 2px;
        color: #fff;
      }

      .hw-rule p {
        margin: 0;
        font-size: 12px;
        line-height: 1.6;
        color: #a7b4c9;
      }

      .hw-codes {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 10px;
        margin-top: 22px;
        padding: 14px 16px;
        border: 1px solid rgba(41, 79, 125, 0.8);
        background: rgba(7, 13, 26, 0.92);
      }

      .hw-codes__title {
        margin-right: 8px;
        font-family: 'Orbitron', sans-serif;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 2px;
        color: #9cc9ff;
      }

      .hw-codes__chip {
        display: flex;
        align-items: baseline;
        gap: 10px;
        padding: 8px 14px;
        border: 2px solid;
        font-family: 'Orbitron', sans-serif;
        font-size: 14px;
        font-weight: 800;
        letter-spacing: 2px;
      }

      .hw-codes__chip b {
        font-family: 'VT323', monospace;
        font-size: 24px;
        font-weight: 400;
        letter-spacing: 0;
      }

      .hw-codes__chip--none { border-color: #9cc9ff; color: #9cc9ff; }
      .hw-codes__chip--sell { border-color: #ff5a6e; color: #ff5a6e; box-shadow: 0 0 16px rgba(255, 90, 110, 0.2); }
      .hw-codes__chip--buy { border-color: #4cff87; color: #4cff87; box-shadow: 0 0 16px rgba(76, 255, 135, 0.2); }

      .hw-scale {
        overflow: hidden;
        padding: 20px 18px 18px;
        border: 1px solid #1d4f83;
        background: linear-gradient(180deg, rgba(7, 13, 26, 0.96), rgba(4, 8, 18, 0.98));
        box-shadow: 0 0 0 3px rgba(5, 11, 23, 0.98), 0 0 36px rgba(4, 74, 148, 0.16);
      }

      .hw-scale__plot { padding: 0 44px; }

      .hw-scale__axis {
        display: flex;
        justify-content: space-between;
        font-size: 9px;
        font-weight: 700;
        color: #3d5577;
      }

      .hw-scale__axis span { width: 0; display: flex; justify-content: center; white-space: nowrap; }

      .hw-scale__track {
        position: relative;
        height: 176px;
        margin: 6px 0 12px;
        border-top: 2px solid #294f7d;
        background: repeating-linear-gradient(90deg, rgba(41, 79, 125, 0.4) 0 1px, transparent 1px 12.5%);
      }

      .hw-scale__mark {
        position: absolute;
        top: 0;
        display: grid;
        justify-items: center;
        width: 120px;
        margin-left: -60px;
        text-align: center;
        opacity: 0;
        transform: translateY(-10px);
        transition: opacity 500ms ease, transform 500ms cubic-bezier(0.16, 1, 0.3, 1);
      }

      .reveal--visible .hw-scale__mark { opacity: 1; transform: none; }

      .hw-scale__mark i {
        width: 2px;
        height: 22px;
        background: #FA4616;
        box-shadow: 0 0 8px #FA4616;
      }

      .hw-scale__mark--l1 i { height: 70px; background: #4cff87; box-shadow: 0 0 8px #4cff87; }
      .hw-scale__mark--l2 i { height: 112px; background: #63f6ff; box-shadow: 0 0 8px #63f6ff; }

      .hw-scale__mark b {
        font-family: 'VT323', monospace;
        font-size: 24px;
        font-weight: 400;
        line-height: 1;
        color: #fff4c8;
      }

      .hw-scale__mark span {
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 1px;
        color: #fff;
      }

      .hw-scale__mark em {
        font-style: normal;
        font-size: 9px;
        color: #7e90ab;
      }

      .hw-scale p {
        margin: 0;
        font-size: 13px;
        line-height: 1.7;
        color: #b8c4d6;
      }

      .hw-scale strong { color: #4cff87; }

      @media (max-width: 700px) {
        .hw-scale__plot { padding: 0 30px; }
        .hw-scale__axis span:nth-child(even) { visibility: hidden; }
        .hw-scale__track { height: 196px; }
        .hw-scale__mark { width: 78px; margin-left: -39px; }
        .hw-scale__mark--l1 i { height: 62px; }
        .hw-scale__mark--l2 i { height: 120px; }
        .hw-scale__mark b { font-size: 18px; }
        .hw-scale__mark em { display: none; }
      }

      /* ---------- Ch5 ---------- */
      .hw-signals {
        display: grid;
        gap: 14px;
      }

      @media (min-width: 900px) { .hw-signals { grid-template-columns: repeat(3, minmax(0, 1fr)); } }

      .hw-signal {
        height: 100%;
        padding: 20px;
        border: 2px solid var(--c);
        background: linear-gradient(180deg, color-mix(in srgb, var(--c) 10%, #070d1a), rgba(4, 8, 18, 0.98));
        box-shadow: 0 0 26px color-mix(in srgb, var(--c) 16%, transparent);
      }

      .hw-signal--buy { --c: #4cff87; }
      .hw-signal--sell { --c: #ff5a6e; }
      .hw-signal--hold { --c: #9cc9ff; }

      .hw-signal__glyph {
        font-family: 'Press Start 2P', monospace;
        font-size: 26px;
        color: var(--c);
        text-shadow: 0 0 14px var(--c);
      }

      .hw-signal h4 {
        margin: 10px 0 10px;
        font-family: 'Orbitron', sans-serif;
        font-size: 24px;
        font-weight: 800;
        letter-spacing: 3px;
        color: var(--c);
      }

      .hw-page .hw-signal code {
        display: block;
        padding: 8px 10px;
        background: rgba(2, 4, 10, 0.7);
        color: #fff;
        font-size: 12px;
        white-space: pre-wrap;
      }

      .hw-signal p {
        margin: 10px 0 0;
        font-size: 13px;
        color: #b8c4d6;
      }

      .hw-example {
        margin-top: 22px;
        padding: 18px;
        border: 1px solid #1d4f83;
        background: rgba(7, 13, 26, 0.95);
      }

      .hw-example__title {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        gap: 4px 16px;
        margin-bottom: 12px;
        font-family: 'Orbitron', sans-serif;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 2px;
        color: #fff;
      }

      .hw-example__title em { font-style: normal; font-size: 10px; color: #63f6ff; }

      .hw-example__rows {
        display: grid;
        gap: 10px;
      }

      @media (min-width: 900px) { .hw-example__rows { grid-template-columns: repeat(3, minmax(0, 1fr)); } }

      .hw-example__row {
        display: grid;
        grid-template-columns: 110px minmax(0, 1fr);
        grid-template-areas: 'glyph nums' 'glyph action' 'glyph note';
        align-items: center;
        column-gap: 12px;
        padding: 10px;
        border: 1px solid rgba(41, 79, 125, 0.6);
        background: #040913;
      }

      .hw-glyph { grid-area: glyph; width: 110px; height: auto; }
      .hw-glyph__avg { stroke: #fff4c8; stroke-dasharray: 4 3; opacity: 0.6; }
      .hw-glyph__label { fill: #7e90ab; font-size: 8px; font-family: 'Space Mono', monospace; }
      .hw-glyph__move { stroke-width: 2.5; stroke-dasharray: 80; stroke-dashoffset: 80; }
      .reveal--visible .hw-glyph__move { animation: hwGlyph 900ms ease-out 300ms forwards; }
      .hw-glyph__now { opacity: 0; }
      .reveal--visible .hw-glyph__now { animation: hwFade 300ms ease-out 1100ms forwards; }

      @keyframes hwGlyph { to { stroke-dashoffset: 0; } }
      @keyframes hwFade { to { opacity: 1; } }

      .hw-example__nums {
        grid-area: nums;
        display: flex;
        gap: 12px;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 1px;
        color: #5f7390;
      }

      .hw-example__nums b {
        font-family: 'VT323', monospace;
        font-size: 22px;
        font-weight: 400;
        color: #fff;
      }

      .hw-example__row strong {
        grid-area: action;
        font-family: 'Orbitron', sans-serif;
        font-size: 18px;
        letter-spacing: 2px;
      }

      .hw-example__row em {
        grid-area: note;
        font-style: normal;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 1.2px;
        color: #7e90ab;
      }

      .hw-example__row--buy strong { color: #4cff87; }
      .hw-example__row--sell strong { color: #ff5a6e; }
      .hw-example__row--hold strong { color: #9cc9ff; }

      .hw-gotchas {
        display: grid;
        gap: 14px;
        margin-top: 22px;
      }

      @media (min-width: 900px) { .hw-gotchas { grid-template-columns: repeat(3, minmax(0, 1fr)); } }

      .hw-gotcha {
        height: 100%;
        padding: 18px;
        border: 1px solid rgba(41, 79, 125, 0.8);
        border-top: 3px solid var(--c);
        background: rgba(7, 13, 26, 0.92);
      }

      .hw-gotcha--amber { --c: #ffb84d; }
      .hw-gotcha--cyan { --c: #63f6ff; }
      .hw-gotcha--red { --c: #ff5a6e; }

      .hw-gotcha h4 {
        margin: 0 0 8px;
        font-family: 'Orbitron', sans-serif;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 2px;
        color: var(--c);
      }

      .hw-gotcha p {
        margin: 0;
        font-size: 13px;
        line-height: 1.65;
        color: #b8c4d6;
      }

      .hw-gotcha strong { color: #fff; }

      /* ---------- Ch6 ---------- */
      .hw-supplied {
        display: grid;
        gap: 14px;
        margin-top: 22px;
      }

      @media (min-width: 900px) { .hw-supplied { grid-template-columns: 1fr 1fr; } }

      .hw-supplied__card {
        height: 100%;
        padding: 20px;
        border: 1px solid rgba(76, 255, 135, 0.5);
        background: rgba(7, 13, 26, 0.95);
      }

      .hw-supplied__card--warn { border-color: rgba(250, 70, 22, 0.6); }

      .hw-supplied__card h4 {
        margin: 0 0 12px;
        font-family: 'Orbitron', sans-serif;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 2px;
        color: #4cff87;
      }

      .hw-supplied__card--warn h4 { color: #FA4616; }

      .hw-supplied__card ul {
        margin: 0;
        padding: 0;
        list-style: none;
        display: grid;
        gap: 10px;
      }

      .hw-supplied__card li {
        position: relative;
        padding-left: 20px;
        font-size: 13px;
        line-height: 1.65;
        color: #d3dcea;
      }

      .hw-supplied__card li::before {
        content: '';
        position: absolute;
        left: 0;
        top: 7px;
        width: 8px;
        height: 8px;
        background: #4cff87;
      }

      .hw-supplied__card--warn li::before { background: #FA4616; }

      /* ---------- Ch7 ---------- */
      .hw-runs {
        padding: 18px;
        border: 1px solid #1d4f83;
        background: linear-gradient(180deg, rgba(7, 13, 26, 0.96), rgba(4, 8, 18, 0.98));
        box-shadow: 0 0 0 3px rgba(5, 11, 23, 0.98), 0 0 36px rgba(4, 74, 148, 0.16);
      }

      .hw-runs__row {
        display: grid;
        grid-template-columns: 60px minmax(0, 1fr) 60px;
        align-items: center;
        gap: 12px;
        padding: 8px 0;
      }

      .hw-runs__label,
      .hw-runs__seed {
        font-family: 'Orbitron', sans-serif;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 1.5px;
        color: #9cc9ff;
      }

      .hw-runs__seed { color: #5f7390; text-align: right; }

      .hw-runs__cells {
        position: relative;
        display: grid;
        grid-template-columns: repeat(100, minmax(0, 1fr));
        gap: 2px;
        height: 22px;
      }

      .hw-runs__cells i {
        background: #12233a;
        transition: background 200ms ease, box-shadow 200ms ease;
      }

      .reveal--visible .hw-runs__cells i { background: rgba(76, 255, 135, 0.6); }
      .reveal--visible .hw-runs__cells .hw-runs__cell--warm { background: rgba(156, 201, 255, 0.35); }
      .reveal--visible .hw-runs__cells .hw-runs__cell--zero { background: #FA4616; box-shadow: 0 0 8px #FA4616; }

      .hw-runs__legend {
        display: flex;
        flex-wrap: wrap;
        gap: 8px 22px;
        margin-top: 10px;
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 1.2px;
        color: #7e90ab;
      }

      .hw-runs__legend span { display: inline-flex; align-items: center; gap: 6px; }
      .hw-runs__legend i { width: 10px; height: 10px; background: rgba(76, 255, 135, 0.6); }
      .hw-runs__legend .hw-runs__key--zero { background: #FA4616; }
      .hw-runs__legend .hw-runs__key--warm { background: rgba(156, 201, 255, 0.35); }

      @media (max-width: 640px) {
        .hw-runs__row { grid-template-columns: 44px minmax(0, 1fr); }
        .hw-runs__seed { display: none; }
        .hw-runs__cells { gap: 1px; }
      }

      .hw-score {
        display: grid;
        gap: 14px;
        padding: 22px;
        border: 1px solid #1d4f83;
        background: linear-gradient(180deg, rgba(7, 13, 26, 0.96), rgba(4, 8, 18, 0.98));
        box-shadow: 0 0 0 3px rgba(5, 11, 23, 0.98), 0 0 36px rgba(4, 74, 148, 0.16);
      }

      .hw-score__row {
        display: grid;
        grid-template-columns: 70px minmax(0, 1fr);
        gap: 16px;
        align-items: start;
      }

      .hw-score__points {
        font-family: 'Press Start 2P', monospace;
        font-size: 26px;
        line-height: 1.2;
        color: #fff4c8;
        text-shadow: 0 0 16px rgba(255, 200, 90, 0.35);
      }

      .hw-score__label {
        font-family: 'Orbitron', sans-serif;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 2px;
        color: #fff;
      }

      .hw-score__bar {
        height: 10px;
        margin: 8px 0;
        background: #0b1830;
        border: 1px solid rgba(41, 79, 125, 0.7);
      }

      .hw-score__bar i {
        display: block;
        height: 100%;
        width: 0;
        background: repeating-linear-gradient(90deg, #4cff87 0 10px, #2bd46a 10px 12px);
        box-shadow: 0 0 12px rgba(76, 255, 135, 0.45);
        transition: width 1200ms cubic-bezier(0.16, 1, 0.3, 1);
      }

      .reveal--visible .hw-score__bar i { width: var(--w); }

      .hw-score__row p {
        margin: 0;
        font-size: 12px;
        line-height: 1.6;
        color: #a7b4c9;
      }

      @media (max-width: 640px) {
        .hw-score__row { grid-template-columns: 48px minmax(0, 1fr); gap: 10px; }
        .hw-score__points { font-size: 18px; }
      }

      /* ---------- Ch8 ---------- */
      .hw-official {
        display: grid;
        gap: 10px;
      }

      @media (min-width: 640px) { .hw-official { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
      @media (min-width: 1100px) { .hw-official { grid-template-columns: repeat(4, minmax(0, 1fr)); } }

      .hw-official div {
        display: grid;
        gap: 8px;
        align-content: start;
        padding: 14px 16px;
        border: 1px solid rgba(41, 79, 125, 0.8);
        background: rgba(7, 13, 26, 0.95);
      }

      .hw-official span {
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 1.6px;
        color: #5f7390;
      }

      .hw-official b {
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 1px;
        color: #fff;
      }

      .hw-page .hw-official a {
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 1px;
        text-decoration: none;
      }

      .hw-repo {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        gap: 16px;
        margin-top: 22px;
      }

      @media (min-width: 960px) { .hw-repo { grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); } }

      .hw-repo__card {
        height: 100%;
        padding: 20px;
        border: 1px solid rgba(99, 246, 255, 0.4);
        background:
          repeating-linear-gradient(180deg, transparent 0 27px, rgba(99, 150, 220, 0.06) 27px 28px),
          rgba(7, 13, 26, 0.95);
        box-shadow: 6px 6px 0 rgba(14, 74, 42, 0.6);
      }

      .hw-repo__card h4 {
        margin: 0 0 12px;
        font-family: 'Orbitron', sans-serif;
        font-size: 14px;
        font-weight: 800;
        letter-spacing: 2px;
        color: #fff;
      }

      .hw-repo__card ul {
        margin: 0;
        padding: 0;
        list-style: none;
        display: grid;
        gap: 8px;
      }

      .hw-repo__card li {
        position: relative;
        padding-left: 22px;
        font-size: 13px;
        line-height: 1.55;
        color: #d3dcea;
      }

      .hw-repo__card li::before {
        content: '+';
        position: absolute;
        left: 0;
        font-weight: 700;
        color: #4cff87;
      }

      .hw-repo__fine {
        margin: 14px 0 0;
        padding-top: 12px;
        border-top: 1px dashed rgba(41, 79, 125, 0.7);
        font-size: 12px;
        line-height: 1.65;
        color: #a7b4c9;
      }

      .hw-tree {
        height: 100%;
        margin: 0;
        overflow-x: auto;
        padding: 18px;
        border: 1px solid rgba(76, 255, 135, 0.4);
        background: #030806;
        font-family: 'Space Mono', monospace;
        font-size: 13px;
        line-height: 2;
        overflow-x: auto;
      }

      .hw-tree__line {
        display: flex;
        gap: 14px;
        opacity: 0;
      }

      .reveal--visible .hw-tree__line { animation: hwIn 400ms ease-out both; }

      .hw-tree__line b { min-width: 150px; font-weight: 700; color: #c9ffd9; }
      .hw-tree__line em { font-style: normal; color: #5f8a72; }

      .hw-readme {
        padding: 20px;
        border: 1px solid #1d4f83;
        background: rgba(7, 13, 26, 0.95);
      }

      .hw-readme p {
        margin: 0 0 14px;
        font-size: 13px;
        line-height: 1.7;
        color: #d3dcea;
      }

      .hw-readme__chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 14px;
      }

      .hw-readme__chips span {
        padding: 5px 9px;
        border: 1px solid rgba(250, 70, 22, 0.45);
        background: rgba(250, 70, 22, 0.06);
        font-size: 11px;
        color: #ffd9c7;
        transition: transform 150ms ease, border-color 150ms ease;
      }

      .hw-readme__chips span:hover { transform: translateY(-2px); border-color: #FA4616; }

      .hw-readme .hw-readme__fine { margin: 0; font-size: 12px; color: #a7b4c9; }

      .hw-freeze {
        display: grid;
        gap: 16px;
      }

      @media (min-width: 960px) { .hw-freeze { grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr); } }

      .hw-preflight {
        height: 100%;
        padding: 20px;
        border: 1px solid rgba(41, 79, 125, 0.9);
        background: rgba(7, 13, 26, 0.95);
      }

      .hw-preflight h4 {
        margin: 0 0 14px;
        font-family: 'Orbitron', sans-serif;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 2px;
        color: #9cc9ff;
      }

      .hw-preflight ul {
        margin: 0;
        padding: 0;
        list-style: none;
        display: grid;
        gap: 10px;
      }

      .hw-preflight li {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 13px;
        color: #7e90ab;
        transition: color 300ms ease;
      }

      .hw-preflight li i {
        flex: none;
        width: 12px;
        height: 12px;
        border: 1px solid #294f7d;
        background: #12233a;
        transition: inherit;
        transition-property: background, box-shadow, border-color;
      }

      .reveal--visible .hw-preflight li { color: #e8eef7; }

      .reveal--visible .hw-preflight li i {
        border-color: #4cff87;
        background: #4cff87;
        box-shadow: 0 0 10px #4cff87;
      }

      .hw-term {
        border: 1px solid rgba(76, 255, 135, 0.4);
        background: #030806;
        box-shadow: 0 0 30px rgba(76, 255, 135, 0.08);
      }

      .hw-term__bar {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 10px;
        border-bottom: 1px solid rgba(76, 255, 135, 0.2);
      }

      .hw-term__bar i { width: 9px; height: 9px; background: #294f7d; }
      .hw-term__bar i:first-child { background: #ff5a6e; }
      .hw-term__bar i:nth-child(2) { background: #ffb84d; }
      .hw-term__bar i:nth-child(3) { background: #4cff87; }

      .hw-term__bar span {
        margin-left: 8px;
        font-size: 10px;
        color: #5f8a72;
      }

      .hw-term__body {
        min-height: 210px;
        padding: 14px;
        font-family: 'Space Mono', monospace;
        font-size: 13px;
        line-height: 1.85;
        color: #c9ffd9;
      }

      .hw-term__line b { color: #4cff87; }

      .hw-term__out {
        display: flex;
        flex-wrap: wrap;
        gap: 4px 12px;
        color: #fff4c8;
        word-break: break-all;
        animation: hwIn 300ms ease-out both;
      }

      .hw-term__out em {
        font-style: normal;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 1.2px;
        color: #FA4616;
        word-break: normal;
      }

      .hw-term__caret {
        display: inline-block;
        width: 8px;
        height: 15px;
        margin-left: 2px;
        vertical-align: -2px;
        background: #4cff87;
        animation: blink 0.8s step-end infinite;
      }

      .hw-freeze__fine {
        margin: 10px 0 0;
        font-size: 12px;
        line-height: 1.65;
        color: #a7b4c9;
      }

      .hw-access {
        display: grid;
        gap: 14px;
        margin-top: 22px;
      }

      @media (min-width: 900px) { .hw-access { grid-template-columns: repeat(3, minmax(0, 1fr)); } }

      .hw-access__card {
        height: 100%;
        padding: 16px 18px;
        border: 1px solid rgba(41, 79, 125, 0.8);
        border-left: 3px solid var(--c);
        background: rgba(7, 13, 26, 0.92);
      }

      .hw-access__card--green { --c: #4cff87; }
      .hw-access__card--cyan { --c: #63f6ff; }
      .hw-access__card--red { --c: #ff5a6e; }

      .hw-access__card h4 {
        margin: 0 0 6px;
        font-family: 'Orbitron', sans-serif;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 2px;
        color: var(--c);
      }

      .hw-access__card p {
        margin: 0;
        font-size: 13px;
        line-height: 1.6;
        color: #b8c4d6;
      }

      .hw-devpost {
        display: grid;
        gap: 16px;
      }

      @media (min-width: 960px) { .hw-devpost { grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr); align-items: start; } }

      .hw-devpost__copy p {
        margin: 0 0 10px;
        font-size: 13px;
        line-height: 1.7;
        color: #d3dcea;
      }

      .hw-devpost__copy ul {
        margin: 0 0 12px;
        list-style: square;
        padding-left: 18px;
        font-size: 13px;
        line-height: 1.75;
        color: #fff;
      }

      .hw-list {
        padding: 20px;
        border: 1px solid #1d4f83;
        background: linear-gradient(180deg, rgba(7, 13, 26, 0.96), rgba(4, 8, 18, 0.98));
        box-shadow: 0 0 0 3px rgba(5, 11, 23, 0.98), 0 0 36px rgba(4, 74, 148, 0.16);
        transition: border-color 400ms ease, box-shadow 400ms ease;
      }

      .hw-list--go {
        border-color: #4cff87;
        box-shadow: 0 0 0 3px rgba(5, 11, 23, 0.98), 0 0 50px rgba(76, 255, 135, 0.25);
      }

      .hw-list__head {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 12px;
        margin-bottom: 10px;
      }

      .hw-list__head span {
        display: block;
        font-family: 'Orbitron', sans-serif;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 2px;
        color: #fff;
      }

      .hw-list__head em {
        font-style: normal;
        font-size: 9px;
        letter-spacing: 1.2px;
        color: #5f7390;
      }

      .hw-list__head strong {
        font-family: 'Press Start 2P', monospace;
        font-size: 24px;
        font-weight: 400;
        color: #4cff87;
      }

      .hw-list__head small { font-size: 12px; color: #5f7390; }

      .hw-list__meter {
        display: flex;
        gap: 3px;
        margin-bottom: 16px;
      }

      .hw-list__meter i {
        flex: 1;
        height: 10px;
        background: #12233a;
        transition: background 250ms ease, box-shadow 250ms ease;
      }

      .hw-list__meter .hw-list__seg--on { background: #4cff87; box-shadow: 0 0 8px rgba(76, 255, 135, 0.6); }

      .hw-list ul {
        display: grid;
        gap: 4px 18px;
        margin: 0;
        padding: 0;
        list-style: none;
      }

      @media (min-width: 900px) { .hw-list ul { grid-template-columns: 1fr 1fr; } }

      .hw-list label {
        position: relative;
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 6px 8px;
        font-size: 13px;
        line-height: 1.5;
        color: #c9d4e4;
        cursor: pointer;
        transition: background 150ms ease, color 150ms ease;
      }

      .hw-list label:hover { background: rgba(76, 255, 135, 0.06); }

      .hw-list input {
        position: absolute;
        opacity: 0;
        pointer-events: none;
      }

      .hw-list__box {
        flex: none;
        position: relative;
        width: 16px;
        height: 16px;
        margin-top: 2px;
        border: 1px solid #4cff87;
      }

      .hw-list input:focus-visible + .hw-list__box { outline: 2px solid #FA4616; outline-offset: 2px; }

      .hw-list__item--on { color: #7e90ab; text-decoration: line-through; text-decoration-color: rgba(76, 255, 135, 0.5); }

      .hw-list__item--on .hw-list__box { background: #4cff87; box-shadow: 0 0 8px rgba(76, 255, 135, 0.6); }

      .hw-list__item--on .hw-list__box::after {
        content: '';
        position: absolute;
        left: 4px;
        top: 0;
        width: 5px;
        height: 10px;
        border-right: 2px solid #02040a;
        border-bottom: 2px solid #02040a;
        transform: rotate(45deg);
      }

      .hw-list__foot {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        margin-top: 14px;
        padding-top: 12px;
        border-top: 1px dashed rgba(41, 79, 125, 0.7);
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 1.2px;
        color: #7e90ab;
      }

      .hw-list__foot button {
        padding: 4px 10px;
        border: 1px solid #294f7d;
        color: #7e90ab;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 1px;
      }

      .hw-list__foot button:hover { border-color: #ff5a6e; color: #fff; }

      .hw-list__go {
        font-family: 'Orbitron', sans-serif;
        font-size: 12px;
        letter-spacing: 2px;
        color: #4cff87;
        animation: blink 0.5s step-end 4;
      }

      .hw-banner {
        margin-top: 22px;
        padding: 24px;
        border: 2px solid #FA4616;
        background:
          repeating-linear-gradient(135deg, rgba(250, 70, 22, 0.06) 0 10px, transparent 10px 20px),
          rgba(7, 13, 26, 0.95);
        text-align: center;
      }

      .hw-banner p {
        margin: 0;
        font-family: 'Press Start 2P', monospace;
        font-size: clamp(11px, 1.4vw, 15px);
        line-height: 1.9;
        color: #fff;
      }

      .hw-banner strong { color: #FA4616; font-weight: 400; }

      .hw-banner .hw-banner__sub {
        max-width: 760px;
        margin: 14px auto 0;
        font-family: 'Space Mono', monospace;
        font-size: 13px;
        line-height: 1.7;
        color: #b8c4d6;
      }

      /* ---------- Final ---------- */
      .hw-final {
        padding: 110px 0 90px;
      }

      .hw-final__panel {
        position: relative;
        overflow: hidden;
        padding: clamp(32px, 6vw, 64px) clamp(20px, 5vw, 56px);
        border: 2px solid #0e4a2a;
        background:
          radial-gradient(circle at 50% 120%, rgba(250, 70, 22, 0.22), transparent 55%),
          radial-gradient(circle at 50% -20%, rgba(76, 255, 135, 0.12), transparent 50%),
          #070c18;
        box-shadow: 0 0 0 3px rgba(5, 11, 23, 0.98), 0 0 60px rgba(14, 74, 42, 0.35);
        text-align: center;
      }

      .hw-final__traces {
        position: absolute;
        inset: 0;
        pointer-events: none;
      }

      .hw-final__traces i {
        position: absolute;
        height: 2px;
        width: 40%;
        background: linear-gradient(90deg, transparent, rgba(76, 255, 135, 0.5), transparent);
        animation: hwTrace 4.5s linear infinite;
      }

      .hw-final__traces i:nth-child(1) { top: 18%; left: -40%; }
      .hw-final__traces i:nth-child(2) { top: 42%; left: -40%; animation-delay: -1.2s; animation-duration: 5.5s; background: linear-gradient(90deg, transparent, rgba(250, 70, 22, 0.5), transparent); }
      .hw-final__traces i:nth-child(3) { top: 68%; left: -40%; animation-delay: -2.6s; }
      .hw-final__traces i:nth-child(4) { top: 86%; left: -40%; animation-delay: -3.4s; animation-duration: 6s; background: linear-gradient(90deg, transparent, rgba(250, 70, 22, 0.45), transparent); }

      @keyframes hwTrace {
        from { transform: translateX(0); }
        to { transform: translateX(350%); }
      }

      .hw-final__kicker {
        position: relative;
        font-family: 'Orbitron', sans-serif;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 3px;
        color: #FA4616;
        margin-bottom: 14px;
      }

      .hw-final h2 {
        position: relative;
        margin: 0 0 16px;
        font-family: 'Press Start 2P', monospace;
        font-size: clamp(16px, 3vw, 34px);
        line-height: 1.4;
        color: #fff;
        text-shadow: 0 0 24px rgba(76, 255, 135, 0.3);
      }

      .hw-final p {
        position: relative;
        max-width: 620px;
        margin: 0 auto 26px;
        font-size: 14px;
        line-height: 1.75;
        color: #b8c4d6;
      }

      .hw-final__actions {
        position: relative;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 12px;
      }

      .hw-final .hw-final__fine {
        margin: 28px auto 0;
        font-size: 10px;
        line-height: 1.6;
        color: #5f7390;
      }

      @media (prefers-reduced-motion: reduce) {
        .hw-in,
        .hw-emblem i,
        .hw-final__traces i,
        .hw-loan__track i,
        .hw-pipeline__stage i,
        .hw-hero__cue i,
        .hw-tool__panel,
        .hw-fault__step {
          animation: none !important;
        }
        .hw-back, .hw-hero__badge, .hw-hero__signal, .hw-hero__specs div, .hw-tree__line { opacity: 1 !important; animation: none !important; }
        .hw-score__bar i { width: var(--w); transition: none; }
        .hw-scale__mark { opacity: 1; transform: none; transition: none; }
        .hw-glyph__move { stroke-dashoffset: 0; animation: none !important; }
        .hw-glyph__now { opacity: 1; animation: none !important; }
      }
    `}</style>
  );
}
