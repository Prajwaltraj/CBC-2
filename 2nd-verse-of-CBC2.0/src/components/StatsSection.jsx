import { motion } from 'framer-motion';

const StatsSection = () => {
  const legacyStats = [
    { num: "120+", label: "TEAMS" },
    { num: "450+", label: "STUDENTS" },
    { num: "50+", label: "COLLEGES" },
    { num: "133K+", label: "VIEWS" },
  ];

  return (
    <section className="py-16 md:py-24 border-y border-black/10 dark:border-white/5 bg-transparent relative z-10">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* EVENT HIGHLIGHT BADGES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 mb-24">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-panel relative overflow-hidden rounded-2xl p-8 flex flex-col items-center justify-center border border-[#00F3FF]/30 shadow-[0_0_30px_rgba(0,243,255,0.1)] group hover:border-[#00F3FF]/60 transition-colors"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#00F3FF]/5 to-transparent pointer-events-none" />
            <span className="relative z-10 text-[#00F3FF] text-lg md:text-xl font-mono tracking-widest mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00F3FF] animate-pulse" /> 24 HOURS
            </span>
            <span className="relative z-10 text-white text-2xl md:text-4xl font-orbitron font-bold uppercase text-center group-hover:scale-105 transition-transform duration-300">
              Non-Stop Innovation
            </span>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-panel relative overflow-hidden rounded-2xl p-8 flex flex-col items-center justify-center border border-[#A855F7]/30 shadow-[0_0_30px_rgba(168,85,247,0.1)] group hover:border-[#A855F7]/60 transition-colors"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#A855F7]/5 to-transparent pointer-events-none" />
            <span className="relative z-10 text-[#A855F7] text-lg md:text-xl font-mono tracking-widest mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#A855F7] animate-pulse" /> 3 DOMAINS
            </span>
            <span className="relative z-10 text-white text-2xl md:text-4xl font-orbitron font-bold uppercase text-center group-hover:scale-105 transition-transform duration-300">
              Endless Possibilities
            </span>
          </motion.div>
        </div>

        {/* LEGACY STATS */}
        <div className="text-center mb-16 border-t border-white/5 pt-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-gray-400 mb-6 uppercase tracking-widest"
          >
            CBC 1.0 LEGACY
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-orbitron font-black uppercase tracking-wider text-white"
          >
            LAST TIME, WE BUILT THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F3FF] to-[#A855F7]">BENCHMARK.</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {legacyStats.map((stat, idx) => (
            <motion.div 
              key={`legacy-${idx}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.8 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-black font-orbitron text-gray-200 mb-2 drop-shadow-md">{stat.num}</div>
              <div className="text-gray-500 font-mono text-sm tracking-widest">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
