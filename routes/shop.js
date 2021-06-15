const express = require('express');

const shopController = require('../controllers/shop.controller');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/', shopController.getHomepage);
router.get('/products', shopController.getProducts);
router.get('/products/:id', shopController.getProduct);
router.get('/cart', isAuth, shopController.getCart);
router.post('/cart', isAuth, shopController.postCart);
router.get('/orders', isAuth, shopController.getOrders);
router.post('/cart-delete-item', isAuth, shopController.deleteCartItem);
router.post('/create-order', isAuth, shopController.postOrder);

module.exports = router;