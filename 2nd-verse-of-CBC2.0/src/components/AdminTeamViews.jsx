import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '../firebase';
import { Users, Eye, Clock } from 'lucide-react';

export default function AdminTeamViews() {
  const [views, setViews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const viewsRef = ref(rtdb, 'teamViews');
    
    const unsubscribe = onValue(viewsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const viewsArray = Object.entries(data).map(([hash, info]) => ({
          hash,
          ...info,
          lastViewedAt: info.lastViewed ? new Date(info.lastViewed).toLocaleString() : 'Unknown'
        })).sort((a, b) => (b.lastViewed || 0) - (a.lastViewed || 0));
        
        setViews(viewsArray);
      } else {
        setViews([]);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching team views:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="text-gray-400 p-8 text-center animate-pulse">Loading team view statistics...</div>;
  }

  return (
    <div className="bg-[#14171b] border border-[#242a30] rounded-xl p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-[#00F3FF]/10 rounded-lg text-[#00F3FF]">
          <Eye size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">Team Portal Access Logs</h2>
          <p className="text-sm text-gray-400">Monitor which teams have logged into the verification portal.</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-[#242a30]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#1a1e23] border-b border-[#242a30]">
              <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Team Name</th>
              <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Registered Email</th>
              <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Views</th>
              <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Last Accessed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#242a30]">
            {views.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">
                  No teams have accessed their portal yet.
                </td>
              </tr>
            ) : (
              views.map((view) => (
                <tr key={view.hash} className="hover:bg-[#1a1e23] transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-white font-medium">
                      <Users size={16} className="text-[#8b5cf6]" />
                      {view.teamName}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-300">{view.email}</td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-[#33e0a1]/10 text-[#33e0a1] border border-[#33e0a1]/20 rounded-full text-xs font-bold">
                      {view.views} {view.views === 1 ? 'View' : 'Views'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Clock size={14} />
                      {view.lastViewedAt}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
