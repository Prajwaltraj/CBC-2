import re

auth_template = """
<!-- FIREBASE AUTH OVERLAY -->
<div id="auth-overlay" style="position:fixed;top:0;left:0;width:100%;height:100%;background:#F4F6F9;z-index:999999;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:'Inter',sans-serif;">
  <div style="background:#fff;padding:40px;border-radius:12px;box-shadow:0 10px 25px rgba(0,0,0,0.05);text-align:center;max-width:400px;width:90%;">
    <h2 style="margin-top:0;color:#16305C;font-family:'Playfair Display',serif;">{APP_NAME}</h2>
    <p style="color:#6B7280;margin-bottom:24px;font-size:14px;">Authorized personnel only. Please sign in to continue.</p>
    <button id="google-login-btn" style="background:#fff;border:1px solid #E3E7EE;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;color:#1F2937;cursor:pointer;display:flex;align-items:center;gap:12px;margin:0 auto;box-shadow:0 2px 4px rgba(0,0,0,0.02);transition:background 0.2s;">
      <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
      Sign in with Google
    </button>
    <p id="auth-error" style="color:#B91C1C;font-size:12px;margin-top:16px;display:none;"></p>
  </div>
</div>

<script type="module">
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
  import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

  const firebaseConfig = {
    apiKey: "AIzaSyDC98GMf0PPYbn0BxFe0QNKb1l0SyV-EdA",
    authDomain: "cbc20-3af58.firebaseapp.com",
    databaseURL: "https://cbc20-3af58-default-rtdb.firebaseio.com",
    projectId: "cbc20-3af58",
    storageBucket: "cbc20-3af58.firebasestorage.app",
    messagingSenderId: "664211052156",
    appId: "1:664211052156:web:e95ca2dbfa5af974575bf9"
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();

  // EDIT THIS ARRAY TO CONTROL WHO CAN ACCESS THIS PAGE
  const ALLOWED_EMAILS = [
    'prajwal@example.com',
    'volunteer@example.com'
  ];

  const overlay = document.getElementById('auth-overlay');
  const loginBtn = document.getElementById('google-login-btn');
  const errorMsg = document.getElementById('auth-error');

  onAuthStateChanged(auth, (user) => {
    if (user) {
      if (ALLOWED_EMAILS.includes(user.email)) {
        overlay.style.display = 'none'; // Grant access
      } else {
        errorMsg.textContent = 'Access Denied: ' + user.email + ' is not authorized.';
        errorMsg.style.display = 'block';
        signOut(auth);
      }
    } else {
      overlay.style.display = 'flex'; // Require login
    }
  });

  loginBtn.addEventListener('click', () => {
    errorMsg.style.display = 'none';
    signInWithPopup(auth, provider).catch(err => {
      console.error(err);
      errorMsg.textContent = 'Login failed. Please try again.';
      errorMsg.style.display = 'block';
    });
  });
</script>
<!-- END FIREBASE AUTH OVERLAY -->
"""

def inject(filename, app_name):
    with open(filename, 'r') as f:
        content = f.read()
    
    # Check if already injected
    if "FIREBASE AUTH OVERLAY" in content:
        print(f"Already injected in {filename}")
        return
        
    injection = auth_template.replace("{APP_NAME}", app_name)
    # Insert right after <body>
    content = re.sub(r'(<body[^>]*>)', r'\1\n' + injection, content, count=1, flags=re.IGNORECASE)
    
    with open(filename, 'w') as f:
        f.write(content)
    print(f"Injected into {filename}")

inject('public/meals.html', 'Meals Tracking')
inject('public/attendance.html', 'Attendance Scanner')

