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


export default TeamTiltCard;
