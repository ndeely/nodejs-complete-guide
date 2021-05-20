const path = require('path');
const express = require('express');

const adminController = require('../controllers/admin.controller');

const router = express.Router();

router.get('/add-product', adminController.getAddProduct);
router.post('/add-product', adminController.postAddProduct);
router.get('/products', adminController.getProducts);

module.exports = router;