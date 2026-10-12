// routes/categoryRoutes.js — Category CRUD routes

const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { requireLogin, requireAdmin } = require('../middleware/auth');

// All category routes require login
router.use(requireLogin);

// List categories (GET /categories)
router.get('/', categoryController.index);

// Add new category form (GET /categories/new) — admin only
router.get('/new', requireAdmin, categoryController.showCreate);

// Store new category (POST /categories) — admin only
router.post('/', requireAdmin, categoryController.store);

// Edit category form (GET /categories/:id/edit) — admin only
router.get('/:id/edit', requireAdmin, categoryController.edit);

// Update category (POST /categories/:id/update) — admin only
router.post('/:id/update', requireAdmin, categoryController.update);

// Delete category (POST /categories/:id/delete) — admin only
router.post('/:id/delete', requireAdmin, categoryController.destroy);

module.exports = router;
