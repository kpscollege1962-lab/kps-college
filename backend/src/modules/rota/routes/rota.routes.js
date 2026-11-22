const { Router } = require('express');
const authenticate = require('../../../middlewares/authenticate');
const loadAbility = require('../../../middlewares/loadAbility');
const validate = require('../../../middlewares/validate');
const requirePermission = require('../../../middlewares/requirePermission');
const { getRules, saveRules, deleteRules } = require('../validators/rota.validator');
const ctrl = require('../controllers/rota.controller');

// Mounted at /campuses/:campusId/rota. Same people as the timetable may assign / issue
// (manage Rota: Super Admin, Campus Admin); the Principal may read it (read Rota).
// Teachers see their own rota through /teacher/my-timetable, never through here.
const router = Router({ mergeParams: true });

router.get('/', authenticate, loadAbility, getRules, validate, requirePermission('read', 'Rota'), ctrl.get);
router.put('/:date', authenticate, loadAbility, saveRules, validate, requirePermission('manage', 'Rota'), ctrl.save);
router.delete('/:date', authenticate, loadAbility, deleteRules, validate, requirePermission('manage', 'Rota'), ctrl.delete);

module.exports = router;
