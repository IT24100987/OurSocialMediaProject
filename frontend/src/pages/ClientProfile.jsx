import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  MdArrowBack,
  MdMail,
  MdPhone,
  MdBusiness,
  MdLoyalty,
  MdAssignment,
  MdAttachMoney,
  MdFeedback
} from 'react-icons/md';

const ClientProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    
    // Client specific data
    const [client, setClient] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [payments, setPayments] = useState([]);
    const [feedbacks, setFeedbacks] = useState([]);

    useEffect(() => {
        const fetchClientData = async () => {
            try {
                // Fetch the client details
                const clientRes = await api.get(`/clients/${id}`);
                setClient(clientRes.data);

                // For a real app with 1,000s of records, you'd add ?clientId=id to these endpoints.
                // For this project, we'll fetch all and filter client side for speed of development.
                const [taskRes, payRes, fbRes] = await Promise.all([
                   api.get('/tasks'),
                   api.get('/payments'), // 💡 Reminder: Assuming you have a standard GET /api/payments in your backend
                   api.get('/feedback')
                ]);

                setTasks(taskRes.data.filter(t => t.clientId?._id === id || t.clientId === id));
                // Assuming payment object has clientId or client._id attached
                setPayments(payRes.data.filter(p => p.clientId?._id === id || p.clientId === id)); 
                setFeedbacks(fbRes.data.filter(f => f.clientId?._id === id || f.clientId === id));

            } catch (err) {
                console.error(err);
                alert('Client not found or error loading data.');
                navigate('/clients');
            } finally {
                setLoading(false);
            }
        };

        fetchClientData();
    }, [id, navigate]);

    if(loading) return <LoadingSpinner />;
    if(!client) return null;

    return (
        <div className="p-4 md:p-8">
            
            {/* Header & Back Nav */}
            <div className="mb-6 flex items-center space-x-4">
                <button 
                   onClick={() => navigate('/clients')}
                   className="p-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-full transition-colors"
                >
                   <MdArrowBack size={24} />
                </button>
                <div>
                   <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{client.name}'s Profile</h1>
                   <p className="text-slate-500 mt-1">Detailed view of client activity and history.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT COL: Core Info */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Identity Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col items-center text-center">
                        <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-black text-4xl mb-4">
                            {client.name.charAt(0)}
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800">{client.name}</h2>
                        
                        <div className={`mt-3 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-slate-200 shadow-sm flex items-center mb-6
                            ${client.package === 'Silver' ? 'bg-slate-50 text-slate-600' :
                              client.package === 'Gold' ? 'bg-yellow-50 text-yellow-600' :
                              client.package === 'Platinum' ? 'bg-indigo-50 text-indigo-600' : 'bg-cyan-50 text-cyan-600'
                            }`
                        }>
                            <MdLoyalty className="mr-2" size={16} /> {client.package} Plan
                        </div>

                        <div className="w-full space-y-4 pt-4 border-t border-slate-100 text-left text-sm font-medium">
                            <div className="flex items-center text-slate-600">
                                <MdMail className="w-5 h-5 mr-3 text-slate-400" /> {client.email}
                            </div>
                            <div className="flex items-center text-slate-600">
                                <MdPhone className="w-5 h-5 mr-3 text-slate-400" /> {client.phone || 'No phone recorded'}
                            </div>
                            <div className="flex items-center text-slate-600">
                                <MdBusiness className="w-5 h-5 mr-3 text-slate-400" /> {client.company || 'No company listed'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COL: Activity & Data */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* STAT TABS */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 text-center flex flex-col items-center">
                            <MdAssignment size={28} className="text-slate-400 mb-2" />
                            <div className="text-2xl font-black text-slate-700">{tasks.length}</div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Total Tasks</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 text-center flex flex-col items-center">
                            <MdFeedback size={28} className="text-indigo-400 mb-2" />
                            <div className="text-2xl font-black text-slate-700">{feedbacks.length}</div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Feedback Left</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 text-center flex flex-col items-center">
                            <MdAttachMoney size={28} className="text-emerald-400 mb-2" />
                            <div className="text-2xl font-black text-slate-700">{payments.length}</div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Payments Made</div>
                        </div>
                    </div>

                    {/* ASSIGNED TASKS */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center border-b border-slate-100 pb-2">
                           Client Tasks
                        </h3>
                        {tasks.length === 0 ? <p className="text-slate-400 italic">No tasks associated with this client.</p> : (
                            <ul className="space-y-4">
                                {tasks.map(t => (
                                    <li key={t._id} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                                        <div>
                                            <div className="font-bold text-slate-700">{t.title}</div>
                                            <div className="text-xs text-slate-500 mt-1">Assigned to: {t.assignedTo?.name || 'Unassigned'}</div>
                                        </div>
                                        <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${
                                           t.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                           t.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-700'
                                        }`}>{t.status}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ClientProfile;
