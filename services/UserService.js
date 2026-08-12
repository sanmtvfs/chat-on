const User = require('../models/User');
const fs = require('fs');
const path = require('path');

class UserService {
  static async getUserProfile(userId) {
    const user = await User.findById(userId)
      .populate('rooms')
      .select('-password');

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

    if (username) {
      // Check if username is already taken
      const existingUser = await User.findOne({ username, _id: { $ne: userId } });
      if (existingUser) {
        throw new Error('Username already taken');
      }
      user.username = username;
    }

    if (bio !== undefined) {
      user.bio = bio;
    }

    user.updatedAt = new Date();
    await user.save();

    return user.toJSON();
  }

  static async uploadAvatar(userId, file) {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Delete old avatar if exists
    if (user.avatar) {
      const oldPath = path.join(__dirname, '..', user.avatar);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    user.avatar = `/uploads/${file.filename}`;
    user.updatedAt = new Date();
    await user.save();

    return user.toJSON();
  }

  static async blockUser(userId, blockedUserId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const blockedUser = await User.findById(blockedUserId);

    if (!blockedUser) {
      throw new Error('User to block not found');
    }

    if (user.blockedUsers.includes(blockedUserId)) {
      throw new Error('User already blocked');
    }

    user.blockedUsers.push(blockedUserId);
    user.updatedAt = new Date();
    await user.save();

    return user.toJSON();
  }

  static async unblockUser(userId, blockedUserId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    user.blockedUsers = user.blockedUsers.filter(id => id.toString() !== blockedUserId);
    user.updatedAt = new Date();
    await user.save();

    return user.toJSON();
  }

  static async getBlockedUsers(userId) {
    const user = await User.findById(userId).populate('blockedUsers', '-password');

    if (!user) {
      throw new Error('User not found');
    }

    return user.blockedUsers;
  }
}

module.exports = UserService;
