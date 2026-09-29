import React, { useState, useEffect, useRef, useCallback } from 'react';
import { rtdb } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { Volume2, VolumeX, AlertTriangle, BellRing } from 'lucide-react';
import ReactPlayer from 'react-player';

// Sound frequencies and patterns matching the Hackathon Broadcast display
const PATTERNS = {
  info: { wave: 'sine', notes: [[660, 0, 0.18], [880, 0.15, 0.22]], gap: 0.15 },
  success: { wave: 'triangle', notes: [[523, 0, 0.14], [659, 0.12, 0.14], [784, 0.24, 0.14], [1047, 0.38, 0.30]], gap: 0.15 },
  warning: { wave: 'square', notes: [[700, 0, 0.13], [500, 0.16, 0.13], [700, 0.32, 0.13], [500, 0.48, 0.13]], gap: 0.15 },
  urgent: { wave: 'sawtooth', notes: [[880, 0, 0.11], [660, 0.11, 0.11], [880, 0.22, 0.11], [660, 0.33, 0.11], [880, 0.44, 0.11], [660, 0.55, 0.11]], gap: 0.1 }
};

const LABELS = {
  info: 'Announcement',
  success: 'Good news',
  warning: 'Heads up',
  urgent: 'Urgent Notice'
};

const ALERT_DURATION_SECONDS = 3;

/**
 * Web Audio Engine Hook / Helper
 */
function useAudioEngine() {
  const audioCtxRef = useRef(null);
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current) {
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().then(() => {
          if (audioCtxRef.current?.state === 'running') {
            setIsAudioUnlocked(true);
          }
        }).catch(() => {});
      } else if (audioCtxRef.current.state === 'running') {
        setIsAudioUnlocked(true);
      }
    }
    return audioCtxRef.current;
  }, []);

  const playTone = useCallback((freq, start, duration, waveform, volume = 0.15) => {
    const ctx = getAudioContext();
    if (!ctx || ctx.state !== 'running') return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = waveform;
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(volume, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration + 0.02);
    } catch (err) {
      console.warn('Audio tone play error:', err);
    }
  }, [getAudioContext]);

  const playAlertForDuration = useCallback((type = 'info', totalSeconds = ALERT_DURATION_SECONDS) => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const pattern = PATTERNS[type] || PATTERNS.info;
    const lastNote = pattern.notes[pattern.notes.length - 1];
    const repeatLength = lastNote[1] + lastNote[2] + pattern.gap;
    const now = ctx.currentTime;
    let t = 0;
    while (t < totalSeconds) {
      pattern.notes.forEach(([freq, offset, duration]) => {
        if (t + offset < totalSeconds) {
          playTone(freq, now + t + offset, duration, pattern.wave, 0.15);
        }
      });
      t += repeatLength;
    }
  }, [getAudioContext, playTone]);

  const playTypingTick = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx || ctx.state !== 'running') return;
    const now = ctx.currentTime;
    const freq = 180 + Math.random() * 90;
    playTone(freq, now, 0.025, 'square', 0.04);
  }, [getAudioContext, playTone]);

  return {
    getAudioContext,
    isAudioUnlocked,
    setIsAudioUnlocked,
    playAlertForDuration,
    playTypingTick
  };
}

/**
 * BoardTemplate - Used both on /board and in /admin live preview
 */
export const BoardTemplate = ({
  data,
  isPreview = false,
  isMuted = false,
  isAlerting = false,
  typedHeadline = '',
  isTyping = false,
  showMessage = true,
  isPlaying = true,
  forceSkipToken = 0
}) => {
  const [time, setTime] = useState(new Date());
  const playerRef = useRef(null);
  const prevSeekRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (data?.videoState?.lastSeek && data.videoState.lastSeek.id !== prevSeekRef.current) {
      if (playerRef.current) {
        playerRef.current.seekTo(data.videoState.lastSeek.time, 'seconds');
      }
      prevSeekRef.current = data.videoState.lastSeek.id;
    }
  }, [data?.videoState?.lastSeek]);

  useEffect(() => {
    if (playerRef.current && forceSkipToken > 0) {
      playerRef.current.seekTo(playerRef.current.getCurrentTime() + 10, "seconds");
    }
  }, [forceSkipToken]);

  // Extract fields with full backward compatibility
  const hasData = !!(data && (data.title || data.statement || data.posterUrl));
  const rawTitle = data?.title || data?.statement || '';
  // Only show secondary message if it's explicitly provided and distinct from the title
  const rawMessage = (data?.message && data.message !== rawTitle && data.message !== data?.statement) ? data.message : '';
  const type = data?.type || (data?.triggerSiren ? 'urgent' : 'info');
  const posterUrl = data?.posterUrl || '';

  // Safe time formatting to prevent "Invalid Date"
  let receivedTime = time.toLocaleTimeString();
  if (data?.time) {
    receivedTime = data.time;
  } else if (data?.timestamp && typeof data.timestamp === 'number') {
    receivedTime = new Date(data.timestamp).toLocaleTimeString();
  } else if (data?.timestamp && typeof data.timestamp === 'string' && data.timestamp !== 'preview') {
    const parsed = Date.parse(data.timestamp);
    if (!isNaN(parsed)) {
      receivedTime = new Date(parsed).toLocaleTimeString();
    }
  }

  const isVideo = posterUrl && (
    posterUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/))([^&?]*)/) ||
    posterUrl.match(/\.(mp4|webm|mov|ogg|m4v)(\?.*)?$/i)
  );

  // When actively typing in sequence, show partial text; otherwise always show full title
  const displayTitle = isPreview
    ? rawTitle
    : (isTyping ? typedHeadline : (rawTitle || ''));

  const statusLabel = isAlerting ? 'Incoming…' : (LABELS[type] || 'Announcement');

  const themeColors = {
    info: {
      border: 'border-[#7c5cff]',
      tag: 'text-[#7c5cff] bg-[#7c5cff]/15 border-[#7c5cff]/30',
      glow: 'shadow-[0_20px_60px_rgba(124,92,255,0.15)]'
    },
    success: {
      border: 'border-[#33e0a1]',
      tag: 'text-[#33e0a1] bg-[#33e0a1]/15 border-[#33e0a1]/30',
      glow: 'shadow-[0_20px_60px_rgba(51,224,161,0.15)]'
    },
    warning: {
      border: 'border-[#ffb454]',
      tag: 'text-[#ffb454] bg-[#ffb454]/15 border-[#ffb454]/30',
      glow: 'shadow-[0_20px_60px_rgba(255,180,84,0.15)]'
    },
    urgent: {
      border: 'border-[#ff5c68]',
      tag: 'text-[#ff5c68] bg-[#ff5c68]/15 border-[#ff5c68]/30',
      glow: 'shadow-[0_20px_70px_rgba(255,92,104,0.35)] animate-pulse'
    }
  };

  const currentTheme = themeColors[type] || themeColors.info;

  return (
    <div
      className="w-full h-full min-h-screen bg-[#0b0d10] text-[#e8ecef] flex flex-col justify-between items-center relative overflow-hidden select-none p-6 md:p-10 font-sans"
      style={{
        background: 'radial-gradient(circle at 20% 15%, rgba(124, 92, 255, .10), transparent 45%), radial-gradient(circle at 85% 80%, rgba(51, 224, 161, .08), transparent 45%), #0b0d10'
      }}
    >
      {/* Top Header / Branding Bar */}
      <header className="w-full flex justify-between items-center z-10">
        <div className="flex items-center gap-3 md:gap-4">
          <img src="/logos/gatlockuplogo.png" alt="GAT Logo" className="h-8 md:h-10 object-contain" />
          <div className="w-px h-6 bg-[#242a30]" />
          <img src="/logos/aimldeptlogo.png" alt="AIML Dept Logo" className="h-8 md:h-10 object-contain" />
          <div className="w-px h-6 bg-[#242a30]" />
          <img src="/logos/cbc2ologo.PNG" alt="CBC 2.0" className="h-8 md:h-10 object-contain" />
          
          <div className="flex items-center gap-2 ml-2 md:ml-3 text-xs font-mono font-bold tracking-widest text-[#33e0a1] uppercase">
            <span className={`w-2.5 h-2.5 rounded-full bg-[#33e0a1] shadow-[0_0_8px_#33e0a1] ${isAlerting ? 'animate-ping' : 'animate-pulse'}`} />
            LIVE
          </div>
        </div>

        <div className="font-mono text-sm md:text-base text-[#7c8891] tracking-wider">
          {time.toLocaleTimeString()}
        </div>
      </header>

      {/* Main Stage */}
      <main className="w-full max-w-5xl my-auto flex flex-col items-center justify-center gap-8 z-10 py-6">
        {!hasData ? (
          /* IDLE STATE */
          <div className="text-center flex flex-col items-center justify-center py-16 animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-extrabold text-[#e8ecef] tracking-tight mb-4 font-sans">
              Code Breaker Challenge 2.0
            </h1>
            <p className="font-mono text-base md:text-xl text-[#7c8891] tracking-wide max-w-xl">
              Waiting for announcements &mdash; this projector display updates instantly.
            </p>
          </div>
        ) : (
          /* ACTIVE ANNOUNCEMENT CARD */
          <div className="w-full flex flex-col items-center gap-6">
            <div
              className={`w-full bg-[#14171b] border border-[#242a30] border-l-[6px] ${currentTheme.border} rounded-2xl p-8 md:p-12 ${currentTheme.glow} transition-all duration-500`}
            >
              {/* Tag / Priority Badge */}
              <div className="flex items-center gap-2 mb-4">
                <span className={`font-mono text-xs md:text-sm font-semibold tracking-widest uppercase px-3 py-1 rounded-md border ${currentTheme.tag}`}>
                  {statusLabel}
                </span>
                {type === 'urgent' && (
                  <span className="flex items-center gap-1 text-[#ff5c68] text-xs font-mono font-bold animate-bounce ml-2">
                    <AlertTriangle size={16} /> EMERGENCY ALERT
                  </span>
                )}
              </div>

              {/* Headline */}
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-[#e8ecef] leading-tight tracking-tight mb-4 min-h-[1.2em]">
                {displayTitle}
                {isTyping && (
                  <span className="inline-block w-1 md:w-1.5 h-[0.85em] bg-current ml-1.5 align-middle animate-pulse" />
                )}
              </h2>

              {/* Message Details (Only if distinct) */}
              {rawMessage && (
                <p className={`text-lg md:text-2xl text-[#7c8891] leading-relaxed transition-opacity duration-500 ${showMessage || isPreview ? 'opacity-100' : 'opacity-0'}`}>
                  {rawMessage}
                </p>
              )}

              {/* Media Attachment if present */}
              {posterUrl && (
                <div className="mt-6 rounded-xl overflow-hidden border border-[#242a30] bg-[#0b0d10]/80 max-h-[45vh] flex justify-center items-center">
                  {isVideo ? (
                    <div className="w-full aspect-video">
                      <ReactPlayer
                        ref={playerRef}
                        url={posterUrl}
                        playing={isPlaying}
                        muted={isMuted}
                        loop={true}
                        controls={false}
                        width="100%"
                        height="100%"
                      />
                    </div>
                  ) : (
                    <img
                      src={posterUrl}
                      alt="Broadcast Media"
                      className="w-full h-auto max-h-[45vh] object-contain rounded-lg"
                    />
                  )}
                </div>
              )}

              {/* Received Time */}
              <div className="mt-6 font-mono text-xs md:text-sm text-[#7c8891]/70 tracking-wider">
                received {receivedTime}
              </div>
            </div>

            {/* SPONSORS PANEL (Commented out for later use)
            <div className="w-full bg-[#14171b] border border-[#242a30] rounded-2xl py-4 px-8 flex flex-col items-center gap-3 shadow-[0_15px_40px_rgba(0,0,0,0.3)]">
              <span className="font-mono text-[11px] tracking-[0.2em] text-[#7c8891] uppercase">
                Our Event Sponsors & Partners
              </span>
              <div className="flex items-center justify-center gap-8 md:gap-12 flex-wrap">
                <img src="/logos/gatlockuplogo.png" alt="Sponsor GAT" className="h-7 md:h-9 object-contain opacity-80 hover:opacity-100 transition-opacity" />
                <img src="/logos/aimldeptlogo.png" alt="Sponsor AIML" className="h-7 md:h-9 object-contain opacity-80 hover:opacity-100 transition-opacity" />
                <img src="/logos/cbc2ologo.PNG" alt="CBC 2.0" className="h-7 md:h-9 object-contain opacity-80 hover:opacity-100 transition-opacity" />
              </div>
            </div>
            */}
          </div>
        )}
      </main>

      {/* Footer credits */}
      <footer className="w-full flex flex-col sm:flex-row justify-between items-center text-[11px] font-mono text-[#7c8891] uppercase tracking-wider z-10 pt-2 border-t border-[#242a30]/50 gap-2 sm:gap-0 sm:pr-56">
        <div>Global Academy of Technology &bull; Dept. of AI & ML</div>
        <div>Code Breakers Challenge 2.0 &bull; #AIforchange</div>
      </footer>
    </div>
  );
};

/**
 * SmartBoard Full Page
 */
const SmartBoard = () => {
  const [data, setData] = useState(null);
  const [muted, setMuted] = useState(false);
  const [isAlerting, setIsAlerting] = useState(false);
  const [mediaControls, setMediaControls] = useState({ isPlaying: true, isMuted: false, forceSkipToken: 0 });

  useEffect(() => {
    const controlsRef = ref(rtdb, "smartboard/controls");
    const unsubscribe = onValue(controlsRef, (snapshot) => {
      if (snapshot.exists()) {
        const controls = snapshot.val();
        setMediaControls(controls);
        if (controls.isMuted !== undefined) setMuted(controls.isMuted);
      }
    });
    return () => unsubscribe();
  }, []);

  const [typedHeadline, setTypedHeadline] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showMessage, setShowMessage] = useState(true);
  const [isTesting, setIsTesting] = useState(false);

  const prevBroadcastTimestampRef = useRef(null);
  const isInitialMountRef = useRef(true);
  const typingTimerRef = useRef(null);
  const alertTimeoutRef = useRef(null);
  const mutedRef = useRef(muted);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  const {
    getAudioContext,
    isAudioUnlocked,
    setIsAudioUnlocked,
    playAlertForDuration,
    playTypingTick
  } = useAudioEngine();

  const playAlertRef = useRef(playAlertForDuration);
  const playTickRef = useRef(playTypingTick);

  useEffect(() => {
    playAlertRef.current = playAlertForDuration;
    playTickRef.current = playTypingTick;
  }, [playAlertForDuration, playTypingTick]);

  // Clean up any ongoing timers
  const cleanupTimers = () => {
    if (alertTimeoutRef.current) {
      clearTimeout(alertTimeoutRef.current);
      alertTimeoutRef.current = null;
    }
    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }
  };

  // Trigger alert chime and typewriter sequence for NEW broadcasts
  const triggerNotificationSequence = useCallback((broadcastData) => {
    const rawTitle = broadcastData?.title || broadcastData?.statement || '';
    const type = broadcastData?.type || (broadcastData?.triggerSiren ? 'urgent' : 'info');

    cleanupTimers();

    if (!rawTitle) {
      setIsAlerting(false);
      setIsTyping(false);
      setShowMessage(true);
      return;
    }

    // 1. Start Alert Tone & flashing dot
    setIsAlerting(true);
    setIsTyping(true);
    setShowMessage(false);
    setTypedHeadline('');

    if (!mutedRef.current) {
      playAlertRef.current(type, ALERT_DURATION_SECONDS);
    }

    // 2. After alert chime completes, run typewriter
    alertTimeoutRef.current = setTimeout(() => {
      setIsAlerting(false);
      let idx = 0;
      const speed = 40; // ms per char

      typingTimerRef.current = setInterval(() => {
        if (idx < rawTitle.length) {
          const nextChar = rawTitle[idx];
          setTypedHeadline(prev => prev + nextChar);
          if (nextChar.trim() !== '' && !mutedRef.current) {
            playTickRef.current();
          }
          idx++;
        } else {
          if (typingTimerRef.current) {
            clearInterval(typingTimerRef.current);
            typingTimerRef.current = null;
          }
          setIsTyping(false);
          setShowMessage(true);
        }
      }, speed);
    }, ALERT_DURATION_SECONDS * 1000);
  }, []);

  // Sync with Firebase RTDB - Registered ONCE
  useEffect(() => {
    const broadcastRef = ref(rtdb, 'broadcast/current');
    const unsubscribe = onValue(broadcastRef, (snapshot) => {
      const val = snapshot.val();
      setData(val);

      if (val && (val.title || val.statement || val.posterUrl)) {
        if (isInitialMountRef.current) {
          // On first load, display instantly without chime or typing delay
          isInitialMountRef.current = false;
          prevBroadcastTimestampRef.current = val.timestamp || Date.now();
          setIsAlerting(false);
          setIsTyping(false);
          setShowMessage(true);
        } else if (val.timestamp && val.timestamp !== prevBroadcastTimestampRef.current) {
          // New incoming broadcast from admin
          prevBroadcastTimestampRef.current = val.timestamp;
          triggerNotificationSequence(val);
        }
      } else {
        // Board cleared
        isInitialMountRef.current = false;
        prevBroadcastTimestampRef.current = null;
        cleanupTimers();
        setTypedHeadline('');
        setIsTyping(false);
        setIsAlerting(false);
        setShowMessage(true);
      }
    });

    return () => {
      unsubscribe();
      cleanupTimers();
    };
  }, [triggerNotificationSequence]);

  // Unlock Audio interaction
  const handleUnlockAudio = useCallback(() => {
    getAudioContext();
    setIsAudioUnlocked(true);
  }, [getAudioContext, setIsAudioUnlocked]);

  // Test sound function
  const handleTestChime = (type = 'info') => {
    handleUnlockAudio();
    if (isTesting) return;
    setIsTesting(true);
    playAlertForDuration(type, 2.5);
    setTimeout(() => setIsTesting(false), 2500);
  };

  return (
    <div className="w-screen h-screen overflow-hidden relative select-none bg-[#0b0d10]" onClick={handleUnlockAudio}>
      {/* Sound Gate Overlay */}
      {!isAudioUnlocked && (
        <div
          id="soundGate"
          className="fixed inset-0 z-50 bg-[#060709]/95 backdrop-blur-md flex flex-col items-center justify-center gap-5 text-center p-6 cursor-pointer"
          onClick={handleUnlockAudio}
        >
          <div className="w-20 h-20 rounded-full bg-[#7c5cff]/15 text-[#7c5cff] flex items-center justify-center mb-2 animate-pulse text-4xl">
            <BellRing size={40} />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#e8ecef] tracking-tight">
            Click anywhere to enable sound & projection audio
          </h2>
          <p className="font-mono text-sm text-[#7c8891] max-w-md">
            Browsers block audio alerts until this display screen is clicked once.
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleUnlockAudio();
            }}
            className="mt-2 px-8 py-3.5 bg-[#7c5cff] hover:bg-[#8f72ff] text-white font-semibold rounded-xl text-base tracking-wide transition-all shadow-[0_0_25px_rgba(124,92,255,0.4)]"
          >
            Enable Sound & Start
          </button>
        </div>
      )}

      {/* Discrete HUD Controls for Operator / Setup (Bottom Right) */}
      <div
        className="fixed bottom-4 right-6 z-40 flex items-center gap-2 bg-[#14171b]/90 backdrop-blur-md border border-[#242a30] px-3.5 py-1.5 rounded-full text-xs font-mono text-[#7c8891] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setMuted(!muted)}
          title={muted ? 'Unmute Audio' : 'Mute Audio'}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-colors ${
            muted ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'hover:bg-white/10 text-[#33e0a1]'
          }`}
        >
          {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          <span>{muted ? 'Muted' : 'Audio On'}</span>
        </button>

        <span className="text-white/10">|</span>

        <button
          onClick={() => handleTestChime('info')}
          disabled={isTesting}
          className="px-2 py-0.5 rounded transition-colors text-[10px] uppercase tracking-wider hover:bg-white/10 text-[#7c5cff]"
        >
          {isTesting ? 'Playing…' : 'Test Sound'}
        </button>
      </div>

      {/* Main Board Template */}
      <BoardTemplate
        data={data}
        isMuted={muted}
        isAlerting={isAlerting}
        typedHeadline={typedHeadline}
        isTyping={isTyping}
        showMessage={showMessage}
        isPlaying={mediaControls.isPlaying}
        forceSkipToken={mediaControls.forceSkipToken}
      />
    </div>
  );
};

export default SmartBoard;




