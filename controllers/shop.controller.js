const fs = require('fs');
const path = require('path');

const pdfkit = require('pdfkit');

const Product = require('../models/product.model');
const Order = require('../models/order.model');

const ITEMS_PER_PAGE = 2;

exports.getHomepage = (req, res, next) => {
    const page = +req.query.page || 1;
    let itemCount;

    Product.find()
        .countDocuments()
        .then(numProducts => {
            itemCount = numProducts;
            return Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE);
        })
        .then(products => {
            res.render(
                'shop/index', {
                    prods: products,
                    pageTitle: 'Homepage',
                    path: '/',
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

exports.getProducts = (req, res, next) => {
    const page = +req.query.page || 1;
    let itemCount;

    Product.find()
        .countDocuments()
        .then(numProducts => {
            itemCount = numProducts;
            return Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE);
        })
        .then(products => {
            res.render(
                'shop/product-list', {
                    prods: products,
                    pageTitle: 'Shop',
                    path: '/products',
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
        .catch(err => { if (err) {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        } });
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
    .catch(err => { if (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    } });
};

exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(prodId)
        .then(product => {
            req.user.addToCart(product);
            res.redirect('/cart');
        })
        .catch(err => { if (err) {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        } });
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
        .catch(err => { if (err) {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        } });
};

exports.getOrders = (req, res, next) => {
    Order.find( { 'user.userId': req.user._id })
        .then(orders => {
            res.render(
                'shop/orders',
                {
                    pageTitle: 'Orders',
                    path: '/orders',
                    orders: orders
                }
            );
        })
        .catch(err => { if (err) {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        } });
};

exports.getInvoice = (req, res, next) => {
    const orderId = req.params.orderId;
    Order.findById(orderId)
        .then(order => {
            if (!order) {
                return next(new Error('No order found'));
            }
            if (order.user.userId.toString() !== req.user._id.toString()) {
                return next(new Error('You do not have permission to view this document'));
            }
            const invoiceName = 'Invoice-' + orderId + '.pdf';
            const invoicePath = path.join('data', 'invoices', invoiceName);
            // fs.readFile(invoicePath, (err, data) => {
            //     if (err) { return next(err); }
            //     res.setHeader('Content-Type', 'application/pdf');
            //     res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');
            //     res.send(data);
            // });
            // const file = fs.createReadStream(invoicePath);
            // res.setHeader('Content-Type', 'application/pdf');
            // res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');
            // file.pipe(res);
            const pdfDoc = new pdfkit();
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');
            pdfDoc.pipe(fs.createWriteStream(invoicePath));
            pdfDoc.pipe(res);

            pdfDoc.fontSize(26).text('Invoice', {
                underline: true
            });

            pdfDoc.text('--------------------------');

            let totalPrice = 0;
            order.products.forEach(p => {
                let productCost = p.productData.price * p.quantity;
                totalPrice += productCost;
                pdfDoc.fontSize(18).text(p.productData.title + ' x ' + p.quantity + ' - €' + productCost);
            });

            pdfDoc.fontSize(26).text('--------------------------');
            pdfDoc.fontSize(18).text('Total: €' + totalPrice.toFixed(2));

            pdfDoc.end();

        })
        .catch(err => { if (err) {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        } });
};