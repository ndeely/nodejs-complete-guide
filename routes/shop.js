const path = require('path');
const express = require('express');

const productsController = require('../controllers/products.controller');

const router = express.Router();

router.get('/cart', productsController.getCart);
router.get('/products', productsController.getProducts);
router.get('/', productsController.getHomepage);

module.exports = router;