const express = require('express');

const authController = require('../controllers/auth.controller');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.get('/logout', isAuth, authController.postLogout);
router.get('/signup', isAuth, authController.getSignup);
router.post('/signup', isAuth, authController.postSignup);

module.exports = router;