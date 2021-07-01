const stripe = require('stripe')(process.env.STRIPE_API_KEY);

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
                    total: total
                }
            );
        })
        .catch(err => { if (err) {
            console.log(err);
            // const error = new Error(err);
            // error.httpStatusCode = 500;
            // return next(error);
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
                const price_data = {};
                price_data['currency'] = 'eur';
                price_data['product_data'] = {};
                price_data['product_data']['name'] = p.title;
                price_data['product_data']['images'] = [ process.env.MY_DOMAIN + p.imageUrl ];
                price_data['unit_amount'] = p.productId.price * 100;

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
            console.log(line_items);
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
    res.render(
        'payment/success',
        {
            pageTitle: 'Order Complete',
            path: '/checkout/success'
        }
    );
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