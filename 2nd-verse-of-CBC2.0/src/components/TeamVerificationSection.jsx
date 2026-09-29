import { useState } from 'react';
import { Search, CheckCircle2, AlertTriangle, ShieldCheck, Mail } from 'lucide-react';
import { ref, get } from 'firebase/database';
import { rtdb } from '../firebase';
import { useNavigate } from 'react-router-dom';

const TeamVerificationSection = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', msg: '' });
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!email) {
      setStatus({ type: 'error', msg: 'Please provide your registered email.' });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    setStatus({ type: 'loading', msg: 'Verifying team registration...' });

    try {
      const emailHash = cleanEmail.replace(/[.#$\[\]\/]/g, '_');
      const teamRef = ref(rtdb, `registeredTeams/${emailHash}`);
      
      const snapshot = await Promise.race([
        get(teamRef),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Database Timeout')), 8000))
      ]);
      
      if (!snapshot.exists()) {
        setStatus({ 
          type: 'error', 
          msg: `No registered team found for "${cleanEmail}". Please check your email address or contact event support.` 
        });
        return;
      }

      const teamData = snapshot.val();

      // Successful verification
      localStorage.setItem('verifiedEmail', cleanEmail);
      localStorage.setItem('verifiedTeam', JSON.stringify(teamData));

      setStatus({ type: 'success', msg: 'Verification successful! Loading dashboard...' });
      
      setTimeout(() => {
        navigate('/team');
        window.location.reload();
      }, 500);

    } catch (error) {
      console.error("[DEBUG] Error verifying team:", error);
      setStatus({ type: 'error', msg: 'Connection error. Please try again in a moment.' });
    }
  };

  const storedEmail = typeof window !== 'undefined' ? localStorage.getItem('verifiedEmail') : null;

  return (
    <section id="verification" className="py-20 relative w-full overflow-hidden flex flex-col items-center">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-[#00F3FF]/5 to-transparent -z-10"></div>
      
      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#00F3FF] to-[#BC13FE]">
            TEAM VERIFICATION
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto font-mono text-sm">
            Access your team dashboard using your registered email address.
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
                    className="w-full bg-[#33e0a1]/20 hover:bg-[#33e0a1]/30 text-[#33e0a1] border border-[#33e0a1]/50 font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wider text-sm shadow-[0_0_20px_rgba(51,224,161,0.2)] cursor-pointer"
                  >
                    View Team Dashboard ↗
                  </button>
                  <button 
                    onClick={() => { localStorage.removeItem('verifiedEmail'); localStorage.removeItem('verifiedTeam'); window.location.reload(); }}
                    className="text-xs text-gray-500 hover:text-red-400 transition-colors font-mono uppercase mt-2 cursor-pointer"
                  >
                    Switch Account
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-8 text-center">
                  <div className="w-16 h-16 bg-[#00F3FF]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#00F3FF]/30">
                    <ShieldCheck size={28} className="text-[#00F3FF]" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 dark:text-white text-black font-orbitron">Access Dashboard</h3>
                  <p className="text-gray-400 text-sm font-mono">Enter your registered team email address.</p>
                </div>
                
                <form onSubmit={handleVerify} className="space-y-5">
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
                    {status.type === 'loading' ? 'Verifying...' : 'Unlock Team Portal'}
                  </button>
                </form>
              </>
            )}

            {status.msg && (
              <div className={`mt-6 p-4 rounded-lg border text-sm font-medium flex items-center gap-2 font-mono ${
                status.type === 'success' ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]' : 
                status.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 
                'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
              }`}>
                {status.type === 'success' ? <CheckCircle2 size={18} className="shrink-0" /> : <AlertTriangle size={18} className="shrink-0" />}
                <span>{status.msg}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeamVerificationSection;
