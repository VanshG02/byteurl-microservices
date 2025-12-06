// src/models/Url.js
const mongoose = require('mongoose');

const UrlSchema = new mongoose.Schema(
  {
    shortCode: {
      type: String,
      unique: true,
      required: true,
      index: true
    },
    longUrl: {
      type: String,
      required: true
    },
    userId: {
      type: String, // later we’ll store auth userId here
      default: null,
      index: true
    },
    linkType: {
      type: String,
      enum: ['standard', 'temporary', 'one-time'],
      default: 'standard'
    },
    // NEW: if set and in the past → link expired
    expiryDate: {
      type: Date,
      default: null
    },
    // NEW: if set and clickCount >= maxClicks → link disabled
    maxClicks: {
      type: Number,
      default: null
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    clickCount: {
      type: Number,
      default: 0
    }
    // later: expiryType, expiryDate, maxClicks, linkType, etc.
  },
  {
    collection: 'urls'
  }
);

const Url = mongoose.model('Url', UrlSchema);

module.exports = Url;
