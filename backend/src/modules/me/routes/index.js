const { Router } = require('express');

const router = Router();

router.use('/fee-challans', require('./myFees.routes'));
router.use('/', require('./myAccount.routes')); // profile, contact, photo, password

module.exports = router;