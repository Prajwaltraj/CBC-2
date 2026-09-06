import { useState, useEffect } from 'react';
import { auth, loginWithGoogle, loginWithEmail, logout, rtdb } from '../firebase';
import { ref, set } from 'firebase/database';
import { LogOut, Send, AlertTriangle, Monitor, XCircle, CheckCircle2 } from 'lucide-react';
import { BoardTemplate } from './SmartBoard'; // Import the template for live preview

const AdminPortal = () => {
  const [user, setUser] = useState(null);
  const [posterUrl, setPosterUrl] = useState('');
  const [statement, setStatement] = useState('');
  const [status, setStatus] = useState({ type: '', msg: '' });
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  const handleBroadcast = async (triggerSiren) => {
    if (!user) return;
    setStatus({ type: 'loading', msg: 'Broadcasting...' });
    try {
      const broadcastRef = ref(rtdb, 'broadcast/current');
      await set(broadcastRef, {
        posterUrl,
        statement,
        timestamp: Date.now(),
        triggerSiren
      });
      setStatus({ type: 'success', msg: triggerSiren ? 'Emergency Broadcast Sent!' : 'Silent Broadcast Sent!' });
      setTimeout(() => setStatus({ type: '', msg: '' }), 3000);
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', msg: 'Broadcast failed! Check connection.' });
    }
  };

  const stopSiren = async () => {
    if (!user) return;
    try {
      const broadcastRef = ref(rtdb, 'broadcast/current');
      await set(broadcastRef, {
        posterUrl,
        statement,
        timestamp: Date.now(),
        triggerSiren: false
      });
      setStatus({ type: 'success', msg: 'Siren stopped.' });
      setTimeout(() => setStatus({ type: '', msg: '' }), 3000);
    } catch (error) {
      console.error(error);
    }
  };

  const clearBoard = async () => {
    setPosterUrl('');
    setStatement('');
    if (!user) return;
    try {
      const broadcastRef = ref(rtdb, 'broadcast/current');
      await set(broadcastRef, null);
      setStatus({ type: 'success', msg: 'Board Cleared.' });
      setTimeout(() => setStatus({ type: '', msg: '' }), 3000);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      await loginWithEmail(loginEmail, loginPassword);
    } catch (err) {
      setLoginError('Invalid credentials. Please try again.');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0F1014] text-white flex flex-col md:flex-row font-sans">
        {/* Left Side - Marketing / Info */}
        <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-between border-r border-white/5 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1A1625] to-transparent opacity-50 pointer-events-none" />
          
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center font-bold text-lg shadow-[0_0_15px_rgba(139,92,246,0.3)]">
              HB
            </div>
            <span className="font-bold text-lg tracking-wide">Hackathon Broadcast</span>
          </div>

          <div className="relative z-10 my-16">
            <div className="flex items-center gap-2 text-[#10B981] text-xs font-bold tracking-[0.2em] mb-6 uppercase">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
              Live Console Access
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6 tracking-tight">
              Broadcast to stage screens instantly.
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed max-w-md">
              Send real-time updates, stage schedule changes, and urgent announcements directly to event display screens.
            </p>
          </div>

          <div className="relative z-10 text-xs text-gray-500 font-mono">
            Protected System • Unauthorized access restricted
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full md:w-1/2 p-10 md:p-16 flex items-center justify-center bg-[#0B0C10]">
          <div className="w-full max-w-sm">
            <h2 className="text-2xl font-bold mb-2 tracking-wide">Admin Sign In</h2>
            <p className="text-gray-400 text-sm mb-8">Enter your credentials to control the broadcast console</p>

            <form onSubmit={handleEmailLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 tracking-wider mb-2 uppercase">Username / Email</label>
                <input 
                  type="email" 
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@example.com" 
                  className="w-full bg-black/40 border border-gray-700/50 rounded-lg px-4 py-3 text-white outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 tracking-wider mb-2 uppercase">Password</label>
                <input 
                  type="password" 
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full bg-black/40 border border-gray-700/50 rounded-lg px-4 py-3 text-white outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all"
                  required
                />
              </div>
              
              {loginError && <p className="text-red-400 text-xs">{loginError}</p>}

              <button 
                type="submit"
                className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold py-3 rounded-lg transition-colors shadow-[0_0_15px_rgba(139,92,246,0.2)] mt-2"
              >
                Sign In to Console
              </button>
            </form>

            <div className="mt-6 flex items-center">
              <div className="flex-1 h-px bg-gray-800"></div>
              <span className="px-4 text-xs text-gray-500 uppercase">or</span>
              <div className="flex-1 h-px bg-gray-800"></div>
            </div>

            <button 
              onClick={loginWithGoogle}
              className="w-full mt-6 bg-[#1A1A24] border border-gray-700 hover:bg-[#252533] text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Generate live preview data object
  const previewData = {
    posterUrl,
    statement,
    timestamp: Date.now(),
    triggerSiren: false
  };

  return (
    <div className="min-h-screen bg-[#0B0C10] text-white flex flex-col font-sans">
      {/* Top Navbar */}
      <div className="px-8 py-4 bg-[#0F1014] border-b border-white/5 flex justify-between items-center sticky top-0 z-50">
        <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center font-bold text-sm shadow-[0_0_10px_rgba(139,92,246,0.3)]">
            HB
          </div>
          <div>
            <h1 className="text-base font-bold tracking-wide leading-none">Hackathon Broadcast</h1>
            <span className="text-[10px] text-gray-500 tracking-wider uppercase">Live Console</span>
          </div>
        </a>
        <div className="flex items-center gap-6">
          <a href="/" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Home</a>
          <div className="h-4 w-px bg-white/10"></div>
          <a href="/food" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-gray-400 hover:text-[#8B5CF6] transition-colors flex items-center gap-1">
            Food Portal ↗
          </a>
          <a href="/meals" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-gray-400 hover:text-[#10B981] transition-colors flex items-center gap-1">
            Meals Tracking ↗
          </a>
          <a href="/attendance" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-gray-400 hover:text-[#FBBF24] transition-colors flex items-center gap-1">
            Attendance ↗
          </a>
          <div className="h-4 w-px bg-white/10"></div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#10B981]"></div>
            <span className="text-gray-400 text-xs hidden md:block">{user.email}</span>
          </div>
          <button onClick={logout} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-xs font-medium bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/5">
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </div>

      <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-[1600px] mx-auto w-full">
        
        {/* Left Column: Controls (Span 4) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-[#0F1014] p-6 rounded-2xl border border-white/5 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-6 tracking-wide flex items-center gap-2">
              <Send size={18} className="text-[#8B5CF6]" /> Broadcast Editor
            </h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 tracking-wider mb-2 uppercase">Poster Image URL (Optional)</label>
                <input 
                  type="text" 
                  value={posterUrl} 
                  onChange={(e) => setPosterUrl(e.target.value)} 
                  placeholder="https://example.com/poster.png" 
                  className="w-full bg-black/40 border border-gray-700/50 rounded-lg p-3 text-white outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 tracking-wider mb-2 uppercase">Announcement Statement</label>
                <textarea 
                  value={statement} 
                  onChange={(e) => setStatement(e.target.value)} 
                  placeholder="e.g. Hacking Phase 1 concludes in 30 minutes! Submit your GitHub links." 
                  rows="5"
                  className="w-full bg-black/40 border border-gray-700/50 rounded-lg p-3 text-white outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all text-sm resize-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#0F1014] p-6 rounded-2xl border border-white/5 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-4 tracking-wide flex items-center gap-2">
              <AlertTriangle size={18} className="text-[#10B981]" /> Execution Console
            </h2>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => handleBroadcast(true)}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 uppercase tracking-wider text-sm shadow-[0_0_15px_rgba(239,68,68,0.2)]"
              >
                <AlertTriangle size={16} /> Broadcast + Siren
              </button>
              <button 
                onClick={() => handleBroadcast(false)}
                className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 uppercase tracking-wider text-sm shadow-[0_0_15px_rgba(139,92,246,0.2)]"
              >
                <Monitor size={16} /> Silent Broadcast
              </button>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button 
                  onClick={stopSiren}
                  className="bg-black/40 border border-red-500/30 text-red-400 text-xs py-2 rounded-lg hover:bg-red-500/10 transition-colors uppercase tracking-wider font-medium"
                >
                  Stop Siren Only
                </button>
                <button 
                  onClick={clearBoard}
                  className="bg-black/40 border border-gray-700/50 text-gray-400 text-xs py-2 rounded-lg hover:bg-white/5 transition-colors uppercase tracking-wider font-medium flex items-center justify-center gap-2"
                >
                  <XCircle size={14} /> Clear Board
                </button>
              </div>
            </div>

            {/* Status Message */}
            {status.msg && (
              <div className={`mt-5 p-3 rounded-lg border text-sm font-medium flex items-center gap-2 ${
                status.type === 'success' ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]' : 
                status.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 
                'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
              }`}>
                {status.type === 'success' && <CheckCircle2 size={16} />}
                {status.msg}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Preview (Span 8) */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="flex justify-between items-end mb-4 px-2">
            <h2 className="text-sm font-bold text-gray-400 tracking-wider flex items-center gap-2 uppercase">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
              Live Stage Preview
            </h2>
            <a href="/board" target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-[#8B5CF6] hover:text-white transition-colors flex items-center gap-1">
              Open Stage Screen ↗
            </a>
          </div>
          
          <div className="flex-1 bg-[#0F1014] rounded-2xl border border-white/5 overflow-hidden relative min-h-[500px] flex items-center justify-center shadow-2xl p-6">
            <div className="w-full h-full rounded-xl overflow-hidden border border-gray-800 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              <BoardTemplate data={previewData} isPreview={true} />
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default AdminPortal;
