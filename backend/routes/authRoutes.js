const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middleware/validators');

router.post('/register', validateRegister, authController.register);
// Fix #17: Added validateLogin middleware
router.post('/login', validateLogin, authController.login);
router.post('/logout', authController.logout);
router.get('/me', authController.me);
router.post('/refresh', authController.refreshToken);

module.exports = router;
