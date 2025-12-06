// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const path = require('path');

// const { JWT_SECRET } = require('../config');
const { SECRET } = require(path.join(__dirname, '..', '..', '..', '..', 'shared', 'jwtSecret'));
// Require a valid JWT. If missing/invalid => 401.
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'missing token' });
  }
  try {
    const payload = jwt.verify(token, SECRET);
    req.user = {
      userId: payload.userId,
      email: payload.email
    };
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'invalid token' });
  }
}

module.exports = { requireAuth };
