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

exports.getProduct = (req, res, next) => {
    const id = req.params.id;
    Product.findById(id, product => {
        res.render(
            'shop/product-detail',
            {
                pageTitle: product.title,
                path: '/products',
                product: product
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

exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;
};

exports.getOrders = (req, res, next) => {
    res.render(
        'shop/orders',
        {
            pageTitle: 'Orders',
            path: '/orders'
        }
    );
};

exports.getCheckout = (req, res, next) => {
    res.render(
        'shop/checkout',
        {
            pageTitle: 'Checkout',
            path: '/cart'
        }
    );
};

exports.getHomepage = (req, res, next) => {
    Product.fetchAll(products => {
        res.render(
            'shop/index',
            {
                prods: products,
                pageTitle: 'Homepage',
                path: '/',
            }
        );
    });
};