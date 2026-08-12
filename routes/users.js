const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const auth = require('../middleware/auth');
const { upload } = require('../middleware/multer');
const { validateUpdateProfile } = require('../middleware/validation');

// Protected routes
router.get('/profile/:id', auth, UserController.getProfile);
router.get('/profile', auth, UserController.getProfile);
router.put('/profile', auth, validateUpdateProfile, UserController.updateProfile);
router.post('/avatar', auth, upload.single('avatar'), UserController.uploadAvatar);

// Block/Unblock routes
router.post('/block', auth, UserController.blockUser);
router.post('/unblock', auth, UserController.unblockUser);
router.get('/blocked-users', auth, UserController.getBlockedUsers);

module.exports = router;
