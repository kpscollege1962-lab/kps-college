const { Router } = require('express');

const router = Router();

router.use('/my-classes', require('./myClasses.routes'));
router.use('/my-timetable', require('./myTimetable.routes'));

module.exports = router;