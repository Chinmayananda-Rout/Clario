const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createTask, getTasks, updateTask, deleteTask } = require('../controllers/taskController');

router.use(protect);

router.route('/')
    .post(createTask)
    .get(getTasks);

router.route('/:id')
    .put(updateTask)
    .delete(deleteTask);

module.exports = router;