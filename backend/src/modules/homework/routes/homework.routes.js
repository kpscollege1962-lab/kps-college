const { Router } = require('express');
const authenticate = require('../../../middlewares/authenticate');
const loadAbility = require('../../../middlewares/loadAbility');
const requirePermission = require('../../../middlewares/requirePermission');
const validate = require('../../../middlewares/validate');
const upload = require('../../../middlewares/upload');
const { listRules, homeworkIdParamRules, createRules, updateRules } = require('../validators/homework.validator');
const ctrl = require('../controllers/homework.controller');

// Mounted at /campuses/:campusId/homework — mergeParams: true to access campusId
const router = Router({ mergeParams: true });

router.get('/',
  authenticate,
  listRules, validate,
  ctrl.list);

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