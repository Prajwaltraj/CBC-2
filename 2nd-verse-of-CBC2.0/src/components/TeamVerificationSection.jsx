import { useState, useRef } from 'react';
import { useSignIn, useSignUp, useAuth, useUser } from '@clerk/react';
import { Search, CheckCircle2, AlertTriangle, KeyRound, Mail, ArrowLeft, RefreshCw } from 'lucide-react';
import { ref, get } from 'firebase/database';
import { rtdb } from '../firebase';
import { useNavigate } from 'react-router-dom';

const TeamVerificationSection = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [authMode, setAuthMode] = useState('signup'); // 'signup' | 'signin'
  const [pendingVerification, setPendingVerification] = useState(false);

  // References to maintain active resource across renders
  const activeSignUpRef = useRef(null);
  const activeSignInRef = useRef(null);

  // Clerk Hooks
  const { isLoaded: isSignInLoaded, signIn, setActive } = useSignIn();
  const { isLoaded: isSignUpLoaded, signUp } = useSignUp();
  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();

  const waitForClerk = async (maxMs = 6000) => {
    if (isSignInLoaded && isSignUpLoaded) return true;
    if (typeof window !== 'undefined' && window.Clerk?.loaded) return true;
    const start = Date.now();
    while (Date.now() - start < maxMs) {
      await new Promise((r) => setTimeout(r, 200));
      if (typeof window !== 'undefined' && window.Clerk?.loaded) {
        return true;
      }
    }
    return isSignInLoaded && isSignUpLoaded;
  };

  const handleSendCode = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!email) {
      setStatus({ type: 'error', msg: 'Please enter your registered email address.' });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    setStatus({ type: 'loading', msg: 'Verifying registration in database...' });

    try {
      // 1. Verify email exists in Firebase RTDB
      const emailHash = cleanEmail.replace(/[.#$\[\]\/]/g, '_');
      const teamRef = ref(rtdb, `registeredTeams/${emailHash}`);
      
      const snapshot = await Promise.race([
        get(teamRef),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Database Timeout')), 8000))
      ]);
      
      if (!snapshot.exists()) {
        setStatus({ 
          type: 'error', 
          msg: `No registered team found for "${cleanEmail}". Please check your email or contact support.` 
        });
        return;
      }

      setStatus({ type: 'loading', msg: 'Connecting to authentication service...' });
      await waitForClerk();

      const clientSignUp = signUp || (typeof window !== 'undefined' ? window.Clerk?.client?.signUp : null);
      const clientSignIn = signIn || (typeof window !== 'undefined' ? window.Clerk?.client?.signIn : null);

      if (!clientSignUp && !clientSignIn) {
        setStatus({ 
          type: 'error', 
          msg: 'Authentication service is initializing. Please wait a moment and try again.' 
        });
        return;
      }

      setStatus({ type: 'loading', msg: 'Sending 6-digit verification code...' });

      // Helper for signup verification preparation
      const prepareSignUp = async (resource) => {
        if (resource && typeof resource.prepareEmailAddressVerification === 'function') {
          return await resource.prepareEmailAddressVerification({ strategy: 'email_code' });
        }
        if (clientSignUp && typeof clientSignUp.prepareEmailAddressVerification === 'function') {
          return await clientSignUp.prepareEmailAddressVerification({ strategy: 'email_code' });
        }
      };

      // Helper for signin verification preparation
      const prepareSignIn = async (resource, factorId) => {
        const payload = factorId ? { strategy: 'email_code', emailAddressId: factorId } : { strategy: 'email_code' };
        if (resource && typeof resource.prepareFirstFactor === 'function') {
          return await resource.prepareFirstFactor(payload);
        }
        if (clientSignIn && typeof clientSignIn.prepareFirstFactor === 'function') {
          return await clientSignIn.prepareFirstFactor(payload);
        }
      };

      // 2. Try SignUp first
      try {
        if (clientSignUp && typeof clientSignUp.create === 'function') {
          const signUpAttempt = await clientSignUp.create({ emailAddress: cleanEmail });
          activeSignUpRef.current = signUpAttempt;
          await prepareSignUp(signUpAttempt);
          setAuthMode('signup');
          setPendingVerification(true);
          setStatus({ type: 'success', msg: 'Verification code sent! Please check your inbox and spam folder.' });
          return;
        }
      } catch (signUpErr) {
        console.log("[DEBUG] SignUp fallback to SignIn:", signUpErr);
        
        // If user exists, switch to SignIn flow
        if (clientSignIn && typeof clientSignIn.create === 'function') {
          try {
            const signInAttempt = await clientSignIn.create({ identifier: cleanEmail });
            activeSignInRef.current = signInAttempt;
            
            const emailCodeFactor = signInAttempt.supportedFirstFactors?.find(
              (f) => f.strategy === 'email_code'
            );

            if (emailCodeFactor) {
              await prepareSignIn(signInAttempt, emailCodeFactor.emailAddressId);
            } else {
              await prepareSignIn(signInAttempt);
            }

            setAuthMode('signin');
            setPendingVerification(true);
            setStatus({ type: 'success', msg: 'Verification code sent! Please check your inbox and spam folder.' });
            return;
          } catch (signInErr) {
            console.error("[DEBUG] SignIn error:", signInErr);
            throw signInErr;
          }
        } else {
          throw signUpErr;
        }
      }
    } catch (error) {
      console.error("[DEBUG] Error sending code:", error);
      const errMsg = error.errors?.[0]?.longMessage || error.errors?.[0]?.message || error.message || 'Failed to send verification code. Please try again.';
      setStatus({ type: 'error', msg: errMsg });
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!code) {
      setStatus({ type: 'error', msg: 'Please enter the 6-digit code.' });
      return;
    }

    const cleanCode = code.trim();
    setStatus({ type: 'loading', msg: 'Verifying code...' });

    try {
      const cleanEmail = email.toLowerCase().trim();
      const currentSignUp = activeSignUpRef.current || signUp || (typeof window !== 'undefined' ? window.Clerk?.client?.signUp : null);
      const currentSignIn = activeSignInRef.current || signIn || (typeof window !== 'undefined' ? window.Clerk?.client?.signIn : null);

      if (authMode === 'signup' && currentSignUp) {
        let completeSignUp = null;
        if (typeof currentSignUp.attemptEmailAddressVerification === 'function') {
          completeSignUp = await currentSignUp.attemptEmailAddressVerification({ code: cleanCode });
        } else if (typeof currentSignUp.verifyEmailCode === 'function') {
          completeSignUp = await currentSignUp.verifyEmailCode({ code: cleanCode });
        }

        if (completeSignUp && completeSignUp.createdSessionId) {
          await setActive({ session: completeSignUp.createdSessionId });
        } else if (window.Clerk?.client?.signUp?.createdSessionId) {
          await setActive({ session: window.Clerk.client.signUp.createdSessionId });
        }

        localStorage.setItem('verifiedEmail', cleanEmail);
        setStatus({ type: 'success', msg: 'Verification successful! Loading dashboard...' });
        setTimeout(() => {
          navigate('/team');
        }, 500);
        return;
      } else if (currentSignIn) {
        const completeSignIn = await currentSignIn.attemptFirstFactor({
          strategy: 'email_code',
          code: cleanCode,
        });

        if (completeSignIn && completeSignIn.createdSessionId) {
          await setActive({ session: completeSignIn.createdSessionId });
        } else if (window.Clerk?.client?.signIn?.createdSessionId) {
          await setActive({ session: window.Clerk.client.signIn.createdSessionId });
        }

        localStorage.setItem('verifiedEmail', cleanEmail);
        setStatus({ type: 'success', msg: 'Verification successful! Loading dashboard...' });
        setTimeout(() => {
          navigate('/team');
        }, 500);
        return;
      } else {
        throw new Error('Verification session expired. Please request a new code.');
      }
    } catch (error) {
      console.error("[DEBUG] Error verifying code:", error);
      const errMsg = error.errors?.[0]?.longMessage || error.errors?.[0]?.message || error.message || 'Invalid or expired code. Please try again.';
      setStatus({ type: 'error', msg: errMsg });
    }
  };

  const storedEmail = typeof window !== 'undefined' ? localStorage.getItem('verifiedEmail') : null;
  const currentEmail = (isSignedIn && user?.primaryEmailAddress?.emailAddress) || storedEmail;

  return (
    <section id="verification" className="py-20 relative w-full overflow-hidden flex flex-col items-center">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-[#00F3FF]/5 to-transparent -z-10"></div>
      
      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#00F3FF] to-[#BC13FE]">
            TEAM VERIFICATION
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto font-mono text-sm">
            Access your team dashboard using your registered email address with secure OTP.
          </p>
        </div>

        <div className="flex justify-center w-full">
          <div className="bg-white/5 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-[0_0_30px_rgba(0,243,255,0.1)] max-w-md w-full">
            {isSignedIn && currentEmail ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-[#33e0a1]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#33e0a1]/30">
                  <CheckCircle2 size={28} className="text-[#33e0a1]" />
                </div>
                <h3 className="text-2xl font-bold mb-2 dark:text-white text-black font-orbitron">Verified Session</h3>
                <p className="text-gray-400 text-sm mb-6 font-mono break-all">{currentEmail}</p>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => navigate('/team')}
                    className="w-full bg-[#33e0a1]/20 hover:bg-[#33e0a1]/30 text-[#33e0a1] border border-[#33e0a1]/50 font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wider text-sm shadow-[0_0_20px_rgba(51,224,161,0.2)] cursor-pointer font-orbitron"
                  >
                    View Team Dashboard ↗
                  </button>
                  <button 
                    onClick={async () => {
                      localStorage.removeItem('verifiedEmail');
                      localStorage.removeItem('verifiedTeam');
                      if (typeof window !== 'undefined' && window.Clerk?.signOut) {
                        await window.Clerk.signOut();
                      }
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

                  <div id="clerk-captcha"></div>

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
                  <p className="text-gray-400 text-sm font-mono">
                    Enter the 6-digit code sent to <span className="text-[#00F3FF] break-all">{email}</span>
                  </p>
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

                  <div id="clerk-captcha"></div>

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
