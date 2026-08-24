const { query, body, param } = require('express-validator');

// ── :classGroupId param ────────────────────────────────────────────────────────
const classIdParamRules = [
  param('classGroupId')
    .isInt({ min: 1 }).withMessage('Invalid class ID'),
];

// ── GET /campuses/:campusId/classes ────────────────────────────────────────────
const listRules = [
  query('sessionId')
    .optional()
    .isInt({ min: 1 }).withMessage('sessionId must be a positive integer'),
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search')
    .optional()
    .trim(),
  query('academicLevel')
    .optional()
    .isIn(['pre_primary', 'primary', 'middle', 'secondary', 'higher_secondary'])
    .withMessage('Invalid academic level filter'),
];

// ── POST /campuses/:campusId/classes ───────────────────────────────────────────
const createRules = [
  body('sessionId')
    .isInt({ min: 1 }).withMessage('sessionId is required and must be a positive integer'),
  body('name')
    .trim()
    .notEmpty().withMessage('Class name is required')
    .isLength({ max: 100 }).withMessage('Class name must not exceed 100 characters'),
  body('level')
    .isInt({ min: 1 }).withMessage('Level is required and must be a positive integer'),
  body('academic_level')
    .isIn(['pre_primary', 'primary', 'middle', 'secondary', 'higher_secondary'])
    .withMessage('Invalid academic level'),
];

// ── PATCH /campuses/:campusId/classes/:classGroupId ────────────────────────────
const updateRules = [
  ...classIdParamRules,
  body('name')
    .optional({ values: 'falsy' })
    .trim()
    .notEmpty().withMessage('Class name must not be empty')
    .isLength({ max: 100 }).withMessage('Class name must not exceed 100 characters'),
  body('level')
    .optional()
    .isInt({ min: 1 }).withMessage('Level must be a positive integer'),
  body('academic_level')
    .optional()
    .isIn(['pre_primary', 'primary', 'middle', 'secondary', 'higher_secondary'])
    .withMessage('Invalid academic level'),
];

// ── POST /campuses/:campusId/classes/seed-defaults ────────────────────────────
const seedDefaultsRules = [
  body('sessionId')
    .isInt({ min: 1 }).withMessage('sessionId is required and must be a positive integer'),
];

// ── POST /campuses/:campusId/classes/clone ─────────────────────────────────────
const cloneRules = [
  body('sourceSessionId')
    .isInt({ min: 1 }).withMessage('sourceSessionId is required and must be a positive integer'),
  body('targetSessionId')
    .isInt({ min: 1 }).withMessage('targetSessionId is required and must be a positive integer'),
];

module.exports = { listRules, classIdParamRules, createRules, updateRules, seedDefaultsRules, cloneRules };
