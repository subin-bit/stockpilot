// routes/supplierRoutes.js — Supplier CRUD routes
// Protected by requireLogin middleware. Note: /suppliers/new is declared before /suppliers/:id

const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const { requireLogin } = require('../middleware/auth');

router.use(requireLogin);

// 1. List suppliers
router.get('/', supplierController.index);

// 2. Form to add new supplier (MUST be before /:id)
router.get('/new', supplierController.showCreate);

// 3. Save new supplier
router.post('/', supplierController.store);

// 4. View supplier details and linked items
router.get('/:id', supplierController.show);

// 5. Form to edit supplier
router.get('/:id/edit', supplierController.edit);

// 6. Update supplier
router.post('/:id/update', supplierController.update);

// 7. Delete supplier
router.post('/:id/delete', supplierController.destroy);

module.exports = router;
