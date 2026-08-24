const { ValidationError, UniqueConstraintError, ForeignKeyConstraintError } = require('sequelize');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {

  // ── Sequelize validation error (model-level validators) ───────────────────
  if (err instanceof ValidationError) {
    const fieldErrors = {};
    err.errors.forEach((e) => { fieldErrors[e.path] = e.message; });
    return res.status(422).json(ApiResponse.error('Data validation failed', { errors: { fieldErrors } }));
  }

  // ── Sequelize unique constraint (duplicate entry) ──────────────────────────
  if (err instanceof UniqueConstraintError) {
    const field = err.errors[0]?.path ?? 'field';
    return res.status(409).json(ApiResponse.error(`${field} already exists`));
  }

  // ── Sequelize foreign key constraint ──────────────────────────────────────
  if (err instanceof ForeignKeyConstraintError) {
    return res.status(409).json(ApiResponse.error('This record cannot be deleted because it is still referenced by other data.'));
  }

  // ── Our own ApiError ───────────────────────────────────────────────────────
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json(ApiResponse.error(err.message, err.data));
  }

  // ── Unhandled / unexpected errors ─────────────────────────────────────────
  console.error(err);
  return res.status(500).json(ApiResponse.error('Internal Server Error'));
};

module.exports = errorHandler;
