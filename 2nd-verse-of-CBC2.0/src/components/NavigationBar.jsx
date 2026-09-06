import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Menu, X } from 'lucide-react';

// ------------------------------------------------------------------
// GLOBAL CONSTANTS & DESIGN TOKENS
// ------------------------------------------------------------------
const BUTTERY_EASE = [0.22, 1, 0.36, 1];

// ------------------------------------------------------------------
// CUSTOM CURSOR
// ------------------------------------------------------------------

const NavigationBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on resize to desktop view (>= 1200px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1200) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navLinks = [
    { name: 'About', href: '#about' },
    { name: 'Domain', href: '#Domain' },
    { name: 'Prizes', href: '#prizes' },
    { name: 'Timeline', href: '#timeline' },
    { name: 'Statements', href: '#problems' },
    { name: 'Sponsors', href: '#sponsors' },
    { name: 'Team', href: '#team' },
  ];

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    if (href === '#' || href === '#hero') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
      return;
    }

    if (href.startsWith('#')) {
      const targetId = href.substring(1);
      const element = document.getElementById(targetId);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }, 50);
      }
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: BUTTERY_EASE }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || mobileMenuOpen ? 'bg-[#010103]/90 backdrop-blur-md border-b border-white/10 py-2.5 sm:py-3' : 'bg-transparent py-3 sm:py-4 nav:py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-8 flex justify-between items-center w-full">
        {/* Logo */}
        <a href="#" onClick={(e) => handleNavClick(e, '#')} className="flex items-center gap-1.5 sm:gap-2 group z-50 shrink-0">
          <img src="https://codebreakerchallenge2o.vercel.app/logos/cbc2ologo.PNG" alt="CBC 2.0" className="h-8 w-8 sm:h-9 sm:w-9 nav:h-10 nav:w-10 object-contain transition-transform duration-300 group-hover:scale-110" />
          <span className="font-orbitron font-bold text-base sm:text-lg nav:text-xl tracking-wider text-white group-hover:text-[#00F3FF] transition-colors">CBC 2.0</span>
        </a>

        {/* Desktop Nav Links (Expands above 1200px) */}
        <div className="hidden min-[1200px]:flex items-center gap-5 xl:gap-7 font-orbitron text-[11px] tracking-wider transition-all">
          {navLinks.map((link) => (
            <a key={link.name} href={link.href} onClick={(e) => handleNavClick(e, link.href)} className="nav-link uppercase whitespace-nowrap cursor-pointer">{link.name}</a>
          ))}
        </div>

        {/* Right Controls: Register Button + Mobile Menu Toggle (Toggle visible only below 1200px) */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-[1200px]:gap-4 shrink-0">
          <a href="https://forms.gle/idBVSyU5E7HQpkop9" target="_blank" rel="noopener noreferrer" className="relative inline-flex items-center justify-center px-3 sm:px-4 min-[1200px]:px-6 py-1.5 sm:py-2 min-[1200px]:py-2.5 overflow-hidden font-orbitron font-bold text-white bg-[#010103] border border-[#00F3FF] rounded-md hover:bg-[#00F3FF]/10 transition-colors group shadow-[0_0_10px_rgba(0,243,255,0.15)] shrink-0">
            <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-[#00F3FF] rounded-full group-hover:w-56 group-hover:h-56 opacity-10"></span>
            <span className="relative flex items-center gap-1 sm:gap-1.5 min-[1200px]:gap-2 text-[10px] sm:text-[11px] min-[1200px]:text-sm whitespace-nowrap">
              <Zap size={13} className="text-[#00F3FF] min-[1200px]:w-4 min-[1200px]:h-4" /> REGISTER
            </span>
          </a>

          {/* Mobile Menu Toggle (Visible only below 1200px, hidden above 1200px) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="min-[1200px]:hidden p-1.5 sm:p-2 rounded-md bg-[#0a0a0f]/80 border border-white/10 hover:border-[#00F3FF]/50 text-gray-300 hover:text-[#00F3FF] transition-all focus:outline-none shrink-0 cursor-pointer"
          >
            {mobileMenuOpen ? <X size={18} className="text-[#00F3FF]" /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Collapsible Navigation Menu (Visible only below 1200px when open) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: BUTTERY_EASE }}
            className="min-[1200px]:hidden overflow-hidden bg-[#010103]/95 backdrop-blur-xl border-b border-[#00F3FF]/20"
          >
            <div className="px-5 py-5 flex flex-col gap-2 font-orbitron text-xs tracking-wider max-w-7xl mx-auto">
              {navLinks.map((link, idx) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="flex items-center justify-between py-2.5 px-3 rounded-lg border border-transparent hover:border-[#00F3FF]/30 hover:bg-[#00F3FF]/5 text-gray-300 hover:text-[#00F3FF] transition-all cursor-pointer"
                >
                  <span className="uppercase font-bold tracking-widest">{link.name}</span>
                  <span className="text-[10px] text-gray-500 font-mono">0{idx + 1} {'//'}</span>
                </a>
              ))}
              
              <div className="mt-2 pt-3 border-t border-white/10 flex justify-between items-center text-[10px] font-mono text-gray-400">
                <span className="text-gray-500">SYS.NAV // ACTIVE</span>
                <span className="text-[#00F3FF]">CBC 2.0</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

// ------------------------------------------------------------------
// COUNTDOWN TIMER HOOK & COMPONENTS
// ------------------------------------------------------------------

export default NavigationBar;
