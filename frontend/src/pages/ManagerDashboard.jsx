import { useState, useEffect } from 'react';
import api from '../api/axios';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  MdBusinessCenter, 
  MdAssignment, 
  MdAttachMoney, 
  MdStarRate,
  MdAutoAwesome
} from 'react-icons/md';

const ManagerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeClients: 0,
    openTasks: 0,
    monthRevenue: 0,
    avgRating: 0
  });
  
  const [taskBreakdown, setTaskBreakdown] = useState({ pending: 0, inProgress: 0, completed: 0 });
  const [pkgBreakdown, setPkgBreakdown] = useState({ silver: 0, gold: 0, platinum: 0, diamond: 0 });
  
  const [aiTrends, setAiTrends] = useState('');
  const [generatingTrends, setGeneratingTrends] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsRes, tasksRes, paymentsRes, feedbackRes] = await Promise.all([
          api.get('/clients'),
          api.get('/tasks'),
          api.get('/payments/stats'),
          api.get('/feedback')
        ]);

        const activeC = clientsRes.data.filter(c => c.status === 'active');
        const openT = tasksRes.data.filter(t => t.status !== 'Completed');
        
        // Calculate Rating
        const fbData = feedbackRes.data;
        const avgR = fbData.length > 0 ? (fbData.reduce((acc, curr) => acc + curr.rating, 0) / fbData.length).toFixed(1) : 0;
        
        setStats({
          activeClients: activeC.length,
          openTasks: openT.length,
          monthRevenue: paymentsRes.data.thisMonthRevenue,
          avgRating: avgR
        });

        // Task Breakdown
        let p=0, i=0, c=0;
        tasksRes.data.forEach(t => {
           if(t.status === 'Pending') p++;
           if(t.status === 'In Progress') i++;
           if(t.status === 'Completed') c++;
        });
        setTaskBreakdown({ pending: p, inProgress: i, completed: c });
        
        // Package Breakdown
        let sil=0, gol=0, pla=0, dia=0;
        clientsRes.data.forEach(client => {
           if(client.package === 'Silver') sil++;
           if(client.package === 'Gold') gol++;
           if(client.package === 'Platinum') pla++;
           if(client.package === 'Diamond') dia++;
        });
        setPkgBreakdown({ silver: sil, gold: gol, platinum: pla, diamond: dia });
        
        setFeedbacks(fbData);

      } catch (error) {
         console.error(error);
      } finally {
         setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const generateTrends = async () => {
    if (feedbacks.length === 0) return alert('No feedback available to analyze.');
    setGeneratingTrends(true);
    try {
      // Send array of comments to AI
      const comments = feedbacks.filter(f => f.comment).map(f => f.comment);
      const { data } = await api.post('/ai/trends', { feedbacks: comments });
      setAiTrends(data.trends);
    } catch (err) {
       console.error(err);
    } finally {
       setGeneratingTrends(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-4 md:p-6 w-full max-w-full">
      
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight">Manager Dashboard</h1>
        <p className="text-slate-500 mt-1">Operational view and client health metrics.</p>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Active Clients" value={stats.activeClients} icon={MdBusinessCenter} colorClass="bg-indigo-500" />
        <StatCard title="Open Tasks" value={stats.openTasks} icon={MdAssignment} colorClass="bg-red-500" />
        <StatCard title="This Month Revenue" value={`$${stats.monthRevenue.toLocaleString()}`} icon={MdAttachMoney} colorClass="bg-emerald-500" />
        <StatCard title="Average Rating" value={`${stats.avgRating} / 5`} icon={MdStarRate} colorClass="bg-yellow-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6">
         {/* TASK BREAKDOWN */}
         <div className="bg-white p-4 lg:p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-center">
            <h2 className="text-lg font-bold text-slate-800 mb-4 text-center">Task Status Distribution</h2>
            <div className="flex justify-around items-end h-32">
               {/* Custom Simple Bar Chart */}
               <div className="flex flex-col items-center">
                 <div className="bg-slate-200 w-12 rounded-t-md transition-all duration-1000" style={{ height: `${(taskBreakdown.pending / (taskBreakdown.pending+taskBreakdown.inProgress+taskBreakdown.completed || 1)) * 100}%`, minHeight: '20px' }}></div>
                 <span className="mt-2 text-sm font-bold text-slate-600">{taskBreakdown.pending}</span>
                 <span className="text-xs text-slate-400">Pending</span>
               </div>
               <div className="flex flex-col items-center">
                 <div className="bg-blue-400 w-12 rounded-t-md transition-all duration-1000" style={{ height: `${(taskBreakdown.inProgress / (taskBreakdown.pending+taskBreakdown.inProgress+taskBreakdown.completed || 1)) * 100}%`, minHeight: '20px' }}></div>
                 <span className="mt-2 text-sm font-bold text-blue-600">{taskBreakdown.inProgress}</span>
                 <span className="text-xs text-slate-400">In Progress</span>
               </div>
               <div className="flex flex-col items-center">
                 <div className="bg-green-400 w-12 rounded-t-md transition-all duration-1000" style={{ height: `${(taskBreakdown.completed / (taskBreakdown.pending+taskBreakdown.inProgress+taskBreakdown.completed || 1)) * 100}%`, minHeight: '20px' }}></div>
                 <span className="mt-2 text-sm font-bold text-green-600">{taskBreakdown.completed}</span>
                 <span className="text-xs text-slate-400">Completed</span>
               </div>
            </div>
         </div>

         {/* PACKAGE BREAKDOWN */}
         <div className="bg-white p-4 lg:p-5 rounded-xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Client Packages</h2>
            <div className="space-y-3">
               <div>
                 <div className="flex justify-between text-sm font-semibold mb-1">
                   <span className="text-slate-500">Silver Package</span>
                   <span>{pkgBreakdown.silver}</span>
                 </div>
                 <div className="w-full bg-slate-100 rounded-full h-3">
                   <div className="bg-slate-400 h-3 rounded-full" style={{ width: `${(pkgBreakdown.silver/(stats.activeClients||1))*100}%` }}></div>
                 </div>
               </div>
               <div>
                 <div className="flex justify-between text-sm font-semibold mb-1">
                   <span className="text-yellow-600">Gold Package</span>
                   <span>{pkgBreakdown.gold}</span>
                 </div>
                 <div className="w-full bg-slate-100 rounded-full h-3">
                   <div className="bg-yellow-400 h-3 rounded-full" style={{ width: `${(pkgBreakdown.gold/(stats.activeClients||1))*100}%` }}></div>
                 </div>
               </div>
               <div>
                 <div className="flex justify-between text-sm font-semibold mb-1">
                   <span className="text-indigo-600">Platinum Package</span>
                   <span>{pkgBreakdown.platinum}</span>
                 </div>
                 <div className="w-full bg-slate-100 rounded-full h-3">
                   <div className="bg-indigo-400 h-3 rounded-full" style={{ width: `${(pkgBreakdown.platinum/(stats.activeClients||1))*100}%` }}></div>
                 </div>
               </div>
               <div>
                 <div className="flex justify-between text-sm font-semibold mb-1">
                   <span className="text-cyan-600">Diamond Package</span>
                   <span>{pkgBreakdown.diamond}</span>
                 </div>
                 <div className="w-full bg-slate-100 rounded-full h-3">
                   <div className="bg-cyan-400 h-3 rounded-full" style={{ width: `${(pkgBreakdown.diamond/(stats.activeClients||1))*100}%` }}></div>
                 </div>
               </div>
            </div>
         </div>
      </div>

      {/* AI TREND DETECTION */}
      <div className="bg-white p-8 rounded-xl border-l-4 border-indigo-500 shadow-sm">
        <div className="flex justify-between items-start">
           <div>
             <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center">
                <MdAutoAwesome className="text-indigo-500 mr-2" />
                AI Trend Detection
             </h2>
             <p className="text-sm text-slate-500 mb-4 max-w-2xl">
                Scan all recent client feedback text instantly to figure out the most common complaints or praises across the entire system.
             </p>
           </div>
           
           {!aiTrends && (
               <button 
                 onClick={generateTrends}
                 disabled={generatingTrends}
                 className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-6 py-2.5 rounded-lg font-bold hover:bg-indigo-600 hover:text-white transition-colors disabled:opacity-50"
               >
                 {generatingTrends ? 'Scanning Feedback...' : 'Run Trend Detector'}
               </button>
           )}
        </div>
        
        {aiTrends && (
            <div className="mt-4 bg-indigo-50 p-6 rounded-lg text-indigo-900 border border-indigo-100 prose">
               {/* 💡 Beginner Note: Returning parsed bullet points safely */}
               <ul className="list-disc pl-5 space-y-2 font-medium">
                  {aiTrends.split('\n').filter(t => t.trim() !== '').map((point, idx) => (
                      <li key={idx}>{point.replace(/^-/, '').replace(/^\*/, '').trim()}</li>
                  ))}
               </ul>
            </div>
        )}
      </div>

    </div>
  );
};

export default ManagerDashboard;
