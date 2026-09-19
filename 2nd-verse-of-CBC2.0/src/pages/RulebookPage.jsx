import NavigationBar from '../components/NavigationBar';
import NeuralBackground from '../components/NeuralBackground';
import { motion } from 'framer-motion';

const RulebookPage = () => {
  return (
    <div className="w-full max-w-full overflow-x-hidden bg-[#F4F6F9] dark:bg-[#010103] text-gray-900 dark:text-[#F0F0F0] selection:bg-[#00F3FF]/30 selection:text-black dark:selection:text-white min-h-screen relative transition-colors duration-300 flex flex-col pb-12">
      <NeuralBackground />
      <NavigationBar />
      
      <div className="flex-1 flex flex-col items-center justify-center pt-28 px-4 relative z-10 w-full">
        <div className="max-w-4xl w-full mx-auto flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <h1 className="text-3xl md:text-5xl font-orbitron font-bold uppercase tracking-wider mb-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F3FF] to-[#A855F7]">CBC 2.0</span> RULEBOOK
            </h1>
            <p className="text-gray-400 font-mono text-xs md:text-sm uppercase tracking-widest">
              Please read the comprehensive guidelines carefully.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-3xl h-[85vh] glass-panel rounded-3xl p-2 shadow-[0_0_50px_rgba(0,243,255,0.1)] border border-[#00F3FF]/20 flex flex-col relative"
          >
            {/* The PDF viewer */}
            <iframe 
              src="/Rulebook.pdf#toolbar=0&navpanes=0&scrollbar=0&view=FitH" 
              className="w-full h-full rounded-2xl bg-[#010103]"
              title="CBC 2.0 Rulebook"
            />
            
            {/* Fallback download button for mobile users who can't load PDF in iframe */}
            <div className="mt-4 flex justify-center pb-2 md:hidden">
              <a 
                href="/Rulebook.pdf" 
                download 
                className="px-6 py-2 rounded-full border border-[#00F3FF]/50 text-[#00F3FF] font-mono text-xs uppercase tracking-widest hover:bg-[#00F3FF]/10 transition-colors"
              >
                Download PDF
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RulebookPage;
