const { body, param } = require('express-validator');
const { campusIdParamRules, periodIdParamRules } = require('./timetable.validator');

// ── Shared slot param rules ────────────────────────────────────────────────────

const slotParamRules = [
  ...campusIdParamRules,
  ...periodIdParamRules,

  param('classGroupId')
    .isInt({ min: 1 }).withMessage('Invalid class ID'),

  param('sectionId')
    .isInt({ min: 1 }).withMessage('Invalid section ID'),
];

// ── PUT /periods/:periodId/classes/:classGroupId/sections/:sectionId/slot ──────

const upsertSlotRules = [
  ...slotParamRules,

  body('label')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 100 }).withMessage('Label must not exceed 100 characters'),

  body('subjectId1')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('Invalid subject ID'),

  body('subjectId2')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('Invalid subject ID')
    .custom((subjectId2, { req }) => {
      const subjectId1 = req.body.subjectId1
      if (subjectId2 != null && subjectId1 != null && parseInt(subjectId2) === parseInt(subjectId1)) {
        throw new Error('Alternate subject cannot be the same as the primary subject')
      }
      return true
    }),

  body('staffId1')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('Invalid staff ID'),

  body('staffId2')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('Invalid staff ID'),
];

// ── DELETE /periods/:periodId/classes/:classGroupId/sections/:sectionId/slot ───

const clearSlotRules = [...slotParamRules];

// ── POST /slots/swap ────────────────────────────────────────────────────────────

const swapSlotsRules = [
  ...campusIdParamRules,
  body('slotA').exists().withMessage('slotA is required'),
  body('slotA.periodId').isInt({ min: 1 }).withMessage('Invalid slotA.periodId'),
  body('slotA.classGroupId').isInt({ min: 1 }).withMessage('Invalid slotA.classGroupId'),
  body('slotA.sectionId').isInt({ min: 1 }).withMessage('Invalid slotA.sectionId'),
  body('slotB').exists().withMessage('slotB is required'),
  body('slotB.periodId').isInt({ min: 1 }).withMessage('Invalid slotB.periodId'),
  body('slotB.classGroupId').isInt({ min: 1 }).withMessage('Invalid slotB.classGroupId'),
  body('slotB.sectionId').isInt({ min: 1 }).withMessage('Invalid slotB.sectionId'),
];

module.exports = { upsertSlotRules, clearSlotRules, swapSlotsRules };
