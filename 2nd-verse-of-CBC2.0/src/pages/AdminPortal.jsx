import { useState, useEffect, useRef } from 'react';
import { auth, loginWithGoogle, loginWithEmail, logout, rtdb } from '../firebase';
import { ref, set, onValue } from 'firebase/database';
import { LogOut, Send, AlertTriangle, XCircle, CheckCircle2, Monitor, Edit3 } from 'lucide-react';
import { BoardTemplate } from "./SmartBoard";
import AdminTeamViews from "../components/AdminTeamViews";
import AdminMediaControls from "../components/AdminMediaControls"; // Import the template for live preview

// List of emails allowed to access the Admin Portal
const ALLOWED_EMAILS = [
  'prajwaltraj213@gmail.com',
  'bhuvan.ar0101@gmail.com',
  'codebreaker.aiml@gmail.com',
  'cbc2.o.tech@gmail.com',
  'chethanponnappa24@gmail.com',
  'vinayakas307@gmail.com'
];

const PRESETS = [
  {
    type: 'warning',
    title: 'Judging Starts in 15 Mins',
    desc: 'Please return to your assigned bays with project demos ready.',
    broadcastTitle: 'Judging Starts in 15 Minutes',
    broadcastMessage: 'Please return to your assigned bays with project demos ready.'
  },
  {
    type: 'urgent',
    title: 'Hacking Time Ended',
    desc: 'Stop all coding! Submit your GitHub repo links on the portal now.',
    broadcastTitle: 'Hacking Time Has Ended!',
    broadcastMessage: 'Stop all coding! Submit your GitHub repo links on the portal now.'
  },
  {
    type: 'success',
    title: 'Dinner is Served',
    desc: 'Head to the food court area for dinner. Badges required.',
    broadcastTitle: 'Dinner is Served 🍽️',
    broadcastMessage: 'Head to the food court area for dinner. Badges required.'
  },
  {
    type: 'info',
    title: 'Mid-Hack Review Starting',
    desc: 'Mentors are approaching your tables for round 1 evaluation.',
    broadcastTitle: 'Mid-Hack Review Starting',
    broadcastMessage: 'Mentors are approaching your tables for round 1 evaluation.'
  },
  {
    type: 'warning',
    title: 'Midnight Energy Drinks',
    desc: 'Snacks & drinks available at the registration desk!',
    broadcastTitle: 'Midnight Snacks & Refreshments ☕',
    broadcastMessage: 'Snacks & drinks available at the registration desk!'
  }
];

const AdminPortal = () => {
  const [user, setUser] = useState(null);
  const [statement, setStatement] = useState('');
  const [selectedType, setSelectedType] = useState('info');
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [activeTab, setActiveTab] = useState("broadcast");
  const [allowTeamEditing, setAllowTeamEditing] = useState(false);

  useEffect(() => {
    const configRef = ref(rtdb, 'config/allowTeamEditing');
    const unsub = onValue(configRef, (snapshot) => {
      if (snapshot.exists()) {
        setAllowTeamEditing(Boolean(snapshot.val()));
      }
    });
    return () => unsub();
  }, []);

  const toggleTeamEditing = async () => {
    try {
      const configRef = ref(rtdb, 'config/allowTeamEditing');
      await set(configRef, !allowTeamEditing);
      setStatus({ type: 'success', msg: `Team Leader editing access is now ${!allowTeamEditing ? 'ENABLED' : 'DISABLED'} ✓` });
      setTimeout(() => setStatus({ type: '', msg: '' }), 3000);
    } catch (e) {
      console.error(e);
      setStatus({ type: 'error', msg: 'Failed to update edit access config.' });
    }
  };

  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      if (u) {
        const userEmail = u.email ? u.email.toLowerCase() : '';
        const isAllowed = ALLOWED_EMAILS.some(e => e.toLowerCase() === userEmail);
        if (isAllowed) {
          setUser(u);
        } else {
          logout();
          setLoginError(`Access Denied: ${u.email} is not in the authorized admins list.`);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleBroadcast = async (customType, customTitle, customMessage) => {
    if (!user) return;
    const typeToUse = customType || selectedType;
    const titleToUse = customTitle !== undefined ? customTitle : statement.trim();
    const messageToUse = customMessage !== undefined ? customMessage : '';

    if (!titleToUse) {
      setStatus({ type: 'error', msg: 'Please enter an announcement statement first.' });
      return;
    }

    setStatus({ type: 'loading', msg: 'Broadcasting to stage screen...' });
    try {
      const broadcastRef = ref(rtdb, 'broadcast/current');
      await set(broadcastRef, {
        title: titleToUse,
        statement: titleToUse,
        message: messageToUse,
        posterUrl: '',
        type: typeToUse,
        timestamp: Date.now(),
        triggerSiren: typeToUse === 'urgent',
        videoState: { playing: true }
      });
      setStatus({ type: 'success', msg: `Sent to display screen ✓ [${typeToUse.toUpperCase()}]` });
      setTimeout(() => setStatus({ type: '', msg: '' }), 3000);
    } catch (error) {
      console.error("Broadcast error:", error);
      const isPermError = error?.code === 'PERMISSION_DENIED' || String(error?.message || '').toLowerCase().includes('permission');
      setStatus({ 
        type: 'error', 
        msg: isPermError 
          ? 'Broadcast failed: Permission Denied! Please update Firebase Realtime Database rules.' 
          : `Broadcast failed: ${error?.message || 'Check connection.'}` 
      });
    }
  };

  const sendPreset = async (preset) => {
    if (!user) return;
    setStatus({ type: 'loading', msg: `Broadcasting "${preset.title}"...` });
    try {
      const broadcastRef = ref(rtdb, 'broadcast/current');
      await set(broadcastRef, {
        title: preset.broadcastTitle || preset.title,
        statement: preset.broadcastTitle || preset.title,
        message: preset.broadcastMessage || preset.desc,
        posterUrl: '',
        type: preset.type,
        timestamp: Date.now(),
        triggerSiren: preset.type === 'urgent',
        videoState: { playing: true }
      });
      setStatus({ type: 'success', msg: `Sent preset "${preset.title}" ✓` });
      setTimeout(() => setStatus({ type: '', msg: '' }), 2500);
    } catch (error) {
      console.error("Preset broadcast error:", error);
      const isPermError = error?.code === 'PERMISSION_DENIED' || String(error?.message || '').toLowerCase().includes('permission');
      setStatus({ 
        type: 'error', 
        msg: isPermError 
          ? 'Broadcast failed: Permission Denied! Please update Firebase Realtime Database rules.' 
          : `Broadcast failed: ${error?.message || 'Check connection.'}` 
      });
    }
  };

  const clearBoard = async () => {
    setStatement('');
    if (!user) return;
    try {
      const broadcastRef = ref(rtdb, 'broadcast/current');
      await set(broadcastRef, null);
      setStatus({ type: 'success', msg: 'Display history cleared ✓' });
      setTimeout(() => setStatus({ type: '', msg: '' }), 2500);
    } catch (error) {
      console.error("Clear board error:", error);
      const isPermError = error?.code === 'PERMISSION_DENIED' || String(error?.message || '').toLowerCase().includes('permission');
      setStatus({ 
        type: 'error', 
        msg: isPermError 
          ? 'Clear failed: Permission Denied! Please update Firebase Realtime Database rules.' 
          : `Clear failed: ${error?.message || 'Check connection.'}` 
      });
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const emailToUse = loginEmail.includes('@') ? loginEmail.trim() : `${loginEmail.trim()}@gmail.com`;
      await loginWithEmail(emailToUse, loginPassword);
    } catch (err) {
      setLoginError('Invalid credentials. Please verify your email and password.');
    }
  };

  const handleGoogleLogin = async () => {
    setLoginError('');
    setIsLoggingIn(true);
    try {
      const u = await loginWithGoogle();
      if (u) {
        const userEmail = u.email ? u.email.toLowerCase() : '';
        const isAllowed = ALLOWED_EMAILS.some(e => e.toLowerCase() === userEmail);
        if (isAllowed) {
          setUser(u);
        } else {
          setLoginError(`Access Denied: ${u.email} is not in the authorized admins list.`);
          await logout();
        }
      }
    } catch (err) {
      console.error("Google Sign-in Error:", err);
      if (err.code === 'auth/popup-blocked') {
        setLoginError('Sign-in popup was blocked by browser. Please allow popups for this site.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setLoginError(`Domain Unauthorized: ${window.location.hostname} must be added to Firebase Console -> Authentication -> Settings -> Authorized Domains.`);
      } else if (err.code === 'auth/popup-closed-by-user') {
        setLoginError('Google sign-in popup was closed before completing.');
      } else {
        setLoginError(err.message || 'Google sign-in failed. Please try again.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0b0d10] text-[#e8ecef] flex flex-col md:flex-row font-sans">
        {/* Left Side - Marketing / Info */}
        <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-between border-r border-[#242a30] relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a1625] to-transparent opacity-50 pointer-events-none" />
          
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] flex items-center justify-center font-bold text-lg shadow-[0_0_15px_rgba(139,92,246,0.3)]">
              HB
            </div>
            <span className="font-bold text-lg tracking-wide">Hackathon Broadcast</span>
          </div>

          <div className="relative z-10 my-16">
            <div className="flex items-center gap-2 text-[#33e0a1] text-xs font-bold tracking-[0.2em] mb-6 uppercase">
              <span className="w-2 h-2 rounded-full bg-[#33e0a1] animate-pulse"></span>
              Live Console Access
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6 tracking-tight">
              Broadcast to stage screens instantly.
            </h1>
            <p className="text-[#7c8891] text-lg leading-relaxed max-w-md">
              Send real-time updates, stage schedule changes, and urgent announcements directly to event display screens.
            </p>
          </div>

          <div className="relative z-10 text-xs text-[#7c8891] font-mono">
            Protected System • Authorized admin access restricted
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full md:w-1/2 p-10 md:p-16 flex items-center justify-center bg-[#0b0d10]">
          <div className="w-full max-w-sm">
            <h2 className="text-2xl font-bold mb-2 tracking-wide">Admin Sign In</h2>
            <p className="text-[#7c8891] text-sm mb-8">Enter your credentials to control the broadcast console</p>

            <form onSubmit={handleEmailLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-[#7c8891] tracking-wider mb-2 uppercase">Username / Email</label>
                <input 
                  type="text" 
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@example.com" 
                  className="w-full bg-[#0f1215] border border-[#242a30] rounded-lg px-4 py-3 text-white outline-none focus:border-[#7c5cff] focus:ring-1 focus:ring-[#7c5cff] transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#7c8891] tracking-wider mb-2 uppercase">Password</label>
                <input 
                  type="password" 
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full bg-[#0f1215] border border-[#242a30] rounded-lg px-4 py-3 text-white outline-none focus:border-[#7c5cff] focus:ring-1 focus:ring-[#7c5cff] transition-all"
                  required
                />
              </div>
              
              {loginError && <p className="text-red-400 text-xs">{loginError}</p>}

              <button 
                type="submit"
                className="w-full bg-[#7c5cff] hover:bg-[#6d4be2] text-white font-bold py-3 rounded-lg transition-colors shadow-[0_0_15px_rgba(124,92,255,0.2)] mt-2"
              >
                Sign In to Console
              </button>
            </form>

            <div className="mt-6 flex items-center">
              <div className="flex-1 h-px bg-[#242a30]"></div>
              <span className="px-4 text-xs text-[#7c8891] uppercase">or</span>
              <div className="flex-1 h-px bg-[#242a30]"></div>
            </div>

            <button 
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              className="w-full mt-6 bg-[#14171b] border border-[#242a30] hover:bg-[#1a1d22] disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {isLoggingIn ? 'Connecting to Google...' : 'Sign in with Google'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Generate live preview data object
  const previewData = {
    title: statement || 'Live Announcement Preview',
    statement: statement || 'Live Announcement Preview',
    message: '',
    posterUrl: '',
    type: selectedType,
    timestamp: Date.now(),
    triggerSiren: selectedType === 'urgent'
  };

  return (
    <div className="min-h-screen bg-[#0b0d10] text-[#e8ecef] flex flex-col font-sans">
      {/* Top Navbar */}
      <div className="px-6 md:px-10 py-4 bg-[#14171b] border-b border-[#242a30] flex justify-between items-center sticky top-0 z-50">
        <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7c5cff] to-[#5a3ce0] flex items-center justify-center font-bold text-sm shadow-[0_0_10px_rgba(124,92,255,0.3)]">
            HB
          </div>
          <div>
            <h1 className="text-sm md:text-base font-bold tracking-wide leading-none text-white">Hackathon Broadcast</h1>
            <span className="text-[10px] text-[#7c8891] tracking-wider uppercase font-mono">Live Console</span>
          </div>
        </a>

        <div className="flex items-center gap-4 md:gap-6 flex-wrap">
          <a href="/" className="text-sm font-medium text-[#7c8891] hover:text-white transition-colors">
            Home
          </a>

          <div className="h-4 w-px bg-[#242a30]"></div>

          <a 
            href="/meals.html" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-sm font-medium text-[#7c8891] hover:text-[#33e0a1] transition-colors flex items-center gap-1"
          >
            Meals Tracking ↗
          </a>

          <a 
            href="/attendance.html" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-sm font-medium text-[#7c8891] hover:text-[#ffb454] transition-colors flex items-center gap-1"
          >
            Attendance ↗
          </a>

          <a 
            href="/board" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-sm font-medium text-[#7c8891] hover:text-[#7c5cff] transition-colors flex items-center gap-1"
          >
            Stage Board ↗
          </a>

          <div className="h-4 w-px bg-[#242a30]"></div>

          <button
            onClick={toggleTeamEditing}
            className={`text-xs font-mono px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
              allowTeamEditing 
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                : 'bg-[#0f1215] border-[#242a30] text-[#7c8891] hover:text-white'
            }`}
            title="Toggle whether Team Leaders can edit domain and team details on /team"
          >
            <Edit3 size={13} />
            <span>Leader Edit Access: {allowTeamEditing ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => setShowLivePreview(!showLivePreview)}
            className={`text-xs font-mono px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
              showLivePreview 
                ? 'bg-[#7c5cff]/20 border-[#7c5cff] text-[#7c5cff]' 
                : 'bg-[#0f1215] border-[#242a30] text-[#7c8891] hover:text-white'
            }`}
          >
            <Monitor size={14} />
            <span className="hidden sm:inline">Preview Stage</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#33e0a1] shadow-[0_0_6px_#33e0a1]"></div>
            <span className="text-[#7c8891] text-xs font-mono hidden lg:block">{user.email}</span>
          </div>

          <button 
            onClick={logout} 
            className="flex items-center gap-1.5 text-[#7c8891] hover:text-white transition-colors text-xs font-mono bg-[#0f1215] hover:bg-[#1a1d22] px-3 py-1.5 rounded-lg border border-[#242a30]"
          >
            <LogOut size={13} /> <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-[#14171b] border-b border-[#242a30] px-6 md:px-10 flex gap-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('broadcast')}
          className={`py-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === 'broadcast' ? 'border-[#7c5cff] text-white' : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
        >
          Announcements
        </button>
        <button
          onClick={() => setActiveTab('media')}
          className={`py-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === 'media' ? 'border-[#BC13FE] text-white' : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
        >
          Media Controls
        </button>
        <button
          onClick={() => setActiveTab('team-views')}
          className={`py-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === 'team-views' ? 'border-[#00F3FF] text-white' : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
        >
          Team Logs
        </button>
      </div>

      {/* Main Container - Conditionally Rendered based on Tab */}
      <div className="flex-1 max-w-[1240px] mx-auto w-full px-6 md:px-8 py-8 flex flex-col justify-between">
        
        {activeTab === 'broadcast' && (
          <>
            {/* Top Branding Section */}
            <div>
              <div className="flex items-center gap-4 mb-4 flex-wrap">
                <img src="/logos/gatlockuplogo.png" alt="GAT Logo" className="h-8 md:h-10 object-contain" />
                <div className="w-px h-6 bg-[#242a30]" />
                <img src="/logos/aimldeptlogo.png" alt="AIML Dept Logo" className="h-8 md:h-10 object-contain" />
                <div className="w-px h-6 bg-[#242a30]" />
                <img src="/logos/cbc2ologo.PNG" alt="CBC 2.0" className="h-8 md:h-10 object-contain" />
              </div>

              <div className="flex items-center gap-2 font-mono text-xs tracking-widest text-[#33e0a1] uppercase mb-1">
                <span className="w-2 h-2 rounded-full bg-[#33e0a1] shadow-[0_0_8px_#33e0a1]" />
                Broadcast Console
              </div>
              <span className="inline-block bg-[#7c5cff]/15 text-[#7c5cff] border border-[#7c5cff]/30 px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold mb-2">
                A National-Level 24-Hour Hackathon
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-1">
                CODE BREAKER CHALLENGE 2.0
              </h1>
              <div className="font-mono text-xs text-[#33e0a1] italic mb-1">
                “Think. Build. Break Limits.” • #AIforchange
              </div>
              <p className="text-xs text-[#7c8891] mb-8">
                Whatever you send here appears instantly on every /display screen, with sound.
              </p>
            </div>

            {/* 2-Column Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* LEFT SIDE: Custom Broadcast Form */}
          <div className="bg-[#14171b] border border-[#242a30] rounded-2xl p-6 md:p-7 flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono font-bold tracking-widest text-[#33e0a1] uppercase mb-5">
                Custom Broadcast Form
              </div>

              {/* Headline / Statement */}
              <label className="block text-[11px] font-mono font-bold text-[#7c8891] tracking-wider uppercase mb-2">
                Announcement Statement
              </label>
              <textarea 
                value={statement} 
                onChange={(e) => setStatement(e.target.value)} 
                placeholder="e.g. Judging starts in 15 minutes..." 
                rows="4"
                className="w-full bg-[#0f1215] border border-[#242a30] rounded-lg p-3.5 text-[#e8ecef] outline-none focus:border-[#7c5cff] transition-all text-sm resize-none"
              />

              {/* Priority */}
              <label className="block text-[11px] font-mono font-bold text-[#7c8891] tracking-wider uppercase mt-5 mb-2">
                Priority
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedType('info')}
                  className={`py-2 px-2.5 rounded-lg font-mono text-xs uppercase tracking-wider font-semibold border transition-all ${
                    selectedType === 'info'
                      ? 'bg-[#7c5cff]/15 border-[#7c5cff] text-[#7c5cff]'
                      : 'bg-[#0f1215] border-[#242a30] text-[#7c8891] hover:text-white'
                  }`}
                >
                  Info
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedType('success')}
                  className={`py-2 px-2.5 rounded-lg font-mono text-xs uppercase tracking-wider font-semibold border transition-all ${
                    selectedType === 'success'
                      ? 'bg-[#33e0a1]/15 border-[#33e0a1] text-[#33e0a1]'
                      : 'bg-[#0f1215] border-[#242a30] text-[#7c8891] hover:text-white'
                  }`}
                >
                  Success
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedType('warning')}
                  className={`py-2 px-2.5 rounded-lg font-mono text-xs uppercase tracking-wider font-semibold border transition-all ${
                    selectedType === 'warning'
                      ? 'bg-[#ffb454]/15 border-[#ffb454] text-[#ffb454]'
                      : 'bg-[#0f1215] border-[#242a30] text-[#7c8891] hover:text-white'
                  }`}
                >
                  Warning
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedType('urgent')}
                  className={`py-2 px-2.5 rounded-lg font-mono text-xs uppercase tracking-wider font-semibold border transition-all ${
                    selectedType === 'urgent'
                      ? 'bg-[#ff5c68]/15 border-[#ff5c68] text-[#ff5c68]'
                      : 'bg-[#0f1215] border-[#242a30] text-[#7c8891] hover:text-white'
                  }`}
                >
                  Urgent
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-6">
              <button 
                onClick={() => handleBroadcast()}
                className="w-full bg-[#7c5cff] hover:bg-[#8f72ff] text-white font-semibold py-3.5 rounded-lg transition-all text-sm active:scale-[0.99] shadow-lg shadow-[#7c5cff]/10"
              >
                Send to display screen
              </button>

              <button 
                onClick={clearBoard}
                className="w-full mt-2.5 bg-transparent border border-[#242a30] hover:border-[#ff5c68] text-[#7c8891] hover:text-[#ff5c68] font-mono text-xs py-2.5 rounded-lg transition-colors"
              >
                Clear display history
              </button>

              {/* Status Message */}
              <div className="min-h-[22px] mt-3">
                {status.msg && (
                  <div className={`text-xs font-mono flex items-center gap-1.5 ${
                    status.type === 'success' ? 'text-[#33e0a1]' : 
                    status.type === 'error' ? 'text-[#ff5c68]' : 
                    'text-[#ffb454]'
                  }`}>
                    {status.type === 'success' && <CheckCircle2 size={13} />}
                    {status.msg}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Predefined Hackathon Commands */}
          <div className="bg-[#14171b] border border-[#242a30] rounded-2xl p-6 md:p-7 flex flex-col">
            <div className="text-xs font-mono font-bold tracking-widest text-[#33e0a1] uppercase mb-5">
              PREDEFINED HACKATHON COMMANDS
            </div>

            <div className="flex flex-col gap-3 overflow-y-auto max-h-[480px] pr-1">
              {PRESETS.map((preset, idx) => (
                <div 
                  key={idx} 
                  className="bg-[#0f1215] border border-[#242a30] hover:border-[#7c5cff]/50 rounded-xl p-4 flex items-center justify-between gap-4 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded tracking-wider uppercase inline-block mb-1.5 ${
                      preset.type === 'urgent' ? 'bg-[#ff5c68]/15 text-[#ff5c68]' :
                      preset.type === 'warning' ? 'bg-[#ffb454]/15 text-[#ffb454]' :
                      preset.type === 'success' ? 'bg-[#33e0a1]/15 text-[#33e0a1]' :
                      'bg-[#7c5cff]/15 text-[#7c5cff]'
                    }`}>
                      {preset.type.toUpperCase()}
                    </span>
                    <h3 className="text-sm font-bold text-[#e8ecef] mb-0.5 font-sans">
                      {preset.title}
                    </h3>
                    <p className="text-xs text-[#7c8891] leading-relaxed">
                      {preset.desc}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => sendPreset(preset)}
                    className="shrink-0 bg-[#242a30] hover:bg-[#7c5cff] text-[#e8ecef] hover:text-white font-mono text-xs font-semibold px-4 py-2 rounded-lg transition-all active:scale-95"
                  >
                    Send
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Live Stage Preview Panel (Collapsible / Toggleable) */}
        {showLivePreview && (
          <div className="mt-8 bg-[#14171b] border border-[#242a30] rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xs font-mono font-bold tracking-widest text-[#7c8891] uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#33e0a1] animate-pulse"></span>
                Stage Display Live Mirror
              </h2>
              <button 
                onClick={() => setShowLivePreview(false)}
                className="text-xs text-[#7c8891] hover:text-white font-mono"
              >
                ✕ Close Preview
              </button>
            </div>
            
            <div className="w-full rounded-xl overflow-hidden border border-[#242a30] min-h-[420px]">
              <BoardTemplate data={previewData} isPreview={true} isMuted={true} />
            </div>
          </div>
        )}
          </>
        )}

        {activeTab === 'media' && (
          <AdminMediaControls />
        )}

        {activeTab === 'team-views' && (
          <AdminTeamViews />
        )}

        {/* Bottom Footer Notice */}
        <div className="mt-8 pt-4 border-t border-[#242a30]/50 text-xs font-mono text-[#7c8891] flex justify-between items-center flex-wrap gap-2">
          <div>
            Display screen lives at <a href="/board" target="_blank" rel="noopener noreferrer" className="text-[#7c5cff] hover:underline">/board</a> &mdash; open it on the projector.
          </div>
          <div className="text-[11px] text-[#7c8891]/60">
            CBC 2.0 Real-Time Event Sync
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminPortal;
