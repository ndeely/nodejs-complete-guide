const express = require('express');
const { body } = require('express-validator');

const authController = require('../controllers/auth.controller');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

const User = require('../models/user.model');

router.get('/login', authController.getLogin);
router.post(
    '/login',
    [
        body('email')
            .exists()
            .isEmail()
            .trim()
            .escape()
            .custom(email => {
                return new Promise((resolve, reject) => {
                    User.findOne({ email: email })
                        .then(user => {
                            if (user === null) {
                                reject(new Error('This email address is not registered'))
                            } else {
                                resolve(true)
                            }
                        });

                });
            })
    ],
    authController.postLogin);
router.post('/logout', isAuth, authController.postLogout);
router.get('/signup', authController.getSignup);
router.post(
    '/signup',
    [
        body('email', 'Invalid Email Address')
            .exists()
            .isEmail()
            .trim()
            .normalizeEmail()
            .escape()
            .custom(email => {
                return new Promise((resolve, reject) => {
                    User.findOne({ email: email })
                        .then(user => {
                            if (user !== null) {
                                reject(new Error('This email address is already in use'))
                            } else {
                                resolve(true)
                            }
                        })

                });
            }),
        body('password')
            .isLength({min: 5})
            .withMessage("Password must be at least 5 characters long"),
        body('confirmPassword')
            .custom((confirmPassword, { req }) => {
                if (confirmPassword === req.body.password) return true;
            })
            .withMessage("Passwords do not match")
    ],
    authController.postSignup);
router.get('/reset-password', authController.getResetPassword);
router.post('/reset-password', authController.postResetPassword);
router.get('/new-password/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);
module.exports = router;