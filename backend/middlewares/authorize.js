const { sendError } = require('../utils/response');

module.exports = (...allowedRoles) => (req, res, next) => {
  if (!allowedRoles.includes(req.user.role)) {
    return sendError(res, 403, 'Access denied: insufficient role');
  }
  next();
};
