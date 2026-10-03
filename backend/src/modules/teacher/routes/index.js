const { Router } = require('express');

const router = Router();

router.use('/my-classes', require('./myClasses.routes'));

module.exports = router;