// ------------------------------------------------------------------
// GLOBAL CONSTANTS & DESIGN TOKENS
// ------------------------------------------------------------------


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


export default SponsorsSection;
