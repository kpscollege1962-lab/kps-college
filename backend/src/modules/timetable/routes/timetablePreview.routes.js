const { Router } = require('express');
const authenticate = require('../../../middlewares/authenticate');
const validate      = require('../../../middlewares/validate');
const { campusIdParamRules, getTimetableQueryRules } = require('../validators/timetable.validator');
const ctrl = require('../controllers/timetablePreview.controller');

// mergeParams: true is required so req.params.campusId flows in from the parent campuses router
const router = Router({ mergeParams: true });

router.get('/class',
  authenticate,
  campusIdParamRules, getTimetableQueryRules, validate,
  ctrl.getClassWisePreview);

router.get('/staff',
  authenticate,
  campusIdParamRules, getTimetableQueryRules, validate,
  ctrl.getStaffWisePreview);

router.get('/subject',
  authenticate,
  campusIdParamRules, getTimetableQueryRules, validate,
  ctrl.getSubjectWisePreview);

module.exports = router;
