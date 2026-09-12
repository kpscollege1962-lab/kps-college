const { Router } = require('express');
const validate = require('../../../middlewares/validate');
const { loginRules, forgotPasswordRules, resetPasswordRules } = require('../validators/auth.validator');
const ctrl = require('../controllers/auth.controller');

const router = Router();

router.post('/login',           loginRules,           validate, ctrl.login);
router.post('/forgot-password', forgotPasswordRules,  validate, ctrl.forgotPassword);
router.post('/reset-password',  resetPasswordRules,   validate, ctrl.resetPassword);

module.exports = router;