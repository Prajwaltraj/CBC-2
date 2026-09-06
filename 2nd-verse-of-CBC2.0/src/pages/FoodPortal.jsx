import React, { useState, useEffect } from 'react';
import { auth, loginWithGoogle, logout } from '../firebase';
import { LogIn, LogOut, Utensils, Download, CheckCircle } from 'lucide-react';
// import * as XLSX from 'xlsx'; // To be installed later if needed

const FoodPortal = () => {
  const [user, setUser] = useState(null);
  const [teamId, setTeamId] = useState('');
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  const handleLogFood = async (e) => {
    e.preventDefault();
    setError('');
    if (!teamId.trim()) return;

    try {
      // PLACEHOLDER: Connect to your existing backend here
      // const response = await fetch('YOUR_BACKEND_URL', { ... })
      // if (!response.ok) throw new Error('Failed to log');
      
      const newLog = {
        id: Date.now().toString(),
        teamId: teamId.toUpperCase(),
        timestamp: new Date().toLocaleString(),
        status: 'Served'
      };
      
      setLogs([newLog, ...logs]);
      setTeamId('');
    } catch (err) {
      console.error(err);
      setError('Connection to backend failed. Operating in offline fallback mode.');
    }
  };

  const exportToExcel = () => {
    // Placeholder for XLSX export
    alert("Excel Export will be enabled once backend connection is finalized.");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#010103] flex items-center justify-center p-4">
        <div className="glass-panel p-8 rounded-xl max-w-md w-full text-center border-[#00F3FF]/30">
          <Utensils size={48} className="text-[#00F3FF] mx-auto mb-4" />
          <h2 className="text-2xl font-orbitron font-bold text-white mb-6 uppercase tracking-widest">Food Logistics Auth</h2>
          <button 
            onClick={loginWithGoogle}
            className="flex items-center justify-center gap-3 w-full py-3 bg-[#00F3FF]/20 border border-[#00F3FF] text-white rounded-lg hover:bg-[#00F3FF]/40 transition-colors font-mono"
          >
            <LogIn size={20} /> Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#010103] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
          <h1 className="text-3xl font-orbitron font-bold text-[#00F3FF] uppercase tracking-widest flex items-center gap-3">
            <Utensils /> Logistics
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 font-mono text-sm">{user.email}</span>
            <button onClick={logout} className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors text-sm font-mono"><LogOut size={16} /> Logout</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 glass-panel p-6 rounded-xl border border-white/10 h-max">
            <h2 className="text-xl font-orbitron font-bold text-white mb-4 uppercase tracking-widest">Log Meal</h2>
            <form onSubmit={handleLogFood} className="space-y-4 font-mono">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Participant / Team ID</label>
                <input 
                  type="text" 
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                  placeholder="e.g. CBC-104"
                  className="w-full bg-black/50 border border-white/10 rounded p-3 text-white outline-none focus:border-[#00F3FF] uppercase"
                  autoFocus
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-[#00F3FF]/20 border border-[#00F3FF] text-[#00F3FF] font-bold py-3 rounded-lg hover:bg-[#00F3FF]/40 transition-colors flex items-center justify-center gap-2 uppercase tracking-widest"
              >
                <CheckCircle size={18} /> Mark Served
              </button>
              {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
            </form>
          </div>

          <div className="md:col-span-2 glass-panel p-6 rounded-xl border border-white/10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-orbitron font-bold text-white uppercase tracking-widest">Recent Logs</h2>
              <button onClick={exportToExcel} className="flex items-center gap-2 text-xs font-mono bg-green-500/20 text-green-500 border border-green-500/50 px-3 py-2 rounded hover:bg-green-500/30 transition-colors">
                <Download size={14} /> Export Excel
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-mono text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400">
                    <th className="py-3 px-4 font-normal">ID</th>
                    <th className="py-3 px-4 font-normal">Time</th>
                    <th className="py-3 px-4 font-normal">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="py-8 text-center text-gray-500">No logs yet.</td>
                    </tr>
                  ) : (
                    logs.map(log => (
                      <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 font-bold text-white">{log.teamId}</td>
                        <td className="py-3 px-4 text-gray-400">{log.timestamp}</td>
                        <td className="py-3 px-4 text-[#00F3FF]">{log.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodPortal;
