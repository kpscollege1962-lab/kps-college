const { Router } = require('express');
const authenticate      = require('../../../middlewares/authenticate');
const loadAbility       = require('../../../middlewares/loadAbility');
const requirePermission = require('../../../middlewares/requirePermission');
const validate          = require('../../../middlewares/validate');
const { paymentIdParamRules, createPaymentRules } = require('../validators/feePayments.validator');
const ctrl = require('../controllers/feePayments.controller');

// Mounted at /campuses/:campusId/fee-challans/:challanId/payments
const router = Router({ mergeParams: true });

router.post('/',
  authenticate, loadAbility,
  createPaymentRules, validate,
  requirePermission('manage', 'FeePayment'),
  ctrl.create);

router.delete('/:paymentId',
  authenticate, loadAbility,
  paymentIdParamRules, validate,
  requirePermission('manage', 'FeePayment'),
  ctrl.delete);

module.exports = router;