const express = require('express');

const adminController = require('../controllers/admin.controller');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/products', adminController.getProducts);
router.get('/add-product', isAuth, adminController.getAddProduct);
router.post('/add-product', isAuth, adminController.postAddProduct);
router.get('/edit-product/:id', isAuth, adminController.getEditProduct);
router.post('/edit-product', isAuth, adminController.postEditProduct);
router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = router;