const { body } = require('express-validator');

const contactRules = [
  body('email').optional({ values: 'null' }).trim()
    .if((value) => value !== '')
    .isEmail().withMessage('Enter a valid email address')
    .isLength({ max: 150 }).withMessage('Email must not exceed 150 characters'),
  body('phone').optional({ values: 'null' }).trim()
    .if((value) => value !== '')
    .matches(/^[0-9+\-\s()]{7,20}$/).withMessage('Enter a valid phone number'),
];

const passwordRules = [
  body('currentPassword').notEmpty().withMessage('Enter your current password'),
  body('newPassword')
    .notEmpty().withMessage('Enter a new password')
    .isLength({ min: 8 }).withMessage('The new password must be at least 8 characters'),
];

module.exports = { contactRules, passwordRules };
