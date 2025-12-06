// src/mongo.js
const mongoose = require('mongoose');
const { MONGO_URI } = require('./config');

let isConnected = false;

async function connectMongo() {
  if (isConnected) return mongoose.connection;

  try {
    await mongoose.connect(MONGO_URI);
    isConnected = true;
    console.log('[auth] Mongo connected:', MONGO_URI);
    return mongoose.connection;
  } catch (err) {
    console.error('[auth] Mongo connection error:', err.message);
    throw err;
  }
}

module.exports = { connectMongo };
