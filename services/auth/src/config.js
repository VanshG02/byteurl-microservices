// src/config.js
const path = require('path');
const dotenv = require('dotenv');

// Load env from project root .env
dotenv.config({ path: path.join(__dirname, '..', '..','..','.env') });

const PORT = process.env.PORT_AUTH || 5001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/byteurl';
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
// const JWT_SECRET = 'byteurl_dev_secret_123';

module.exports = {
  PORT,
  MONGO_URI,
  CLIENT_ORIGIN,
};
