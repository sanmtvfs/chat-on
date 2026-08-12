const express = require('express');
const router = express.Router();
const UserService = require('../services/UserService');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Multer configuration for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await UserService.getUserProfile(req.userId);
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { username, bio } = req.body;
    const user = await UserService.updateUserProfile(req.userId, { username, bio });
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Upload avatar
router.post('/avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await UserService.uploadAvatar(req.userId, req.file);
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Block user
router.post('/block/:blockedUserId', authenticateToken, async (req, res) => {
  try {
    const { blockedUserId } = req.params;
    const user = await UserService.blockUser(req.userId, blockedUserId);
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Unblock user
router.post('/unblock/:blockedUserId', authenticateToken, async (req, res) => {
  try {
    const { blockedUserId } = req.params;
    const user = await UserService.unblockUser(req.userId, blockedUserId);
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get blocked users
router.get('/blocked', authenticateToken, async (req, res) => {
  try {
    const blockedUsers = await UserService.getBlockedUsers(req.userId);
    res.status(200).json(blockedUsers);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
