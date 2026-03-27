const router = require('express').Router();
const AuthController = require('../controllers/AuthController');
const authenticate = require('../middlewares/authenticate');
const logger = require('../middlewares/logger');
const validate = require('../middlewares/validate');
const { localLoginSchema, localSignupSchema } = require('../utils/validators/authValidator');

router.get('/github', AuthController.githubAuth);
router.get('/github/callback', AuthController.githubCallback);
router.post('/login', validate(localLoginSchema), AuthController.localLogin);
router.post('/signup', validate(localSignupSchema), AuthController.localSignup);
router.get('/demo-users', AuthController.demoUsers);
router.get('/me', authenticate, logger, AuthController.getMe);
router.post('/logout', authenticate, logger, AuthController.logout);

module.exports = router;
