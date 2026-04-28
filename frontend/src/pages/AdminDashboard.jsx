import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  MdPeopleOutline, 
  MdBusinessCenter, 
  MdAttachMoney, 
  MdPendingActions,
  MdAdd,
  MdAutoAwesome
} from 'react-icons/md';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    clients: 0,
    revenue: 0,
    pendingPayments: 0
  });
  const [recentFeedback, setRecentFeedback] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [aiSummary, setAiSummary] = useState('');
  const [generatingSummary, setGeneratingSummary] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // 💡 Beginner Note: We use Promise.all to fetch everything at once rather than waiting for one after another.
      const [usersRes, clientsRes, paymentsRes, feedbackRes, tasksRes] = await Promise.all([
        api.get('/users'),
        api.get('/clients'),
        api.get('/payments/stats'),
        api.get('/feedback'),
        api.get('/tasks')
      ]);

      setStats({
        users: usersRes.data.length,
        clients: clientsRes.data.length,
        revenue: paymentsRes.data.totalRevenue,
        pendingPayments: paymentsRes.data.pendingCount
      });

      // Sort recent 5 items
      setRecentFeedback(feedbackRes.data.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5));
      setRecentTasks(tasksRes.data.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5));
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateAISummary = async () => {
    setGeneratingSummary(true);
    try {
      const summaryData = {
        totalFeedback: recentFeedback.length,
        averageSentiment: recentFeedback.filter(f => f.sentiment === 'positive').length > 2 ? 'Mostly Positive' : 'Mixed'
      };
      const { data } = await api.post('/ai/monthly-summary', { data: summaryData });
      setAiSummary(data.summary);
    } catch (err) {
       console.error(err);
    } finally {
       setGeneratingSummary(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-4 md:p-6 w-full max-w-full">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-6 space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight">System Overview</h1>
          <p className="text-slate-500 mt-1">Welcome back. Here's what's happening with your CMS today.</p>
        </div>
        
        {/* Quick Actions Array */}
        <div className="flex flex-wrap gap-2">
          <button onClick={() => navigate('/users')} className="bg-white border border-slate-200 text-slate-600 px-3 py-2 flex items-center justify-center space-x-2 rounded-lg hover:bg-slate-50 hover:text-blue-600 transition-all duration-200 shadow-sm font-medium text-sm">
             <MdAdd size={18} /> <span className="hidden sm:inline">Add User</span>
          </button>
          <button onClick={() => navigate('/clients')} className="bg-white border border-slate-200 text-slate-600 px-3 py-2 flex items-center justify-center space-x-2 rounded-lg hover:bg-slate-50 hover:text-indigo-600 transition-all duration-200 shadow-sm font-medium text-sm">
             <MdAdd size={18} /> <span className="hidden sm:inline">Add Client</span>
          </button>
          <button onClick={() => navigate('/payments')} className="bg-blue-600 text-white px-3 py-2 flex items-center justify-center space-x-2 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md font-medium text-sm">
             <MdAttachMoney size={18} /> <span className="hidden sm:inline">Record Payment</span>
          </button>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Users" value={stats.users} icon={MdPeopleOutline} colorClass="bg-blue-500" />
        <StatCard title="Total Clients" value={stats.clients} icon={MdBusinessCenter} colorClass="bg-indigo-500" />
        <StatCard title="Total Revenue" value={`$${stats.revenue.toLocaleString()}`} icon={MdAttachMoney} colorClass="bg-emerald-500" />
        <StatCard title="Pending Payments" value={stats.pendingPayments} icon={MdPendingActions} colorClass="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6">
         {/* RECENT FEEDBACK */}
         <div className="bg-white p-4 lg:p-5 rounded-xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Recent Client Feedback</h2>
            <div className="overflow-x-auto">
               <table className="w-full text-sm text-left text-slate-600">
                 <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                   <tr>
                     <th className="px-3 py-2 rounded-tl-lg rounded-bl-lg">Client</th>
                     <th className="px-3 py-2 hidden sm:table-cell">Rating</th>
                     <th className="px-3 py-2 rounded-tr-lg rounded-br-lg">Sentiment</th>
                   </tr>
                 </thead>
                 <tbody>
                   {recentFeedback.map(fb => (
                     <tr key={fb._id} className="border-b last:border-0 border-slate-100 hover:bg-slate-50 transition-colors">
                       <td className="px-3 py-3 font-medium text-sm">{fb.clientId?.name || 'Unknown'}</td>
                       <td className="px-3 py-3 hidden sm:table-cell">{fb.rating}/5</td>
                       <td className="px-3 py-3">
                          <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                             fb.sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                             fb.sentiment === 'negative' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {fb.sentiment}
                          </span>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>
         </div>

         {/* RECENT TASKS */}
         <div className="bg-white p-4 lg:p-5 rounded-xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Recent Tasks</h2>
            <div className="overflow-x-auto">
               <table className="w-full text-sm text-left text-slate-600">
                 <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                   <tr>
                     <th className="px-3 py-2 rounded-tl-lg rounded-bl-lg">Task</th>
                     <th className="px-3 py-2 hidden sm:table-cell">Assigned To</th>
                     <th className="px-3 py-2 rounded-tr-lg rounded-br-lg">Status</th>
                   </tr>
                 </thead>
                 <tbody>
                   {recentTasks.map(task => (
                     <tr key={task._id} className="border-b last:border-0 border-slate-100 hover:bg-slate-50 transition-colors">
                       <td className="px-3 py-3 font-medium text-sm">{task.title}</td>
                       <td className="px-3 py-3 hidden sm:table-cell">{task.assignedTo?.name || 'Unassigned'}</td>
                       <td className="px-3 py-3">
                          <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                             task.status === 'completed' ? 'bg-green-100 text-green-700' :
                             task.status === 'in-progress' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {task.status}
                          </span>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>
         </div>
      </div>

      {/* AI MONTHLY SUMMARY */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 md:p-6 rounded-xl border border-indigo-100 shadow-sm relative overflow-hidden">
        <div className="absolute -right-10 -top-10 opacity-10">
           <MdAutoAwesome className="text-blue-900" size={120} />
        </div>
        <h2 className="text-lg md:text-xl font-bold text-slate-800 mb-4 flex items-center">
           <MdAutoAwesome className="text-indigo-500 mr-2" />
           AI Monthly Satisfaction Digest
        </h2>
        
        {aiSummary ? (
            <p className="text-slate-700 leading-relaxed text-sm md:text-base relative z-10 bg-white p-4 rounded-lg shadow-sm">{aiSummary}</p>
        ) : (
            <button 
              onClick={generateAISummary}
              disabled={generatingSummary}
              className="mt-2 bg-indigo-600 text-white px-4 md:px-5 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 text-sm md:text-base"
            >
              {generatingSummary ? 'Thinking...' : 'Generate AI Summary Now'}
            </button>
        )}
      </div>

    </div>
  );
};

export default AdminDashboard;
