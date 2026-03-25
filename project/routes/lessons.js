const express = require('express');
const { getLessons, getLessonById, createLesson, updateLesson, patchLesson, deleteLesson } = require('../controllers/lessonController');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');

const router = express.Router();

router.get('/', authenticate, getLessons);
router.get('/:id', authenticate, getLessonById);
router.post('/', authenticate, authorize('instructor', 'admin'), createLesson);
router.put('/:id', authenticate, authorize('instructor', 'admin'), updateLesson);
router.patch('/:id', authenticate, authorize('instructor', 'admin'), patchLesson);
router.delete('/:id', authenticate, authorize('instructor', 'admin'), deleteLesson);

module.exports = router;