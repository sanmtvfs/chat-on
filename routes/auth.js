const express = require('express');
const router = express.Router();
const AuthService = require('../services/AuthService');

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, dateOfBirth } = req.body;

    if (!username || !email || !password || !dateOfBirth) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const result = await AuthService.register({
      username,
      email,
      password,
      dateOfBirth
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const result = await AuthService.login(email, password);

    res.status(200).json(result);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID required' });
    }

    const tokens = await AuthService.refreshToken(userId);

    res.status(200).json(tokens);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

module.exports = router;
