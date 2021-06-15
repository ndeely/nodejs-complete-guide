const User = require('../models/user.model');

exports.getLogin = (req, res, next) => {
    res.render(
        'auth/login',
        {
            pageTitle: 'Login',
            path: '/login',
            isAuthenticated: req.session.isLoggedIn
        }
    );
};

exports.postLogin = (req, res, next) => {
    User.findById('60b6588029fb11f22962f4df')
        .then(user => {
            req.session.isLoggedIn = true;
            req.session.user = user;
            res.redirect("/");
        })
        .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/login');
        }
    );
};