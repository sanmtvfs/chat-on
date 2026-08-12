const Room = require('../models/Room');
const User = require('../models/User');

class RoomService {
  static async createRoom(roomData, creatorId) {
    const { name, description, ageGroup, minAge, maxAge, isPrivate, rules } = roomData;

    const room = new Room({
      name,
      description,
      ageGroup,
      minAge,
      maxAge,
      isPrivate,
      creator: creatorId,
      members: [creatorId],
      moderators: [creatorId],
      rules
    });

    await room.save();
    return room;
  }

  static async getRoomsByAgeGroup(ageGroup) {
    const rooms = await Room.find({
      ageGroup: { $in: [ageGroup, 'mixed'] },
      isActive: true,
      isPrivate: false
    })
      .populate('creator', 'username avatar')
      .populate('members', 'username avatar')
      .sort({ createdAt: -1 });

    return rooms;
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

    // Check age restrictions
    if (user.age < room.minAge) {
      throw new Error(`You must be at least ${room.minAge} years old to join this room`);
    }

    if (room.maxAge && user.age > room.maxAge) {
      throw new Error(`You must be no older than ${room.maxAge} years old to join this room`);
    }

    // Check if already member
    if (room.members.includes(userId)) {
      return room;
    }

    // Check room capacity
    if (room.members.length >= room.maxMembers) {
      throw new Error('Room is full');
    }

    room.members.push(userId);
    user.rooms.push(roomId);

    await room.save();
    await user.save();

    return room.populate('members', 'username avatar');
  }

  static async leaveRoom(roomId, userId) {
    const room = await Room.findById(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    room.members = room.members.filter(id => !id.equals(userId));
    user.rooms = user.rooms.filter(id => !id.equals(roomId));

    await room.save();
    await user.save();

    return room;
  }

  static async getRoomDetails(roomId) {
    const room = await Room.findById(roomId)
      .populate('creator', 'username avatar')
      .populate('members', 'username avatar ageGroup')
      .populate('moderators', 'username avatar');

    return room;
  }
}

module.exports = RoomService;
