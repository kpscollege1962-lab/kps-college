const { Router } = require('express');
const authenticate = require('../../../middlewares/authenticate');
const { getAbilities } = require('../controllers/roles.controller');

const router = Router();

// GET /roles/abilities?roleId=:roleId&campusId=:campusId
// Returns serialized CASL ability.rules for a specific role context.
// roleId is required. campusId is optional — omit for global roles.
// loadAbility is intentionally NOT used here — the controller calls
// defineAbilityFor directly to scope to a single selected role.
router.get('/abilities', authenticate, getAbilities);

module.exports = router;
