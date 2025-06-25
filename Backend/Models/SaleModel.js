const mongoose = require('mongoose');

const SaleItemSchema = new mongoose.Schema({
  saleType: {
    type: String,
    required: true,
    enum: ['stock', 'rawMaterial']
  },
  salematerialId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'items.saleType' // Dynamic reference
  },
  quantity: {
    type: Number,
    required: true
  },
  amount: {
    type: Number,
    required: true
  }
}, { _id: false }); // Disable _id for subdocs if not needed

const SaleSchema = new mongoose.Schema({
  items: {
    type: [SaleItemSchema],
    required: true,
    validate: v => Array.isArray(v) && v.length > 0
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  firm: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Firm',
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  saleDate: {
    type: Date,
    default: Date.now
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['cash', 'credit', 'online', 'bankTransfer', 'Upi']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  removeAt: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model('Sale', SaleSchema);
