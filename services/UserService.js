const User = require('../models/User');
const FileService = require('./FileService');

class UserService {
  static async getUserProfile(userId) {
    const user = await User.findById(userId)
      .select('-password')
      .populate('rooms', 'name ageGroup');

    return user;
  }

  static async updateUserProfile(userId, updateData) {
    const { username, bio, avatar } = updateData;

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (username) user.username = username;
    if (bio) user.bio = bio;
    if (avatar) user.avatar = avatar;

    await user.save();
    return user;
  }

  static async uploadAvatar(userId, file) {
    const fileInfo = await FileService.saveFile(file, null);

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Delete old avatar if exists
    if (user.avatar) {
      const filename = user.avatar.split('/').pop();
      await FileService.deleteFile(filename);
    }

    user.avatar = fileInfo.url;
    await user.save();

    return user;
  }

  static async blockUser(userId, blockedUserId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.blockedUsers.includes(blockedUserId)) {
      user.blockedUsers.push(blockedUserId);
      await user.save();
    }

    return user;
  }

  static async unblockUser(userId, blockedUserId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.blockedUsers = user.blockedUsers.filter(id => !id.equals(blockedUserId));
    await user.save();

    return user;
  }

  static async getBlockedUsers(userId) {
    const user = await User.findById(userId).populate('blockedUsers', 'username avatar');
    return user.blockedUsers;
  }
}

module.exports = UserService;
