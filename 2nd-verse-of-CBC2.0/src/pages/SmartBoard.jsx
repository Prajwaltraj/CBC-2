import React, { useState, useEffect, useRef } from 'react';
import { rtdb } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { AlertTriangle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const BoardTemplate = ({ data, isPreview = false }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hasPoster = !!data?.posterUrl;
  const statement = data?.statement || "AWAITING DIRECTIVES...";
  const isUrgent = data?.triggerSiren;

  return (
    <div className={`w-full h-full bg-[#010103] flex flex-col relative overflow-hidden ${isUrgent ? 'border-8 border-red-500' : ''}`}>
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#00F3FF]/5 via-transparent to-[#A855F7]/5 pointer-events-none" />
      {isUrgent && (
        <motion.div 
          animate={{ opacity: [0, 0.2, 0] }} 
          transition={{ repeat: Infinity, duration: 1 }}
          className="absolute inset-0 bg-red-500 pointer-events-none"
        />
      )}

      {/* Header */}
      <header className={`px-8 py-6 border-b flex justify-between items-center ${isUrgent ? 'border-red-500/30 bg-red-500/10' : 'border-white/10 bg-black/40'}`}>
        <div className="flex items-center gap-4">
          <img src="https://codebreakerchallenge2o.vercel.app/logos/cbc2ologo.PNG" alt="CBC 2.0" className="h-12 w-12 object-contain" />
          <div>
            <h1 className="text-2xl font-orbitron font-bold text-white tracking-widest uppercase">CBC 2.0</h1>
            <p className="text-xs font-mono text-[#00F3FF] tracking-widest uppercase">Live Broadcast System</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          {isUrgent && (
            <div className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full font-bold font-mono animate-pulse">
              <AlertTriangle size={20} /> URGENT
            </div>
          )}
          <div className="text-right">
            <div className="text-2xl font-mono font-bold text-white tracking-wider">{time.toLocaleTimeString()}</div>
            <div className="text-xs font-mono text-gray-400 uppercase">{time.toLocaleDateString()}</div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-12 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div 
            key={data?.timestamp || 'empty'}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.5 }}
            className={`w-full max-w-7xl flex flex-col ${hasPoster ? 'lg:flex-row' : ''} items-center gap-16`}
          >
            {hasPoster && (
              <div className="w-full lg:w-1/2 flex justify-center">
                <div className="relative group p-1 rounded-2xl bg-gradient-to-br from-[#00F3FF]/50 to-[#A855F7]/50 shadow-[0_0_50px_rgba(0,243,255,0.1)]">
                  <div className="absolute inset-0 bg-black rounded-2xl" />
                  <img src={data.posterUrl} alt="Broadcast Poster" className="relative z-10 w-full h-auto max-h-[60vh] rounded-xl object-contain" />
                </div>
              </div>
            )}
            
            <div className={`w-full ${hasPoster ? 'lg:w-1/2 text-left' : 'text-center'}`}>
              {!data && (
                <img src="https://codebreakerchallenge2o.vercel.app/logos/cbc2ologo.PNG" alt="CBC 2.0" className="w-48 h-48 mx-auto mb-12 opacity-20 grayscale" />
              )}
              <h2 className={`font-orbitron font-black text-white leading-[1.2] uppercase tracking-wide ${hasPoster ? (isPreview ? 'text-4xl' : 'text-5xl lg:text-7xl') : (isPreview ? 'text-5xl' : 'text-7xl lg:text-9xl')} ${isUrgent ? 'text-red-400' : ''}`}>
                {statement}
              </h2>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="px-8 py-4 border-t border-white/10 bg-black/40 flex justify-between items-center text-gray-500 font-mono text-sm uppercase">
        <div className="flex items-center gap-3">
          <img src="https://codebreakerchallenge2o.vercel.app/logos/gatlockuplogo.png" alt="GAT" className="h-6 object-contain grayscale opacity-50" />
          <span>Global Academy of Technology</span>
        </div>
        <div className="flex gap-4">
          <span>Dept of AI & ML</span>
          <span>•</span>
          <span>The 2nd Verse</span>
        </div>
      </footer>
    </div>
  );
};

const SmartBoard = () => {
  const [data, setData] = useState(null);
  const audioRef = useRef(null);
  const [interacted, setInteracted] = useState(false);

  useEffect(() => {
    const broadcastRef = ref(rtdb, 'broadcast/current');
    const unsubscribe = onValue(broadcastRef, (snapshot) => {
      const val = snapshot.val();
      setData(val);
      
      if (val?.triggerSiren && audioRef.current) {
        audioRef.current.play().catch(e => console.log("Audio play blocked. Click screen."));
      } else if (!val?.triggerSiren && audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    });
    return () => unsubscribe();
  }, []);

  const handleInteraction = () => {
    setInteracted(true);
    if (audioRef.current) {
      if (data?.triggerSiren) {
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      } else {
        audioRef.current.play().then(() => {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }).catch(e => console.error("Audio unlock failed:", e));
      }
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden" onClick={handleInteraction}>
      <audio ref={audioRef} src="https://actions.google.com/sounds/v1/alarms/beeping_alarm.ogg" loop />
      {!interacted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm text-white font-mono text-xl cursor-pointer">
          Click anywhere to initialize display audio
        </div>
      )}
      <BoardTemplate data={data} />
    </div>
  );
};

export default SmartBoard;
