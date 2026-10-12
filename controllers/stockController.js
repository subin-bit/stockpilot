// controllers/stockController.js — Stock management controller
// Handles Stock In / Stock Out operations and transaction history.

const mongoose = require('mongoose');
const StockTransaction = require('../models/StockTransaction');
const Product = require('../models/Product');

// GET /stock/manage — Show stock management form
const showManage = async (req, res) => {
  try {
    const products = await Product.find().sort({ name: 1 });
    res.render('stock/manage', {
      title: 'Stock Management — StockPilot',
      products
    });
  } catch (err) {
    console.error('Error loading stock management form:', err);
    res.status(500).render('errors/500', { title: 'Server Error — StockPilot' });
  }
};

// POST /stock/manage — Process Stock IN or Stock OUT
const processStock = async (req, res) => {
  const { product: productId, type, quantity, note } = req.body;

  // Validate product ID
  if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
    req.session.errors = ['Please select a valid product'];
    req.session.formData = req.body;
    return req.session.save(() => res.redirect('/stock/manage'));
  }

  // Validate quantity
  const qty = parseInt(quantity, 10);
  if (isNaN(qty) || qty < 1) {
    req.session.errors = ['Quantity must be at least 1'];
    req.session.formData = req.body;
    return req.session.save(() => res.redirect('/stock/manage'));
  }

  // Validate type
  if (type !== 'IN' && type !== 'OUT') {
    req.session.errors = ['Transaction type must be either IN or OUT'];
    req.session.formData = req.body;
    return req.session.save(() => res.redirect('/stock/manage'));
  }

  try {
    // 1. Fetch product to verify existence and check stock for OUT
    const product = await Product.findById(productId);
    if (!product) {
      req.session.errors = ['Selected product not found'];
      req.session.formData = req.body;
      return req.session.save(() => res.redirect('/stock/manage'));
    }

    // 2. Reject if OUT exceeds available stock
    if (type === 'OUT' && qty > product.quantity) {
      req.session.errors = [`Not enough stock. Available: ${product.quantity}`];
      req.session.formData = req.body;
      return req.session.save(() => res.redirect('/stock/manage'));
    }

    // 3. Atomically update product quantity using $inc
    const quantityDelta = type === 'IN' ? qty : -qty;
    await Product.findByIdAndUpdate(productId, { $inc: { quantity: quantityDelta } });

    // 4. Create transaction log record
    try {
      const transaction = new StockTransaction({
        product: productId,
        type,
        quantity: qty,
        note: note ? note.trim() : '',
        user: req.session.userId
      });

      await transaction.save();

      req.session.success = `Stock ${type} of ${qty} units recorded for ${product.name}`;
      return req.session.save(() => res.redirect('/stock/history'));
    } catch (txError) {
      // Revert the quantity update if transaction creation fails
      await Product.findByIdAndUpdate(productId, { $inc: { quantity: -quantityDelta } });
      console.error('Failed to create transaction record, reverted stock update:', txError);
      req.session.errors = ['Failed to record transaction. Stock quantity has been restored.'];
      req.session.formData = req.body;
      return req.session.save(() => res.redirect('/stock/manage'));
    }
  } catch (err) {
    console.error('Error processing stock:', err);
    res.status(500).render('errors/500', { title: 'Server Error — StockPilot' });
  }
};

// GET /stock/history — Show all stock transaction history
const history = async (req, res) => {
  try {
    const transactions = await StockTransaction.find()
      .populate('product', 'name sku')
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.render('stock/history', {
      title: 'Stock History — StockPilot',
      transactions
    });
  } catch (err) {
    console.error('Error loading stock history:', err);
    res.status(500).render('errors/500', { title: 'Server Error — StockPilot' });
  }
};

module.exports = {
  showManage,
  processStock,
  history
};
