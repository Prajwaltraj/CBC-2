
import { useCountdown } from './useCountdown';
const FixedTimer = () => {
  const timeLeft = useCountdown(PROBLEM_STATEMENTS_CONFIG.UNLOCK_DATE);

  return (
    <div 
      className="fixed right-0 top-1/2 -translate-y-1/2 z-[9999] pointer-events-auto select-none"
      style={{ position: 'fixed', top: '50%', transform: 'translateY(-50%)', right: 0, zIndex: 9999 }}
    >
      <div className="flex flex-col gap-1 md:gap-2 py-1.5 px-1.5 md:p-3 bg-[#010103]/90 glass-panel rounded-l-lg md:rounded-l-xl border-r-0 border-[#00F3FF]/40 backdrop-blur-md shadow-[-5px_0_20px_rgba(0,243,255,0.15)]">
        <div className="text-[8px] md:text-[10px] font-orbitron font-bold text-[#00F3FF] tracking-widest text-center uppercase mb-0.5 md:mb-1 drop-shadow-[0_0_8px_#00F3FF]" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Mins</div>
        <div className="flex flex-col gap-1 md:gap-2 items-center font-mono">
          <div className="flex flex-col items-center">
            <span className="text-xs md:text-xl font-bold text-white leading-none">{String(timeLeft.d).padStart(2, '0')}</span>
            <span className="text-[7px] md:text-[9px] text-gray-400 uppercase tracking-wider mt-0.5">Days</span>
          </div>
          <div className="w-full h-px bg-white/10" />
          <div className="flex flex-col items-center">
            <span className="text-xs md:text-xl font-bold text-white leading-none">{String(timeLeft.h).padStart(2, '0')}</span>
            <span className="text-[7px] md:text-[9px] text-gray-400 uppercase tracking-wider mt-0.5">Hrs</span>
          </div>
          <div className="w-full h-px bg-white/10" />
          <div className="flex flex-col items-center">
            <span className="text-xs md:text-xl font-bold text-white leading-none">{String(timeLeft.m).padStart(2, '0')}</span>
            <span className="text-[7px] md:text-[9px] text-gray-400 uppercase tracking-wider mt-0.5">Min</span>
          </div>
          <div className="w-full h-px bg-white/10" />
          <div className="flex flex-col items-center">
            <span className="text-xs md:text-xl font-bold text-[#A855F7] animate-pulse leading-none">{String(timeLeft.s).padStart(2, '0')}</span>
            <span className="text-[7px] md:text-[9px] text-[#A855F7] font-semibold uppercase tracking-wider mt-0.5">Sec</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------
// REUSABLE COMPONENTS
// ------------------------------------------------------------------

export default FixedTimer;
