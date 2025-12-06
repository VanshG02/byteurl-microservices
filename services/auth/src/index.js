// src/index.js
const express = require('express');
const cors = require('cors');
const { PORT, CLIENT_ORIGIN, JWT_SECRET} = require('./config');
const { connectMongo } = require('./mongo');
const authRoutes = require('./routes/auth'); 
const { requestLogger } = require('./middleware/requestLogger');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(requestLogger);

// Routes
app.get('/auth/health', (req, res) => {
  res.json({ status: 'ok', service: 'auth' });
});

app.use('/auth', authRoutes);

// Start server only after Mongo connection
connectMongo()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[auth] Service listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[auth] Failed to start service due to Mongo error');
    process.exit(1);
  });
