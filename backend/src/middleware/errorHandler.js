export function notFoundHandler(_req, res) {
  res.status(404).json({ success: false, message: 'Route not found', error: { code: 'NOT_FOUND' } });
}

export function errorHandler(error, _req, res, _next) {
  const status = Number.isInteger(error.status) ? error.status : 500;
  const code = error.code || (status === 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR');
  res.status(status).json({
    success: false,
    message: status === 500 ? 'An unexpected server error occurred' : error.message,
    error: { code }
  });
}
