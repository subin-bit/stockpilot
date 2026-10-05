// controllers/dashboardController.js — Dashboard controller
// Computes inventory metrics, low-stock alerts, total stock value, and recent movements.

const Item = require('../models/Item');
const Supplier = require('../models/Supplier');
const StockTransaction = require('../models/StockTransaction');

// GET / — Dashboard home
const index = async (req, res) => {
  try {
    // 1. Total items count
    const totalItems = await Item.countDocuments();

    // 2. Total suppliers count
    const totalSuppliers = await Supplier.countDocuments();

    // 3. Low-stock items (quantity <= reorderLevel using $expr)
    const lowStockItems = await Item.find({
      $expr: { $lte: ['$quantity', '$reorderLevel'] }
    }).sort({ quantity: 1 });

    // 4. Total stock inventory valuation (sum of quantity * unitPrice)
    const allItems = await Item.find({}, 'quantity unitPrice');
    const totalStockValue = allItems.reduce((acc, curr) => {
      return acc + (curr.quantity * curr.unitPrice);
    }, 0);

    // 5. Recent 5 transactions
    const recentTransactions = await StockTransaction.find()
      .populate('item', 'name sku')
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.render('home', {
      title: 'Dashboard — StockPilot',
      totalItems,
      totalSuppliers,
      lowStockItems,
      totalStockValue,
      recentTransactions
    });
  } catch (err) {
    console.error('Error loading dashboard data:', err);
    res.status(500).render('errors/500', { title: 'Server Error — StockPilot' });
  }
};

module.exports = {
  index
};
