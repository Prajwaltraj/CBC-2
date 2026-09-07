import { Mail, Phone, Instagram, } from 'lucide-react';



const Footer = () => (
  <footer className="border-t border-white/10 bg-[#000000] py-16 relative z-10 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-t from-[#00F3FF]/5 to-transparent pointer-events-none" />
    <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
      
      {/* Brand & Location */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <img src="/team/cbc logo.png" alt="CBC 2.0" className="h-12 w-12 object-contain" />
          <span className="font-orbitron font-bold text-2xl tracking-wider">CBC 2.0</span>
        </div>
        <p className="text-gray-400 text-sm font-mono leading-relaxed">
          AI For Change <br/>
          Think. Build. Break Limits.<br/>
        </p> 
        <div className="mt-2 text-gray-500 text-xs font-mono leading-relaxed">
          <p className="font-bold text-gray-400 mb-1">Global Academy of Technology</p>
          <p>Ideal Homes Township,</p>
          <p>Raja Rajeshwari Nagar,</p>
          <p>Bengaluru - 560098</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="flex flex-col gap-4 lg:pl-8">
        <h4 className="font-orbitron font-bold text-[#00F3FF] tracking-wider mb-2 uppercase">Quick Links</h4>
        <div className="flex flex-col gap-3 text-sm font-mono text-gray-400">
          <a href="#" className="hover:text-[#00F3FF] transition-colors w-max">Home</a>
          <a href="#about" className="hover:text-[#00F3FF] transition-colors w-max">About Us</a>
          <a href="#themes" className="hover:text-[#00F3FF] transition-colors w-max">Themes</a>
          <a href="#timeline" className="hover:text-[#00F3FF] transition-colors w-max">Timeline</a>
          <a href="#rules" className="hover:text-[#00F3FF] transition-colors w-max">Rules & FAQs</a>
          <a href="#sponsors" className="hover:text-[#00F3FF] transition-colors w-max">Sponsors</a>
        </div>
      </div>
      
      {/* Connect */}
      <div className="flex flex-col gap-4">
        <h4 className="font-orbitron font-bold text-[#A855F7] tracking-wider mb-2 uppercase">Connect</h4>
        <div className="flex flex-col gap-3">
          <a href="mailto:Codebreakeraiml@gmail.com?subject=Query%20Regarding%20Code%20Breaker%20Challenge%202.0" className="flex items-center gap-3 px-4 py-3 glass-panel rounded-lg hover:bg-yellow-400/20 hover:text-yellow-400 transition-colors w-full">
            <Mail size={18} className="shrink-0" /><span className="font-mono text-xs break-all">Codebreakeraiml@gmail.com</span>
          </a>
          <a href="https://www.instagram.com/codebreaker_aiml/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 glass-panel rounded-lg hover:bg-[#E1306C]/20 hover:text-[#E1306C] transition-colors w-full">
            <Instagram size={18} className="shrink-0" /> <span className="font-mono text-xs">Code Breaker 2.0</span>
          </a>
          <a href="https://www.instagram.com/aitron_aiml/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 glass-panel rounded-lg hover:bg-gray-500/20 hover:text-white transition-colors w-full">
            <Instagram size={18} className="shrink-0" /> <span className="font-mono text-xs">Aitron AIML</span>
          </a>
        </div>
      </div>
      
      {/* Help & Support (Contacts Combined) */}
      <div className="flex flex-col gap-4">
        <h4 className="font-orbitron font-bold text-[#00F3FF] tracking-wider mb-2 uppercase">Help & Support</h4>
        <div className="text-gray-400 text-sm space-y-4 font-mono">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-white font-bold mb-1 text-xs">Registration</p>
              <div className="space-y-2">
                <div>
                  <p className="text-gray-400 text-[11px] mb-0.5">Vinayaka</p>
                  <a href="tel:+917022656317" className="flex items-center gap-1.5 text-xs hover:text-white transition-colors"><Phone size={12} className="text-[#A855F7]"/> +91 70226 56317</a>
                </div>
                <div>
                  <p className="text-gray-400 text-[11px] mb-0.5">Prajwal</p>
                  <a href="tel:+917975156216" className="flex items-center gap-1.5 text-xs hover:text-white transition-colors"><Phone size={12} className="text-[#A855F7]"/> +91 79751 56216</a>
                </div>
              </div>
            </div>
            
            <div>
              <p className="text-white font-bold mb-1 text-xs">Other Queries</p>
              <div className="space-y-2">
                <div>
                  <p className="text-gray-400 text-[11px] mb-0.5">Bhuvan</p>
                  <a href="tel:+918317462097" className="flex items-center gap-1.5 text-xs hover:text-white transition-colors"><Phone size={12} className="text-[#00F3FF]"/> +91 83174 62097</a>
                </div>
                <div>
                  <p className="text-gray-400 text-[11px] mb-0.5">Ravi</p>
                  <a href="tel:+919008788111" className="flex items-center gap-1.5 text-xs hover:text-white transition-colors"><Phone size={12} className="text-[#00F3FF]"/> +91 90087 88111</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
    
    {/* Bottom Footer */}
    <div className="max-w-7xl mx-auto px-4 mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-sm font-mono gap-6 relative z-10">
      <div className="flex flex-col items-center md:items-start gap-1">
        <p className="text-gray-500">&copy; 2026 Dept of AI & ML, GAT.</p>
        <p className="text-[#00F3FF] font-bold tracking-widest mt-2 flex items-center gap-2">
           Crafted with love <span className="text-[#A855F7] text-lg">♥</span> CBC 2.0 Team
        </p>
      </div>
      <div className="flex gap-6 text-gray-500">
        <a href="#" className="hover:text-[#00F3FF] transition-colors">Code of Conduct</a>
        <a href="#" className="hover:text-[#00F3FF] transition-colors">Privacy Policy</a>
      </div>
    </div>
  </footer>
);


export default Footer;
