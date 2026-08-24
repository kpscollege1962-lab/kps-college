const { defineAbilityFor } = require('../casl/ability.factory');

const loadAbility = async (req, res, next) => {
  const raw = req.params.campusId ?? req.query.campusId;
  const campusId = raw ? parseInt(raw, 10) : null;
  req.ability = await defineAbilityFor(req.user, campusId);
  next();
};

module.exports = loadAbility;
