
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


export default PrizesSection;
