// models/Item.js — Inventory Item model
// Represents a product/stock item with SKU, pricing, stock levels, and virtual low-stock calculation.

const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  category: {
    type: String,
    trim: true,
    default: 'General'
  },
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: [0, 'Unit price cannot be negative']
  },
  quantity: {
    type: Number,
    default: 0,
    min: [0, 'Quantity cannot be negative']
  },
  reorderLevel: {
    type: Number,
    default: 5,
    min: [0, 'Reorder level cannot be negative']
  },
  description: {
    type: String,
    default: '' // In Phase 3, this will store rich text HTML from Quill
  },
  image: {
    type: String,
    default: '' // In Phase 3, this will store uploaded file path
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    default: null // In Phase 4, links to Supplier model
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual property: isLowStock is true when quantity is at or below the reorder level
itemSchema.virtual('isLowStock').get(function () {
  return this.quantity <= this.reorderLevel;
});

module.exports = mongoose.model('Item', itemSchema);
