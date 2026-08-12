const Message = require('../models/Message');
const Room = require('../models/Room');
const User = require('../models/User');

class MessageService {
  static async createMessage({ content, senderId, roomId, files }) {
    // Check room exists
    const room = await Room.findById(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    // Check user is in room
    if (!room.members.includes(senderId)) {
      throw new Error('You are not a member of this room');
    }

    const message = new Message({
      content,
      sender: senderId,
      room: roomId,
      files
    });

    await message.save();
    return message.populate('sender', 'username avatar');
  }

  static async getMessages(roomId, limit = 50, skip = 0) {
    const messages = await Message.find({ room: roomId })
      .populate('sender', 'username avatar')
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

    if (message.sender.toString() !== userId.toString()) {
      throw new Error('You can only edit your own messages');
    }

    message.content = content;
    message.edited = true;
    message.editedAt = new Date();

    await message.save();
    return message.populate('sender', 'username avatar');
  }

  static async deleteMessage(messageId, userId) {
    const message = await Message.findById(messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    if (message.sender.toString() !== userId.toString()) {
      throw new Error('You can only delete your own messages');
    }

    await Message.findByIdAndDelete(messageId);
    return { message: 'Message deleted' };
  }

  static async addReaction(messageId, emoji, userId) {
    const message = await Message.findById(messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    const reactionIndex = message.reactions.findIndex(
      r => r.emoji === emoji && r.userId.toString() === userId.toString()
    );

    if (reactionIndex === -1) {
      message.reactions.push({ emoji, userId });
    }

    await message.save();
    return message.populate('sender', 'username avatar');
  }

  static async removeReaction(messageId, emoji, userId) {
    const message = await Message.findById(messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    message.reactions = message.reactions.filter(
      r => !(r.emoji === emoji && r.userId.toString() === userId.toString())
    );

    await message.save();
    return message.populate('sender', 'username avatar');
  }

  static async pinMessage(messageId, userId) {
    const message = await Message.findById(messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    // Only room creator or message sender can pin
    const room = await Room.findById(message.room);
    if (room.creator.toString() !== userId.toString() && message.sender.toString() !== userId.toString()) {
      throw new Error('You do not have permission to pin this message');
    }

    message.isPinned = !message.isPinned;
    await message.save();

    return message.populate('sender', 'username avatar');
  }
}

module.exports = MessageService;
