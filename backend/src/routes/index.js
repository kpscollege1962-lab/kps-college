const { Router } = require('express');

const router = Router();

// ── Module routers ─────────────────────────────────────────────────────────────
// Each module exposes its own sub-router via routes/index.js.
// Add new modules here as the project grows.

router.use('/auth',     require('../modules/auth/routes'));
router.use('/roles',    require('../modules/roles/routes'));
router.use('/campuses',        require('../modules/campuses/routes'));
router.use('/school-settings', require('../modules/school-settings/routes'));
router.use('/academic-sessions', require('../modules/academic-sessions/routes'));
router.use('/students',    require('../modules/students/routes/students.routes'));
router.use('/enrollments', require('../modules/enrollments/routes/enrollments.routes'));
router.use('/staff',       require('../modules/staff/routes/staff.routes'));
router.use('/subjects',    require('../modules/subjects/routes/subjects.routes'));

module.exports = router;
