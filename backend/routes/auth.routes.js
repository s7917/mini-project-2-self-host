const router = require('express').Router();
const AuthController = require('../controllers/AuthController');
const authenticate = require('../middlewares/authenticate');
const logger = require('../middlewares/logger');

router.get('/github', AuthController.githubAuth);
router.get('/github/callback', AuthController.githubCallback);
router.get('/me', authenticate, logger, AuthController.getMe);
router.post('/logout', authenticate, logger, AuthController.logout);

module.exports = router;
