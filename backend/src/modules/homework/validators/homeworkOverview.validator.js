const { query } = require('express-validator');

const overviewRules = [
  query('sessionId').isInt({ min: 1 }).withMessage('sessionId is required'),
  // Range on the ASSIGNED date (either end may be left out), same as the teacher page.
  query('assignedFrom').optional().isISO8601().withMessage('assignedFrom must be a valid date'),
  query('assignedTo').optional().isISO8601().withMessage('assignedTo must be a valid date'),
  query('classGroupId').optional().isInt({ min: 1 }),
  query('sectionId').optional().isInt({ min: 1 }),
  query('subjectId').optional().isInt({ min: 1 }),
  query('staffId').optional().isInt({ min: 1 }),
];

const deletedRules = [
  query('sessionId').isInt({ min: 1 }).withMessage('sessionId is required'),
];

const structureRules = [
  query('sessionId').isInt({ min: 1 }).withMessage('sessionId is required'),
];

module.exports = { overviewRules, structureRules, deletedRules };