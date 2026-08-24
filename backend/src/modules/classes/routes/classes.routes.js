const { Router } = require('express');
const authenticate      = require('../../../middlewares/authenticate');
const loadAbility       = require('../../../middlewares/loadAbility');
const requirePermission = require('../../../middlewares/requirePermission');
const validate          = require('../../../middlewares/validate');
const { listRules, classIdParamRules, createRules, updateRules, seedDefaultsRules, cloneRules } = require('../validators/classes.validator');
const ctrl = require('../controllers/classes.controller');

// Mounted at /campuses/:campusId/classes — mergeParams: true to access campusId
const router = Router({ mergeParams: true });

// ── Read — any authenticated user ─────────────────────────────────────────────
router.get('/',
  authenticate,
  listRules, validate,
  ctrl.list);

router.get('/:classGroupId',
  authenticate,
  classIdParamRules, validate,
  ctrl.getOne);

// ── Write — Campus Admin (manage ClassGroup) ───────────────────────────────────
// NOTE: /seed-defaults and /clone must be defined BEFORE /:classGroupId
// to prevent those literal strings being captured as a classGroupId param.
router.post('/seed-defaults',
  authenticate, loadAbility,
  seedDefaultsRules, validate,
  requirePermission('create', 'ClassGroup'),
  ctrl.seedDefaults);

router.post('/clone',
  authenticate, loadAbility,
  cloneRules, validate,
  requirePermission('create', 'ClassGroup'),
  ctrl.clone);

router.post('/',
  authenticate, loadAbility,
  createRules, validate,
  requirePermission('create', 'ClassGroup'),
  ctrl.create);

router.patch('/:classGroupId',
  authenticate, loadAbility,
  updateRules, validate,
  requirePermission('update', 'ClassGroup'),
  ctrl.update);

router.delete('/:classGroupId',
  authenticate, loadAbility,
  classIdParamRules, validate,
  requirePermission('delete', 'ClassGroup'),
  ctrl.delete);

// ── Mount sections sub-routes ──────────────────────────────────────────────────
router.use('/:classGroupId/sections', require('./sections.routes'));

module.exports = router;
