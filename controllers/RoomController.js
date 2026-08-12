const RoomService = require('../services/RoomService');

class RoomController {
  static async createRoom(req, res) {
    try {
      const userId = req.user._id;
      const { name, description, ageGroup, minAge, maxAge, isPrivate, rules } = req.body;

      const room = await RoomService.createRoom({
        name,
        description,
        ageGroup,
        minAge,
        maxAge,
        isPrivate,
        rules
      }, userId);

      res.status(201).json({
        success: true,
        message: 'Room created successfully',
        data: room
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  static async getRooms(req, res) {
    try {
      const { ageGroup } = req.query;
      const userAgeGroup = req.user.ageGroup;

      const rooms = await RoomService.getRoomsByAgeGroup(ageGroup || userAgeGroup);

      res.status(200).json({
        success: true,
        data: rooms
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  static async getRoomDetails(req, res) {
    try {
      const { roomId } = req.params;

      const room = await RoomService.getRoomDetails(roomId);

      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Room not found'
        });
      }

      res.status(200).json({
        success: true,
        data: room
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  static async joinRoom(req, res) {
    try {
      const userId = req.user._id;
      const { roomId } = req.params;

      const room = await RoomService.joinRoom(roomId, userId);

      res.status(200).json({
        success: true,
        message: 'Joined room successfully',
        data: room
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  static async leaveRoom(req, res) {
    try {
      const userId = req.user._id;
      const { roomId } = req.params;

      const room = await RoomService.leaveRoom(roomId, userId);

      res.status(200).json({
        success: true,
        message: 'Left room successfully',
        data: room
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = RoomController;
