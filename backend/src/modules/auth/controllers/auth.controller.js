const { matchedData } = require('express-validator');
const ApiResponse = require('../../../utils/ApiResponse');
const { login } = require('../services/auth.service');
const { forgotPassword, resetPassword } = require('../services/passwordReset.service');

// ── POST /auth/login ───────────────────────────────────────────────────────────

const loginCtrl = async (req, res) => {
  const data = matchedData(req, { locations: ['body'] });
  const { user, contexts, accessToken, refreshToken } = await login(data);
  res.json(ApiResponse.success('Logged in successfully', { user, contexts, accessToken, refreshToken }));
};

// ── POST /auth/forgot-password ────────────────────────────────────────────────

const forgotPasswordCtrl = async (req, res) => {
  const { email } = matchedData(req, { locations: ['body'] });
  await forgotPassword({ email });
  // Always respond with the same message regardless of whether the email
  // exists — prevents user enumeration.
  res.json(ApiResponse.success('If that email is registered, a password reset link has been sent'));
};

// ── POST /auth/reset-password ─────────────────────────────────────────────────

const resetPasswordCtrl = async (req, res) => {
  const data = matchedData(req, { locations: ['body'] });
  await resetPassword(data);
  res.json(ApiResponse.success('Password has been reset successfully'));
};

module.exports = {
  login: loginCtrl,
  forgotPassword: forgotPasswordCtrl,
  resetPassword: resetPasswordCtrl,
};
