const express = require('express');
const ModerationService = require('../services/ModerationService');
const User = require('../models/User');
const adminMiddleware = require('../middleware/admin');

const router = express.Router();

// Warn user (admin only)
router.post('/warn/:userId', adminMiddleware, async (req, res, next) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'Reason is required' });
    }

    const user = await ModerationService.warnUser(req.params.userId, reason);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Ban user (admin only)
router.post('/ban/:userId', adminMiddleware, async (req, res, next) => {
  try {
    const { reason, days } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'Reason is required' });
    }

    const user = await ModerationService.banUser(req.params.userId, reason, days);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Unban user (admin only)
router.post('/unban/:userId', adminMiddleware, async (req, res, next) => {
  try {
    const user = await ModerationService.unbanUser(req.params.userId);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Get all users (admin only)
router.get('/users', adminMiddleware, async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// Get user by ID (admin only)
router.get('/users/:userId', adminMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
