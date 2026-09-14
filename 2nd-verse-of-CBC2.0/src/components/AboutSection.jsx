import { motion } from 'framer-motion';

const BUTTERY_EASE = [0.22, 1, 0.36, 1];


const AboutSection = () => (
  <section id="about" className="py-24 px-4 relative z-10 overflow-hidden min-h-[60vh] flex items-center justify-center scroll-mt-20">
    <div className="max-w-4xl mx-auto relative z-10 text-center">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1.2, ease: BUTTERY_EASE }}
        className="glass-panel p-8 md:p-16 rounded-3xl shadow-[0_0_50px_rgba(0,243,255,0.05)] border-t border-[#00F3FF]/20"
      >
        <h2 className="text-3xl md:text-5xl font-orbitron font-bold mb-8">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F3FF] to-white">Think.</span>{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-yellow-400">Build.</span>{' '}
          <span className="text-black dark:text-white">Break Limits.</span>
        </h2>
        <h3 className="text-xl md:text-2xl font-orbitron font-bold text-[#00F3FF] mb-4 text-left">WHAT IS CBC?</h3>
        <p className="text-gray-700 dark:text-gray-300 text-base md:text-lg leading-relaxed font-light mb-10 text-left">
          Code Breaker Challenge (CBC) is a national-level 24-hour hackathon organized by the Department of Artificial Intelligence & Machine Learning, Global Academy of Technology, Bengaluru. It provides students with a platform to transform ideas into practical solutions for real-world problems through design, implementation and presentation, while encouraging innovation, technical excellence and collaborative problem-solving.
        </p>

        <h3 className="text-xl md:text-2xl font-orbitron font-bold text-[#00F3FF] mb-4 text-left">OUR MISSION</h3>
        <p className="text-gray-700 dark:text-gray-300 text-base md:text-lg leading-relaxed font-light mb-10 text-left">
          The mission of CBC 2.0 is to empower students to move beyond theoretical learning and create meaningful, technology-driven solutions. Through Think. Build. Break Limits., the event aims to foster original thinking, practical application of AI, ML and emerging technologies, teamwork, and the confidence to turn ideas into working solutions with real-world relevance.
        </p>

        <h3 className="text-xl md:text-2xl font-orbitron font-bold text-[#00F3FF] mb-4 text-left">ABOUT GAT & AIML</h3>
        <p className="text-gray-700 dark:text-gray-300 text-base md:text-lg leading-relaxed font-light mb-6 text-left">
          Established in 2001, Global Academy of Technology (GAT) is a leading Engineering and Management institute in Bengaluru combining academic excellence with industry exposure. The AI & ML Department fosters innovation through hands-on learning, student clubs like CTRL Club, and flagship events like CBC to build future-ready talent.
        </p>
      </motion.div>
    </div>
  </section>
);


export default AboutSection;
