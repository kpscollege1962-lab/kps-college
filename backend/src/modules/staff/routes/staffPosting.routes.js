const { Router } = require('express');
const authenticate      = require('../../../middlewares/authenticate');
const loadAbility       = require('../../../middlewares/loadAbility');
const requirePermission = require('../../../middlewares/requirePermission');
const validate          = require('../../../middlewares/validate');
const { createPostingRules, updatePostingRules } = require('../validators/staffPosting.validator');
const ctrl = require('../controllers/staffPosting.controller');

const router = Router();

router.post('/:staffId/posting',
  authenticate, loadAbility,
  createPostingRules, validate,
  requirePermission('create', 'Staff'),
  ctrl.createPosting);

router.patch('/:staffId/posting',
  authenticate, loadAbility,
  updatePostingRules, validate,
  requirePermission('update', 'Staff'),
  ctrl.updatePosting);

module.exports = router;
