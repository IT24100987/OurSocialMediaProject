import { useState, useEffect } from 'react';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import { 
  MdEdit, 
  MdDelete, 
  MdAdd, 
  MdAutoAwesome, 
  MdSecurity, 
  MdWarning, 
  MdSearch
} from 'react-icons/md';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Client',
    isActive: true,
    description: '' // Used for AI Recommendation
  });
  
  // AI States
  const [aiLoading, setAiLoading] = useState(false);
  const [permissionExp, setPermissionExp] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditMode(false);
    setFormData({ name: '', email: '', password: '', role: 'Client', isActive: true, description: '' });
    setPermissionExp('');
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditMode(true);
    setCurrentUserId(user._id);
    setFormData({ 
       name: user.name, 
       email: user.email, 
       password: '', // Blank password field means no change
       role: user.role, 
       isActive: user.isActive,
       description: ''
    });
    setPermissionExp('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        // Exclude description when sending to backend
        const { description, ...updateData } = formData;
        // If password is blank, don't send it to backend so we don't overwrite current pass
        if (!updateData.password) delete updateData.password;
        
        await api.put(`/users/${currentUserId}`, updateData);
        window.showNotification('User updated successfully!', 'success');
      } else {
        await api.post('/users', formData);
        window.showNotification('User created successfully!', 'success');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      window.showNotification(err.response?.data?.message || 'Error saving user', 'error');
    }
  };

  const handleDeactivate = async (id, currentStatus) => {
    window.showConfirm(
      'Are you sure you want to deactivate this user? This action cannot be undone.',
      async () => {
        try {
          await api.delete(`/users/${id}`);
          window.showNotification('User deactivated successfully!', 'success');
          fetchUsers();
        } catch(err) {
          window.showNotification('Error deactivating user', 'error');
        }
      }
    );
  };

  // 💡 Beginner Note: Connects to our AI Controller
  const handleAIRecommend = async () => {
      if (!formData.description) {
        window.showNotification('Please enter a user description first', 'warning');
        return;
      }
      setAiLoading(true);
      try {
         const { data } = await api.post('/ai/role-recommend', { description: formData.description });
         if (['Admin', 'Manager', 'Staff', 'Client'].includes(data.role)) {
             setFormData(prev => ({...prev, role: data.role}));
             window.showNotification(`AI recommends: ${data.role} role`, 'success');
         } else {
             window.showNotification('AI returned an unknown role: ' + data.role, 'error');
         }
      } catch(e) { 
        window.showNotification('Error getting AI recommendation', 'error');
      } finally { 
        setAiLoading(false); 
      }
  };

  const handleAIExplain = async () => {
      if (!formData.role) {
        window.showNotification('Please select a role first', 'warning');
        return;
      }
      setAiLoading(true);
      try {
         const { data } = await api.post('/ai/permission-explain', { role: formData.role });
         setPermissionExp(data.explanation);
      } catch(e) { 
        window.showNotification('Error getting role explanation', 'error');
      } finally { 
        setAiLoading(false); 
      }
  };

  // Filter 
  const filteredUsers = users.filter(u => 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-4 md:p-6 w-full max-w-full">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-6 space-y-4 lg:space-y-0">
        <div>
           <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight">User Management</h1>
           <p className="text-slate-500 mt-1">Add internal users and manage role permissions.</p>
        </div>
        <button 
           onClick={openAddModal}
           className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-md flex items-center space-x-2 text-sm lg:text-base"
        >
           <MdAdd size={20} /> <span>Create New User</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
         {/* Table Toolbar */}
         <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
             <div className="relative w-72">
                 <input 
                    type="text"
                    placeholder="Search name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                 />
                 <MdSearch className="absolute left-3 top-2.5 text-slate-400" size={20} />
             </div>
             <div className="text-sm font-bold text-slate-500">
                {users.length} Total Users
             </div>
         </div>

         {/* Data Table */}
         <table className="w-full text-left text-sm text-slate-600">
            <thead className="text-xs uppercase bg-slate-100 text-slate-500 font-bold tracking-widest">
               <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Created Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {filteredUsers.map(user => (
                   <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800">{user.name}</td>
                      <td className="px-6 py-4">{user.email}</td>
                      <td className="px-6 py-4">
                         <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                             user.role === 'Admin' ? 'bg-indigo-100 text-indigo-700' :
                             user.role === 'Manager' ? 'bg-cyan-100 text-cyan-700' :
                             user.role === 'Staff' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                         }`}>
                            {user.role}
                         </span>
                      </td>
                      <td className="px-6 py-4">
                         {user.isActive 
                           ? <span className="text-emerald-600 font-bold flex items-center space-x-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div><span>Active</span></span> 
                           : <span className="text-red-600 font-bold flex items-center space-x-1"><div className="w-2 h-2 rounded-full bg-red-500"></div><span>Inactive</span></span>}
                      </td>
                      <td className="px-6 py-4 text-slate-400 font-medium">
                         {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                         <button onClick={() => openEditModal(user)} className="text-blue-600 hover:text-blue-800 p-2 rounded-md hover:bg-blue-50 transition-colors mr-2">
                             <MdEdit size={20} />
                         </button>
                         <button disabled={!user.isActive} onClick={() => handleDeactivate(user._id, user.isActive)} className="text-red-600 hover:text-red-800 p-2 rounded-md hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                             <MdDelete size={20} />
                         </button>
                      </td>
                   </tr>
               ))}
               {filteredUsers.length === 0 && (
                   <tr>
                      <td colSpan="6" className="text-center py-10 text-slate-400 font-bold">No users match your search.</td>
                   </tr>
               )}
            </tbody>
         </table>
      </div>

      {/* CREATE / EDIT MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editMode ? 'Edit User' : 'Create New User'}>
         <form onSubmit={handleSubmit} className="space-y-5">
             
             <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Full Name</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border rounded px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Email</label>
                    <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border rounded px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                 </div>
             </div>

             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                   Password {editMode && <span className="text-slate-400 font-normal lowercase tracking-normal">(Leave blank to keep current)</span>}
                </label>
                <input required={!editMode} type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full border rounded px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 tracking-widest" placeholder="••••••••" />
             </div>

             {/* AI ASSISTED ROLE SELECTION */}
             <div className="border border-indigo-100 bg-indigo-50/30 p-4 rounded-xl space-y-4">
                 <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">System Role</label>
                    <button type="button" onClick={handleAIExplain} disabled={aiLoading} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 disabled:opacity-50">
                        <MdSecurity /> <span>Explain this role</span>
                    </button>
                 </div>
                 
                 <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full border rounded px-3 py-2 bg-white font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Staff">Staff</option>
                    <option value="Client">Client</option>
                 </select>

                 {!editMode && (
                     <div className="pt-2 border-t border-indigo-100">
                         <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center">
                            <MdAutoAwesome className="mr-1 text-indigo-400" /> Auto-assign Role
                         </label>
                         <div className="flex space-x-2">
                            <input type="text" placeholder="e.g. Needs to manage clients but not admins" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="flex-1 placeholder-slate-300 border border-indigo-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
                            <button type="button" disabled={aiLoading} onClick={handleAIRecommend} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded text-sm font-bold shadow-sm disabled:opacity-50 transition-colors">
                               Ask AI
                            </button>
                         </div>
                     </div>
                 )}

                 {permissionExp && (
                     <div className="bg-white border border-indigo-200 p-3 rounded text-sm text-slate-700 leading-relaxed italic shadow-sm">
                        {permissionExp}
                     </div>
                 )}
             </div>

             {/* STATUS */}
             {editMode && (
                 <div className="flex items-center space-x-3 bg-slate-50 p-3 border rounded-lg">
                    <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-5 h-5 text-blue-600 rounded bg-white focus:ring-blue-600 cursor-pointer" />
                    <label className="text-sm font-bold text-slate-700">Account is Active</label>
                    {!formData.isActive && <div className="text-xs text-red-500 font-bold flex items-center ml-auto"><MdWarning size={16} className="mr-1"/> Required for login</div>}
                 </div>
             )}

             <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                 <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg text-slate-600 font-bold hover:bg-slate-100 transition-colors">Cancel</button>
                 <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-2.5 rounded-lg shadow-md transition-all">Save User</button>
             </div>
         </form>
      </Modal>

    </div>
  );
};

export default UserManagement;
