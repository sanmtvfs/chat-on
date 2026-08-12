const { verifyToken } = require('../config/jwt');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized to access this route' });
  }

  try {
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = await User.findById(decoded.userId);
    if (!req.user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is banned
    if (req.user.isBannedNow()) {
      return res.status(403).json({ message: 'User is banned' });
    }

    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized to access this route' });
  }
};

const validateAge = (minAge, maxAge = null) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (req.user.age < minAge) {
      return res.status(403).json({ 
        message: `You must be at least ${minAge} years old to access this room` 
      });
    }

    if (maxAge && req.user.age > maxAge) {
      return res.status(403).json({ 
        message: `You must be no older than ${maxAge} years old to access this room` 
      });
    }

    next();
  };
};

module.exports = { protect, validateAge };
