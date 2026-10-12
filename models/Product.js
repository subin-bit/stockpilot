// models/Product.js — Product model
// Represents an inventory product with SKU, pricing, stock levels, and category reference.

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  quantity: {
    type: Number,
    default: 0,
    min: [0, 'Quantity cannot be negative']
  },
  minStock: {
    type: Number,
    default: 5,
    min: [0, 'Minimum stock cannot be negative']
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

// Virtual: stockStatus — returns 'in-stock', 'low-stock', or 'out-of-stock'
productSchema.virtual('stockStatus').get(function () {
  if (this.quantity === 0) return 'out-of-stock';
  if (this.quantity <= this.minStock) return 'low-stock';
  return 'in-stock';
});

module.exports = mongoose.model('Product', productSchema);
