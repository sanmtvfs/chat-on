const rateLimit = require('express-rate-limit');

// Auth limiter: 5 requests per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many auth attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Message limiter: 30 messages per minute
const messageLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: 'Too many messages, please slow down',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.user?.role === 'admin',
});

module.exports = {
  authLimiter,
  messageLimiter,
};
