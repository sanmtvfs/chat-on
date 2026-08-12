const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array()
    });
  }
  next();
};

const validateRegister = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters'),
  body('email')
    .isEmail()
    .withMessage('Invalid email format'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('dateOfBirth')
    .isISO8601()
    .withMessage('Invalid date format'),
  handleValidationErrors
];

const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Invalid email format'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

const validateUpdateProfile = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must not exceed 500 characters'),
  handleValidationErrors
];

const validateCreateRoom = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Room name must be between 3 and 50 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('ageGroup')
    .isIn(['13-17', '18-25', '26-35', '36-50', '50+'])
    .withMessage('Invalid age group'),
  body('minAge')
    .optional()
    .isInt({ min: 13, max: 100 })
    .withMessage('Min age must be between 13 and 100'),
  body('maxAge')
    .optional()
    .isInt({ min: 13, max: 100 })
    .withMessage('Max age must be between 13 and 100'),
  handleValidationErrors
];

const validateMessage = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Message must be between 1 and 5000 characters'),
  body('roomId')
    .if(body('roomId').exists())
    .isMongoId()
    .withMessage('Invalid room ID'),
  handleValidationErrors
];

const validateReport = [
  body('reason')
    .isIn(['spam', 'harassment', 'inappropriate', 'scam', 'other'])
    .withMessage('Invalid report reason'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateCreateRoom,
  validateMessage,
  validateReport
};
