const { Router } = require('express');
const authenticate = require('../../../middlewares/authenticate');
const ctrl = require('../controllers/campusBranding.controller');

// Mounted at /campuses/:campusId/print-branding
// Any signed-in user may read it: it is only the letterhead (title, watermark, footer)
// that is printed on timetables and assignment sheets. Unlike GET /campuses/:id it does
// not need the "read Campus" permission, which campus admins and teachers do not have.
const router = Router({ mergeParams: true });

router.get('/', authenticate, ctrl.get);

module.exports = router;