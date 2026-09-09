const { Router } = require('express');

const router = Router();

router.use('/fee-challans', require('./myFees.routes'));

module.exports = router;