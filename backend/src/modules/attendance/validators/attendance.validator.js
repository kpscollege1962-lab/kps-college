const { body, param, query } = require('express-validator');

// ── GET /my-sections ─────────────────────────────────────────────────────────────

const getMySectionsRules = [
  query('sessionId')
    .notEmpty().withMessage('Session ID is required')
    .isInt({ min: 1 }).withMessage('Session ID must be a valid identifier'),

  query('date')
    .notEmpty().withMessage('Date is required')
    .isISO8601().withMessage('Date must be a valid date'),
];

// ── POST /sessions ───────────────────────────────────────────────────────────────

const getOrCreateSessionRules = [
  body('date')
    .notEmpty().withMessage('Date is required')
    .isISO8601().withMessage('Date must be a valid date'),

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
];

// ── PUT /sessions/:attendanceSessionId/records ──────────────────────────────────

const saveRecordsRules = [
  param('attendanceSessionId')
    .isInt({ min: 1 }).withMessage('Invalid attendance session ID'),

  body('records')
    .isArray().withMessage('Records must be an array')
    .notEmpty().withMessage('Records must have at least one entry'),

  body('records.*.studentId')
    .notEmpty().withMessage('Student ID is required')
    .isInt({ min: 1 }).withMessage('Student ID must be a valid identifier'),

  body('records.*.status')
    .notEmpty().withMessage('Status is required')
    .isIn(['present', 'absent', 'late', 'leave']).withMessage('Invalid status'),

  body('records.*.remarks')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('Remarks must be at most 255 characters'),
];

// ── POST /sessions/:attendanceSessionId/submit ──────────────────────────────────

const submitSessionRules = [
  param('attendanceSessionId')
    .isInt({ min: 1 }).withMessage('Invalid attendance session ID'),
];

// ── POST /sessions/:attendanceSessionId/reopen ──────────────────────────────────

const reopenSessionRules = [
  param('attendanceSessionId')
    .isInt({ min: 1 }).withMessage('Invalid attendance session ID'),
];

// ── PATCH /records/:recordId/remarks ────────────────────────────────────────────

const updateRemarksRules = [
  param('recordId')
    .isInt({ min: 1 }).withMessage('Invalid attendance record ID'),

  body('remarks')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 }).withMessage('Remarks must be at most 255 characters'),
];

module.exports = {
  getMySectionsRules, getOrCreateSessionRules, saveRecordsRules, submitSessionRules, reopenSessionRules, updateRemarksRules,
};
