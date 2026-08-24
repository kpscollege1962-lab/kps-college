const { body, param, query } = require('express-validator');

// ── GET / ────────────────────────────────────────────────────────────────────────

const listRules = [
  query('campusId')
    .notEmpty().withMessage('Campus ID is required')
    .isInt({ min: 1 }).withMessage('Campus ID must be a valid identifier'),

  query('sessionId')
    .notEmpty().withMessage('Session ID is required')
    .isInt({ min: 1 }).withMessage('Session ID must be a valid identifier'),
];

// ── POST / ───────────────────────────────────────────────────────────────────────

const addRules = [
  body('campusId')
    .notEmpty().withMessage('Campus ID is required')
    .isInt({ min: 1 }).withMessage('Campus ID must be a valid identifier'),

  body('sessionId')
    .notEmpty().withMessage('Session ID is required')
    .isInt({ min: 1 }).withMessage('Session ID must be a valid identifier'),

  body('sectionId')
    .optional()
    .isInt({ min: 1 }).withMessage('Section ID must be a valid identifier'),

  body('classGroupId')
    .optional()
    .isInt({ min: 1 }).withMessage('Class ID must be a valid identifier')
    .custom((value, { req }) => {
      if (req.body.sectionId === undefined && value === undefined) {
        throw new Error('classGroupId is required when sectionId is not provided');
      }
      return true;
    }),

  body('staffId')
    .notEmpty().withMessage('Staff is required')
    .isInt({ min: 1 }).withMessage('Staff ID must be a valid identifier'),
];

// ── DELETE /:assignmentId ──────────────────────────────────────────────────────────

const removeRules = [
  param('assignmentId')
    .isInt({ min: 1 }).withMessage('Invalid assignment ID'),
];

// ── GET /staff-search ──────────────────────────────────────────────────────────────

const searchStaffRules = [
  query('search')
    .optional()
    .trim()
    .isLength({ min: 2 }).withMessage('Search query must be at least 2 characters'),
];

module.exports = { listRules, addRules, removeRules, searchStaffRules };
