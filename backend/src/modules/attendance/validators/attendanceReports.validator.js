const { query } = require('express-validator');

const statusListReportRules = [
  query('sessionId')
    .notEmpty().withMessage('Session ID is required')
    .isInt({ min: 1 }).withMessage('Session ID must be a valid identifier'),

  query('dateFrom')
    .notEmpty().withMessage('Start date is required')
    .isISO8601().withMessage('Start date must be a valid date'),

  query('dateTo')
    .notEmpty().withMessage('End date is required')
    .isISO8601().withMessage('End date must be a valid date')
    .custom((value, { req }) => {
      if (new Date(value) < new Date(req.query.dateFrom)) {
        throw new Error('End date must be on or after the start date');
      }
      return true;
    }),

  query('statuses')
    .optional()
    .custom((value) => {
      const allowed = ['present', 'absent', 'late', 'leave'];
      const values = value.split(',');
      if (!values.every((s) => allowed.includes(s))) {
        throw new Error('Invalid status value');
      }
      return true;
    }),
];

const listReportSectionsRules = [
  query('sessionId')
    .notEmpty().withMessage('Session ID is required')
    .isInt({ min: 1 }).withMessage('Session ID must be a valid identifier'),
];

const classRegisterReportRules = [
  query('sessionId')
    .notEmpty().withMessage('Session ID is required')
    .isInt({ min: 1 }).withMessage('Session ID must be a valid identifier'),

  query('sectionId')
    .notEmpty().withMessage('Section ID is required')
    .isInt({ min: 1 }).withMessage('Section ID must be a valid identifier'),

  query('dateFrom')
    .notEmpty().withMessage('Start date is required')
    .isISO8601().withMessage('Start date must be a valid date'),

  query('dateTo')
    .notEmpty().withMessage('End date is required')
    .isISO8601().withMessage('End date must be a valid date')
    .custom((value, { req }) => {
      if (new Date(value) < new Date(req.query.dateFrom)) {
        throw new Error('End date must be on or after the start date');
      }
      return true;
    }),
];

module.exports = { statusListReportRules, listReportSectionsRules, classRegisterReportRules };
