const path = require('path');
const express = require('express');

const adminController = require('../controllers/admin.controller');

const router = express.Router();

router.get('/products', adminController.getProducts);
router.get('/add-product', adminController.getAddProduct);
router.post('/add-product', adminController.postAddProduct);

module.exports = router;