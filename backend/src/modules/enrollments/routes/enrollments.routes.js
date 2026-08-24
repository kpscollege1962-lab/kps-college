const { Router } = require('express');
const authenticate      = require('../../../middlewares/authenticate');
const loadAbility       = require('../../../middlewares/loadAbility');
const requirePermission = require('../../../middlewares/requirePermission');
const validate          = require('../../../middlewares/validate');
const { listRules, idParamRules, createRules, deleteRules, eligibleStudentsRules } = require('../validators/enrollments.validator');
const ctrl = require('../controllers/enrollments.controller');

const router = Router();

router.get('/',
  authenticate, loadAbility,
  listRules, validate,
  requirePermission('read', 'Enrollment'),
  ctrl.list);

router.get('/eligible-students',
  authenticate, loadAbility,
  eligibleStudentsRules, validate,
  requirePermission('create', 'Enrollment'),
  ctrl.searchEligibleStudents);

router.get('/:enrollmentId',
  authenticate, loadAbility,
  idParamRules, validate,
  requirePermission('read', 'Enrollment'),
  ctrl.getOne);

router.post('/',
  authenticate, loadAbility,
  createRules, validate,
  requirePermission('create', 'Enrollment'),
  ctrl.create);

router.delete('/:enrollmentId',
  authenticate, loadAbility,
  deleteRules, validate,
  requirePermission('delete', 'Enrollment'),
  ctrl.delete);

module.exports = router;
