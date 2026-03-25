const express = require('express');
const { getPerformances, getPerformanceById, createPerformance, updatePerformance, patchPerformance, deletePerformance } = require('../controllers/performanceController');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');

const router = express.Router();

router.get('/', authenticate, getPerformances);
router.get('/:id', authenticate, getPerformanceById);
router.post('/', authenticate, authorize('learner', 'admin'), createPerformance);
router.put('/:id', authenticate, authorize('learner', 'admin'), updatePerformance);
router.patch('/:id', authenticate, authorize('learner', 'admin'), patchPerformance);
router.delete('/:id', authenticate, authorize('learner', 'admin'), deletePerformance);

module.exports = router;