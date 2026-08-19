import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { Code2, ShieldAlert, Cpu, Network, Zap, Download, Lock, Unlock, Mail, Phone, Instagram, Link as LinkIcon, User, Trophy, Crown, Medal, Award, Sparkles, CheckCircle2, Briefcase, Menu, X } from 'lucide-react';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import { PROBLEM_STATEMENTS_CONFIG } from './config/problemStatements';

// ------------------------------------------------------------------
// GLOBAL CONSTANTS & DESIGN TOKENS
// ------------------------------------------------------------------
const BUTTERY_EASE = [0.22, 1, 0.36, 1];

// ------------------------------------------------------------------
// CUSTOM CURSOR
// ------------------------------------------------------------------
const CustomCursor = () => {
  const cursorDotRef = useRef(null);
  const cursorOutlineRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      if (cursorDotRef.current && cursorOutlineRef.current) {
        cursorDotRef.current.style.left = `${clientX}px`;
        cursorDotRef.current.style.top = `${clientY}px`;
        
        cursorOutlineRef.current.animate({
          left: `${clientX}px`,
          top: `${clientY}px`
        }, { duration: 500, fill: "forwards" });
      }
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      if (target.tagName.toLowerCase() === 'a' || target.tagName.toLowerCase() === 'button' || target.closest('a') || target.closest('button')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  return (
    <>
      <div ref={cursorDotRef} className="cursor-dot"></div>
      <div ref={cursorOutlineRef} className={`cursor-outline ${isHovering ? 'cursor-hover' : ''}`}></div>
    </>
  );
};

// ------------------------------------------------------------------
// NEURAL NETWORK BACKGROUND
// ------------------------------------------------------------------
const NeuralBackground = () => {
  const particlesInit = useCallback(async engine => {
    await loadSlim(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        background: { color: { value: "transparent" } },
        fpsLimit: 60,
        interactivity: {
          events: {
            onHover: { enable: true, mode: "grab" },
            resize: true,
          },
          modes: {
            grab: { distance: 150, links: { opacity: 0.5, color: "#00F3FF" } },
          },
        },
        particles: {
          color: { value: ["#00F3FF", "#A855F7", "#FBBF24"] }, // Added yellow as requested
          links: {
            color: "#ffffff",
            distance: 150,
            enable: true,
            opacity: 0.1,
            width: 1,
          },
          move: {
            direction: "none",
            enable: true,
            outModes: { default: "bounce" },
            random: false,
            speed: 1,
            straight: false,
          },
          number: { density: { enable: true, area: 800 }, value: 60 },
          opacity: { value: 0.3 },
          shape: { type: "circle" },
          size: { value: { min: 1, max: 3 } },
        },
        detectRetina: true,
      }}
      className="absolute inset-0 pointer-events-none z-0"
    />
  );
};

// ------------------------------------------------------------------
// NAVIGATION BAR
// ------------------------------------------------------------------
const NavigationBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on resize to desktop view (>= 1200px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1200) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navLinks = [
    { name: 'About', href: '#about' },
    { name: 'Themes', href: '#themes' },
    { name: 'Timeline', href: '#timeline' },
    { name: 'Prizes', href: '#prizes' },
    { name: 'Statements', href: '#problems' },
    { name: 'Sponsors', href: '#sponsors' },
    { name: 'Team', href: '#team' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: BUTTERY_EASE }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || mobileMenuOpen ? 'bg-[#010103]/90 backdrop-blur-md border-b border-white/10 py-2.5 sm:py-3' : 'bg-transparent py-3 sm:py-4 nav:py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-8 flex justify-between items-center w-full">
        {/* Logo */}
        <a href="#" className="flex items-center gap-1.5 sm:gap-2 group z-50 shrink-0">
          <img src="https://codebreakerchallenge2o.vercel.app/logos/cbc2ologo.PNG" alt="CBC 2.0" className="h-8 w-8 sm:h-9 sm:w-9 nav:h-10 nav:w-10 object-contain transition-transform duration-300 group-hover:scale-110" />
          <span className="font-orbitron font-bold text-base sm:text-lg nav:text-xl tracking-wider text-white group-hover:text-[#00F3FF] transition-colors">CBC 2.0</span>
        </a>

        {/* Desktop Nav Links (Expands above 1200px) */}
        <div className="hidden min-[1200px]:flex items-center gap-5 xl:gap-7 font-orbitron text-[11px] tracking-wider transition-all">
          {navLinks.map((link) => (
            <a key={link.name} href={link.href} className="nav-link uppercase whitespace-nowrap">{link.name}</a>
          ))}
        </div>

        {/* Right Controls: Register Button + Mobile Menu Toggle (Toggle visible only below 1200px) */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-[1200px]:gap-4 shrink-0">
          <a href="#" className="relative inline-flex items-center justify-center px-3 sm:px-4 min-[1200px]:px-6 py-1.5 sm:py-2 min-[1200px]:py-2.5 overflow-hidden font-orbitron font-bold text-white bg-[#010103] border border-[#00F3FF] rounded-md hover:bg-[#00F3FF]/10 transition-colors group shadow-[0_0_10px_rgba(0,243,255,0.15)] shrink-0">
            <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-[#00F3FF] rounded-full group-hover:w-56 group-hover:h-56 opacity-10"></span>
            <span className="relative flex items-center gap-1 sm:gap-1.5 min-[1200px]:gap-2 text-[10px] sm:text-[11px] min-[1200px]:text-sm whitespace-nowrap">
              <Zap size={13} className="text-[#00F3FF] min-[1200px]:w-4 min-[1200px]:h-4" /> REGISTER
            </span>
          </a>

          {/* Mobile Menu Toggle (Visible only below 1200px, hidden above 1200px) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="min-[1200px]:hidden p-1.5 sm:p-2 rounded-md bg-[#0a0a0f]/80 border border-white/10 hover:border-[#00F3FF]/50 text-gray-300 hover:text-[#00F3FF] transition-all focus:outline-none shrink-0"
          >
            {mobileMenuOpen ? <X size={18} className="text-[#00F3FF]" /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Collapsible Navigation Menu (Visible only below 1200px when open) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: BUTTERY_EASE }}
            className="min-[1200px]:hidden overflow-hidden bg-[#010103]/95 backdrop-blur-xl border-b border-[#00F3FF]/20"
          >
            <div className="px-5 py-5 flex flex-col gap-2 font-orbitron text-xs tracking-wider max-w-7xl mx-auto">
              {navLinks.map((link, idx) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2.5 px-3 rounded-lg border border-transparent hover:border-[#00F3FF]/30 hover:bg-[#00F3FF]/5 text-gray-300 hover:text-[#00F3FF] transition-all"
                >
                  <span className="uppercase font-bold tracking-widest">{link.name}</span>
                  <span className="text-[10px] text-gray-500 font-mono">0{idx + 1} {'//'}</span>
                </a>
              ))}
              
              <div className="mt-2 pt-3 border-t border-white/10 flex justify-between items-center text-[10px] font-mono text-gray-400">
                <span className="text-gray-500">SYS.NAV // ACTIVE</span>
                <span className="text-[#00F3FF]">CBC 2.0</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

// ------------------------------------------------------------------
// COUNTDOWN TIMER HOOK & COMPONENTS
// ------------------------------------------------------------------
const useCountdown = (targetDateStr) => {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const targetDate = new Date(targetDateStr).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = targetDate - now;
      if (diff > 0) {
        setTimeLeft({
          d: Math.floor(diff / (1000 * 60 * 60 * 24)),
          h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          s: Math.floor((diff % (1000 * 60)) / 1000)
        });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [targetDateStr]);

  return timeLeft;
};

// ------------------------------------------------------------------
// FIXED COUNTDOWN TIMER
// ------------------------------------------------------------------
const FixedTimer = () => {
  const timeLeft = useCountdown(PROBLEM_STATEMENTS_CONFIG.UNLOCK_DATE);

  return (
    <div 
      className="fixed right-0 top-1/2 -translate-y-1/2 z-[9999] pointer-events-auto select-none"
      style={{ position: 'fixed', top: '50%', transform: 'translateY(-50%)', right: 0, zIndex: 9999 }}
    >
      <div className="flex flex-col gap-1 md:gap-2 py-1.5 px-1.5 md:p-3 bg-[#010103]/90 glass-panel rounded-l-lg md:rounded-l-xl border-r-0 border-[#00F3FF]/40 backdrop-blur-md shadow-[-5px_0_20px_rgba(0,243,255,0.15)]">
        <div className="text-[8px] md:text-[10px] font-orbitron font-bold text-[#00F3FF] tracking-widest text-center uppercase mb-0.5 md:mb-1 drop-shadow-[0_0_8px_#00F3FF]" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>T-Minus</div>
        <div className="flex flex-col gap-1 md:gap-2 items-center font-mono">
          <div className="flex flex-col items-center">
            <span className="text-xs md:text-xl font-bold text-white leading-none">{String(timeLeft.d).padStart(2, '0')}</span>
            <span className="text-[7px] md:text-[9px] text-gray-400 uppercase tracking-wider mt-0.5">Days</span>
          </div>
          <div className="w-full h-px bg-white/10" />
          <div className="flex flex-col items-center">
            <span className="text-xs md:text-xl font-bold text-white leading-none">{String(timeLeft.h).padStart(2, '0')}</span>
            <span className="text-[7px] md:text-[9px] text-gray-400 uppercase tracking-wider mt-0.5">Hrs</span>
          </div>
          <div className="w-full h-px bg-white/10" />
          <div className="flex flex-col items-center">
            <span className="text-xs md:text-xl font-bold text-white leading-none">{String(timeLeft.m).padStart(2, '0')}</span>
            <span className="text-[7px] md:text-[9px] text-gray-400 uppercase tracking-wider mt-0.5">Min</span>
          </div>
          <div className="w-full h-px bg-white/10" />
          <div className="flex flex-col items-center">
            <span className="text-xs md:text-xl font-bold text-[#A855F7] animate-pulse leading-none">{String(timeLeft.s).padStart(2, '0')}</span>
            <span className="text-[7px] md:text-[9px] text-[#A855F7] font-semibold uppercase tracking-wider mt-0.5">Sec</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------
// REUSABLE COMPONENTS
// ------------------------------------------------------------------
const TerminalWindow = () => {
  const [text, setText] = useState('');
  const fullText = "> INITIALIZING HACKATHON PROTOCOLS...\n> BYPASSING MAINFRAME FIREWALLS...\n> ACCESS GRANTED.\n> WELCOME TO 2ND VERSE OF CBC 2.0.";
  
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      setText(fullText.slice(0, index));
      index++;
      if (index > fullText.length) clearInterval(timer);
    }, 40);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: BUTTERY_EASE, delay: 0.5 }}
      className="glass-panel w-full max-w-[600px] rounded-lg overflow-hidden mx-auto mt-8 will-change-transform shadow-[0_0_30px_rgba(0,243,255,0.15)]"
    >
      <div className="bg-[#0a0a0f] px-4 py-2 flex items-center border-b border-white/10">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-400-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
        </div>
        <div className="mx-auto text-xs text-gray-400 font-orbitron tracking-wider">root@codebreaker:~</div>
      </div>
      <div className="p-6 text-sm md:text-base text-[#00F3FF] min-h-[120px] text-left leading-relaxed">
        {text.split('\n').map((line, i) => <div key={i}>{line}</div>)}
        <motion.span 
          animate={{ opacity: [1, 0] }} 
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="inline-block w-2 h-4 bg-[#00F3FF] ml-1 align-middle"
        />
      </div>
    </motion.div>
  );
};

const TiltCard = ({ children, className }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={`glass-panel rounded-xl p-8 relative will-change-transform ${className}`}
    >
      <div style={{ transform: "translateZ(30px)" }}>{children}</div>
    </motion.div>
  );
};

// ------------------------------------------------------------------
// PAGE SECTIONS
// ------------------------------------------------------------------
const HeroSection = () => (
  <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-10 px-4 overflow-hidden">
    <NeuralBackground />
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#010103]/50 to-[#010103] pointer-events-none z-0" />

    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.5, ease: BUTTERY_EASE }}
      className="relative z-10 flex flex-wrap justify-center items-center gap-8 mb-10 w-full max-w-4xl"
    >
      <img src="https://www.gat.ac.in/img/main-logo.webp" alt="Global Academy of Technology" className="h-16 md:h-20 object-contain" />
      <div className="h-12 w-[1px] bg-white/20 hidden md:block"></div>
      <img src="https://codebreakerchallenge2o.vercel.app/logos/cbc2ologo.PNG" alt="Code Breaker Challenge 2.0" className="h-16 md:h-20 object-contain" />
      <div className="h-12 w-[1px] bg-white/20 hidden md:block"></div>
      <img src="https://codebreakerchallenge2o.vercel.app/logos/aimldeptlogo.png" alt="Dept of AI & ML" className="h-16 md:h-20 object-contain" />
    </motion.div>

    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5, delay: 0.5, ease: BUTTERY_EASE }}
      className="relative z-10 flex flex-col items-center text-center mb-6"
    >
      <p className="text-gray-400 text-sm md:text-base font-orbitron tracking-[0.2em] uppercase mb-2">
        CTRLCode & Aitron AIML 
      </p>
      <p className="text-gray-400 text-sm md:text-base font-orbitron tracking-[0.2em] uppercase mb-2">
        DEPARTMENT OF ARTIFICIAL INTELLIGENCE & MACHINE LEARNING
      </p>
      <p className="text-gray-500 text-xs md:text-sm font-orbitron tracking-[0.2em] uppercase">
        GLOBAL ACADEMY OF TECHNOLOGY, BENGALURU
      </p>
    </motion.div>

     <p className="text-Purple text-sm md:text-base font-orbitron tracking-[0.2em] uppercase mb-2 relative z-10">
      Hosting Partners
    </p>

    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.5, ease: BUTTERY_EASE }}
      className="relative z-10 flex flex-wrap justify-center items-center gap-8 mb-10 w-full max-w-4xl"
    >
      <img src="https://www.dsedify.com/_next/static/media/edify-logo.9eae1a96.webp" alt="DSEdify" className="h-12 md:h-14 object-contain bg-white/90 p-2 rounded-lg" />
      <div className="h-12 w-[1px] bg-white/20 hidden md:block"></div>
      <img src="https://www.dyashin.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fdyashin.1e17371d.webp&w=3840&q=75" alt="Dyashin" className="h-12 md:h-14 object-contain" />
    </motion.div>

     <p className="text-yellow-400 text-sm md:text-base font-orbitron tracking-[0.4em] uppercase glow-blue mb-1 relative z-10">
      Presents
    </p>

    <div className="relative z-10 text-center w-full mt-4">
      <motion.div
        initial={{ opacity: 0, scale: 1.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: BUTTERY_EASE }}
      >
        <h2 className="text-[#00F3FF] tracking-widest text-sm md:text-base font-orbitron mb-2 uppercase glow-cyan mt-4">
          A National-Level 24-Hour Hackathon
        </h2>
        <h1 className="text-4xl md:text-6xl lg:text-8xl font-black font-orbitron mb-2">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-gray-300">CODE BREAKER</span>
        </h1>
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black font-orbitron text-white mb-6">
          <span className="glitch" data-text="CHALLENGE">CHALLENGE</span> <span className="text-[#FFD700]">2.0</span>
        </h1>
        <div className="flex justify-center items-center gap-4 mb-1">
          <div className="bg-[#00F3FF]/10 border border-[#00F3FF]/30 px-6 py-2 rounded-full inline-block">
            <span className="text-[#00F3FF] font-bold tracking-widest uppercase text-sm font-mono ml-4">The 2nd Verse</span> 
          </div>
          {/* BROCHURE BUTTON */}
          <button className="flex items-center gap-2 px-6 py-2 bg-[#A855F7]/10 border border-[#A855F7]/50 text-[#A855F7] rounded-full hover:bg-[#A855F7]/20 transition-colors font-mono font-bold tracking-widest text-sm uppercase">
            <Download size={16} /> Brochure
          </button>
        </div>
      </motion.div>
    </div>

    <div className="relative z-10 w-full px-4"><TerminalWindow /></div>
  </section>
);

const StatsSection = () => {
  const stats = [
    { num: "24", label: "HOURS" },
    { num: "3", label: "Domains" },
    { num: "60k+", label: "PRIZE POOL" },
    { num: "150+", label: "TEAMS" },
  ];
  return (
    <section className="py-12 border-y border-white/5 bg-[#010103] relative z-10">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1, duration: 0.8 }}
            className="text-center"
          >
            <div className="text-4xl md:text-5xl font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-br from-[#00F3FF] to-[#A855F7] mb-2">{stat.num}</div>
            <div className="text-gray-400 font-mono text-sm tracking-widest">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const AboutSection = () => (
  <section id="about" className="py-24 px-4 relative z-10 overflow-hidden min-h-[60vh] flex items-center justify-center scroll-mt-20">
    <div className="max-w-4xl mx-auto relative z-10 text-center">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1.2, ease: BUTTERY_EASE }}
        className="glass-panel p-8 md:p-16 rounded-3xl shadow-[0_0_50px_rgba(0,243,255,0.05)] border-t border-[#00F3FF]/20"
      >
        <h2 className="text-3xl md:text-5xl font-orbitron font-bold mb-8">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F3FF] to-white">Think.</span>{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-yellow-400">Build.</span>{' '}
          <span className="text-white">Break Limits.</span>
        </h2>
        <p className="text-gray-300 text-lg md:text-xl leading-relaxed font-light mb-6">
          The 2nd Verse of Code Breaker Challenge 2.0 is here. Gather your brightest minds to build solutions that defy conventional boundaries. 
          24 hours to ideate, prototype, and deploy the future of technology.
        </p>
      </motion.div>
    </div>
  </section>
);

const ThemesSection = () => {
  const tracks = [
    { title: "GenAI & LLMs", icon: <Cpu size={40} />, color: "#00F3FF", desc: "Build the next generation of intelligent agents." },
    { title: "Web3 & Blockchain", icon: <Network size={40} />, color: "#A855F7", desc: "Decentralized applications and trustless systems." },
    { title: "IoT & Hardware", icon: <Code2 size={40} />, color: "#00F3FF", desc: "Bridge the gap between physical and digital worlds." },
    { title: "Cybersecurity", icon: <ShieldAlert size={40} />, color: "#22C55E", desc: "Fortify the digital infrastructure of tomorrow." }
  ];

  return (
    <section id="themes" className="py-24 px-4 relative z-10 scroll-mt-20 overflow-hidden">
      <div className="max-w-6xl mx-auto relative">
        <motion.h2 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-4xl md:text-6xl font-orbitron font-bold text-center mb-16 uppercase"
        >
        <span className="text-[#00F3FF] glow-cyan">Domains</span>
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 perspective-[1000px]">
          {tracks.map((track, idx) => (
            <TiltCard key={idx} className="group hover:border-white/30 transition-colors duration-500">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-125"
                style={{ backgroundColor: `${track.color}15`, color: track.color, boxShadow: `0 0 20px ${track.color}40` }}
              >
                {track.icon}
              </div>
              <h3 className="text-2xl font-orbitron font-bold mb-4">{track.title}</h3>
              <p className="text-gray-400">{track.desc}</p>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
};

const PrizesSection = () => {
  const prizes = [
    {
      place: "1st Place",
      title: "Winner",
      isWinner: true,
      amount: "₹30,000",
      themeColor: "#00F3FF",
      accentBg: "from-[#00F3FF]/18 via-[#0077B6]/10 to-[#020617]/95",
      borderColor: "border-[#00F3FF]/70 group-hover:border-[#00F3FF]",
      borderGlow: "shadow-[0_0_30px_rgba(0,243,255,0.25),inset_0_0_20px_rgba(0,243,255,0.1)]",
      badgeBg: "bg-[#00F3FF]/15 text-[#00F3FF] border-[#00F3FF]/40",
      pedestalHeight: "min-[1000px]:h-28 lg:h-36",
      pedestalBg: "from-[#00F3FF]/25 via-[#0077B6]/8 to-[#020617]",
      pedestalBorder: "border-t-2 border-[#00F3FF]/80",
      pedestalGlow: "shadow-[0_-6px_20px_rgba(0,243,255,0.2)]",
      icon: <Trophy className="w-9 h-9 text-[#00F3FF]" />,
      orderClass: "order-1 min-[1000px]:order-2",
      elevationClass: "translate-y-0 min-[1000px]:-translate-y-8 z-20",
      delay: 0.4,
      perks: [
        "Direct Internship & Placement Offer",
        "Official Champion Trophy & Medals",
        "Pre-Placement Assessment (PPA)",
        "Exclusive Winner Swags & Certificate"
      ]
    },
    {
      place: "2nd Place",
      title: "1st Runner Up",
      amount: "₹20,000",
      themeColor: "#00B4D8",
      accentBg: "from-[#00B4D8]/12 via-[#005F73]/5 to-[#020617]/95",
      borderColor: "border-[#00B4D8]/45 group-hover:border-[#00B4D8]/90",
      borderGlow: "shadow-[0_0_20px_rgba(0,180,216,0.16),inset_0_0_15px_rgba(0,180,216,0.06)]",
      badgeBg: "bg-[#00B4D8]/10 text-[#00B4D8] border-[#00B4D8]/30",
      pedestalHeight: "min-[1000px]:h-20 lg:h-24",
      pedestalBg: "from-[#00B4D8]/18 via-[#00B4D8]/4 to-[#020617]",
      pedestalBorder: "border-t border-[#00B4D8]/50",
      pedestalGlow: "shadow-[0_-4px_14px_rgba(0,180,216,0.12)]",
      icon: <Medal className="w-8 h-8 text-[#00B4D8]" />,
      orderClass: "order-2 min-[1000px]:order-1",
      elevationClass: "translate-y-0",
      delay: 0.2,
      perks: [
        "3-Month Internship Opportunity",
        "Pre-Placement Assessment (PPA)",
        "Silver Medals & Podium Trophy",
        "Official Certificate & Swags"
      ]
    },
    {
      place: "3rd Place",
      title: "2nd Runner Up",
      amount: "₹10,000",
      themeColor: "#3B82F6",
      accentBg: "from-[#3B82F6]/10 via-[#1E3A8A]/5 to-[#020617]/95",
      borderColor: "border-[#3B82F6]/40 group-hover:border-[#3B82F6]/80",
      borderGlow: "shadow-[0_0_20px_rgba(59,130,246,0.14),inset_0_0_15px_rgba(59,130,246,0.05)]",
      badgeBg: "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/30",
      pedestalHeight: "min-[1000px]:h-14 lg:h-16",
      pedestalBg: "from-[#3B82F6]/15 via-[#3B82F6]/3 to-[#020617]",
      pedestalBorder: "border-t border-[#3B82F6]/40",
      pedestalGlow: "shadow-[0_-4px_12px_rgba(59,130,246,0.1)]",
      icon: <Award className="w-8 h-8 text-[#3B82F6]" />,
      orderClass: "order-3 min-[1000px]:order-3",
      elevationClass: "translate-y-0",
      delay: 0.6,
      perks: [
        "3-Month Internship Opportunity",
        "Pre-Placement Assessment (PPA)",
        "Bronze Medals & Recognition",
        "Official Certificate & Swags"
      ]
    }
  ];

  return (
    <section id="prizes" className="py-24 px-4 relative z-10 scroll-mt-20 overflow-hidden">
      {/* Background cyber tunnel / binary perspective ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-b from-[#00F3FF]/8 via-[#0077B6]/6 to-transparent blur-[110px] pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto relative">
        {/* Section Title & Poster-Themed Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00F3FF]/10 border border-[#00F3FF]/30 text-xs font-mono text-[#00F3FF] mb-4 uppercase tracking-widest"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#00F3FF]" />
            CASH POOL 60K+ • CODE BREAKER CHALLENGE 2.0
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-orbitron font-black uppercase tracking-wider text-white"
          >
            <span className="text-[#00F3FF] glow-cyan">Prizes</span> & Perks
          </motion.h2>
          <p className="mt-4 text-gray-400 font-mono text-sm max-w-xl mx-auto">
            Organized by Department of AI & ML, Global Academy of Technology. Compete for ₹60,000+ cash bounties, verified trophies, direct placements, and elite industry opportunities.
          </p>
        </div>

        {/* Podium Grid on >= 1000px, Centered Box Column on < 1000px */}
        <div className="flex flex-col items-center gap-6 min-[1000px]:grid min-[1000px]:grid-cols-3 min-[1000px]:items-end min-[1000px]:gap-4 mb-20">
          {prizes.map((prize, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className={`w-full max-w-md min-[1000px]:max-w-none flex flex-col ${prize.orderClass} ${prize.elevationClass} group relative`}
            >
              {/* Subtle radial spotlight behind card */}
              <div 
                className="absolute -top-8 left-1/2 -translate-x-1/2 w-36 h-36 blur-2xl pointer-events-none rounded-full opacity-25 group-hover:opacity-50 transition-opacity duration-500"
                style={{ backgroundColor: `${prize.themeColor}30` }}
              />

              {/* Main Prize Card Block */}
              <div 
                className={`relative bg-gradient-to-b ${prize.accentBg} backdrop-blur-xl border ${prize.borderColor} ${prize.borderGlow} rounded-2xl p-6 md:p-7 flex flex-col justify-between transition-all duration-300 group-hover:scale-[1.02] ${prize.isWinner ? 'min-[1000px]:min-h-[460px]' : 'min-[1000px]:min-h-[420px]'}`}
              >
                {/* Cyber Corner Accents */}
                <div className="absolute top-2 left-2 w-2.5 h-2.5 border-t border-l opacity-50 group-hover:opacity-90 transition-opacity" style={{ borderColor: prize.themeColor }} />
                <div className="absolute top-2 right-2 w-2.5 h-2.5 border-t border-r opacity-50 group-hover:opacity-90 transition-opacity" style={{ borderColor: prize.themeColor }} />
                <div className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b border-l opacity-50 group-hover:opacity-90 transition-opacity" style={{ borderColor: prize.themeColor }} />
                <div className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b border-r opacity-50 group-hover:opacity-90 transition-opacity" style={{ borderColor: prize.themeColor }} />

                {/* Top Badge */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className={`px-3 py-1 rounded-full text-xs font-orbitron font-bold uppercase tracking-wider border ${prize.badgeBg}`}>
                    {prize.place}
                  </div>
                  {prize.isWinner && (
                    <div className="flex items-center gap-1 text-[11px] font-orbitron font-bold text-[#00F3FF] bg-[#00F3FF]/15 border border-[#00F3FF]/40 px-2.5 py-1 rounded-full">
                      <Crown className="w-3.5 h-3.5 text-[#00F3FF]" />
                      CHAMPION
                    </div>
                  )}
                </div>

                {/* Icon & Title */}
                <div className="text-center my-3">
                  <div 
                    className="w-16 h-16 md:w-18 md:h-18 mx-auto rounded-2xl flex items-center justify-center mb-4 transition-transform duration-500 group-hover:scale-105 border"
                    style={{ 
                      backgroundColor: `${prize.themeColor}12`,
                      borderColor: `${prize.themeColor}40`,
                      boxShadow: `0 0 16px ${prize.themeColor}25`
                    }}
                  >
                    {prize.icon}
                  </div>
                  <h3 className="text-lg md:text-xl font-orbitron font-bold text-gray-200 tracking-wide mb-1">
                    {prize.title}
                  </h3>
                  <div 
                    className="text-4xl md:text-5xl font-black font-orbitron tracking-tight my-2"
                    style={{ 
                      color: prize.themeColor,
                      textShadow: `0 0 14px ${prize.themeColor}45`
                    }}
                  >
                    {prize.amount}
                  </div>
                </div>

                {/* Perks Checklist */}
                <div className="border-t border-white/10 pt-4 mt-2">
                  <div className="text-[11px] font-mono uppercase tracking-widest text-gray-400 mb-2.5">
                    Tier Privileges & Rewards
                  </div>
                  <ul className="space-y-2">
                    {prize.perks.map((perk, perkIdx) => (
                      <li key={perkIdx} className="flex items-start gap-2 text-xs font-mono text-gray-300">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: prize.themeColor }} />
                        <span className="leading-snug">{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Stepped Pedestal Block (Visible only on >= 1000px) */}
              <div 
                className={`w-full mt-2 rounded-xl bg-gradient-to-b ${prize.pedestalBg} ${prize.pedestalBorder} ${prize.pedestalGlow} ${prize.pedestalHeight} hidden min-[1000px]:flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-md transition-all duration-300`}
              >
                {/* Cyber Grid Lines inside Pedestal */}
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:12px_12px] opacity-30" />

                {/* Cyber LED Accent Line */}
                <div 
                  className="w-12 h-1 rounded-full opacity-50 group-hover:opacity-90 transition-opacity" 
                  style={{ backgroundColor: prize.themeColor, boxShadow: `0 0 10px ${prize.themeColor}` }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Podium Base Line Stage (Visible only on >= 1000px) */}
        <div className="relative -mt-16 mb-16 hidden min-[1000px]:block">
          <div className="h-[2px] w-full bg-gradient-to-r from-[#00B4D8]/20 via-[#00F3FF]/50 to-[#3B82F6]/20 shadow-[0_0_12px_rgba(0,243,255,0.2)]" />
        </div>

        {/* Perks & Career Fast-Track Banner (Dyashin Partnership) */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }}
          className="relative glass-panel p-8 md:p-10 rounded-2xl border border-[#00F3FF]/20 bg-gradient-to-b from-[#00F3FF]/[0.03] via-white/[0.01] to-[#020617]/95 shadow-[0_10px_40px_rgba(0,0,0,0.6)] overflow-hidden"
        >
          {/* Subtle Ambient Backlight */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#00F3FF]/8 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#0077B6]/8 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/10">
              <div className="flex items-center gap-4 text-left">
                <div className="w-14 h-14 rounded-2xl bg-[#00F3FF]/15 border border-[#00F3FF]/40 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(0,243,255,0.2)]">
                  <Zap className="w-7 h-7 text-[#00F3FF]" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#00F3FF] font-bold tracking-widest uppercase mb-1">
                    <Briefcase className="w-3.5 h-3.5" />
                    In Association With Dyashin • Innovate · Collaborate · Accelerate
                  </div>
                  <h4 className="text-2xl md:text-3xl font-orbitron font-bold text-white">
                    Exclusive Opportunities at Dyashin Technologies
                  </h4>
                </div>
              </div>
              <div className="px-5 py-2.5 rounded-xl bg-[#00F3FF]/10 border border-[#00F3FF]/30 font-mono text-xs text-[#00F3FF] shrink-0">
                Placement & Internship Partner
              </div>
            </div>

            {/* 4 Feature Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-[#00F3FF]/40 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-[#00F3FF]/20 text-[#00F3FF] flex items-center justify-center font-bold font-orbitron text-sm mb-3">
                  01
                </div>
                <h5 className="font-orbitron font-bold text-white text-sm mb-1.5">Direct Placement Offer</h5>
                <p className="text-gray-400 font-mono text-xs leading-relaxed">
                  Winning team members receive direct full-time hiring & engineering onboarding at Dyashin.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-[#00B4D8]/40 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-[#00B4D8]/20 text-[#00B4D8] flex items-center justify-center font-bold font-orbitron text-sm mb-3">
                  02
                </div>
                <h5 className="font-orbitron font-bold text-white text-sm mb-1.5">3-Month Paid Internship</h5>
                <p className="text-gray-400 font-mono text-xs leading-relaxed">
                  Both 1st & 2nd runner-up teams gain hands-on 3-month engineering internship roles.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-[#3B82F6]/40 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/20 text-[#3B82F6] flex items-center justify-center font-bold font-orbitron text-sm mb-3">
                  03
                </div>
                <h5 className="font-orbitron font-bold text-white text-sm mb-1.5">Pre-Placement (PPA)</h5>
                <p className="text-gray-400 font-mono text-xs leading-relaxed">
                  Top performers during the internship qualify for permanent placement offers.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/20 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center font-bold font-orbitron text-sm mb-3">
                  04
                </div>
                <h5 className="font-orbitron font-bold text-white text-sm mb-1.5">Swags & Merit Honors</h5>
                <p className="text-gray-400 font-mono text-xs leading-relaxed">
                  Verified certificates of merit, hackathon kits, medals, and specialized partner perks.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const TimelineSection = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start center", "end center"] });
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const schedule = [
    { time: "15 Aug 2026", title: "Registration Starts", desc: "Form your team and initiate your registration." },
    { time: "02 Oct 2026", title: "Registration Ends", desc: "Last chance to join the ultimate hackathon." },
    { time: "10 Oct 2026", title: "Event Day 1 / Hacking Commences", desc: "Opening keynote, problem statement reveal, and the 24-hour timer starts!" },
    { time: "11 Oct 2026", title: "Event Day 2 / Final Submission", desc: "Stop coding, prepare pitch decks, and present your solutions." }
  ];

  return (
    <section id="timeline" ref={containerRef} className="py-24 px-4 relative z-10 min-h-screen flex items-center scroll-mt-20">
      <div className="max-w-4xl mx-auto w-full relative">
        <h2 className="text-4xl md:text-6xl font-orbitron font-bold text-center mb-24 uppercase">
          Live <span className="text-[#FBBF24] glow[#FBBF24]-">Schedule</span>
        </h2>
        <div className="relative">
          <div className="absolute left-5 md:left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 bg-white/5" />
          <motion.div 
            style={{ height: lineHeight }}
            className="absolute left-5 md:left-1/2 top-0 w-[2px] -translate-x-1/2 bg-gradient-to-b from-[#00F3FF] to-[#A855F7] will-change-transform shadow-[0_0_15px_#A855F7]" 
          />
          {schedule.map((item, idx) => (
            <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group mb-16 last:mb-0 pl-14 md:pl-0">
              <div className="absolute left-5 md:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#010103] border-2 border-white/20 flex items-center justify-center z-10 group-hover:border-[#00F3FF] transition-colors shadow-[0_0_10px_rgba(0,0,0,0)] group-hover:shadow-[0_0_15px_#00F3FF]">
                <div className="w-2.5 h-2.5 rounded-full bg-white/50 group-hover:bg-[#00F3FF] transition-colors" />
              </div>
              <motion.div 
                initial={{ opacity: 0, x: idx % 2 === 0 ? 50 : -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: BUTTERY_EASE }}
                className="w-full md:w-[calc(50%-3rem)] glass-panel p-6 rounded-xl hover:border-[#00F3FF]/30 transition-colors"
              >
                <div className="text-[#00F3FF] text-sm mb-2 font-bold">{item.time}</div>
                <h4 className="text-xl font-orbitron font-bold mb-2">{item.title}</h4>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const RulesSection = () => {
  const rules = [
    "All code and assets must be developed during the 24-hour hackathon period. Pre-existing code is prohibited.",
    "Teams must consist of 2 to 4 members.",
    "Participants must be enrolled university students with a valid ID card.",
    "Plagiarism will result in immediate disqualification.",
    "Use of open-source libraries and APIs is highly encouraged, but must be declared.",
    "Decisions made by the judging panel are final and binding."
  ];

  return (
    <section id="rules" className="py-24 px-4 relative z-10 scroll-mt-20 overflow-hidden">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-orbitron font-bold text-center mb-16 uppercase">
          Rules & <span className="text-white">Regulations</span>
        </h2>
        <div className="glass-panel p-8 md:p-12 rounded-xl">
          <ul className="space-y-6">
            {rules.map((rule, idx) => (
              <li key={idx} className="flex gap-4 items-start group">
                <div className="mt-1 min-w-[24px] h-6 rounded-full bg-[#A855F7]/20 text-[#A855F7] flex items-center justify-center font-bold text-xs border border-[#A855F7]/50 group-hover:bg-[#A855F7] group-hover:text-black transition-colors">
                  {idx + 1}
                </div>
                <p className="text-gray-300 font-mono text-sm md:text-base leading-relaxed group-hover:text-white transition-colors">
                  {rule}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

const ProblemStatementsSection = () => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const unlockDate = new Date(PROBLEM_STATEMENTS_CONFIG.UNLOCK_DATE).getTime();

    const checkLockStatus = () => {
      const now = new Date().getTime();
      if (now >= unlockDate) {
        setIsUnlocked(true);
      } else {
        const diff = unlockDate - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${days}d ${hours}h ${mins}m`);
      }
    };

    checkLockStatus();
    const interval = setInterval(checkLockStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="problems" className="py-24 px-4 relative z-10 scroll-mt-20 border-y border-white/5 bg-[#010103]/50 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-orbitron font-bold text-center mb-16 uppercase">
          Problem <span className="text-[#00F3FF] glow-cyan">Statements</span>
        </h2>

        {!isUnlocked ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-12 text-center rounded-xl max-w-2xl mx-auto border-[#A855F7]/30"
          >
            <Lock size={64} className="mx-auto text-[#A855F7] mb-6" />
            <h3 className="text-2xl font-orbitron font-bold text-white mb-2">Classified Information</h3>
            <p className="text-gray-400 font-mono mb-6">The problem statements are currently encrypted and locked.</p>
            <div className="inline-block bg-[#A855F7]/10 border border-[#A855F7] px-6 py-3 rounded-md">
              <p className="text-[#A855F7] font-mono text-sm tracking-widest uppercase mb-1">Unlocks In:</p>
              <p className="text-2xl font-orbitron font-bold text-white">{timeLeft}</p>
            </div>
            <p className="text-xs text-gray-500 font-mono mt-4">Scheduled for: {new Date(PROBLEM_STATEMENTS_CONFIG.UNLOCK_DATE).toLocaleString()}</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="col-span-full flex justify-center mb-4">
              <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/50 text-green-500 px-4 py-2 rounded-full font-mono text-xs uppercase tracking-widest">
                <Unlock size={14} /> Decrypted & Live
              </div>
            </div>
            {PROBLEM_STATEMENTS_CONFIG.STATEMENTS.map((stmt, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                className="glass-panel p-8 rounded-xl border border-white/10 hover:border-[#00F3FF]/50 transition-colors">
                <div className="text-xs text-[#00F3FF] font-mono uppercase tracking-widest mb-2 border border-[#00F3FF]/30 inline-block px-2 py-1 rounded">{stmt.domain}</div>
                <h3 className="text-xl font-orbitron font-bold text-white mb-4">{stmt.title}</h3>
                <p className="text-gray-400 font-mono text-sm leading-relaxed">{stmt.description}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// 3-Layer Stack Sponsors
const SponsorsSection = () => {
  const foodSponsors = ["Food Partner 1", "Food Partner 2"];
  const technicalSponsors = ["Tech Partner 1", "Tech Partner 2"];
  const supportSponsors = ["Support 1", "Support 2"];

  return (
    <section id="sponsors" className="py-24 px-4 relative z-10 scroll-mt-20 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-orbitron font-bold text-center mb-16 uppercase">
          Our <span className="text-gray-400">Sponsors</span>
        </h2>

        <div className="flex flex-col gap-16">
          {/* Layer 1: Title Sponsor */}
          <div className="text-center">
            <h3 className="text-sm font-mono text-[#FBBF24] tracking-[0.2em] uppercase mb-6">Title Sponsors</h3>
            <div className="flex justify-center items-center gap-8 flex-wrap">
              <div className="glass-panel w-64 h-32 rounded-xl flex items-center justify-center text-gray-500 hover:text-white transition-colors border-[#FBBF24]/30 shadow-[0_0_20px_rgba(251,191,36,0.1)]">Title Placeholder 1</div>
            </div>
          </div>

          {/* Layer 2: Co-Sponsors */}
          <div className="text-center">
            <h3 className="text-sm font-mono text-[#00F3FF] tracking-[0.2em] uppercase mb-6">Co-Sponsors</h3>
            <div className="flex justify-center items-center gap-6 flex-wrap">
              <div className="glass-panel w-48 h-24 rounded-lg flex items-center justify-center text-gray-500 hover:text-white transition-colors">Co-Sponsor 1</div>
              <div className="glass-panel w-48 h-24 rounded-lg flex items-center justify-center text-gray-500 hover:text-white transition-colors">Co-Sponsor 2</div>
              <div className="glass-panel w-48 h-24 rounded-lg flex items-center justify-center text-gray-500 hover:text-white transition-colors">Co-Sponsor 3</div>
            </div>
          </div>

          {/* Layer 3: 3 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-white/5 pt-12">
            {/* Food Sponsors */}
            <div className="text-center">
              <h3 className="text-xs font-mono text-gray-400 tracking-[0.1em] uppercase mb-4">Food Sponsors</h3>
              <div className="flex flex-col gap-4 items-center">
                {foodSponsors.map((s, i) => (
                  <div key={i} className="glass-panel w-full max-w-[200px] h-16 rounded flex items-center justify-center text-gray-500 text-sm">{s}</div>
                ))}
              </div>
            </div>
            {/* Technical Sponsors */}
            <div className="text-center">
              <h3 className="text-xs font-mono text-gray-400 tracking-[0.1em] uppercase mb-4">Technical Sponsors</h3>
              <div className="flex flex-col gap-4 items-center">
                {technicalSponsors.map((s, i) => (
                  <div key={i} className="glass-panel w-full max-w-[200px] h-16 rounded flex items-center justify-center text-gray-500 text-sm">{s}</div>
                ))}
              </div>
            </div>
            {/* Support Sponsors */}
            <div className="text-center">
              <h3 className="text-xs font-mono text-gray-400 tracking-[0.1em] uppercase mb-4">Support Sponsors</h3>
              <div className="flex flex-col gap-4 items-center">
                {supportSponsors.map((s, i) => (
                  <div key={i} className="glass-panel w-full max-w-[200px] h-16 rounded flex items-center justify-center text-gray-500 text-sm">{s}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const TeamTiltCard = ({ member, index, isAllSelected }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 450, damping: 28 });
  const mouseYSpring = useSpring(y, { stiffness: 450, damping: 28 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);
  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ["0%", "100%"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      layout={!isAllSelected}
      initial={{ opacity: 0, y: 25, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: 15, transition: { duration: 0.15 } }}
      transition={{ 
        duration: 0.4, 
        delay: isAllSelected ? 0 : index * 0.05, 
        ease: [0.22, 1, 0.36, 1] 
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="w-[240px] sm:w-[260px] flex-shrink-0 glass-panel p-5 rounded-2xl border border-white/10 hover:border-[#00F3FF]/60 transition-colors duration-200 group flex flex-col justify-between relative overflow-hidden bg-gradient-to-b from-white/[0.03] via-[#040D1A]/60 to-[#010103]/95 hover:shadow-[0_10px_35px_rgba(0,243,255,0.18)] will-change-transform perspective-[1000px] select-none"
    >
      {/* Holographic Sheen Reflection */}
      <motion.div
        style={{
          background: `radial-gradient(circle at ${glareX} ${glareY}, rgba(0, 243, 255, 0.15), transparent 70%)`,
        }}
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
      />

      {/* Biometric Laser Scanline Sweep on Hover */}
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden z-20">
        <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00F3FF] to-transparent shadow-[0_0_12px_#00F3FF] animate-laser" />
      </div>

      {/* Cyber Corner HUD Brackets */}
      <div className="absolute top-2 left-2 w-2.5 h-2.5 border-t-2 border-l-2 border-white/20 group-hover:border-[#00F3FF] transition-colors" />
      <div className="absolute top-2 right-2 w-2.5 h-2.5 border-t-2 border-r-2 border-white/20 group-hover:border-[#00F3FF] transition-colors" />
      <div className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b-2 border-l-2 border-white/20 group-hover:border-[#00F3FF] transition-colors" />
      <div className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b-2 border-r-2 border-white/20 group-hover:border-[#00F3FF] transition-colors" />

      {/* Card Content */}
      <div style={{ transform: "translateZ(25px)" }} className="relative z-30 flex flex-col h-full justify-between">
        {/* Badge & Active Pulse */}
        <div className="flex items-center justify-between mb-3">
          <span 
            className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border tracking-wider"
            style={{ 
              color: member.color,
              borderColor: `${member.color}40`,
              backgroundColor: `${member.color}12` 
            }}
          >
            {member.badge}
          </span>
          <span className="flex h-2 w-2 relative" title="Verified Active">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00F3FF] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00F3FF]"></span>
          </span>
        </div>

        {/* Photo Placeholder Frame */}
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 mx-auto my-2 rounded-2xl overflow-hidden border border-white/15 group-hover:border-[#00F3FF]/70 transition-all duration-300 flex items-center justify-center bg-[#070D17]/90 shadow-[0_0_20px_rgba(0,0,0,0.6)]">
          {/* Cyber matrix background lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#00F3FF0d_1px,transparent_1px),linear-gradient(to_bottom,#00F3FF0d_1px,transparent_1px)] bg-[size:8px_8px] pointer-events-none" />
          
          {member.image ? (
            <img src={member.image} alt={member.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-2 z-10">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-1.5 transition-transform duration-300 group-hover:scale-110"
                style={{ 
                  backgroundColor: `${member.color}18`,
                  border: `1px solid ${member.color}50`,
                  boxShadow: `0 0 16px ${member.color}25`
                }}
              >
                <User size={24} style={{ color: member.color }} />
              </div>
              <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest font-semibold">
                PHOTO
              </span>
            </div>
          )}

          {/* Holographic corner ticks inside photo frame */}
          <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 border-t border-l border-[#00F3FF]/50" />
          <div className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 border-b border-r border-[#00F3FF]/50" />
        </div>

        {/* Member Name & Designation */}
        <div className="text-center mt-3" style={{ transform: "translateZ(18px)" }}>
          <h4 className="text-base font-orbitron font-bold text-white group-hover:text-[#00F3FF] transition-colors tracking-wide truncate">
            {member.name}
          </h4>
          <p 
            className="text-xs font-mono font-semibold mt-1 tracking-wide"
            style={{ color: member.color }}
          >
            {member.role}
          </p>
          <p className="text-[10px] font-mono text-gray-500 mt-0.5 uppercase tracking-widest truncate">
            {member.dept || "Dept. of AI & ML, GAT"}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const TeamSection = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [animCycle, setAnimCycle] = useState(0);
  const [isScanning, setIsScanning] = useState(false);

  const categories = [
    { id: "all", label: "All Crew" },
    { id: "leads", label: "Core Leads" },
    { id: "faculty", label: "Faculty Mentors" },
    { id: "tech", label: "Tech & Dev" },
    { id: "ops", label: "Operations & PR" },
  ];

  const teamMembers = [
    {
      name: "Vinayaka S",
      role: "Lead Organizer",
      category: "leads",
      badge: "LEAD-01",
      color: "#00F3FF",
      dept: "Dept. of AI & ML, GAT",
      image: ""
    },
    {
      name: "Bhuvan AR",
      role: "Operations Head",
      category: "leads",
      badge: "LEAD-02",
      color: "#00B4D8",
      dept: "Dept. of AI & ML, GAT",
      image: ""
    },
    {
      name: "Ravikumar G",
      role: "Event Coordinator",
      category: "leads",
      badge: "LEAD-03",
      color: "#38BDF8",
      dept: "Dept. of AI & ML, GAT",
      image: ""
    },
    {
      name: "Prajwal T Raj",
      role: "Technical Lead",
      category: "tech",
      badge: "DEV LEAD",
      color: "#00F3FF",
      dept: "Dept. of AI & ML, GAT",
      image: ""
    },
    {
      name: "Dr. Faculty Head",
      role: "HOD, Dept of AI & ML",
      category: "faculty",
      badge: "PATRON",
      color: "#FBBF24",
      dept: "GAT Bengaluru",
      image: ""
    },
    {
      name: "Prof. Staff Advisor",
      role: "Faculty Coordinator",
      category: "faculty",
      badge: "MENTOR",
      color: "#FBBF24",
      dept: "GAT Bengaluru",
      image: ""
    },
    {
      name: "Platform Architect",
      role: "Infrastructure Lead",
      category: "tech",
      badge: "SYSTEMS",
      color: "#3B82F6",
      dept: "Dept. of AI & ML, GAT",
      image: ""
    },
    {
      name: "Creative & PR Lead",
      role: "Brand & Media Head",
      category: "ops",
      badge: "MEDIA",
      color: "#00B4D8",
      dept: "Dept. of AI & ML, GAT",
      image: ""
    }
  ];

  const handleCategoryChange = (catId) => {
    setActiveCategory(catId);
    setAnimCycle(prev => prev + 1);
    
    if (catId === "all") {
      setIsScanning(true);
      setTimeout(() => {
        setIsScanning(false);
      }, 1200);
    }
  };

  const filteredMembers = activeCategory === "all" 
    ? teamMembers 
    : teamMembers.filter(m => m.category === activeCategory);

  return (
    <section id="team" className="py-16 md:py-20 border-y border-white/5 bg-[#010103] relative z-10 overflow-hidden scroll-mt-20">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-b from-[#00F3FF]/8 via-[#0077B6]/5 to-transparent blur-[110px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 relative">
        {/* Header & Category Filter Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#00F3FF]/10 border border-[#00F3FF]/30 text-xs font-mono text-[#00F3FF] uppercase tracking-widest mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#00F3FF]" />
              Organizing Squad // CBC 2.0
            </div>
            <h2 className="text-3xl md:text-4xl font-orbitron font-bold uppercase text-white tracking-wider">
              The <span className="text-[#00F3FF] glow-cyan">Core</span> Crew
            </h2>
          </div>

          {/* Cyber Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 bg-white/5 p-1.5 rounded-2xl border border-white/10 relative">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`relative px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all duration-200 z-10 ${
                    isActive
                      ? "text-black font-bold"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeCategoryBadge"
                      className="absolute inset-0 rounded-xl bg-[#00F3FF] shadow-[0_0_15px_rgba(0,243,255,0.4)]"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      style={{ zIndex: -1 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    {cat.id === "all" && isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />
                    )}
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Squad Status HUD Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8 px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 backdrop-blur-md font-mono text-xs">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${activeCategory === "all" ? "bg-[#00F3FF]" : "bg-emerald-400"} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${activeCategory === "all" ? "bg-[#00F3FF]" : "bg-emerald-400"}`}></span>
            </span>
            <span className="text-gray-300 font-bold uppercase tracking-wider text-[11px]">
              {activeCategory === "all" ? (
                <span className="text-[#00F3FF]">
                  SQUAD SYNCHRONIZATION: <span className="text-white">8/8 OPERATIVES DEPLOYED [INFINITE STREAM]</span>
                </span>
              ) : (
                <span>
                  CATEGORY: <span className="text-[#00F3FF]">{categories.find(c => c.id === activeCategory)?.label.toUpperCase()}</span> ({filteredMembers.length} ACTIVE)
                </span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-gray-400">
            <span className="hidden sm:inline font-mono text-gray-500">{'// ENCRYPTION: SECURE'}</span>
            <span className="px-2 py-0.5 rounded bg-[#00F3FF]/10 border border-[#00F3FF]/30 text-[#00F3FF] text-[10px] font-bold tracking-widest uppercase">
              {activeCategory === "all" ? "RUNNING STREAM" : "FILTERED VIEW"}
            </span>
          </div>
        </div>

        {/* Cyber Scanner Beam when 'all' is chosen */}
        <div className="relative">
          <AnimatePresence>
            {isScanning && (
              <>
                {/* Holographic Radar Pulse Wave */}
                <motion.div
                  key={`radar-wave-${animCycle}`}
                  initial={{ opacity: 0.8, scale: 0.2 }}
                  animate={{ opacity: 0, scale: 2.2 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full border border-[#00F3FF]/60 bg-radial from-[#00F3FF]/20 via-[#00F3FF]/5 to-transparent pointer-events-none z-20 blur-[1px]"
                />
                {/* Holographic Sweep Beam */}
                <motion.div
                  key={`sweep-beam-${animCycle}`}
                  initial={{ top: "0%", opacity: 0 }}
                  animate={{ top: "100%", opacity: [0, 1, 1, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.1, ease: [0.25, 0.1, 0.25, 1] }}
                  className="absolute left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#00F3FF] to-transparent shadow-[0_0_25px_#00F3FF,0_0_50px_#00F3FF] pointer-events-none z-30"
                />
              </>
            )}
          </AnimatePresence>

          {/* Conditional Rendering: Infinite Running Marquee for 'all', Regular Grid for other categories */}
          {activeCategory === "all" ? (
            <div className="relative w-full overflow-hidden marquee-mask py-4 marquee-container">
              <div className="flex gap-6 w-max">
                {/* Track 1 */}
                <div className="animate-team-track">
                  {teamMembers.map((member, idx) => (
                    <TeamTiltCard 
                      key={`track1-${member.name}-${idx}`} 
                      member={member} 
                      index={idx}
                      isAllSelected={true}
                      animCycle={animCycle}
                    />
                  ))}
                </div>
                {/* Track 2 for seamless infinite loop */}
                <div className="animate-team-track" aria-hidden="true">
                  {teamMembers.map((member, idx) => (
                    <TeamTiltCard 
                      key={`track2-${member.name}-${idx}`} 
                      member={member} 
                      index={idx}
                      isAllSelected={true}
                      animCycle={animCycle}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <motion.div 
              key={`grid-${activeCategory}-${animCycle}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="flex flex-wrap justify-center items-stretch gap-6 py-4 min-h-[300px]"
            >
              <AnimatePresence mode="popLayout">
                {filteredMembers.map((member, idx) => (
                  <TeamTiltCard 
                    key={`filtered-${member.name}-${idx}`} 
                    member={member} 
                    index={idx}
                    isAllSelected={false}
                    animCycle={animCycle}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="border-t border-white/10 bg-[#000000] py-16 relative z-10 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-t from-[#00F3FF]/5 to-transparent pointer-events-none" />
    <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
      
      {/* Brand */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 mb-2">
          <img src="https://codebreakerchallenge2o.vercel.app/logos/cbc2ologo.PNG" alt="CBC 2.0" className="h-10 w-10 object-contain" />
          <span className="font-orbitron font-bold text-2xl tracking-wider">CBC 2.0</span>
        </div>
        <p className="text-gray-400 text-sm font-mono leading-relaxed">
          The 2nd Verse.<br/>
          AI For Change <br/>
          Think. Build. Break Limits.<br/>
        </p> 
      </div>
      
      {/* Connect */}
      <div className="flex flex-col gap-4">
        <h4 className="font-orbitron font-bold text-[#00F3FF] tracking-wider mb-2 uppercase">Connect</h4>
        <div className="flex flex-col gap-3">
          <a href="#" className="flex items-center gap-3 px-4 py-3 glass-panel rounded-lg hover:bg-yellow-400/20 hover:text-yellow-400 transition-colors w-full md:w-max">
            <Mail size={20} /><span className="font-mono text-sm">Email Us: <br />Codebreakeraiml@gmail.com</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 glass-panel rounded-lg hover:bg-[#E1306C]/20 hover:text-[#E1306C] transition-colors w-full md:w-max">
            <Instagram size={20} /> <span className="font-mono text-sm">Instagram<br /> </span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 glass-panel rounded-lg hover:bg-gray-500/20 hover:text-white transition-colors w-full md:w-max">
            <LinkIcon size={20} /> <span className="font-mono text-sm">Website</span>
          </a>
        </div>
      </div>
      
      {/* Contact: Registration */}
      <div className="flex flex-col gap-4">
        <h4 className="font-orbitron font-bold text-[#A855F7] tracking-wider mb-2 uppercase">Registration</h4>
        <div className="text-gray-400 text-sm space-y-3 font-mono">
          <div>
            <p className="text-white font-bold mb-1">Vinayaka</p>
            <p className="flex items-center gap-2 text-xs"><Phone size={12} className="text-[#A855F7]"/> +91 00000 00000</p>
          </div>
          <div>
            <p className="text-white font-bold mb-1">Prajwal T Raj</p>
            <p className="flex items-center gap-2 text-xs"><Phone size={12} className="text-[#A855F7]"/> +91 00000 00000</p>
          </div>
        </div>
      </div>

      {/* Contact: Queries */}
      <div className="flex flex-col gap-4">
        <h4 className="font-orbitron font-bold text-[#A855F7] tracking-wider mb-2 uppercase">Other Queries</h4>
        <div className="text-gray-400 text-sm space-y-3 font-mono">
          <div>
            <p className="text-white font-bold mb-1">Bhuvan</p>
            <p className="flex items-center gap-2 text-xs"><Phone size={12} className="text-[#A855F7]"/> +91 00000 00000</p>
          </div>
          <div>
            <p className="text-white font-bold mb-1">Ravi</p>
            <p className="flex items-center gap-2 text-xs"><Phone size={12} className="text-[#A855F7]"/> +91 00000 00000</p>
          </div>
        </div>
      </div>

    </div>
    
    {/* Bottom Footer */}
    <div className="max-w-7xl mx-auto px-4 mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-sm font-mono gap-6 relative z-10">
      <div className="flex flex-col items-center md:items-start gap-1">
        <p className="text-gray-500">&copy; 2026 Dept of AI & ML, GAT.</p>
        <p className="text-[#00F3FF] font-bold tracking-widest mt-2 flex items-center gap-2">
           Crafted with love <span className="text-[#A855F7] text-lg">♥</span> CBC 2.0 Team
        </p>
      </div>
      <div className="flex gap-6 text-gray-500">
        <a href="#" className="hover:text-[#00F3FF] transition-colors">Code of Conduct</a>
        <a href="#" className="hover:text-[#00F3FF] transition-colors">Privacy Policy</a>
      </div>
    </div>
  </footer>
);

export default function App() {
  return (
    <div className="w-full max-w-full overflow-x-hidden bg-[#010103] text-[#F0F0F0] selection:bg-[#00F3FF]/30 selection:text-white min-h-screen relative">
      <CustomCursor />
      <FixedTimer />
      <NavigationBar />
        <HeroSection />
        <StatsSection />
        <AboutSection />
        <ThemesSection />
        <PrizesSection />
        <TimelineSection />
        <RulesSection />
        <ProblemStatementsSection />
        <SponsorsSection />
        <TeamSection />
        <Footer />
    </div>
  );
}
