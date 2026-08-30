const { body, param } = require('express-validator');

const paymentIdParamRules = [
  param('paymentId').isInt({ min: 1 }).withMessage('Invalid payment ID'),
];

const createPaymentRules = [
  body('amount').isFloat({ min: 0.01 }).withMessage('amount is required and must be greater than 0'),
  body('paymentDate').optional().isISO8601().withMessage('paymentDate must be a valid date').toDate(),
  body('method').optional().isIn(['cash', 'bank_transfer', 'online', 'cheque']).withMessage('Invalid payment method'),
  body('referenceNo').optional().trim().isLength({ max: 100 }),
  body('notes').optional().trim(),
];

module.exports = { paymentIdParamRules, createPaymentRules };