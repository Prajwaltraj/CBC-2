import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { ref, get, set, increment, serverTimestamp } from 'firebase/database';
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

  const verifiedEmail = typeof window !== 'undefined' ? localStorage.getItem('verifiedEmail') : null;

  useEffect(() => {
    if (verifiedEmail) {
      const fetchTeam = async () => {
        try {
          // Check if we have cached team in localStorage first
          const cached = localStorage.getItem('verifiedTeam');
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
            localStorage.setItem('verifiedTeam', JSON.stringify(data));
            
            const viewRef = ref(rtdb, `teamViews/${emailHash}`);
            await set(viewRef, {
              teamName: data['Team Name:'] || data['Team Name'] || data['TeamName'] || data["Team Leader's Name:"] || 'Unknown Team',
              email: verifiedEmail,
              views: increment(1),
              lastViewed: serverTimestamp()
            });
          } else if (!cached) {
            setError(`No registered team found for "${verifiedEmail}". Please verify using the email address submitted during team registration.`);
          }
        } catch (err) {
          console.error(err);
          if (!teamData) {
            setError('Failed to load team data. Please try again.');
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
    localStorage.removeItem('verifiedEmail');
    localStorage.removeItem('verifiedTeam');
    setTeamData(null);
    setError('');
    navigate('/');
  };

  const parsedTeam = useMemo(() => {
    if (!teamData) return null;

    const teamName = teamData['Team Name:'] || teamData['Team Name'] || teamData['TeamName'] || teamData["Team Leader's Name:"] || 'Your Team';
    const domain = teamData['Domain:'] || teamData['Domain'] || teamData['Selected Domain:'] || teamData['Domain Name:'] || teamData['Problem Domain:'] || '—';
    const defaultCollege = teamData['College Name:'] || teamData['College Name'] || teamData['College'] || '';

    const members = [];

    // Leader (Member 1)
    const leaderName = teamData["Team Leader's Name:"] || teamData["Team Leader Name"] || teamData["Leader Name"] || teamData["Name:"];
    const leaderEmail = teamData["Email ID:"] || teamData["Email Address"] || teamData["Leader Email"] || teamData["Email"];
    const leaderPhone = teamData["WhatsApp Number:"] || teamData["Phone Number:"] || teamData["Leader Phone"] || teamData["Phone"];
    const leaderCollege = teamData["College Name:"] || teamData["College Name"] || defaultCollege;
    const leaderBranch = teamData["Branch:"] || teamData["Branch"] || teamData["Leader Branch:"] || teamData["Leader Branch"] || teamData["Team Leader Branch:"] || '';
    const leaderYear = teamData["Year:"] || teamData["Year"] || teamData["Leader Year:"] || teamData["Leader Year"] || teamData["Team Leader Year:"] || '';

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
      const mName = teamData[`Team Member ${i} Name:`] || teamData[`Team Member ${i} Name`] || teamData[`Member ${i} Name`];
      const mEmail = teamData[`Team Member ${i} Email ID:`] || teamData[`Team Members ${i} Email ID:`] || teamData[`Team Member ${i} Email`] || teamData[`Member ${i} Email`];
      const mPhone = teamData[`Team Member ${i} WhatsApp Number:`] || teamData[`Team Member ${i} Phone`] || teamData[`Member ${i} Phone`];
      const mCollege = teamData[`Team Member ${i} College Name:`] || teamData[`Team Member ${i} College`] || defaultCollege;
      const mBranch = teamData[`Team Member ${i} Branch:`] || teamData[`Team Member ${i} Branch`] || teamData[`Member ${i} Branch:`] || teamData[`Member ${i} Branch`] || '';
      const mYear = teamData[`Team Member ${i} Year:`] || teamData[`Team Member ${i} Year`] || teamData[`Member ${i} Year:`] || teamData[`Member ${i} Year`] || '';

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

  if (!verifiedEmail) {
    return (
      <div className="w-full min-h-screen bg-[#F4F6F9] dark:bg-[#010103] text-gray-900 dark:text-[#F0F0F0] selection:bg-[#00F3FF]/30 selection:text-black dark:selection:text-white relative transition-colors duration-300 flex flex-col">
        <NeuralBackground />
        <CustomCursor />
        <NavigationBar />
        <div className="flex-1 pt-24 pb-12 flex flex-col justify-center items-center">
          <TeamVerificationSection />
        </div>
        <Footer />
      </div>
    );
  }

  if (loading && !teamData) {
    return (
      <div className="w-full min-h-screen bg-[#F4F6F9] dark:bg-[#010103] flex justify-center items-center">
        <div className="text-[#00F3FF] animate-pulse font-bold tracking-widest uppercase font-mono">Loading Team Details...</div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#07090e] text-[#F0F0F0] selection:bg-[#00F3FF]/30 selection:text-white relative flex flex-col font-sans">
      <NeuralBackground />
      <CustomCursor />
      <NavigationBar />
      
      <div className="flex-1 container mx-auto px-4 sm:px-6 py-28 max-w-4xl relative z-10 flex flex-col justify-center">
        {/* Header with sign out */}
        <div className="flex justify-between items-center mb-6">
          <span className="text-xs font-mono font-bold tracking-widest text-[#00F3FF] uppercase">
            Team Details
          </span>
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-2 text-red-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider bg-red-500/10 hover:bg-red-500/30 px-4 py-2 rounded-lg border border-red-500/20 cursor-pointer font-mono"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
        
        {error ? (
          <div className="text-red-400 text-center py-12 bg-red-500/10 rounded-2xl border border-red-500/20 flex flex-col items-center gap-4 font-mono">
            <p className="text-base">{error}</p>
            <button 
              onClick={handleLogout}
              className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-white rounded-lg border border-red-500/30 text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Verify With Different Email
            </button>
          </div>
        ) : parsedTeam ? (
          <div className="bg-[#0b0f19] border border-[#1e293b] rounded-2xl p-6 sm:p-8 shadow-2xl">
            {/* Top Bar: Team Name & Members Count */}
            <div className="flex justify-between items-start pb-6 border-b border-[#1e293b]">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
                  {parsedTeam.teamName}
                </h2>
              </div>
              <span className="px-3 py-1 bg-[#0284c7]/20 text-[#38bdf8] border border-[#0284c7]/40 rounded-full text-xs font-semibold font-mono whitespace-nowrap">
                {parsedTeam.members.length} {parsedTeam.members.length === 1 ? 'Member' : 'Members'}
              </span>
            </div>

            {/* Team Information Section */}
            <div className="py-6 border-b border-[#1e293b]">
              <h3 className="text-lg font-bold text-white mb-4 tracking-wide">
                Team Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-gray-400 uppercase tracking-wider font-mono block mb-1">
                    Domain
                  </span>
                  <span className="text-sm font-semibold text-white">
                    {parsedTeam.domain}
                  </span>
                </div>
              </div>
            </div>

            {/* Team Members Section */}
            <div className="pt-6">
              <h3 className="text-lg font-bold text-white mb-4 tracking-wide">
                Team Members
              </h3>
              
              <div className="space-y-4">
                {parsedTeam.members.map((member, idx) => (
                  <div 
                    key={idx}
                    className="bg-[#131b2b]/90 border border-[#1e293b] hover:border-[#38bdf8]/40 transition-colors rounded-xl p-5"
                  >
                    {/* Member Header */}
                    <div className="flex justify-between items-center mb-2.5">
                      <div className="font-bold text-base text-white font-mono tracking-wide">
                        {String(idx + 1).padStart(2, '0')} · {member.name}
                      </div>
                      {member.isLeader && (
                        <span className="px-2.5 py-0.5 bg-[#059669]/20 text-[#34d399] border border-[#059669]/40 rounded-full text-xs font-medium font-mono">
                          Leader
                        </span>
                      )}
                    </div>

                    {/* Member Contact Info */}
                    <div className="text-sm text-gray-300 font-mono space-y-1 mb-4">
                      {member.email && <div>{member.email}</div>}
                      {member.phone && <div>{member.phone}</div>}
                    </div>

                    {/* Member Detailed Fields: College, Branch, Year */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/5 text-xs font-mono">
                      <div>
                        <span className="text-gray-500 uppercase tracking-wider block text-[11px] mb-0.5">
                          College
                        </span>
                        <span className="text-gray-200 font-medium">
                          {member.college || '—'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 uppercase tracking-wider block text-[11px] mb-0.5">
                          Branch
                        </span>
                        <span className="text-gray-400">
                          {member.branch ? member.branch : '—'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 uppercase tracking-wider block text-[11px] mb-0.5">
                          Year
                        </span>
                        <span className="text-gray-400">
                          {member.year ? member.year : '—'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
      
      <Footer />
    </div>
  );
}
