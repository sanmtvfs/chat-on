const Message = require('../models/Message');
const ModerationService = require('./ModerationService');
const User = require('../models/User');
const Room = require('../models/Room');

class MessageService {
  static async createMessage(messageData) {
    const { content, senderId, roomId, files } = messageData;

    // Check moderation
    const moderationResult = await ModerationService.checkMessageSafety(content, senderId);

    const message = new Message({
      content: moderationResult.content,
      sender: senderId,
      room: roomId,
      files: files || [],
      containsProfanity: moderationResult.containsProfanity,
      originalContent: moderationResult.originalContent
    });

    await message.save();
    return message.populate('sender', 'username avatar ageGroup');
  }

  static async getMessages(roomId, limit = 50, skip = 0) {
    const messages = await Message.find({ room: roomId, isDeleted: false })
      .populate('sender', 'username avatar ageGroup')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    return messages.reverse();
  }

  static async editMessage(messageId, content, userId) {
    const message = await Message.findById(messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    if (!message.sender.equals(userId)) {
      throw new Error('You can only edit your own messages');
    }

    // Check moderation
    const moderationResult = await ModerationService.checkMessageSafety(content, userId);

    message.content = moderationResult.content;
    message.isEdited = true;
    message.editedAt = new Date();
    message.containsProfanity = moderationResult.containsProfanity;
    message.originalContent = moderationResult.originalContent;

    await message.save();
    return message.populate('sender', 'username avatar');
  }

  static async deleteMessage(messageId, userId, isAdmin = false) {
    const message = await Message.findById(messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    if (!isAdmin && !message.sender.equals(userId)) {
      throw new Error('You can only delete your own messages');
    }

    message.isDeleted = true;
    message.deletedAt = new Date();
    await message.save();

    return message;
  }

  static async addReaction(messageId, emoji, userId) {
    const message = await Message.findById(messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    let reaction = message.reactions.find(r => r.emoji === emoji);
    if (!reaction) {
      message.reactions.push({ emoji, users: [userId] });
    } else {
      if (!reaction.users.includes(userId)) {
        reaction.users.push(userId);
      }
    }

    await message.save();
    return message.populate('sender', 'username avatar');
  }

  static async removeReaction(messageId, emoji, userId) {
    const message = await Message.findById(messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    const reaction = message.reactions.find(r => r.emoji === emoji);
    if (reaction) {
      reaction.users = reaction.users.filter(id => !id.equals(userId));
      if (reaction.users.length === 0) {
        message.reactions = message.reactions.filter(r => r.emoji !== emoji);
      }
    }

    await message.save();
    return message.populate('sender', 'username avatar');
  }

  static async pinMessage(messageId, userId, isAdmin = false) {
    const message = await Message.findById(messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    // Check if user is room moderator or admin
    const room = await Room.findById(message.room);
    const isModerator = room.moderators.some(id => id.equals(userId));

    if (!isAdmin && !isModerator) {
      throw new Error('Only moderators can pin messages');
    }

    message.isPinned = !message.isPinned;
    await message.save();

    return message.populate('sender', 'username avatar');
  }
}

module.exports = MessageService;
