const { param, query, body } = require('express-validator');

// ── GET /campuses/:campusId/academic-sessions ──────────────────────────────────

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

  query('status')
    .optional()
    .isIn(['upcoming', 'active', 'closing', 'completed']).withMessage('Status must be one of: upcoming, active, closing, completed'),
];

// ── :id param ──────────────────────────────────────────────────────────────────

const idParamRules = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid session ID'),
];

// ── POST /campuses/:campusId/academic-sessions ─────────────────────────────────

const createRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Session name is required')
    .isLength({ max: 100 }).withMessage('Name must not exceed 100 characters'),

  body('start_date')
    .notEmpty().withMessage('Start Date is required')
    .isDate().withMessage('Start Date must be a valid date in YYYY-MM-DD format'),

  body('end_date')
    .notEmpty().withMessage('End Date is required')
    .isDate().withMessage('End Date must be a valid date in YYYY-MM-DD format')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.start_date)) {
        throw new Error('End Date must be after Start Date');
      }
      return true;
    }),
];

// ── PATCH /campuses/:campusId/academic-sessions/:id ────────────────────────────

const updateRules = [
  ...idParamRules,

  body('name')
    .optional({ values: 'falsy' })
    .trim()
    .notEmpty().withMessage('Session name must not be empty')
    .isLength({ max: 100 }).withMessage('Name must not exceed 100 characters'),

  body('start_date')
    .optional()
    .isDate().withMessage('Start Date must be a valid date in YYYY-MM-DD format'),

  body('end_date')
    .optional()
    .isDate().withMessage('End Date must be a valid date in YYYY-MM-DD format')
    .custom((value, { req }) => {
      if (value && req.body.start_date) {
        if (new Date(value) <= new Date(req.body.start_date)) {
          throw new Error('End Date must be after Start Date');
        }
      }
      return true;
    }),
];

module.exports = { listRules, idParamRules, createRules, updateRules };
