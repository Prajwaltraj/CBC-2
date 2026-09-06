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


export default TerminalWindow;
