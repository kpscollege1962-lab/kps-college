const { Router } = require('express');
const authenticate = require('../../../middlewares/authenticate');
const loadAbility = require('../../../middlewares/loadAbility');
const requirePermission = require('../../../middlewares/requirePermission');
const validate = require('../../../middlewares/validate');
const upload = require('../../../middlewares/upload');
const { listRules, homeworkIdParamRules, createRules, updateRules } = require('../validators/homework.validator');
const { overviewRules, structureRules } = require('../validators/homeworkOverview.validator');
const { mineRules, reportRules, batchRules } = require('../validators/homeworkWorkspace.validator');
const ctrl = require('../controllers/homework.controller');
const overviewCtrl = require('../controllers/homeworkOverview.controller');
const brandingCtrl = require('../controllers/homeworkBranding.controller');
const workspaceCtrl = require('../controllers/homeworkWorkspace.controller');

const router = Router({ mergeParams: true });

router.get('/',
  authenticate, loadAbility,
  listRules, validate,
  ctrl.list);

// Sheet branding (title + watermark image URLs). Any signed-in user may read it.
router.get('/branding',
  authenticate,
  brandingCtrl.branding);

// The teacher's own assignments, with filters (assigned date, due date, class, subject)
router.get('/mine',
  authenticate, loadAbility,
  mineRules, validate,
  requirePermission('manage', 'Homework'),
  workspaceCtrl.mine);

// Form master's class-wide proforma (403 unless the caller has Period 1 in that class)
router.get('/form-master-report',
  authenticate, loadAbility,
  reportRules, validate,
  requirePermission('manage', 'Homework'),
  workspaceCtrl.report);

// Post classwork and/or homework to several classes with one save
router.post('/batch',
  authenticate, loadAbility,
  batchRules, validate,
  requirePermission('manage', 'Homework'),
  workspaceCtrl.batch);

// Admin overview (Super Admin only: no other role is granted HomeworkOverview)
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

router.use('/:homeworkId/submissions', require('./homeworkSubmission.routes'));

module.exports = router;