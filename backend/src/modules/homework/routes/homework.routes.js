const { Router } = require('express');
const authenticate = require('../../../middlewares/authenticate');
const loadAbility = require('../../../middlewares/loadAbility');
const requirePermission = require('../../../middlewares/requirePermission');
const validate = require('../../../middlewares/validate');
const upload = require('../../../middlewares/upload');
const { listRules, homeworkIdParamRules, createRules, updateRules } = require('../validators/homework.validator');
const { overviewRules, structureRules } = require('../validators/homeworkOverview.validator');
const ctrl = require('../controllers/homework.controller');
const overviewCtrl = require('../controllers/homeworkOverview.controller');

// Mounted at /campuses/:campusId/homework — mergeParams: true to access campusId
const router = Router({ mergeParams: true });

router.get('/',
  authenticate,
  listRules, validate,
  ctrl.list);

// ── Admin overview (Super Admin only: no other role is granted HomeworkOverview) ──
// NOTE: these must be defined BEFORE /:homeworkId, otherwise "overview" would be
// captured as a homeworkId (same rule as the classes routes).
router.get('/overview',
  authenticate, loadAbility,
  overviewRules, validate,
  requirePermission('read', 'HomeworkOverview'),
  overviewCtrl.overview);

router.get('/overview/structure',
  authenticate, loadAbility,
  structureRules, validate,
  requirePermission('read', 'HomeworkOverview'),
  overviewCtrl.structure);

router.get('/:homeworkId',
  authenticate,
  homeworkIdParamRules, validate,
  ctrl.getOne);

router.post('/',
  authenticate, loadAbility,
  upload.single('attachment'),
  createRules, validate,
  requirePermission('manage', 'Homework'),
  ctrl.create);

router.patch('/:homeworkId',
  authenticate, loadAbility,
  upload.single('attachment'),
  updateRules, validate,
  requirePermission('manage', 'Homework'),
  ctrl.update);

router.delete('/:homeworkId',
  authenticate, loadAbility,
  homeworkIdParamRules, validate,
  requirePermission('manage', 'Homework'),
  ctrl.delete);

// ── Mount submissions sub-routes ───────────────────────────────────────────
router.use('/:homeworkId/submissions', require('./homeworkSubmission.routes'));

module.exports = router;