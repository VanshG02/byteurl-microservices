// src/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
      index: true,
      trim: true,
      lowercase: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    // Later we can add plan, maxUrls, etc.
  },
  {
    collection: 'users'
  }
);

const User = mongoose.model('User', UserSchema);

module.exports = User;
