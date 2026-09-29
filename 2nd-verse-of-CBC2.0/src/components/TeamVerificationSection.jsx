import { useState } from 'react';
import { Search, CheckCircle2, AlertTriangle, KeyRound, Mail, ArrowLeft, RefreshCw, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TeamVerificationSection = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [pendingVerification, setPendingVerification] = useState(false);
  const navigate = useNavigate();

  const handleSendCode = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!email) {
      setStatus({ type: 'error', msg: 'Please enter your registered email address.' });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    setStatus({ type: 'loading', msg: 'Sending 6-digit verification code...' });

    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        setStatus({
          type: 'error',
          msg: data.error || 'Failed to send verification code. Please check your email or contact support.',
        });
        return;
      }

      setPendingVerification(true);
      setStatus({
        type: 'success',
        msg: 'Verification code sent! Please check your inbox and spam folder.',
      });
    } catch (error) {
      console.error('[DEBUG] Error sending code:', error);
      setStatus({
        type: 'error',
        msg: 'Connection error. Please try again in a moment.',
      });
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!code) {
      setStatus({ type: 'error', msg: 'Please enter the 6-digit code.' });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanCode = code.trim();
    setStatus({ type: 'loading', msg: 'Verifying code...' });

    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, code: cleanCode }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        setStatus({
          type: 'error',
          msg: data.error || 'Invalid or expired code. Please try again.',
        });
        return;
      }

      // Successful verification - Store in sessionStorage so it automatically clears when the user exits the browser/tab
      sessionStorage.setItem('verifiedEmail', cleanEmail);
      if (data.team) {
        sessionStorage.setItem('verifiedTeam', JSON.stringify(data.team));
      }
      // Clear legacy localStorage keys
      try {
        localStorage.removeItem('verifiedEmail');
        localStorage.removeItem('verifiedTeam');
      } catch (e) {}

      setStatus({ type: 'success', msg: 'Verification successful! Loading dashboard...' });
      setTimeout(() => {
        navigate('/team');
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('[DEBUG] Error verifying code:', error);
      setStatus({ type: 'error', msg: 'Verification failed. Please try again.' });
    }
  };

  const storedEmail = typeof window !== 'undefined' ? sessionStorage.getItem('verifiedEmail') : null;

  return (
    <section id="verification" className="py-20 relative w-full overflow-hidden flex flex-col items-center">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-[#00F3FF]/5 to-transparent -z-10"></div>
      
      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#00F3FF] to-[#BC13FE] font-orbitron">
            TEAM VERIFICATION
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto font-mono text-sm">
            Access your official team dashboard using your registered email address with instant OTP.
          </p>
        </div>

        <div className="flex justify-center w-full">
          <div className="bg-white/5 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-[0_0_30px_rgba(0,243,255,0.1)] max-w-md w-full">
            {storedEmail ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-[#33e0a1]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#33e0a1]/30">
                  <CheckCircle2 size={28} className="text-[#33e0a1]" />
                </div>
                <h3 className="text-2xl font-bold mb-2 dark:text-white text-black font-orbitron">Verified Session</h3>
                <p className="text-gray-400 text-sm mb-6 font-mono break-all">{storedEmail}</p>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => { navigate('/team'); window.location.reload(); }}
                    className="w-full bg-[#33e0a1]/20 hover:bg-[#33e0a1]/30 text-[#33e0a1] border border-[#33e0a1]/50 font-bold py-3.5 rounded-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wider text-sm shadow-[0_0_20px_rgba(51,224,161,0.2)] cursor-pointer font-orbitron"
                  >
                    View Team Dashboard ↗
                  </button>
                  <button 
                    onClick={() => {
                      sessionStorage.removeItem('verifiedEmail');
                      sessionStorage.removeItem('verifiedTeam');
                      localStorage.removeItem('verifiedEmail');
                      localStorage.removeItem('verifiedTeam');
                      window.location.reload();
                    }}
                    className="text-xs text-gray-500 hover:text-red-400 transition-colors font-mono uppercase mt-2 cursor-pointer"
                  >
                    Switch Account
                  </button>
                </div>
              </div>
            ) : !pendingVerification ? (
              <>
                <div className="mb-8 text-center">
                  <div className="w-16 h-16 bg-[#00F3FF]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#00F3FF]/30">
                    <Mail size={28} className="text-[#00F3FF]" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 dark:text-white text-black font-orbitron">Find Your Team</h3>
                  <p className="text-gray-400 text-sm font-mono">Enter your registered email to receive a 6-digit OTP code.</p>
                </div>
                
                <form onSubmit={handleSendCode} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 tracking-wider mb-2 uppercase font-mono flex items-center gap-1.5">
                      <Mail size={14} className="text-[#00F3FF]" /> Registered Email
                    </label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="team@example.com"
                      required
                      className="w-full bg-black/40 border border-gray-700/50 rounded-lg p-3 text-white outline-none focus:border-[#00F3FF] focus:ring-1 focus:ring-[#00F3FF] transition-all font-mono text-sm"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={status.type === 'loading'}
                    className="w-full bg-gradient-to-r from-[#00F3FF] to-[#BC13FE] hover:opacity-90 text-white font-bold py-3.5 rounded-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wider text-sm shadow-[0_0_20px_rgba(0,243,255,0.3)] disabled:opacity-50 font-orbitron cursor-pointer mt-2"
                  >
                    {status.type === 'loading' ? 'Sending Code...' : 'Send OTP Code'}
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="mb-8 text-center">
                  <div className="w-16 h-16 bg-[#10B981]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#10B981]/30">
                    <KeyRound size={28} className="text-[#10B981]" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 dark:text-white text-black font-orbitron">Verify Code</h3>
                  <p className="text-gray-400 text-xs sm:text-sm font-mono mb-2">
                    Enter the 6-digit code sent to:
                  </p>
                  <div className="inline-block max-w-full px-3.5 py-1.5 rounded-lg bg-black/60 border border-[#00F3FF]/40 text-[#00F3FF] text-xs sm:text-sm font-mono font-medium break-all shadow-[0_0_15px_rgba(0,243,255,0.1)]">
                    {email}
                  </div>
                </div>
                
                <form onSubmit={handleVerifyCode} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 tracking-wider mb-2 uppercase font-mono">
                      6-Digit Code
                    </label>
                    <input 
                      type="text" 
                      value={code}
                      onChange={(e) => setCode(e.target.value.trim())}
                      placeholder="123456"
                      maxLength={6}
                      required
                      className="w-full bg-black/40 border border-gray-700/50 rounded-lg p-3 text-white outline-none focus:border-[#00F3FF] focus:ring-1 focus:ring-[#00F3FF] transition-all text-center tracking-widest text-2xl font-mono"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={status.type === 'loading'}
                    className="w-full bg-gradient-to-r from-[#10B981] to-[#059669] hover:opacity-90 text-white font-bold py-3.5 rounded-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wider text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 font-orbitron cursor-pointer"
                  >
                    {status.type === 'loading' ? 'Verifying...' : 'Verify Code & Unlock'}
                  </button>

                  <div className="flex items-center justify-between mt-4 text-xs font-mono">
                    <button 
                      type="button"
                      onClick={() => setPendingVerification(false)}
                      className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft size={12} /> Change Email
                    </button>
                    <button
                      type="button"
                      onClick={handleSendCode}
                      disabled={status.type === 'loading'}
                      className="text-[#00F3FF] hover:underline disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw size={12} /> Resend Code
                    </button>
                  </div>
                  <p className="text-center text-[11px] text-gray-400 mt-3 font-mono">
                    💡 If not in Inbox, check your <span className="text-yellow-400">Spam / Junk</span> folder.
                  </p>
                </form>
              </>
            )}

            {status.msg && (
              <div className={`mt-6 p-4 rounded-lg border text-sm font-medium flex items-start gap-2.5 font-mono ${
                status.type === 'success' ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]' : 
                status.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 
                'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
              }`}>
                {status.type === 'success' ? <CheckCircle2 size={18} className="shrink-0 mt-0.5" /> : <AlertTriangle size={18} className="shrink-0 mt-0.5" />}
                <span className="leading-snug break-words flex-1">{status.msg}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeamVerificationSection;
