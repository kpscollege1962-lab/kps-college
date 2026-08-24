const { Router } = require('express');
const authenticate = require('../../../middlewares/authenticate');
const loadAbility = require('../../../middlewares/loadAbility');
const requirePermission = require('../../../middlewares/requirePermission');
const validate = require('../../../middlewares/validate');
const {
  getMySectionsRules, getOrCreateSessionRules, saveRecordsRules, submitSessionRules, reopenSessionRules, updateRemarksRules,
} = require('../validators/attendance.validator');
const {
  getMySectionsCtrl, getOrCreateSessionCtrl, saveRecordsCtrl, submitSessionCtrl, reopenSessionCtrl, updateRemarksCtrl,
} = require('../controllers/attendance.controller');

const router = Router({ mergeParams: true });

router.get('/my-sections',
  authenticate, loadAbility,
  getMySectionsRules, validate,
  requirePermission('read', 'Attendance'),
  getMySectionsCtrl);

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
