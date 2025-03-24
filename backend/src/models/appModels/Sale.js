const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  removed: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'Admin',
    required: true,
  },
  number: {
    type: Number,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  expectedDeliveryDate: {
    type: Date,
  },
  client: {
    type: mongoose.Schema.ObjectId,
    ref: 'Client',
    required: true,
    autopopulate: true,
  },
  salesOrderNumber: {
    type: String,
  },
  items: [
    {
      itemName: {
        type: String,
        required: true,
      },
      description: {
        type: String,
      },
      quantity: {
        type: Number,
        default: 1,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      total: {
        type: Number,
        required: true,
      },
      taxRate: {
        type: mongoose.Schema.ObjectId,
        ref: 'Taxes',
        autopopulate: true,
      },
    },
  ],
  subTotal: {
    type: Number,
    default: 0,
  },
  taxTotal: {
    type: Number,
    default: 0,
  },
  discount: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    default: 0,
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true,
    required: true,
  },
  paymentTerms: {
    type: String,
    enum: ['Net 30', 'Net 60', 'Due on Receipt', 'Custom'],
    default: 'Net 30',
  },
  paymentStatus: {
    type: String,
    default: 'unpaid',
    enum: ['unpaid', 'paid', 'partially'],
  },
  shippingAddress: {
    type: String,
  },
  billingAddress: {
    type: String,
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'delivered', 'cancelled', 'on hold'],
    default: 'draft',
  },
  notes: {
    type: String,
  },
  files: [
    {
      id: String,
      name: String,
      path: String,
      description: String,
      isPublic: {
        type: Boolean,
        default: true,
      },
    },
  ],
  updated: {
    type: Date,
    default: Date.now,
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

saleSchema.plugin(require('mongoose-autopopulate'));
module.exports = mongoose.model('Sale', saleSchema);
