const Room = require('../models/Room');
const User = require('../models/User');

class RoomService {
  static async createRoom(roomData, creatorId) {
    const room = new Room({
      ...roomData,
      creator: creatorId,
      members: [creatorId]
    });

    await room.save();
    return room.populate('creator', 'username avatar');
  }

  static async getRoomsByAgeGroup(ageGroup) {
    const rooms = await Room.find({ 
      ageGroup,
      isPrivate: false 
    })
      .populate('creator', 'username avatar')
      .sort({ createdAt: -1 })
      .select('-rules');

    return rooms;
  }

  static async getRoomDetails(roomId) {
    const room = await Room.findById(roomId)
      .populate('creator', 'username avatar')
      .populate('members', 'username avatar');

    if (!room) {
      throw new Error('Room not found');
    }

    return room;
  }

  static async joinRoom(roomId, userId) {
    const room = await Room.findById(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check age requirements
    if (room.minAge && user.age < room.minAge) {
      throw new Error('You are too young for this room');
    }

    if (room.maxAge && user.age > room.maxAge) {
      throw new Error('You are too old for this room');
    }

    // Check if user is blocked
    const creator = await User.findById(room.creator);
    if (creator.blockedUsers.includes(userId)) {
      throw new Error('You have been blocked from this room');
    }

    if (!room.members.includes(userId)) {
      room.members.push(userId);
      await room.save();
    }

    return room.populate('members', 'username avatar');
  }

  static async leaveRoom(roomId, userId) {
    const room = await Room.findById(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    // Remove user from members
    room.members = room.members.filter(id => id.toString() !== userId.toString());

    // If creator leaves and no members left, delete room
    if (room.creator.toString() === userId.toString() && room.members.length === 0) {
      await Room.findByIdAndDelete(roomId);
      return { message: 'Room deleted' };
    }

    await room.save();
    return room.populate('members', 'username avatar');
  }
}

module.exports = RoomService;
