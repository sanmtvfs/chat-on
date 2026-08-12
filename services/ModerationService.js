const User = require('../models/User');
const ModerationLog = require('../models/ModerationLog');

class ModerationService {
  static async warnUser(userId, reason) {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    user.warnings += 1;

    if (user.warnings >= 3) {
      user.isBanned = true;
      user.banReason = 'Banned due to multiple warnings';
    }

    await user.save();

    return user.toJSON();
  }

  static async banUser(userId, reason, days = null) {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    user.isBanned = true;
    user.banReason = reason;

    if (days) {
      const bannedUntil = new Date();
      bannedUntil.setDate(bannedUntil.getDate() + days);
      user.bannedUntil = bannedUntil;
    }

    await user.save();

    return user.toJSON();
  }

  static async unbanUser(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    user.isBanned = false;
    user.banReason = null;
    user.bannedUntil = null;

    await user.save();

    return user.toJSON();
  }

  static async checkExpiredBans() {
    const now = new Date();

    const result = await User.updateMany(
      {
        isBanned: true,
        bannedUntil: { $lte: now },
        bannedUntil: { $ne: null }
      },
      {
        $set: {
          isBanned: false,
          banReason: null,
          bannedUntil: null
        }
      }
    );

    return result;
  }

  static async createModerationLog(targetUserId, moderatorId, action, reason, room = null, duration = null) {
    const log = new ModerationLog({
      targetUser: targetUserId,
      moderator: moderatorId,
      action,
      reason,
      room,
      duration
    });

    if (duration) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + duration);
      log.expiresAt = expiresAt;
    }

    await log.save();

    return log;
  }
}

module.exports = ModerationService;
