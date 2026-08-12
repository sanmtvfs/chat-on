const errorHandler = (error, req, res, next) => {
  console.error('Error:', error);

  // Validation errors
  if (error.message.includes('validation')) {
    return res.status(400).json({ error: error.message });
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired' });
  }

  // MongoDB errors
  if (error.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return res.status(400).json({ error: `${field} already exists` });
  }

  // Multer errors
  if (error.name === 'MulterError') {
    if (error.code === 'FILE_TOO_LARGE') {
      return res.status(400).json({ error: 'File too large' });
    }
    return res.status(400).json({ error: 'File upload error' });
  }

  // Default error
  res.status(error.status || 500).json({
    error: error.message || 'Internal server error'
  });
};

module.exports = errorHandler;
