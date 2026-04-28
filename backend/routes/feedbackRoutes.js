const express = require('express');
const router = express.Router();
const {
  getFeedback,
  getMyFeedback,
  createFeedback,
  updateFeedback,
  deleteFeedback,
} = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.route('/')
  .get(authorize('Admin', 'Manager'), getFeedback)
  .post(authorize('Client'), createFeedback);

router.get('/my', authorize('Client'), getMyFeedback);

router.route('/:id')
  .put(authorize('Client'), updateFeedback)
  .delete(deleteFeedback); // controller handles Admin/Owner logic internally

module.exports = router;
