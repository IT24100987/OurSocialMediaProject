const express = require('express');
const router = express.Router();
const {
  aiChat,
  aiSentiment,
  aiRoleRecommend,
  aiPermissionExplain,
  aiTrends,
  aiSuggestions,
  aiMonthlySummary,
  aiAnalyticsInsight,
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.post('/chat', aiChat);
router.post('/sentiment', aiSentiment);
router.post('/analytics-insight', aiAnalyticsInsight);

router.post('/role-recommend', authorize('Admin'), aiRoleRecommend);
router.post('/permission-explain', authorize('Admin'), aiPermissionExplain);

router.post('/trends', authorize('Admin', 'Manager'), aiTrends);
router.post('/suggestions', authorize('Admin', 'Manager'), aiSuggestions);
router.post('/monthly-summary', authorize('Admin', 'Manager'), aiMonthlySummary);

module.exports = router;
