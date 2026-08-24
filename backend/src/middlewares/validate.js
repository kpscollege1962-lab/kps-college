const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

// Runs after express-validator chains — collects errors and throws a structured ApiError.
// First error per field wins (avoids duplicate messages for the same field).
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const fieldErrors = {};
    errors.array().forEach((e) => {
      if (!fieldErrors[e.path]) fieldErrors[e.path] = e.msg;
    });
    throw new ApiError(422, 'Data validation failed', { errors: { fieldErrors } });
  }

  next();
};

module.exports = validate;
