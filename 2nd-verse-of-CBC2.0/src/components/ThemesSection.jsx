import { motion } from 'framer-motion';
import { Code2, Cpu, ShieldAlert } from 'lucide-react';
import TiltCard from './TiltCard';
const ThemesSection = () => {
  const tracks = [
    { 
      title: "Software & Web Development", 
      icon: <Code2 size={40} />, 
      color: "#00F3FF", 
      desc: "Full-stack applications, websites, platforms, and UI/UX design projects." 
    },
    { 
      title: "Artificial Intelligence (AI) & Machine Learning (ML)", 
      icon: <Cpu size={40} />, 
      color: "#A855F7", 
      desc: "Data-driven solutions, predictive models, natural language processing, and intelligent systems." 
    },
    { 
      title: "Cybersecurity", 
      icon: <ShieldAlert size={40} />, 
      color: "#22C55E", 
      desc: "Ethical hacking, security tools, vulnerability detection, and secure system design." 
    }
  ];

  return (
    <section id="themes" className="py-24 px-4 relative z-10 scroll-mt-20 overflow-hidden">
      <div className="max-w-6xl mx-auto relative">
        <motion.h2 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-4xl md:text-6xl font-orbitron font-bold text-center mb-16 uppercase"
        >
        <span className="text-[#00F3FF] glow-cyan">Domains</span>
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 perspective-[1000px]">
          {tracks.map((track, idx) => (
            <TiltCard key={idx} className="group hover:border-white/30 transition-colors duration-500">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-125"
                style={{ backgroundColor: `${track.color}15`, color: track.color, boxShadow: `0 0 20px ${track.color}40` }}
              >
                {track.icon}
              </div>
              <h3 className="text-2xl font-orbitron font-bold mb-4">{track.title}</h3>
              <p className="text-gray-400">{track.desc}</p>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
};


export default ThemesSection;
