// services/shortener/src/middleware/requestLogger.js
const { randomUUID } = require('crypto');

function requestLogger(req, res, next) {
  const start = Date.now();
  const incomingId = req.headers['x-request-id'];
  const requestId = incomingId || randomUUID();

  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);

  res.on('finish', () => {
    const duration = Date.now() - start;
    const userId = req.user?.userId || '-';
    console.log(
      `[shortener] [${requestId}] ${req.method} ${req.originalUrl} ` +
      `${res.statusCode} user=${userId} ${duration}ms`
    );
  });

  next();
}

module.exports = {
  requestLogger,
};
