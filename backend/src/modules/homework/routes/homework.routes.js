const { Router } = require('express');
const authenticate = require('../../../middlewares/authenticate');
const loadAbility = require('../../../middlewares/loadAbility');
const requirePermission = require('../../../middlewares/requirePermission');
const validate = require('../../../middlewares/validate');
const upload = require('../../../middlewares/upload');
const { listRules, homeworkIdParamRules, createRules, updateRules } = require('../validators/homework.validator');
const { overviewRules, structureRules, deletedRules } = require('../validators/homeworkOverview.validator');
const { idRules: adminIdRules, adminUpdateRules } = require('../validators/homeworkAdmin.validator');
const { mineRules, reportRules, batchRules } = require('../validators/homeworkWorkspace.validator');
const ctrl = require('../controllers/homework.controller');
const overviewCtrl = require('../controllers/homeworkOverview.controller');
const brandingCtrl = require('../controllers/homeworkBranding.controller');
const workspaceCtrl = require('../controllers/homeworkWorkspace.controller');
const adminCtrl = require('../controllers/homeworkAdmin.controller');

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

// Admin overview: Super Admin, School Admin, Campus Admin and Principal (read HomeworkOverview,
// campus-scoped by the ability factory). Teachers have no HomeworkOverview rule, so they get 403.
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

// Recently deleted (soft-deleted) assignments, for Restore / Delete permanently
router.get('/overview/deleted',
  authenticate, loadAbility,
  deletedRules, validate,
  requirePermission('restore', 'HomeworkOverview'),
  overviewCtrl.deleted);

// ── Admin actions on any teacher's assignment (never on Homework: teachers have manage Homework) ──
router.patch('/admin/:homeworkId',
  authenticate, loadAbility,
  adminUpdateRules, validate,
  requirePermission('update', 'HomeworkOverview'),
  adminCtrl.update);

router.delete('/admin/:homeworkId',
  authenticate, loadAbility,
  adminIdRules, validate,
  requirePermission('delete', 'HomeworkOverview'),
  adminCtrl.delete);

router.post('/admin/:homeworkId/restore',
  authenticate, loadAbility,
  adminIdRules, validate,
  requirePermission('restore', 'HomeworkOverview'),
  adminCtrl.restore);

router.delete('/admin/:homeworkId/permanent',
  authenticate, loadAbility,
  adminIdRules, validate,
  requirePermission('restore', 'HomeworkOverview'),
  adminCtrl.permanentDelete);

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