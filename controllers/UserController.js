const UserService = require('../services/UserService');

class UserController {
  static async getProfile(req, res) {
    try {
      const userId = req.params.id || req.user._id;

      const user = await UserService.getUserProfile(userId);

      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  static async updateProfile(req, res) {
    try {
      const userId = req.user._id;
      const { username, bio } = req.body;

      const user = await UserService.updateUserProfile(userId, {
        username,
        bio
      });

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: user
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  static async uploadAvatar(req, res) {
    try {
      const userId = req.user._id;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file provided'
        });
      }

      const user = await UserService.uploadAvatar(userId, req.file);

      res.status(200).json({
        success: true,
        message: 'Avatar uploaded successfully',
        data: user
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  static async blockUser(req, res) {
    try {
      const userId = req.user._id;
      const { blockedUserId } = req.body;

      const user = await UserService.blockUser(userId, blockedUserId);

      res.status(200).json({
        success: true,
        message: 'User blocked successfully',
        data: user
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  static async unblockUser(req, res) {
    try {
      const userId = req.user._id;
      const { blockedUserId } = req.body;

      const user = await UserService.unblockUser(userId, blockedUserId);

      res.status(200).json({
        success: true,
        message: 'User unblocked successfully',
        data: user
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  static async getBlockedUsers(req, res) {
    try {
      const userId = req.user._id;

      const blockedUsers = await UserService.getBlockedUsers(userId);

      res.status(200).json({
        success: true,
        data: blockedUsers
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = UserController;
