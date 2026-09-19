import { useState } from 'react';
import { motion } from 'framer-motion';

const GlimpsesSection = () => {
  const [hoveredIndex, setHoveredIndex] = useState(0);

  const glimpses = [
    { id: 1, src: '/glimpses/1.png', title: 'INNOVATION', subtitle: 'TEAMS BUILDING THE FUTURE' },
    { id: 2, src: '/glimpses/2.png', title: 'COLLABORATION', subtitle: '24 HOURS OF SYNERGY' },
    { id: 3, src: '/glimpses/3.png', title: 'EXCELLENCE', subtitle: 'PUSHING BOUNDARIES' },
    { id: 4, src: '/glimpses/4.png', title: 'COMMUNITY', subtitle: 'THE CBC VIBE' },
    { id: 5, src: '/glimpses/5.png', title: 'IMPACT', subtitle: 'REAL WORLD SOLUTIONS' },
  ];

  return (
    // 'snap-start' ensures the entire section locks into the viewport
    <section className="relative z-50 h-[100dvh] w-full bg-[#010103] overflow-hidden snap-start flex flex-col items-center justify-center border-y border-white/5">
      
      {/* Title block placed above gallery */}
      <div className="w-full text-center px-4 pt-16 md:pt-24 pb-6 md:pb-10 z-20">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-6xl font-orbitron font-black uppercase tracking-wider text-white"
        >
          GLIMPSES OF CBC 1.0
        </motion.h2>
      </div>

      {/* Accordion Gallery */}
      <div className="flex w-full flex-1 p-2 md:px-8 md:pb-12 gap-2 md:gap-4">
        {glimpses.map((item, idx) => {
          const isActive = hoveredIndex === idx;
          
          return (
            <motion.div
              key={item.id}
              className="relative rounded-2xl md:rounded-[2rem] overflow-hidden cursor-pointer group bg-white/5 border border-white/10"
              onHoverStart={() => setHoveredIndex(idx)}
              onClick={() => setHoveredIndex(idx)} // For mobile
              animate={{ 
                flex: isActive ? 6 : 1, // The active item takes 6x the space
                opacity: isActive ? 1 : 0.6
              }}
              transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
            >
              {/* Background Image (Always Cover, blurs when active) */}
              <img 
                src={item.src} 
                alt={item.title} 
                className={`absolute inset-0 w-full h-full object-cover origin-center transition-all duration-700 ease-[0.32,0.72,0,1] ${isActive ? 'scale-125 blur-xl opacity-40' : 'group-hover:scale-[1.02] opacity-100'}`}
                onError={(e) => {
                  e.target.style.display='none';
                  e.target.nextSibling.style.display='flex';
                }}
              />
              
              {/* Foreground Image (Only Visible when Active, Object Contain to preserve 100% of the image) */}
              <motion.img 
                src={item.src} 
                alt={item.title}
                className="absolute inset-0 w-full h-full object-contain pointer-events-none drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]"
                initial={{ opacity: 0 }}
                animate={{ opacity: isActive ? 1 : 0 }}
                transition={{ duration: 0.5, delay: isActive ? 0.1 : 0 }}
              />

              {/* Fallback pattern if image missing */}
              <div className="hidden absolute inset-0 bg-[#00F3FF]/5 items-center justify-center">
                <span className="text-gray-500 font-mono text-xs rotate-90 md:rotate-0 tracking-widest opacity-50">IMAGE_{item.id}</span>
              </div>

              {/* Dark Gradient Overlay */}
              <div 
                className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`} 
              />

              {/* Text Content inside the expanded slide */}
              <motion.div 
                className="absolute bottom-8 left-8 right-8 z-20 flex flex-col"
                animate={{ 
                  opacity: isActive ? 1 : 0, 
                  y: isActive ? 0 : 20 
                }}
                transition={{ duration: 0.5, delay: isActive ? 0.2 : 0 }}
              >
                <div className="flex items-center gap-4 mb-2 overflow-hidden">
                  <div className="w-8 h-[1px] bg-[#00F3FF]" />
                  <span className="text-[#00F3FF] font-mono text-sm tracking-[0.2em] uppercase whitespace-nowrap">
                    {item.subtitle}
                  </span>
                </div>
                <h3 className="text-3xl md:text-5xl font-orbitron font-bold text-white uppercase tracking-wider whitespace-nowrap overflow-hidden">
                  {item.title}
                </h3>
              </motion.div>

              {/* Vertical Title for non-active slides */}
              <motion.div 
                className="absolute inset-0 z-20 flex items-center justify-center mix-blend-overlay"
                animate={{ opacity: isActive ? 0 : 1 }}
                transition={{ duration: 0.3 }}
              >
                <span className="text-white font-orbitron font-bold text-2xl tracking-[0.3em] uppercase rotate-[-90deg] whitespace-nowrap">
                  {item.title}
                </span>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default GlimpsesSection;
