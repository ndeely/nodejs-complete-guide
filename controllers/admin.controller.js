const Product = require('../models/product.model');

exports.getAddProduct = (req, res, next) => {
    res.render(
        'admin/add-product',
        {
            pageTitle: 'Add Product',
            path: '/admin/add-product'
        }
    );
};

exports.postAddProduct = (req, res, next) => {
    new Product(
        req.body.title,
        req.body.imageUrl,
        req.body.description,
        req.body.price
    ).save();
    res.redirect('/products');
};

exports.getProducts = (req, res, next) => {
    Product.fetchAll(products => {
        res.render(
            'admin/products',
            {
                prods: products,
                pageTitle: 'Products',
                path: '/admin/products'
            }
        );
    });
};