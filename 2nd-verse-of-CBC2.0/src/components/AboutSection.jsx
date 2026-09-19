import { motion } from 'framer-motion';

const BUTTERY_EASE = [0.22, 1, 0.36, 1];


const AboutSection = () => {
  return (
    <section id="about" className="py-24 px-4 relative z-10 overflow-hidden min-h-[60vh] flex flex-col items-center justify-center scroll-mt-20">
      <div className="max-w-6xl mx-auto relative z-10 w-full flex flex-col gap-0">
        
        {/* Intro Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: BUTTERY_EASE }}
          className="text-center mb-16 md:mb-24"
        >
          <h2 className="text-4xl md:text-6xl font-orbitron font-bold mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F3FF] to-white">Think.</span>{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-yellow-400">Build.</span>{' '}
            <span className="text-black dark:text-white">Break Limits.</span>
          </h2>
        </motion.div>

        {/* Block 1: About GAT (Full Width Background Image with Text Overlay) */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: BUTTERY_EASE }}
          className="relative w-[100vw] left-[50%] right-[50%] -ml-[50vw] -mr-[50vw] min-h-[40vh] md:min-h-[50vh] flex items-center justify-center overflow-hidden border-y border-white/10 shadow-[0_0_50px_rgba(0,243,255,0.05)]"
        >
          {/* Background Image */}
          <div className="absolute inset-0 z-0 bg-[#010103]">
            <img 
              src="/team/gatt.png" 
              alt="GAT Background" 
              className="w-full h-full object-cover opacity-70 mix-blend-screen" 
              onError={(e) => {
                e.target.style.display='none';
                e.target.nextSibling.style.display='block';
              }}
            />
            {/* Fallback solid background pattern if gat.png isn't available */}
            <div className="hidden absolute inset-0 bg-[#00F3FF]/5 flex items-center justify-center">
              <span className="text-gray-500 font-mono text-sm">[Background Image: gat.png]</span>
            </div>
            
            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-black/80" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/60" />
          </div>

          {/* Text Content overlaying the background */}
          <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-12 py-16 w-full text-center md:text-left flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 max-w-3xl">
              <h3 className="text-3xl md:text-5xl font-orbitron font-bold text-[#00F3FF] mb-6 drop-shadow-[0_0_15px_rgba(0,243,255,0.5)]">
                ABOUT GAT
              </h3>
              <p className="text-white text-lg md:text-xl leading-relaxed font-light drop-shadow-md">
                Established in 2001, Global Academy of Technology (GAT) is a leading Engineering and Management institute in Bengaluru combining academic excellence with industry exposure. GAT provides a vibrant ecosystem for students to innovate, collaborate, and develop professional skills.
              </p>
            </div>
            <div className="hidden md:flex flex-1 justify-end">
              <div className="w-24 h-1 bg-gradient-to-r from-transparent to-[#00F3FF] rounded-full shadow-[0_0_20px_rgba(0,243,255,0.8)]" />
            </div>
          </div>
        </motion.div>

        {/* Block 2: About AIML (Full Width Background Image with Text Overlay) */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: BUTTERY_EASE }}
          className="relative w-[100vw] left-[50%] right-[50%] -ml-[50vw] -mr-[50vw] min-h-[40vh] md:min-h-[50vh] flex items-center justify-center overflow-hidden border-y border-white/10 shadow-[0_0_50px_rgba(168,85,247,0.05)]"
        >
          {/* Background Image */}
          <div className="absolute inset-0 z-0 bg-[#010103]">
            <img 
              src="/team/aimll.png" 
              alt="AIML Background" 
              className="w-full h-full object-cover opacity-70 mix-blend-screen" 
              onError={(e) => {
                e.target.style.display='none';
                e.target.nextSibling.style.display='block';
              }}
            />
            <div className="hidden absolute inset-0 bg-[#A855F7]/5 flex items-center justify-center">
              <span className="text-gray-500 font-mono text-sm">[Background Image: aiml.png]</span>
            </div>
            
            <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-black/20 to-black/80" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/60" />
          </div>

          {/* Text Content */}
          <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-12 py-16 w-full text-center md:text-right flex flex-col md:flex-row-reverse items-center gap-8">
            <div className="flex-1 max-w-3xl">
              <h3 className="text-3xl md:text-5xl font-orbitron font-bold text-[#A855F7] mb-6 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                ABOUT AIML
              </h3>
              <p className="text-white text-lg md:text-xl leading-relaxed font-light drop-shadow-md">
                The AI & ML Department fosters innovation through hands-on learning, student clubs like CTRL Club, and flagship events like Code Breaker Challenge, AIfiesta, and Webathon. It is supported by experienced faculty dedicated to building future-ready tech talent.
              </p>
            </div>
            <div className="hidden md:flex flex-1 justify-start">
              <div className="w-24 h-1 bg-gradient-to-l from-transparent to-[#A855F7] rounded-full shadow-[0_0_20px_rgba(168,85,247,0.8)]" />
            </div>
          </div>
        </motion.div>

        {/* Block 3: About CBC (Full Width Background Image with Text Overlay) */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: BUTTERY_EASE }}
          className="relative w-[100vw] left-[50%] right-[50%] -ml-[50vw] -mr-[50vw] min-h-[40vh] md:min-h-[50vh] flex items-center justify-center overflow-hidden border-y border-white/10 shadow-[0_0_50px_rgba(251,191,36,0.05)]"
        >
          {/* Background Image */}
          <div className="absolute inset-0 z-0 bg-[#010103]">
            <img 
              src="/team/cb.png" 
              alt="CBC Background" 
              className="w-full h-full object-cover opacity-70 mix-blend-screen" 
              onError={(e) => {
                e.target.style.display='none';
                e.target.nextSibling.style.display='block';
              }}
            />
            <div className="hidden absolute inset-0 bg-[#FBBF24]/5 flex items-center justify-center">
              <span className="text-gray-500 font-mono text-sm">[Background Image: cb.png]</span>
            </div>
            
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-black/80" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/60" />
          </div>

          {/* Text Content */}
          <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-12 py-16 w-full text-center md:text-left flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 max-w-3xl">
              <h3 className="text-3xl md:text-5xl font-orbitron font-bold text-[#FBBF24] mb-6 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]">
                ABOUT CBC
              </h3>
              <p className="text-white text-lg md:text-xl leading-relaxed font-light drop-shadow-md mb-4">
                Code Breaker Challenge (CBC) is a national-level 24-hour hackathon providing students with a platform to transform ideas into practical solutions for real-world problems.
              </p>
              <p className="text-white text-lg md:text-xl leading-relaxed font-light drop-shadow-md">
                Our mission is to empower students to move beyond theoretical learning. Through Think. Build. Break Limits., we foster original thinking, teamwork, and the confidence to turn ideas into working solutions.
              </p>
            </div>
            <div className="hidden md:flex flex-1 justify-end">
              <div className="w-24 h-1 bg-gradient-to-r from-transparent to-[#FBBF24] rounded-full shadow-[0_0_20px_rgba(251,191,36,0.8)]" />
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};


export default AboutSection;
