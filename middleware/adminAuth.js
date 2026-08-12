const auth = require('./auth');

const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {});

    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required'
      });
    }

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Unauthorized'
    });
  }
};

module.exports = adminAuth;
