const express = require('express');
const router = express.Router();
const { getProjects, createProject, updateProject, deleteProject, getProjectProgress } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getProjects).post(protect, createProject);
router.route('/:id').put(protect, updateProject).delete(protect, deleteProject);

router.get('/:id/progress', protect, getProjectProgress);

module.exports = router;