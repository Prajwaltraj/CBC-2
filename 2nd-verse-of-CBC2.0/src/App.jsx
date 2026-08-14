import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { Terminal as TerminalIcon, Code2, ShieldAlert, Cpu, Network, ChevronDown, Github, Twitter, Disc, MapPin, Calendar, Clock, Zap, Download, Lock, Unlock, Mail, Phone, Instagram, Link as LinkIcon, User } from 'lucide-react';
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

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
        isScrolled ? 'bg-[#010103]/80 backdrop-blur-md border-b border-white/10 py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex justify-between items-center">
        <a href="#" className="flex items-center gap-2 group">
          <img src="https://codebreakerchallenge2o.vercel.app/logos/cbc2ologo.PNG" alt="CBC 2.0" className="h-10 w-10 object-contain transition-transform duration-300 group-hover:scale-110" />
          <span className="font-orbitron font-bold text-xl tracking-wider text-white group-hover:text-[#00F3FF] transition-colors">CBC 2.0</span>
        </a>
        <div className="hidden md:flex items-center gap-6 font-orbitron text-[11px] tracking-wider">
          {navLinks.map((link) => (
            <a key={link.name} href={link.href} className="nav-link uppercase">{link.name}</a>
          ))}
        </div>
        <div>
          <a href="#" className="relative inline-flex items-center justify-center px-6 py-2.5 overflow-hidden font-orbitron font-bold text-white bg-[#010103] border border-[#00F3FF] rounded-md hover:bg-[#00F3FF]/10 transition-colors group">
            <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-[#00F3FF] rounded-full group-hover:w-56 group-hover:h-56 opacity-10"></span>
            <span className="relative flex items-center gap-2 text-xs md:text-sm">
              <Zap size={16} className="text-[#00F3FF]" /> REGISTER
            </span>
          </a>
        </div>
      </div>
    </motion.nav>
  );
};

// ------------------------------------------------------------------
// FIXED COUNTDOWN TIMER
// ------------------------------------------------------------------
const FixedTimer = () => {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    // Target: Oct 10, 2026 10:30 AM IST (Same as Problem Statements)
    const targetDate = new Date(PROBLEM_STATEMENTS_CONFIG.UNLOCK_DATE).getTime();

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
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1, delay: 1 }}
      className="fixed right-0 top-1/2 -translate-y-1/2 z-[100] flex flex-col gap-2 p-2 md:p-3 glass-panel rounded-l-xl border-r-0 border-[#00F3FF]/30 backdrop-blur-md shadow-[-5px_0_20px_rgba(0,243,255,0.1)] scale-75 md:scale-100 origin-right"
    >
      <div className="text-[10px] font-orbitron text-[#00F3FF] tracking-widest text-center uppercase mb-1" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>T-Minus</div>
      <div className="flex flex-col gap-2 items-center font-mono">
        <div className="flex flex-col items-center">
          <span className="text-xl font-bold text-white">{String(timeLeft.d).padStart(2, '0')}</span>
          <span className="text-[9px] text-gray-500 uppercase tracking-wider">Days</span>
        </div>
        <div className="w-full h-px bg-white/10" />
        <div className="flex flex-col items-center">
          <span className="text-xl font-bold text-white">{String(timeLeft.h).padStart(2, '0')}</span>
          <span className="text-[9px] text-gray-500 uppercase tracking-wider">Hrs</span>
        </div>
        <div className="w-full h-px bg-white/10" />
        <div className="flex flex-col items-center">
          <span className="text-xl font-bold text-white">{String(timeLeft.m).padStart(2, '0')}</span>
          <span className="text-[9px] text-gray-500 uppercase tracking-wider">Min</span>
        </div>
        <div className="w-full h-px bg-white/10" />
        <div className="flex flex-col items-center">
          <span className="text-xl font-bold text-[#A855F7] animate-pulse">{String(timeLeft.s).padStart(2, '0')}</span>
          <span className="text-[9px] text-gray-500 uppercase tracking-wider">Sec</span>
        </div>
      </div>
    </motion.div>
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
    <section id="themes" className="py-24 px-4 relative z-10 scroll-mt-20">
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
  return (
    <section id="prizes" className="py-24 px-4 relative z-10 scroll-mt-20">
      <div className="max-w-5xl mx-auto relative">
        <motion.h2 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-4xl md:text-6xl font-orbitron font-bold text-center mb-16 uppercase"
        >
          <span className="text-[#A855F7] glow-magenta">Prizes</span> & Perks
        </motion.h2>

        <div className="flex flex-col md:flex-row justify-center items-end gap-6 mb-16">
          {/* 1st Runner Up */}
          <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.8 }}
            className="w-full md:w-1/3 glass-panel p-8 rounded-t-xl text-center border-t-4 border-[#00F3FF] md:h-64 flex flex-col justify-center bg-[#010103]/80">
            <h3 className="text-xl font-orbitron text-gray-400 uppercase tracking-widest mb-2">1st Runner Up</h3>
            <p className="text-4xl font-black font-orbitron text-[#00F3FF]">₹20,000</p>
          </motion.div>

          {/* Winner */}
          <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4, duration: 0.8 }}
            className="w-full md:w-1/3 glass-panel p-8 rounded-t-xl text-center border-t-4 border-[#FBBF24] md:h-72 flex flex-col justify-center bg-[#010103] shadow-[0_-20px_40px_rgba(251,191,36,0.15)] relative z-10 transform md:-translate-y-4">
            <h3 className="text-2xl font-orbitron text-gray-200 uppercase tracking-widest mb-2">Winner</h3>
            <p className="text-5xl font-black font-orbitron text-[#FBBF24] glow-[#FBBF24]">₹30,000</p>
          </motion.div>

          {/* 2nd Runner Up */}
          <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.6, duration: 0.8 }}
            className="w-full md:w-1/3 glass-panel p-8 rounded-t-xl text-center border-t-4 border-[#A855F7] md:h-56 flex flex-col justify-center bg-[#010103]/80">
            <h3 className="text-lg font-orbitron text-gray-400 uppercase tracking-widest mb-2">2nd Runner Up</h3>
            <p className="text-3xl font-black font-orbitron text-[#A855F7]">₹10,000</p>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="glass-panel p-8 rounded-xl border border-white/10 text-center max-w-3xl mx-auto">
          <Zap size={32} className="text-[#FBBF24] mx-auto mb-4" />
          <h4 className="text-xl font-orbitron font-bold text-white mb-2">Exclusive Opportunities at Dyashin Technologies</h4>
          <p className="text-gray-300 font-mono text-sm leading-relaxed">
            The winning team will receive a direct internship opportunity and placement offer. Runner-ups will be awarded a 3-month internship and a PPA (Pre-Placement Assessment) offer based on individual performance!
          </p>
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
        <div className="relative pl-8 md:pl-0">
          <div className="absolute left-[20px] md:left-1/2 top-0 bottom-0 w-[2px] bg-white/5 md:-translate-x-1/2" />
          <motion.div 
            style={{ height: lineHeight }}
            className="absolute left-[20px] md:left-1/2 top-0 w-[2px] bg-gradient-to-b from-[#00F3FF] to-[#A855F7] md:-translate-x-1/2 will-change-transform shadow-[0_0_15px_#A855F7]" 
          />          {schedule.map((item, idx) => (
            <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group mb-16 last:mb-0">
              <div className="absolute left-[-16px] md:left-1/2 md:-translate-x-1/2 w-8 h-8 rounded-full bg-[#010103] border-2 border-white/20 flex items-center justify-center z-10 group-hover:border-[#00F3FF] transition-colors shadow-[0_0_10px_rgba(0,0,0,0)] group-hover:shadow-[0_0_15px_#00F3FF]">
                <div className="w-2 h-2 rounded-full bg-white/50 group-hover:bg-[#00F3FF] transition-colors" />
              </div>
              <motion.div 
                initial={{ opacity: 0, x: idx % 2 === 0 ? 50 : -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: BUTTERY_EASE }}
                className="w-[calc(100%-2rem)] md:w-[calc(50%-3rem)] glass-panel p-6 rounded-xl hover:border-[#00F3FF]/30 transition-colors"
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
    <section id="rules" className="py-24 px-4 relative z-10 scroll-mt-20">
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
    <section id="problems" className="py-24 px-4 relative z-10 scroll-mt-20 border-y border-white/5 bg-[#010103]/50">
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
    <section id="sponsors" className="py-24 px-4 relative z-10 scroll-mt-20">
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

const TeamSection = () => {
  const teamArray = Array(10).fill({ name: "Name Placeholder", role: "Designation" });

  return (
    <section id="team" className="py-24 border-y border-white/5 bg-[#010103] overflow-hidden relative z-10">
      <h2 className="text-center text-[#A855F7] font-orbitron font-bold text-3xl md:text-5xl uppercase mb-12">
        The Core <span className="text-white">Team</span>
      </h2>
      <div className="flex whitespace-nowrap py-4">
        <motion.div 
          animate={{ x: ["0%", "-50%"] }}
          transition={{ ease: "linear", duration: 30, repeat: Infinity }}
          className="flex gap-6 items-center px-4"
        >
          {/* Double array for infinite scroll */}
          {[...teamArray, ...teamArray].map((member, idx) => (
            <div key={idx} className="glass-panel w-64 h-80 rounded-xl p-6 flex flex-col items-center justify-center border-white/5 hover:border-[#A855F7]/30 transition-colors shrink-0">
              <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
                <User size={32} className="text-gray-500" />
              </div>
              <h4 className="text-lg font-orbitron font-bold text-white mb-1">{member.name}</h4>
              <p className="text-sm font-mono text-[#A855F7] uppercase tracking-widest">{member.role}</p>
            </div>
          ))}
        </motion.div>
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
    <>
      <CustomCursor />
      <FixedTimer />
      <div className="w-full bg-[#010103] text-[#F0F0F0] selection:bg-[#00F3FF]/30 selection:text-white min-h-screen">
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
    </>
  );
}
