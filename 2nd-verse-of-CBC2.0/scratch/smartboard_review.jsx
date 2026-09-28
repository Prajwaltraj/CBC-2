import { useState, useEffect, useRef, useCallback } from 'react';
import { rtdb } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { AlertTriangle, Volume2, VolumeX, BellRing } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProgressiveImage from '../components/ProgressiveImage';
import ReactPlayer from 'react-player';

export const BoardTemplate = ({ data, isPreview = false, isMuted = false }) => {
  const [time, setTime] = useState(new Date());
  const playerRef = useRef(null);
  const prevSeekRef = useRef(null);

  useEffect(() => {
    if (data?.videoState?.lastSeek && data.videoState.lastSeek.id !== prevSeekRef.current) {
      if (playerRef.current) {
        playerRef.current.seekTo(data.videoState.lastSeek.time, 'seconds');
      }
      prevSeekRef.current = data.videoState.lastSeek.id;
    }
  }, [data?.videoState?.lastSeek]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hasPoster = !!data?.posterUrl;
  const isVideo = hasPoster && (data.posterUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/))([^&?]*)/) || data.posterUrl.match(/\.(mp4|webm|mov|ogg|m4v)(\?.*)?$/i));
  const statement = data?.statement || "AWAITING DIRECTIVES...";
  const isUrgent = !!data?.triggerSiren;

  return (
    <div className={`w-full h-full bg-[#010103] flex flex-col relative overflow-hidden ${isUrgent ? 'border-8 border-red-500' : ''}`}>
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#00F3FF]/5 via-transparent to-[#A855F7]/5 pointer-events-none" />
      {isUrgent && (
        <motion.div 
          animate={{ opacity: [0, 0.25, 0] }} 
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="absolute inset-0 bg-red-500 pointer-events-none"
        />
      )}

      {/* Header */}
      <header className={`px-8 py-6 border-b flex justify-between items-center transition-colors duration-300 ${isUrgent ? 'border-red-500/50 bg-red-500/20' : 'border-black/20 dark:border-white/10 bg-white/60 dark:bg-black/40'}`}>
        <div className="flex items-center gap-4">
          <ProgressiveImage src="/team/cbc logo.png" alt="CBC 2.0" className="h-12 w-12 object-contain" />
          <div>
            <h1 className="text-2xl font-orbitron font-bold text-white tracking-widest uppercase">CBC 2.0</h1>
            <p className="text-xs font-mono text-[#00F3FF] tracking-widest uppercase">Live Broadcast System</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          {isUrgent && (
            <div className="flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-full font-bold font-mono tracking-wider animate-pulse shadow-[0_0_25px_rgba(239,68,68,0.6)]">
              <AlertTriangle size={22} className="animate-bounce" /> EMERGENCY BROADCAST
            </div>
          )}
          <div className="text-right">
            <div className="text-2xl font-mono font-bold text-white tracking-wider">{time.toLocaleTimeString()}</div>
            <div className="text-xs font-mono text-gray-400 uppercase">{time.toLocaleDateString()}</div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-8 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div 
            key={data?.timestamp || 'empty'}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.5 }}
            className={`w-full ${isVideo ? 'max-w-[95vw]' : 'max-w-7xl'} flex flex-col ${hasPoster && !isVideo ? 'lg:flex-row' : ''} items-center justify-center gap-10`}
          >
            {hasPoster && (
              <div className={`w-full ${isVideo ? 'lg:w-[85%] max-w-6xl' : 'lg:w-1/2'} flex justify-center`}>
                <div className={`relative group p-1 rounded-2xl bg-gradient-to-br from-[#00F3FF]/50 to-[#A855F7]/50 shadow-[0_0_50px_rgba(0,243,255,0.1)] ${isVideo ? 'w-full' : ''}`}>
                  <div className="absolute inset-0 bg-white dark:bg-black rounded-2xl" />
                  {(() => {
                    if (isVideo) {
                      return (
                        <div className="relative z-10 w-full aspect-video max-h-[60vh] rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                          <ReactPlayer 
                            ref={playerRef}
                            url={data.posterUrl}
                            playing={data?.videoState?.playing ?? true}
                            muted={isMuted}
                            controls={false}
                            width="100%"
                            height="100%"
                            style={{ pointerEvents: 'none' }}
                            onReady={(player) => {
                              if (data?.videoState?.lastSeek) {
                                player.seekTo(data.videoState.lastSeek.time, 'seconds');
                              }
                            }}
                          />
                        </div>
                      );
                    }
                    return (
                      <ProgressiveImage src={data.posterUrl} alt="Broadcast Poster" className="relative z-10 w-full h-auto max-h-[60vh] rounded-xl object-contain" />
                    );
                  })()}
                </div>
              </div>
            )}
            
            <div className={`w-full ${hasPoster && !isVideo ? 'lg:w-1/2 text-left' : 'text-center'}`}>
              {!data && (
                <ProgressiveImage src="/team/cbc logo.png" alt="CBC 2.0" className="w-48 h-48 mx-auto mb-12 opacity-20 grayscale" />
              )}
              <h2 className={`font-orbitron font-black text-white leading-[1.2] uppercase tracking-wide break-words max-w-full px-4 ${hasPoster && !isVideo ? (isPreview ? 'text-4xl' : 'text-5xl lg:text-7xl') : (isPreview ? 'text-3xl' : 'text-5xl lg:text-6xl max-w-5xl mx-auto')} ${isUrgent ? 'text-red-400 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]' : ''}`}>
                {statement}
              </h2>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
