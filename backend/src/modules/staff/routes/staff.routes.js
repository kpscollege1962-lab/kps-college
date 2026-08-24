const { Router } = require('express');
const authenticate = require('../../../middlewares/authenticate');
const loadAbility = require('../../../middlewares/loadAbility');
const requirePermission = require('../../../middlewares/requirePermission');
const validate = require('../../../middlewares/validate');
const {
  listRules, idParamRules, createRules, updateRules, searchEligibleRules,
} = require('../validators/staff.validator');
const ctrl = require('../controllers/staff.controller');

const router = Router();

router.get('/',
  authenticate, loadAbility,
  listRules, validate,
  requirePermission('read', 'Staff'),
  ctrl.list);

router.post('/',
  authenticate, loadAbility,
  createRules, validate,
  requirePermission('create', 'Staff'),
  ctrl.create);

// ── Must be before /:staffId to prevent 'eligible' being captured as a param ──
router.get('/eligible',
  authenticate,
  searchEligibleRules, validate, //no need of permission guard, its minimal staff data required for staff search for adding staff to a campus, its not a full staff data read
  ctrl.searchEligible);

router.get('/:staffId',
  authenticate, loadAbility,
  idParamRules, validate,
  requirePermission('read', 'Staff'),
  ctrl.getOne);

router.patch('/:staffId',
  authenticate, loadAbility,
  updateRules, validate,
  requirePermission('update', 'Staff'),
  ctrl.update);

// ── Mount staffPosting sub-routes ──────────────────────────────────────────────
router.use(require('./staffPosting.routes'));

module.exports = router;
