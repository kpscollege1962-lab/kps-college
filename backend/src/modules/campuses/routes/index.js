const { Router } = require('express');
const authenticate      = require('../../../middlewares/authenticate');
const loadAbility       = require('../../../middlewares/loadAbility');
const requirePermission = require('../../../middlewares/requirePermission');
const validate          = require('../../../middlewares/validate');
const { listRules, idParamRules, createRules, updateRules } = require('../validators/campuses.validator');
const ctrl = require('../controllers/campuses.controller');

const router = Router();

router.get('/',
  authenticate,
  listRules, validate,
  ctrl.list);

router.get('/:id',
  authenticate, loadAbility,
  idParamRules, validate,
  requirePermission('read', 'Campus'),
  ctrl.getOne);

router.post('/',
  authenticate, loadAbility,
  createRules, validate,
  requirePermission('create', 'Campus'),
  ctrl.create);

router.patch('/:id',
  authenticate, loadAbility,
  updateRules, validate,
  requirePermission('update', 'Campus'),
  ctrl.update);


router.use('/:campusId/settings',   require('../../campus-settings/routes'));
router.use('/:campusId/timetable/preview', require('../../timetable/routes/timetablePreview.routes'));
router.use('/:campusId/timetable',  require('../../timetable/routes/timetable.routes'));
router.use('/:campusId/classes',    require('../../classes/routes/classes.routes'));
router.use('/:campusId/class-teacher-assignments', require('../../class-teacher-assignments/routes/classTeacherAssignments.routes'));
router.use('/:campusId/attendance/reports', require('../../attendance/routes/attendanceReports.routes'));
router.use('/:campusId/attendance',         require('../../attendance/routes/attendance.routes'));

router.use('/:campusId/fee-heads',      require('../../fees/routes/feeHeads.routes'));
router.use('/:campusId/fee-structures', require('../../fees/routes/feeStructures.routes'));
router.use('/:campusId/fee-challans', require('../../fees/routes/feeChallans.routes'));
router.use('/:campusId/fee-class-setup', require('../../fees/routes/classFeeAssignment.routes'));
module.exports = router;
