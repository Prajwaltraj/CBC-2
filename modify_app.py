import re

with open("2nd-verse-of-CBC2.0/src/App.jsx", "r") as f:
    content = f.read()

# Replace 'export default function App()' with 'function LandingPage()'
content = content.replace("export default function App() {", "function LandingPage() {")

# Append Router
router_code = """

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminPortal from './pages/AdminPortal';
import FoodPortal from './pages/FoodPortal';
import SmartBoard from './pages/SmartBoard';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin" element={<AdminPortal />} />
        <Route path="/food" element={<FoodPortal />} />
        <Route path="/board" element={<SmartBoard />} />
      </Routes>
    </Router>
  );
}
"""

content += router_code

with open("2nd-verse-of-CBC2.0/src/App.jsx", "w") as f:
    f.write(content)
