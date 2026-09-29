import { useState, useEffect } from 'react';
import { useSignIn, useSignUp, useAuth } from '@clerk/react';
import { Search, CheckCircle2, AlertTriangle, KeyRound } from 'lucide-react';
import { ref, get } from 'firebase/database';
import { rtdb } from '../firebase';
import { useNavigate } from 'react-router-dom';

const TeamVerificationSection = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState({ type: '', msg: '' });
  
  // Clerk Hooks
  const { signIn, setActive } = useSignIn();
  const { signUp } = useSignUp();
  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth();
  
  const navigate = useNavigate();

  const [pendingVerification, setPendingVerification] = useState(false);

  // We intentionally do NOT auto-redirect on mount anymore, so users can still read the homepage!

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    if (!isAuthLoaded) {
      setStatus({ type: 'error', msg: 'Authentication service is blocked by your browser. Please disable shields/adblockers or try Chrome.' });
      return;
    }

    setStatus({ type: 'loading', msg: 'Sending code...' });

    try {
      console.log("[DEBUG] Fetching team from Firebase for:", email);
      const emailHash = email.toLowerCase().trim().replace(/[.#$\[\]\/]/g, '_');
      const teamRef = ref(rtdb, `registeredTeams/${emailHash}`);
      
      const snapshot = await Promise.race([
        get(teamRef),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Firebase Timeout')), 10000))
      ]);
      console.log("[DEBUG] Firebase result:", snapshot.exists());
      
      // if (!snapshot.exists()) {
      //   setStatus({ type: 'error', msg: 'Email not found in registered teams list.' });
      //   return;
      // }

      console.log("[DEBUG] Initiating Clerk signIn.create with strategy: email_code");
      try {
        const createResult = await Promise.race([
          signIn.create({ 
            identifier: email,
            strategy: 'email_code'
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Clerk signIn.create Timeout - Is your browser blocking Clerk scripts?')), 10000))
        ]);
        console.log("[DEBUG] Clerk signIn.create result:", createResult);

        // Clerk v6 sometimes returns the error directly in the resolved object instead of throwing!
        if (createResult && createResult.error) {
          throw createResult.error;
        }

        setPendingVerification(true);
        setStatus({ type: 'success', msg: 'Code sent! Check your inbox and spam folder.' });
        return;
      } catch (err) {
        console.log("[DEBUG] Clerk error caught during signIn:", err);
        const clerkErrorCode = err.errors?.[0]?.code;
        
        // If the user doesn't exist, or doesn't have OTP enabled, Clerk throws various errors.
        // We will aggressively fallback to signUp.create() for ANY Clerk error during signIn.
        if (err.errors && err.errors.length > 0) {
          console.log("[DEBUG] Falling back to signUp.create because signIn failed with:", clerkErrorCode);
          
          try {
            await signUp.create({ emailAddress: email });
            await signUp.sendEmailCode();
            setPendingVerification(true);
            setStatus({ type: 'success', msg: 'Code sent! Check your inbox and spam folder.' });
            return;
          } catch (signUpErr) {
            console.error("[DEBUG] signUp fallback also failed:", signUpErr);
            throw signUpErr;
          }
        } else {
          throw err;
        }
      }
    } catch (error) {
      console.error("[DEBUG] Final Catch:", error);
      setStatus({ type: 'error', msg: error.errors?.[0]?.longMessage || error.message || 'Failed to send code.' });
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setStatus({ type: 'loading', msg: 'Verifying code...' });

    console.log("[DEBUG] Verifying code with:", code);
    console.log("[DEBUG] signUp object:", signUp);
    console.log("[DEBUG] signIn object:", signIn);

    try {
      if (signUp && signUp.status === 'missing_requirements') {
        console.log("[DEBUG] Attempting signUp.verifyEmailCode...");
        const completeSignUp = await signUp.verifyEmailCode({ code });
        console.log("[DEBUG] completeSignUp result:", completeSignUp);
        
        if (completeSignUp && completeSignUp.error) {
          throw completeSignUp.error;
        }

        console.log("[DEBUG] Verification succeeded! Clerk handles session automatically in v6.");
        if (completeSignUp && completeSignUp.createdSessionId) {
          await setActive({ session: completeSignUp.createdSessionId });
        } else if (window.Clerk && window.Clerk.client && window.Clerk.client.signUp && window.Clerk.client.signUp.createdSessionId) {
          await setActive({ session: window.Clerk.client.signUp.createdSessionId });
        } else {
          // If Clerk handles it automatically, let's just wait for isSignedIn to flip,
          // or force a hard reload to pick up the new auth state.
          setTimeout(() => {
            window.location.href = '/team';
          }, 1500);
        }
        
        setStatus({ type: 'success', msg: 'Verification complete! Redirecting...' });
      } else if (signIn && signIn.status === 'needs_first_factor') {
        console.log("[DEBUG] Attempting signIn.attemptFirstFactor...");
        const completeSignIn = await signIn.attemptFirstFactor({
          strategy: 'email_code',
          code,
        });
        console.log("[DEBUG] completeSignIn result:", completeSignIn);
        
        if (completeSignIn && completeSignIn.error) {
          throw completeSignIn.error;
        }

        if (completeSignIn && completeSignIn.createdSessionId) {
          console.log("[DEBUG] Setting active session for signIn...");
          await setActive({ session: completeSignIn.createdSessionId });
        } else if (window.Clerk && window.Clerk.client && window.Clerk.client.signIn && window.Clerk.client.signIn.createdSessionId) {
          await setActive({ session: window.Clerk.client.signIn.createdSessionId });
        } else {
          setTimeout(() => {
            window.location.href = '/team';
          }, 1500);
        }
        setStatus({ type: 'success', msg: 'Verification complete! Redirecting...' });
      } else {
        console.log("[DEBUG] Neither signUp nor signIn are in expected states.");
        setStatus({ type: 'error', msg: 'Invalid authentication state. Try going back and requesting a new code.' });
      }
    } catch (error) {
      console.error("[DEBUG] Error during verification:", error);
      setStatus({ type: 'error', msg: error.errors?.[0]?.longMessage || 'Invalid code.' });
    }
  };

  return (
    <section id="verification" className="py-20 relative w-full overflow-hidden flex flex-col items-center">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-[#00F3FF]/5 to-transparent -z-10"></div>
      
      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#00F3FF] to-[#BC13FE]">
            TEAM VERIFICATION
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Securely access and verify your registered team's details.
          </p>
        </div>

        <div className="flex justify-center w-full">
          <div className="bg-white/5 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-[0_0_30px_rgba(0,243,255,0.1)] max-w-md w-full">
            {isSignedIn ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-[#33e0a1]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#33e0a1]/30">
                  <CheckCircle2 size={28} className="text-[#33e0a1]" />
                </div>
                <h3 className="text-2xl font-bold mb-2 dark:text-white text-black">Verification Complete</h3>
                <p className="text-gray-400 text-sm mb-8">You are securely logged into the Team Portal.</p>
                <button 
                  onClick={() => navigate('/team')}
                  className="w-full bg-[#33e0a1]/20 hover:bg-[#33e0a1]/30 text-[#33e0a1] border border-[#33e0a1]/50 font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wider text-sm shadow-[0_0_20px_rgba(51,224,161,0.2)]"
                >
                  Enter Team Portal ↗
                </button>
              </div>
            ) : !pendingVerification ? (
              <>
                <div className="mb-8 text-center">
                  <div className="w-16 h-16 bg-[#00F3FF]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#00F3FF]/30">
                    <Search size={28} className="text-[#00F3FF]" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 dark:text-white text-black">Find Your Team</h3>
                  <p className="text-gray-400 text-sm">Enter your registered email to receive a 6-digit OTP code.</p>
                </div>
                
                <form onSubmit={handleSendCode} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 tracking-wider mb-2 uppercase">Registered Email</label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="team@example.com"
                      required
                      className="w-full bg-black/40 border border-gray-700/50 rounded-lg p-3 text-white outline-none focus:border-[#00F3FF] focus:ring-1 focus:ring-[#00F3FF] transition-all"
                    />
                  </div>
                  {/* Required for Clerk v6 Custom Flow Bot Protection */}
                  <div id="clerk-captcha"></div>
                  <button 
                    type="submit"
                    disabled={status.type === 'loading'}
                    className="w-full bg-gradient-to-r from-[#00F3FF] to-[#BC13FE] hover:opacity-90 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wider text-sm shadow-[0_0_20px_rgba(0,243,255,0.3)] disabled:opacity-50"
                  >
                    {status.type === 'loading' ? 'Processing...' : 'Send OTP Code'}
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="mb-8 text-center">
                  <div className="w-16 h-16 bg-[#10B981]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#10B981]/30">
                    <KeyRound size={28} className="text-[#10B981]" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 dark:text-white text-black">Verify Code</h3>
                  <p className="text-gray-400 text-sm">Enter the 6-digit code sent to <span className="text-[#00F3FF]">{email}</span></p>
                </div>
                
                <form onSubmit={handleVerifyCode} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 tracking-wider mb-2 uppercase">6-Digit Code</label>
                    <input 
                      type="text" 
                      value={code}
                      onChange={(e) => setCode(e.target.value.trim())}
                      placeholder="123456"
                      required
                      className="w-full bg-black/40 border border-gray-700/50 rounded-lg p-3 text-white outline-none focus:border-[#00F3FF] focus:ring-1 focus:ring-[#00F3FF] transition-all text-center tracking-widest text-2xl"
                    />
                  </div>
                  {/* Required for Clerk v6 Custom Flow Bot Protection */}
                  <div id="clerk-captcha"></div>
                  <button 
                    type="submit"
                    disabled={status.type === 'loading'}
                    className="w-full bg-gradient-to-r from-[#10B981] to-[#059669] hover:opacity-90 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wider text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50"
                  >
                    {status.type === 'loading' ? 'Verifying...' : 'Verify Code'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setPendingVerification(false)}
                    className="w-full mt-4 text-gray-400 hover:text-white text-sm"
                  >
                    Back to Email
                  </button>
                </form>
              </>
            )}

            {status.msg && (
              <div className={`mt-6 p-4 rounded-lg border text-sm font-medium flex items-center gap-2 ${
                status.type === 'success' ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]' : 
                status.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 
                'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
              }`}>
                {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                {status.msg}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeamVerificationSection;
