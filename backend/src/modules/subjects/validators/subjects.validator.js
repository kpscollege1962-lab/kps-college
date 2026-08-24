const { body, param, query } = require('express-validator');

// ── GET /subjects ──────────────────────────────────────────────────────────────

const listRules = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),

  query('search')
    .optional()
    .trim(),

  query('category')
    .optional()
    .isIn(['science', 'arts', 'commerce', 'general']).withMessage('Invalid category filter'),
];

// ── :subjectId param ───────────────────────────────────────────────────────────

const idParamRules = [
  param('subjectId')
    .isInt({ min: 1 }).withMessage('Invalid subject ID'),
];

// ── POST /subjects ─────────────────────────────────────────────────────────────

const createRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Subject name is required')
    .isLength({ max: 100 }).withMessage('Subject name must not exceed 100 characters'),

  body('name_initials')
    .optional()
    .trim()
    .isLength({ max: 20 }).withMessage('Name initials must not exceed 20 characters'),

  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(['science', 'arts', 'commerce', 'general']).withMessage('Invalid category'),
];

// ── PATCH /subjects/:subjectId ─────────────────────────────────────────────────

const updateRules = [
  ...idParamRules,

  body('name')
    .optional({ values: 'falsy' })
    .trim()
    .notEmpty().withMessage('Subject name must not be empty')
    .isLength({ max: 100 }).withMessage('Subject name must not exceed 100 characters'),

  body('name_initials')
    .optional()
    .trim()
    .isLength({ max: 20 }).withMessage('Name initials must not exceed 20 characters'),

  body('category')
    .optional({ values: 'falsy' })
    .isIn(['science', 'arts', 'commerce', 'general']).withMessage('Invalid category'),
];

module.exports = { listRules, idParamRules, createRules, updateRules };
