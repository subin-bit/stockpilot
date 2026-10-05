// routes/itemRoutes.js — Item CRUD routes
// Protected by requireLogin middleware. Note: /items/new is declared before /items/:id

const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const { requireLogin, requireAdmin } = require('../middleware/auth');

// All item routes require authentication
router.use(requireLogin);

// 1. List items (accessible to all authenticated users)
router.get('/', itemController.index);

// 2. Form to create a new item (Admin only)
router.get('/new', requireAdmin, itemController.showCreate);

// 3. Store new item (Admin only)
router.post('/', requireAdmin, itemController.store);

// 4. View single item details (accessible to all authenticated users)
router.get('/:id', itemController.show);

// 5. Form to edit existing item (Admin only)
router.get('/:id/edit', requireAdmin, itemController.edit);

// 6. Update existing item (Admin only)
router.post('/:id/update', requireAdmin, itemController.update);

// 7. Delete an item (Admin only)
router.post('/:id/delete', requireAdmin, itemController.destroy);

module.exports = router;
