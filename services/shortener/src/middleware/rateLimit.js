// src/middleware/rateLimit.js
const { getRedisClient } = require('../redisClient');

// windowMs: e.g. 60000 = 1 minute
// max: allowed number of requests per window
function createRateLimiter({ windowMs, max }) {
  return async function rateLimit(req, res, next) {
    try {
      const redis = getRedisClient();

      // Use userId if logged in (which we are), fallback to IP
      const userId = req.user?.userId || req.ip || 'anonymous';
      const key = `rl:${userId}`;

      // Increment the counter for this user
      const current = await redis.incr(key);

      if (current === 1) {
        // First request in this window → set TTL
        await redis.pexpire(key, windowMs);
      }

      if (current > max) {
        const retryAfterSec = Math.ceil(windowMs / 1000);
        res.set('Retry-After', String(retryAfterSec));
        return res
          .status(429)
          .json({ error: 'Too many requests. Please try again later.' });
      }

      // Within limit → continue
      return next();
    } catch (err) {
      console.error('[shortener] rateLimit error:', err);
      // Fail-open: if Redis is down, don’t block traffic
      return next();
    }
  };
}

module.exports = {
  createRateLimiter,
};
