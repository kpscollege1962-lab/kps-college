const { query, body, param } = require('express-validator');

// ── :feeStructureId param ────────────────────────────────────────────────────────
const feeStructureIdParamRules = [
  param('feeStructureId')
    .isInt({ min: 1 }).withMessage('Invalid fee structure ID'),
];

// ── GET /campuses/:campusId/fee-structures ───────────────────────────────────────
const listRules = [
  query('sessionId')
    .isInt({ min: 1 }).withMessage('sessionId is required and must be a positive integer'),
  query('classGroupId')
    .optional()
    .isInt({ min: 1 }).withMessage('classGroupId must be a positive integer'),
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
];

// ── POST /campuses/:campusId/fee-structures (upsert) ─────────────────────────────
const upsertRules = [
  body('sessionId')
    .isInt({ min: 1 }).withMessage('sessionId is required and must be a positive integer'),
  body('classGroupId')
    .isInt({ min: 1 }).withMessage('classGroupId is required and must be a positive integer'),
  body('sectionId')
    .optional({ values: 'null' })
    .isInt({ min: 1 }).withMessage('sectionId must be a positive integer or null'),
  body('feeHeadId')
    .isInt({ min: 1 }).withMessage('feeHeadId is required and must be a positive integer'),
  body('amount')
    .isFloat({ min: 0 }).withMessage('amount is required and must be a non-negative number'),
  body('dueDay')
    .isInt({ min: 1, max: 31 }).withMessage('dueDay is required and must be between 1 and 31'),
];

module.exports = { listRules, feeStructureIdParamRules, upsertRules };