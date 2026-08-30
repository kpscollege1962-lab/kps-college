const { Router } = require('express');
const authenticate      = require('../../../middlewares/authenticate');
const loadAbility       = require('../../../middlewares/loadAbility');
const requirePermission = require('../../../middlewares/requirePermission');
const validate          = require('../../../middlewares/validate');
const { listRules, feeHeadIdParamRules, createRules, updateRules } = require('../validators/feeHeads.validator');
const ctrl = require('../controllers/feeHeads.controller');

// Mounted at /campuses/:campusId/fee-heads — mergeParams: true to access campusId
const router = Router({ mergeParams: true });

// ── Read — any authenticated user ─────────────────────────────────────────────
router.get('/',
  authenticate,
  listRules, validate,
  ctrl.list);

router.get('/:feeHeadId',
  authenticate,
  feeHeadIdParamRules, validate,
  ctrl.getOne);

// ── Write — Campus Admin (manage FeeHead) ──────────────────────────────────────
router.post('/',
  authenticate, loadAbility,
  createRules, validate,
  requirePermission('create', 'FeeHead'),
  ctrl.create);

router.patch('/:feeHeadId',
  authenticate, loadAbility,
  updateRules, validate,
  requirePermission('update', 'FeeHead'),
  ctrl.update);

router.delete('/:feeHeadId',
  authenticate, loadAbility,
  feeHeadIdParamRules, validate,
  requirePermission('delete', 'FeeHead'),
  ctrl.delete);

module.exports = router;