// controllers/supplierController.js — Controller for Supplier CRUD operations
// Handles supplier directory, item linkages, and deletion constraints.

const mongoose = require('mongoose');
const Supplier = require('../models/Supplier');
const Item = require('../models/Item');

// Helper to extract clean error messages from Mongoose
const extractErrors = (error) => {
  const errors = [];
  if (error.errors) {
    Object.keys(error.errors).forEach((key) => {
      errors.push(error.errors[key].message);
    });
  } else {
    errors.push(error.message || 'Operation failed');
  }
  return errors;
};

// GET /suppliers — List all suppliers
const index = async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });

    // Optional: get count of items per supplier
    const suppliersWithCount = await Promise.all(
      suppliers.map(async (sup) => {
        const itemCount = await Item.countDocuments({ supplier: sup._id });
        const supObj = sup.toObject();
        supObj.itemCount = itemCount;
        return supObj;
      })
    );

    res.render('suppliers/index', {
      title: 'Suppliers — StockPilot',
      suppliers: suppliersWithCount
    });
  } catch (err) {
    console.error('Error loading suppliers:', err);
    res.status(500).render('errors/500', { title: 'Server Error — StockPilot' });
  }
};

// GET /suppliers/new — Show form to add supplier
const showCreate = (req, res) => {
  res.render('suppliers/new', {
    title: 'Add New Supplier — StockPilot',
    supplier: null
  });
};

// POST /suppliers — Save new supplier
const store = async (req, res) => {
  const { name, email, phone, address } = req.body;

  try {
    const supplier = new Supplier({
      name,
      email,
      phone,
      address
    });

    await supplier.save();

    req.session.success = 'Supplier added';
    return req.session.save(() => res.redirect('/suppliers'));
  } catch (error) {
    req.session.errors = extractErrors(error);
    req.session.formData = req.body;
    return req.session.save(() => res.redirect('/suppliers/new'));
  }
};

// GET /suppliers/:id — View supplier details and linked items
const show = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).render('errors/404', { title: 'Supplier Not Found — StockPilot' });
  }

  try {
    const supplier = await Supplier.findById(id);

    if (!supplier) {
      return res.status(404).render('errors/404', { title: 'Supplier Not Found — StockPilot' });
    }

    // List items supplied by this supplier
    const items = await Item.find({ supplier: supplier._id }).sort({ name: 1 });

    res.render('suppliers/show', {
      title: `${supplier.name} — StockPilot`,
      supplier,
      items
    });
  } catch (err) {
    console.error('Error loading supplier:', err);
    res.status(500).render('errors/500', { title: 'Server Error — StockPilot' });
  }
};

// GET /suppliers/:id/edit — Show form to edit supplier
const edit = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).render('errors/404', { title: 'Supplier Not Found — StockPilot' });
  }

  try {
    const supplier = await Supplier.findById(id);

    if (!supplier) {
      return res.status(404).render('errors/404', { title: 'Supplier Not Found — StockPilot' });
    }

    res.render('suppliers/edit', {
      title: `Edit ${supplier.name} — StockPilot`,
      supplier
    });
  } catch (err) {
    console.error('Error loading supplier for edit:', err);
    res.status(500).render('errors/500', { title: 'Server Error — StockPilot' });
  }
};

// POST /suppliers/:id/update — Update supplier record
const update = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).render('errors/404', { title: 'Supplier Not Found — StockPilot' });
  }

  const { name, email, phone, address } = req.body;

  try {
    const updatedSupplier = await Supplier.findByIdAndUpdate(
      id,
      { name, email, phone, address },
      { runValidators: true, new: true }
    );

    if (!updatedSupplier) {
      return res.status(404).render('errors/404', { title: 'Supplier Not Found — StockPilot' });
    }

    req.session.success = 'Supplier updated';
    return req.session.save(() => res.redirect(`/suppliers/${updatedSupplier._id}`));
  } catch (error) {
    req.session.errors = extractErrors(error);
    req.session.formData = req.body;
    return req.session.save(() => res.redirect(`/suppliers/${id}/edit`));
  }
};

// POST /suppliers/:id/delete — Delete supplier with constraint check
const destroy = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).render('errors/404', { title: 'Supplier Not Found — StockPilot' });
  }

  try {
    // Prevent deleting a supplier that has items
    const itemCount = await Item.countDocuments({ supplier: id });
    if (itemCount > 0) {
      req.session.errors = ['Supplier has items and cannot be deleted'];
      return req.session.save(() => res.redirect('/suppliers'));
    }

    const deletedSupplier = await Supplier.findByIdAndDelete(id);

    if (!deletedSupplier) {
      return res.status(404).render('errors/404', { title: 'Supplier Not Found — StockPilot' });
    }

    req.session.success = 'Supplier deleted';
    return req.session.save(() => res.redirect('/suppliers'));
  } catch (err) {
    console.error('Error deleting supplier:', err);
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
