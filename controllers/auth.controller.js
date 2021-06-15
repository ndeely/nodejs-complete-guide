const User = require('../models/user.model');
const bcrypt = require('bcryptjs'); // password encryption module

exports.getLogin = (req, res, next) => {
    if (req.session.isLoggedIn) {
        return res.redirect('/');
    }
    res.render(
        'auth/login',
        {
            pageTitle: 'Login',
            path: '/login'
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
                return res.redirect('/login');
            }
            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if (!isMatch) {
                        // incorrect password
                        return res.redirect('/login');
                    }
                    req.session.isLoggedIn = true;
                    req.session.user = user;
                    req.session
                        .save(err => {
                            console.log(err);
                            res.redirect('/');
                        });
                })
                .catch(err => { console.log(err) });
        })
        .catch(err => { console.log(err) });
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/login');
        }
    );
};

exports.getSignup = (req, res, next) => {
    res.render(
        'auth/signup',
        {
            pageTitle: 'Sign Up',
            path: '/signup'
        }
    );
};

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    if (password.toString() !== confirmPassword.toString()) {
        // passwords do not match
        console.log("Passwords do not match!");
        return res.redirect('/signup');
    }
    User.findOne({email: email})
        .then(userDoc => {
            if (userDoc) {
                // user email already exists
                console.log("Email already exists!");
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
        })
        .catch(err => { console.log(err) });
};