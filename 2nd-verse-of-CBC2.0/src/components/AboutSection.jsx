
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
          <span className="text-white">Break Limits.</span>
        </h2>
        <p className="text-gray-300 text-lg md:text-xl leading-relaxed font-light mb-6">
          The 2nd Verse of Code Breaker Challenge 2.0 is here. Gather your brightest minds to build solutions that defy conventional boundaries. 
          24 hours to ideate, prototype, and deploy the future of technology.
        </p>
      </motion.div>
    </div>
  </section>
);


export default AboutSection;
