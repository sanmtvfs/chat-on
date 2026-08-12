const express = require('express');
const router = express.Router();
const RoomService = require('../services/RoomService');
const { authenticateToken } = require('../middleware/auth');

// Create room
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description, ageGroup } = req.body;

    if (!name || !ageGroup) {
      return res.status(400).json({ message: 'Name and age group required' });
    }

    const ageRanges = {
      '13-17': { min: 13, max: 17 },
      '18-25': { min: 18, max: 25 },
      '26-35': { min: 26, max: 35 },
      '36-45': { min: 36, max: 45 },
      '46-55': { min: 46, max: 55 },
      '56+': { min: 56, max: 150 }
    };

    const range = ageRanges[ageGroup];

    const room = await RoomService.createRoom(
      {
        name,
        description: description || '',
        ageGroup,
        minAge: range.min,
        maxAge: range.max
      },
      req.userId
    );

    res.status(201).json(room);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get rooms by age group
router.get('/age-group/:ageGroup', async (req, res) => {
  try {
    const { ageGroup } = req.params;
    const rooms = await RoomService.getRoomsByAgeGroup(ageGroup);
    res.status(200).json(rooms);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get room details
router.get('/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await RoomService.getRoomDetails(roomId);
    res.status(200).json(room);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

// Join room
router.post('/:roomId/join', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await RoomService.joinRoom(roomId, req.userId);
    res.status(200).json(room);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Leave room
router.post('/:roomId/leave', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    const result = await RoomService.leaveRoom(roomId, req.userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
