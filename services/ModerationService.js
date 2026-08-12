const Message = require('../models/Message');
const User = require('../models/User');
const { Filter } = require('better-profanity');

const filter = new Filter();

class ModerationService {
  static async filterProfanity(content) {
    if (!process.env.ENABLE_PROFANITY_FILTER || process.env.ENABLE_PROFANITY_FILTER !== 'true') {
      return { content, containsProfanity: false };
    }

    const isProfane = filter.isProfane(content);
    const cleanContent = filter.clean(content);

    return {
      content: cleanContent,
      containsProfanity: isProfane,
      originalContent: isProfane ? content : null
    };
  }

  static async checkMessageSafety(message, sender) {
    const filtered = await this.filterProfanity(message);
    return filtered;
  }

  static async reportMessage(reportData) {
    const { reportedMessage, reporter, reason, description, room } = reportData;

    const message = await Message.findById(reportedMessage);
    if (!message) {
      throw new Error('Message not found');
    }

    // Flag the message
    message.isFlagged = true;
    message.flagReason = reason;
    await message.save();

    return message;
  }

  static async reportUser(reportData) {
    const { reportedUser, reporter, reason, description } = reportData;

    const user = await User.findById(reportedUser);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      reported: true,
      userId: user._id,
      reason
    };
  }

  static async warnUser(userId, reason) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.warnings += 1;

    // Ban user after 3 warnings
    if (user.warnings >= 3) {
      user.isBanned = true;
      user.banReason = 'Exceeded warning limit';
      user.bannedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    }

    await user.save();
    return user;
  }

  static async banUser(userId, reason, days = 7) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.isBanned = true;
    user.banReason = reason;
    user.bannedUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    await user.save();

    return user;
  }

  static async unbanUser(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.isBanned = false;
    user.banReason = null;
    user.bannedUntil = null;
    user.warnings = 0;
    await user.save();

    return user;
  }
}

module.exports = ModerationService;
