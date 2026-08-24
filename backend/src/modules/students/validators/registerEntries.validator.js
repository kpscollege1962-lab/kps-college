const { body, param } = require('express-validator');

const VALID_LEVELS = ['pre_primary', 'primary', 'middle', 'secondary', 'higher_secondary'];

const studentIdParamRules = [
  param('studentId')
    .isInt({ min: 1 }).withMessage('Invalid student ID'),
];

const levelParamRules = [
  ...studentIdParamRules,
  param('level')
    .isIn(VALID_LEVELS).withMessage('Invalid register level. Must be one of: pre_primary, primary, middle, secondary, higher_secondary'),
];

const listRules = [...studentIdParamRules];

const upsertRules = [
  ...levelParamRules,

  body('admission_no')
    .trim()
    .notEmpty().withMessage('Admission number is required')
    .isLength({ max: 50 }).withMessage('Admission number must not exceed 50 characters'),

  body('entry_date')
    .optional()
    .isISO8601().withMessage('Entry date must be a valid date'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Notes must not exceed 500 characters'),

  body('class_of_admission')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 100 }).withMessage('Class of admission must not exceed 100 characters'),
];

module.exports = { listRules, levelParamRules, upsertRules };
