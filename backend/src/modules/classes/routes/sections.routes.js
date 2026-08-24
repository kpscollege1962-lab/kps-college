const { Router } = require('express');
const authenticate      = require('../../../middlewares/authenticate');
const loadAbility       = require('../../../middlewares/loadAbility');
const requirePermission = require('../../../middlewares/requirePermission');
const validate          = require('../../../middlewares/validate');
const { sectionIdParamRules, createRules, updateRules } = require('../validators/sections.validator');
const ctrl = require('../controllers/sections.controller');

// Mounted at /:classGroupId/sections inside classes.routes.js — mergeParams: true
const router = Router({ mergeParams: true });

// ── Read — any authenticated user ─────────────────────────────────────────────
router.get('/',
  authenticate,
  ctrl.list);

router.get('/:sectionId',
  authenticate,
  sectionIdParamRules, validate,
  ctrl.getOne);

// ── Write — Campus Admin (manage ClassGroup — classes and sections share subject) ──
router.post('/',
  authenticate, loadAbility,
  createRules, validate,
  requirePermission('create', 'ClassGroup'),
  ctrl.create);

router.patch('/:sectionId',
  authenticate, loadAbility,
  updateRules, validate,
  requirePermission('update', 'ClassGroup'),
  ctrl.update);

router.delete('/:sectionId',
  authenticate, loadAbility,
  sectionIdParamRules, validate,
  requirePermission('delete', 'ClassGroup'),
  ctrl.delete);

module.exports = router;
