const express = require('express');
const { getCourses, getCourseById, createCourse, updateCourse, patchCourse, deleteCourse } = require('../controllers/courseController');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');

const router = express.Router();

router.get('/', authenticate, getCourses);
router.get('/:id', authenticate, getCourseById);
router.post('/', authenticate, authorize('instructor', 'admin'), createCourse);
router.put('/:id', authenticate, authorize('instructor', 'admin'), updateCourse);
router.patch('/:id', authenticate, authorize('instructor', 'admin'), patchCourse);
router.delete('/:id', authenticate, authorize('instructor', 'admin'), deleteCourse);

module.exports = router;