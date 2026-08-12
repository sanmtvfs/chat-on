const express = require('express');
const router = express.Router();
const MessageService = require('../services/MessageService');
const { authenticateToken } = require('../middleware/auth');

// Get messages from room
router.get('/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    const messages = await MessageService.getMessages(roomId, limit, skip);
    res.status(200).json(messages);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Edit message
router.put('/:messageId', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content, roomId } = req.body;

    if (!content || !roomId) {
      return res.status(400).json({ message: 'Content and room ID required' });
    }

    const message = await MessageService.editMessage(messageId, content, req.userId);
    res.status(200).json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete message
router.delete('/:messageId', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    await MessageService.deleteMessage(messageId, req.userId);
    res.status(200).json({ message: 'Message deleted' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
