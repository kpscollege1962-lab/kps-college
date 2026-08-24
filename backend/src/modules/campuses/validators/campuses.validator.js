const { body, param, query } = require('express-validator');

// ── GET /campuses ──────────────────────────────────────────────────────────────

const listRules = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),

  query('isActive')
    .optional()
    .isIn(['0', '1']).withMessage('Active filter must be 0 or 1'),

  query('search')
    .optional()
    .trim(),
];

// ── :id param ──────────────────────────────────────────────────────────────────

const idParamRules = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid campus ID'),
];

// ── POST /campuses ─────────────────────────────────────────────────────────────

const createRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Campus name is required')
    .isLength({ max: 150 }).withMessage('Campus Name must not exceed 150 characters'),

  body('code')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 20 }).withMessage('Campus Code must not exceed 20 characters'),

  body('address')
    .optional({ values: 'falsy' })
    .trim(),

  body('phone')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 20 }).withMessage('Phone must not exceed 20 characters'),

  body('email')
    .optional({ values: 'falsy' })
    .trim()
    .isEmail().withMessage('Must be a valid email address'),

  body('is_active')
    .optional()
    .isIn([0, 1]).withMessage('Active Status must be 0 or 1'),
];

// ── PATCH /campuses/:id ────────────────────────────────────────────────────────

const updateRules = [
  ...idParamRules,

  body('name')
    .optional({ values: 'falsy' })
    .trim()
    .notEmpty().withMessage('Campus Name must not be empty')
    .isLength({ max: 150 }).withMessage('Campus Name must not exceed 150 characters'),

  body('code')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 20 }).withMessage('Campus Code must not exceed 20 characters'),

  body('address')
    .optional({ values: 'falsy' })
    .trim(),

  body('phone')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 20 }).withMessage('Phone must not exceed 20 characters'),

  body('email')
    .optional({ values: 'falsy' })
    .trim()
    .isEmail().withMessage('Must be a valid email address'),

  body('is_active')
    .optional()
    .isIn([0, 1]).withMessage('Active Status must be 0 or 1'),
];

module.exports = { listRules, idParamRules, createRules, updateRules };
