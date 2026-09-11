const { body } = require('express-validator');

// ── POST /auth/student-login ───────────────────────────────────────────────────
const studentLoginRules = [
  body('grNo')
    .trim()
    .notEmpty().withMessage('GR number is required'),
  body('dob')
    .trim()
    .matches(/^\d{8}$/).withMessage('Date of birth must be 8 digits in DDMMYYYY format'),
];

module.exports = { studentLoginRules };