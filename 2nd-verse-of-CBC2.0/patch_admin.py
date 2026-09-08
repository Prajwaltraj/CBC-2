import re

with open('src/pages/AdminPortal.jsx', 'r') as f:
    content = f.read()

# The part before "return (" (line 186)
match = re.search(r'(?s)(.*const previewData = \{.*?triggerSiren: false\n  \};\n\n  return \()(.*)', content)

if match:
    prefix = match.group(1)
    
    new_ui = """
    <div className="min-h-screen bg-[#010103] text-white flex flex-col font-sans relative overflow-hidden">
      {/* Cyberpunk Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:34px_34px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#00F3FF]/10 blur-[120px] pointer-events-none rounded-full" />
      
      {/* Top Navbar */}
      <div className="px-6 py-4 bg-black/40 backdrop-blur-md border-b border-[#00F3FF]/20 flex justify-between items-center sticky top-0 z-50 shadow-[0_4px_30px_rgba(0,243,255,0.05)]">
        <a href="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 rounded bg-[#00F3FF]/10 border border-[#00F3FF]/40 flex items-center justify-center font-bold text-[#00F3FF] shadow-[0_0_15px_rgba(0,243,255,0.3)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-[#00F3FF] opacity-0 group-hover:opacity-20 transition-opacity" />
            <Monitor size={18} />
          </div>
          <div>
            <h1 className="text-lg font-orbitron font-bold tracking-widest leading-none glow-cyan uppercase">Control Room</h1>
            <span className="text-[10px] text-[#00F3FF] tracking-[0.3em] font-mono uppercase animate-pulse">System Online</span>
          </div>
        </a>
        <div className="flex items-center gap-6">
          <a href="/" className="text-xs font-mono tracking-widest text-gray-400 hover:text-white transition-colors uppercase">Home</a>
          <div className="h-4 w-px bg-white/10"></div>

          <a href="/meals.html" target="_blank" rel="noopener noreferrer" className="text-xs font-mono tracking-widest text-gray-400 hover:text-[#10B981] transition-colors flex items-center gap-2 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" /> Meals ↗
          </a>
          <a href="/attendance.html" target="_blank" rel="noopener noreferrer" className="text-xs font-mono tracking-widest text-gray-400 hover:text-[#FBBF24] transition-colors flex items-center gap-2 uppercase">
             <span className="w-1.5 h-1.5 rounded-full bg-[#FBBF24] animate-ping" /> Attendance ↗
          </a>
          <div className="h-4 w-px bg-white/10"></div>
          <div className="flex items-center gap-3 bg-[#00F3FF]/5 px-4 py-1.5 rounded border border-[#00F3FF]/20">
            <div className="w-2 h-2 rounded-full bg-[#00F3FF] shadow-[0_0_8px_#00F3FF]"></div>
            <span className="text-[#00F3FF] text-[10px] font-mono uppercase tracking-widest hidden md:block">{user.email}</span>
          </div>
          <button onClick={logout} className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors text-[10px] uppercase font-mono tracking-widest bg-red-500/5 hover:bg-red-500/10 px-4 py-2 rounded border border-red-500/20">
            <LogOut size={12} /> Sign Out
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 lg:p-8 grid grid-cols-1 xl:grid-cols-12 gap-8 max-w-[1800px] mx-auto w-full relative z-10">
        
        {/* Left Column: Controls (Span 4) */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          
          {/* Editor HUD */}
          <div className="bg-black/40 backdrop-blur-md p-6 rounded-xl border border-[#A855F7]/30 shadow-[0_0_30px_rgba(168,85,247,0.1)] relative">
            <div className="absolute top-0 left-4 px-2 py-0.5 bg-[#A855F7]/20 border border-[#A855F7]/50 rounded-b text-[#A855F7] text-[9px] font-mono uppercase tracking-widest">Input Module</div>
            
            <h2 className="text-xl font-orbitron font-bold text-white mb-6 mt-2 tracking-widest uppercase flex items-center gap-3">
              <span className="text-[#A855F7] glow-purple">{'//'}</span> Broadcast Editor
            </h2>
            
            <div className="space-y-6">
              <div className="relative group">
                <label className="block text-[10px] font-mono text-[#A855F7] tracking-[0.2em] mb-2 uppercase">Image Payload (URL)</label>
                <div className="absolute left-3 top-[32px] text-[#A855F7]/50 group-focus-within:text-[#A855F7] transition-colors">
                   <Monitor size={14} />
                </div>
                <input 
                  type="text" 
                  value={posterUrl} 
                  onChange={(e) => setPosterUrl(e.target.value)} 
                  placeholder="https://.../poster.png" 
                  className="w-full bg-black/60 border border-white/10 rounded p-3 pl-9 text-gray-300 font-mono text-sm outline-none focus:border-[#A855F7] focus:bg-[#A855F7]/5 transition-all placeholder:text-gray-700"
                />
              </div>
              
              <div className="relative group">
                <label className="block text-[10px] font-mono text-[#00F3FF] tracking-[0.2em] mb-2 uppercase">Text Payload</label>
                <div className="absolute left-3 top-[32px] text-[#00F3FF]/50 group-focus-within:text-[#00F3FF] transition-colors">
                   <Send size={14} />
                </div>
                <textarea 
                  value={statement} 
                  onChange={(e) => setStatement(e.target.value)} 
                  placeholder="Initiate broadcast sequence..." 
                  rows="4"
                  className="w-full bg-black/60 border border-white/10 rounded p-3 pl-9 text-gray-300 font-mono text-sm outline-none focus:border-[#00F3FF] focus:bg-[#00F3FF]/5 transition-all resize-none placeholder:text-gray-700 leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Execution HUD */}
          <div className="bg-black/40 backdrop-blur-md p-6 rounded-xl border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.1)] relative">
             <div className="absolute top-0 right-4 px-2 py-0.5 bg-red-500/20 border border-red-500/50 rounded-b text-red-500 text-[9px] font-mono uppercase tracking-widest">Execute Module</div>
             
            <h2 className="text-xl font-orbitron font-bold text-white mb-6 mt-2 tracking-widest uppercase flex items-center gap-3">
              <span className="text-red-500 glow-red">{'//'}</span> Action Console
            </h2>
            
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => handleBroadcast(true)}
                className="group relative w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 hover:border-red-500 text-red-400 hover:text-red-300 py-4 rounded transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs font-mono font-bold overflow-hidden"
              >
                <div className="absolute inset-0 bg-red-500/10 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                <AlertTriangle size={16} className="animate-pulse" /> Deploy with Siren
              </button>
              
              <button 
                onClick={() => handleBroadcast(false)}
                className="group relative w-full bg-[#00F3FF]/10 hover:bg-[#00F3FF]/20 border border-[#00F3FF]/50 hover:border-[#00F3FF] text-[#00F3FF] py-4 rounded transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs font-mono font-bold overflow-hidden"
              >
                 <div className="absolute inset-0 bg-[#00F3FF]/10 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                <Send size={16} /> Silent Deploy
              </button>
              
              <div className="grid grid-cols-2 gap-4 mt-2">
                <button 
                  onClick={stopSiren}
                  className="bg-black/60 border border-orange-500/30 text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/50 text-[10px] py-3 rounded transition-all uppercase tracking-widest font-mono flex items-center justify-center gap-2"
                >
                  <XCircle size={14} /> Halt Siren
                </button>
                <button 
                  onClick={clearBoard}
                  className="bg-black/60 border border-gray-600/30 text-gray-400 hover:bg-gray-500/10 hover:text-white hover:border-gray-500/50 text-[10px] py-3 rounded transition-all uppercase tracking-widest font-mono flex items-center justify-center gap-2"
                >
                  <XCircle size={14} /> Purge Board
                </button>
              </div>
            </div>

            {/* Status Terminal */}
            <div className="mt-6 bg-black/80 rounded border border-white/5 p-4 font-mono text-[10px] tracking-widest uppercase relative overflow-hidden">
               <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#00F3FF] to-transparent opacity-50" />
               <p className="text-gray-500 mb-2">{'>> SYSTEM_STATUS'}</p>
               {status.msg ? (
                 <p className={`flex items-start gap-2 ${
                    status.type === 'success' ? 'text-[#10B981]' : 
                    status.type === 'error' ? 'text-red-500' : 'text-yellow-400'
                  }`}>
                    <span className="opacity-50">[{new Date().toLocaleTimeString()}]</span> {status.msg}
                 </p>
               ) : (
                 <p className="text-gray-600 animate-pulse">Awaiting commands...</p>
               )}
            </div>
          </div>
        </div>

        {/* Right Column: Live Preview (Span 8) */}
        <div className="xl:col-span-8 flex flex-col relative">
          <div className="flex justify-between items-end mb-4 px-2">
            <h2 className="text-sm font-orbitron font-bold text-white tracking-widest flex items-center gap-3 uppercase">
              <span className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_10px_#10B981] animate-pulse"></span>
              Live Stage Preview
            </h2>
            <a href="/board" target="_blank" rel="noopener noreferrer" className="text-[10px] font-mono tracking-widest text-[#00F3FF] hover:text-white transition-colors flex items-center gap-2 uppercase border border-[#00F3FF]/30 px-3 py-1.5 rounded hover:bg-[#00F3FF]/10">
              <Monitor size={12} /> Launch Stage Display ↗
            </a>
          </div>
          
          <div className="flex-1 bg-black/60 rounded-xl border border-white/10 overflow-hidden relative min-h-[600px] flex items-center justify-center shadow-[0_0_50px_rgba(0,0,0,0.5)] p-2 backdrop-blur-xl">
             {/* Decorative Corner Borders */}
             <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#00F3FF]/50 rounded-tl-xl" />
             <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#00F3FF]/50 rounded-tr-xl" />
             <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#00F3FF]/50 rounded-bl-xl" />
             <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#00F3FF]/50 rounded-br-xl" />
             
            <div className="w-full h-full rounded-lg overflow-hidden relative border border-white/5">
              <BoardTemplate data={previewData} isPreview={true} />
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default AdminPortal;
"""

    with open('src/pages/AdminPortal.jsx', 'w') as f:
        f.write(prefix + new_ui)
    print("Success")
else:
    print("Match failed")
