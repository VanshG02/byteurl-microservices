// src/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const path = require('path'); 
const {SECRET} = require(path.join(__dirname, '..', '..', '..','..','shared', 'jwtSecret'));
const router = express.Router();

// Helper: create JWT payload
function createToken(user) {
  const payload = {
    userId: user._id.toString(),
    email: user.email
  };

    const token = jwt.sign(payload, SECRET, { expiresIn: '7d' });
  console.log('[auth] created token (first 30):', token.slice(0, 30));
  return token;
}

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    // check if user exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'email already registered' });
    }

    // hash password
    const hash = await bcrypt.hash(password, 10); // cost factor 10 for dev

    const user = new User({
      email,
      passwordHash: hash
    });

    await user.save();

    const token = createToken(user);

    return res.status(201).json({
      userId: user._id,
      email: user.email,
      token
    });
  } catch (err) {
    console.error('[auth] /register error:', err);
    return res.status(500).json({ error: 'internal server error' });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // don't leak if email exists or not
      return res.status(401).json({ error: 'invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'invalid credentials' });
    }

    const token = createToken(user);

    return res.json({
      userId: user._id,
      email: user.email,
      token
    });
  } catch (err) {
    console.error('[auth] /login error:', err);
    return res.status(500).json({ error: 'internal server error' });
  }
});

// GET /auth/me (for frontend to fetch current user)
router.get('/me', (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: 'missing token' });
    }

    try {
      const payload = jwt.verify(token, SECRET);
      return res.json({ userId: payload.userId, email: payload.email });
    } catch (err) {
        console.error('[auth] /me token error:', err.message);
        return res.status(401).json({ error: 'invalid token' });
    }
  } catch (err) {
    console.error('[auth] /me error:', err);
    return res.status(500).json({ error: 'internal server error' });
  }
});

module.exports = router;
