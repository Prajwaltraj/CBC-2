import re

with open('src/components/NavigationBar.jsx', 'r') as f:
    content = f.read()

# Add import
content = content.replace("import { motion, AnimatePresence } from 'framer-motion';", "import { motion, AnimatePresence } from 'framer-motion';\nimport ThemeToggle from './ThemeToggle';")

# Insert before Mobile Menu Toggle
content = content.replace("          {/* Mobile Menu Toggle (Visible only below 1200px, hidden above 1200px) */}", "          <ThemeToggle />\n          {/* Mobile Menu Toggle (Visible only below 1200px, hidden above 1200px) */}")

with open('src/components/NavigationBar.jsx', 'w') as f:
    f.write(content)
print("Patched nav")
