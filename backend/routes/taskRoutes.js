const express = require('express');
const router = express.Router();
const {
  getTasks,
  getMyTasks,
  getTasksByMonth,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.route('/')
  .get(authorize('Admin', 'Manager'), getTasks)
  .post(authorize('Admin', 'Manager'), createTask);

router.get('/my', authorize('Staff'), getMyTasks);
router.get('/calendar/:month', getTasksByMonth); // Access rules handled in controller

router.route('/:id')
  .put(updateTask) // Access rules handled in controller based on role
  .delete(authorize('Admin', 'Manager'), deleteTask);

module.exports = router;
