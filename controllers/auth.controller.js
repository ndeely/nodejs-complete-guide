exports.getLogin = (req, res, next) => {
    console.log(req.get('Cookie'));
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
    req.session.isLoggedIn = true;
    res.redirect("/");
};