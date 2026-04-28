const express = require('express');
const router = express.Router();
const {
  getAnalytics,
  getAnalyticsSummary,
  getClientAnalytics,
  getMonthlyAnalytics,
  createAnalytics,
  updateAnalytics,
  deleteAnalytics,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/summary', authorize('Admin', 'Manager'), getAnalyticsSummary);
router.get('/client/:clientId', getClientAnalytics);
router.get('/monthly/:month', authorize('Admin', 'Manager'), getMonthlyAnalytics);

router.route('/')
  .get(authorize('Admin', 'Manager'), getAnalytics)
  .post(authorize('Admin', 'Manager'), createAnalytics);

router.route('/:id')
  .put(authorize('Admin', 'Manager'), updateAnalytics)
  .delete(authorize('Admin', 'Manager'), deleteAnalytics);

module.exports = router;
