import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import TeamTiltCard from './TeamTiltCard';
const TeamSection = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [animCycle, setAnimCycle] = useState(0);
  const [isScanning, setIsScanning] = useState(false);

  const categories = [
    { id: "all", label: "All Crew" },
    { id: "faculty", label: "Faculty Committee" },
    { id: "leads", label: "Core Leads" },
    { id: "tech", label: "Tech & Dev" },
    { id: "ops", label: "Operations & Media" },
  ];

  const teamMembers = [
    // Faculty Core Committee
    {
      name: "Dr. Roopa B S",
      role: "HOD, Dept of AI & ML",
      category: "faculty",
      badge: "PATRON",
      color: "#FBBF24",
      dept: "GAT Bengaluru",
      image: ""
    },
    {
      name: "Prof. C Christlin Shanuja",
      role: "Faculty Co-Convenor",
      category: "faculty",
      badge: "MENTOR",
      color: "#FBBF24",
      dept: "GAT Bengaluru",
      image: ""
    },
    {
      name: "Prof. Prasanna N",
      role: "IEEE Coordinator",
      category: "faculty",
      badge: "MENTOR",
      color: "#FBBF24",
      dept: "GAT Bengaluru",
      image: ""
    },
    {
      name: "Prof. Anusha J",
      role: "Faculty Co-Convenor",
      category: "faculty",
      badge: "MENTOR",
      color: "#FBBF24",
      dept: "GAT Bengaluru",
      image: ""
    },
    {
      name: "Prof. Likhith Krishna Kikkeri",
      role: "Faculty Co-Convenor",
      category: "faculty",
      badge: "MENTOR",
      color: "#FBBF24",
      dept: "GAT Bengaluru",
      image: ""
    },
    

    // Core Committee Leads
    {
      name: "Niyathi Nagesh",
      role: "Convenor",
      category: "leads",
      badge: "CONVENOR",
      color: "#00F3FF",
      dept: "Dept. of AI & ML, GAT",
      image: ""
    },
    {
      name: "Bhuvan A R",
      role: "Co-Convenor",
      category: "leads",
      badge: "CO-CONVENOR",
      color: "#00B4D8",
      dept: "Dept. of AI & ML, GAT",
      image: ""
    },
    {
      name: "Ravi Kumar G",
      role: "Co-Convenor",
      category: "leads",
      badge: "CO-CONVENOR",
      color: "#38BDF8",
      dept: "Dept. of AI & ML, GAT",
      image: ""
    },
    
    // Technical Team
    {
      name: "Prajwal T Raj",
      role: "Technical Head",
      category: "tech",
      badge: "TECH HEAD",
      color: "#00F3FF",
      dept: "Dept. of AI & ML, GAT",
      image: ""
    },
    {
      name: "Chethan Ponnappa A",
      role: "Technical Co-Head",
      category: "tech",
      badge: "TECH CO-HEAD",
      color: "#00B4D8",
      dept: "Dept. of AI & ML, GAT",
      image: ""
    },

    // Operations & Media Team
    {
      name: "Yashaswini S",
      role: "Treasurer",
      category: "ops",
      badge: "TREASURER",
      color: "#A855F7",
      dept: "Dept. of AI & ML, GAT",
      image: ""
    },
    {
      name: "Janavi H B",
      role: "Stage Head",
      category: "ops",
      badge: "STAGE HEAD",
      color: "#EC4899",
      dept: "Dept. of AI & ML, GAT",
      image: ""
    },
    {
      name: "Namratha B A",
      role: "Stage CO-Head",
      category: "ops",
      badge: "STAGE CO-HEAD",
      color: "#EC4899",
      dept: "Dept. of AI & ML, GAT",
      image: ""
    },
    {
      name: "Riya Vinod",
      role: "Creative Head",
      category: "ops",
      badge: "CREATIVE HEAD",
      color: "#F43F5E",
      dept: "Dept. of AI & ML, GAT",
      image: ""
    },
    {
      name: "Samrudh H T",
      role: "Social Media Head",
      category: "ops",
      badge: "MEDIA HEAD",
      color: "#06B6D4",
      dept: "Dept. of AI & ML, GAT",
      image: ""
    },
    {
      name: "Pratheeksha R",
      role: "Social Media Co-Head",
      category: "ops",
      badge: "MEDIA CO-HEAD",
      color: "#06B6D4",
      dept: "Dept. of AI & ML, GAT",
      image: ""
    },
    {
      name: "Mythri Mehendarkar R",
      role: "Hospitality Head",
      category: "ops",
      badge: "HOSPITALITY",
      color: "#38BDF8",
      dept: "Dept. of AI & ML, GAT",
      image: ""
    },
    {
      name: "Laasya S D",
      role: "Hospitality Co-Head",
      category: "ops",
      badge: "HOSPITALITY",
      color: "#38BDF8",
      dept: "Dept. of AI & ML, GAT",
      image: ""
    },
    {
      name: "Vinayaka S",
      role: "Registration Head",
      category: "ops",
      badge: "REGISTRATION",
      color: "#10B981",
      dept: "Dept. of AI & ML, GAT",
      image: ""
    },
    {
      name: "Yashavantha M S",
      role: "Discipline Head",
      category: "ops",
      badge: "DISCIPLINE",
      color: "#F59E0B",
      dept: "Dept. of AI & ML, GAT",
      image: ""
    },
    {
      name: "S Maha Skanda",
      role: "Logistics Head",
      category: "ops",
      badge: "LOGISTICS",
      color: "#8B5CF6",
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
                  SQUAD SYNCHRONIZATION: <span className="text-white">{teamMembers.length}/{teamMembers.length} OPERATIVES DEPLOYED [INFINITE STREAM]</span>
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


export default TeamSection;
