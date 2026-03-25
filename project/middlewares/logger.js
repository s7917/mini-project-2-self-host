const ActivityLog = require('../models/ActivityLog');

const logger = (req, res, next) => {
  // Log after response
  res.on('finish', async () => {
    try {
      const logEntry = {
        action: `${req.method} ${req.originalUrl}`,
        module: req.baseUrl || req.path,
        metadata: {
          statusCode: res.statusCode,
          authenticated: Boolean(req.user?.id)
        }
      };

      if (req.user?.id) {
        logEntry.user_id = req.user.id;
      }

      await ActivityLog.create(logEntry);
    } catch (error) {
      console.error('Logging error:', error);
    }
  });
  next();
};

module.exports = logger;
