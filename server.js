const { server } = require('./app');
const ModerationService = require('./services/ModerationService');

const PORT = process.env.PORT || 5000;

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Check for expired bans every hour
setInterval(() => {
  ModerationService.checkExpiredBans()
    .then(() => console.log('Checked for expired bans'))
    .catch(err => console.error('Error checking expired bans:', err));
}, 60 * 60 * 1000);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
