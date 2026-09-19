import re

content = """import { motion } from 'framer-motion';

const BUTTERY_EASE = [0.22, 1, 0.36, 1];

const AboutSection = () => {
  return (
    <section id="about" className="py-24 px-4 relative z-10 overflow-hidden min-h-[60vh] flex flex-col items-center justify-center scroll-mt-20">
      <div className="max-w-6xl mx-auto relative z-10 w-full flex flex-col gap-24">
        
        {/* Intro Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: BUTTERY_EASE }}
          className="text-center mb-10"
        >
          <h2 className="text-4xl md:text-6xl font-orbitron font-bold mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F3FF] to-white">Think.</span>{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-yellow-400">Build.</span>{' '}
            <span className="text-black dark:text-white">Break Limits.</span>
          </h2>
        </motion.div>

        {/* Block 1: About GAT (Text Left, Image Right) */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: BUTTERY_EASE }}
          className="flex flex-col md:flex-row items-center gap-12 glass-panel p-8 md:p-12 rounded-3xl shadow-[0_0_50px_rgba(0,243,255,0.05)] border-t border-[#00F3FF]/20"
        >
          <div className="flex-1 text-left">
            <h3 className="text-2xl md:text-4xl font-orbitron font-bold text-[#00F3FF] mb-6">ABOUT GAT</h3>
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed font-light">
              Established in 2001, Global Academy of Technology (GAT) is a leading Engineering and Management institute in Bengaluru combining academic excellence with industry exposure. GAT provides a vibrant ecosystem for students to innovate, collaborate, and develop professional skills.
            </p>
          </div>
          <div className="flex-1 flex justify-center w-full">
            <div className="w-full max-w-sm aspect-video bg-white/5 rounded-2xl border border-white/10 overflow-hidden flex items-center justify-center relative shadow-[0_0_30px_rgba(0,243,255,0.1)]">
              <img src="/team/gat.png" alt="GAT Logo" className="w-full h-full object-contain p-4 mix-blend-screen" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} />
              <div className="hidden text-gray-500 font-mono text-sm">[gat.png]</div>
            </div>
          </div>
        </motion.div>

        {/* Block 2: About AIML (Image Left, Text Right) */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: BUTTERY_EASE }}
          className="flex flex-col md:flex-row-reverse items-center gap-12 glass-panel p-8 md:p-12 rounded-3xl shadow-[0_0_50px_rgba(168,85,247,0.05)] border-t border-[#A855F7]/20"
        >
          <div className="flex-1 text-right">
            <h3 className="text-2xl md:text-4xl font-orbitron font-bold text-[#A855F7] mb-6">ABOUT AIML</h3>
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed font-light">
              The AI & ML Department fosters innovation through hands-on learning, student clubs like CTRL Club, and flagship events like Code Breaker Challenge, AIfiesta, and Webathon. It is supported by experienced faculty dedicated to building future-ready tech talent.
            </p>
          </div>
          <div className="flex-1 flex justify-center w-full">
            <div className="w-full max-w-sm aspect-video bg-white/5 rounded-2xl border border-white/10 overflow-hidden flex items-center justify-center relative shadow-[0_0_30px_rgba(168,85,247,0.1)]">
              <img src="/team/aiml.png" alt="AIML Logo" className="w-full h-full object-contain p-4 mix-blend-screen" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} />
              <div className="hidden text-gray-500 font-mono text-sm">[aiml.png]</div>
            </div>
          </div>
        </motion.div>

        {/* Block 3: About CBC (Text Left, Image Right) */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: BUTTERY_EASE }}
          className="flex flex-col md:flex-row items-center gap-12 glass-panel p-8 md:p-12 rounded-3xl shadow-[0_0_50px_rgba(251,191,36,0.05)] border-t border-[#FBBF24]/20"
        >
          <div className="flex-1 text-left">
            <h3 className="text-2xl md:text-4xl font-orbitron font-bold text-[#FBBF24] mb-6">ABOUT CBC</h3>
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed font-light mb-4">
              Code Breaker Challenge (CBC) is a national-level 24-hour hackathon providing students with a platform to transform ideas into practical solutions for real-world problems.
            </p>
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed font-light">
              Our mission is to empower students to move beyond theoretical learning. Through Think. Build. Break Limits., we foster original thinking, teamwork, and the confidence to turn ideas into working solutions.
            </p>
          </div>
          <div className="flex-1 flex justify-center w-full">
            <div className="w-full max-w-sm aspect-video bg-white/5 rounded-2xl border border-white/10 overflow-hidden flex items-center justify-center relative shadow-[0_0_30px_rgba(251,191,36,0.1)]">
              <img src="/team/cbc.png" alt="CBC Logo" className="w-full h-full object-contain p-4 mix-blend-screen" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} />
              <div className="hidden text-gray-500 font-mono text-sm">[cbc.png]</div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default AboutSection;
"""

with open('src/components/AboutSection.jsx', 'w') as f:
    f.write(content)
