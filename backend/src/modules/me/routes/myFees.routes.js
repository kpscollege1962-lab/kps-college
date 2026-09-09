const { Router } = require('express');
const authenticate = require('../../../middlewares/authenticate');
const ctrl = require('../controllers/myFees.controller');

// Mounted at /me/fee-challans
// No requirePermission needed — identity itself is the access control here,
// since the service always derives the student from req.user.id, never from
// client-supplied params.
const router = Router();

router.get('/', authenticate, ctrl.list);

module.exports = router;