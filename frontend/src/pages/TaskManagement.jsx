import { useState, useEffect } from 'react';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import { 
  MdAssignment, 
  MdAdd, 
  MdEdit, 
  MdDelete,
  MdFlag,
  MdDateRange,
  MdBusinessCenter,
  MdSearch,
  MdFilterList,
  MdPerson,
  MdCalendarToday,
  MdTrendingUp,
  MdCheckCircle,
  MdPending,
  MdPlayArrow,
  MdSchedule,
  MdLink,
  MdMoreVert,
  MdVisibility
} from 'react-icons/md';

const TaskManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [staff, setStaff] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');

  // Modal Specifics
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState(null);

  const [formData, setFormData] = useState({
     title: '',
     description: '',
     clientId: '',
     assignedTo: '',
     status: 'Pending',
     priority: 'Medium',
     dueDate: '',
     googleDriveLink: ''
  });

  useEffect(() => {
     fetchData();
  }, [statusFilter, priorityFilter]);

  const fetchData = async () => {
    try {
      const q = new URLSearchParams();
      if(statusFilter) q.append('status', statusFilter);
      if(priorityFilter) q.append('priority', priorityFilter);

      const [taskRes, userRes, clientRes] = await Promise.all([
          api.get(`/tasks?${q.toString()}`),
          api.get('/users'),
          api.get('/clients')
      ]);

      setTasks(taskRes.data);
      // Only keep 'Staff' users in the dropdown directly
      setStaff(userRes.data.filter(u => u.role === 'Staff' || u.role === 'Admin' || u.role === 'Manager'));
      setClients(clientRes.data);
    } catch(err) {
       console.error(err);
    } finally {
       setLoading(false);
    }
  };

  // Calculate statistics
  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'Pending').length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    completed: tasks.filter(t => t.status === 'Completed').length,
    overdue: tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'Completed').length
  };

  // Filter and sort tasks
  const filteredAndSortedTasks = tasks
    .filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.clientId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.assignedTo?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      switch(sortBy) {
        case 'dueDate':
          return new Date(a.dueDate || '9999-12-31') - new Date(b.dueDate || '9999-12-31');
        case 'priority':
          const priorityOrder = { High: 3, Medium: 2, Low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'status':
          return a.status.localeCompare(b.status);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const openAddModal = () => {
     setEditMode(false);
     setFormData({ title: '', description: '', clientId: '', assignedTo: '', status: 'Pending', priority: 'Medium', dueDate: '', googleDriveLink: '' });
     setIsModalOpen(true);
  };

  const openEditModal = (task) => {
     setEditMode(true);
     setCurrentTaskId(task._id);
     
     // Form needs YYYY-MM-DD for date input
     const formattedDate = task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '';

     setFormData({ 
        title: task.title, 
        description: task.description || '', 
        clientId: task.clientId?._id || '', 
        assignedTo: task.assignedTo?._id || '', 
        status: task.status, 
        priority: task.priority, 
        dueDate: formattedDate, 
        googleDriveLink: task.googleDriveLink || ''
     });
     setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
     e.preventDefault();
     try {
       // Backend expects either valid ID or to omit empty strings for refs, but let's send exactly
       const subData = { ...formData };
       if(subData.clientId === '') delete subData.clientId;
       if(subData.assignedTo === '') delete subData.assignedTo;

       if(editMode) {
         await api.put(`/tasks/${currentTaskId}`, subData);
         window.showNotification('Task updated successfully!', 'success');
       } else {
         await api.post('/tasks', subData);
         window.showNotification('Task created successfully!', 'success');
       }
       
       setIsModalOpen(false);
       fetchData();
     } catch (err) {
       window.showNotification(err.response?.data?.message || 'Error saving task', 'error');
     }
  };

  const handleDelete = async (id) => {
     window.showConfirm(
       'Are you sure you want to permanently delete this task? This action cannot be undone.',
       async () => {
         try {
           await api.delete(`/tasks/${id}`);
           window.showNotification('Task deleted successfully!', 'success');
           fetchData();
         } catch(err) {
           window.showNotification('Failed to delete task', 'error');
         }
       }
     );
  };

  if(loading) return <LoadingSpinner />;

  return (
    <div className="p-4 md:p-6 pb-20 w-full max-w-full">
       
       {/* Header Section */}
       <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-6 space-y-4 lg:space-y-0">
        <div>
           <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight flex items-center">
             <MdAssignment className="mr-3 text-emerald-500" /> Task Management
           </h1>
           <p className="text-slate-500 mt-1">Create, assign, and track all internal and client work.</p>
        </div>
        <button 
           onClick={openAddModal}
           className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-700 transition-all duration-200 shadow-md flex items-center space-x-2 text-sm lg:text-base hover:shadow-lg"
        >
           <MdAdd size={20} /> <span>Create New Task</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Total Tasks</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{stats.total}</p>
            </div>
            <div className="bg-slate-100 p-3 rounded-lg">
              <MdAssignment className="text-slate-600" size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Pending</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{stats.pending}</p>
            </div>
            <div className="bg-amber-100 p-3 rounded-lg">
              <MdPending className="text-amber-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">In Progress</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats.inProgress}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <MdPlayArrow className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Completed</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.completed}</p>
            </div>
            <div className="bg-emerald-100 p-3 rounded-lg">
              <MdCheckCircle className="text-emerald-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Overdue</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.overdue}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <MdSchedule className="text-red-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MdSearch className="absolute left-3 top-3 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search tasks by title, description, client, or assignee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>

            <select 
              value={priorityFilter} 
              onChange={e => setPriorityFilter(e.target.value)}
              className="px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>

            <select 
              value={sortBy} 
              onChange={e => setSortBy(e.target.value)}
              className="px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="dueDate">Sort by Due Date</option>
              <option value="priority">Sort by Priority</option>
              <option value="status">Sort by Status</option>
              <option value="title">Sort by Title</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Tasks via Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedTasks.length === 0 && (
             <div className="col-span-full text-center py-20 text-slate-400 font-bold border-2 border-dashed border-slate-200 rounded-2xl">
                {searchTerm || statusFilter || priorityFilter ? 'No tasks found matching your criteria.' : 'No tasks available.'}
             </div>
          )}

          {filteredAndSortedTasks.map(task => {
            const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'Completed';
            const priorityColors = {
              High: 'bg-red-100 text-red-700 border-red-200',
              Medium: 'bg-amber-100 text-amber-700 border-amber-200',
              Low: 'bg-green-100 text-green-700 border-green-200'
            };
            
            const statusColors = {
              'Completed': 'bg-emerald-500',
              'In Progress': 'bg-blue-500',
              'Pending': 'bg-slate-400'
            };

            return (
              <div key={task._id} className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 flex flex-col overflow-hidden group hover:scale-[1.02]">
                  
                  {/* Card Header */}
                  <div className={`p-4 flex justify-between items-start text-white relative overflow-hidden ${
                      statusColors[task.status]
                  }`}>
                      <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
                      <div className="relative z-10">
                         <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${
                            priorityColors[task.priority] || 'bg-gray-100 text-gray-700 border-gray-200'
                         }`}>
                             {task.priority} Priority
                         </span>
                      </div>
                      <div className="relative z-10">
                         {isOverdue && (
                           <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                             OVERDUE
                           </span>
                         )}
                      </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col">
                      <h3 className="text-lg font-bold text-slate-800 leading-tight mb-3 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                        {task.title}
                      </h3>
                      <p className="text-slate-600 text-sm mb-4 flex-1 line-clamp-3">
                         {task.description || <span className="italic text-slate-400">No description provided</span>}
                      </p>

                      <div className="space-y-3">
                         {/* Client */}
                         <div className="flex items-center text-sm">
                            <MdBusinessCenter className="mr-2 text-slate-400" size={16} />
                            <span className="text-slate-600">Client:</span>
                            <span className="ml-auto font-medium text-slate-800 truncate max-w-[120px]">
                              {task.clientId?.name || 'Internal'}
                            </span>
                         </div>
                         
                         {/* Assignee */}
                         <div className="flex items-center text-sm">
                            <MdPerson className="mr-2 text-slate-400" size={16} />
                            <span className="text-slate-600">Assigned to:</span>
                            <span className="ml-auto font-medium text-emerald-600 truncate max-w-[120px]">
                              {task.assignedTo?.name || 'Unassigned'}
                            </span>
                         </div>
                         
                         {/* Due Date */}
                         <div className="flex items-center text-sm">
                            <MdCalendarToday className="mr-2 text-slate-400" size={16} />
                            <span className="text-slate-600">Due:</span>
                            <span className={`ml-auto font-medium truncate max-w-[120px] ${
                              isOverdue ? 'text-red-600' : 'text-slate-800'
                            }`}>
                               {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No deadline'}
                            </span>
                         </div>

                         {/* Google Drive Link */}
                         {task.googleDriveLink && (
                           <div className="flex items-center text-sm">
                              <MdLink className="mr-2 text-blue-400" size={16} />
                              <a 
                                href={task.googleDriveLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 hover:underline truncate flex-1"
                              >
                                View Resources
                              </a>
                           </div>
                         )}
                      </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="p-3 bg-slate-50 flex justify-between items-center border-t border-slate-100">
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          task.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                          task.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {task.status}
                        </span>
                      </div>
                      <div className="flex space-x-1">
                          <button 
                            onClick={() => openEditModal(task)} 
                            className="bg-white text-slate-600 p-2 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 border border-slate-200 transition-all duration-200 hover:scale-110"
                            title="Edit Task"
                          >
                              <MdEdit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(task._id)} 
                            className="bg-white text-slate-600 p-2 rounded-lg hover:bg-red-50 hover:text-red-600 border border-slate-200 transition-all duration-200 hover:scale-110"
                            title="Delete Task"
                          >
                              <MdDelete size={16} />
                          </button>
                      </div>
                  </div>

              </div>
            );
          })}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editMode ? 'Modify Mission Profile' : 'Draft New Mission'}>
         <form onSubmit={handleSubmit} className="space-y-5">
             
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Task Title <span className="text-red-500">*</span></label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border rounded px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="e.g. Create UI Mockups" />
             </div>

             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Details & Instructions</label>
                <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border rounded px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"></textarea>
             </div>

             <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Assign To Client</label>
                    <select value={formData.clientId} onChange={e => setFormData({...formData, clientId: e.target.value})} className="w-full border rounded px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm">
                       <option value="">-- Internal Task --</option>
                       {clients.map(c => <option key={c._id} value={c._id}>{c.name} {c.company ? `(${c.company})` : ''}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Assign To Agent</label>
                    <select value={formData.assignedTo} onChange={e => setFormData({...formData, assignedTo: e.target.value})} className="w-full border rounded px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold text-emerald-700">
                       <option value="">-- Unassigned --</option>
                       {staff.map(u => <option key={u._id} value={u._id}>{u.name} [{u.role}]</option>)}
                    </select>
                 </div>
             </div>

             <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 items-center flex"><MdFlag className="mr-1"/> Status</label>
                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full border rounded px-2 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold">
                       <option value="Pending">Pending</option>
                       <option value="In Progress">In Progress</option>
                       <option value="Completed">Completed</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 items-center flex"><MdFlag className="mr-1 text-red-400"/> Priority</label>
                    <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} className="w-full border rounded px-2 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold">
                       <option value="Low">Low</option>
                       <option value="Medium">Medium</option>
                       <option value="High">High</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Deadline <span className="text-red-500">*</span></label>
                    <input required type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} className="w-full border rounded px-2 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold" />
                 </div>
             </div>

             <div className="pt-2">
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Resource Link (Google Drive, Docs, etc)</label>
                 <input type="url" value={formData.googleDriveLink} onChange={e => setFormData({...formData, googleDriveLink: e.target.value})} className="w-full border border-dashed border-slate-400 rounded px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-blue-600 font-medium" placeholder="https://drive.google.com/..." />
             </div>

             <div className="pt-6 mt-4 border-t border-slate-100 flex justify-end space-x-3">
                 <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg text-slate-600 font-bold hover:bg-slate-100 transition-colors">Abort</button>
                 <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-2.5 rounded-lg shadow-md transition-all">Submit Protocol</button>
             </div>
         </form>
      </Modal>

    </div>
  );
};

export default TaskManagement;
