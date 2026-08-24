const { Router } = require('express');
const authenticate      = require('../../../middlewares/authenticate');
const loadAbility       = require('../../../middlewares/loadAbility');
const requirePermission = require('../../../middlewares/requirePermission');
const validate          = require('../../../middlewares/validate');
const { listRules, levelParamRules, upsertRules } = require('../validators/registerEntries.validator');
const ctrl = require('../controllers/registerEntries.controller');

const router = Router({ mergeParams: true });

router.get('/',
  authenticate, loadAbility,
  listRules, validate,
  requirePermission('read', 'Student'),
  ctrl.list);

router.put('/:level',
  authenticate, loadAbility,
  upsertRules, validate,
  requirePermission('update', 'Student'),
  ctrl.upsert);

router.delete('/:level',
  authenticate, loadAbility,
  levelParamRules, validate,
  requirePermission('update', 'Student'),
  ctrl.remove);

module.exports = router;
