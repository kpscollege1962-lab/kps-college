const { body, param } = require('express-validator');

// ── :sectionId param ───────────────────────────────────────────────────────────
const sectionIdParamRules = [
  param('sectionId')
    .isInt({ min: 1 }).withMessage('Invalid section ID'),
];

// ── POST /campuses/:campusId/classes/:classGroupId/sections ────────────────────
const createRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Section name is required')
    .isLength({ max: 50 }).withMessage('Section name must not exceed 50 characters'),
];

// ── PATCH /campuses/:campusId/classes/:classGroupId/sections/:sectionId ────────
const updateRules = [
  ...sectionIdParamRules,
  body('name')
    .trim()
    .notEmpty().withMessage('Section name is required')
    .isLength({ max: 50 }).withMessage('Section name must not exceed 50 characters'),
];

module.exports = { sectionIdParamRules, createRules, updateRules };
