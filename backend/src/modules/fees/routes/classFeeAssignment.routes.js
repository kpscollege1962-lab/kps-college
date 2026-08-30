const { Router } = require('express');
const authenticate      = require('../../../middlewares/authenticate');
const loadAbility       = require('../../../middlewares/loadAbility');
const requirePermission = require('../../../middlewares/requirePermission');
const validate          = require('../../../middlewares/validate');
const { getSetupRules, assignRules } = require('../validators/classFeeAssignment.validator');
const ctrl = require('../controllers/classFeeAssignment.controller');

// Mounted at /campuses/:campusId/fee-class-setup/:classGroupId
const router = Router({ mergeParams: true });

router.get('/:classGroupId',
  authenticate, loadAbility,
  getSetupRules, validate,
  requirePermission('manage', 'FeeStructure'),
  ctrl.getSetup);

router.post('/:classGroupId',
  authenticate, loadAbility,
  assignRules, validate,
  requirePermission('manage', 'FeeStructure'),
  ctrl.assign);

module.exports = router;