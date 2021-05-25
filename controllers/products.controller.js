const Product = require('../models/product.model');
const Cart = require('../models/cart.model');

exports.getProducts = (req, res, next) => {
    Product.fetchAll()
        .then(([rows, fieldData]) => {
            res.render(
                'shop/product-list', {
                    prods: rows,
                    pageTitle: 'Shop',
                    path: '/products'
                }
            );
        })
        .catch(err => {
            if (err) console.log(err);
        });
};

exports.getProduct = (req, res, next) => {
    const id = req.params.id;
    Product.findById(id)
        .then(([rows, fieldData]) => {
            res.render(
                'shop/product-detail', {
                    product: rows[0],
                    pageTitle: rows[0].title,
                    path: '/products'
                }
            );
        })
        .catch(err => {
            if (err) console.log(err);
        });
};

exports.getCart = (req, res, next) => {
    Cart.getCart(cart => {
        Product.fetchAll(products => {
            const cartProducts = [];
           for(let product of products) {
               const cartProductData = cart.products.find(prod => prod.id === product.id);
               if (cartProductData) {
                   cartProducts.push({ productData: product, qty: cartProductData.qty });
               }
           }
            res.render(
                'shop/cart',
                {
                    pageTitle: 'Cart',
                    path: '/cart',
                    products: cartProducts
                }
            );
        });
    });
};

exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(prodId)
        .then(([rows, fieldData]) => {
            Cart.addProduct(prodId, rows[0].price);
            res.redirect('/cart');
        })
        .catch(err => {
            if (err) console.log(err);
        });
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

exports.getHomepage = (req, res, next) => {
    Product.fetchAll()
        .then(([rows, fieldData]) => {
            res.render(
              'shop/index', {
                    prods: rows,
                    pageTitle: 'Homepage',
                    path: '/'
                }
            );
        })
        .catch(err => {
        if (err) console.log(err);
    });
};