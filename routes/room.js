const express = require('express');
const RoomService = require('../services/RoomService');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Create room
router.post('/', async (req, res, next) => {
  try {
    const { name, description, ageGroup, minAge, maxAge, isPrivate } = req.body;

    if (!name || !ageGroup) {
      return res.status(400).json({ error: 'Name and age group are required' });
    }

    const room = await RoomService.createRoom(
      { name, description, ageGroup, minAge, maxAge, isPrivate },
      req.userId
    );
    res.status(201).json(room);
  } catch (error) {
    next(error);
  }
});

// Get rooms by age group
router.get('/by-age/:ageGroup', async (req, res, next) => {
  try {
    const rooms = await RoomService.getRoomsByAgeGroup(req.params.ageGroup);
    res.json(rooms);
  } catch (error) {
    next(error);
  }
});

// Get room details
router.get('/:roomId', async (req, res, next) => {
  try {
    const room = await RoomService.getRoomDetails(req.params.roomId);
    res.json(room);
  } catch (error) {
    next(error);
  }
});

// Join room
router.post('/:roomId/join', async (req, res, next) => {
  try {
    const room = await RoomService.joinRoom(req.params.roomId, req.userId);
    res.json(room);
  } catch (error) {
    next(error);
  }
});

// Leave room
router.post('/:roomId/leave', async (req, res, next) => {
  try {
    const result = await RoomService.leaveRoom(req.params.roomId, req.userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
