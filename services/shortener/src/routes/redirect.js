// src/routes/redirect.js
const express = require('express');
const Url = require('../models/Url');
const { getRedisClient } = require('../redisClient');

const router = express.Router();

router.get('/:code', async (req, res) => {
  const { code } = req.params;
  const redis = getRedisClient();

  try {
    // Try cache first
    const cached = await redis.get(`short:${code}`);
    if (cached) {
      // we don't have linkType/expiry in cache yet → fetch doc to handle clicks/expiry
      const urlDoc = await Url.findOne({ shortCode: code });

      if (!urlDoc) {
        return res.status(404).send('Link not found');
      }

      // expiry checks
      const now = new Date();
      if (urlDoc.expiryDate && urlDoc.expiryDate < now) {
        return res.status(410).send('This link has expired');
      }
      if (urlDoc.maxClicks !== null && urlDoc.clickCount >= urlDoc.maxClicks) {
        return res.status(410).send('This link has reached its click limit');
      }

      urlDoc.clickCount += 1;
      await urlDoc.save();

      return res.redirect(cached);
    }

    // Cache miss → look in Mongo
    const urlDoc = await Url.findOne({ shortCode: code });

    if (!urlDoc) {
      return res.status(404).send('Link not found');
    }

    const now = new Date();
    if (urlDoc.expiryDate && urlDoc.expiryDate < now) {
      return res.status(410).send('This link has expired');
    }
    if (urlDoc.maxClicks !== null && urlDoc.clickCount >= urlDoc.maxClicks) {
      return res.status(410).send('This link has reached its click limit');
    }

    urlDoc.clickCount += 1;
    await urlDoc.save();

    // cache for next time
    await redis.set(`short:${code}`, urlDoc.longUrl);

    return res.redirect(urlDoc.longUrl);
  } catch (err) {
    console.error('[shortener] redirect error:', err);
    return res.status(500).send('Internal server error');
  }
});

module.exports = router;
