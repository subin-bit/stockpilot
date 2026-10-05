// routes/itemRoutes.js — Item CRUD routes
// Protected by requireLogin middleware. Note: /items/new is declared before /items/:id

const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const { requireLogin } = require('../middleware/auth');

// All item routes require authentication
router.use(requireLogin);

// 1. List items
router.get('/', itemController.index);

// 2. Form to create a new item (MUST be before /:id)
router.get('/new', itemController.showCreate);

// 3. Store new item
router.post('/', itemController.store);

// 4. View single item details
router.get('/:id', itemController.show);

// 5. Form to edit existing item
router.get('/:id/edit', itemController.edit);

// 6. Update existing item
router.post('/:id/update', itemController.update);

// 7. Delete an item
router.post('/:id/delete', itemController.destroy);

module.exports = router;
