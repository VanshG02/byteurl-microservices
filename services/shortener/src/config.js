// src/config.js
const path = require('path');
const dotenv = require('dotenv');

// Load env from project root .env
dotenv.config({ path: path.join(__dirname, '..', '..','..','.env') });

const PORT = process.env.PORT_SHORTENER || 5002;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/byteurl';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
// const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
// const JWT_SECRET = 'byteurl_dev_secret_123';
module.exports = {
  PORT,
  MONGO_URI,
  REDIS_URL,
  CLIENT_ORIGIN,
};
