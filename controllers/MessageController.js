const MessageService = require('../services/MessageService');
const { messageLimiter } = require('../middleware/rateLimiter');

class MessageController {
  static async createMessage(req, res) {
    try {
      const userId = req.user._id;
      const { content, roomId, files } = req.body;

      const message = await MessageService.createMessage({
        content,
        senderId: userId,
        roomId,
        files
      });

      res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: message
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  static async getMessages(req, res) {
    try {
      const { roomId } = req.params;
      const { limit = 50, skip = 0 } = req.query;

      const messages = await MessageService.getMessages(roomId, limit, skip);

      res.status(200).json({
        success: true,
        data: messages
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  static async editMessage(req, res) {
    try {
      const userId = req.user._id;
      const { messageId } = req.params;
      const { content } = req.body;

      const message = await MessageService.editMessage(messageId, content, userId);

      res.status(200).json({
        success: true,
        message: 'Message edited successfully',
        data: message
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  static async deleteMessage(req, res) {
    try {
      const userId = req.user._id;
      const { messageId } = req.params;

      const message = await MessageService.deleteMessage(messageId, userId);

      res.status(200).json({
        success: true,
        message: 'Message deleted successfully',
        data: message
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  static async addReaction(req, res) {
    try {
      const userId = req.user._id;
      const { messageId } = req.params;
      const { emoji } = req.body;

      const message = await MessageService.addReaction(messageId, emoji, userId);

      res.status(200).json({
        success: true,
        message: 'Reaction added successfully',
        data: message
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  static async removeReaction(req, res) {
    try {
      const userId = req.user._id;
      const { messageId } = req.params;
      const { emoji } = req.body;

      const message = await MessageService.removeReaction(messageId, emoji, userId);

      res.status(200).json({
        success: true,
        message: 'Reaction removed successfully',
        data: message
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  static async pinMessage(req, res) {
    try {
      const userId = req.user._id;
      const { messageId } = req.params;

      const message = await MessageService.pinMessage(messageId, userId);

      res.status(200).json({
        success: true,
        message: 'Message pin status updated',
        data: message
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = MessageController;
