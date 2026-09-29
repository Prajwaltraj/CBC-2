# Migration Plan: Clerk + Resend

We will abandon Firebase Magic Links and switch to a custom OTP implementation.

## Approach 1: Clerk Native OTP (Recommended)
Clerk has built-in Email OTP. We don't even need a separate backend for Resend.
1. Add `<ClerkProvider>` to `App.jsx`.
2. Use Clerk's `useSignIn` hook to send a 6-digit OTP code directly to their email.
3. User enters the 6-digit code. Clerk verifies it.
4. Once verified, we fetch their data from Firebase RTDB.
*Requires*: Clerk Publishable Key.

## Approach 2: Custom OTP via Resend + Vercel Serverless
If you specifically want to use Resend to send a heavily customized HTML email, we build our own OTP system.
1. We create a `api/send-otp.js` Vercel serverless function using the Resend Node SDK.
2. React frontend generates a 6-digit code and stores it in Firebase RTDB (`otps/{emailHash}`).
3. Frontend calls `/api/send-otp` to email the user.
4. User enters code in frontend, frontend validates against Firebase RTDB.
*Requires*: Resend API Key. (Note: To test this locally, you must use `vercel dev` instead of `npm run dev` so the `/api` route works).
