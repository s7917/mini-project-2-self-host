const express = require('express');
const { getModules, getModuleById, createModule, updateModule, patchModule, deleteModule } = require('../controllers/moduleController');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');

const router = express.Router();

router.get('/', authenticate, getModules);
router.get('/:id', authenticate, getModuleById);
router.post('/', authenticate, authorize('instructor', 'admin'), createModule);
router.put('/:id', authenticate, authorize('instructor', 'admin'), updateModule);
router.patch('/:id', authenticate, authorize('instructor', 'admin'), patchModule);
router.delete('/:id', authenticate, authorize('instructor', 'admin'), deleteModule);

module.exports = router;