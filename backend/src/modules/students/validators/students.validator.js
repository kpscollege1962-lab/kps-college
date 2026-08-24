const { body, param, query } = require('express-validator');

const REGISTER_LEVELS = ['pre_primary', 'primary', 'middle', 'secondary', 'higher_secondary'];

const listRules = [
  query('search')
    .optional()
    .trim(),

  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),

  query('registerLevel')
    .optional()
    .isIn(REGISTER_LEVELS).withMessage('Invalid register level'),
];


const idParamRules = [
  param('studentId')
    .isInt({ min: 1 }).withMessage('Invalid student ID'),
];


const createRules = [
  body('gr_no')
    .trim()
    .notEmpty().withMessage('GR number is required')
    .isLength({ max: 50 }).withMessage('GR number must not exceed 50 characters'),

  body('full_name')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ max: 160 }).withMessage('Full name must not exceed 160 characters'),

  body('gender')
    .notEmpty().withMessage('Gender is required')
    .isIn(['male', 'female']).withMessage('Gender must be male or female'),

  body('date_of_birth')
    .optional()
    .isISO8601().withMessage('Date of birth must be a valid date'),

  body('b_form_no')
    .optional()
    .trim()
    .matches(/^\d{5}-\d{7}-\d{1}$/).withMessage('B-Form number must be in the format XXXXX-XXXXXXX-X'),

  body('religion')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Religion must not exceed 50 characters'),

  body('nationality')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Nationality must not exceed 50 characters'),

  body('blood_group')
    .optional()
    .trim()
    .isLength({ max: 5 }).withMessage('Blood group must not exceed 5 characters'),

  body('address')
    .optional()
    .trim(),

  body('admission_date')
    .optional()
    .isISO8601().withMessage('Admission date must be a valid date'),

  body('father_name')
    .trim()
    .notEmpty().withMessage('Father name is required')
    .isLength({ max: 100 }).withMessage('Father name must not exceed 100 characters'),

  body('father_cnic')
    .optional()
    .trim()
    .matches(/^\d{5}-\d{7}-\d{1}$/).withMessage('Father CNIC must be in the format XXXXX-XXXXXXX-X'),

  body('father_occupation')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Father occupation must not exceed 100 characters'),

  body('domicile_district')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Domicile district must not exceed 100 characters'),

  body('contacts')
    .isArray({ min: 1 }).withMessage('At least one contact is required'),

  body('contacts.*.label')
    .trim()
    .notEmpty().withMessage('Contact label is required')
    .isLength({ max: 50 }).withMessage('Label must not exceed 50 characters'),

  body('contacts.*.name')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Contact name must not exceed 100 characters'),

  body('contacts.*.phone')
    .trim()
    .notEmpty().withMessage('Contact phone is required')
    .isLength({ max: 20 }).withMessage('Phone must not exceed 20 characters'),

  body('contacts.*.is_primary')
    .isInt({ min: 0, max: 1 }).withMessage('is_primary must be 0 or 1'),

  body('contacts')
    .custom((contacts) => {
      const primaryCount = contacts.filter(c => c.is_primary === 1).length;
      if (primaryCount !== 1) throw new Error('Exactly one contact must be marked as primary');
      return true;
    }),

  body('classGroupId')
    .notEmpty().withMessage('Class is required')
    .isInt({ min: 1 }).withMessage('Class ID must be a valid identifier'),

  body('sectionId')
    .optional()
    .isInt({ min: 1 }).withMessage('Section ID must be a valid identifier'),

  body('campusId')
    .notEmpty().withMessage('Campus is required')
    .isInt({ min: 1 }).withMessage('Campus ID must be a valid identifier'),

  body('sessionId')
    .notEmpty().withMessage('Session is required')
    .isInt({ min: 1 }).withMessage('Session ID must be a valid identifier'),

  body('admission_no')
    .optional()
    .trim()
    .notEmpty().withMessage('Admission/Register number must not be empty if provided')
    .isLength({ max: 50 }).withMessage('Admission/Register number must not exceed 50 characters'),
];


const updateRules = [
  ...idParamRules,

  body('gr_no')
    .optional({ values: 'falsy' })
    .trim()
    .notEmpty().withMessage('GR number must not be empty')
    .isLength({ max: 50 }).withMessage('GR number must not exceed 50 characters'),

  body('full_name')
    .optional({ values: 'falsy' })
    .trim()
    .notEmpty().withMessage('Full name must not be empty')
    .isLength({ max: 160 }).withMessage('Full name must not exceed 160 characters'),

  body('gender')
    .optional()
    .isIn(['male', 'female']).withMessage('Gender must be male or female'),

  body('date_of_birth')
    .optional()
    .isISO8601().withMessage('Date of birth must be a valid date'),

  body('b_form_no')
    .optional()
    .trim()
    .matches(/^\d{5}-\d{7}-\d{1}$/).withMessage('B-Form number must be in the format XXXXX-XXXXXXX-X'),

  body('religion')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Religion must not exceed 50 characters'),

  body('nationality')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Nationality must not exceed 50 characters'),

  body('blood_group')
    .optional()
    .trim()
    .isLength({ max: 5 }).withMessage('Blood group must not exceed 5 characters'),

  body('address')
    .optional()
    .trim(),

  body('admission_date')
    .optional()
    .isISO8601().withMessage('Admission date must be a valid date'),

  body('father_name')
    .optional({ values: 'falsy' })
    .trim()
    .notEmpty().withMessage('Father name must not be empty')
    .isLength({ max: 100 }).withMessage('Father name must not exceed 100 characters'),

  body('father_cnic')
    .optional()
    .trim()
    .matches(/^\d{5}-\d{7}-\d{1}$/).withMessage('Father CNIC must be in the format XXXXX-XXXXXXX-X'),

  body('father_occupation')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Father occupation must not exceed 100 characters'),

  body('domicile_district')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Domicile district must not exceed 100 characters'),

  body('contacts')
    .optional()
    .isArray({ min: 1 }).withMessage('At least one contact is required'),

  body('contacts.*.label')
    .optional()
    .trim()
    .notEmpty().withMessage('Contact label is required')
    .isLength({ max: 50 }).withMessage('Label must not exceed 50 characters'),

  body('contacts.*.name')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Contact name must not exceed 100 characters'),

  body('contacts.*.phone')
    .optional()
    .trim()
    .notEmpty().withMessage('Contact phone is required')
    .isLength({ max: 20 }).withMessage('Phone must not exceed 20 characters'),

  body('contacts.*.is_primary')
    .optional()
    .isInt({ min: 0, max: 1 }).withMessage('is_primary must be 0 or 1'),

  body('contacts')
    .optional()
    .custom((contacts) => {
      if (!contacts) return true;
      const primaryCount = contacts.filter(c => c.is_primary === 1).length;
      if (primaryCount !== 1) throw new Error('Exactly one contact must be marked as primary');
      return true;
    }),

];

module.exports = { listRules, idParamRules, createRules, updateRules };
