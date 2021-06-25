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
            errorMessage: null,
            validationErrors: []
        }
    );
};

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const image = req.file;
    console.log(image);
    const price = req.body.price;
    const description = req.body.description;

    const errors = validationResult(req);

    // the image was not the correct filetype
    if (!image) {
        return res.status(422).render(
            'admin/edit-product',
            {
                pageTitle: 'Add Product',
                path: '/admin/add-product',
                editing: false,
                hasError: true,
                oldInput: {
                    title: title,
                    price: price,
                    description: description
                },
                errorMessage: "Attached file is not an image",
                validationErrors: errors.array()
            }
        );
    }

    // there were other validation errors
    if (!errors.isEmpty()) {
        return res.status(422).render(
            'admin/edit-product',
            {
                pageTitle: 'Add Product',
                path: '/admin/add-product',
                editing: false,
                hasError: true,
                oldInput: {
                    title: title,
                    image: image,
                    price: price,
                    description: description
                },
                validationErrors: errors.array()
            }
        );
    }
    const imageUrl = '/' + image.path;
    const product = new Product({
        title: title,
        imageUrl: imageUrl,
        price: price,
        description: description,
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
    const title = req.body.title;
    const image = req.file;
    const price = req.body.price;
    const description = req.body.description;

    const errors = validationResult(req);

    // there were other validation errors
    if (!errors.isEmpty()) {
        return Product.findById(prodId)
            .then(product => {
                if (!product) {
                    return res.redirect('/');
                }
                res.status(422).render(
                    'admin/edit-product',
                    {
                        pageTitle: 'Edit Product',
                        path: '/admin/edit-product',
                        editing: true,
                        hasError: true,
                        product: product,
                        oldInput: {
                            title: title,
                            price: price,
                            description: description
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
            product.title = title;
            product.imageUrl = image ? '/' + image.path : product.imageUrl;
            product.price = price;
            product.description = description;
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