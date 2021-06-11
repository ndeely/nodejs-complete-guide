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
    const product = new Product({
        title: req.body.title,
        price: req.body.price,
        description: req.body.description,
        imageUrl: req.body.imageUrl,
        userId: req.user._id
    });
    product.save()
        .then(() => {
            res.redirect('/admin/products');
        })
        .catch(err => { if (err) console.log(err); });
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
                    product: product
                }
            );
        })
        .catch(err => { if (err) console.log(err); });
};

exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId;

    Product.findById(prodId)
        .then(product => {
            product.title = req.body.title;
            product.price = req.body.price;
            product.description = req.body.description;
            product.imageUrl = req.body.imageUrl;
            return product.save();
        })
        .then(() => {
            res.redirect('/admin/products');
        })
        .catch(err => { if (err) console.log(err); });
};

exports.getProducts = (req, res, next) => {
    Product.find()
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
        .catch(err => { if (err) console.log(err); });
};

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findByIdAndRemove(prodId)
        .then(() => {
            res.redirect('/admin/products');
        })
        .catch(err => { if (err) console.log(err); });
};