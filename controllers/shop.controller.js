const fs = require('fs');
const path = require('path');

const Product = require('../models/product.model');
const Order = require('../models/order.model');

exports.getHomepage = (req, res, next) => {
    Product.find()
        .then(products => {
            res.render(
                'shop/index', {
                    prods: products,
                    pageTitle: 'Homepage',
                    path: '/'
                }
            );
        })
        .catch(err => { if (err) {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        } });
};

exports.getProducts = (req, res, next) => {
    Product.find()
        .then(products => {
            res.render(
                'shop/product-list', {
                    prods: products,
                    pageTitle: 'Shop',
                    path: '/products'
                }
            );
        })
        .catch(err => { if (err) {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        } });
};

exports.getProduct = (req, res, next) => {
    const id = req.params.id;
    Product.findById(id)
        .then(product => {
            res.render(
                'shop/product-detail', {
                    product: product,
                    pageTitle: product.title,
                    path: '/products'
                }
            );
        })
        .catch(err => {
            if (err) console.log(err);
        });
};

exports.getCart = (req, res, next) => {
    req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
        res.render('shop/cart', {
            path: '/cart',
            pageTitle: 'Your Cart',
            products: user.cart.items
        });
    })
    .catch(err => { if (err) console.log(err) });
};

exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(prodId)
        .then(product => {
            req.user.addToCart(product);
            res.redirect('/cart');
        })
        .catch(err => { if (err) console.log(err) });
};

exports.deleteCartItem = (req, res, next) => {
    const prodId = req.body.productId;
    req.user
        .deleteFromCart(prodId);
        res.redirect('/cart');

};

exports.postOrder = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            const products = user.cart.items.map(i => {
                return {
                    productData: { ...i.productId._doc },
                    quantity: i.quantity
                };
            });
            const order = new Order({
                user: {
                    email: req.user.email,
                    userId: req.user._id
                },
                products: products
            });
            return order.save();
        })
        .then(() => {
            return req.user.clearCart();
        })
        .then(() => {
            res.redirect('/orders');
        })
        .catch(err => { if (err) console.log(err) });
};

exports.getOrders = (req, res, next) => {
    Order.find( { 'user.userId': req.user._id })
        .then(orders => {
            console.log(orders);
            res.render(
                'shop/orders',
                {
                    pageTitle: 'Orders',
                    path: '/orders',
                    orders: orders
                }
            );
        })
        .catch(err => { if (err) console.log(err) });
};

exports.getInvoice = (req, res, next) => {
    const orderId = req.params.orderId;
    const invoiceName = 'Invoice-' + orderId + '.pdf';
    const invoicePath = path.join('/data', 'invoices', invoiceName);
    fs.readFile(invoicePath, (err, data) => {
        if (err) { return next(err); }
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');
        res.send(data);
    });
};