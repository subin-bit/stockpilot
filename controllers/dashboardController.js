// controllers/dashboardController.js — Dashboard controller
// Computes inventory metrics and chart data for the main dashboard.

const Product = require('../models/Product');
const Category = require('../models/Category');
const StockTransaction = require('../models/StockTransaction');

// GET / — Dashboard home
const index = async (req, res) => {
  try {
    // 1. Total products count
    const totalProducts = await Product.countDocuments();

    // 2. Total stock (sum of all quantities)
    const stockAgg = await Product.aggregate([
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]);
    const totalStock = stockAgg.length > 0 ? stockAgg[0].total : 0;

    // 3. Low stock count (quantity > 0 AND quantity <= minStock)
    const lowStockCount = await Product.countDocuments({
      $expr: { $and: [{ $lte: ['$quantity', '$minStock'] }, { $gt: ['$quantity', 0] }] }
    });

    // 4. Out of stock count
    const outOfStockCount = await Product.countDocuments({ quantity: 0 });

    // 5. Inventory value (sum of quantity * price)
    const valueAgg = await Product.aggregate([
      { $group: { _id: null, total: { $sum: { $multiply: ['$price', '$quantity'] } } } }
    ]);
    const inventoryValue = valueAgg.length > 0 ? valueAgg[0].total : 0;

    // 6. Low-stock products list for alerts table
    const lowStockProducts = await Product.find({
      $expr: { $lte: ['$quantity', '$minStock'] }
    }).populate('category', 'name').sort({ quantity: 1 }).limit(10);

    // 7. Recent 5 transactions
    const recentTransactions = await StockTransaction.find()
      .populate('product', 'name sku')
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // 8. Chart data: Stock quantity by category (bar chart)
    const stockByCategory = await Product.aggregate([
      { $group: { _id: '$category', totalQty: { $sum: '$quantity' }, count: { $sum: 1 } } },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'cat' } },
      { $unwind: '$cat' },
      { $project: { name: '$cat.name', totalQty: 1, count: 1 } },
      { $sort: { name: 1 } }
    ]);

    res.render('dashboard', {
      title: 'Dashboard — StockPilot',
      totalProducts,
      totalStock,
      lowStockCount,
      outOfStockCount,
      inventoryValue,
      lowStockProducts,
      recentTransactions,
      stockByCategory: JSON.stringify(stockByCategory)
    });
  } catch (err) {
    console.error('Error loading dashboard data:', err);
    res.status(500).render('errors/500', { title: 'Server Error — StockPilot' });
  }
};

module.exports = {
  index
};
