const { query, body, param } = require('express-validator');

const homeworkIdParamRules = [
  param('homeworkId').isInt({ min: 1 }).withMessage('Invalid homework ID'),
];

const listRules = [
  query('sessionId').isInt({ min: 1 }).withMessage('sessionId is required'),
  query('classGroupId').isInt({ min: 1 }).withMessage('classGroupId is required'),
  query('sectionId').isInt({ min: 1 }).withMessage('sectionId is required'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];

const createRules = [
  body('sessionId').isInt({ min: 1 }).withMessage('sessionId is required'),
  body('classGroupId').isInt({ min: 1 }).withMessage('classGroupId is required'),
  body('sectionId').isInt({ min: 1 }).withMessage('sectionId is required'),
  body('subjectId').isInt({ min: 1 }).withMessage('subjectId is required'),
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('description').optional({ values: 'falsy' }).trim(),
  body('dueDate').isISO8601().withMessage('A valid dueDate is required'),
  body('type').isIn(['homework', 'classwork']).withMessage('type must be homework or classwork'),
];

const updateRules = [
  ...homeworkIdParamRules,
  body('title').optional({ values: 'falsy' }).trim().notEmpty().isLength({ max: 200 }),
  body('description').optional({ values: 'falsy' }).trim(),
  body('dueDate').optional().isISO8601(),
  body('type').optional().isIn(['homework', 'classwork']),
];

module.exports = { homeworkIdParamRules, listRules, createRules, updateRules };