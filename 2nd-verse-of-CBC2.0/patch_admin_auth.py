import re

with open('src/pages/AdminPortal.jsx', 'r') as f:
    content = f.read()

# Insert ALLOWED_EMAILS at the top of the component
auth_check = """
  // List of emails allowed to access the Admin Portal
  const ALLOWED_EMAILS = [
    'prajwal@example.com',
    'admin@example.com'
  ];

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      if (u) {
        if (ALLOWED_EMAILS.includes(u.email)) {
          setUser(u);
        } else {
          logout();
          setLoginError('Access Denied: Your email is not authorized for the Admin Portal.');
          setUser(null);
        }
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);
"""

content = re.sub(r'useEffect\(\(\) => \{\n\s*const unsubscribe = auth\.onAuthStateChanged\(\(u\) => \{\n\s*setUser\(u\);\n\s*\}\);\n\s*return \(\) => unsubscribe\(\);\n\s*\}, \[\]\);', auth_check.strip(), content)

with open('src/pages/AdminPortal.jsx', 'w') as f:
    f.write(content)
print("Admin updated")
