const { body } = require('express-validator');

// ── PATCH /campuses/:campusId/settings ─────────────────────────────────────────

const VALID_DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const TIME_REGEX = /^\d{2}:\d{2}(:\d{2})?$/;

const updateRules = [
  body('logo_url')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 500 }).withMessage('Logo URL must not exceed 500 characters'),

  body('tagline')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 255 }).withMessage('Tagline must not exceed 255 characters'),

  body('academic_year_start_month')
    .optional({ values: 'falsy' })
    .isInt({ min: 1, max: 12 }).withMessage('Academic Year Start Month must be an integer between 1 and 12'),

  body('default_pass_percentage')
    .optional({ values: 'falsy' })
    .isFloat({ min: 0, max: 100 }).withMessage('Default Pass Percentage must be a number between 0 and 100'),

  body('min_attendance_percentage')
    .optional({ values: 'falsy' })
    .isFloat({ min: 0, max: 100 }).withMessage('Minimum Attendance Percentage must be a number between 0 and 100'),

  body('working_days')
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null) return true;
      if (!Array.isArray(value)) throw new Error('Working Days must be an array');
      const invalid = value.find((d) => !VALID_DAYS.includes(d));
      if (invalid !== undefined) {
        throw new Error(`Working Days contains an invalid day: "${invalid}"`);
      }
      return true;
    }),

  body('school_start_time')
    .optional({ values: 'falsy' })
    .trim()
    .matches(TIME_REGEX).withMessage('School Start Time must be in HH:MM or HH:MM:SS format'),

  body('school_end_time')
    .optional({ values: 'falsy' })
    .trim()
    .matches(TIME_REGEX).withMessage('School End Time must be in HH:MM or HH:MM:SS format'),

  body('late_arrival_minutes')
    .optional({ values: 'falsy' })
    .isInt({ min: 0, max: 120 }).withMessage('Late Arrival Grace Minutes must be an integer between 0 and 120'),

  body('max_students_per_section')
    .optional({ values: 'falsy' })
    .isInt({ min: 1, max: 500 }).withMessage('Default Section Capacity must be an integer between 1 and 500'),
];

module.exports = { updateRules };
