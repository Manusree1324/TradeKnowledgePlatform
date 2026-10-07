const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    Check health status of the Express server and MongoDB connection
 * @access  Public
 */
router.get('/health', (req, res) => {
  const dbStateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  const dbState = dbStateMap[mongoose.connection.readyState] || 'unknown';

  const databaseStatus = dbStateMap[mongoose.connection.readyState] || 'unknown';
  res.status(200).json({
    status: databaseStatus === 'connected' ? 'ready' : 'degraded',
    app: 'Skilled Trade Knowledge Documentation Platform',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())} seconds`,
    database: {
      status: databaseStatus,
      configured: Boolean(process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('<username>'))
    }
  });
});

module.exports = router;
