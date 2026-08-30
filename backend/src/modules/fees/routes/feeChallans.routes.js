const { Router } = require('express');
const authenticate      = require('../../../middlewares/authenticate');
const loadAbility       = require('../../../middlewares/loadAbility');
const requirePermission = require('../../../middlewares/requirePermission');
const validate          = require('../../../middlewares/validate');
const { challanIdParamRules, generateRules, listRules } = require('../validators/feeChallans.validator');
const ctrl = require('../controllers/feeChallans.controller');

// Mounted at /campuses/:campusId/fee-challans — mergeParams: true to access campusId
const router = Router({ mergeParams: true });

// ── Read — any authenticated user ─────────────────────────────────────────────
router.get('/',
  authenticate,
  listRules, validate,
  ctrl.list);

// NOTE: /generate must be defined BEFORE /:challanId to prevent that literal
// string being captured as a challanId param — same rule as classes routes.
router.post('/generate',
  authenticate, loadAbility,
  generateRules, validate,
  requirePermission('manage', 'FeeChallan'),
  ctrl.generate);

router.get('/:challanId',
  authenticate,
  challanIdParamRules, validate,
  ctrl.getOne);

router.patch('/:challanId/cancel',
  authenticate, loadAbility,
  challanIdParamRules, validate,
  requirePermission('manage', 'FeeChallan'),
  ctrl.cancel);

// ── Mount payments sub-routes ──────────────────────────────────────────────────
router.use('/:challanId/payments', require('./feePayments.routes'));

module.exports = router;