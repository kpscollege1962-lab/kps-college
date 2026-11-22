const { Router } = require('express');
const authenticate = require('../../../middlewares/authenticate');
const validate = require('../../../middlewares/validate');
const upload = require('../../../middlewares/upload');
const { contactRules, passwordRules } = require('../validators/myAccount.validator');
const ctrl = require('../controllers/myAccount.controller');

// Mounted at /me. Identity is the access control: the service always works on req.user.id.
const router = Router();

router.get('/account', authenticate, ctrl.account);
router.get('/profile', authenticate, ctrl.profile);
router.patch('/contact', authenticate, contactRules, validate, ctrl.contact);
router.post('/photo', authenticate, upload.single('photo'), ctrl.photo);
router.post('/password', authenticate, passwordRules, validate, ctrl.password);

module.exports = router;
