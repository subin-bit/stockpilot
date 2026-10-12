// controllers/productController.js — Product CRUD controller
// Handles listing, searching, filtering, creating, viewing, updating, and deleting products.

const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const StockTransaction = require('../models/StockTransaction');

// Helper to extract clean error messages
const extractErrors = (error) => {
  const errors = [];
  if (error.code === 11000) {
    errors.push('A product with this SKU already exists');
  } else if (error.errors) {
    Object.keys(error.errors).forEach((key) => {
      errors.push(error.errors[key].message);
    });
  } else {
    errors.push(error.message || 'Operation failed');
  }
  return errors;
};

// GET /products — List all products (with optional ?category= and ?search= filters)
const index = async (req, res) => {
  try {
    const filter = {};
    const selectedCategory = req.query.category || '';
    const searchQuery = req.query.search || '';

    if (selectedCategory && mongoose.Types.ObjectId.isValid(selectedCategory)) {
      filter.category = selectedCategory;
    }

    if (searchQuery) {
      filter.$or = [
        { name: { $regex: searchQuery, $options: 'i' } },
        { sku: { $regex: searchQuery, $options: 'i' } }
      ];
    }

    const products = await Product.find(filter)
      .populate('category', 'name')
      .sort({ createdAt: -1 });

    const categories = await Category.find().sort({ name: 1 });

    res.render('products/index', {
      title: 'Products — StockPilot',
      products,
      categories,
      selectedCategory,
      searchQuery
    });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).render('errors/500', { title: 'Server Error — StockPilot' });
  }
};

// GET /products/new — Show form to create a new product
const showCreate = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.render('products/new', {
      title: 'Add Product — StockPilot',
      product: null,
      categories
    });
  } catch (err) {
    console.error('Error loading new product form:', err);
    res.status(500).render('errors/500', { title: 'Server Error — StockPilot' });
  }
};

// POST /products — Store a new product
const store = async (req, res) => {
  const { name, sku, category, price, quantity, minStock } = req.body;

  try {
    const product = new Product({
      name,
      sku,
      category,
      price,
      quantity: quantity || 0,
      minStock: minStock || 5,
      createdBy: req.session.userId
    });

    await product.save();

    req.session.success = 'Product added successfully';
    return req.session.save(() => res.redirect('/products'));
  } catch (error) {
    req.session.errors = extractErrors(error);
    req.session.formData = req.body;
    return req.session.save(() => res.redirect('/products/new'));
  }
};

// GET /products/:id — Show a single product's details
const show = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).render('errors/404', { title: 'Product Not Found — StockPilot' });
  }

  try {
    const product = await Product.findById(id).populate('category');

    if (!product) {
      return res.status(404).render('errors/404', { title: 'Product Not Found — StockPilot' });
    }

    // Last 10 stock transactions for this product
    const transactions = await StockTransaction.find({ product: id })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    res.render('products/show', {
      title: `${product.name} — StockPilot`,
      product,
      transactions
    });
  } catch (err) {
    console.error('Error loading product:', err);
    res.status(500).render('errors/500', { title: 'Server Error — StockPilot' });
  }
};

// GET /products/:id/edit — Show form to edit an existing product
const edit = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).render('errors/404', { title: 'Product Not Found — StockPilot' });
  }

  try {
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).render('errors/404', { title: 'Product Not Found — StockPilot' });
    }

    const categories = await Category.find().sort({ name: 1 });

    res.render('products/edit', {
      title: `Edit ${product.name} — StockPilot`,
      product,
      categories
    });
  } catch (err) {
    console.error('Error loading product for edit:', err);
    res.status(500).render('errors/500', { title: 'Server Error — StockPilot' });
  }
};

// POST /products/:id/update — Update an existing product
const update = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).render('errors/404', { title: 'Product Not Found — StockPilot' });
  }

  const { name, sku, category, price, quantity, minStock } = req.body;

  try {
    await Product.findByIdAndUpdate(
      id,
      {
        name,
        sku: sku ? sku.toUpperCase().trim() : '',
        category,
        price,
        quantity,
        minStock
      },
      { runValidators: true, new: true }
    );

    req.session.success = 'Product updated successfully';
    return req.session.save(() => res.redirect(`/products/${id}`));
  } catch (error) {
    req.session.errors = extractErrors(error);
    req.session.formData = req.body;
    return req.session.save(() => res.redirect(`/products/${id}/edit`));
  }
};

// POST /products/:id/delete — Delete a product
const destroy = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).render('errors/404', { title: 'Product Not Found — StockPilot' });
  }

  try {
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).render('errors/404', { title: 'Product Not Found — StockPilot' });
    }

    // Also delete associated transactions
    await StockTransaction.deleteMany({ product: id });
    await Product.findByIdAndDelete(id);

    req.session.success = 'Product deleted successfully';
    return req.session.save(() => res.redirect('/products'));
  } catch (err) {
    console.error('Error deleting product:', err);
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
