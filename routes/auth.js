const express = require('express');
const AuthService = require('../services/AuthService');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res, next) => {
  try {
    const { username, email, password, dateOfBirth } = req.body;

    if (!username || !email || !password || !dateOfBirth) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await AuthService.register({ username, email, password, dateOfBirth });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await AuthService.login(email, password);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Refresh token
router.post('/refresh', authMiddleware, async (req, res, next) => {
  try {
    const tokens = await AuthService.refreshToken(req.userId);
    res.json(tokens);
  } catch (error) {
    next(error);
  }
});

// Verify token
router.get('/verify', authMiddleware, (req, res) => {
  res.json({ valid: true, userId: req.userId });
});

module.exports = router;
