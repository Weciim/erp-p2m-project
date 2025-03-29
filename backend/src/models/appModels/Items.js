const mongoose = require('mongoose');
const { calculate } = require('@/helpers');

const itemSchema = new mongoose.Schema({
  removed: {
    type: Boolean,
    default: false,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  code: {
    type: String,
    trim: true,
    unique: true,
  },
  barcode: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  category: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
    autopopulate: true,
  },
  type: {
    type: String,
    enum: ['product', 'service', 'digital', 'bundle'],
    default: 'product',
  },
  costPrice: {
    type: Number,
    default: 0,
  },
  salePrice: {
    type: Number,
    required: true,
  },
  taxRate: {
    type: mongoose.Schema.ObjectId,
    ref: 'Taxes',
    autopopulate: true,
  },
  quantity: {
    type: Number,
    default: 0,
  },
  inventoryEnabled: {
    type: Boolean,
    default: false,
  },
  lowStockThreshold: {
    type: Number,
    default: 5,
  },
  unit: {
    type: String,
    enum: ['piece', 'kg', 'liter', 'meter', 'box', 'pack'],
    default: 'piece',
  },
  supplier: {
    type: mongoose.Schema.ObjectId,
    ref: 'Client',
    autopopulate: true,
  },
  // Digital/downloadable items
  isDigital: Boolean,
  downloadUrl: String,
  // Images and files
  
  // Custom fields
  customFields: [
    {
      fieldName: String,
      fieldValue: mongoose.Schema.Types.Mixed,
      fieldType: {
        type: String,
        enum: ['string', 'number', 'boolean', 'date'],
      },
    },
  ],
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'Admin',
    required: true,
  },
  updated: {
    type: Date,
    default: Date.now,
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

// Auto-populate taxRate and category
itemSchema.plugin(require('mongoose-autopopulate'));

// Pre-save hook to generate code if not provided
itemSchema.pre('save', function (next) {
  if (!this.code) {
    this.code = `ITM-${Date.now().toString(36).toUpperCase()}`;
  }
  next();
});

itemSchema.virtual('formattedPrice').get(function () {
  return calculate.formatCurrency(this.salePrice);
});

// Indexes for better performance
itemSchema.index({ name: 'text', code: 'text', barcode: 'text' });
itemSchema.index({ category: 1 });
itemSchema.index({ type: 1 });
itemSchema.index({ quantity: 1 });

module.exports = mongoose.model('Items', itemSchema);