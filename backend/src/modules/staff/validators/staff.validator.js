const { body, param, query } = require('express-validator');

// ── GET /staff ─────────────────────────────────────────────────────────────────
const listRules = [
  query('campusId')
    .notEmpty().withMessage('Campus ID is required')
    .isInt({ min: 1 }).withMessage('Invalid campus ID'),
  query('search')
    .optional()
    .trim(),
  query('isActive')
    .optional()
    .isIn(['0', '1']).withMessage('Active filter must be 0 or 1'),
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
];

// ── :staffId param + campusId query (shared by getOne, update) ─────────────────
const idParamRules = [
  param('staffId')
    .isInt({ min: 1 }).withMessage('Invalid staff ID'),
  query('campusId')
    .notEmpty().withMessage('Campus ID is required')
    .isInt({ min: 1 }).withMessage('Invalid campus ID'),
];

// ── POST /staff ────────────────────────────────────────────────────────────────
const createRules = [
  query('campusId')
    .notEmpty().withMessage('Campus ID is required')
    .isInt({ min: 1 }).withMessage('Invalid campus ID'),
  body('cnic')
    .trim()
    .notEmpty().withMessage('CNIC is required')
    .matches(/^\d{5}-\d{7}-\d{1}$/).withMessage('CNIC must be in the format XXXXX-XXXXXXX-X'),
  body('gender')
    .notEmpty().withMessage('Gender is required')
    .isIn(['male', 'female']).withMessage('Gender must be male or female'),
  body('full_name')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ max: 150 }).withMessage('Full name must not exceed 150 characters'),
  body('name_initials')
    .optional()
    .trim()
    .isLength({ max: 20 }).withMessage('Initials must not exceed 20 characters'),
  body('marital_status')
    .optional()
    .isIn(['married', 'single']).withMessage('Marital status must be married or single'),
  body('address')
    .optional()
    .trim(),
  body('employee_no')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Employee No must not exceed 50 characters'),
  body('date_of_birth')
    .optional()
    .isISO8601().withMessage('Date of Birth must be a valid date'),
  body('joining_date')
    .optional()
    .isISO8601().withMessage('Joining Date must be a valid date'),
  body('isTimetableEligible')
    .optional()
    .isBoolean().withMessage('isTimetableEligible must be a boolean'),
  body('allowConcurrentPeriods')
    .optional()
    .isBoolean().withMessage('allowConcurrentPeriods must be a boolean'),
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Email must be a valid email address')
    .isLength({ max: 150 }).withMessage('Email must not exceed 150 characters'),
  body('phones')
    .optional()
    .isArray().withMessage('Phones must be an array'),
  body('phones.*.phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .isLength({ max: 20 }).withMessage('Phone must not exceed 20 characters'),
  body('phones.*.label')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Phone label must not exceed 50 characters'),
  body('phones.*.is_primary')
    .optional()
    .isBoolean().withMessage('is_primary must be a boolean'),
  body('qualifications')
    .optional()
    .isArray().withMessage('Qualifications must be an array'),
  body('qualifications.*.type')
    .notEmpty().withMessage('Qualification type is required')
    .isIn(['academic', 'professional']).withMessage('Type must be academic or professional'),
  body('qualifications.*.title')
    .trim()
    .notEmpty().withMessage('Qualification title is required')
    .isLength({ max: 200 }).withMessage('Title must not exceed 200 characters'),
  body('qualifications.*.completion_date')
    .optional({ nullable: true })
    .isISO8601().withMessage('Completion date must be a valid date'),
];

// ── PATCH /staff/:staffId ──────────────────────────────────────────────────────
const updateRules = [
  ...idParamRules,
  body('cnic')
    .optional()
    .trim()
    .matches(/^\d{5}-\d{7}-\d{1}$/).withMessage('CNIC must be in the format XXXXX-XXXXXXX-X'),
  body('gender')
    .optional()
    .isIn(['male', 'female']).withMessage('Gender must be male or female'),
  body('full_name')
    .optional({ values: 'falsy' })
    .trim()
    .notEmpty().withMessage('Full name must not be empty')
    .isLength({ max: 150 }).withMessage('Full name must not exceed 150 characters'),
  body('name_initials')
    .optional()
    .trim()
    .isLength({ max: 20 }).withMessage('Initials must not exceed 20 characters'),
  body('marital_status')
    .optional()
    .isIn(['married', 'single']).withMessage('Marital status must be married or single'),
  body('address')
    .optional()
    .trim(),
  body('date_of_birth')
    .optional()
    .isISO8601().withMessage('Date of Birth must be a valid date'),
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Email must be a valid email address')
    .isLength({ max: 150 }).withMessage('Email must not exceed 150 characters'),
  body('phones')
    .optional()
    .isArray().withMessage('Phones must be an array'),
  body('phones.*.phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .isLength({ max: 20 }).withMessage('Phone must not exceed 20 characters'),
  body('phones.*.label')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Phone label must not exceed 50 characters'),
  body('phones.*.is_primary')
    .optional()
    .isBoolean().withMessage('is_primary must be a boolean'),
  body('qualifications')
    .optional()
    .isArray().withMessage('Qualifications must be an array'),
  body('qualifications.*.type')
    .notEmpty().withMessage('Qualification type is required')
    .isIn(['academic', 'professional']).withMessage('Type must be academic or professional'),
  body('qualifications.*.title')
    .trim()
    .notEmpty().withMessage('Qualification title is required')
    .isLength({ max: 200 }).withMessage('Title must not exceed 200 characters'),
  body('qualifications.*.completion_date')
    .optional({ nullable: true })
    .isISO8601().withMessage('Completion date must be a valid date'),
];

// ── GET /staff/eligible ─────────────────────────────────────────────────────────
const searchEligibleRules = [
  query('campusId')
    .notEmpty().withMessage('Campus ID is required')
    .isInt({ min: 1 }).withMessage('Invalid campus ID'),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 2 }).withMessage('Search query must be at least 2 characters'),
];

module.exports = { listRules, idParamRules, createRules, updateRules, searchEligibleRules };
