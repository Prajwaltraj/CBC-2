import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Scan, Search, CheckCircle2, XCircle, Users } from 'lucide-react';

const Attendance = () => {
  const [currentTeam, setCurrentTeam] = useState(null);
  const [scannerRunning, setScannerRunning] = useState(false);
  const [scannedTeamsCount, setScannedTeamsCount] = useState(0);
  const [scannedIds, setScannedIds] = useState(new Set());
  const [searchInput, setSearchInput] = useState('');
  const [toast, setToast] = useState('');
  const html5QrCodeRef = useRef(null);
  const lastScanRef = useRef({ text: '', time: 0 });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  };

  const loadTeam = async (teamId) => {
    try {
      const res = await fetch(`/api/team?team_id=${encodeURIComponent(teamId)}`);
      if (!res.ok) {
        const err = await res.json();
        showToast(err.error || 'Team not found');
        return;
      }
      const team = await res.json();
      setCurrentTeam(team);
      if (!scannedIds.has(team.team_id)) {
        setScannedIds((prev) => new Set(prev).add(team.team_id));
        setScannedTeamsCount((prev) => prev + 1);
      }
    } catch (e) {
      showToast('Network error — check your connection');
      console.error(e);
    }
  };

  const markAttendance = async (row, present) => {
    try {
      const res = await fetch('/api/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ row, present }),
      });
      if (!res.ok) {
        const err = await res.json();
        showToast(err.error || 'Could not update');
        return;
      }
      
      // Update local state
      setCurrentTeam((prevTeam) => {
        const newTeam = { ...prevTeam };
        const member = newTeam.members.find((m) => m.row === row);
        if (member) member.present = present;
        return newTeam;
      });
      showToast(`Marked ${present ? 'present' : 'absent'}`);
    } catch (e) {
      showToast('Network error — check your connection');
      console.error(e);
    }
  };

  const toggleScanner = () => {
    if (scannerRunning) stopScanner();
    else startScanner();
  };

  const startScanner = () => {
    if (!html5QrCodeRef.current) {
      html5QrCodeRef.current = new Html5Qrcode('reader');
    }
    const config = { fps: 10, qrbox: 240 };

    html5QrCodeRef.current
      .start({ facingMode: 'environment' }, config, onScanSuccess, () => {})
      .then(() => setScannerRunning(true))
      .catch((err) => {
        console.warn('environment camera failed, falling back:', err);
        html5QrCodeRef.current
          .start({ facingMode: 'user' }, config, onScanSuccess, () => {})
          .then(() => setScannerRunning(true))
          .catch((err2) => {
            showToast('Camera error — check browser permissions');
            console.error(err2);
          });
      });
  };

  const stopScanner = () => {
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current.stop().then(() => {
        setScannerRunning(false);
      });
    }
  };

  const onScanSuccess = async (decodedText) => {
    const now = Date.now();
    if (
      decodedText === lastScanRef.current.text &&
      now - lastScanRef.current.time < 4000
    )
      return;
    lastScanRef.current = { text: decodedText, time: now };

    let teamId = decodedText.trim();
    try {
      const payload = JSON.parse(decodedText);
      if (payload.team_id) teamId = payload.team_id;
    } catch (e) {
      // not JSON — treat raw text as the team_id
    }

    await loadTeam(teamId);
  };

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current && scannerRunning) {
        html5QrCodeRef.current.stop().catch(console.error);
      }
    };
  }, [scannerRunning]);

  return (
    <div className="min-h-screen bg-[#010103] text-white font-sans p-6 md:p-12 relative pb-24">
      {/* Header Section */}
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between bg-[#0F1014] p-6 rounded-2xl border border-[#00F3FF]/20 shadow-[0_0_20px_rgba(0,243,255,0.1)] mb-8">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl md:text-3xl font-orbitron font-bold text-white tracking-wide">
            Official Attendance Register
          </h1>
          <div className="text-sm text-gray-400 font-mono mt-1">Registration Desk · Member-wise Check-in</div>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-[10px] uppercase font-bold text-[#10B981] border border-[#10B981]/30 bg-[#10B981]/10 px-3 py-1 rounded-full mb-3 tracking-widest text-center">
            Verified<br />Check-in System
          </div>
          <div className="text-sm font-mono text-gray-300 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
            Teams Scanned: <b className="text-[#00F3FF] ml-1 text-lg">{scannedTeamsCount}</b>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Scanner Panel */}
        <div className="bg-[#0F1014] rounded-2xl border border-white/10 p-6 flex flex-col items-center">
          <h2 className="text-xl font-bold font-orbitron mb-6 flex items-center gap-2">
            <Scan className="text-[#00F3FF]" /> Scan Team QR Code
          </h2>
          
          <div id="reader" className="w-full max-w-[350px] bg-black/50 rounded-xl overflow-hidden mb-4 min-h-[250px] border border-white/5 flex items-center justify-center">
            {!scannerRunning && <Scan size={48} className="text-gray-700" />}
          </div>
          
          <p className="text-xs text-gray-400 mb-6 text-center">Hold the team's QR code steady in front of the camera</p>
          
          <button 
            onClick={toggleScanner}
            className={`w-full py-3 rounded-lg font-bold uppercase tracking-wider text-sm transition-all ${
              scannerRunning 
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/50' 
              : 'bg-[#00F3FF]/20 text-[#00F3FF] hover:bg-[#00F3FF]/30 border border-[#00F3FF]/50'
            }`}
          >
            {scannerRunning ? 'Stop Camera' : 'Start Camera'}
          </button>

          <div className="w-full h-px bg-white/10 my-8"></div>

          <div className="w-full">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Or enter Team ID manually</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadTeam(searchInput)}
                placeholder="e.g. HK2026-001" 
                className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#00F3FF] font-mono text-sm"
              />
              <button 
                onClick={() => loadTeam(searchInput)}
                className="bg-white/10 hover:bg-white/20 border border-white/10 px-5 rounded-lg transition-colors flex items-center justify-center"
              >
                <Search size={18} className="text-gray-300" />
              </button>
            </div>
          </div>
        </div>

        {/* Team Roster Panel */}
        <div className="bg-[#0F1014] rounded-2xl border border-white/10 p-6 flex flex-col">
          <h2 className="text-xl font-bold font-orbitron mb-6 flex items-center gap-2">
            <Users className="text-[#A855F7]" /> Team Roster
          </h2>

          {!currentTeam ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 text-center gap-4 py-12">
              <Scan size={48} className="text-gray-700 opacity-50" />
              <p className="text-sm">Scan a team's QR code to display<br/>its members here for attendance marking.</p>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-6 pb-6 border-b border-white/10">
                <h1 className="text-2xl font-bold text-white mb-2">{currentTeam.team_name}</h1>
                <div className="text-sm text-gray-400 font-mono flex flex-wrap gap-x-3 gap-y-1">
                  <span>ID: <b className="text-white">{currentTeam.team_id}</b></span>
                  <span>·</span>
                  <span>Table: <b className="text-white">{currentTeam.table_number || '—'}</b></span>
                  <span className="w-full text-xs mt-1 text-[#00F3FF] truncate">{currentTeam.project_title}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {currentTeam.members.map((m) => (
                  <div key={m.row} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {m.present ? (
                        <CheckCircle2 size={18} className="text-[#10B981] shrink-0" />
                      ) : (
                        <XCircle size={18} className="text-red-500 shrink-0" />
                      )}
                      <span className="font-semibold text-[15px]">{m.name}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0">
                      <button 
                        onClick={() => markAttendance(m.row, true)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wide uppercase transition-all ${
                          m.present 
                          ? 'bg-[#10B981] text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]' 
                          : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
                        }`}
                      >
                        Present
                      </button>
                      <button 
                        onClick={() => markAttendance(m.row, false)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wide uppercase transition-all ${
                          !m.present 
                          ? 'bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.4)]' 
                          : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
                        }`}
                      >
                        Absent
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#00F3FF] text-black px-6 py-3 rounded-xl font-bold tracking-wide text-sm shadow-[0_0_20px_rgba(0,243,255,0.4)] transition-all duration-300 z-50 ${
        toast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}>
        {toast}
      </div>
    </div>
  );
};

export default Attendance;
