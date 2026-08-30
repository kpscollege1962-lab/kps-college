const { Router } = require('express');
const authenticate      = require('../../../middlewares/authenticate');
const loadAbility       = require('../../../middlewares/loadAbility');
const requirePermission = require('../../../middlewares/requirePermission');
const validate          = require('../../../middlewares/validate');
const { listRules, feeStructureIdParamRules, upsertRules } = require('../validators/feeStructures.validator');
const ctrl = require('../controllers/feeStructures.controller');

// Mounted at /campuses/:campusId/fee-structures — mergeParams: true to access campusId
const router = Router({ mergeParams: true });

// ── Read — any authenticated user ─────────────────────────────────────────────
router.get('/',
  authenticate,
  listRules, validate,
  ctrl.list);

router.get('/:feeStructureId',
  authenticate,
  feeStructureIdParamRules, validate,
  ctrl.getOne);

// ── Write — Campus Admin (manage FeeStructure) ─────────────────────────────────
router.post('/',
  authenticate, loadAbility,
  upsertRules, validate,
  requirePermission('create', 'FeeStructure'),
  ctrl.upsert);

router.delete('/:feeStructureId',
  authenticate, loadAbility,
  feeStructureIdParamRules, validate,
  requirePermission('delete', 'FeeStructure'),
  ctrl.delete);

module.exports = router;