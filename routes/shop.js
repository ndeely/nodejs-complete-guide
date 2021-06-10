const express = require('express');

const shopController = require('../controllers/shop.controller');

const router = express.Router();

router.get('/', shopController.getHomepage);
router.get('/products', shopController.getProducts);
router.get('/products/:id', shopController.getProduct);
router.get('/cart', shopController.getCart);
router.post('/cart', shopController.postCart);
router.get('/orders', shopController.getOrders);
router.post('/cart-delete-item', shopController.deleteCartItem);
router.post('/create-order', shopController.postOrder);

module.exports = router;