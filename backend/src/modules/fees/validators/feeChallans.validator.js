const { query, body, param } = require('express-validator');

const challanIdParamRules = [
  param('challanId').isInt({ min: 1 }).withMessage('Invalid challan ID'),
];

const generateRules = [
  body('sessionId').isInt({ min: 1 }).withMessage('sessionId is required and must be a positive integer'),
  body('month').isInt({ min: 1, max: 12 }).withMessage('month is required and must be between 1 and 12'),
  body('year').isInt({ min: 2000, max: 2100 }).withMessage('year is required and must be a valid year'),
  body('classGroupId').optional().isInt({ min: 1 }).withMessage('classGroupId must be a positive integer'),
];

const listRules = [
  query('sessionId').isInt({ min: 1 }).withMessage('sessionId is required and must be a positive integer'),
  query('classGroupId').optional().isInt({ min: 1 }),
  query('sectionId').optional().isInt({ min: 1 }),
  query('status').optional().isIn(['unpaid', 'partial', 'paid', 'overdue', 'cancelled']).withMessage('Invalid status filter'),
  query('month').optional().isInt({ min: 1, max: 12 }),
  query('year').optional().isInt({ min: 2000, max: 2100 }),
  query('search').optional().trim(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];

module.exports = { challanIdParamRules, generateRules, listRules };