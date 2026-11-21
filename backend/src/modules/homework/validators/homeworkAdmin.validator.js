const { body, param } = require('express-validator');

const idRules = [
  param('homeworkId').isInt({ min: 1 }).withMessage('Invalid assignment id'),
];

// Admins change only the text and the dates (not the class, subject, teacher or type).
const adminUpdateRules = [
  ...idRules,
  body('description').optional().isString().trim()
    .notEmpty().withMessage('The text cannot be empty: delete the assignment instead')
    .isLength({ max: 5000 }).withMessage('The text is too long'),
  body('assignedDate').optional().isISO8601().withMessage('Invalid assigned date'),
  body('dueDate').optional().isISO8601().withMessage('Invalid due date'),
];

module.exports = { idRules, adminUpdateRules };
