// models/StockTransaction.js — Stock movement transaction log
// Tracks inbound (Stock IN) and outbound (Stock OUT) quantity changes.

const mongoose = require('mongoose');

const stockTransactionSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required']
  },
  type: {
    type: String,
    required: [true, 'Transaction type is required'],
    enum: {
      values: ['IN', 'OUT'],
      message: 'Transaction type must be either IN or OUT'
    }
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  note: {
    type: String,
    trim: true,
    default: ''
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('StockTransaction', stockTransactionSchema);
