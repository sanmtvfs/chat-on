const Room = require('../models/Room');
const User = require('../models/User');

class RoomService {
  static async createRoom(roomData, creatorId) {
    const creator = await User.findById(creatorId);

    if (!creator) {
      throw new Error('Creator not found');
    }

    const room = new Room({
      ...roomData,
      creator: creatorId,
      members: [creatorId],
      moderators: [creatorId]
    });

    await room.save();

    creator.rooms.push(room._id);
    await creator.save();

    return room.populate('creator', '-password');
  }

  static async getRoomsByAgeGroup(ageGroup) {
    const rooms = await Room.find({
      ageGroup,
      isActive: true,
      isPrivate: false
    })
      .populate('creator', '-password')
      .populate('members', '-password')
      .sort({ createdAt: -1 });

    return rooms;
  }

  static async getRoomDetails(roomId) {
    const room = await Room.findById(roomId)
      .populate('creator', '-password')
      .populate('members', '-password')
      .populate('moderators', '-password');

    if (!room) {
      throw new Error('Room not found');
    }

    return room;
  }

  static async joinRoom(roomId, userId) {
    const room = await Room.findById(roomId);
    const user = await User.findById(userId);

    if (!room) {
      throw new Error('Room not found');
    }

    if (!user) {
      throw new Error('User not found');
    }

    // Check if room is full
    if (room.members.length >= room.maxMembers) {
      throw new Error('Room is full');
    }

    // Check if user is already a member
    if (room.members.includes(userId)) {
      throw new Error('User is already a member');
    }

    // Check user age
    const userAge = this.calculateAge(user.dateOfBirth);
    if (userAge < room.minAge || userAge > room.maxAge) {
      throw new Error('User does not meet age requirements');
    }

    room.members.push(userId);
    await room.save();

    if (!user.rooms.includes(roomId)) {
      user.rooms.push(roomId);
      await user.save();
    }

    return room.populate('members', '-password');
  }

  static async leaveRoom(roomId, userId) {
    const room = await Room.findById(roomId);
    const user = await User.findById(userId);

    if (!room) {
      throw new Error('Room not found');
    }

    if (!user) {
      throw new Error('User not found');
    }

    // Remove user from room
    room.members = room.members.filter(id => id.toString() !== userId);
    room.moderators = room.moderators.filter(id => id.toString() !== userId);
    await room.save();

    // Remove room from user
    user.rooms = user.rooms.filter(id => id.toString() !== roomId);
    await user.save();

    return { message: 'Left room successfully' };
  }

  static calculateAge(dateOfBirth) {
    const today = new Date();
    let age = today.getFullYear() - dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - dateOfBirth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
      age--;
    }

    return age;
  }
}

module.exports = RoomService;
