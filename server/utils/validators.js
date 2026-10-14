const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });
  next();
};

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('role').isIn(['donor', 'receiver']).withMessage('Role must be donor or receiver'),
  validate,
];

const loginRules = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

const listingRules = [
  body('foodName').trim().notEmpty().withMessage('Food name is required'),
  body('foodType').isIn(['cooked', 'packaged', 'raw', 'bakery', 'other']).withMessage('Invalid food type'),
  body('vegNonVeg').isIn(['veg', 'nonveg']).withMessage('Must specify veg or non-veg'),
  body('quantity').trim().notEmpty().withMessage('Quantity is required'),
  body('preparedAt').isISO8601().withMessage('Valid preparation date required'),
  body('expiresAt').isISO8601().withMessage('Valid expiry date required'),
  body('pickupAddress').trim().notEmpty().withMessage('Pickup address is required'),
  body('location.coordinates').isArray({ min: 2, max: 2 }).withMessage('Coordinates [lng, lat] required'),
  validate,
];

const feedbackRules = [
  body('message').trim().notEmpty().withMessage('Message is required'),
  validate,
];

module.exports = { registerRules, loginRules, listingRules, feedbackRules };
