export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  const status = err.status || 500;
  const message = status >= 500 ? "Internal server error" : err.message;
  if (status >= 500) {
    try {
      console.error(err);
    } catch (logErr) {
      try {
        console.error('Error while logging error:', JSON.stringify(err));
      } catch {
        console.error('Error while logging error: (unable to stringify)');
      }
    }
  }
  res.status(status).json({ error: message });
}
