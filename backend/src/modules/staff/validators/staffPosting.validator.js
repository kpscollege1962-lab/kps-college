const { param, body, query } = require('express-validator');

const createPostingRules = [
  param('staffId')
    .isInt({ min: 1 }).withMessage('Invalid staff ID'),
  query('campusId')
    .notEmpty().withMessage('Campus ID is required')
    .isInt({ min: 1 }).withMessage('Invalid campus ID'),
  body('employee_no')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 50 }).withMessage('Employee No must not exceed 50 characters'),
  body('joining_date')
    .optional({ nullable: true })
    .isISO8601().withMessage('Joining date must be a valid date'),
  body('isTimetableEligible')
    .optional()
    .isBoolean().withMessage('isTimetableEligible must be a boolean'),
  body('allowConcurrentPeriods')
    .optional()
    .isBoolean().withMessage('allowConcurrentPeriods must be a boolean'),
];

const updatePostingRules = [
  param('staffId')
    .isInt({ min: 1 }).withMessage('Invalid staff ID'),
  query('campusId')
    .notEmpty().withMessage('Campus ID is required')
    .isInt({ min: 1 }).withMessage('Invalid campus ID'),
  body('employee_no')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 50 }).withMessage('Employee No must not exceed 50 characters'),
  body('joining_date')
    .optional({ nullable: true })
    .isISO8601().withMessage('Joining date must be a valid date'),
  body('is_active')
    .optional()
    .isInt({ min: 0, max: 1 }).withMessage('Active status must be 0 or 1'),
  body('isTimetableEligible')
    .optional()
    .isBoolean().withMessage('isTimetableEligible must be a boolean'),
  body('allowConcurrentPeriods')
    .optional()
    .isBoolean().withMessage('allowConcurrentPeriods must be a boolean'),
];

module.exports = { createPostingRules, updatePostingRules };
