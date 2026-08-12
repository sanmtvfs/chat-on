const User = require('../models/User');
const Message = require('../models/Message');

class ModerationService {
  static async warnUser(userId, reason) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.warnings = (user.warnings || 0) + 1;
    user.lastWarning = new Date();

    if (user.warnings >= 3) {
      user.isBanned = true;
      user.bannedAt = new Date();
      user.banReason = 'Automatic ban after 3 warnings';
    }

    await user.save();
    return user;
  }

  static async banUser(userId, reason, days = null) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.isBanned = true;
    user.bannedAt = new Date();
    user.banReason = reason;

    if (days) {
      user.banExpiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    }

    await user.save();
    return user;
  }

  static async unbanUser(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.isBanned = false;
    user.bannedAt = null;
    user.banReason = null;
    user.banExpiresAt = null;

    await user.save();
    return user;
  }

  static async checkExpiredBans() {
    const now = new Date();
    await User.updateMany(
      {
        isBanned: true,
        banExpiresAt: { $lt: now }
      },
      {
        $set: {
          isBanned: false,
          banExpiresAt: null
        }
      }
    );
  }
}

module.exports = ModerationService;
