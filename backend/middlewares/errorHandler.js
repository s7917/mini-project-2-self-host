module.exports = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  console.error(`[ERROR] ${status} — ${message}`, err.stack);
  res.status(status).json({
    success: false,
    data: null,
    message,
    errors: err.details || null
  });
};
