import React, { useState, useEffect } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { rtdb } from '../firebase';
import { Play, Pause, SkipForward, VolumeX, Volume2, MonitorPlay } from 'lucide-react';

export default function AdminMediaControls() {
  const [boardState, setBoardState] = useState({
    isPlaying: true,
    isMuted: true,
    forceSkipToken: 0
  });

  useEffect(() => {
    const boardRef = ref(rtdb, 'smartboard/controls');
    
    const unsubscribe = onValue(boardRef, (snapshot) => {
      if (snapshot.exists()) {
        setBoardState(snapshot.val());
      }
    });

    return () => unsubscribe();
  }, []);

  const updateControls = async (updates) => {
    try {
      const boardRef = ref(rtdb, 'smartboard/controls');
      await set(boardRef, { ...boardState, ...updates });
    } catch (error) {
      console.error("Failed to update SmartBoard controls", error);
      alert("Failed to update SmartBoard controls.");
    }
  };

  const handleTogglePlay = () => updateControls({ isPlaying: !boardState.isPlaying });
  const handleToggleMute = () => updateControls({ isMuted: !boardState.isMuted });
  const handleSkip = () => updateControls({ forceSkipToken: (boardState.forceSkipToken || 0) + 1 });

  return (
    <div className="bg-[#14171b] border border-[#242a30] rounded-xl p-6 md:p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-[#BC13FE]/10 rounded-lg text-[#BC13FE]">
          <MonitorPlay size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">SmartBoard Media Controls</h2>
          <p className="text-sm text-gray-400">Remotely control the stage display video and audio without reloading it.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Play / Pause */}
        <button
          onClick={handleTogglePlay}
          className={`flex flex-col items-center justify-center p-8 rounded-2xl border transition-all ${
            boardState.isPlaying 
              ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981] hover:bg-[#10B981]/20' 
              : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/20'
          }`}
        >
          {boardState.isPlaying ? <Pause size={48} className="mb-4" /> : <Play size={48} className="mb-4" />}
          <span className="font-bold uppercase tracking-widest">{boardState.isPlaying ? 'Pause Video' : 'Play Video'}</span>
        </button>

        {/* Mute / Unmute */}
        <button
          onClick={handleToggleMute}
          className={`flex flex-col items-center justify-center p-8 rounded-2xl border transition-all ${
            !boardState.isMuted 
              ? 'bg-[#3b82f6]/10 border-[#3b82f6]/30 text-[#3b82f6] hover:bg-[#3b82f6]/20' 
              : 'bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20'
          }`}
        >
          {boardState.isMuted ? <VolumeX size={48} className="mb-4" /> : <Volume2 size={48} className="mb-4" />}
          <span className="font-bold uppercase tracking-widest">{boardState.isMuted ? 'Unmute Audio' : 'Mute Audio'}</span>
        </button>

        {/* Skip Forward */}
        <button
          onClick={handleSkip}
          className="flex flex-col items-center justify-center p-8 rounded-2xl border bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-all active:scale-95"
        >
          <SkipForward size={48} className="mb-4" />
          <span className="font-bold uppercase tracking-widest">Skip Scene</span>
        </button>
      </div>
    </div>
  );
}
