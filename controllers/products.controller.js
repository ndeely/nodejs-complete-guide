const Product = require('../models/product.model');

exports.getProducts = (req, res, next) => {
    Product.fetchAll(products => {
        res.render(
            'shop/product-list',
            {
                prods: products,
                pageTitle: 'Shop',
                path: '/products'
            }
        );
    });
};

exports.getCart = (req, res, next) => {
    res.render(
        'shop/cart',
        {
            pageTitle: 'Cart',
            path: '/cart'
        }
    );
};

exports.getHomepage = (req, res, next) => {
    res.render(
        'shop/index',
        {
            pageTitle: 'Homepage',
            path: '/'
        }
    );
};