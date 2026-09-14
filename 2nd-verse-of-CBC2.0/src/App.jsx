import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CustomCursor from './components/CustomCursor';
import NavigationBar from './components/NavigationBar';
import FixedTimer from './components/FixedTimer';
import HeroSection from './components/HeroSection';
import StatsSection from './components/StatsSection';
import AboutSection from './components/AboutSection';
import ThemesSection from './components/ThemesSection';
import PrizesSection from './components/PrizesSection';
import TimelineSection from './components/TimelineSection';
import RulesSection from './components/RulesSection';
import ProblemStatementsSection from './components/ProblemStatementsSection';
import SponsorsSection from './components/SponsorsSection';
import TeamSection from './components/TeamSection';
import Footer from './components/Footer';
import AdminPortal from './pages/AdminPortal';
import SmartBoard from './pages/SmartBoard';
import { Analytics } from '@vercel/analytics/react';
function LandingPage() {
  return (
    <div className="w-full max-w-full overflow-x-hidden bg-[#F4F6F9] dark:bg-[#010103] text-gray-900 dark:text-[#F0F0F0] selection:bg-[#00F3FF]/30 selection:text-black dark:selection:text-white min-h-screen relative transition-colors duration-300">
      <FixedTimer />
      <NavigationBar />
        <HeroSection />
        <StatsSection />
        <AboutSection />
        <ThemesSection />
        <PrizesSection />
        <TimelineSection />
        <RulesSection />
        <ProblemStatementsSection />
        <SponsorsSection />
        <TeamSection />
        <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <CustomCursor />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin" element={<AdminPortal />} />
        <Route path="/board" element={<SmartBoard />} />
      </Routes>
      <Analytics />
    </Router>
  );
}
