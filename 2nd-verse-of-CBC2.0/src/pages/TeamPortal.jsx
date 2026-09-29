import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Eye, Users } from 'lucide-react';
import { ref, get, set, increment, serverTimestamp } from 'firebase/database';
import { rtdb } from '../firebase';
import CustomCursor from '../components/CustomCursor';
import NavigationBar from '../components/NavigationBar';
import Footer from '../components/Footer';
import TeamVerificationSection from '../components/TeamVerificationSection';
import NeuralBackground from '../components/NeuralBackground';

export default function TeamPortal() {
  const { isLoaded, isSignedIn, signOut } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fallbackEmail = localStorage.getItem('verifiedEmail');
  const isAuthenticated = isSignedIn || !!fallbackEmail;

  useEffect(() => {
    if (isLoaded && !isAuthenticated) {
      navigate('/');
    }
  }, [isLoaded, isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchTeam = async () => {
        try {
          const userEmail = (isSignedIn && user?.primaryEmailAddress?.emailAddress) ? user.primaryEmailAddress.emailAddress : fallbackEmail;
          if (!userEmail) return;
          const emailHash = userEmail.toLowerCase().trim().replace(/[.#$\[\]\/]/g, '_');
          const teamRef = ref(rtdb, `registeredTeams/${emailHash}`);
          const snapshot = await get(teamRef);
          
          if (snapshot.exists()) {
            const data = snapshot.val();
            setTeamData(data);
            
            const viewRef = ref(rtdb, `teamViews/${emailHash}`);
            await set(viewRef, {
              teamName: data['Team Name'] || data['TeamName'] || 'Unknown Team',
              email: userEmail,
              views: increment(1),
              lastViewed: serverTimestamp()
            });
          } else {
            setError(`No registered team found for "${userEmail}". Please ensure you sign in with the email address used during team registration.`);
          }
        } catch (err) {
          console.error(err);
          setError('Failed to load team data. Please try again.');
        } finally {
          setLoading(false);
        }
      };
      fetchTeam();
    } else if (!isAuthenticated) {
      setLoading(false);
    }
  }, [isLoaded, isAuthenticated, isSignedIn, user, fallbackEmail]);

  const handleLogout = async () => {
    localStorage.removeItem('verifiedEmail');
    try { await signOut(); } catch(e) {}
    setTeamData(null);
    setError('');
    navigate('/');
  };

  if (!isLoaded && !fallbackEmail) {
    return (
      <div className="w-full min-h-screen bg-[#F4F6F9] dark:bg-[#010103] flex justify-center items-center">
        <div className="text-[#00F3FF] animate-pulse font-bold tracking-widest uppercase">Initializing Secure Portal...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
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

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#F4F6F9] dark:bg-[#010103] flex justify-center items-center">
        <div className="text-[#00F3FF] animate-pulse font-bold tracking-widest uppercase">Loading Team Details...</div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F4F6F9] dark:bg-[#010103] text-gray-900 dark:text-[#F0F0F0] selection:bg-[#00F3FF]/30 selection:text-black dark:selection:text-white relative transition-colors duration-300 flex flex-col">
      <NeuralBackground />
      <CustomCursor />
      <NavigationBar />
      
      <div className="flex-1 container mx-auto px-6 py-32 max-w-6xl relative z-10 flex flex-col">
        <div className="mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-4xl md:text-5xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-[#00F3FF] to-[#BC13FE]">
                TEAM DASHBOARD
              </h2>
              <h3 className="text-xl font-bold flex items-center gap-2 text-gray-400">
                <Users className="text-[#00F3FF]" size={20} /> 
                {teamData ? (teamData['Team Name'] || teamData['TeamName'] || 'Your Team') : 'Your Team'}
              </h3>
            </div>
            <button 
              onClick={handleLogout} 
              className="flex items-center gap-2 text-red-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider bg-red-500/10 hover:bg-red-500/30 px-6 py-3 rounded-lg border border-red-500/20 cursor-pointer"
            >
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </div>
        
        {error ? (
          <div className="text-red-400 text-center py-12 bg-red-500/10 rounded-2xl border border-red-500/20 flex flex-col items-center gap-4">
            <p className="text-base">{error}</p>
            <button 
              onClick={handleLogout}
              className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-white rounded-lg border border-red-500/30 text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Sign In With Different Email
            </button>
          </div>
        ) : teamData ? (
          <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,243,255,0.05)] overflow-hidden flex-1">
            <div className="p-8 border-b border-white/10 bg-black/40">
              <h4 className="text-xl font-bold flex items-center gap-3 dark:text-white text-black tracking-wide uppercase">
                <Eye size={24} className="text-[#00F3FF]" /> Official Registration Data
              </h4>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(teamData).map(([key, value]) => {
                if(key.startsWith('_')) return null;
                
                const isLink = typeof value === 'string' && value.startsWith('http');

                return (
                  <div key={key} className="bg-black/30 p-5 rounded-2xl border border-white/5 hover:border-[#00F3FF]/40 hover:shadow-[0_0_20px_rgba(0,243,255,0.1)] transition-all group">
                    <p className="text-xs font-bold text-[#BC13FE] group-hover:text-[#00F3FF] uppercase tracking-wider mb-2 transition-colors">{key}</p>
                    {isLink ? (
                      <a href={value} target="_blank" rel="noreferrer" className="text-sm text-[#00F3FF] hover:underline break-words block truncate">
                        View Attachment
                      </a>
                    ) : (
                      <p className="text-sm dark:text-gray-200 text-gray-800 break-words font-medium">{value?.toString() || 'N/A'}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
      
      <Footer />
    </div>
  );
}
