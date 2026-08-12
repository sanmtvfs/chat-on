const express = require('express');
const MessageService = require('../services/MessageService');
const multer = require('multer');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: 'uploads/messages/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Create message
router.post('/', upload.array('files', 5), async (req, res, next) => {
  try {
    const { content, roomId } = req.body;

    if (!content || !roomId) {
      return res.status(400).json({ error: 'Content and roomId are required' });
    }

    const files = req.files ? req.files.map(f => ({
      filename: f.filename,
      originalname: f.originalname,
      mimetype: f.mimetype,
      size: f.size
    })) : [];

    const message = await MessageService.createMessage({
      content,
      senderId: req.userId,
      roomId,
      files
    });

    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
});

// Get messages
router.get('/room/:roomId', async (req, res, next) => {
  try {
    const { limit = 50, skip = 0 } = req.query;
    const messages = await MessageService.getMessages(req.params.roomId, limit, skip);
    res.json(messages);
  } catch (error) {
    next(error);
  }
});

// Edit message
router.put('/:messageId', async (req, res, next) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const message = await MessageService.editMessage(req.params.messageId, content, req.userId);
    res.json(message);
  } catch (error) {
    next(error);
  }
});

// Delete message
router.delete('/:messageId', async (req, res, next) => {
  try {
    await MessageService.deleteMessage(req.params.messageId, req.userId);
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Add reaction
router.post('/:messageId/react', async (req, res, next) => {
  try {
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).json({ error: 'Emoji is required' });
    }

    const message = await MessageService.addReaction(req.params.messageId, emoji, req.userId);
    res.json(message);
  } catch (error) {
    next(error);
  }
});

// Remove reaction
router.delete('/:messageId/react/:emoji', async (req, res, next) => {
  try {
    const message = await MessageService.removeReaction(
      req.params.messageId,
      req.params.emoji,
      req.userId
    );
    res.json(message);
  } catch (error) {
    next(error);
  }
});

// Pin message
router.post('/:messageId/pin', async (req, res, next) => {
  try {
    const message = await MessageService.pinMessage(req.params.messageId, req.userId);
    res.json(message);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
