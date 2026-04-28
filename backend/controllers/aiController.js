const { callClaude } = require('../utils/aiHelper');

// @desc    General AI chat
// @route   POST /api/ai/chat
// @access  Private
const aiChat = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ message: 'Prompt is required' });

    console.log('🤖 AI Query:', prompt);

    const systemContext = `You are an AI assistant for SpotOn CMS, an Intelligent Content Management System. 

SpotOn CMS Features:
- Multi-role system: Admin, Manager, Staff, Client
- Client management with packages (Silver, Gold, Platinum, Diamond)
- Task management with calendar view and priority tracking
- Payment dashboard and financial tracking
- AI-powered insights and sentiment analysis
- Feedback system with sentiment tracking
- User management with AI role recommendations
- Analytics dashboard with business intelligence

Key Capabilities:
- Admin: Full system access, user management, package management
- Manager: Client management, task assignment, payment oversight
- Staff: Task management, calendar access
- Client: Personal dashboard, feedback submission, analytics

Current Question: "${prompt}"

Please provide a helpful, specific answer about SpotOn CMS based on the context above. If asking general questions, relate them back to how SpotOn CMS handles those scenarios.`;

    const response = await callClaude(systemContext, prompt);
    console.log('✅ AI Response:', response);
    res.json({ response });
  } catch (error) {
    console.log('❌ AI Error:', error.message);
    
    // Only use demo responses as fallback, not as primary
    const { getDemoResponse } = require('../utils/aiHelper');
    const fallbackResponse = getDemoResponse(prompt);
    console.log('🔄 Using fallback response');
    res.json({ response: fallbackResponse });
  }
};

// @desc    Analyze feedback sentiment
// @route   POST /api/ai/sentiment
// @access  Private
const aiSentiment = async (req, res) => {
  try {
    const { text, rating } = req.body;
    if (!text) return res.status(400).json({ message: 'Text is required' });

    const prompt = `Analyze this client feedback (rating: ${rating || 'not provided'}/5): "${text}".
Return a JSON object with exactly two fields:
1. "sentiment": one word - "positive", "neutral", or "negative"
2. "suggestions": one paragraph of 2-3 actionable suggestions for the business based on this feedback.
Return only the raw JSON object, no markdown or code blocks.`;
    const raw = await callClaude(prompt);

    // Try to parse JSON; fall back to plain string response
    try {
      const parsed = JSON.parse(raw);
      res.json(parsed);
    } catch {
      // If Claude didn't return JSON, extract just the sentiment word
      const sentimentMatch = raw.toLowerCase().match(/positive|neutral|negative/);
      res.json({
        sentiment: sentimentMatch ? sentimentMatch[0] : 'neutral',
        suggestions: raw.trim()
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Recommend best role
// @route   POST /api/ai/role-recommend
// @access  Private/Admin
const aiRoleRecommend = async (req, res) => {
  try {
    const { description } = req.body;
    if (!description) return res.status(400).json({ message: 'Description is required' });

    const prompt = `Based on this user description: "${description}", what is the best role from ['Admin', 'Manager', 'Staff', 'Client']? Just return the role name.`;
    const response = await callClaude(prompt);
    res.json({ role: response.trim().replace(/[^a-zA-Z]/g, '') });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Explain role permissions
// @route   POST /api/ai/permission-explain
// @access  Private/Admin
const aiPermissionExplain = async (req, res) => {
  try {
    const { role } = req.body;
    if (!role) return res.status(400).json({ message: 'Role is required' });

    const prompt = `Explain in one short paragraph what a user with the role "${role}" can access and do in a MERN stack management system.`;
    const response = await callClaude(prompt);
    res.json({ explanation: response.trim() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Detect recurring trends
// @route   POST /api/ai/trends
// @access  Private/Admin/Manager
const aiTrends = async (req, res) => {
  try {
    const { feedbacks } = req.body;
    if (!feedbacks || !Array.isArray(feedbacks)) return res.status(400).json({ message: 'Array of feedback texts is required' });

    const textToAnalyze = feedbacks.join(' | ');
    const prompt = `Analyze these feedback comments: ${textToAnalyze}. Detect the recurring trends, issues, or strengths. Present your findings as 3-4 short, punchy bullet points.`;
    const response = await callClaude(prompt);
    res.json({ trends: response });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate suggestions
// @route   POST /api/ai/suggestions
// @access  Private/Admin/Manager
const aiSuggestions = async (req, res) => {
  try {
    const { context } = req.body;
    const prompt = `Based on the current system context: ${context || 'general client management'}. Generate 3 actionable recommendations on how to improve client satisfaction and campaign performance. Return as a plain text list.`;
    const response = await callClaude(prompt);
    res.json({ suggestions: response });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Monthly summary
// @route   POST /api/ai/monthly-summary
// @access  Private/Admin/Manager
const aiMonthlySummary = async (req, res) => {
  try {
    const { data } = req.body;
    const prompt = `Write a comprehensive, professional monthly client satisfaction summary paragraph based on this data: ${JSON.stringify(data)}. Focus on key metrics and overall sentiment.`;
    const response = await callClaude(prompt);
    res.json({ summary: response });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Analytics insight
// @route   POST /api/ai/analytics-insight
// @access  Private/Admin/Manager/Client
const aiAnalyticsInsight = async (req, res) => {
  try {
    // Accept both 'analytics' (from frontend) and 'data' for backwards compat
    const payload = req.body.analytics || req.body.data;
    if (!payload) return res.status(400).json({ message: 'Analytics data is required' });
    const prompt = `Analyze this campaign analytics data: ${JSON.stringify(payload)}. Provide actionable insights in 4-5 bullet points highlighting trends, strengths, and areas for improvement.`;
    const response = await callClaude(prompt);
    res.json({ insights: response });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  aiChat,
  aiSentiment,
  aiRoleRecommend,
  aiPermissionExplain,
  aiTrends,
  aiSuggestions,
  aiMonthlySummary,
  aiAnalyticsInsight,
};
