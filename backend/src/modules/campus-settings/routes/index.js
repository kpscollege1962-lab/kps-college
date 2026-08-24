const { Router } = require('express');
const authenticate      = require('../../../middlewares/authenticate');
const loadAbility       = require('../../../middlewares/loadAbility');
const requirePermission = require('../../../middlewares/requirePermission');
const validate          = require('../../../middlewares/validate');
const { updateRules }   = require('../validators/campus-settings.validator');
const ctrl              = require('../controllers/campus-settings.controller');

// mergeParams: true is required so req.params.campusId flows in from the parent campuses router
const router = Router({ mergeParams: true });

router.get('/',
  authenticate, loadAbility,
  requirePermission('read', 'CampusSettings'),
  ctrl.get);

router.patch('/',
  authenticate, loadAbility,
  updateRules, validate,
  requirePermission('update', 'CampusSettings'),
  ctrl.update);

module.exports = router;
