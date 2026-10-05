// controllers/itemController.js — Controller for Item CRUD operations
// Handles listing, filtering, creating, viewing, updating, and deleting inventory items.

const mongoose = require('mongoose');
const Item = require('../models/Item');

// Helper to extract clean error messages from Mongoose or duplicate key errors
const extractErrors = (error) => {
  const errors = [];
  if (error.code === 11000) {
    errors.push('An item with this SKU already exists');
  } else if (error.errors) {
    Object.keys(error.errors).forEach((key) => {
      errors.push(error.errors[key].message);
    });
  } else {
    errors.push(error.message || 'Operation failed');
  }
  return errors;
};

// GET /items — List all items (with optional ?category= filter)
const index = async (req, res) => {
  try {
    const filter = {};
    const selectedCategory = req.query.category ? req.query.category.trim() : '';

    if (selectedCategory) {
      filter.category = selectedCategory;
    }

    // Fetch items matching filter, newest first
    const items = await Item.find(filter).sort({ createdAt: -1 });

    // Fetch unique categories for the filter dropdown
    const categories = await Item.distinct('category');

    res.render('items/index', {
      title: 'Inventory Items — StockPilot',
      items,
      categories,
      selectedCategory
    });
  } catch (err) {
    console.error('Error fetching items:', err);
    res.status(500).render('errors/500', { title: 'Server Error — StockPilot' });
  }
};

// GET /items/new — Show form to create a new item
const showCreate = (req, res) => {
  res.render('items/new', {
    title: 'Add New Item — StockPilot',
    item: null
  });
};

// POST /items — Store a new item in the database
const store = async (req, res) => {
  const { name, sku, category, unitPrice, quantity, reorderLevel, description } = req.body;

  try {
    const item = new Item({
      name,
      sku,
      category: category ? category.trim() : 'General',
      unitPrice,
      quantity,
      reorderLevel,
      description,
      createdBy: req.session.userId
    });

    await item.save();

    req.session.success = 'Item added';
    return req.session.save(() => res.redirect('/items'));
  } catch (error) {
    req.session.errors = extractErrors(error);
    req.session.formData = req.body;
    return req.session.save(() => res.redirect('/items/new'));
  }
};

// GET /items/:id — Show a single item's details
const show = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).render('errors/404', { title: 'Item Not Found — StockPilot' });
  }

  try {
    const item = await Item.findById(id);

    if (!item) {
      return res.status(404).render('errors/404', { title: 'Item Not Found — StockPilot' });
    }

    res.render('items/show', {
      title: `${item.name} — StockPilot`,
      item
    });
  } catch (err) {
    console.error('Error loading item:', err);
    res.status(500).render('errors/500', { title: 'Server Error — StockPilot' });
  }
};

// GET /items/:id/edit — Show form to edit an existing item
const edit = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).render('errors/404', { title: 'Item Not Found — StockPilot' });
  }

  try {
    const item = await Item.findById(id);

    if (!item) {
      return res.status(404).render('errors/404', { title: 'Item Not Found — StockPilot' });
    }

    res.render('items/edit', {
      title: `Edit ${item.name} — StockPilot`,
      item
    });
  } catch (err) {
    console.error('Error loading item for edit:', err);
    res.status(500).render('errors/500', { title: 'Server Error — StockPilot' });
  }
};

// POST /items/:id/update — Update an existing item
const update = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).render('errors/404', { title: 'Item Not Found — StockPilot' });
  }

  const { name, sku, category, unitPrice, quantity, reorderLevel, description } = req.body;

  try {
    const updatedItem = await Item.findByIdAndUpdate(
      id,
      {
        name,
        sku: sku ? sku.toUpperCase().trim() : '',
        category: category ? category.trim() : 'General',
        unitPrice,
        quantity,
        reorderLevel,
        description
      },
      {
        runValidators: true,
        new: true
      }
    );

    if (!updatedItem) {
      return res.status(404).render('errors/404', { title: 'Item Not Found — StockPilot' });
    }

    req.session.success = 'Item updated';
    return req.session.save(() => res.redirect(`/items/${updatedItem._id}`));
  } catch (error) {
    req.session.errors = extractErrors(error);
    req.session.formData = req.body;
    return req.session.save(() => res.redirect(`/items/${id}/edit`));
  }
};

// POST /items/:id/delete — Delete an item
const destroy = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).render('errors/404', { title: 'Item Not Found — StockPilot' });
  }

  try {
    const deletedItem = await Item.findByIdAndDelete(id);

    if (!deletedItem) {
      return res.status(404).render('errors/404', { title: 'Item Not Found — StockPilot' });
    }

    req.session.success = 'Item deleted';
    return req.session.save(() => res.redirect('/items'));
  } catch (err) {
    console.error('Error deleting item:', err);
    res.status(500).render('errors/500', { title: 'Server Error — StockPilot' });
  }
};

module.exports = {
  index,
  showCreate,
  store,
  show,
  edit,
  update,
  destroy
};
