const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Room = require('../models/Room');
const Message = require('../models/Message');
const MessageService = require('../services/MessageService');

// Store active users
const activeUsers = new Map();
const roomUsers = new Map();

const initializeSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Store user as active
    activeUsers.set(socket.userId, socket.id);
    io.emit('user-online', { userId: socket.userId });

    // User joins a room
    socket.on('join-room', async (data) => {
      try {
        const { roomId } = data;
        const room = await Room.findById(roomId);

        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        if (!room.members.includes(socket.userId)) {
          socket.emit('error', { message: 'You are not a member of this room' });
          return;
        }

        socket.join(`room-${roomId}`);

        if (!roomUsers.has(roomId)) {
          roomUsers.set(roomId, new Set());
        }
        roomUsers.get(roomId).add(socket.userId);

        // Notify others in the room
        io.to(`room-${roomId}`).emit('user-joined-room', {
          userId: socket.userId,
          roomId,
          onlineCount: roomUsers.get(roomId).size
        });

        socket.emit('room-joined', { roomId });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // User sends a message
    socket.on('send-message', async (data) => {
      try {
        const { roomId, content, files } = data;

        const message = await MessageService.createMessage({
          content,
          senderId: socket.userId,
          roomId,
          files: files || []
        });

        const populatedMessage = await message.populate('sender', '-password');

        io.to(`room-${roomId}`).emit('new-message', populatedMessage);
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // User is typing
    socket.on('typing', (data) => {
      const { roomId } = data;
      socket.to(`room-${roomId}`).emit('user-typing', {
        userId: socket.userId,
        roomId
      });
    });

    // User stops typing
    socket.on('stop-typing', (data) => {
      const { roomId } = data;
      socket.to(`room-${roomId}`).emit('user-stop-typing', {
        userId: socket.userId,
        roomId
      });
    });

    // User edits a message
    socket.on('edit-message', async (data) => {
      try {
        const { messageId, content, roomId } = data;

        const message = await MessageService.editMessage(messageId, content, socket.userId);

        io.to(`room-${roomId}`).emit('message-edited', message);
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // User deletes a message
    socket.on('delete-message', async (data) => {
      try {
        const { messageId, roomId } = data;

        await MessageService.deleteMessage(messageId, socket.userId);

        io.to(`room-${roomId}`).emit('message-deleted', { messageId });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // User adds reaction to message
    socket.on('add-reaction', async (data) => {
      try {
        const { messageId, emoji, roomId } = data;

        const message = await MessageService.addReaction(messageId, emoji, socket.userId);

        io.to(`room-${roomId}`).emit('reaction-added', message);
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // User removes reaction from message
    socket.on('remove-reaction', async (data) => {
      try {
        const { messageId, emoji, roomId } = data;

        const message = await MessageService.removeReaction(messageId, emoji, socket.userId);

        io.to(`room-${roomId}`).emit('reaction-removed', message);
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // User leaves a room
    socket.on('leave-room', (data) => {
      try {
        const { roomId } = data;

        socket.leave(`room-${roomId}`);

        if (roomUsers.has(roomId)) {
          roomUsers.get(roomId).delete(socket.userId);

          io.to(`room-${roomId}`).emit('user-left-room', {
            userId: socket.userId,
            roomId,
            onlineCount: roomUsers.get(roomId).size
          });
        }
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // User disconnects
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);

      activeUsers.delete(socket.userId);
      io.emit('user-offline', { userId: socket.userId });

      // Remove user from all rooms
      roomUsers.forEach((users, roomId) => {
        if (users.has(socket.userId)) {
          users.delete(socket.userId);
          io.to(`room-${roomId}`).emit('user-left-room', {
            userId: socket.userId,
            roomId,
            onlineCount: users.size
          });
        }
      });
    });

    // Get online users in room
    socket.on('get-room-users', (data) => {
      const { roomId } = data;
      const users = roomUsers.get(roomId) || new Set();
      socket.emit('room-users', {
        roomId,
        users: Array.from(users),
        count: users.size
      });
    });
  });

  return io;
};

module.exports = { initializeSocket, activeUsers, roomUsers };
