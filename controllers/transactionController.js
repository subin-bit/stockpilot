// controllers/transactionController.js — Stock transactions controller
// Handles recording Stock IN and Stock OUT, atomic inventory quantity updates, and transaction logging.

const mongoose = require('mongoose');
const StockTransaction = require('../models/StockTransaction');
const Item = require('../models/Item');

// GET /transactions — List all stock transactions (history audit log)
const index = async (req, res) => {
  try {
    const transactions = await StockTransaction.find()
      .populate('item', 'name sku')
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.render('transactions/index', {
      title: 'Stock Movements — StockPilot',
      transactions
    });
  } catch (err) {
    console.error('Error loading transactions:', err);
    res.status(500).render('errors/500', { title: 'Server Error — StockPilot' });
  }
};

// GET /transactions/new — Show form to record stock movement
const showCreate = async (req, res) => {
  try {
    const items = await Item.find().sort({ name: 1 });
    const preselectedItemId = req.query.item || '';

    res.render('transactions/new', {
      title: 'Record Stock Movement — StockPilot',
      items,
      preselectedItemId
    });
  } catch (err) {
    console.error('Error loading transaction form:', err);
    res.status(500).render('errors/500', { title: 'Server Error — StockPilot' });
  }
};

// POST /transactions — Process stock IN / OUT and update item quantity
const store = async (req, res) => {
  const { item: itemId, type, quantity, note } = req.body;

  // Validate item ID
  if (!itemId || !mongoose.Types.ObjectId.isValid(itemId)) {
    req.session.errors = ['Please select a valid item'];
    req.session.formData = req.body;
    return req.session.save(() => res.redirect('/transactions/new'));
  }

  // Validate quantity
  const qty = parseInt(quantity, 10);
  if (isNaN(qty) || qty < 1) {
    req.session.errors = ['Quantity must be at least 1'];
    req.session.formData = req.body;
    return req.session.save(() => res.redirect('/transactions/new'));
  }

  // Validate type
  if (type !== 'IN' && type !== 'OUT') {
    req.session.errors = ['Transaction type must be either IN or OUT'];
    req.session.formData = req.body;
    return req.session.save(() => res.redirect('/transactions/new'));
  }

  try {
    // 1. Fetch item to verify existence and check stock for OUT transactions
    const item = await Item.findById(itemId);
    if (!item) {
      req.session.errors = ['Selected item not found'];
      req.session.formData = req.body;
      return req.session.save(() => res.redirect('/transactions/new'));
    }

    // 2. Reject if OUT exceeds available quantity
    if (type === 'OUT' && qty > item.quantity) {
      req.session.errors = [`Not enough stock. Available: ${item.quantity}`];
      req.session.formData = req.body;
      return req.session.save(() => res.redirect('/transactions/new'));
    }

    // 3. Atomically update item quantity using $inc
    const quantityDelta = type === 'IN' ? qty : -qty;
    await Item.findByIdAndUpdate(itemId, { $inc: { quantity: quantityDelta } });

    // 4. Create transaction log record
    try {
      const transaction = new StockTransaction({
        item: itemId,
        type,
        quantity: qty,
        note: note ? note.trim() : '',
        user: req.session.userId
      });

      await transaction.save();

      req.session.success = `Stock ${type} of ${qty} units recorded successfully.`;
      return req.session.save(() => res.redirect('/transactions'));
    } catch (txError) {
      // Revert the quantity update if transaction creation fails
      await Item.findByIdAndUpdate(itemId, { $inc: { quantity: -quantityDelta } });
      console.error('Failed to create transaction record, reverted stock update:', txError);
      req.session.errors = ['Failed to record transaction log. Stock quantity has been restored.'];
      req.session.formData = req.body;
      return req.session.save(() => res.redirect('/transactions/new'));
    }
  } catch (err) {
    console.error('Error processing transaction:', err);
    res.status(500).render('errors/500', { title: 'Server Error — StockPilot' });
  }
};

module.exports = {
  index,
  showCreate,
  store
};
