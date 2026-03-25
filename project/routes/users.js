const express = require('express');
const { getUsers, getUserById, updateUser, patchUser, deleteUser, getCurrentUser } = require('../controllers/userController');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');

const router = express.Router();

router.get('/me', authenticate, getCurrentUser);
router.get('/:id', authenticate, getUserById);
router.put('/:id', authenticate, authorize('admin'), updateUser);
router.patch('/:id', authenticate, patchUser);
router.delete('/:id', authenticate, authorize('admin'), deleteUser);

module.exports = router;