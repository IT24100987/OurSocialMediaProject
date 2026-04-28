const Task = require('../models/Task');

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private/Admin/Manager
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('assignedTo', 'name')
      .populate('assignedBy', 'name')
      .populate('clientId', 'name company');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my tasks (logged in Staff)
// @route   GET /api/tasks/my
// @access  Private/Staff
const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user.id })
      .populate('assignedBy', 'name')
      .populate('clientId', 'name company');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get tasks for a specific calendar month
// @route   GET /api/tasks/calendar/:month
// @access  Private
const getTasksByMonth = async (req, res) => {
  try {
    const { month } = req.params; // Expecting format 'YYYY-MM'
    
    let query = { calendarMonth: month };

    // Staff can only see their own tasks
    if (req.user.role === 'Staff') {
        query.assignedTo = req.user.id;
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name')
      .populate('clientId', 'name');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create task
// @route   POST /api/tasks
// @access  Private/Admin/Manager
const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, clientId, priority, dueDate, googleDriveLink } = req.body;

    if (!title || !assignedTo || !dueDate) {
      return res.status(400).json({ message: 'Title, Assigned To, and Due Date are required' });
    }

    // Calculate calendarMonth string based on dueDate
    const dateObj = new Date(dueDate);
    const calendarMonth = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;

    const task = await Task.create({
      title,
      description,
      assignedTo,
      assignedBy: req.user.id,
      clientId: clientId || null,
      priority: priority || 'Medium',
      dueDate,
      googleDriveLink,
      calendarMonth
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private (Staff can update status, Manager/Admin can update all)
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.user.role === 'Staff') {
        if (task.assignedTo.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this task' });
        }
        // Staff can only update status
        task.status = req.body.status || task.status;
    } else {
        // Admin or Manager
        task.title = req.body.title || task.title;
        task.description = req.body.description || task.description;
        task.assignedTo = req.body.assignedTo || task.assignedTo;
        task.clientId = req.body.clientId || task.clientId;
        task.status = req.body.status || task.status;
        task.priority = req.body.priority || task.priority;
        task.googleDriveLink = req.body.googleDriveLink || task.googleDriveLink;

        if (req.body.dueDate) {
            task.dueDate = req.body.dueDate;
            const dateObj = new Date(req.body.dueDate);
            task.calendarMonth = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
        }
    }

    task.updatedAt = new Date();
    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private/Admin/Manager
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await Task.deleteOne({ _id: req.params.id });
    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTasks,
  getMyTasks,
  getTasksByMonth,
  createTask,
  updateTask,
  deleteTask,
};
