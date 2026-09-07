
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import NeuralBackground from './NeuralBackground';
import TerminalWindow from './TerminalWindow';

// ------------------------------------------------------------------
// GLOBAL CONSTANTS & DESIGN TOKENS
// ------------------------------------------------------------------
const BUTTERY_EASE = [0.22, 1, 0.36, 1];
     
const HeroSection = () => (
  <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-10 px-4 overflow-hidden">
    <NeuralBackground />
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#010103]/50 to-[#010103] pointer-events-none z-0" />

    {/* University & Department Logos */}
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.5, ease: BUTTERY_EASE }}
      className="relative z-10 flex flex-wrap justify-center items-center gap-8 mb-10 w-full max-w-4xl"
    >
      <img src="https://gat.ac.in/img/main-logo.webp" alt="Global Academy of Technology" className="h-16 md:h-20 object-contain bg-white/90 p-2 rounded-lg" />
      <div className="h-12 w-[1px] bg-white/20 hidden md:block" />
      <img src="/team/cbc logo.png" alt="Code Breaker Challenge 2.0" className="h-16 md:h-20 object-contain" />
      <div className="h-12 w-[1px] bg-white/20 hidden md:block" />
      <img src="/team/22.png" alt="Dept of AI & ML" className="h-16 md:h-20 object-contain" />
    </motion.div>

    {/* Organization Text */}
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5, delay: 0.5, ease: BUTTERY_EASE }}
      className="relative z-10 flex flex-col items-center text-center mb-6"
    >
      <p className="text-gray-400 text-sm md:text-base font-orbitron tracking-[0.2em] uppercase mb-2">
        CTRLCode & Aitron AIML 
      </p>
      <p className="text-gray-400 text-sm md:text-base font-orbitron tracking-[0.2em] uppercase mb-2">
        DEPARTMENT OF ARTIFICIAL INTELLIGENCE & MACHINE LEARNING
      </p>
      <p className="text-gray-500 text-xs md:text-sm font-orbitron tracking-[0.2em] uppercase">
        GLOBAL ACADEMY OF TECHNOLOGY, BENGALURU
      </p>
    </motion.div>

    <p className="text-purple-400 text-sm md:text-base font-orbitron tracking-[0.2em] uppercase mb-2 relative z-10">
       In Collaboration with
    </p>

    {/* Hosting Partners Logos */}
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.5, ease: BUTTERY_EASE }}
      className="relative z-10 flex flex-wrap justify-center items-center gap-8 mb-10 w-full max-w-4xl"
    >
      <img src="https://www.dsedify.com/_next/static/media/edify-logo.9eae1a96.webp" alt="DSEdify" className="h-12 md:h-14 object-contain bg-white/90 p-2 rounded-lg" />
      <div className="h-12 w-[1px] bg-white/20 hidden md:block" />
      <img src="https://www.dyashin.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fdyashin.1e17371d.webp&w=3840&q=75" alt="Dyashin" className="h-12 md:h-14 object-contain" />
    </motion.div>

    <p className="text-yellow-400 text-sm md:text-base font-orbitron tracking-[0.4em] uppercase glow-blue mb-1 relative z-10">
      Presents
    </p>

    {/* Titles & CTA */}
    <div className="relative z-10 text-center w-full mt-4">
      <motion.div
        initial={{ opacity: 0, scale: 1.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: BUTTERY_EASE }}
      >
        <h2 className="text-[#00F3FF] tracking-widest text-sm md:text-base font-orbitron mb-2 uppercase glow-cyan mt-4">
          A National-Level 24-Hour Hackathon
        </h2>
        <h1 className="text-4xl md:text-6xl lg:text-8xl font-black font-orbitron mb-2">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-gray-300">
            CODE BREAKER
          </span>
        </h1>
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black font-orbitron text-white mb-6">
          <span className="glitch" data-text="CHALLENGE">CHALLENGE</span>{" "}
          <span className="text-[#FFD700]">2.0</span>
        </h1>
        <div className="flex justify-center items-center gap-4 mb-1">
          <div className="bg-[#00F3FF]/10 border border-[#00F3FF]/30 px-6 py-2 rounded-full inline-block">
            <span className="text-[#00F3FF] font-bold tracking-widest uppercase text-sm font-mono">
              The 2nd Verse
            </span> 
          </div>
          <button 
            type="button"
            className="flex items-center gap-2 px-6 py-2 bg-[#A855F7]/10 border border-[#A855F7]/50 text-[#A855F7] rounded-full hover:bg-[#A855F7]/20 transition-colors font-mono font-bold tracking-widest text-sm uppercase cursor-pointer"
          >
            <Download size={16} /> Brochure
          </button>
        </div>
      </motion.div>
    </div>

    <div className="relative z-10 w-full px-4 mt-6">
      <TerminalWindow />
    </div>
  </section>
);

export default HeroSection;