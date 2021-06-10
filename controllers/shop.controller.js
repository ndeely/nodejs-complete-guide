const Product = require('../models/product.model');
// const Cart = require('../models/cart.model');

exports.getHomepage = (req, res, next) => {
    Product.fetchAll()
        .then(products => {
            res.render(
                'shop/index', {
                    prods: products,
                    pageTitle: 'Homepage',
                    path: '/'
                }
            );
        })
        .catch(err => { if (err) console.log(err); });
};

exports.getProducts = (req, res, next) => {
    Product.fetchAll()
        .then(products => {
            res.render(
                'shop/product-list', {
                    prods: products,
                    pageTitle: 'Shop',
                    path: '/products'
                }
            );
        })
        .catch(err => { if (err) console.log(err); });
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
        .getCart()
        .then(products => {
        res.render('shop/cart', {
            path: '/cart',
            pageTitle: 'Your Cart',
            products: products
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
        .then(result => {
            console.log(result);
        });
};

exports.deleteCartItem = (req, res, next) => {
    const prodId = req.body.productId;
    req.user
        .deleteFromCart(prodId)
        .then(() => {
            res.redirect('/cart');
        })
        .catch( err => { if(err) console.log(err) } );

};

exports.postOrder = (req, res, next) => {
    let fetchedCart;
    req.user
        .getCart()
        .then(cart => {
            fetchedCart = cart;
            return cart.getProducts();
        })
        .then(products => {
            return req.user
                .createOrder()
                .then(order => {
                    order.addProducts(products.map(product => {
                        product.orderitem = { quantity: product.cartitem.quantity };
                        return product;
                    }));
                })
                .catch(err => { if (err) console.log(err) });
        })
        .then(result => {
            fetchedCart.setProducts(null);
            res.redirect('/orders');
        })
        .catch(err => { if (err) console.log(err) });
};

exports.getOrders = (req, res, next) => {
    req.user
        .getOrders({ include: ['products'] })
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
        .catch(err => { if (err) console.log(err) });
};