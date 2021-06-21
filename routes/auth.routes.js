const express = require('express');
const { check } = require('express-validator');

const authController = require('../controllers/auth.controller');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

const User = require('../models/user.model');

router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.post('/logout', isAuth, authController.postLogout);
router.get('/signup', authController.getSignup);
router.post('/signup', [
    check('email')
        .isEmail()
        .withMessage("Invalid Email Address")
        .custom((value, { req }) => {
            User.findOne({ email: value })
                .then(userDoc => {
                   if (userDoc) return false;
                });
        })
        .withMessage("This email address is already in use"),
    check('password')
        .isLength({min: 5})
        .withMessage("Password must be at least 5 characters long"),
    check('confirmPassword')
        .custom((value, { req }) => {
            if (value === req.body.password) return true;
        })
        .withMessage("Passwords do not match")
], authController.postSignup);
router.get('/reset-password', authController.getResetPassword);
router.post('/reset-password', authController.postResetPassword);
router.get('/new-password/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);
module.exports = router;