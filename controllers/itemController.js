// controllers/itemController.js — Controller for Item CRUD operations
// Handles listing, filtering, creating, viewing, updating, and deleting inventory items
// with image upload handling and sanitized rich-text description support.

const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const Item = require('../models/Item');

// Directory for uploaded item images
const UPLOADS_DIR = path.join(__dirname, '..', 'public', 'uploads');

// Ensure public/uploads directory exists on startup
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Strip <script> tags from rich-text HTML on the server to prevent basic XSS attacks
const sanitizeDescription = (html) => {
  if (!html) return '';
  // Note: Outputting raw HTML carries XSS risks; this regex strips executable <script> tags for project demo purposes
  return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};

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
  let imagePath = '';

  // Process optional image upload
  if (req.files && req.files.image) {
    const imageFile = req.files.image;

    // Validate mimetype
    if (!imageFile.mimetype.startsWith('image/')) {
      req.session.errors = ['Only image files (JPEG, PNG, GIF, WebP) are allowed.'];
      req.session.formData = req.body;
      return req.session.save(() => res.redirect('/items/new'));
    }

    // Validate size (max 2 MB)
    if (imageFile.size > 2 * 1024 * 1024) {
      req.session.errors = ['Image file size must be under 2 MB.'];
      req.session.formData = req.body;
      return req.session.save(() => res.redirect('/items/new'));
    }

    // Build unique filename: Date.now() + '-' + original name with spaces replaced
    const filename = `${Date.now()}-${imageFile.name.replace(/\s+/g, '_')}`;
    const destination = path.join(UPLOADS_DIR, filename);

    try {
      await imageFile.mv(destination);
      imagePath = `/uploads/${filename}`;
    } catch (uploadErr) {
      console.error('File upload error:', uploadErr);
      req.session.errors = ['Failed to upload image. Please try again.'];
      req.session.formData = req.body;
      return req.session.save(() => res.redirect('/items/new'));
    }
  }

  try {
    const item = new Item({
      name,
      sku,
      category: category ? category.trim() : 'General',
      unitPrice,
      quantity,
      reorderLevel,
      description: sanitizeDescription(description),
      image: imagePath,
      createdBy: req.session.userId
    });

    await item.save();

    req.session.success = 'Item added';
    return req.session.save(() => res.redirect('/items'));
  } catch (error) {
    // If a file was saved but DB save failed, clean up the orphaned file
    if (imagePath) {
      const savedFilePath = path.join(__dirname, '..', 'public', imagePath);
      fs.unlink(savedFilePath, () => {});
    }

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
    const existingItem = await Item.findById(id);
    if (!existingItem) {
      return res.status(404).render('errors/404', { title: 'Item Not Found — StockPilot' });
    }

    let imagePath = existingItem.image; // default: keep existing image

    // Process new image upload if provided
    if (req.files && req.files.image) {
      const imageFile = req.files.image;

      // Validate mimetype
      if (!imageFile.mimetype.startsWith('image/')) {
        req.session.errors = ['Only image files (JPEG, PNG, GIF, WebP) are allowed.'];
        req.session.formData = req.body;
        return req.session.save(() => res.redirect(`/items/${id}/edit`));
      }

      // Validate size (max 2 MB)
      if (imageFile.size > 2 * 1024 * 1024) {
        req.session.errors = ['Image file size must be under 2 MB.'];
        req.session.formData = req.body;
        return req.session.save(() => res.redirect(`/items/${id}/edit`));
      }

      const filename = `${Date.now()}-${imageFile.name.replace(/\s+/g, '_')}`;
      const destination = path.join(UPLOADS_DIR, filename);

      await imageFile.mv(destination);

      // If item already had an image, remove old image file
      if (existingItem.image) {
        const oldFilePath = path.join(__dirname, '..', 'public', existingItem.image);
        fs.unlink(oldFilePath, () => {});
      }

      imagePath = `/uploads/${filename}`;
    }

    const updatedItem = await Item.findByIdAndUpdate(
      id,
      {
        name,
        sku: sku ? sku.toUpperCase().trim() : '',
        category: category ? category.trim() : 'General',
        unitPrice,
        quantity,
        reorderLevel,
        description: sanitizeDescription(description),
        image: imagePath
      },
      {
        runValidators: true,
        new: true
      }
    );

    req.session.success = 'Item updated';
    return req.session.save(() => res.redirect(`/items/${updatedItem._id}`));
  } catch (error) {
    req.session.errors = extractErrors(error);
    req.session.formData = req.body;
    return req.session.save(() => res.redirect(`/items/${id}/edit`));
  }
};

// POST /items/:id/delete — Delete an item and its associated image file
const destroy = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).render('errors/404', { title: 'Item Not Found — StockPilot' });
  }

  try {
    const item = await Item.findById(id);

    if (!item) {
      return res.status(404).render('errors/404', { title: 'Item Not Found — StockPilot' });
    }

    // Delete image file from public/uploads if one exists (ignore error if file is missing)
    if (item.image) {
      const filePath = path.join(__dirname, '..', 'public', item.image);
      fs.unlink(filePath, (err) => {
        if (err && err.code !== 'ENOENT') {
          console.error('Error removing image file:', err);
        }
      });
    }

    await Item.findByIdAndDelete(id);

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
