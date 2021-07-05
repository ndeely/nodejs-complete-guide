const stripe = require('stripe')(process.env.STRIPE_API_KEY);
const Order = require('../models/order.model');

exports.getCheckout = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            const products = user.cart.items;
            let total = 0;
            products.forEach(p => {
                total += p.productId.price * p.quantity;
            });
            res.render(
                'payment/checkout',
                {
                    pageTitle: 'Checkout',
                    path: '/checkout',
                    products: products,
                    total: total.toFixed(2)
                }
            );
        })
        .catch(err => { if (err) {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        } });
};

exports.postCheckout = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            const products = user.cart.items;
            const line_items = [];

            products.forEach(p => {
                const line_item = {};
                line_item['price_data'] = {};
                line_item['price_data']['currency'] = 'eur';
                line_item['price_data']['product_data'] = {};
                line_item['price_data']['product_data']['name'] = p.productId.title;
                line_item['price_data']['product_data']['images'] = [ process.env.MY_DOMAIN + p.productId.imageUrl ];
                line_item['price_data']['unit_amount'] = Math.round(p.productId.price * 100);
                line_item['quantity'] = p.quantity;

                line_items.push(line_item);
            });
            return line_items;
        })
        .then(line_items => {
            stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: line_items,
                mode: 'payment',
                success_url: process.env.MY_DOMAIN + `/checkout/success`,
                cancel_url: process.env.MY_DOMAIN + `/checkout/cancelled`,
            })
            .then(session => {
                res.json({id: session.id});
            })
            .catch(err => { if (err) console.log(err); });
        })
        .catch(err => { if (err) console.log(err) });
};

exports.getCheckoutSuccess = (req, res, next) => {
    let currentDate = new Date();
    const date = currentDate.getFullYear() + "/" + (currentDate.getMonth() + 1) + "/" + currentDate.getDate();
    const time = currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds();

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
                products: products,
                date: date,
                time: time
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

exports.getCheckoutCancelled = (req, res, next) => {
    res.render(
        'payment/cancelled',
        {
            pageTitle: 'Order Cancelled',
            path: '/checkout/cancelled'
        }
    );
};