const { Router } = require('express');
const { query } = require('express-validator');
const authenticate = require('../../../middlewares/authenticate');
const validate = require('../../../middlewares/validate');
const ctrl = require('../controllers/myClasses.controller');

// Mounted at /teacher/my-classes
const router = Router();

router.get('/',
  authenticate,
  [query('campusId').isInt({ min: 1 }).withMessage('campusId is required')],
  validate,
  ctrl.list);

module.exports = router;