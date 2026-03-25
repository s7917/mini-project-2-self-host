const passport = require('passport');
const { generateToken } = require('../utils/jwt');
const { sendSuccess, sendError } = require('../utils/response');
const LogService = require('../services/LogService');
const UserService = require('../services/UserService');

exports.githubAuth = passport.authenticate('github', { scope: ['user:email'] });

exports.githubCallback = (req, res, next) => {
  passport.authenticate('github', { session: false }, async (err, user) => {
    try {
      if (err || !user) {
        await LogService.logAuth({ user_id: null, provider: 'github', status: 'failure' });
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
      }
      await LogService.logAuth({ user_id: user.id, provider: 'github', status: 'success' });
      const token = generateToken(user);
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    } catch (error) {
      next(error);
    }
  })(req, res, next);
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await UserService.getById(req.user.sub);
    if (!user) return sendError(res, 404, 'User not found');
    sendSuccess(res, 200, user);
  } catch (err) { next(err); }
};

exports.logout = async (req, res, next) => {
  try {
    await LogService.logActivity({
      user_id: req.user.sub,
      action: 'logout',
      module: 'auth',
      metadata: {},
      timestamp: new Date()
    });
    sendSuccess(res, 200, null, 'Logged out successfully');
  } catch (err) { next(err); }
};
