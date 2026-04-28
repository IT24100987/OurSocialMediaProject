import { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import DashboardCharts from '../components/DashboardCharts';
import { 
  MdRateReview, 
  MdAutoFixHigh,
  MdStar,
  MdSearch,
  MdEdit,
  MdSentimentSatisfied,
  MdSentimentNeutral,
  MdSentimentDissatisfied
} from 'react-icons/md';

const FeedbackHistory = () => {
  const { user } = useContext(AuthContext);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('');
  const [aiInsightText, setAiInsightText] = useState({});
  const [loadingInsight, setLoadingInsight] = useState(null);

  // Edit Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editFormData, setEditFormData] = useState({ campaignName: '', rating: 0, comment: '' });

  useEffect(() => {
    fetchFeedback();
  }, [sentimentFilter]);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (sentimentFilter) q.append('sentiment', sentimentFilter);

      // Staff/Admin/Manager use the full list; Clients use their own
      const url = user.role === 'Client' ? `/feedback/my?${q}` : `/feedback?${q}`;
      const { data } = await api.get(url);
      setFeedbacks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (fb) => {
    setEditTarget(fb);
    setEditFormData({ campaignName: fb.campaignName, rating: fb.rating, comment: fb.comment });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/feedback/${editTarget._id}`, editFormData);
      setEditModalOpen(false);
      fetchFeedback();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not update feedback. Check the 24-hour edit limit.');
    }
  };

  const generateIndividualInsight = async (fbId, comment, rating) => {
    setLoadingInsight(fbId);
    try {
      const { data } = await api.post('/ai/sentiment', { text: comment, rating });
      setAiInsightText(prev => ({ ...prev, [fbId]: data }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInsight(null);
    }
  };

  const renderStars = (rating) => (
    <div className="flex space-x-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <MdStar key={s} className={s <= rating ? 'text-yellow-400' : 'text-slate-200'} size={18} />
      ))}
    </div>
  );

  const getSentimentClass = (sentiment) => {
    if (sentiment === 'positive') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (sentiment === 'negative') return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-amber-100 text-amber-700 border-amber-200';
  };

  const filtered = feedbacks.filter(fb =>
    fb.campaignName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fb.comment?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center">
            <MdRateReview className="mr-3 text-blue-500" /> Feedback History
          </h1>
          <p className="text-slate-500 mt-1">AI-analyzed client satisfaction records.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 flex flex-wrap gap-4 items-center shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search campaign or comment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <MdSearch className="absolute left-3 top-2.5 text-slate-400" size={20} />
        </div>

        <select
          value={sentimentFilter}
          onChange={(e) => setSentimentFilter(e.target.value)}
          className="border border-slate-300 rounded px-3 py-2 text-sm font-bold text-slate-600 focus:outline-none cursor-pointer bg-slate-50"
        >
          <option value="">All Sentiments</option>
          <option value="positive">Positive</option>
          <option value="neutral">Neutral</option>
          <option value="negative">Negative</option>
        </select>

        <div className="ml-auto text-sm font-bold text-slate-400">{filtered.length} results</div>
      </div>

      {/* Feedback Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <MdSentimentSatisfied className="text-green-600" size={24} />
              </div>
              <h3 className="font-semibold text-slate-700">Positive</h3>
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-800 mb-1">
            {feedbacks.filter(f => f.sentiment === 'positive').length}
          </div>
          <div className="text-sm text-slate-500">
            {feedbacks.length > 0 ? Math.round((feedbacks.filter(f => f.sentiment === 'positive').length / feedbacks.length) * 100) : 0}% of total
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                <MdSentimentNeutral className="text-yellow-600" size={24} />
              </div>
              <h3 className="font-semibold text-slate-700">Neutral</h3>
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-800 mb-1">
            {feedbacks.filter(f => f.sentiment === 'neutral').length}
          </div>
          <div className="text-sm text-slate-500">
            {feedbacks.length > 0 ? Math.round((feedbacks.filter(f => f.sentiment === 'neutral').length / feedbacks.length) * 100) : 0}% of total
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <MdSentimentDissatisfied className="text-red-600" size={24} />
              </div>
              <h3 className="font-semibold text-slate-700">Negative</h3>
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-800 mb-1">
            {feedbacks.filter(f => f.sentiment === 'negative').length}
          </div>
          <div className="text-sm text-slate-500">
            {feedbacks.length > 0 ? Math.round((feedbacks.filter(f => f.sentiment === 'negative').length / feedbacks.length) * 100) : 0}% of total
          </div>
        </div>
      </div>

      {/* Sentiment Distribution Chart */}
      <div className="mb-8">
        <DashboardCharts
          type="pie"
          data={[
            { name: 'Positive', value: feedbacks.filter(f => f.sentiment === 'positive').length },
            { name: 'Neutral', value: feedbacks.filter(f => f.sentiment === 'neutral').length },
            { name: 'Negative', value: feedbacks.filter(f => f.sentiment === 'negative').length }
          ]}
          title="Sentiment Distribution"
          height={300}
        />
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.length === 0 && (
          <div className="col-span-full py-20 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
            No feedback found for your applied filters.
          </div>
        )}

        {filtered.map(fb => {
          const insight = aiInsightText[fb._id];
          return (
            <div key={fb._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex flex-col">

              {/* Card Header */}
              <div className="p-5 border-b border-slate-100">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-slate-800 text-lg leading-tight pr-2">{fb.campaignName}</h3>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full border uppercase tracking-widest shrink-0 ${getSentimentClass(fb.sentiment)}`}>
                    {fb.sentiment}
                  </span>
                </div>

                {renderStars(fb.rating)}

                {/* Show Client name for admin/manager view */}
                {user.role !== 'Client' && fb.clientId?.name && (
                  <div className="text-xs text-slate-400 font-bold mt-2 uppercase tracking-widest">
                    from: {fb.clientId.name}
                  </div>
                )}
              </div>

              {/* Comment */}
              <div className="p-5 flex-1">
                <p className="text-slate-600 text-sm leading-relaxed italic line-clamp-4">
                  "{fb.comment || 'No detailed comment provided.'}"
                </p>

                {/* AI Suggestions block if available */}
                {fb.aiSuggestions && (
                  <div className="mt-4 bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-xs text-indigo-800 font-medium leading-relaxed">
                    <span className="font-black uppercase tracking-widest text-indigo-500 block mb-1">AI Action Plan:</span>
                    {fb.aiSuggestions}
                  </div>
                )}

                {/* On-demand AI insight */}
                {insight && (
                  <div className="mt-3 bg-amber-50 border border-amber-100 rounded-lg p-3 text-xs text-amber-800 font-medium leading-relaxed">
                    <span className="font-black uppercase tracking-widest text-amber-500 block mb-1">Deep Analysis:</span>
                    <div>{insight.sentiment && <span>Sentiment: <b>{insight.sentiment}</b> | </span>}</div>
                    {insight.suggestions}
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center rounded-b-2xl">
                <span className="text-xs text-slate-400 font-medium">
                  {new Date(fb.createdAt).toLocaleDateString()}
                </span>

                <div className="flex space-x-2">
                  {/* Only clients can edit their own feedback */}
                  {user.role === 'Client' && (
                    <button
                      onClick={() => openEditModal(fb)}
                      className="p-2 bg-white rounded-lg border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-colors shadow-sm"
                    >
                      <MdEdit size={16} />
                    </button>
                  )}

                  {/* Admin & Manager can request on-demand deeper analysis */}
                  {(user.role === 'Admin' || user.role === 'Manager') && (
                    <button
                      onClick={() => generateIndividualInsight(fb._id, fb.comment, fb.rating)}
                      disabled={loadingInsight === fb._id}
                      className="text-xs px-3 py-1.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center"
                    >
                      <MdAutoFixHigh size={14} className="mr-1" />
                      {loadingInsight === fb._id ? '...' : 'Deep Analyze'}
                    </button>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Your Feedback">
        <form onSubmit={handleEditSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Campaign Name</label>
            <input type="text" value={editFormData.campaignName} onChange={e => setEditFormData({ ...editFormData, campaignName: e.target.value })} className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Rating (1–5)</label>
            <input type="number" min="1" max="5" value={editFormData.rating} onChange={e => setEditFormData({ ...editFormData, rating: parseInt(e.target.value) })} className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 font-bold" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Comment</label>
            <textarea rows="4" value={editFormData.comment} onChange={e => setEditFormData({ ...editFormData, comment: e.target.value })} className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 leading-relaxed"></textarea>
          </div>
          <p className="text-xs text-amber-600 font-bold bg-amber-50 p-3 rounded-lg border border-amber-200">
            ⚠️ Edits are only allowed within 24 hours of submission.
          </p>
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setEditModalOpen(false)} className="px-5 py-2.5 rounded-lg text-slate-600 font-bold hover:bg-slate-100">Cancel</button>
            <button type="submit" className="bg-blue-600 text-white font-bold px-8 py-2.5 rounded-lg shadow-md hover:bg-blue-700">Update</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FeedbackHistory;
