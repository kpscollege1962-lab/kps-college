const { Router } = require('express');
const authenticate      = require('../../../middlewares/authenticate');
const loadAbility       = require('../../../middlewares/loadAbility');
const requirePermission = require('../../../middlewares/requirePermission');
const validate          = require('../../../middlewares/validate');
const { listRules, idParamRules, createRules, updateRules } = require('../validators/subjects.validator');
const ctrl = require('../controllers/subjects.controller');

const router = Router();

// Read routes — authenticate only, no permission gate (global reference data)
router.get('/',
  authenticate,
  listRules, validate,
  ctrl.list);

router.get('/:subjectId',
  authenticate,
  idParamRules, validate,
  ctrl.getOne);

// Write routes
router.post('/',
  authenticate, loadAbility,
  createRules, validate,
  requirePermission('create', 'Subject'),
  ctrl.create);

router.patch('/:subjectId',
  authenticate, loadAbility,
  updateRules, validate,
  requirePermission('update', 'Subject'),
  ctrl.update);

router.delete('/:subjectId',
  authenticate, loadAbility,
  idParamRules, validate,
  requirePermission('delete', 'Subject'),
  ctrl.delete);

module.exports = router;
