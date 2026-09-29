import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Edit3, Save, X, CheckCircle2, AlertTriangle, Loader2, User, Mail, Phone, Building2 } from 'lucide-react';
import { ref, get, set, update, onValue, increment, serverTimestamp } from 'firebase/database';
import { rtdb } from '../firebase';
import CustomCursor from '../components/CustomCursor';
import NavigationBar from '../components/NavigationBar';
import Footer from '../components/Footer';
import TeamVerificationSection from '../components/TeamVerificationSection';
import NeuralBackground from '../components/NeuralBackground';

export default function TeamPortal() {
  const navigate = useNavigate();
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Edit State (Controlled via Admin Portal in Firebase RTDB)
  const [isEditAllowed, setIsEditAllowed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editDomain, setEditDomain] = useState('');
  const [editMembers, setEditMembers] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ type: '', msg: '' });

  // Retrieve session from sessionStorage (expires when tab/browser is closed)
  const verifiedEmail = typeof window !== 'undefined' ? (sessionStorage.getItem('verifiedEmail') || localStorage.getItem('verifiedEmail')) : null;

  // Listen for admin config toggle in Firebase RTDB (default to false / view only)
  useEffect(() => {
    const configRef = ref(rtdb, 'config/allowTeamEditing');
    const unsubscribe = onValue(configRef, (snapshot) => {
      if (snapshot.exists()) {
        const allowed = Boolean(snapshot.val());
        setIsEditAllowed(allowed);
        if (!allowed) setIsEditing(false);
      } else {
        setIsEditAllowed(false);
        setIsEditing(false);
      }
    }, () => {
      setIsEditAllowed(false);
      setIsEditing(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (verifiedEmail) {
      const fetchTeam = async () => {
        try {
          const cached = sessionStorage.getItem('verifiedTeam') || localStorage.getItem('verifiedTeam');
          if (cached) {
            try {
              setTeamData(JSON.parse(cached));
            } catch(e) {}
          }

          const emailHash = verifiedEmail.toLowerCase().trim().replace(/[.#$\[\]\/]/g, '_');
          const teamRef = ref(rtdb, `registeredTeams/${emailHash}`);
          const snapshot = await get(teamRef);
          
          if (snapshot.exists()) {
            const data = snapshot.val();
            setTeamData(data);
            sessionStorage.setItem('verifiedEmail', verifiedEmail);
            sessionStorage.setItem('verifiedTeam', JSON.stringify(data));
            try {
              localStorage.removeItem('verifiedEmail');
              localStorage.removeItem('verifiedTeam');
            } catch (e) {}
            
            const viewRef = ref(rtdb, `teamViews/${emailHash}`);
            await set(viewRef, {
              teamName: data['Team Name:'] || data['Team Name'] || data["Team Leader's Name:"] || 'Unknown Team',
              email: verifiedEmail,
              lastViewedAt: serverTimestamp(),
              viewCount: increment(1)
            });
          } else {
            if (!cached) {
              setError('No registration details found for this email address.');
            }
          }
        } catch (err) {
          console.error('Error fetching team details:', err);
          if (!teamData) {
            setError('Unable to load team information. Please check your connection.');
          }
        } finally {
          setLoading(false);
        }
      };

      fetchTeam();
    } else {
      setLoading(false);
    }
  }, [verifiedEmail]);

  const handleLogout = () => {
    sessionStorage.removeItem('verifiedEmail');
    sessionStorage.removeItem('verifiedTeam');
    localStorage.removeItem('verifiedEmail');
    localStorage.removeItem('verifiedTeam');
    setTeamData(null);
    setError('');
    navigate('/');
  };

  const parsedTeam = useMemo(() => {
    if (!teamData) return null;

    // Robust case-insensitive and punctuation-agnostic key lookup
    const lowerMap = {};
    for (const [k, v] of Object.entries(teamData)) {
      if (v !== undefined && v !== null && String(v).trim() !== '') {
        lowerMap[k.toLowerCase().replace(/[:\s_]/g, '')] = String(v).trim();
      }
    }

    const getVal = (possibleKeys, fallback = '') => {
      for (const k of possibleKeys) {
        if (teamData[k] !== undefined && teamData[k] !== null && String(teamData[k]).trim() !== '') {
          return String(teamData[k]).trim();
        }
      }
      for (const k of possibleKeys) {
        const normalized = k.toLowerCase().replace(/[:\s_]/g, '');
        if (lowerMap[normalized]) {
          return lowerMap[normalized];
        }
      }
      return fallback;
    };

    const teamName = getVal(['Team Name:', 'Team Name', 'TeamName', "Team Leader's Name:"], 'Your Team');
    const domain = getVal(['Domain:', 'Domain', 'Selected Domain:', 'Domain Name:', 'Problem Domain:'], '—');
    const defaultCollege = getVal(['College Name:', 'College Name', 'College', "Team Leader's College:"], '');

    const members = [];

    // Leader (Member 1)
    const leaderName = getVal(["Team Leader's Name:", "Team Leader Name:", "Team Leader Name", "Leader Name:", "Leader Name", "Name:"]);
    const leaderEmail = getVal(["Email ID:", "Email Address", "Leader Email:", "Leader Email", "Email"]);
    const leaderPhone = getVal(["WhatsApp Number:", "Phone Number:", "Leader Phone:", "Leader Phone", "Phone"]);
    const leaderCollege = getVal(["Team Leader College:", "Team Leader College Name:", "College Name:", "College Name"], defaultCollege);
    const leaderBranch = getVal(["Team Leader Branch:", "Team Leader Branch", "Leader Branch:", "Leader Branch", "Branch:", "Branch"]);
    const leaderYear = getVal(["Team Leader Year:", "Team Leader Year", "Leader Year:", "Leader Year", "Year:", "Year"]);

    if (leaderName || leaderEmail || leaderPhone) {
      members.push({
        name: leaderName || 'Team Leader',
        email: leaderEmail || '',
        phone: leaderPhone || '',
        college: leaderCollege || '—',
        branch: leaderBranch || '',
        year: leaderYear || '',
        isLeader: true
      });
    }

    // Members 2 to 4
    for (let i = 2; i <= 4; i++) {
      const mName = getVal([`Team Member ${i} Name:`, `Team Member ${i} Name`, `Member ${i} Name:`, `Member ${i} Name`]);
      const mEmail = getVal([`Team Member ${i} Email ID:`, `Team Members ${i} Email ID:`, `Team Member ${i} Email:`, `Team Member ${i} Email`, `Member ${i} Email:`]);
      const mPhone = getVal([`Team Member ${i} WhatsApp Number:`, `Team Member ${i} Phone:`, `Team Member ${i} Phone`, `Member ${i} Phone:`]);
      const mCollege = getVal([`Team Member ${i} College Name:`, `Team Member ${i} College:`, `Team Member ${i} College`], defaultCollege);
      const mBranch = getVal([`Team Member ${i} Branch:`, `Team Member ${i} Branch`, `Member ${i} Branch:`, `Member ${i} Branch`]);
      const mYear = getVal([`Team Member ${i} Year:`, `Team Member ${i} Year`, `Member ${i} Year:`, `Member ${i} Year`]);

      if (mName || mEmail || mPhone) {
        members.push({
          name: mName || `Team Member ${i}`,
          email: mEmail || '',
          phone: mPhone || '',
          college: mCollege || '—',
          branch: mBranch || '',
          year: mYear || '',
          isLeader: false
        });
      }
    }

    return {
      teamName,
      domain,
      members
    };
  }, [teamData]);

  // Start Editing Mode
  const handleStartEdit = () => {
    if (!parsedTeam) return;
    setEditDomain(parsedTeam.domain === '—' ? '' : parsedTeam.domain);
    setEditMembers(parsedTeam.members.map(m => ({ ...m })));
    setIsEditing(true);
    setSaveStatus({ type: '', msg: '' });
  };

  // Cancel Editing Mode
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditDomain('');
    setEditMembers([]);
    setSaveStatus({ type: '', msg: '' });
  };

  // Update Individual Member Field
  const handleUpdateMemberField = (index, field, value) => {
    setEditMembers(prev => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  };

  // Save Changes to Firebase RTDB and Google Sheets
  const handleSaveChanges = async () => {
    if (!verifiedEmail) return;
    setIsSaving(true);
    setSaveStatus({ type: '', msg: '' });

    try {
      const emailHash = verifiedEmail.toLowerCase().trim().replace(/[.#$\[\]\/]/g, '_');
      const teamRef = ref(rtdb, `registeredTeams/${emailHash}`);

      const updates = {};

      // Domain
      if (editDomain && editDomain.trim() !== '') {
        updates['Domain:'] = editDomain.trim();
        updates['Domain'] = editDomain.trim();
      }

      // Leader (Member 1)
      if (editMembers[0]) {
        const m1 = editMembers[0];
        if (m1.name) updates["Team Leader's Name:"] = m1.name.trim();
        if (m1.email) {
          updates["Email ID:"] = m1.email.trim();
          updates["Email Address"] = m1.email.trim();
        }
        if (m1.phone) updates["WhatsApp Number:"] = m1.phone.trim();
        if (m1.college && m1.college !== '—') updates["College Name:"] = m1.college.trim();
        updates['Team Leader Branch:'] = m1.branch ? m1.branch.trim() : '';
        updates['Team Leader Year:'] = m1.year ? m1.year.trim() : '';
        updates['Branch:'] = m1.branch ? m1.branch.trim() : '';
        updates['Year:'] = m1.year ? m1.year.trim() : '';
      }

      // Members 2 to 4
      for (let i = 1; i < editMembers.length; i++) {
        const num = i + 1;
        const mi = editMembers[i];
        if (mi.name) updates[`Team Member ${num} Name:`] = mi.name.trim();
        if (mi.email) updates[`Team Member ${num} Email ID:`] = mi.email.trim();
        if (mi.phone) updates[`Team Member ${num} WhatsApp Number:`] = mi.phone.trim();
        if (mi.college && mi.college !== '—') updates[`Team Member ${num} College Name:`] = mi.college.trim();
        updates[`Team Member ${num} Branch:`] = mi.branch ? mi.branch.trim() : '';
        updates[`Team Member ${num} Year:`] = mi.year ? mi.year.trim() : '';
      }

      // 1. Write updates to Firebase RTDB
      await update(teamRef, updates);

      // 2. Write updates to Google Sheets via Webhook
      const GOOGLE_SHEET_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbxsDLJs4FHaQXDBp0Nh5WYc3I_E4HALnurnoH4mAslsE51dBZt6mfqLhdgoK-Cp3uKGtw/exec';
      try {
        await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: verifiedEmail,
            updates: updates
          })
        });
      } catch (sheetErr) {
        console.warn('Google Sheet background sync notice:', sheetErr);
      }

      // 3. Refresh local cache and state
      const updatedFullTeam = { ...teamData, ...updates };
      setTeamData(updatedFullTeam);
      sessionStorage.setItem('verifiedTeam', JSON.stringify(updatedFullTeam));

      setIsEditing(false);
      setSaveStatus({ type: 'success', msg: 'All changes saved and synced successfully! ✓' });
      setTimeout(() => setSaveStatus({ type: '', msg: '' }), 4000);
    } catch (err) {
      console.error('Error saving team updates:', err);
      setSaveStatus({ type: 'error', msg: 'Failed to save changes. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (!verifiedEmail) {
    return (
      <div className="w-full min-h-screen bg-[#F4F6F9] dark:bg-[#010103] text-gray-900 dark:text-[#F0F0F0] selection:bg-[#00F3FF]/30 selection:text-black dark:selection:text-white relative transition-colors duration-300 flex flex-col">
        <NeuralBackground />
        <CustomCursor />
        <NavigationBar />
        <main className="flex-1 flex items-center justify-center pt-24 pb-12 px-4 z-10">
          <TeamVerificationSection onVerified={() => window.location.reload()} />
        </main>
        <Footer />
      </div>
    );
  }

  if (loading && !teamData) {
    return (
      <div className="w-full min-h-screen bg-[#010103] text-white flex flex-col justify-center items-center font-orbitron">
        <Loader2 className="w-10 h-10 text-[#00F3FF] animate-spin mb-4" />
        <p className="tracking-widest uppercase text-sm text-gray-400">Loading Team Details...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F4F6F9] dark:bg-[#010103] text-gray-900 dark:text-[#F0F0F0] selection:bg-[#00F3FF]/30 selection:text-black dark:selection:text-white relative transition-colors duration-300 flex flex-col font-sans">
      <NeuralBackground />
      <CustomCursor />
      <NavigationBar />

      <main className="flex-1 pt-28 sm:pt-32 pb-12 sm:pb-16 px-3.5 sm:px-6 max-w-4xl mx-auto w-full z-10">
        {/* Top Header Bar */}
        <div className="mb-5 sm:mb-8 pb-3.5 sm:pb-4 border-b border-gray-800">
          <div className="flex justify-between items-center gap-3">
            <h1 className="text-xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#00F3FF] via-[#A300FF] to-[#FF007A] font-orbitron tracking-wider">
              TEAM PORTAL
            </h1>
            
            <button 
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-red-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider bg-red-500/10 hover:bg-red-500/30 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-red-500/20 cursor-pointer font-mono shrink-0"
            >
              <LogOut size={13} /> Sign Out
            </button>
          </div>

          <p className="text-gray-400 text-xs sm:text-sm font-mono mt-1.5 sm:mt-1">
            Verified access for <span className="text-[#00F3FF] font-medium break-words">{verifiedEmail}</span>
          </p>
        </div>
        
        {error ? (
          <div className="text-red-400 text-center py-10 px-4 bg-red-500/10 rounded-2xl border border-red-500/20 flex flex-col items-center gap-4 font-mono text-sm">
            <p className="text-sm sm:text-base">{error}</p>
            <button 
              onClick={handleLogout}
              className="px-5 py-2 bg-red-500/20 hover:bg-red-500/30 text-white rounded-lg border border-red-500/30 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Verify With Different Email
            </button>
          </div>
        ) : parsedTeam ? (
          <div className="bg-[#0b0f19] border border-[#1e293b] rounded-2xl p-4 sm:p-8 shadow-2xl overflow-hidden">
            {/* Top Bar: Team Name, Members Count & Dynamic Edit Button (Visible only when Admin enables it) */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 pb-5 sm:pb-6 border-b border-[#1e293b]">
              <div className="min-w-0 flex-1">
                <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-wide break-words font-orbitron">
                  {parsedTeam.teamName}
                </h2>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
                <span className="px-2.5 sm:px-3 py-1 bg-[#0284c7]/20 text-[#38bdf8] border border-[#0284c7]/40 rounded-full text-xs font-semibold font-mono whitespace-nowrap">
                  {parsedTeam.members.length} {parsedTeam.members.length === 1 ? 'Member' : 'Members'}
                </span>

                {isEditAllowed && !isEditing && (
                  <button
                    onClick={handleStartEdit}
                    className="flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-lg bg-[#00F3FF]/15 hover:bg-[#00F3FF]/25 text-[#00F3FF] border border-[#00F3FF]/40 text-xs font-mono font-bold transition-all cursor-pointer shadow-[0_0_15px_rgba(0,243,255,0.15)] active:scale-95"
                  >
                    <Edit3 size={13} /> Edit Details
                  </button>
                )}
              </div>
            </div>

            {/* Notification / Save Status Message */}
            {saveStatus.msg && (
              <div className={`mt-4 p-3 rounded-xl border text-xs font-mono flex items-center gap-2 ${
                saveStatus.type === 'success' 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}>
                {saveStatus.type === 'success' ? <CheckCircle2 size={15} className="shrink-0" /> : <AlertTriangle size={15} className="shrink-0" />}
                <span className="break-words flex-1">{saveStatus.msg}</span>
              </div>
            )}

            {/* Team Information Section (Domain) */}
            <div className="py-5 sm:py-6 border-b border-[#1e293b]">
              <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 tracking-wide">
                Team Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <span className="text-xs text-gray-400 uppercase tracking-wider font-mono block mb-1">
                    Domain
                  </span>
                  {isEditing ? (
                    <select
                      value={editDomain}
                      onChange={(e) => setEditDomain(e.target.value)}
                      className="w-full bg-black/50 border border-[#00F3FF]/40 focus:border-[#00F3FF] focus:ring-1 focus:ring-[#00F3FF] rounded-lg p-2.5 text-white font-mono text-xs sm:text-sm outline-none transition-all cursor-pointer"
                    >
                      <option value="" className="bg-[#0b0f19] text-gray-400">Select Domain</option>
                      {editDomain && !['Software & Web Development', 'Artificial Intelligence & Machine Learning (AI&ML)', 'Cybersecurity', 'Open Innovation', 'Blockchain & Web3', 'IoT & Embedded Systems'].includes(editDomain) && (
                        <option value={editDomain} className="bg-[#0b0f19] text-white">{editDomain}</option>
                      )}
                      <option value="Software & Web Development" className="bg-[#0b0f19] text-white">Software & Web Development</option>
                      <option value="Artificial Intelligence & Machine Learning (AI&ML)" className="bg-[#0b0f19] text-white">Artificial Intelligence & Machine Learning (AI&ML)</option>
                      <option value="Cybersecurity" className="bg-[#0b0f19] text-white">Cybersecurity</option>
                      <option value="Open Innovation" className="bg-[#0b0f19] text-white">Open Innovation</option>
                      <option value="Blockchain & Web3" className="bg-[#0b0f19] text-white">Blockchain & Web3</option>
                      <option value="IoT & Embedded Systems" className="bg-[#0b0f19] text-white">IoT & Embedded Systems</option>
                    </select>
                  ) : (
                    <span className="text-sm font-semibold text-white break-words">
                      {parsedTeam.domain}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Team Members Section */}
            <div className="pt-5 sm:pt-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5 mb-4">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  Team Members {isEditing && <span className="text-xs text-[#00F3FF] font-normal font-mono block sm:inline mt-0.5 sm:mt-0 sm:ml-2">(Editing All Member Details)</span>}
                </h3>
                {isEditing && (
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-mono transition-all cursor-pointer disabled:opacity-50"
                    >
                      <X size={13} /> Cancel
                    </button>
                    <button
                      onClick={handleSaveChanges}
                      disabled={isSaving}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-mono font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                {(isEditing ? editMembers : parsedTeam.members).map((member, idx) => (
                  <div 
                    key={idx}
                    className={`border rounded-xl p-3.5 sm:p-5 transition-all ${
                      isEditing 
                        ? 'bg-[#141e30] border-[#00F3FF]/40 shadow-[0_0_20px_rgba(0,243,255,0.05)]' 
                        : 'bg-[#131b2b]/90 border-[#1e293b] hover:border-[#38bdf8]/40'
                    }`}
                  >
                    {/* Member Header */}
                    <div className="flex justify-between items-center mb-3">
                      <div className="font-bold text-sm sm:text-base text-white font-mono tracking-wide truncate mr-2">
                        {String(idx + 1).padStart(2, '0')} · {isEditing ? (member.name || `Participant ${idx + 1}`) : member.name}
                      </div>
                      {member.isLeader && (
                        <span className="px-2 sm:px-2.5 py-0.5 bg-[#059669]/20 text-[#34d399] border border-[#059669]/40 rounded-full text-[11px] sm:text-xs font-medium font-mono shrink-0">
                          Leader
                        </span>
                      )}
                    </div>

                    {/* EDIT MODE: FULL FORM INPUTS FOR ALL DETAILS */}
                    {isEditing ? (
                      <div className="space-y-3 pt-1">
                        {/* Row 1: Name & College */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-xs font-mono">
                          <div>
                            <label className="text-gray-400 uppercase tracking-wider block text-[11px] mb-1 font-semibold flex items-center gap-1">
                              <User size={12} className="text-[#00F3FF]" /> Full Name
                            </label>
                            <input
                              type="text"
                              value={member.name || ''}
                              onChange={(e) => handleUpdateMemberField(idx, 'name', e.target.value)}
                              placeholder="Full Name"
                              className="w-full bg-black/50 border border-gray-700/80 focus:border-[#00F3FF] focus:ring-1 focus:ring-[#00F3FF] rounded-lg p-2.5 text-white font-mono text-xs outline-none transition-all"
                            />
                          </div>
                          <div>
                            <label className="text-gray-400 uppercase tracking-wider block text-[11px] mb-1 font-semibold flex items-center gap-1">
                              <Building2 size={12} className="text-[#00F3FF]" /> College
                            </label>
                            <input
                              type="text"
                              value={member.college === '—' ? '' : member.college}
                              onChange={(e) => handleUpdateMemberField(idx, 'college', e.target.value)}
                              placeholder="College Name"
                              className="w-full bg-black/50 border border-gray-700/80 focus:border-[#00F3FF] focus:ring-1 focus:ring-[#00F3FF] rounded-lg p-2.5 text-white font-mono text-xs outline-none transition-all"
                            />
                          </div>
                        </div>

                        {/* Row 2: Email & Phone */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-xs font-mono">
                          <div>
                            <label className="text-gray-400 uppercase tracking-wider block text-[11px] mb-1 font-semibold flex items-center gap-1">
                              <Mail size={12} className="text-[#00F3FF]" /> Email ID
                            </label>
                            <input
                              type="email"
                              value={member.email || ''}
                              onChange={(e) => handleUpdateMemberField(idx, 'email', e.target.value)}
                              placeholder="email@example.com"
                              className="w-full bg-black/50 border border-gray-700/80 focus:border-[#00F3FF] focus:ring-1 focus:ring-[#00F3FF] rounded-lg p-2.5 text-white font-mono text-xs outline-none transition-all"
                            />
                          </div>
                          <div>
                            <label className="text-gray-400 uppercase tracking-wider block text-[11px] mb-1 font-semibold flex items-center gap-1">
                              <Phone size={12} className="text-[#00F3FF]" /> WhatsApp / Phone
                            </label>
                            <input
                              type="text"
                              value={member.phone || ''}
                              onChange={(e) => handleUpdateMemberField(idx, 'phone', e.target.value)}
                              placeholder="10-digit number"
                              className="w-full bg-black/50 border border-gray-700/80 focus:border-[#00F3FF] focus:ring-1 focus:ring-[#00F3FF] rounded-lg p-2.5 text-white font-mono text-xs outline-none transition-all"
                            />
                          </div>
                        </div>

                        {/* Row 3: Branch & Year */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-2 border-t border-white/10 text-xs font-mono">
                          <div>
                            <label className="text-[#00F3FF] uppercase tracking-wider block text-[11px] mb-1 font-semibold">
                              Branch
                            </label>
                            <input
                              type="text"
                              value={member.branch || ''}
                              onChange={(e) => handleUpdateMemberField(idx, 'branch', e.target.value)}
                              placeholder="e.g. CSE / AIML / ISE / ECE"
                              className="w-full bg-black/50 border border-[#00F3FF]/40 focus:border-[#00F3FF] focus:ring-1 focus:ring-[#00F3FF] rounded-lg p-2.5 text-white font-mono text-xs outline-none transition-all"
                            />
                          </div>
                          <div>
                            <label className="text-[#00F3FF] uppercase tracking-wider block text-[11px] mb-1 font-semibold">
                              Year
                            </label>
                            <select
                              value={member.year || ''}
                              onChange={(e) => handleUpdateMemberField(idx, 'year', e.target.value)}
                              className="w-full bg-black/50 border border-[#00F3FF]/40 focus:border-[#00F3FF] focus:ring-1 focus:ring-[#00F3FF] rounded-lg p-2.5 text-white font-mono text-xs outline-none transition-all cursor-pointer"
                            >
                              <option value="" className="bg-[#0b0f19] text-gray-400">Select Year</option>
                              <option value="1st Year" className="bg-[#0b0f19] text-white">1st Year</option>
                              <option value="2nd Year" className="bg-[#0b0f19] text-white">2nd Year</option>
                              <option value="3rd Year" className="bg-[#0b0f19] text-white">3rd Year</option>
                              <option value="4th Year" className="bg-[#0b0f19] text-white">4th Year</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* VIEW MODE: CLEAN STYLED PRESENTATION */
                      <>
                        <div className="text-xs sm:text-sm text-gray-300 font-mono space-y-1 mb-3 sm:mb-4">
                          {member.email && <div className="break-all">{member.email}</div>}
                          {member.phone && <div>{member.phone}</div>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 pt-3 border-t border-white/5 text-xs font-mono">
                          <div>
                            <span className="text-gray-500 uppercase tracking-wider block text-[10px] sm:text-[11px] mb-0.5">
                              College
                            </span>
                            <span className="text-gray-200 font-medium break-words">
                              {member.college || '—'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 uppercase tracking-wider block text-[10px] sm:text-[11px] mb-0.5">
                              Branch
                            </span>
                            <span className={member.branch ? "text-gray-200 font-medium break-words" : "text-gray-500"}>
                              {member.branch ? member.branch : '—'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 uppercase tracking-wider block text-[10px] sm:text-[11px] mb-0.5">
                              Year
                            </span>
                            <span className={member.year ? "text-gray-200 font-medium" : "text-gray-500"}>
                              {member.year ? member.year : '—'}
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Bottom Action Bar in Edit Mode */}
              {isEditing && (
                <div className="flex flex-col-reverse sm:flex-row justify-end items-stretch sm:items-center gap-2.5 sm:gap-3 mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-[#1e293b]">
                  <button
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-mono transition-all cursor-pointer disabled:opacity-50 text-center"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#00F3FF] to-[#BC13FE] hover:opacity-90 text-white text-xs font-mono font-bold transition-all shadow-[0_0_20px_rgba(0,243,255,0.3)] cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    {isSaving ? 'Saving Changes...' : 'Save All Changes'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}
