const express = require('express');
const router = express.Router();
const {
  getPayments,
  getPaymentStats,
  getClientPayments,
  createPayment,
  updatePayment,
  deletePayment,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/stats', authorize('Admin', 'Manager'), getPaymentStats);
router.get('/client/:clientId', getClientPayments);

router.route('/')
  .get(authorize('Admin', 'Manager'), getPayments)
  .post(authorize('Admin', 'Manager'), createPayment);

router.route('/:id')
  .put(authorize('Admin', 'Manager'), updatePayment)
  .delete(authorize('Admin'), deletePayment);

module.exports = router;
