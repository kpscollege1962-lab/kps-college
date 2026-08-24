const ApiError = require('../../../utils/ApiError');
const ApiResponse = require('../../../utils/ApiResponse');
const { defineAbilityFor } = require('../../../casl/ability.factory');

const getAbilities = async (req, res) => {
  const { roleId, campusId } = req.query;

  if (!roleId) {
    throw new ApiError(400, 'roleId is required');
  }

  const ability = await defineAbilityFor(
    req.user,
    campusId ? parseInt(campusId, 10) : null,
    parseInt(roleId, 10)
  );

  res.json(ApiResponse.success('Abilities fetched', { rules: ability.rules }));
};

module.exports = { getAbilities };
