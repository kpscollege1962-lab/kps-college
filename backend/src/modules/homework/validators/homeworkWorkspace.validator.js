const { body, query } = require('express-validator');

const mineRules = [
  query('sessionId').isInt({ min: 1 }).withMessage('sessionId is required'),
  query('assignedDate').optional().isISO8601().withMessage('Invalid assigned date'),
  query('dueDate').optional().isISO8601().withMessage('Invalid due date'),
  query('assignedFrom').optional().isISO8601().withMessage('Invalid from date'),
  query('assignedTo').optional().isISO8601().withMessage('Invalid to date'),
  query('classGroupId').optional().isInt({ min: 1 }),
  query('sectionId').optional().isInt({ min: 1 }),
  query('subjectId').optional().isInt({ min: 1 }),
];

// Class-wide proforma for a form-master class.
const reportRules = [
  query('sessionId').isInt({ min: 1 }).withMessage('sessionId is required'),
  query('classGroupId').isInt({ min: 1 }).withMessage('classGroupId is required'),
  query('sectionId').isInt({ min: 1 }).withMessage('sectionId is required'),
];

const batchRules = [
  body('sessionId').isInt({ min: 1 }).withMessage('sessionId is required'),
  body('assignedDate').isISO8601().withMessage('Assigned date is required'),
  body('dueDate').isISO8601().withMessage('Due date is required'),
  body('classwork').optional({ values: 'falsy' }).isString().trim()
    .isLength({ max: 5000 }).withMessage('Classwork is too long'),
  body('homework').optional({ values: 'falsy' }).isString().trim()
    .isLength({ max: 5000 }).withMessage('Homework is too long'),
  body('targets').isArray({ min: 1, max: 60 }).withMessage('Choose at least one class and subject'),
  body('targets.*.classGroupId').isInt({ min: 1 }),
  body('targets.*.sectionId').isInt({ min: 1 }),
  body('targets.*.subjectId').isInt({ min: 1 }),
];

module.exports = { mineRules, reportRules, batchRules };