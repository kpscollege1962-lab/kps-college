const { Router } = require('express');

const router = Router();

router.use('/my-classes', require('./myClasses.routes'));
router.use('/my-timetable', require('./myTimetable.routes'));
router.use('/form-master-classes', require('./formMaster.routes'));

module.exports = router;