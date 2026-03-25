const express = require('express');
const { getEnrollments, getEnrollmentById, createEnrollment, updateEnrollment, patchEnrollment, deleteEnrollment } = require('../controllers/enrollmentController');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');

const router = express.Router();

router.get('/', authenticate, getEnrollments);
router.get('/:id', authenticate, getEnrollmentById);
router.post('/', authenticate, authorize('learner', 'admin'), createEnrollment);
router.put('/:id', authenticate, authorize('instructor', 'admin'), updateEnrollment);
router.patch('/:id', authenticate, authorize('instructor', 'admin'), patchEnrollment);
router.delete('/:id', authenticate, authorize('instructor', 'admin'), deleteEnrollment);

module.exports = router;