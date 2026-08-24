const { param, query } = require('express-validator');

// ── Shared param rules (imported by period.validator and slot.validator) ────────

const campusIdParamRules = [
  param('campusId')
    .isInt({ min: 1 }).withMessage('Invalid campus ID'),
];

const periodIdParamRules = [
  param('periodId')
    .isInt({ min: 1 }).withMessage('Invalid period ID'),
];

// ── GET /class ─────────────────────────────────────────────────────────────────

const classTimetableQueryRules = [
  query('classGroupId')
    .isInt({ min: 1 }).withMessage('Invalid class ID'),

  query('sectionId')
    .optional()
    .isInt({ min: 1 }).withMessage('Invalid section ID'),
];

// ── GET / query ────────────────────────────────────────────────────────────────

const getTimetableQueryRules = [
  query('sessionId')
    .notEmpty().withMessage('Session ID is required')
    .isInt({ min: 1 }).withMessage('Session ID must be a valid identifier'),
];

module.exports = { campusIdParamRules, periodIdParamRules, classTimetableQueryRules, getTimetableQueryRules };
