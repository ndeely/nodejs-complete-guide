exports.error404 = (req, res, next) => {
    res.status(404).render(
        '404',
        {
            pageTitle: '404 - Page Not Found',
            path: '/404'
        }
    );
};

exports.error500 = (req, res, next) => {
    res.status(404).render(
        '500',
        {
            pageTitle: '500 - Error',
            path: '/500'
        }
    );
};
