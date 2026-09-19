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
import ProblemStatementsSection from './components/ProblemStatementsSection';
import SponsorsSection from './components/SponsorsSection';
import TeamSection from './components/TeamSection';
import Footer from './components/Footer';
import AdminPortal from './pages/AdminPortal';
import SmartBoard from './pages/SmartBoard';
import GlimpsesSection from './components/GlimpsesSection';
import NeuralBackground from './components/NeuralBackground';
import RulebookPage from './pages/RulebookPage';
import { Analytics } from '@vercel/analytics/react';

function LandingPage() {
  return (
    <div className="w-full max-w-full overflow-x-hidden bg-[#F4F6F9] dark:bg-[#010103] text-gray-900 dark:text-[#F0F0F0] selection:bg-[#00F3FF]/30 selection:text-black dark:selection:text-white min-h-screen relative transition-colors duration-300">
      <NeuralBackground />
      <FixedTimer />
      <NavigationBar />
      
      <div className="flex flex-col gap-16 relative z-10">
        <HeroSection />
        <AboutSection />
        <StatsSection />
        <GlimpsesSection />
        <ThemesSection />
        <PrizesSection />
        <TimelineSection />
        <ProblemStatementsSection />
        <SponsorsSection />
        <TeamSection />
        <Footer />
      </div>
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
        <Route path="/rulebook" element={<RulebookPage />} />
      </Routes>
      <Analytics />
    </Router>
  );
}
