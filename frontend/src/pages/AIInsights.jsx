import { useState, useEffect } from 'react';
import api from '../api/axios';
import { MdAutoAwesome, MdTrendingUp, MdSentimentSatisfied, MdSentimentNeutral, MdSentimentDissatisfied } from 'react-icons/md';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const AIInsights = () => {
  const [feedbackData, setFeedbackData] = useState({
    positive: 5,
    neutral: 0,
    negative: 3,
    total: 8
  });
  
  const [clientSatisfactionData, setClientSatisfactionData] = useState([
    { company: 'FoodBox', satisfaction: 85 },
    { company: 'TechStart Inc', satisfaction: 92 },
    { company: 'GreenLife', satisfaction: 78 },
    { company: 'Acme Corp', satisfaction: 88 },
    { company: 'StyleHub', satisfaction: 95 }
  ]);
  
  const [satisfactionTrendData, setSatisfactionTrendData] = useState([
    { month: 'Apr 2025', satisfaction: 75 },
    { month: 'May 2025', satisfaction: 78 },
    { month: 'Jun 2025', satisfaction: 82 },
    { month: 'Jul 2025', satisfaction: 85 },
    { month: 'Aug 2025', satisfaction: 83 },
    { month: 'Sep 2025', satisfaction: 87 },
    { month: 'Oct 2025', satisfaction: 90 }
  ]);

  useEffect(() => {
    // Fetch real data from API when component mounts
    const fetchInsightsData = async () => {
      try {
        // Fetch feedback summary
        const feedbackResponse = await api.get('/feedback');
        const feedbacks = feedbackResponse.data;
        
        const positive = feedbacks.filter(f => f.sentiment === 'positive').length;
        const neutral = feedbacks.filter(f => f.sentiment === 'neutral').length;
        const negative = feedbacks.filter(f => f.sentiment === 'negative').length;
        const total = feedbacks.length;
        
        setFeedbackData({ positive, neutral, negative, total });
        
        // Fetch analytics data for charts
        const analyticsResponse = await api.get('/analytics/summary');
        // Process data for charts as needed
        
      } catch (error) {
        console.error('Error fetching insights data:', error);
      }
    };
    
    fetchInsightsData();
  }, []);

  const getPercentage = (value, total) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center">
          <MdAutoAwesome className="mr-3 text-indigo-500" /> AI Insights
        </h1>
        <p className="text-slate-500 mt-1">AI-powered analysis of client feedback and engagement trends.</p>
      </div>

      {/* Feedback Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Positive Feedback Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <MdSentimentSatisfied className="text-green-600" size={24} />
              </div>
              <h3 className="font-semibold text-slate-700">Positive Feedback</h3>
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-800 mb-1">{feedbackData.positive}</div>
          <div className="text-sm text-slate-500">{getPercentage(feedbackData.positive, feedbackData.total)}% of total</div>
        </div>

        {/* Neutral Feedback Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                <MdSentimentNeutral className="text-yellow-600" size={24} />
              </div>
              <h3 className="font-semibold text-slate-700">Neutral Feedback</h3>
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-800 mb-1">{feedbackData.neutral}</div>
          <div className="text-sm text-slate-500">{getPercentage(feedbackData.neutral, feedbackData.total)}% of total</div>
        </div>

        {/* Negative Feedback Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <MdSentimentDissatisfied className="text-red-600" size={24} />
              </div>
              <h3 className="font-semibold text-slate-700">Negative Feedback</h3>
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-800 mb-1">{feedbackData.negative}</div>
          <div className="text-sm text-slate-500">{getPercentage(feedbackData.negative, feedbackData.total)}% of total</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Satisfaction Comparison Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center">
            <MdTrendingUp className="mr-2 text-indigo-500" />
            Client Satisfaction Comparison
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={clientSatisfactionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="company" 
                tick={{ fill: '#64748b', fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fill: '#64748b', fontSize: 12 }}
                domain={[0, 100]}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
                formatter={(value) => [`${value}%`, 'Satisfaction']}
              />
              <Bar 
                dataKey="satisfaction" 
                fill="#6366f1" 
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Satisfaction Trend Over Time Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center">
            <MdTrendingUp className="mr-2 text-indigo-500" />
            Satisfaction Trend Over Time
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={satisfactionTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                tick={{ fill: '#64748b', fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fill: '#64748b', fontSize: 12 }}
                domain={[0, 100]}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
                formatter={(value) => [`${value}%`, 'Satisfaction']}
              />
              <Line 
                type="monotone" 
                dataKey="satisfaction" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
