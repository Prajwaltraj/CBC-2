import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { Code2, ShieldAlert, Cpu, Network, Zap, Download, Lock, Unlock, Mail, Phone, Instagram, Link as LinkIcon, User, Trophy, Crown, Medal, Award, Sparkles, CheckCircle2, Briefcase, Menu, X } from 'lucide-react';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import { PROBLEM_STATEMENTS_CONFIG } from '../config/problemStatements';

// ------------------------------------------------------------------
// GLOBAL CONSTANTS & DESIGN TOKENS
// ------------------------------------------------------------------
const BUTTERY_EASE = [0.22, 1, 0.36, 1];


const TimelineSection = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start center", "end center"] });
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const schedule = [
    { time: "07 Sep 2026", title: "Registration Starts", desc: "Form your team and initiate your registration." },
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


export default TimelineSection;
