// src/index.js
const express = require('express');
const cors = require('cors');
const { PORT, CLIENT_ORIGIN, JWT_SECRET} = require('./config');
const { connectMongo } = require('./mongo');
const { getRedisClient } = require('./redisClient');
const { requestLogger } = require('./middleware/requestLogger');

const shortenRoutes = require('./routes/shorten');
const redirectRoutes = require('./routes/redirect');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(requestLogger);
// Health route
app.get('/shortener/health', async (req, res) => {
  try {
    const redis = getRedisClient();
    // simple ping to redis
    await redis.ping();
    return res.json({
      status: 'ok',
      service: 'shortener',
      redis: true
    });
  } catch (err) {
    console.error('[shortener] health error:', err.message);
    return res.status(500).json({
      status: 'error',
      service: 'shortener',
      redis: false
    });
  }
});

// Mount API routes
app.use('/api', shortenRoutes); // -> /api/shorten
app.use('/', redirectRoutes);   // -> /:code

// Start server only after Mongo connection
connectMongo()
  .then(() => {
    // init redis once on startup
    getRedisClient();

    app.listen(PORT, () => {
      console.log(`[shortener] Service listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[shortener] Failed to start service due to Mongo error');
    process.exit(1);
  });
