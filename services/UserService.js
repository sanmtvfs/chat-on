const User = require('../models/User');
const fs = require('fs').promises;
const path = require('path');

class UserService {
  static async getUserProfile(userId) {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  static async updateUserProfile(userId, { username, bio }) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if new username is already taken
    if (username && username !== user.username) {
      const existing = await User.findOne({ username });
      if (existing) {
        throw new Error('Username already in use');
      }
    }

    if (username) user.username = username;
    if (bio) user.bio = bio;

    await user.save();
    return user.toObject({ getters: true });
  }

  static async uploadAvatar(userId, file) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Delete old avatar if exists
    if (user.avatar) {
      try {
        await fs.unlink(path.join('uploads', user.avatar));
      } catch (err) {
        console.error('Error deleting old avatar:', err);
      }
    }

    user.avatar = file.filename;
    await user.save();

    return user.toObject({ getters: true });
  }

  static async blockUser(userId, blockedUserId) {
    if (userId.toString() === blockedUserId.toString()) {
      throw new Error('Cannot block yourself');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const blockedUser = await User.findById(blockedUserId);
    if (!blockedUser) {
      throw new Error('Blocked user not found');
    }

    if (!user.blockedUsers.includes(blockedUserId)) {
      user.blockedUsers.push(blockedUserId);
      await user.save();
    }

    return user.toObject({ getters: true });
  }

  static async unblockUser(userId, blockedUserId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.blockedUsers = user.blockedUsers.filter(
      id => id.toString() !== blockedUserId.toString()
    );
    await user.save();

    return user.toObject({ getters: true });
  }

  static async getBlockedUsers(userId) {
    const user = await User.findById(userId).populate('blockedUsers', 'username email avatar');
    if (!user) {
      throw new Error('User not found');
    }

    return user.blockedUsers;
  }
}

module.exports = UserService;
