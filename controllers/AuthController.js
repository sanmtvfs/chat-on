const AuthService = require('../services/AuthService');
const { authLimiter } = require('../middleware/rateLimiter');

class AuthController {
  static async register(req, res) {
    try {
      const { username, email, password, dateOfBirth } = req.body;

      const result = await AuthService.register({
        username,
        email,
        password,
        dateOfBirth
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      const result = await AuthService.login(email, password);

      res.status(200).json({
        success: true,
        message: 'User logged in successfully',
        data: result
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }

  static async refreshToken(req, res) {
    try {
      const userId = req.user._id;

      const result = await AuthService.refreshToken(userId);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: result
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = AuthController;
