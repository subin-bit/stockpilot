// controllers/apiController.js — JSON API and Partial Endpoints for Ajax Features
// Protected by requireApiLogin in routes.

'use strict';

const mongoose = require('mongoose');
const Item = require('../models/Item');
const Supplier = require('../models/Supplier');
const StockTransaction = require('../models/StockTransaction');

// ─── GET /api/items?search=... ──────────────────────────────────
// Returns JSON array of items filtered by search keyword (name, SKU, category)
const searchItems = async (req, res) => {
  try {
    const search = req.query.search ? req.query.search.trim() : '';
    let query = {};

    if (search.length > 0) {
      // Escape special regex characters to prevent regex injection crashes
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      query = {
        $or: [
          { name: regex },
          { sku: regex },
          { category: regex }
        ]
      };
    }

    const items = await Item.find(query)
      .populate('supplier', 'name')
      .sort({ name: 1 })
      .lean();

    // Map items to include computed isLowStock boolean for client-side consumers
    const formatted = items.map((item) => ({
      ...item,
      isLowStock: item.quantity <= item.reorderLevel
    }));

    return res.json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    console.error('API searchItems error:', error);
    return res.status(500).json({ success: false, message: 'Server error searching items' });
  }
};

// ─── GET /api/items/:id ─────────────────────────────────────────
// Returns single item JSON details for quick view panel and transaction stock checks
const getItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid item ID format' });
    }

    const item = await Item.findById(id).populate('supplier', 'name email phone').lean();

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    return res.json({
      success: true,
      data: {
        ...item,
        isLowStock: item.quantity <= item.reorderLevel
      }
    });
  } catch (error) {
    console.error('API getItem error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving item' });
  }
};

// ─── GET /api/stats ─────────────────────────────────────────────
// Returns real-time dashboard summary metrics in JSON format
const getStats = async (req, res) => {
  try {
    const [totalItems, allItems, totalSuppliers] = await Promise.all([
      Item.countDocuments(),
      Item.find({}, 'quantity reorderLevel unitPrice').lean(),
      Supplier.countDocuments()
    ]);

    let lowStockCount = 0;
    let totalStockValue = 0;

    allItems.forEach((it) => {
      if (it.quantity <= it.reorderLevel) {
        lowStockCount++;
      }
      totalStockValue += (it.quantity * it.unitPrice);
    });

    return res.json({
      success: true,
      data: {
        totalItems,
        lowStockCount,
        totalSuppliers,
        totalStockValue: Number(totalStockValue.toFixed(2))
      }
    });
  } catch (error) {
    console.error('API getStats error:', error);
    return res.status(500).json({ success: false, message: 'Server error calculating stats' });
  }
};

// ─── GET /partials/recent-transactions ──────────────────────────
// Returns HTML partial of recent transactions table for jQuery .load()
const recentTransactions = async (req, res) => {
  try {
    const transactions = await StockTransaction.find()
      .populate('item', 'name')
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return res.render('partials/recent_transactions_table', {
      recentTransactions: transactions,
      layout: false
    });
  } catch (error) {
    console.error('API recentTransactions error:', error);
    return res.status(500).send('<p class="text-error">Error refreshing recent transactions.</p>');
  }
};

module.exports = {
  searchItems,
  getItem,
  getStats,
  recentTransactions
};
