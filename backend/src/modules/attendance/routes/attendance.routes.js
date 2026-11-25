const { Router } = require('express');
const authenticate = require('../../../middlewares/authenticate');
const loadAbility = require('../../../middlewares/loadAbility');
const requirePermission = require('../../../middlewares/requirePermission');
const validate = require('../../../middlewares/validate');
const {
  getMySectionsRules, getOrCreateSessionRules, saveRecordsRules, submitSessionRules, reopenSessionRules, updateRemarksRules,
  getRegisterRules, saveRegisterRules,
} = require('../validators/attendance.validator');
const {
  getMySectionsCtrl, getOrCreateSessionCtrl, saveRecordsCtrl, submitSessionCtrl, reopenSessionCtrl, updateRemarksCtrl,
  getRegisterCtrl, saveRegisterCtrl,
} = require('../controllers/attendance.controller');

const router = Router({ mergeParams: true });

router.get('/my-sections',
  authenticate, loadAbility,
  getMySectionsRules, validate,
  requirePermission('read', 'Attendance'),
  getMySectionsCtrl);

// One class on one date: the form master's "Attendance" tab (mark, save, submit) and the admin
// view (with parent / guardian contacts). The service enforces the form master and date rules.
router.get('/register',
  authenticate, loadAbility,
  getRegisterRules, validate,
  requirePermission('read', 'Attendance'),
  getRegisterCtrl);

router.put('/register',
  authenticate, loadAbility,
  saveRegisterRules, validate,
  requirePermission('update', 'Attendance'),
  saveRegisterCtrl);

router.post('/sessions',
  authenticate, loadAbility,
  getOrCreateSessionRules, validate,
  requirePermission('create', 'Attendance'),
  getOrCreateSessionCtrl);

router.put('/sessions/:attendanceSessionId/records',
  authenticate, loadAbility,
  saveRecordsRules, validate,
  requirePermission('update', 'Attendance'),
  saveRecordsCtrl);

router.post('/sessions/:attendanceSessionId/submit',
  authenticate, loadAbility,
  submitSessionRules, validate,
  requirePermission('submit', 'Attendance'),
  submitSessionCtrl);

router.post('/sessions/:attendanceSessionId/reopen',
  authenticate, loadAbility,
  reopenSessionRules, validate,
  requirePermission('reopen', 'Attendance'),
  reopenSessionCtrl);

router.patch('/records/:recordId/remarks',
  authenticate, loadAbility,
  updateRemarksRules, validate,
  requirePermission('updateRemarks', 'Attendance'),
  updateRemarksCtrl);

module.exports = router;
