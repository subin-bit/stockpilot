// routes/apiRoutes.js — API Routes (all return JSON and 401 on unauthorized)

'use strict';

const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');
const { requireApiLogin } = require('../middleware/auth');

// Protect all /api/* routes with JSON-returning auth guard
router.use(requireApiLogin);

// GET /api/items?search=...
router.get('/items', apiController.searchItems);

// GET /api/items/:id
router.get('/items/:id', apiController.getItem);

// GET /api/stats
router.get('/stats', apiController.getStats);

module.exports = router;
