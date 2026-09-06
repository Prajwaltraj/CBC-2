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


export default StatsSection;
