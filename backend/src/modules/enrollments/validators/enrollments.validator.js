const { body, param, query } = require('express-validator');

// ── GET /enrollments ───────────────────────────────────────────────────────────

const listRules = [
  query('campusId')
    .optional()
    .isInt({ min: 1 }).withMessage('Campus ID must be a valid identifier'),

  query('sessionId')
    .optional()
    .isInt({ min: 1 }).withMessage('Session ID must be a valid identifier'),

  query('classGroupId')
    .optional()
    .isInt({ min: 1 }).withMessage('Class ID must be a valid identifier'),

  query('sectionId')
    .optional()
    .isInt({ min: 1 }).withMessage('Section ID must be a valid identifier'),

  query('status')
    .optional()
    .isIn(['active', 'transferred', 'withdrawn'])
    .withMessage('status must be one of: active, transferred, withdrawn'),

  query('search')
    .optional()
    .trim(),

  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
];

// ── :enrollmentId param ────────────────────────────────────────────────────────

const idParamRules = [
  param('enrollmentId')
    .isInt({ min: 1 }).withMessage('Invalid enrollment ID'),
];

// ── POST /enrollments ──────────────────────────────────────────────────────────

const createRules = [
  body('campusId')
    .notEmpty().withMessage('Campus is required')
    .isInt({ min: 1 }).withMessage('Campus ID must be a valid identifier'),

  body('sessionId')
    .notEmpty().withMessage('Session is required')
    .isInt({ min: 1 }).withMessage('Session ID must be a valid identifier'),

  body('studentId')
    .notEmpty().withMessage('Student is required')
    .isInt({ min: 1 }).withMessage('Student ID must be a valid identifier'),

  body('classGroupId')
    .notEmpty().withMessage('Class is required')
    .isInt({ min: 1 }).withMessage('Class ID must be a valid identifier'),

  body('sectionId')
    .optional()
    .isInt({ min: 1 }).withMessage('Section ID must be a valid identifier'),
];

// ── GET /enrollments/eligible-students ────────────────────────────────────────

const eligibleStudentsRules = [
  query('sessionId')
    .notEmpty().withMessage('Session ID is required')
    .isInt({ min: 1 }).withMessage('Session ID must be a valid identifier'),

  query('q')
    .optional()
    .trim(),
];

module.exports = { listRules, idParamRules, createRules, deleteRules: idParamRules, eligibleStudentsRules };
