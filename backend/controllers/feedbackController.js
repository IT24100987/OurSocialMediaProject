const Feedback = require('../models/Feedback');
const Client = require('../models/Client');
const { callClaude } = require('../utils/aiHelper');

// @desc    Get all feedback
// @route   GET /api/feedback
// @access  Private/Admin/Manager
const getFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().populate('clientId', 'name company');
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged-in client's feedback
// @route   GET /api/feedback/my
// @access  Private/Client
const getMyFeedback = async (req, res) => {
  try {
    const client = await Client.findOne({ userId: req.user.id });
    
    if (!client) {
        return res.status(404).json({ message: 'Client profile not found' });
    }

    const feedbacks = await Feedback.find({ clientId: client._id });
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit feedback
// @route   POST /api/feedback
// @access  Private/Client
const createFeedback = async (req, res) => {
  try {
    const { campaignName, rating, comment } = req.body;

    if (!campaignName || !rating) {
      return res.status(400).json({ message: 'Campaign name and rating are required' });
    }

    const client = await Client.findOne({ userId: req.user.id });
    
    if (!client) {
        return res.status(404).json({ message: 'Client profile not found' });
    }

    // AI Logic: Auto-calculate sentiment
    let autoSentiment = 'neutral';
    let aiImprovementSuggestion = '';

    if (comment) {
        try {
            const prompt = `Analyze this client feedback: "${comment}". Based on the text, return exactly one word describing the sentiment: "positive", "neutral", or "negative". Then, add a pipe character "|" followed by a brief, helpful suggestion on how to respond or improve based on the feedback. Example format: positive | Thank the client for their positive response and ask if they'd like to scale the campaign.`;
            
            const aiResponse = await callClaude(prompt);
            const [sentimentResult, suggestion] = aiResponse.split('|').map(s => s.trim());
            
            const cleanSentiment = sentimentResult.toLowerCase().replace(/[^a-z]/g, '');
            if (['positive', 'neutral', 'negative'].includes(cleanSentiment)) {
                autoSentiment = cleanSentiment;
            }
            if(suggestion) aiImprovementSuggestion = suggestion;
            
        } catch (aiError) {
             console.error("AI Feedback Analysis failed", aiError);
        }
    }

    const feedback = await Feedback.create({
      clientId: client._id,
      campaignName,
      rating,
      comment,
      sentiment: autoSentiment,
      aiSuggestion: aiImprovementSuggestion
    });

    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update feedback
// @route   PUT /api/feedback/:id
// @access  Private/Client (only own, under 24 hr)
const updateFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    const client = await Client.findOne({ userId: req.user.id });
    
    if (!client || feedback.clientId.toString() !== client._id.toString()) {
         return res.status(403).json({ message: 'Not authorized to edit this feedback' });
    }

    // Check if 24 hours have passed
    const hoursSinceCreation = Math.abs(new Date() - feedback.createdAt) / 36e5;
    if (hoursSinceCreation > 24) {
         return res.status(400).json({ message: 'Feedback can only be edited within 24 hours of creation' });
    }

    feedback.campaignName = req.body.campaignName || feedback.campaignName;
    feedback.rating = req.body.rating || feedback.rating;
    
    let needsReanalysis = false;
    if (req.body.comment && req.body.comment !== feedback.comment) {
        feedback.comment = req.body.comment;
        needsReanalysis = true;
    }

    // Re-run AI analysis if comment changed
    if (needsReanalysis) {
        try {
            const prompt = `Analyze this updated client feedback: "${feedback.comment}". Return exactly one word describing the sentiment: "positive", "neutral", or "negative", followed by a pipe character "|" and a brief improvement suggestion.`;
            const aiResponse = await callClaude(prompt);
            const [sentimentResult, suggestion] = aiResponse.split('|').map(s => s.trim());
            
            const cleanSentiment = sentimentResult.toLowerCase().replace(/[^a-z]/g, '');
            if (['positive', 'neutral', 'negative'].includes(cleanSentiment)) {
                feedback.sentiment = cleanSentiment;
            }
            if(suggestion) feedback.aiSuggestion = suggestion;
        } catch(e) { console.error("AI logic failed on update", e); }
    }

    feedback.updatedAt = new Date();
    const updatedFeedback = await feedback.save();
    res.json(updatedFeedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete feedback
// @route   DELETE /api/feedback/:id
// @access  Private/Admin or Client owner
const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    if (req.user.role === 'Client') {
        const client = await Client.findOne({ userId: req.user.id });
        if (!client || feedback.clientId.toString() !== client._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this feedback' });
        }
    } else if (req.user.role !== 'Admin') {
         return res.status(403).json({ message: 'Not authorized to delete this feedback' });
    }

    await Feedback.deleteOne({ _id: req.params.id });
    res.json({ message: 'Feedback removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getFeedback,
  getMyFeedback,
  createFeedback,
  updateFeedback,
  deleteFeedback,
};
