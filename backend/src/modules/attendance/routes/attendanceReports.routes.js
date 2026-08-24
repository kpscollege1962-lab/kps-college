const { Router } = require('express');
const authenticate = require('../../../middlewares/authenticate');
const loadAbility = require('../../../middlewares/loadAbility');
const requirePermission = require('../../../middlewares/requirePermission');
const validate = require('../../../middlewares/validate');
const {
  statusListReportRules, listReportSectionsRules, classRegisterReportRules,
} = require('../validators/attendanceReports.validator');
const {
  getStatusListReportCtrl, listReportSectionsCtrl, getClassRegisterReportCtrl,
} = require('../controllers/attendanceReports.controller');

const router = Router({ mergeParams: true });

router.get('/status-list',
  authenticate, loadAbility,
  statusListReportRules, validate,
  requirePermission('read', 'AttendanceReports'),
  getStatusListReportCtrl);

router.get('/sections',
  authenticate, loadAbility,
  listReportSectionsRules, validate,
  requirePermission('read', 'AttendanceReports'),
  listReportSectionsCtrl);

router.get('/class-register',
  authenticate, loadAbility,
  classRegisterReportRules, validate,
  requirePermission('read', 'AttendanceReports'),
  getClassRegisterReportCtrl);

module.exports = router;
