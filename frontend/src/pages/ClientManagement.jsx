import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import { 
  MdEdit, 
  MdDelete, 
  MdAdd, 
  MdVisibility,
  MdSearch,
  MdFilterList,
  MdBusinessCenter
} from 'react-icons/md';

const ClientManagement = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [pkgFilter, setPkgFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentClientId, setCurrentClientId] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    package: 'Silver',
    status: 'active',
  });

  useEffect(() => {
    fetchClients();
  }, [pkgFilter, statusFilter]);

  const fetchClients = async () => {
    try {
      // 💡 Beginner Note: passing URL queries ?package=...&status=...
      const query = new URLSearchParams();
      if (pkgFilter) query.append('package', pkgFilter);
      if (statusFilter) query.append('status', statusFilter);

      const { data } = await api.get(`/clients?${query.toString()}`);
      setClients(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditMode(false);
    setFormData({ name: '', email: '', phone: '', company: '', package: 'Silver', status: 'active' });
    setIsModalOpen(true);
  };

  const openEditModal = (client) => {
    setEditMode(true);
    setCurrentClientId(client._id);
    setFormData({ 
       name: client.name, 
       email: client.email, 
       phone: client.phone || '', 
       company: client.company || '', 
       package: client.package,
       status: client.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
         await api.put(`/clients/${currentClientId}`, formData);
         window.showNotification('Client updated successfully!', 'success');
      } else {
         await api.post('/clients', formData);
         window.showNotification('Client created successfully!', 'success');
      }
      setIsModalOpen(false);
      fetchClients();
    } catch (err) {
      window.showNotification(err.response?.data?.message || 'Error saving client', 'error');
    }
  };

  const handleDeactivate = async (id) => {
    window.showConfirm(
      'Are you sure you want to deactivate this client? This action cannot be undone.',
      async () => {
        try {
          await api.delete(`/clients/${id}`);
          window.showNotification('Client deactivated successfully!', 'success');
          fetchClients();
        } catch(err) {
          window.showNotification(err.response?.data?.message || 'Error deactivating client', 'error');
        }
      }
    );
  };

  // Local search filter based on name or company
  const filteredClients = clients.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (c.company && c.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-4 md:p-6 w-full max-w-full">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-6 space-y-4 lg:space-y-0">
        <div>
           <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight flex items-center">
             <MdBusinessCenter className="mr-3 text-indigo-500" /> Client Management
           </h1>
           <p className="text-slate-500 mt-1">Add internal records or manage registered clients.</p>
        </div>
        <button 
           onClick={openAddModal}
           className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-md flex items-center space-x-2 text-sm lg:text-base"
        >
           <MdAdd size={20} /> <span>Add Client Manually</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
         <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap gap-4 items-center justify-between">
             
             {/* Search */}
             <div className="relative w-full md:w-72">
                 <input 
                    type="text"
                    placeholder="Search name or company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                 />
                 <MdSearch className="absolute left-3 top-2.5 text-slate-400" size={20} />
             </div>

             {/* Filters */}
             <div className="flex space-x-4 ml-auto items-center">
                <MdFilterList className="text-slate-400" size={24} />
                <select 
                   value={pkgFilter} 
                   onChange={e => setPkgFilter(e.target.value)}
                   className="border border-slate-300 rounded px-3 py-2 bg-white text-sm font-bold text-slate-600 focus:outline-none cursor-pointer"
                >
                   <option value="">All Packages</option>
                   <option value="Silver">Silver</option>
                   <option value="Gold">Gold</option>
                   <option value="Platinum">Platinum</option>
                   <option value="Diamond">Diamond</option>
                </select>

                <select 
                   value={statusFilter} 
                   onChange={e => setStatusFilter(e.target.value)}
                   className="border border-slate-300 rounded px-3 py-2 bg-white text-sm font-bold text-slate-600 focus:outline-none cursor-pointer"
                >
                   <option value="">All Statuses</option>
                   <option value="active">Active</option>
                   <option value="inactive">Inactive</option>
                </select>
             </div>
         </div>

         {/* Data Table */}
         <div className="overflow-x-auto">
           <table className="w-full text-left text-sm text-slate-600">
              <thead className="text-xs uppercase bg-slate-100 text-slate-500 font-bold tracking-widest border-b border-slate-200">
                 <tr>
                    <th className="px-6 py-4">Client Name</th>
                    <th className="px-6 py-4">Company</th>
                    <th className="px-6 py-4">Package</th>
                    <th className="px-6 py-4">Registration</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {filteredClients.map(client => (
                     <tr key={client._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                           <div className="font-bold text-slate-800 text-base">{client.name}</div>
                           <div className="text-xs text-slate-400">{client.email}</div>
                           {client.phone && <div className="text-xs text-slate-400">{client.phone}</div>}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-700">{client.company || '-'}</td>
                        <td className="px-6 py-4">
                           <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${
                               client.package === 'Silver' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                               client.package === 'Gold' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                               client.package === 'Platinum' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' :
                               'bg-cyan-100 text-cyan-700 border-cyan-200'
                           }`}>
                              {client.package}
                           </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-xs">
                           {client.registeredFrom === 'landing_page' 
                            ? <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">Web Registered</span>
                            : <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded">Admin Created</span>}
                        </td>
                        <td className="px-6 py-4">
                           {client.status === 'active' 
                             ? <span className="text-emerald-600 font-bold">Active</span> 
                             : <span className="text-red-500 font-bold">Inactive</span>}
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                           <button onClick={() => navigate(`/clients/${client._id}`)} className="text-slate-400 hover:text-indigo-600 p-2 rounded-md hover:bg-indigo-50 transition-colors mr-1">
                               <MdVisibility size={20} />
                           </button>
                           <button onClick={() => openEditModal(client)} className="text-slate-400 hover:text-blue-600 p-2 rounded-md hover:bg-blue-50 transition-colors mr-1">
                               <MdEdit size={20} />
                           </button>
                           <button disabled={client.status !== 'active'} onClick={() => handleDeactivate(client._id)} className="text-slate-400 hover:text-red-600 p-2 rounded-md hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                               <MdDelete size={20} />
                           </button>
                        </td>
                     </tr>
                 ))}
                 {filteredClients.length === 0 && (
                     <tr>
                        <td colSpan="6" className="text-center py-10 text-slate-400 font-bold">No clients match your search and filters.</td>
                     </tr>
                 )}
              </tbody>
           </table>
         </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editMode ? 'Edit Client Record' : 'Manual Client Entry'}>
         <form onSubmit={handleSubmit} className="space-y-5 flex flex-col pt-2">
             
             <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Full Name</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border rounded px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Company</label>
                    <input type="text" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full border rounded px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                 </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Email</label>
                    <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border rounded px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Phone</label>
                    <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border rounded px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                 </div>
             </div>

             <div className="pt-4 border-t border-slate-100">
               <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Assign Package</label>
               <select value={formData.package} onChange={e => setFormData({...formData, package: e.target.value})} className="w-full border rounded px-3 py-3 bg-white font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm">
                  <option value="Silver">Silver Package</option>
                  <option value="Gold">Gold Package</option>
                  <option value="Platinum">Platinum Package</option>
                  <option value="Diamond">Diamond Package</option>
               </select>
             </div>

             {editMode && (
                 <div className="pt-4">
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Status</label>
                   <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full border rounded px-3 py-3 bg-white font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                   </select>
                 </div>
             )}

             <div className="pt-6 mt-4 border-t border-slate-100 flex justify-end space-x-3">
                 <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg text-slate-600 font-bold hover:bg-slate-100 transition-colors">Cancel</button>
                 <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-2.5 rounded-lg shadow-md transition-all">Save Client</button>
             </div>
         </form>
      </Modal>

    </div>
  );
};

export default ClientManagement;
