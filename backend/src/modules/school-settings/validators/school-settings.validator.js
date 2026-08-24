const { body } = require('express-validator');

// ── PATCH /school-settings ─────────────────────────────────────────────────────

const updateRules = [
  body('school_name')
    .optional()
    .trim()
    .notEmpty().withMessage('School Name must not be empty')
    .isLength({ max: 150 }).withMessage('School Name must not exceed 150 characters'),

  body('short_name')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 50 }).withMessage('Short Name must not exceed 50 characters'),

  body('tagline')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 255 }).withMessage('Tagline must not exceed 255 characters'),

  body('logo_url')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 500 }).withMessage('Logo URL must not exceed 500 characters'),

  body('registration_no')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 100 }).withMessage('Registration No must not exceed 100 characters'),

  body('school_type')
    .optional({ values: 'falsy' })
    .isIn(['private', 'government', 'semi_government']).withMessage('School Type must be private, government, or semi-government'),

  body('email')
    .optional({ values: 'falsy' })
    .trim()
    .isEmail().withMessage('Must be a valid email address'),

  body('phone')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 20 }).withMessage('Phone must not exceed 20 characters'),

  body('website')
    .optional({ values: 'falsy' })
    .trim()
    .isURL({ require_protocol: true }).withMessage('Website must be a valid URL with protocol')
    .isLength({ max: 255 }).withMessage('Website must not exceed 255 characters'),

  body('address')
    .optional({ values: 'falsy' })
    .trim(),

  body('city')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 100 }).withMessage('City must not exceed 100 characters'),

  body('state_province')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 100 }).withMessage('State / Province must not exceed 100 characters'),

  body('country')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 100 }).withMessage('Country must not exceed 100 characters'),

  body('postal_code')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 20 }).withMessage('Postal Code must not exceed 20 characters'),

  body('timezone')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 80 }).withMessage('Timezone must not exceed 80 characters'),

  body('date_format')
    .optional({ values: 'falsy' })
    .trim()
    .isIn(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']).withMessage('Date Format must be DD/MM/YYYY, MM/DD/YYYY, or YYYY-MM-DD'),

  body('currency_code')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 10 }).withMessage('Currency Code must not exceed 10 characters'),

  body('currency_symbol')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 10 }).withMessage('Currency Symbol must not exceed 10 characters'),

  body('currency_position')
    .optional()
    .isIn(['before', 'after']).withMessage('Currency Position must be before or after'),

  body('academic_year_start_month')
    .optional()
    .isInt({ min: 1, max: 12 }).withMessage('Academic Year Start Month must be an integer between 1 and 12'),

  body('default_pass_percentage')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('Default Pass Percentage must be a number between 0 and 100'),

  body('min_attendance_percentage')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('Minimum Attendance Percentage must be a number between 0 and 100'),
];

module.exports = { updateRules };
