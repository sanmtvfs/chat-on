const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { authLimiter } = require('../middleware/rateLimiter');
const { validateRegister, validateLogin } = require('../middleware/validation');

// Public routes
router.post('/register', authLimiter, validateRegister, AuthController.register);
router.post('/login', authLimiter, validateLogin, AuthController.login);

// Protected routes
router.post('/refresh-token', require('../middleware/auth'), AuthController.refreshToken);

module.exports = router;
