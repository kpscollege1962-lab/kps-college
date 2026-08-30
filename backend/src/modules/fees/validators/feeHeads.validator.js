const { query, body, param } = require('express-validator');

const feeHeadIdParamRules = [
  param('feeHeadId')
    .isInt({ min: 1 }).withMessage('Invalid fee head ID'),
];

const listRules = [
  query('search')
    .optional()
    .trim(),
  query('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean')
    .toBoolean(),
  query('category')
    .optional()
    .isIn(['fees', 'facilities', 'fines']).withMessage('Invalid category filter'),
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
];

const createRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Fee head name is required')
    .isLength({ max: 100 }).withMessage('Fee head name must not exceed 100 characters'),
  body('category')
    .isIn(['fees', 'facilities', 'fines']).withMessage('Category is required and must be one of: fees, facilities, fines'),
];

const updateRules = [
  ...feeHeadIdParamRules,
  body('name')
    .optional({ values: 'falsy' })
    .trim()
    .notEmpty().withMessage('Fee head name must not be empty')
    .isLength({ max: 100 }).withMessage('Fee head name must not exceed 100 characters'),
  body('category')
    .optional()
    .isIn(['fees', 'facilities', 'fines']).withMessage('Invalid category'),
  body('is_active')
    .optional()
    .isBoolean().withMessage('is_active must be a boolean'),
];

module.exports = { listRules, feeHeadIdParamRules, createRules, updateRules };