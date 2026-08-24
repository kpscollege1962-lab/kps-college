const { Router } = require('express');
const authenticate      = require('../../../middlewares/authenticate');
const loadAbility       = require('../../../middlewares/loadAbility');
const requirePermission = require('../../../middlewares/requirePermission');
const validate          = require('../../../middlewares/validate');
const { listRules, idParamRules, createRules, updateRules } = require('../validators/students.validator');
const ctrl = require('../controllers/students.controller');

const router = Router();

router.get('/',
  authenticate, loadAbility,
  listRules, validate,
  requirePermission('read', 'Student'),
  ctrl.list);

router.get('/:studentId',
  authenticate, loadAbility,
  idParamRules, validate,
  requirePermission('read', 'Student'),
  ctrl.getOne);

router.post('/',
  authenticate, loadAbility,
  createRules, validate,
  requirePermission('create', 'Student'),
  ctrl.create);

router.patch('/:studentId',
  authenticate, loadAbility,
  updateRules, validate,
  requirePermission('update', 'Student'),
  ctrl.update);

router.use('/:studentId/register-entries', require('./registerEntries.routes'));

module.exports = router;
