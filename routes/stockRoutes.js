// routes/stockRoutes.js — Stock management and history routes

const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const { requireLogin } = require('../middleware/auth');

// All stock routes require login
router.use(requireLogin);

// Stock management form (GET /stock/manage)
router.get('/manage', stockController.showManage);

// Process stock in/out (POST /stock/manage)
router.post('/manage', stockController.processStock);

// Stock history (GET /stock/history)
router.get('/history', stockController.history);

module.exports = router;
