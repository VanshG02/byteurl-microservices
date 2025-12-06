// src/redisClient.js
const Redis = require('ioredis');
const { REDIS_URL } = require('./config');

let redis;

function getRedisClient() {
  if (!redis) {
    redis = new Redis(REDIS_URL);
    redis.on('connect', () => console.log('[shortener] Redis connected:', REDIS_URL));
    redis.on('error', (err) => console.error('[shortener] Redis error:', err.message));
  }
  return redis;
}

module.exports = { getRedisClient };
