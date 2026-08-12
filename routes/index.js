const express = require('express');
const authRoutes = require('./auth');
const userRoutes = require('./users');
const roomRoutes = require('./rooms');
const messageRoutes = require('./messages');
const moderationRoutes = require('./moderation');

const setupRoutes = (app) => {
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/rooms', roomRoutes);
  app.use('/api/messages', messageRoutes);
  app.use('/api/moderation', moderationRoutes);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
  });
};

module.exports = setupRoutes;
