
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

export default ProblemStatementsSection;
