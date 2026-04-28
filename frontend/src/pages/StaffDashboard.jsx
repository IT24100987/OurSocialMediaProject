import { useState, useEffect } from 'react';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  MdFolderOpen, 
  MdExpandMore,
  MdCheckCircle,
  MdSchedule,
  MdUpdate
} from 'react-icons/md';

const StaffDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      // Fetch only tasks assigned to the logged-in staff member
      const { data } = await api.get('/tasks/my');
      setTasks(data);
    } catch (error) {
       console.error(error);
    } finally {
       setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
     try {
         await api.put(`/tasks/${taskId}`, { status: newStatus });
         // Re-fetch to update UI
         fetchTasks();
     } catch(err) {
         console.error('Failed to update task:', err);
         alert('Error updating task status.');
     }
  };

  const openDriveLink = (link) => {
      if(link) window.open(link, '_blank');
      else alert('No Google Drive link provided for this task.');
  };

  const filteredTasks = tasks.filter(t => filter === 'All' ? true : t.status === filter);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-4 md:p-8">
      
      <div className="mb-8 flex justify-between items-end">
        <div>
           <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Staff Dashboard</h1>
           <p className="text-slate-500 mt-1">Manage your assigments and update statuses.</p>
        </div>
        
        {/* Status Filter Tabs */}
        <div className="flex space-x-1 bg-slate-200 p-1 rounded-lg">
           {['All', 'Pending', 'In Progress', 'Completed'].map(tab => (
              <button 
                 key={tab}
                 onClick={() => setFilter(tab)}
                 className={`px-4 py-2 rounded shadow-sm text-sm font-bold transition-colors ${filter === tab ? 'bg-white text-blue-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-300'}`}
              >
                 {tab}
              </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {filteredTasks.length === 0 ? (
            <div className="col-span-full py-20 text-center">
               <MdFolderOpen className="mx-auto text-slate-300 mb-4" size={64} />
               <h3 className="text-xl font-bold text-slate-400">No tasks found</h3>
               <p className="text-slate-500 mt-2">You don't have any {filter.toLowerCase()} tasks right now.</p>
            </div>
         ) : (
            filteredTasks.map(task => (
                <div key={task._id} className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden">
                   
                   {/* Card Top Block */}
                   <div className="p-6 pb-4">
                      <div className="flex justify-between items-start mb-4">
                         
                         {/* Priority Badge */}
                         <span className={`px-2 py-1 text-xs font-bold uppercase tracking-widest rounded text-white ${
                             task.priority === 'High' ? 'bg-red-500' :
                             task.priority === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                         }`}>
                             {task.priority || 'Medium'} Priority
                         </span>

                         {/* Status Icon */}
                         {task.status === 'Completed' ? <MdCheckCircle className="text-green-500" size={24}/> :
                          task.status === 'In Progress' ? <MdUpdate className="text-blue-500" size={24} /> :
                          <MdSchedule className="text-slate-400" size={24} />
                         }
                      </div>

                      <h3 className="text-xl font-bold text-slate-800 line-clamp-2">{task.title}</h3>
                      <p className="text-slate-500 text-sm mt-2 line-clamp-3">{task.description || 'No description provided.'}</p>
                   </div>
                   
                   {/* Card Bottom Block */}
                   <div className="bg-slate-50 border-t border-slate-100 p-4 space-y-4">
                      <div className="flex justify-between text-sm">
                         <div>
                            <span className="text-slate-400 block text-xs uppercase font-bold tracking-wider">Client</span>
                            <span className="font-semibold text-slate-700">{task.clientId?.name || 'Internal Task'}</span>
                         </div>
                         <div className="text-right">
                            <span className="text-slate-400 block text-xs uppercase font-bold tracking-wider">Due Date</span>
                            <span className="font-semibold text-slate-700">{new Date(task.dueDate).toLocaleDateString()}</span>
                         </div>
                      </div>
                      
                      {/* Action Dropdown & Drive Link */}
                      <div className="flex space-x-2 pt-2 border-t border-slate-200">
                         <div className="relative flex-1 group">
                             <select 
                                value={task.status}
                                onChange={(e) => updateTaskStatus(task._id, e.target.value)}
                                className={`w-full appearance-none rounded border px-3 py-2 cursor-pointer font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                   task.status === 'Pending' ? 'bg-white text-slate-600 border-slate-300' :
                                   task.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                   'bg-green-50 text-green-700 border-green-200'
                                }`}
                             >
                                <option value="Pending">Set Pending</option>
                                <option value="In Progress">Set In Progress</option>
                                <option value="Completed">Set Completed</option>
                             </select>
                             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                <MdExpandMore />
                             </div>
                         </div>

                         <button 
                            onClick={() => openDriveLink(task.googleDriveLink)}
                            disabled={!task.googleDriveLink}
                            className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border border-emerald-200 px-4 rounded font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                         >
                            Drive
                         </button>
                      </div>
                   </div>

                </div>
            ))
         )}
      </div>

    </div>
  );
};

export default StaffDashboard;
