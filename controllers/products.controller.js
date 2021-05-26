const Product = require('../models/product.model');
const Cart = require('../models/cart.model');

exports.getHomepage = (req, res, next) => {
    Product.findAll()
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
    Product.findAll()
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
    Product.findByPk(id)
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
        .then(cart => {
            return cart
                .getProducts()
                .then(products => {
                    res.render('shop/cart', {
                       path: '/cart',
                       pageTitle: 'Your Cart',
                       products: products
                    });
                })
                .catch(err => { if (err) console.log(err) });;
        })
        .catch(err => { if (err) console.log(err) });
};

exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;
    let fetchedCart;
    let newQuantity = 1;
    req.user
        .getCart()
        .then(cart => {
            fetchedCart = cart;
            return cart.getProducts({ where: { id: prodId } });
        })
        .then(products => {
            let product;
            if (products.length > 0) {
                product = products[0];
            }

            if (product) {
                const oldQuantity = product.cartitem.quantity;
                newQuantity = oldQuantity + 1;
                return product;
            }
            return Product.findByPk(prodId);
        })
        .then(product => {
            return fetchedCart.addProduct(product, {
                through: { quantity: newQuantity }
            });
        })
        .then(() => {
            res.redirect('/cart');
        })
        .catch(err => { if (err) console.log(err) });
};

exports.deleteCartItem = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(prodId)
        .then(([rows, fieldData]) => {
            Cart.deleteProduct(rows[0].id, rows[0].price);
            res.redirect('/cart');
        })
        .catch(err => {
            if (err) console.log(err);
        });
}

exports.getOrders = (req, res, next) => {
    res.render(
        'shop/orders',
        {
            pageTitle: 'Orders',
            path: '/orders'
        }
    );
};

exports.getCheckout = (req, res, next) => {
    res.render(
        'shop/checkout',
        {
            pageTitle: 'Checkout',
            path: '/cart'
        }
    );
};