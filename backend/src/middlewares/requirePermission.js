const ApiError = require('../utils/ApiError');

const requirePermission = (action, subject) => {
  return (req, res, next) => {
    if (req.ability.cannot(action, subject)) {
      throw new ApiError(
        403,
        'You do not have permission to perform this action'
      );
    }
    next();
  };
};

module.exports = requirePermission;
