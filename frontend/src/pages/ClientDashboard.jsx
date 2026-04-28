import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import StarRating from '../components/StarRating';
import { 
  MdLoyalty, 
  MdAddReaction, 
  MdRateReview,
  MdBarChart,
  MdHistory,
} from 'react-icons/md';

const ClientDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [myFeedback, setMyFeedback] = useState([]);
  const [myAnalytics, setMyAnalytics] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 1. Fetch own client profile through special logic
      // Because we don't know the exact clientId yet, we have to fetch the list and find ourselves
      // Usually you'd make a special `/api/clients/my` route on the backend, but this works for simple apps.
      const clientsRes = await api.get('/clients');
      const myProfileData = clientsRes.data.find(c => c.userId?._id === user._id || c.email === user.email);
      setProfile(myProfileData);

      // 2. Fetch specific feedback (we already made an endpoint for this!)
      const feedbackRes = await api.get('/feedback/my');
      setMyFeedback(feedbackRes.data.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5));

      // 3. Fetch specific analytics if we found our profile ID
      if (myProfileData?._id) {
         const analyticsRes = await api.get(`/analytics/client/${myProfileData._id}`);
         setMyAnalytics(analyticsRes.data);
      }

    } catch (err) {
       console.error("Dashboard fetch error:", err);
    } finally {
       setLoading(false);
    }
  };

  // Summarize the array of analytics into one card-friendly object
  const getAnalyticsSummary = () => {
      let reach=0, engage=0, impress=0;
      myAnalytics.forEach(row => {
          reach += row.reach;
          engage += row.engagement;
          impress += row.impressions;
      });
      return { reach, engage, impress };
  };

  const aSummary = getAnalyticsSummary();

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-4 md:p-8">
      
      {/* Dynamic Welcome Plate */}
      <div className="bg-gradient-to-tr from-slate-900 to-slate-800 text-white rounded-3xl p-8 mb-10 shadow-xl relative overflow-hidden">
         <div className="relative z-10 flex justify-between items-center">
             <div>
                <h1 className="text-4xl font-extrabold tracking-tight mb-2">Hello, {profile?.name || user.name}</h1>
                <p className="text-slate-300 font-medium">{profile?.company ? `Representing ${profile.company}` : 'Welcome to your portal.'}</p>
             </div>
             
             {/* Package Badge */}
             {profile?.package && (
                <div className="bg-white/10 backdrop-blur-sm px-6 py-4 rounded-2xl flex items-center space-x-3 border border-white/20">
                    <MdLoyalty size={32} className={`
                       ${profile.package === 'Silver' ? 'text-slate-300' :
                         profile.package === 'Gold' ? 'text-yellow-400' :
                         profile.package === 'Platinum' ? 'text-indigo-400' : 'text-cyan-400'
                       }
                    `} />
                    <div>
                        <div className="text-xs uppercase font-bold tracking-widest text-white/50">Current Plan</div>
                        <div className="text-xl font-black">{profile.package}</div>
                    </div>
                </div>
             )}
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
         
         {/* LEFT COL: Quick Actions & Engagement Summary */}
         <div className="space-y-8">
             
             <button 
                 onClick={() => navigate('/feedback/new')}
                 className="w-full bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-2xl shadow-md border border-blue-500 group transition-all transform hover:-translate-y-1 flex justify-between items-center"
             >
                 <div className="text-left flex items-center space-x-4">
                     <div className="bg-white/20 p-4 rounded-xl">
                         <MdAddReaction size={32} />
                     </div>
                     <div>
                         <h3 className="text-2xl font-bold">Leave Feedback</h3>
                         <p className="text-blue-200">Submit a review for a recent campaign</p>
                     </div>
                 </div>
                 <div className="bg-white/20 px-6 py-3 rounded-xl font-bold group-hover:bg-white group-hover:text-blue-700 transition-colors">
                     Submit Now
                 </div>
             </button>

             {/* Total Campaign Reach Widget */}
             <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
                 <div className="flex items-center space-x-4">
                     <div className="p-4 bg-emerald-100 text-emerald-600 rounded-2xl">
                         <MdBarChart size={40} />
                     </div>
                     <div>
                         <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Total Campaign Reach</p>
                         <h3 className="text-4xl font-black text-slate-800 tracking-tighter mt-1">{aSummary.reach.toLocaleString()}</h3>
                     </div>
                 </div>
                 <button 
                    onClick={() => navigate('/analytics')}
                    className="text-emerald-600 font-bold hover:underline px-4"
                 >
                    View All Metrics &rarr;
                 </button>
             </div>
         </div>

         {/* RIGHT COL: Recent Feedback List */}
         <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
             <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-bold text-slate-800 flex items-center">
                    <MdHistory className="text-slate-400 mr-2" />
                    My Recent Feedback
                 </h2>
                 <button onClick={() => navigate('/feedback')} className="text-blue-600 font-medium text-sm hover:underline">See All</button>
             </div>
             
             <div className="flex-1 space-y-4 overflow-y-auto">
                 {myFeedback.length === 0 ? (
                     <div className="text-center py-10 text-slate-400">
                         <MdRateReview className="mx-auto mb-2 opacity-50" size={48} />
                         <p>You haven't submitted any feedback yet.</p>
                     </div>
                 ) : (
                     myFeedback.map(fb => (
                         <div key={fb._id} className="bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-slate-300 transition-colors">
                             <div className="flex justify-between items-start mb-2">
                                 <div className="font-bold text-slate-700">{fb.campaignName}</div>
                                 <span className={`px-2 py-1 text-xs font-bold uppercase tracking-widest rounded ${
                                     fb.sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                                     fb.sentiment === 'negative' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                 }`}>
                                     {fb.sentiment}
                                 </span>
                             </div>
                             
                             {/* Show tiny static stars */}
                             <div className="flex space-x-1 mb-3">
                                 {[1,2,3,4,5].map(s => (
                                     <svg key={s} className={`w-4 h-4 ${s <= fb.rating ? 'text-yellow-400' : 'text-slate-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                         <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                     </svg>
                                 ))}
                             </div>

                             <p className="text-slate-600 text-sm line-clamp-2 italic">"{fb.comment}"</p>
                         </div>
                     ))
                 )}
             </div>
         </div>

      </div>

    </div>
  );
};

export default ClientDashboard;
