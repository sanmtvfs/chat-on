const Message = require('../models/Message');
const Room = require('../models/Room');
const User = require('../models/User');

class MessageService {
  static async createMessage({ content, senderId, roomId, files }) {
    // Validate room and user
    const room = await Room.findById(roomId);
    const user = await User.findById(senderId);

    if (!room) {
      throw new Error('Room not found');
    }

    if (!user) {
      throw new Error('User not found');
    }

    // Check if user is a member of the room
    if (!room.members.includes(senderId)) {
      throw new Error('User is not a member of this room');
    }

    const message = new Message({
      content,
      sender: senderId,
      room: roomId,
      files: files || []
    });

    await message.save();

    return message.populate('sender', '-password');
  }

  static async getMessages(roomId, limit = 50, skip = 0) {
    const messages = await Message.find({ room: roomId })
      .populate('sender', '-password')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    return messages.reverse();
  }

  static async editMessage(messageId, content, userId) {
    const message = await Message.findById(messageId);

    if (!message) {
      throw new Error('Message not found');
    }

    if (message.sender.toString() !== userId) {
      throw new Error('You can only edit your own messages');
    }

    message.content = content;
    message.isEdited = true;
    message.editedAt = new Date();
    await message.save();

    return message.populate('sender', '-password');
  }

  static async deleteMessage(messageId, userId) {
    const message = await Message.findById(messageId);

    if (!message) {
      throw new Error('Message not found');
    }

    if (message.sender.toString() !== userId) {
      throw new Error('You can only delete your own messages');
    }

    await Message.findByIdAndDelete(messageId);
  }

  static async addReaction(messageId, emoji, userId) {
    const message = await Message.findById(messageId);

    if (!message) {
      throw new Error('Message not found');
    }

    const reactionIndex = message.reactions.findIndex(r => r.emoji === emoji);

    if (reactionIndex === -1) {
      message.reactions.push({
        emoji,
        users: [userId]
      });
    } else {
      if (!message.reactions[reactionIndex].users.includes(userId)) {
        message.reactions[reactionIndex].users.push(userId);
      }
    }

    await message.save();

    return message.populate('sender', '-password');
  }

  static async removeReaction(messageId, emoji, userId) {
    const message = await Message.findById(messageId);

    if (!message) {
      throw new Error('Message not found');
    }

    const reactionIndex = message.reactions.findIndex(r => r.emoji === emoji);

    if (reactionIndex !== -1) {
      message.reactions[reactionIndex].users = message.reactions[reactionIndex].users.filter(
        id => id.toString() !== userId
      );

      if (message.reactions[reactionIndex].users.length === 0) {
        message.reactions.splice(reactionIndex, 1);
      }
    }

    await message.save();

    return message.populate('sender', '-password');
  }

  static async pinMessage(messageId, userId) {
    const message = await Message.findById(messageId);

    if (!message) {
      throw new Error('Message not found');
    }

    const room = await Room.findById(message.room);

    if (!room.moderators.includes(userId)) {
      throw new Error('Only moderators can pin messages');
    }

    message.isPinned = true;
    message.pinnedBy = userId;
    await message.save();

    return message.populate('sender', '-password');
  }
}

module.exports = MessageService;
