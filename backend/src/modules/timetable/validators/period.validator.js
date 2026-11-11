const { body } = require('express-validator');
const { campusIdParamRules, periodIdParamRules } = require('./timetable.validator');

// ── POST /periods ──────────────────────────────────────────────────────────────

const createPeriodRules = [
  ...campusIdParamRules,

    body('isAssembly')
    .optional()
    .isBoolean().withMessage('isAssembly must be true or false'),

  // A teaching period needs its number; the assembly gets number 0 automatically.
  body('periodNumber')
    .if((value, { req }) => req.body.isAssembly !== true && req.body.isAssembly !== 'true')
    .isInt({ min: 1 }).withMessage('Period number must be a positive integer'),
];

// ── PATCH /timings/batch

const batchUpdateTimingsRules = [
  ...campusIdParamRules,
  body('timings')
    .isArray({ min: 1 }).withMessage('timings must be a non-empty array'),
  body('timings.*.periodId')
    .isInt({ min: 1 }).withMessage('Each timing must have a valid periodId'),
  body('timings.*.config')
    .isIn(['full_day', 'half_day']).withMessage('Each timing config must be full_day or half_day'),
  body('timings.*.startTime')
    .optional({ nullable: true })
    .matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('startTime must be HH:MM or HH:MM:SS'),
  body('timings.*.endTime')
    .optional({ nullable: true })
    .matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('endTime must be HH:MM or HH:MM:SS'),
];

// ── DELETE /periods/:periodId — reuse shared rules ─────────────────────────────

const deletePeriodRules = [
  ...campusIdParamRules,
  ...periodIdParamRules,
];

// ── PATCH /periods/:periodId/breaks ──────────────────────────────────────────

const updateBreakRules = [
  ...campusIdParamRules,
  ...periodIdParamRules,

  body('fdBreakDuration')
    .optional({ nullable: true })
    .isInt({ min: 0, max: 120 })
    .withMessage('Full day break duration must be between 0 and 120 minutes'),

  body('hdBreakDuration')
    .optional({ nullable: true })
    .isInt({ min: 0, max: 120 })
    .withMessage('Half day break duration must be between 0 and 120 minutes'),

  // Shared slot assignment
  body('beforeSlots')
    .optional({ nullable: true })
    .isArray().withMessage('beforeSlots must be an array'),

  body('beforeSlots.*.classGroupId')
    .isInt({ min: 1 }).withMessage('Invalid classGroupId in beforeSlots'),

  body('beforeSlots.*.sectionId')
    .isInt({ min: 1 }).withMessage('Invalid sectionId in beforeSlots'),

  body('afterSlots')
    .optional({ nullable: true })
    .isArray().withMessage('afterSlots must be an array'),

  body('afterSlots.*.classGroupId')
    .isInt({ min: 1 }).withMessage('Invalid classGroupId in afterSlots'),

  body('afterSlots.*.sectionId')
    .isInt({ min: 1 }).withMessage('Invalid sectionId in afterSlots'),
];

module.exports = { createPeriodRules, batchUpdateTimingsRules, deletePeriodRules, updateBreakRules };
