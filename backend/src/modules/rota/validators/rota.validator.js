const { body, param, query } = require('express-validator');

const campusParam = param('campusId').isInt({ min: 1 }).withMessage('Invalid campus');
const dateRule = (field) => field.isISO8601({ strict: true }).withMessage('Invalid date').bail()
  .customSanitizer((v) => String(v).slice(0, 10));

const getRules = [campusParam, dateRule(query('date'))];

const saveRules = [
  campusParam,
  dateRule(param('date')),
  body('status').isIn(['draft', 'issued']).withMessage('status must be draft or issued'),
  body('absentStaffIds').isArray({ max: 200 }).withMessage('absentStaffIds must be a list'),
  body('absentStaffIds.*').isInt({ min: 1 }).toInt(),
  body('entries').isArray({ max: 500 }).withMessage('entries must be a list'),
  body('entries.*.periodId').isInt({ min: 1 }).toInt(),
  body('entries.*.classGroupId').isInt({ min: 1 }).toInt(),
  body('entries.*.sectionId').isInt({ min: 1 }).toInt(),
  body('entries.*.absentStaffId').isInt({ min: 1 }).toInt(),
  body('entries.*.substituteStaffId').optional({ values: 'null' }).isInt({ min: 1 }).toInt(),
  body('entries.*.forced').optional().isBoolean().toBoolean(),
  body('entries.*.forceReason').optional({ values: 'null' }).isString().trim()
    .isLength({ max: 255 }).withMessage('Force reason is too long'),
];

const deleteRules = [campusParam, dateRule(param('date'))];

module.exports = { getRules, saveRules, deleteRules };
