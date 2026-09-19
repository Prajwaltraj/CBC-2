import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const PagePreloader = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500); // 2.5 seconds preloader
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="preloader"
          initial={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)" }}
          exit={{ 
            clipPath: "polygon(100% 0, 100% 0, 100% 100%, 100% 100%)",
            transition: { duration: 1.2, ease: [0.77, 0, 0.175, 1] } 
          }}
          className="fixed inset-0 z-[99999] bg-black flex flex-col items-center justify-center overflow-hidden origin-right"
        >
          {/* Oversized Experimental Typography */}
          <motion.div
            initial={{ opacity: 0, scale: 1.1, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="flex flex-col items-center text-white mix-blend-difference"
          >
            <h1 className="text-[15vw] md:text-[12vw] font-black font-orbitron leading-none tracking-tighter uppercase whitespace-nowrap">
              Yuga <span className="text-transparent bg-clip-text" style={{ WebkitTextStroke: '2px white' }}>Style</span>
            </h1>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PagePreloader;
