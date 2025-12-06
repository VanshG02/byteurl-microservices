// src/routes/shorten.js
const express = require('express');
const { nanoid } = require('nanoid');
const Url = require('../models/Url');
const { getRedisClient } = require('../redisClient');
const { requireAuth } = require('../middleware/auth'); 
const { createRateLimiter } = require('../middleware/rateLimit');

const router = express.Router();

const shortenRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 20,
});
// POST /api/shorten
// Body: { "longUrl": "https://example.com" }

// GET /api/my-urls
// Returns all URLs created by the logged-in user
router.get('/my-urls', requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const urls = await Url.find({ userId })
      .sort({ createdAt: -1 }) // newest first
      .lean();

    // Shape the response a bit
    const result = urls.map((u) => ({
      id: u._id,
      shortCode: u.shortCode,
      shortUrl: `http://localhost:8080/${u.shortCode}`,
      longUrl: u.longUrl,
      clickCount: u.clickCount,
      createdAt: u.createdAt,
      linkType: u.linkType,
      expiryDate: u.expiryDate
    }));

    return res.json({ urls: result });
  } catch (err) {
    console.error('[shortener] /api/my-urls error:', err);
    return res.status(500).json({ error: 'internal server error' });
  }
});


router.post('/shorten', requireAuth, shortenRateLimiter, async (req, res) => {
  try {
    const { longUrl, mode} = req.body || {};

    console.log('[shortener] /api/shorten body:', req.body);

    if (!longUrl || typeof longUrl !== 'string') {
      return res.status(400).json({ error: 'longUrl is required' });
    }

        // default settings
    let linkType = 'standard';
    let expiryDate = null;
    let maxClicks = null;

    const now = Date.now();

    switch (mode) {
      case '7d':
        linkType = 'temporary';
        expiryDate = new Date(now + 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        linkType = 'temporary';
        expiryDate = new Date(now + 30 * 24 * 60 * 60 * 1000);
        break;
      case 'one-time':
        linkType = 'one-time';
        maxClicks = 1;
        break;
      case 'standard':
      default:
        linkType = 'standard';
        expiryDate = null;
        maxClicks = null;
        break;
    }
    // generate short code
    const shortCode = nanoid(7); // 7 characters

    // TODO later: use req.user?.userId once we add auth middleware
    const urlDoc = new Url({
      shortCode,
      longUrl,
      userId: req.user.userId,
      linkType,
      expiryDate,
      maxClicks
    });

    await urlDoc.save();

    // cache in Redis
    const redis = getRedisClient();
    await redis.set(`short:${shortCode}`, longUrl);

    // 20 requests per minute per user
    // For now we keep base as shortener service URL itself
    const shortUrl = `http://localhost:8080/${shortCode}`;

    return res.status(201).json({shortCode,shortUrl,linkType, expiryDate, maxClicks});
  } catch (err) {
    console.error('[shortener] /api/shorten error:', err);
    return res.status(500).json({ error: 'internal server error' });
  }
});

module.exports = router;
