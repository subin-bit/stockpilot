// routes/supplierRoutes.js — Supplier CRUD routes
// Protected by requireLogin middleware. Note: /suppliers/new is declared before /suppliers/:id

const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const { requireLogin, requireAdmin } = require('../middleware/auth');

router.use(requireLogin);

// 1. List suppliers (accessible to all logged-in users)
router.get('/', supplierController.index);

// 2. Form to add new supplier (Admin only)
router.get('/new', requireAdmin, supplierController.showCreate);

// 3. Save new supplier (Admin only)
router.post('/', requireAdmin, supplierController.store);

// 4. View supplier details and linked items (accessible to all logged-in users)
router.get('/:id', supplierController.show);

// 5. Form to edit supplier (Admin only)
router.get('/:id/edit', requireAdmin, supplierController.edit);

// 6. Update supplier (Admin only)
router.post('/:id/update', requireAdmin, supplierController.update);

// 7. Delete supplier (Admin only)
router.post('/:id/delete', requireAdmin, supplierController.destroy);

module.exports = router;
