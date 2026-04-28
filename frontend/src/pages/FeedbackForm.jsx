import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import StarRating from '../components/StarRating';
import { MdRateReview, MdCheckCircle, MdError, MdAutoFixHigh } from 'react-icons/md';

const FeedbackForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  // AI Response from backend
  const [aiSuggestions, setAiSuggestions] = useState(null);

  const [formData, setFormData] = useState({
      campaignName: '',
      rating: 0,
      comment: ''
  });
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = async (e) => {
      e.preventDefault();
      if(formData.rating === 0) return setError("Please select a star rating");
      
      setLoading(true);
      setError(null);
      
      try {
          const { data } = await api.post('/feedback', formData);
          // Backend returns the created object, which includes AI generated stuff
          setAiSuggestions(data.aiSuggestions);
          setSuccess(true);
      } catch(err) {
          setError(err.response?.data?.message || 'Failed to submit feedback.');
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <div className="mb-8 text-center">
           <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <MdRateReview size={40} />
           </div>
           <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Campaign Feedback</h1>
           <p className="text-slate-500 mt-2 max-w-lg mx-auto">Your input helps our AI fine-tune upcoming strategies. Please provide honest feedback regarding your recent campaign.</p>
        </div>

        {success ? (
            <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 p-10 text-center animate-fade-in-up">
                <MdCheckCircle size={80} className="text-emerald-500 mx-auto mb-6 drop-shadow-sm" />
                <h2 className="text-3xl font-bold text-slate-800 mb-4">Feedback Received!</h2>
                <p className="text-slate-600 mb-8 max-w-md mx-auto">Our AI system has analyzed your submission and generated immediate insights for our team.</p>
                
                {aiSuggestions && (
                    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 text-left mb-8 relative overflow-hidden">
                        <MdAutoFixHigh size={100} className="absolute -right-6 -bottom-6 text-indigo-100 opacity-50 z-0" />
                        <h4 className="font-bold text-indigo-800 uppercase tracking-widest text-xs mb-3 flex items-center relative z-10"><MdAutoFixHigh className="mr-2"/> AI Action Plan</h4>
                        <div className="text-indigo-900 leading-relaxed font-medium relative z-10 text-sm">
                            {aiSuggestions}
                        </div>
                    </div>
                )}

                <div className="flex justify-center space-x-4">
                    <button onClick={() => navigate('/client')} className="bg-slate-100 text-slate-700 px-6 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors">Return to Dashboard</button>
                    <button onClick={() => { setSuccess(false); setFormData({campaignName: '', rating: 0, comment: ''}) }} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-md">Submit Another Form</button>
                </div>
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl border border-slate-100 p-10">
                {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-bold flex flex-col items-center"><MdError size={32} className="mb-2"/> {error}</div>}

                <div className="space-y-8">
                    <div>
                        <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Campaign Name / Reference <span className="text-red-500">*</span></label>
                        <input required type="text" value={formData.campaignName} onChange={e=>setFormData({...formData, campaignName: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-colors text-lg font-bold text-slate-700" placeholder="e.g. Summer Outreach 2024" />
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                        <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Overall Experience <span className="text-red-500">*</span></label>
                        <StarRating 
                            rating={formData.rating} 
                            hoverRating={hoverRating} 
                            onSetRating={(val) => setFormData({...formData, rating: val})}
                            onHoverRating={setHoverRating}
                        />
                        <div className="text-xs text-slate-400 font-bold tracking-widest uppercase mt-2">
                             {formData.rating === 0 ? 'Select a rating' : 
                              formData.rating === 1 ? 'Poor' : 
                              formData.rating === 2 ? 'Fair' : 
                              formData.rating === 3 ? 'Good' : 
                              formData.rating === 4 ? 'Very Good' : 'Excellent'}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                        <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Detailed Comments</label>
                        <textarea rows="5" value={formData.comment} onChange={e=>setFormData({...formData, comment: e.target.value})} className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-colors text-slate-700 leading-relaxed" placeholder="Tell us what you liked and what could be improved. Our AI will analyze your notes!"></textarea>
                    </div>

                    <button disabled={loading} type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black text-lg py-5 rounded-2xl shadow-xl transition-all disabled:opacity-50 disabled:cursor-wait">
                        {loading ? 'Transmitting Data & Engaging AI...' : 'Submit Feedback Protocol'}
                    </button>
                </div>
            </form>
        )}
    </div>
  );
};

export default FeedbackForm;
