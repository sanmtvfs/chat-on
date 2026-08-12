const express = require('express');
const UserService = require('../services/UserService');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for avatar upload
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

// Get user profile
router.get('/profile', async (req, res, next) => {
  try {
    const user = await UserService.getUserProfile(req.userId);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put('/profile', async (req, res, next) => {
  try {
    const { username, bio } = req.body;
    const user = await UserService.updateUserProfile(req.userId, { username, bio });
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Upload avatar
router.post('/avatar', upload.single('avatar'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const user = await UserService.uploadAvatar(req.userId, req.file);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Block user
router.post('/block/:blockedUserId', async (req, res, next) => {
  try {
    const user = await UserService.blockUser(req.userId, req.params.blockedUserId);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Unblock user
router.post('/unblock/:blockedUserId', async (req, res, next) => {
  try {
    const user = await UserService.unblockUser(req.userId, req.params.blockedUserId);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Get blocked users
router.get('/blocked', async (req, res, next) => {
  try {
    const blockedUsers = await UserService.getBlockedUsers(req.userId);
    res.json(blockedUsers);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
