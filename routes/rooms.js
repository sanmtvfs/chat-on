const express = require('express');
const router = express.Router();
const RoomController = require('../controllers/RoomController');
const auth = require('../middleware/auth');
const { validateCreateRoom } = require('../middleware/validation');

// Protected routes
router.post('/', auth, validateCreateRoom, RoomController.createRoom);
router.get('/', auth, RoomController.getRooms);
router.get('/:roomId', auth, RoomController.getRoomDetails);
router.post('/:roomId/join', auth, RoomController.joinRoom);
router.post('/:roomId/leave', auth, RoomController.leaveRoom);

module.exports = router;
