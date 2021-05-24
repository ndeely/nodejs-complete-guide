const Product = require('../models/product.model');

exports.getAddProduct = (req, res, next) => {
    res.render(
        'admin/edit-product',
        {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false
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

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect('/');
    }
    const prodId = req.params.id;
    Product.findById(prodId, product => {
        if (!product) {
            return res.redirect('/');
        }
        res.render(
            'admin/edit-product',
            {
                pageTitle: 'Edit Product',
                path: '/admin/edit-product',
                editing: editMode,
                product: product
            }
        );
    });

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