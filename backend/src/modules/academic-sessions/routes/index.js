const { Router } = require('express');
const authenticate      = require('../../../middlewares/authenticate');
const loadAbility       = require('../../../middlewares/loadAbility');
const requirePermission = require('../../../middlewares/requirePermission');
const validate          = require('../../../middlewares/validate');
const { listRules, idParamRules, createRules, updateRules } = require('../validators/academicSessions.validator');
const ctrl = require('../controllers/academicSessions.controller');

const router = Router({ mergeParams: true });

// ── Read routes — authenticate only, no permission gate ───────────────────────
router.get('/',
  authenticate,
  listRules, validate,
  ctrl.list);

router.get('/:id',
  authenticate,
  idParamRules, validate,
  ctrl.getOne);

// ── Write routes — granular permission gates ──────────────────────────────────
router.post('/',
  authenticate, loadAbility,
  createRules, validate,
  requirePermission('create', 'AcademicSession'),
  ctrl.create);

router.patch('/:id/status',
  authenticate, loadAbility,
  idParamRules, validate,
  requirePermission('update', 'AcademicSession'),
  ctrl.transition);

router.patch('/:id',
  authenticate, loadAbility,
  updateRules, validate,
  requirePermission('update', 'AcademicSession'),
  ctrl.update);

router.delete('/:id',
  authenticate, loadAbility,
  idParamRules, validate,
  requirePermission('delete', 'AcademicSession'),
  ctrl.delete);

module.exports = router;
