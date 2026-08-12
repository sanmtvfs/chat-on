const express = require('express');
const router = express.Router();
const MessageController = require('../controllers/MessageController');
const auth = require('../middleware/auth');
const { messageLimiter } = require('../middleware/rateLimiter');
const { validateMessage } = require('../middleware/validation');

// Protected routes
router.post('/', auth, messageLimiter, validateMessage, MessageController.createMessage);
router.get('/:roomId', auth, MessageController.getMessages);
router.put('/:messageId', auth, validateMessage, MessageController.editMessage);
router.delete('/:messageId', auth, MessageController.deleteMessage);

// Reactions
router.post('/:messageId/react', auth, MessageController.addReaction);
router.delete('/:messageId/react', auth, MessageController.removeReaction);

// Pin message
router.post('/:messageId/pin', auth, MessageController.pinMessage);

module.exports = router;
