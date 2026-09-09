const { body } = require('express-validator');

// ── POST /auth/student-login ───────────────────────────────────────────────────
const studentLoginRules = [
  body('gr_no')
    .trim()
    .notEmpty().withMessage('GR-Number is required'),
  body('dob')
    .trim()
    .matches(/^\d{8}$/).withMessage('Date of birth must be 8 digits in DDMMYYYY format'),
];

module.exports = { studentLoginRules };