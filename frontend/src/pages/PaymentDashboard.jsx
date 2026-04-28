import { useState, useEffect } from 'react';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import DashboardCharts from '../components/DashboardCharts';
import { 
  MdAttachMoney, 
  MdAdd, 
  MdDelete,
  MdReceipt,
  MdCheckCircle,
  MdPendingActions,
  MdCancel,
  MdSearch
} from 'react-icons/md';

const PaymentDashboard = () => {
  const [payments, setPayments] = useState([]);
  const [clients, setClients] = useState([]);
  const [stats, setStats] = useState({ totalRevenue: 0, pendingCount: 0, paidCount: 0, thisMonthRevenue: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    clientId: '',
    amount: '',
    currency: 'USD',
    method: 'Bank Transfer',
    status: 'Paid',
    description: '',
    dueDate: ''
  });

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (statusFilter) q.append('status', statusFilter);

      const [payRes, statsRes, clientRes] = await Promise.all([
        api.get(`/payments?${q.toString()}`),
        api.get('/payments/stats'),
        api.get('/clients')
      ]);

      setPayments(payRes.data);
      setStats(statsRes.data);
      setClients(clientRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/payments', formData);
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error recording payment');
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.put(`/payments/${id}`, { status: newStatus });
      fetchData();
    } catch (err) {
      alert('Failed to update payment status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this payment record?')) {
      try {
        await api.delete(`/payments/${id}`);
        fetchData();
      } catch (err) {
        alert('Error deleting payment');
      }
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'Paid') return <MdCheckCircle className="text-emerald-500" size={20} />;
    if (status === 'Pending') return <MdPendingActions className="text-amber-500" size={20} />;
    return <MdCancel className="text-red-400" size={20} />;
  };

  const filtered = payments.filter(p =>
    p.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.clientId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center">
            <MdAttachMoney className="mr-2 text-emerald-500" /> Payment Records
          </h1>
          <p className="text-slate-500 mt-1">Track invoices, revenue, and billing status across all clients.</p>
        </div>
        <button
          onClick={() => { setFormData({ clientId: '', amount: '', currency: 'USD', method: 'Bank Transfer', status: 'Paid', description: '', dueDate: '' }); setIsModalOpen(true); }}
          className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-emerald-700 shadow-md flex items-center space-x-2"
        >
          <MdAdd size={24} /> <span>Record Payment</span>
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Revenue', value: `$${stats.totalRevenue?.toLocaleString()}`, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
          { label: 'This Month', value: `$${stats.thisMonthRevenue?.toLocaleString()}`, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
          { label: 'Paid Invoices', value: stats.paidCount, color: 'text-slate-700', bg: 'bg-white border-slate-200' },
          { label: 'Pending Invoices', value: stats.pendingCount, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-5 shadow-sm ${s.bg}`}>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">{s.label}</p>
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Payment Status Distribution */}
        <DashboardCharts
          type="pie"
          data={[
            { name: 'Paid', value: stats.paidCount },
            { name: 'Pending', value: stats.pendingCount },
            { name: 'Overdue', value: payments.filter(p => p.status === 'Overdue').length }
          ]}
          title="Payment Status Distribution"
          height={300}
        />

        {/* Monthly Revenue Trend */}
        <DashboardCharts
          type="line"
          data={[
            { month: 'Jan', value: 12500 },
            { month: 'Feb', value: 15800 },
            { month: 'Mar', value: 18900 },
            { month: 'Apr', value: 22000 },
            { month: 'May', value: 19500 },
            { month: 'Jun', value: 25300 }
          ]}
          title="Monthly Revenue Trend"
          height={300}
        />
      </div>

      {/* Filter row */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 flex flex-wrap gap-4 items-center shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search client name or invoice #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
          />
          <MdSearch className="absolute left-3 top-2.5 text-slate-400" size={20} />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-slate-300 rounded px-3 py-2 text-sm font-bold text-slate-600 focus:outline-none bg-slate-50 cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
          <option value="Overdue">Overdue</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs uppercase bg-slate-100 text-slate-500 font-bold tracking-widest border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Invoice #</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Method</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(p => (
                <tr key={p._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-slate-700 flex items-center">
                    <MdReceipt className="mr-2 text-slate-300" />{p.invoiceNumber}
                  </td>
                  <td className="px-6 py-4 font-semibold">{p.clientId?.name || 'Unknown'}</td>
                  <td className="px-6 py-4 font-black text-emerald-600 text-base">{p.currency} {p.amount?.toFixed(2)}</td>
                  <td className="px-6 py-4 text-slate-500">{p.method}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(p.status)}
                      <select
                        value={p.status}
                        onChange={(e) => handleUpdateStatus(p._id, e.target.value)}
                        className={`text-xs font-bold rounded px-2 py-1 border focus:outline-none cursor-pointer ${
                          p.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          p.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                        <option value="Overdue">Overdue</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-400 font-medium">{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(p._id)} className="text-red-400 hover:text-red-600 p-2 rounded-md hover:bg-red-50 transition-colors">
                      <MdDelete size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="7" className="text-center py-12 text-slate-400 font-bold">No payment records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Payment Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record New Payment">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Client <span className="text-red-500">*</span></label>
            <select required value={formData.clientId} onChange={e => setFormData({ ...formData, clientId: e.target.value })} className="w-full border rounded px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold">
              <option value="">-- Select Client --</option>
              {clients.map(c => <option key={c._id} value={c._id}>{c.name} {c.company ? `(${c.company})` : ''}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Amount <span className="text-red-500">*</span></label>
              <input required type="number" step="0.01" min="0" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} className="w-full border rounded px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-700" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Currency</label>
              <select value={formData.currency} onChange={e => setFormData({ ...formData, currency: e.target.value })} className="w-full border rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold cursor-pointer">
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="LKR">LKR</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Payment Method</label>
              <select value={formData.method} onChange={e => setFormData({ ...formData, method: e.target.value })} className="w-full border rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold cursor-pointer">
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Cash">Cash</option>
                <option value="PayPal">PayPal</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Status</label>
              <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full border rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold cursor-pointer">
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Description / Notes</label>
            <textarea rows="2" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full border rounded px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="e.g. Monthly retainer - March 2024"></textarea>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Due Date</label>
            <input type="date" value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} className="w-full border rounded px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold" />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg text-slate-600 font-bold hover:bg-slate-100">Cancel</button>
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-2.5 rounded-lg shadow-md">Save Record</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PaymentDashboard;
