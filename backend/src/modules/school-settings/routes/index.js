const { Router } = require('express');
const authenticate      = require('../../../middlewares/authenticate');
const loadAbility       = require('../../../middlewares/loadAbility');
const requirePermission = require('../../../middlewares/requirePermission');
const validate          = require('../../../middlewares/validate');
const { updateRules }   = require('../validators/school-settings.validator');
const ctrl              = require('../controllers/school-settings.controller');

const router = Router();

router.get('/',
  authenticate, loadAbility,
  requirePermission('read', 'SchoolSettings'),
  ctrl.get);

router.patch('/',
  authenticate, loadAbility,
  updateRules, validate,
  requirePermission('update', 'SchoolSettings'),
  ctrl.update);

module.exports = router;
