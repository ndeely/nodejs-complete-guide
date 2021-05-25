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
        req.body.id,
        req.body.title,
        req.body.description,
        req.body.price,
        req.body.imageUrl
    ).save()
        .then(() => {
            res.redirect('/products');
        })
        .catch(err => {
            if (err) console.log(err);
        });
};

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect('/');
    }
    const prodId = req.params.id;
    Product.findById(prodId)
        .then(([rows, fieldData]) => {
            if (rows.length === 0) {
                return res.redirect('/');
            }
            res.render(
                'admin/edit-product',
                {
                    pageTitle: 'Edit Product',
                    path: '/admin/edit-product',
                    editing: editMode,
                    product: rows[0]
                }
            );
        })
        .catch(err => {
            if (err) console.log(err);
        });
};

exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId;
    new Product(
        prodId,
        req.body.title,
        req.body.description,
        req.body.price,
        req.body.imageUrl
    ).save();
    res.redirect('/admin/products');
};

exports.getProducts = (req, res, next) => {
    Product.fetchAll()
        .then(([rows, fieldData]) => {
            res.render(
                'admin/products',
                {
                    prods: rows,
                    pageTitle: 'Products',
                    path: '/admin/products'
                }
            );
        })
        .catch(err => {
            if (err) console.log(err);
        });
};

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(prodId)
        .then(([rows, fieldData]) => {
            if (rows.length === 0) {
                return res.redirect('/');
            }
            Product.deleteById(prodId)
                .then(() => {
                    res.redirect('/admin/products');
                })
                .catch(err => {
                    if (err) console.log(err);
                });
        })
        .catch(err => {
            if (err) console.log(err);
        });
};