const path = require('path');
const express = require('express');

const productsController = require('../controllers/products.controller');

const router = express.Router();

router.get('/', productsController.getHomepage);
router.get('/products', productsController.getProducts);
router.get('/cart', productsController.getCart);
router.get('/cart/checkout', productsController.getCheckout);

module.exports = router;