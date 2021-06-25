const express = require('express');
const { body } = require('express-validator');

const adminController = require('../controllers/admin.controller');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/products', adminController.getProducts);
router.get('/add-product', isAuth, adminController.getAddProduct);
router.post(
    '/add-product',
    [
      body('title')
          .isString().withMessage("Title must be a valid string of text")
          .isLength({min: 3}).withMessage("Title must be at least 3 characters long")
          .trim(),
        body('price')
            .isFloat().withMessage("Price must be a valid decimal (i.e. 5.99"),
        body('description')
            .isLength({min: 5, max: 400}).withMessage("Description must be at least 5 characters long")
            .trim()
    ],
    isAuth,
    adminController.postAddProduct);
router.get('/edit-product/:id', isAuth, adminController.getEditProduct);
router.post(
    '/edit-product',
    [
        body('title')
            .isString().withMessage("Title must be a valid string of text")
            .isLength({min: 3}).withMessage("Title must be at least 3 characters long")
            .trim(),
        body('image'),
        body('price')
            .isFloat().withMessage("Price must be a valid decimal (i.e. 5.99"),
        body('description')
            .isLength({min: 5, max: 400}).withMessage("Description must be at least 5 characters long")
            .trim()
    ],
    isAuth,
    adminController.postEditProduct);
router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = router;