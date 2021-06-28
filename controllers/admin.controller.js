const Product = require('../models/product.model');
const fileHelper = require('../util/file');

const { validationResult } = require('express-validator');

const ITEMS_PER_PAGE = 6;

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
                errorMessage: null,
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
                    errorMessage: null,
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
                        errorMessage: null,
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
            if (image) {
                fileHelper.deleteFile(product.imageUrl);
                product.imageUrl = image.path;
            }
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
    const page = +req.query.page || 1;
    let itemCount;

    Product.find({ userId: req.user._id })
        .countDocuments()
        .then(numProducts => {
            itemCount = numProducts;
            return Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE);
        })
        .then(products => {
            res.render(
                'admin/products',
                {
                    prods: products,
                    pageTitle: 'Products',
                    path: '/admin/products',
                    totalProducts: itemCount,
                    currentPage: page,
                    hasNextPage: ITEMS_PER_PAGE * page < itemCount,
                    hasPrevPage: page > 1,
                    nextPage: page + 1,
                    prevPage: page - 1,
                    lastPage: Math.ceil(itemCount / ITEMS_PER_PAGE)
                }
            );
        })
        .catch(err => { if (err) {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        } });
};

exports.deleteProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then(p => {
            if (!p) {
                return next(new Error('Product not found'));
            }
            fileHelper.deleteFile('.' + p.imageUrl);
            return Product.deleteOne({_id: prodId, userId: req.user._id});
        })
        .then(() => {
            res.status(200).json({
                message: 'Success!'
            });
        })
        .catch(err => { if (err) {
            res.status(500).json({
                message: 'Deleting product failed'
            });
        } });
};