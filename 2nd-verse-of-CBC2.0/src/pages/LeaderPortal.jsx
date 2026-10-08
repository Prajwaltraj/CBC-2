import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, 
  Mail, 
  KeyRound, 
  Github, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  LogOut, 
  Code2, 
  Users, 
  Sparkles, 
  ArrowRight, 
  RefreshCw, 
  Check, 
  Terminal,
  ShieldAlert,
  Hash
} from 'lucide-react';
import NavigationBar from '../components/NavigationBar';
import NeuralBackground from '../components/NeuralBackground';
import { rtdb } from '../firebase';
import { ref, onValue } from 'firebase/database';

// API requester
async function apiFetch(path, options = {}) {
  const url = path.startsWith('/') ? path : `/${path}`;
  return await fetch(url, options);
}

const LeaderPortal = () => {
  // Authentication states
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Dashboard
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [resendTimer, setResendTimer] = useState(0);

  // Dynamic submissions toggle state (controlled by Admin Portal)
  const [submissionsOpen, setSubmissionsOpen] = useState(false);

  // Authenticated Team Data & Submissions
  const [team, setTeam] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [submissionLoading, setSubmissionLoading] = useState(false);

  // Form State: Single input (GitHub URL)
  const [githubUrl, setGithubUrl] = useState('');
  const [formStatus, setFormStatus] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // OTP inputs refs
  const otpInputRefs = useRef([]);

  // Extract helper for team attributes
  const getTeamName = (t) => {
    if (!t) return 'Team';
    return t['TEAM NAME'] || t['Team Name'] || t['Team Name:'] || t['team_name'] || t['teamName'] || 'Team';
  };

  const getTeamId = (t) => {
    if (!t) return '';
    return t['CBC TEAM ID'] || t['Team ID'] || t['team_id'] || t['Team ID:'] || t['teamId'] || t['ID'] || '';
  };

  const getLeaderName = (t) => {
    if (!t) return '';
    return t["Team Leader's Name:"] || t["Team Leader's Name"] || t["Leader Name"] || t["Name"] || '';
  };

  const getProblemStatement = (t) => {
    if (!t) return '';
    return t['Problem Statement'] || t['Problem Statement:'] || t['Problem Domain'] || t['Domain'] || '';
  };

  const getMembersList = (t) => {
    if (!t) return [];
    const members = [];
    const leader = getLeaderName(t);
    if (leader) members.push({ name: leader, role: 'Leader' });

    for (let i = 1; i <= 5; i++) {
      const mName = t[`Member ${i} Name:`] || t[`Member ${i} Name`] || t[`Member ${i}`] || t[`member_${i}_name`];
      if (mName && mName.trim() && mName.trim() !== leader.trim()) {
        members.push({ name: mName.trim(), role: `Member ${i}` });
      }
    }
    return members;
  };

  // Load existing submission
  const loadSubmission = async (teamData, leaderEmail) => {
    setSubmissionLoading(true);
    const tid = getTeamId(teamData);
    const cleanEmail = (leaderEmail || email || '').trim().toLowerCase();

    try {
      const res = await apiFetch(`/api/submission?team_id=${encodeURIComponent(tid)}&email=${encodeURIComponent(cleanEmail)}`);
      const data = await res.json();
      if (data.submitted && data.submission && data.submission.githubUrl) {
        const s = data.submission;
        setSubmission(s);
        setGithubUrl(s.githubUrl || '');
        
        // Save to persistent storage
        localStorage.setItem(`cbc_locked_${cleanEmail}`, JSON.stringify(s));
        if (s.cbcId || s.teamId) {
          localStorage.setItem(`cbc_locked_${s.cbcId || s.teamId}`, JSON.stringify(s));
        }
      } else {
        // Not submitted in the Google Sheet (or reset by organizer)
        setSubmission(null);
        setGithubUrl('');
        localStorage.removeItem(`cbc_locked_${cleanEmail}`);
        if (tid) localStorage.removeItem(`cbc_locked_${tid}`);
      }
    } catch (e) {
      console.error('Error loading submission:', e);
    } finally {
      setSubmissionLoading(false);
    }
  };

  // Check existing session
  useEffect(() => {
    try {
      const savedSession = sessionStorage.getItem('cbc_leader_session');
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        if (parsed && parsed.team) {
          const userEmail = (parsed.email || '').trim().toLowerCase();
          setTeam(parsed.team);
          setEmail(userEmail);
          setStep(3);
          loadSubmission(parsed.team, userEmail);
        }
      }
    } catch (e) {
      console.error('Failed restoring session', e);
    }
  }, []);

  // Resend Countdown Timer
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  // Real-time Submissions Open/Closed Listener from Admin Portal
  useEffect(() => {
    try {
      const subRef = ref(rtdb, 'config/submissionsOpen');
      const unsub = onValue(subRef, (snapshot) => {
        if (snapshot.exists()) {
          setSubmissionsOpen(Boolean(snapshot.val()));
        } else {
          setSubmissionsOpen(false);
        }
      });
      return () => unsub();
    } catch (err) {
      console.error('Submissions config listener error:', err);
    }
  }, []);

  // Handle Send OTP
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!email || !email.includes('@')) {
      setMsg({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    setLoading(true);
    setMsg({ type: '', text: '' });

    try {
      const res = await apiFetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setMsg({ type: 'error', text: data.error || 'Failed to send verification code.' });
        setLoading(false);
        return;
      }

      setMsg({ type: 'success', text: data.message || 'Verification code sent! Check your inbox/spam.' });
      setStep(2);
      setResendTimer(60);
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => {
        if (otpInputRefs.current[0]) {
          otpInputRefs.current[0].focus();
        }
      }, 200);
    } catch (err) {
      console.error(err);
      setMsg({ type: 'error', text: 'Network connection failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP Input Change
  const handleOtpChange = (index, value) => {
    if (value && !/^\d+$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value ? value.slice(-1) : '';
    setOtp(newOtp);

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle OTP Keydown
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle Paste
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      otpInputRefs.current[5]?.focus();
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      setMsg({ type: 'error', text: 'Please enter all 6 digits of the verification code.' });
      return;
    }

    setLoading(true);
    setMsg({ type: '', text: '' });

    try {
      const res = await apiFetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: code,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setMsg({ type: 'error', text: data.error || 'Invalid verification code.' });
        setLoading(false);
        return;
      }

      const teamData = data.team;
      setTeam(teamData);
      setStep(3);
      setMsg({ type: 'success', text: 'Login successful! Welcome to the Submission Dashboard.' });

      sessionStorage.setItem('cbc_leader_session', JSON.stringify({
        email: email.trim().toLowerCase(),
        team: teamData,
        timestamp: Date.now()
      }));

      loadSubmission(teamData, email.trim().toLowerCase());
    } catch (err) {
      console.error(err);
      setMsg({ type: 'error', text: 'Verification failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    sessionStorage.removeItem('cbc_leader_session');
    setTeam(null);
    setSubmission(null);
    setStep(1);
    setEmail('');
    setGithubUrl('');
    setOtp(['', '', '', '', '', '']);
    setMsg({ type: 'info', text: 'You have been logged out securely.' });
  };

  // Live GitHub Validation
  const isValidGithubUrl = (url) => {
    const pattern = /^https?:\/\/(www\.)?github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(\/)?$/;
    return pattern.test(url.trim());
  };

  const isLocked = Boolean(submission && (submission.githubUrl || submission.submitted));

  // Step 1: Open Confirmation Modal
  const handleSubmitRepo = (e) => {
    if (e) e.preventDefault();
    if (isLocked) return;
    if (!submissionsOpen) {
      setFormStatus({ type: 'error', text: 'Submissions are currently closed by organizers. Please wait until submissions open.' });
      return;
    }
    setFormStatus({ type: '', text: '' });

    if (!githubUrl.trim()) {
      setFormStatus({ type: 'error', text: 'GitHub repository URL is required.' });
      return;
    }

    if (!isValidGithubUrl(githubUrl)) {
      setFormStatus({
        type: 'error',
        text: 'Invalid GitHub URL format. Example: https://github.com/username/repository'
      });
      return;
    }

    setShowConfirmModal(true);
  };

  // Step 2: Execute Final One-Time Submission
  const executeFinalSubmission = async () => {
    const tid = getTeamId(team);
    const teamName = getTeamName(team);
    const cleanEmail = email.trim().toLowerCase();

    setSubmitting(true);

    try {
      const payload = {
        email: cleanEmail,
        githubUrl: githubUrl.trim(),
        teamName: teamName
      };

      const res = await apiFetch('/api/submit-repo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setFormStatus({ type: 'error', text: data.error || 'Failed to submit repository.' });
        setSubmitting(false);
        setShowConfirmModal(false);
        return;
      }

      const finalSubmission = data.submission || payload;
      setSubmission(finalSubmission);
      setGithubUrl(finalSubmission.githubUrl || githubUrl.trim());

      // Save to persistent storage immediately
      const sessionData = {
        email: cleanEmail,
        team: team,
        submission: finalSubmission,
        timestamp: Date.now()
      };
      sessionStorage.setItem('cbc_leader_session', JSON.stringify(sessionData));
      localStorage.setItem(`cbc_locked_${cleanEmail}`, JSON.stringify(finalSubmission));
      if (tid) {
        localStorage.setItem(`cbc_locked_${tid}`, JSON.stringify(finalSubmission));
      }

      setFormStatus({
        type: 'success',
        text: 'Final project repository submission received and locked! ✓'
      });
      setShowConfirmModal(false);
      
      loadSubmission(team, cleanEmail);
    } catch (err) {
      console.error(err);
      setFormStatus({ type: 'error', text: 'Network error submitting details. Please check your connection.' });
      setShowConfirmModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden bg-[#F4F6F9] dark:bg-[#010103] text-gray-900 dark:text-[#F0F0F0] selection:bg-[#00F3FF]/30 selection:text-black dark:selection:text-white min-h-screen relative transition-colors duration-300 flex flex-col">
      <NeuralBackground />
      <NavigationBar />

      <main className="flex-1 flex flex-col items-center justify-start pt-28 pb-16 px-4 sm:px-6 relative z-10 w-full max-w-6xl mx-auto">
        
        {/* Top Header Banner */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 w-full max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00F3FF]/10 border border-[#00F3FF]/30 text-[#00F3FF] text-xs font-mono tracking-widest uppercase mb-3">
            <Sparkles size={13} />
            CBC 2.0 // Project Submission
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-orbitron font-extrabold tracking-wider uppercase text-white">
            Project <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F3FF] to-[#A855F7]">Submission</span>
          </h1>
          <p className="text-gray-400 font-mono text-xs sm:text-sm mt-2 max-w-xl mx-auto">
            {step === 3 
              ? 'Submit your team\'s GitHub repository link for jury evaluation.' 
              : 'Login using team leader email to submit GitHub repository details.'}
          </p>
        </motion.div>

        {/* Global Feedback Message */}
        <AnimatePresence>
          {msg.text && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`w-full max-w-xl mb-6 p-4 rounded-xl border flex items-start gap-3 text-sm font-mono ${
                msg.type === 'error'
                  ? 'bg-red-500/10 border-red-500/30 text-red-400'
                  : msg.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-[#00F3FF]/10 border-[#00F3FF]/30 text-[#00F3FF]'
              }`}
            >
              {msg.type === 'error' ? (
                <ShieldAlert className="shrink-0 mt-0.5" size={18} />
              ) : msg.type === 'success' ? (
                <CheckCircle2 className="shrink-0 mt-0.5" size={18} />
              ) : (
                <AlertCircle className="shrink-0 mt-0.5" size={18} />
              )}
              <div className="flex-1">{msg.text}</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================================================= */}
        {/* STEP 1: EMAIL ENTRY                                                       */}
        {/* ========================================================================= */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md bg-[#0a0a0f]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,243,255,0.07)] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00F3FF]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#A855F7]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-[#00F3FF]/10 border border-[#00F3FF]/20 rounded-xl text-[#00F3FF]">
                <Lock size={22} />
              </div>
              <div>
                <h2 className="text-xl font-orbitron font-bold text-white tracking-wide">Login</h2>
                <p className="text-xs text-gray-400 font-mono mt-0.5">Login using team leader email:</p>
              </div>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-gray-300 mb-2">
                  Team Leader Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="leader@gmail.com"
                    className="w-full pl-11 pr-4 py-3 bg-[#010103] border border-white/15 focus:border-[#00F3FF] rounded-xl text-white font-mono text-sm placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#00F3FF] transition-all"
                  />
                </div>
                <p className="text-[11px] text-gray-500 font-mono mt-1.5">
                  Enter the email address registered in the Google Sheet for your team.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-[#00F3FF] to-[#00A3FF] hover:from-[#00E5F0] hover:to-[#0090E0] text-black font-orbitron font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,243,255,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="animate-spin" size={18} />
                    <span>Validating & Sending OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-white/10 text-center">
              <p className="text-xs text-gray-500 font-mono">
                Need help accessing your team? <br />
                Contact organizers at <a href="mailto:codebreaker.aiml@gmail.com" className="text-[#00F3FF] hover:underline font-bold">codebreaker.aiml@gmail.com</a>
              </p>
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: OTP VERIFICATION                                                  */}
        {/* ========================================================================= */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md bg-[#0a0a0f]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(168,85,247,0.1)] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#A855F7]/15 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-[#A855F7]/10 border border-[#A855F7]/20 rounded-xl text-[#A855F7]">
                <KeyRound size={22} />
              </div>
              <div>
                <h2 className="text-xl font-orbitron font-bold text-white tracking-wide">Enter Code</h2>
              </div>
            </div>

            <p className="text-xs text-gray-300 font-mono mb-4 leading-relaxed">
              We sent a 6-digit code to <span className="text-[#00F3FF] font-bold">{email}</span>. Please enter it below.
            </p>

            <form onSubmit={handleVerifyOtp} className="space-y-6">
              {/* 6 Digit Input Boxes */}
              <div className="flex justify-between gap-2" onPaste={handleOtpPaste}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-12 h-14 sm:w-14 sm:h-14 text-center font-orbitron text-xl font-bold bg-[#010103] border-2 border-white/20 focus:border-[#A855F7] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#A855F7]/50 transition-all"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || otp.join('').length !== 6}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-[#A855F7] to-[#7C3AED] hover:from-[#9333EA] hover:to-[#6D28D9] text-white font-orbitron font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="animate-spin" size={18} />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    <span>Verify & Open Dashboard</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-white/10 flex flex-col gap-3 text-center">
              <div className="flex items-center justify-between text-xs font-mono">
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={resendTimer > 0 || loading}
                  className="text-[#00F3FF] hover:underline disabled:text-gray-600 disabled:no-underline cursor-pointer"
                >
                  {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend Code'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setMsg({ type: '', text: '' });
                  }}
                  className="text-gray-400 hover:text-white cursor-pointer"
                >
                  Change Email
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: DASHBOARD & SUBMISSION FORM (ONLY 2 INPUTS)                       */}
        {/* ========================================================================= */}
        {step === 3 && team && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full space-y-6"
          >
            {/* Main Submission Form Card (Single Input: GitHub Repo URL) */}
            <div className="bg-[#0a0a0f]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-[0_0_50px_rgba(0,243,255,0.05)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#00F3FF]/10 border border-[#00F3FF]/20 rounded-xl text-[#00F3FF]">
                    <Code2 size={22} />
                  </div>
                  <div>
                    <h3 className="text-xl font-orbitron font-bold text-white tracking-wide">
                      Project Repository Submission
                    </h3>
                    <p className="text-xs text-gray-400 font-mono">
                      Logged in as <span className="text-[#00F3FF] font-semibold">{email}</span>
                    </p>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl font-mono text-xs flex items-center gap-2 transition-colors self-start sm:self-auto cursor-pointer"
                >
                  <LogOut size={15} />
                  <span>Logout</span>
                </button>
              </div>

              {/* Form Feedback */}
              <AnimatePresence>
                {formStatus.text && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`mb-6 p-4 rounded-xl border flex items-start gap-3 text-sm font-mono ${
                      formStatus.type === 'error'
                        ? 'bg-red-500/10 border-red-500/30 text-red-400'
                        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    }`}
                  >
                    {formStatus.type === 'error' ? <ShieldAlert size={18} /> : <CheckCircle2 size={18} />}
                    <div>{formStatus.text}</div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Locked Warning Banner */}
              {isLocked && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs font-mono flex items-center gap-3 mb-6">
                  <Lock size={18} className="shrink-0 text-amber-400" />
                  <div>
                    <strong className="text-white">Final Submission Recorded (Locked):</strong> Your project details have been submitted and synchronized with the evaluation sheet. As per rules, only one-time submissions are permitted.
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmitRepo} className="space-y-6">
                {/* 1. GitHub Repository URL Input (Only Input Required) */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-300 mb-2">
                    GitHub Repository URL <span className="text-[#00F3FF]">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                      <Github size={18} />
                    </div>
                    <input
                      type="url"
                      required
                      disabled={isLocked || !submissionsOpen}
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder={submissionsOpen ? "https://github.com/your-org/your-repo" : "Submissions currently closed by organizers"}
                      className={`w-full pl-11 pr-4 py-3 bg-[#010103] border rounded-xl text-white font-mono text-sm placeholder:text-gray-600 focus:outline-none transition-all disabled:opacity-75 disabled:bg-[#050508] disabled:cursor-not-allowed ${
                        githubUrl && isValidGithubUrl(githubUrl)
                          ? 'border-emerald-500/50 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400'
                          : githubUrl
                          ? 'border-amber-500/50 focus:border-amber-400 focus:ring-1 focus:ring-amber-400'
                          : 'border-white/15 focus:border-[#00F3FF] focus:ring-1 focus:ring-[#00F3FF]'
                      }`}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono mt-1.5 px-1">
                    <span className="text-gray-500">
                      Format: <code className="text-gray-400">https://github.com/user/repo</code>
                    </span>
                    {githubUrl && (
                      <span className={isValidGithubUrl(githubUrl) ? 'text-emerald-400' : 'text-amber-400'}>
                        {isValidGithubUrl(githubUrl) ? '✓ Valid format' : '⚠ Invalid GitHub link'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Repository Visibility & Access Notice */}
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-start gap-2.5">
                  <Terminal size={16} className="shrink-0 mt-0.5 text-amber-400" />
                  <div className="leading-relaxed space-y-1">
                    <div>
                      <strong>Repository Access:</strong> Please make sure the repository visibility is set to <strong className="text-white">Public</strong>.
                    </div>
                    <div className="text-amber-200">
                      🔒 <strong>If Private Repo:</strong> You <strong className="text-white underline">MUST add collaborator</strong>: 
                      <code className="bg-black/60 px-2 py-0.5 rounded text-[#00F3FF] ml-1 font-bold select-all border border-[#00F3FF]/30">cbc2.o.tech@gmail.com</code> so judges can review your commits and code.
                    </div>
                  </div>
                </div>

                {/* Submit Action Area */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
                  {isLocked ? (
                    <div className="w-full sm:w-auto px-8 py-3.5 bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-orbitron font-bold text-sm rounded-xl flex items-center justify-center gap-2.5">
                      <Lock size={16} />
                      <span>FINAL SUBMISSION LOCKED</span>
                    </div>
                  ) : submissionsOpen ? (
                    <button
                      type="submit"
                      disabled={submitting || !githubUrl}
                      className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#00F3FF] to-[#A855F7] hover:from-[#00E5F0] hover:to-[#9333EA] text-black font-orbitron font-bold text-sm rounded-xl flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(0,243,255,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <Check size={18} />
                      <span>Submit Final Project</span>
                    </button>
                  ) : (
                    <div className="w-full sm:w-auto px-8 py-3.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 font-orbitron font-bold text-sm rounded-xl flex items-center justify-center gap-2.5">
                      <Lock size={16} />
                      <span>SUBMISSIONS WILL OPEN SHORTLY</span>
                    </div>
                  )}

                  {submission && (
                    <span className="text-xs text-gray-400 font-mono text-center sm:text-left">
                      Submitted on: {submission.lastUpdatedAt ? new Date(submission.lastUpdatedAt).toLocaleString() : 'Recently'}
                    </span>
                  )}
                </div>
              </form>
            </div>

            {/* Confirmation Modal */}
            <AnimatePresence>
              {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-md bg-[#0a0a0f] border border-[#00F3FF]/40 rounded-2xl p-6 sm:p-7 shadow-[0_0_50px_rgba(0,243,255,0.2)] text-white space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
                        <ShieldAlert size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-orbitron font-bold text-white">Confirm Final Submission</h3>
                        <p className="text-xs text-amber-400 font-mono">One-Time Submission Rule</p>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-gray-300 font-mono leading-relaxed">
                      This is a <strong className="text-white">ONE-TIME final submission</strong>. Once submitted, your GitHub repository link <strong className="text-amber-400">CANNOT be edited or re-submitted</strong>.
                    </p>

                    <div className="p-3 bg-black/60 rounded-xl border border-white/10 text-xs font-mono space-y-2">
                      <div className="text-gray-400">Leader Email: <span className="text-[#00F3FF] font-bold">{email}</span></div>
                      <div className="text-gray-400 truncate">GitHub: <span className="text-emerald-400">{githubUrl}</span></div>
                      <div className="text-amber-300 text-[11px] pt-1.5 border-t border-white/10 flex items-start gap-1.5">
                        <span>🔒</span>
                        <span>If your repo is private, add collaborator: <code className="text-[#00F3FF] font-bold">cbc2.o.tech@gmail.com</code></span>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => setShowConfirmModal(false)}
                        className="flex-1 py-3 bg-white/10 hover:bg-white/15 border border-white/20 text-white rounded-xl font-mono text-xs transition-colors cursor-pointer"
                      >
                        Cancel & Review
                      </button>
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={executeFinalSubmission}
                        className="flex-1 py-3 bg-gradient-to-r from-[#00F3FF] to-[#A855F7] hover:from-[#00E5F0] hover:to-[#9333EA] text-black font-orbitron font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,243,255,0.4)] transition-all cursor-pointer"
                      >
                        {submitting ? <RefreshCw className="animate-spin" size={15} /> : <Check size={15} />}
                        <span>Confirm & Submit</span>
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default LeaderPortal;
