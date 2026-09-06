import { useState, useEffect, useRef, useCallback } from 'react';
import { rtdb } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { AlertTriangle, Volume2, VolumeX, BellRing } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Resilient Web Audio API Siren Synthesizer
class SirenSoundEngine {
  constructor() {
    this.ctx = null;
    this.osc1 = null;
    this.osc2 = null;
    this.lfo = null;
    this.lfoGain = null;
    this.gainNode = null;
    this.isPlaying = false;
  }

  init() {
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    } catch (e) {
      console.warn('AudioContext init error:', e);
    }
  }

  start() {
    this.init();
    if (this.isPlaying || !this.ctx) return;

    try {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const now = this.ctx.currentTime;

      // Master gain node
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(0.001, now);
      this.gainNode.gain.exponentialRampToValueAtTime(0.3, now + 0.08);
      this.gainNode.connect(this.ctx.destination);

      // Primary tone oscillator (sawtooth for sharp alarm presence)
      this.osc1 = this.ctx.createOscillator();
      this.osc1.type = 'sawtooth';
      this.osc1.frequency.setValueAtTime(800, now);

      // Secondary tone oscillator (triangle tone for rich body)
      this.osc2 = this.ctx.createOscillator();
      this.osc2.type = 'triangle';
      this.osc2.frequency.setValueAtTime(804, now);

      // LFO for emergency pitch wail (1.4 Hz modulation cycle)
      this.lfo = this.ctx.createOscillator();
      this.lfo.type = 'sine';
      this.lfo.frequency.setValueAtTime(1.4, now);

      this.lfoGain = this.ctx.createGain();
      this.lfoGain.gain.setValueAtTime(320, now); // Sweep between 480Hz and 1120Hz

      this.lfo.connect(this.lfoGain);
      this.lfoGain.connect(this.osc1.frequency);
      this.lfoGain.connect(this.osc2.frequency);

      this.osc1.connect(this.gainNode);
      this.osc2.connect(this.gainNode);

      this.osc1.start(now);
      this.osc2.start(now);
      this.lfo.start(now);

      this.isPlaying = true;
    } catch (e) {
      console.error('Failed to start Web Audio siren:', e);
    }
  }

  stop() {
    if (!this.isPlaying) return;
    try {
      if (this.gainNode && this.ctx) {
        const now = this.ctx.currentTime;
        this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
        this.gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
        setTimeout(() => this.cleanup(), 140);
      } else {
        this.cleanup();
      }
    } catch (e) {
      this.cleanup();
    }
  }

  cleanup() {
    try {
      if (this.osc1) { this.osc1.stop(); this.osc1.disconnect(); }
      if (this.osc2) { this.osc2.stop(); this.osc2.disconnect(); }
      if (this.lfo) { this.lfo.stop(); this.lfo.disconnect(); }
      if (this.lfoGain) { this.lfoGain.disconnect(); }
      if (this.gainNode) { this.gainNode.disconnect(); }
    } catch (e) {}
    this.osc1 = null;
    this.osc2 = null;
    this.lfo = null;
    this.lfoGain = null;
    this.gainNode = null;
    this.isPlaying = false;
  }
}

export const BoardTemplate = ({ data, isPreview = false }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hasPoster = !!data?.posterUrl;
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
      <header className={`px-8 py-6 border-b flex justify-between items-center transition-colors duration-300 ${isUrgent ? 'border-red-500/50 bg-red-500/20' : 'border-white/10 bg-black/40'}`}>
        <div className="flex items-center gap-4">
          <img src="https://codebreakerchallenge2o.vercel.app/logos/cbc2ologo.PNG" alt="CBC 2.0" className="h-12 w-12 object-contain" />
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
              <h2 className={`font-orbitron font-black text-white leading-[1.2] uppercase tracking-wide ${hasPoster ? (isPreview ? 'text-4xl' : 'text-5xl lg:text-7xl') : (isPreview ? 'text-5xl' : 'text-7xl lg:text-9xl')} ${isUrgent ? 'text-red-400 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]' : ''}`}>
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
  const [interacted, setInteracted] = useState(false);
  const [muted, setMuted] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const audioRef = useRef(null);
  const synthRef = useRef(null);

  // Initialize synth instance
  useEffect(() => {
    synthRef.current = new SirenSoundEngine();
    return () => {
      if (synthRef.current) {
        synthRef.current.stop();
      }
    };
  }, []);

  // Helper to start siren audio
  const startSirenSound = useCallback(() => {
    if (muted) return;
    
    // Play synthesized siren
    if (synthRef.current) {
      synthRef.current.start();
    }
    
    // Play fallback audio element
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.warn("HTML5 audio playback blocked/error:", e));
    }
  }, [muted]);

  // Helper to stop siren audio
  const stopSirenSound = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.stop();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  // Sync with Firebase Realtime Database
  useEffect(() => {
    const broadcastRef = ref(rtdb, 'broadcast/current');
    const unsubscribe = onValue(broadcastRef, (snapshot) => {
      const val = snapshot.val();
      setData(val);
      
      if (val?.triggerSiren && !muted) {
        startSirenSound();
      } else if (!val?.triggerSiren && !isTesting) {
        stopSirenSound();
      }
    });
    return () => {
      unsubscribe();
      stopSirenSound();
    };
  }, [muted, isTesting, startSirenSound, stopSirenSound]);

  // Handle mute changes
  useEffect(() => {
    if (muted) {
      stopSirenSound();
    } else if (data?.triggerSiren) {
      startSirenSound();
    }
  }, [muted, data?.triggerSiren, startSirenSound, stopSirenSound]);

  // Handle screen interaction/unlock
  const handleInteraction = () => {
    if (!interacted) {
      setInteracted(true);
    }
    if (synthRef.current) {
      synthRef.current.init();
    }
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        if (!data?.triggerSiren && !isTesting) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
      }).catch(e => console.warn("Audio unlock attempted:", e));
    }

    if (data?.triggerSiren && !muted) {
      startSirenSound();
    }
  };

  // Test siren sound for 3 seconds
  const handleTestSiren = (e) => {
    e.stopPropagation();
    handleInteraction();
    if (isTesting) return;

    setIsTesting(true);
    startSirenSound();

    setTimeout(() => {
      setIsTesting(false);
      if (!data?.triggerSiren) {
        stopSirenSound();
      }
    }, 3000);
  };

  const isUrgent = !!data?.triggerSiren;

  return (
    <div className="w-screen h-screen overflow-hidden relative select-none" onClick={handleInteraction}>
      {/* Audio fallback tag pointing to local siren.wav */}
      <audio ref={audioRef} src="/siren.wav" loop preload="auto" />

      {/* Unlocked overlay / Prompt */}
      {!interacted && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md text-white font-mono cursor-pointer transition-all">
          <div className="bg-[#0F1014] border border-white/20 p-8 rounded-2xl shadow-2xl flex flex-col items-center text-center max-w-lg mx-4">
            <div className="w-16 h-16 rounded-full bg-[#00F3FF]/10 text-[#00F3FF] flex items-center justify-center mb-5 animate-pulse">
              <BellRing size={32} />
            </div>
            <h3 className="text-xl font-bold font-orbitron mb-2 uppercase tracking-wider text-white">
              Initialize Display Audio
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Click anywhere to activate the sound engine and enable emergency siren alerts for live broadcasts.
            </p>
            <button className="px-6 py-3 bg-gradient-to-r from-[#00F3FF] to-[#A855F7] text-black font-bold rounded-lg tracking-wider uppercase text-sm shadow-[0_0_20px_rgba(0,243,255,0.4)] hover:opacity-90 transition-opacity">
              Enable Audio Output
            </button>
          </div>
        </div>
      )}

      {/* If siren is triggered while user hasn't interacted yet */}
      {isUrgent && !interacted && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-3 rounded-full font-bold font-mono tracking-wider animate-bounce shadow-[0_0_30px_rgba(239,68,68,0.9)] cursor-pointer flex items-center gap-3">
          <AlertTriangle size={24} /> CLICK TO UNMUTE EMERGENCY SIREN!
        </div>
      )}

      {/* HUD Audio Controls (Discrete bottom-right panel) */}
      <div 
        className="fixed bottom-4 right-6 z-40 flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full text-xs font-mono text-gray-300 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={() => setMuted(!muted)}
          title={muted ? "Unmute Siren" : "Mute Siren"}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-colors ${
            muted ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'hover:bg-white/10 text-gray-300'
          }`}
        >
          {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          <span>{muted ? "Muted" : (isUrgent || isTesting ? "Siren Active" : "Audio On")}</span>
        </button>

        <span className="text-white/20">|</span>

        <button 
          onClick={handleTestSiren}
          disabled={isTesting}
          className={`px-2.5 py-1 rounded-full transition-colors text-[11px] uppercase tracking-wider ${
            isTesting 
              ? 'bg-red-600 text-white animate-pulse' 
              : 'hover:bg-white/10 text-[#00F3FF]'
          }`}
        >
          {isTesting ? "Testing (3s)..." : "Test Siren"}
        </button>
      </div>

      <BoardTemplate data={data} />
    </div>
  );
};

export default SmartBoard;

