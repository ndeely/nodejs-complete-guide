const express = require('express');

const authController = require('../controllers/auth.controller');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.post('/logout', isAuth, authController.postLogout);
router.get('/signup', authController.getSignup);
router.post('/signup', authController.postSignup);
router.get('/reset-password', authController.getResetPassword);
router.post('/reset-password', authController.postResetPassword);

module.exports = router;