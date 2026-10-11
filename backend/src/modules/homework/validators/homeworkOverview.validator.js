const { query } = require('express-validator');

const overviewRules = [
  query('sessionId').isInt({ min: 1 }).withMessage('sessionId is required'),
  query('dueFrom').optional().isISO8601().withMessage('dueFrom must be a valid date'),
  query('dueTo').optional().isISO8601().withMessage('dueTo must be a valid date'),
];

const structureRules = [
  query('sessionId').isInt({ min: 1 }).withMessage('sessionId is required'),
];

module.exports = { overviewRules, structureRules };