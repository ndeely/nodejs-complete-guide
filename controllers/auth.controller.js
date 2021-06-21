const crypto = require('crypto'); // built-in node module

const bcrypt = require('bcryptjs'); // password encryption module
const nodemailer = require('nodemailer');
const sengridTransport = require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator');

const User = require('../models/user.model');

const transporter = nodemailer.createTransport(sengridTransport({
    auth: {
        api_key: process.env.SENDGRID_API_KEY
    }
}));

exports.getLogin = (req, res, next) => {
    const errorMessage = req.flash('error');
    if (req.session.isLoggedIn) {
        return res.redirect('/');
    }
    res.render(
        'auth/login',
        {
            pageTitle: 'Login',
            path: '/login',
            errorMessage: errorMessage.length > 0 ? errorMessage[0] : null
        }
    );
};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({email: email})
        .then(user => {
            if (!user) {
                // incorrect email
                req.flash('error', 'Invalid login.');
                return res.redirect('/login');
            }
            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if (!isMatch) {
                        // incorrect password
                        req.flash('error', 'Invalid login.');
                        return res.redirect('/login');
                    }
                    req.session.isLoggedIn = true;
                    req.session.user = user;
                    req.session
                        .save(err => {
                            if (err) { console.log(err); }
                            res.redirect('/');
                        });
                })
                .catch(err => { if (err) console.log(err) });
        })
        .catch(err => { if (err) console.log(err) });
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        if(err) { console.log(err); }
        res.redirect('/login');
        }
    );
};

exports.getSignup = (req, res, next) => {
    const errorMessage = req.flash('error');
    res.render(
        'auth/signup',
        {
            pageTitle: 'Sign Up',
            path: '/signup',
            errorMessage: errorMessage.length > 0 ? errorMessage[0] : null
        }
    );
};

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log(errors.errors);
        return res.status(422).render('auth/signup', {
            path: '/signup',
            pageTitle: 'Sign Up',
            errorMessage: errors.errors
        });
    }
    User.findOne({email: email})
        .then(userDoc => {
            return bcrypt.hash(password, 12)
                .then(hashedPassword => {
                    const user = new User({
                        email: email,
                        password: hashedPassword
                    });
                    return user.save();
                });
        })
        .then(() => {
            res.redirect('/login');
            return transporter.sendMail({
                to: email,
                from: 'noreply@nialldeely.com',
                subject: 'Welcome to my Shop',
                html: '<h1>You successfully registered!</h1>'
            });
        })
        .catch(err => { if (err) console.log(err) });
};

exports.getResetPassword = (req, res, next) => {
    const errorMessage = req.flash('error');
    res.render(
        'auth/reset-password',
        {
            pageTitle: 'Reset Password',
            path: '/reset-password',
            errorMessage: errorMessage.length > 0 ? errorMessage[0] : null
        }
    );
};

exports.postResetPassword = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
       if (err) {
           console.log(err);
           return res.redirect('/reset-password');
       }
       const token = buffer.toString('hex');
       const email = req.body.email;

       User.findOne({email: email})
            .then(user => {
                if (!user) {
                    // user email doesn't exists
                    req.flash('error', 'This email is not in use.');
                    return res.redirect('/reset-password');
                }
                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000; // resets in 1h
                console.log(user);
                return user.save();
            })
            .then(() => {
                res.redirect('/');
                transporter.sendMail({
                    to: email,
                    from: 'noreply@nialldeely.com',
                    subject: 'Password Reset',
                    html: `
                    <p>You have requested a password reset.</p>
                    <p>Please click the link below to set a new password.
                    This link will expire in 1 hour.</p>
                    <p><a href="${process.env.PASSWORD_RESET_URI}${token}">Reset Password</a></p>
                `
                });
            })
            .catch(err => { if (err) console.log(err) });
    });
};

exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;
    User.findOne({
        resetToken: token,
        resetTokenExpiration: { $gt: Date.now() }
    })
        .then(user => {
            if (!user) return res.redirect('/login');
            const errorMessage = req.flash('error');
            res.render(
                'auth/new-password',
                {
                    pageTitle: 'New Password',
                    path: '/new-password',
                    errorMessage: errorMessage.length > 0 ? errorMessage[0] : null,
                    userId: user._id.toString(),
                    passwordToken: token
                }
            );
        })
        .catch(err => { if (err) console.log(err) });
};

exports.postNewPassword = (req, res, next) => {
  const userId = req.body.userId;
  const newPassword = req.body.password;
  const passwordToken = req.body.passwordToken;
  User.findOne({
      _id: userId,
      resetToken: passwordToken,
      resetTokenExpiration: {$gt: Date.now()}
  })
    .then(user => {
        return bcrypt.hash(newPassword, 12)
            .then(hashedPassword => {
                user.password = hashedPassword;
                user.resetToken = undefined;
                user.resetTokenExpiration = undefined;
                return user.save();
            });
    })
  .then(() => {
      res.redirect('/login');
  })
    .catch(err => { if (err) console.log(err) });
};