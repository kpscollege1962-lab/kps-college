const { Router } = require('express');
const authenticate = require('../../../middlewares/authenticate');
const loadAbility = require('../../../middlewares/loadAbility');
const requirePermission = require('../../../middlewares/requirePermission');
const upload = require('../../../middlewares/upload');
const ctrl = require('../controllers/homeworkSubmission.controller');

// Mounted at /campuses/:campusId/homework/:homeworkId/submissions
const router = Router({ mergeParams: true });

// Teacher reviews all submissions for their homework post
router.get('/',
  authenticate, loadAbility,
  requirePermission('manage', 'Homework'),
  ctrl.list);

// Student submits their own work — identity resolved server-side, no permission gate needed
router.post('/',
  authenticate,
  upload.single('file'),
  ctrl.submit);

// Teacher marks a specific submission as reviewed
router.patch('/:submissionId/mark-done',
  authenticate, loadAbility,
  requirePermission('manage', 'Homework'),
  ctrl.markDone);

module.exports = router;