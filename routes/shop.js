const path = require('path');
const express = require('express');

const productsController = require('../controllers/products.controller');

const router = express.Router();

router.get('/', productsController.getHomepage);
router.get('/products', productsController.getProducts);
router.get('/products/:id', productsController.getProduct);
router.get('/cart', productsController.getCart);
router.post('/cart', productsController.postCart);
router.get('/orders', productsController.getOrders);
router.get('/cart/checkout', productsController.getCheckout);
router.post('/cart-delete-item', productsController.deleteCartItem);

module.exports = router;