const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ status: 'error', errors: errors.array() });
  next();
};

exports.validatePoi = [
  body('name').trim().notEmpty().withMessage('Name is required').isString(),
  body('lat').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
  body('lng').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
  body('category_id').isInt().withMessage('Category ID must be an integer'),
  handleValidationErrors
];

// Fix #16: Validation for PUT /api/pois/:id
exports.validateUpdatePoi = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty').isString(),
  body('lat').optional().isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
  body('lng').optional().isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
  body('category_id').optional().isInt().withMessage('Category ID must be an integer'),
  handleValidationErrors
];

exports.validateRegister = [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('username').optional().isString().trim(),
  handleValidationErrors
];

// Fix #17: Validation for POST /api/auth/login
exports.validateLogin = [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

// Fix #18: Validation for POST /api/pois/:id/reviews
exports.validateReview = [
  body('rating').isInt({ min: 1, max: 10 }).withMessage('Rating must be 1-10'),
  body('comment').optional().isString().trim(),
  body('disability_type').optional().isString(),
  handleValidationErrors
];
