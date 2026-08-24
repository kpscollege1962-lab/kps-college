const { Router } = require('express');
const authenticate = require('../../../middlewares/authenticate');
const loadAbility = require('../../../middlewares/loadAbility');
const requirePermission = require('../../../middlewares/requirePermission');
const validate = require('../../../middlewares/validate');
const { listRules, addRules, removeRules, searchStaffRules } = require('../validators/classTeacherAssignments.validator');
const ctrl = require('../controllers/classTeacherAssignments.controller');

const router = Router({ mergeParams: true });

// ── Must be before / to keep route matching simple and explicit ────────────────
// no need of permission guard on staff search because this is required for staff assinging to the class/section, this is not complete staff read route, this is minimal staff info for assingning purpose
router.get('/staff-search',
  authenticate,
  searchStaffRules, validate,
  ctrl.searchStaff);

router.get('/',
  authenticate, loadAbility,
  listRules, validate,
  requirePermission('read', 'ClassTeacherAssignment'),
  ctrl.list);

router.post('/',
  authenticate, loadAbility,
  addRules, validate,
  requirePermission('create', 'ClassTeacherAssignment'),
  ctrl.add);

router.delete('/:assignmentId',
  authenticate, loadAbility,
  removeRules, validate,
  requirePermission('delete', 'ClassTeacherAssignment'),
  ctrl.remove);

module.exports = router;
