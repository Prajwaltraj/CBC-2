import { Mail, Phone, Instagram, } from 'lucide-react';



const Footer = () => (
  <footer className="border-t border-white/10 bg-[#000000] py-16 relative z-10 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-t from-[#00F3FF]/5 to-transparent pointer-events-none" />
    <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
      
      {/* Brand */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 mb-2">
          <img src="https://codebreakerchallenge2o.vercel.app/logos/cbc2ologo.PNG" alt="CBC 2.0" className="h-10 w-10 object-contain" />
          <span className="font-orbitron font-bold text-2xl tracking-wider">CBC 2.0</span>
        </div>
        <p className="text-gray-400 text-sm font-mono leading-relaxed">
          AI For Change <br/>
          Think. Build. Break Limits.<br/>
        </p> 
      </div>
      
      {/* Connect */}
      <div className="flex flex-col gap-4">
        <h4 className="font-orbitron font-bold text-[#00F3FF] tracking-wider mb-2 uppercase">Connect</h4>
        <div className="flex flex-col gap-3">
          <a href="mailto:Codebreakeraiml@gmail.com?subject=Query%20Regarding%20Code%20Breaker%20Challenge%202.0" className="flex items-center gap-3 px-4 py-3 glass-panel rounded-lg hover:bg-yellow-400/20 hover:text-yellow-400 transition-colors w-full md:w-max">
            <Mail size={20} /><span className="font-mono text-sm">Email Us: <br />Codebreakeraiml@gmail.com</span>
          </a>
          <a href="https://www.instagram.com/codebreaker_aiml/reels/" className="flex items-center gap-3 px-4 py-3 glass-panel rounded-lg hover:bg-[#E1306C]/20 hover:text-[#E1306C] transition-colors w-full md:w-max">
            <Instagram size={20} /> <span className="font-mono text-sm">
              Code Breaker Challenge 2.0 <br /> </span>
          </a>
          <a href="https://www.instagram.com/aitron_aiml/" className="flex items-center gap-3 px-4 py-3 glass-panel rounded-lg hover:bg-gray-500/20 hover:text-white transition-colors w-full md:w-max">
            < Instagram size={20} /> <span className="font-mono text-sm">Aitron AIML</span>
          </a>
        </div>
      </div>
      
      {/* Contact: Registration */}
      <div className="flex flex-col gap-4">
        <h4 className="font-orbitron font-bold text-[#A855F7] tracking-wider mb-2 uppercase">Registration</h4>
        <div className="text-gray-400 text-sm space-y-3 font-mono">
          <div>
            <p className="text-white font-bold mb-1">Vinayaka</p>
            <p className="flex items-center gap-2 text-xs"><Phone size={12} className="text-[#A855F7]"/> +91 70226 56317</p>
          </div>
          <div>
            <p className="text-white font-bold mb-1">Prajwal T Raj</p>
            <p className="flex items-center gap-2 text-xs"><Phone size={12} className="text-[#A855F7]"/> +91 79751 56216</p>
          </div>
        </div>
      </div>

      {/* Contact: Queries */}
      <div className="flex flex-col gap-4">
        <h4 className="font-orbitron font-bold text-[#A855F7] tracking-wider mb-2 uppercase">Other Queries</h4>
        <div className="text-gray-400 text-sm space-y-3 font-mono">
          <div>
            <p className="text-white font-bold mb-1">Bhuvan</p>
            <p className="flex items-center gap-2 text-xs"><Phone size={12} className="text-[#A855F7]"/> +91 83174 62097</p>
          </div>
          <div>
            <p className="text-white font-bold mb-1">Ravi</p>
            <p className="flex items-center gap-2 text-xs"><Phone size={12} className="text-[#A855F7]"/> +91 90087 88111</p>
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
