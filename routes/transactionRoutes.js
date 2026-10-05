// routes/transactionRoutes.js — Stock transactions audit routes
// Protected by requireLogin. Transactions are immutable history logs (no edit/delete).

const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { requireLogin } = require('../middleware/auth');

router.use(requireLogin);

// 1. List transaction history
router.get('/', transactionController.index);

// 2. Form to record movement
router.get('/new', transactionController.showCreate);

// 3. Store transaction and update stock
router.post('/', transactionController.store);

module.exports = router;
