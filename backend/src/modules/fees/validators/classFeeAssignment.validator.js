const { query, body, param } = require('express-validator');

const classGroupIdParamRules = [
  param('classGroupId').isInt({ min: 1 }).withMessage('Invalid class ID'),
];

const getSetupRules = [
  ...classGroupIdParamRules,
  query('sessionId').isInt({ min: 1 }).withMessage('sessionId is required and must be a positive integer'),
];

const assignRules = [
  ...classGroupIdParamRules,
  body('sessionId').isInt({ min: 1 }).withMessage('sessionId is required and must be a positive integer'),
  body('dueDay').isInt({ min: 1, max: 31 }).withMessage('dueDay is required and must be between 1 and 31'),
  body('items').isArray({ min: 1 }).withMessage('At least one fee item is required'),
  body('items.*.feeHeadId').isInt({ min: 1 }).withMessage('Invalid feeHeadId in items'),
  body('items.*.amount').isFloat({ min: 0.01 }).withMessage('Each item amount must be greater than 0'),
];

module.exports = { classGroupIdParamRules, getSetupRules, assignRules };