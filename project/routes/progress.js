const express = require('express');
const { getProgress, getProgressById, createProgress, updateProgress, patchProgress, deleteProgress } = require('../controllers/progressController');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');

const router = express.Router();

router.get('/', authenticate, getProgress);
router.get('/:id', authenticate, getProgressById);
router.post('/', authenticate, authorize('learner', 'admin'), createProgress);
router.put('/:id', authenticate, authorize('learner', 'admin'), updateProgress);
router.patch('/:id', authenticate, authorize('learner', 'admin'), patchProgress);
router.delete('/:id', authenticate, authorize('learner', 'admin'), deleteProgress);

module.exports = router;