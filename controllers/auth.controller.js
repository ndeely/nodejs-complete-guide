const bcrypt = require('bcryptjs'); // password encryption module
const nodemailer = require('nodemailer');
const sengridTransport = require('nodemailer-sendgrid-transport');

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
    if (password.toString() !== confirmPassword.toString()) {
        // passwords do not match
        req.flash('error', 'Passwords do not match!');
        return res.redirect('/signup');
    }
    User.findOne({email: email})
        .then(userDoc => {
            if (userDoc) {
                // user email already exists
                req.flash('error', 'This email is already in use.');
                return res.redirect('/signup');
            }
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