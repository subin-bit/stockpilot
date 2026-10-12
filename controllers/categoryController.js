// controllers/categoryController.js — Category CRUD controller
// Handles listing, creating, editing, and deleting product categories.

const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');

// GET /categories — List all categories with product counts
const index = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });

    // Get product counts per category
    const counts = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    const countMap = {};
    counts.forEach(c => { countMap[c._id.toString()] = c.count; });

    res.render('categories/index', {
      title: 'Categories — StockPilot',
      categories,
      countMap
    });
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).render('errors/500', { title: 'Server Error — StockPilot' });
  }
};

// GET /categories/new — Show form to create a new category
const showCreate = (req, res) => {
  res.render('categories/new', {
    title: 'Add Category — StockPilot',
    category: null
  });
};

// POST /categories — Store a new category
const store = async (req, res) => {
  const { name, description } = req.body;

  try {
    const category = new Category({
      name: name ? name.trim() : '',
      description: description ? description.trim() : ''
    });
    await category.save();

    req.session.success = 'Category created successfully';
    return req.session.save(() => res.redirect('/categories'));
  } catch (error) {
    const errors = [];
    if (error.code === 11000) {
      errors.push('A category with this name already exists');
    } else if (error.errors) {
      Object.keys(error.errors).forEach(key => {
        errors.push(error.errors[key].message);
      });
    } else {
      errors.push(error.message || 'Failed to create category');
    }

    req.session.errors = errors;
    req.session.formData = req.body;
    return req.session.save(() => res.redirect('/categories/new'));
  }
};

// GET /categories/:id/edit — Show form to edit a category
const edit = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).render('errors/404', { title: 'Category Not Found — StockPilot' });
  }

  try {
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).render('errors/404', { title: 'Category Not Found — StockPilot' });
    }

    res.render('categories/edit', {
      title: `Edit ${category.name} — StockPilot`,
      category
    });
  } catch (err) {
    console.error('Error loading category for edit:', err);
    res.status(500).render('errors/500', { title: 'Server Error — StockPilot' });
  }
};

// POST /categories/:id/update — Update a category
const update = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).render('errors/404', { title: 'Category Not Found — StockPilot' });
  }

  const { name, description } = req.body;

  try {
    await Category.findByIdAndUpdate(
      id,
      { name: name ? name.trim() : '', description: description ? description.trim() : '' },
      { runValidators: true, new: true }
    );

    req.session.success = 'Category updated successfully';
    return req.session.save(() => res.redirect('/categories'));
  } catch (error) {
    const errors = [];
    if (error.code === 11000) {
      errors.push('A category with this name already exists');
    } else if (error.errors) {
      Object.keys(error.errors).forEach(key => {
        errors.push(error.errors[key].message);
      });
    } else {
      errors.push(error.message || 'Failed to update category');
    }

    req.session.errors = errors;
    req.session.formData = req.body;
    return req.session.save(() => res.redirect(`/categories/${id}/edit`));
  }
};

// POST /categories/:id/delete — Delete a category (only if no products linked)
const destroy = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).render('errors/404', { title: 'Category Not Found — StockPilot' });
  }

  try {
    // Check if products are linked to this category
    const productCount = await Product.countDocuments({ category: id });
    if (productCount > 0) {
      req.session.errors = [`Cannot delete category: ${productCount} product(s) are still assigned to it. Reassign them first.`];
      return req.session.save(() => res.redirect('/categories'));
    }

    await Category.findByIdAndDelete(id);

    req.session.success = 'Category deleted successfully';
    return req.session.save(() => res.redirect('/categories'));
  } catch (err) {
    console.error('Error deleting category:', err);
    res.status(500).render('errors/500', { title: 'Server Error — StockPilot' });
  }
};

module.exports = {
  index,
  showCreate,
  store,
  edit,
  update,
  destroy
};
