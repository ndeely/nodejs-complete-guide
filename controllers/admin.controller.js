const Product = require('../models/product.model');
const { validationResult } = require('express-validator');

exports.getAddProduct = (req, res, next) => {
    res.render(
        'admin/edit-product',
        {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false,
            hasError: false,
            validationErrors: []
        }
    );
};

exports.postAddProduct = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render(
            'admin/edit-product',
            {
                pageTitle: 'Add Product',
                path: '/admin/add-product',
                editing: false,
                hasError: true,
                oldInput: {
                    title: req.body.title,
                    image: req.body.image,
                    price: req.body.price,
                    description: req.body.description
                },
                validationErrors: errors.array()
            }
        );
    }

    const product = new Product({
        title: req.body.title,
        price: req.body.price,
        description: req.body.description,
        image: req.body.image,
        userId: req.user._id
    });
    product.save()
        .then(() => {
            res.redirect('/admin/products');
        })
        .catch(err => { if (err) {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        } });
};

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect('/');
    }
    const prodId = req.params.id;
    Product.findById(prodId)
        .then(product => {
            if (!product) {
                return res.redirect('/');
            }
            res.render(
                'admin/edit-product',
                {
                    pageTitle: 'Edit Product',
                    path: '/admin/edit-product',
                    editing: editMode,
                    hasError: false,
                    product: product,
                    oldInput: {
                        title: product.title,
                        image: product.image,
                        price: product.price,
                        description: product.description
                    },
                    validationErrors: []
                }
            );
        })
        .catch(err => { if (err) {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        } });
};

exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return Product.findById(prodId)
            .then(product => {
                if (!product) {
                    return res.redirect('/');
                }
                res.render(
                    'admin/edit-product',
                    {
                        pageTitle: 'Edit Product',
                        path: '/admin/edit-product',
                        editing: true,
                        hasError: true,
                        product: product,
                        oldInput: {
                            title: req.body.title,
                            image: req.body.image,
                            price: req.body.price,
                            description: req.body.description
                        },
                        validationErrors: errors.array()
                    }
                );
            })
            .catch(err => { if (err) {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            } });
    }

    Product.findById(prodId)
        .then(product => {
            if (product.userId.toString() !== req.user._id.toString()) {
                return res.redirect('/');
            }
            product.title = req.body.title;
            product.price = req.body.price;
            product.description = req.body.description;
            product.image = req.body.image;
            return product
                .save()
                .then(() => {
                    res.redirect('/admin/products');
                });
        })
        .catch(err => { if (err) {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        } });
};

exports.getProducts = (req, res, next) => {
    Product.find({ userId: req.user._id })
        .then(products => {
            res.render(
                'admin/products',
                {
                    prods: products,
                    pageTitle: 'Products',
                    path: '/admin/products'
                }
            );
        })
        .catch(err => { if (err) {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        } });
};

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product
        .deleteOne({
            _id: prodId,
            userId: req.user._id
        })
        .then(() => {
            res.redirect('/admin/products');
        })
        .catch(err => { if (err) {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        } });
};