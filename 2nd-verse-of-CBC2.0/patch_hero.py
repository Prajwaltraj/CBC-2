import re

with open('src/components/HeroSection.jsx', 'r') as f:
    content = f.read()

oversized_typography = """    <div className="relative z-10 text-center w-full mt-8 overflow-hidden">
      <motion.div
        initial={{ y: 200, skewY: 10 }}
        animate={{ y: 0, skewY: 0 }}
        transition={{ duration: 1.5, ease: [0.77, 0, 0.175, 1], delay: 0.2 }}
        className="flex flex-col items-center"
      >
        <h2 className="text-[#00F3FF] tracking-[0.3em] text-xs md:text-sm font-orbitron mb-4 uppercase glow-cyan">
          A National-Level 24-Hour Hackathon
        </h2>
        <h1 className="text-[12vw] md:text-[8vw] lg:text-[7vw] leading-[0.9] font-black font-orbitron mb-0 tracking-tighter">
          <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-200 to-gray-500 block hover:scale-105 transition-transform duration-500">
            CODE BREAKER
          </span>
        </h1>
      </motion.div>
      <motion.div
        initial={{ y: 200, skewY: 10 }}
        animate={{ y: 0, skewY: 0 }}
        transition={{ duration: 1.5, ease: [0.77, 0, 0.175, 1], delay: 0.3 }}
      >
        <h1 className="text-[10vw] md:text-[6vw] lg:text-[5vw] leading-[1] font-black font-orbitron text-black dark:text-white mb-8 tracking-tight">
          <span className="glitch" data-text="CHALLENGE">CHALLENGE</span>{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#FBBF24] to-[#F59E0B]">2.0</span>
        </h1>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1 }}
        className="flex flex-col items-center gap-4 mb-6"
      >
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <ProgressiveImage 
            src="/team/sdg long.png" 
            alt="Sustainable Development Goals" 
            className="h-12 md:h-16 object-contain opacity-90 hover:opacity-100 transition-opacity drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] rounded-lg" 
          />
          <div className="flex items-center justify-center gap-4">
            <ProgressiveImage 
              src="/team/sdg 04.jpeg" 
              alt="SDG 4 - Quality Education" 
              className="h-12 md:h-16 object-contain opacity-90 hover:opacity-100 transition-opacity drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] rounded-lg" 
            />
            <ProgressiveImage 
              src="/team/sdg 09.jpeg" 
              alt="SDG 9 - Industry, Innovation and Infrastructure" 
              className="h-12 md:h-16 object-contain opacity-90 hover:opacity-100 transition-opacity drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] rounded-lg" 
            />
            <ProgressiveImage 
              src="/team/sdg 17.jpeg" 
              alt="SDG 17 - Partnerships for the Goals" 
              className="h-12 md:h-16 object-contain opacity-90 hover:opacity-100 transition-opacity drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] rounded-lg" 
            />
          </div>
        </div>
      </motion.div>
    </div>"""

# Replace the Titles & CTA section
content = re.sub(r'<div className="relative z-10 text-center w-full mt-4">.*?</div>\n      </motion\.div>\n    </div>', oversized_typography, content, flags=re.DOTALL)

with open('src/components/HeroSection.jsx', 'w') as f:
    f.write(content)
