const { body } = require('express-validator');

// ── POST /auth/login ───────────────────────────────────────────────────────────

const loginRules = [
  body('login')
    .trim()
    .notEmpty().withMessage('Email or username is required'),

  body('password')
    .notEmpty().withMessage('Password is required'),
];

// ── POST /auth/forgot-password ────────────────────────────────────────────────

const forgotPasswordRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address'),
];

// ── POST /auth/reset-password ─────────────────────────────────────────────────

const resetPasswordRules = [
  body('token')
    .trim()
    .notEmpty().withMessage('Reset token is required'),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

module.exports = { loginRules, forgotPasswordRules, resetPasswordRules };
