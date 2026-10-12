// routes/productRoutes.js — Product CRUD routes

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { requireLogin, requireAdmin } = require('../middleware/auth');

// All product routes require login
router.use(requireLogin);

// List products (GET /products)
router.get('/', productController.index);

// Add new product form (GET /products/new) — admin only
router.get('/new', requireAdmin, productController.showCreate);

// Store new product (POST /products) — admin only
router.post('/', requireAdmin, productController.store);

// View single product (GET /products/:id)
router.get('/:id', productController.show);

// Edit product form (GET /products/:id/edit) — admin only
router.get('/:id/edit', requireAdmin, productController.edit);

// Update product (POST /products/:id/update) — admin only
router.post('/:id/update', requireAdmin, productController.update);

// Delete product (POST /products/:id/delete) — admin only
router.post('/:id/delete', requireAdmin, productController.destroy);

module.exports = router;
