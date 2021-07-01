const express = require('express');

const paymentController = require('../controllers/payment.controller');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/checkout', isAuth, paymentController.getCheckout);
router.post('/checkout', isAuth, paymentController.postCheckout);
router.get('/checkout/success', isAuth, paymentController.getCheckoutSuccess);
router.get('/checkout/cancelled', isAuth, paymentController.getCheckoutCancelled);

module.exports = router;