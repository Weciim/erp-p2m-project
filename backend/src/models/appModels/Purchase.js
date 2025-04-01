const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
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
  },
  year: {
    type: Number,
  },
  date: {
    type: Date,
  },
  expectedDeliveryDate: {
    type: Date,
  },
  supplier: {
    type: mongoose.Schema.ObjectId,
    ref: 'Client',
    autopopulate: true,
  },
  purchaseOrderNumber: {
    type: String,
  },
  items: [
    {
      item: {
        type: mongoose.Schema.ObjectId,
        ref: 'Items',
        required: true,
        autopopulate: {
          select: 'name code barcode description type costPrice salePrice quantity unit',
        },
      },
      quantity: {
        type: Number,
        default: 1,
        required: true,
        min: [1, 'Quantity must be at least 1'],
      },
      costPrice: {
        type: Number,
        min: [0, 'Price cannot be negative'],
      },
      purchaseTaxRate: {
        type: mongoose.Schema.ObjectId,
        ref: 'Taxes',
        autopopulate: true,
      },
      discount: {
        type: Number,
        default: 0,
        min: [0, 'Discount cannot be negative'],
      },
      total: {
        type: Number,
        required: true,
      },
      notes: {
        type: String,
      },
      receivedQuantity: {
        type: Number,
        default: 0,
        min: [0, 'Received quantity cannot be negative'],
      },
      expectedDelivery: {
        type: Date,
      },
      status: {
        type: String,
        enum: ['ordered', 'partially_received', 'fully_received', 'cancelled'],
        default: 'ordered',
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
    enum: ['draft', 'pending', 'approved', 'received', 'cancelled', 'on hold'],
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

// Auto-populate item references with specific fields
purchaseSchema.plugin(require('mongoose-autopopulate'));

// Pre-save hook to calculate item totals and update item quantities
purchaseSchema.pre('save', async function (next) {
  if (this.isModified('items')) {
    this.items.forEach((item) => {
      item.total = item.purchasePrice * item.quantity - (item.discount || 0);
    });

    this.subTotal = this.items.reduce((sum, item) => sum + item.purchasePrice * item.quantity, 0);
    this.total = this.subTotal - this.discount + this.taxTotal;

    if (this.isModified('status') && this.status === 'received') {
      for (const purchaseItem of this.items) {
        await mongoose.model('Items').findByIdAndUpdate(purchaseItem.item, {
          $inc: { quantity: purchaseItem.quantity },
          $set: {
            costPrice: purchaseItem.purchasePrice, // Update cost price
            supplier: this.supplier, // Update supplier reference
          },
        });
      }
    }
  }
  next();
});

// Indexes for better performance
purchaseSchema.index({ supplier: 1 });
purchaseSchema.index({ status: 1 });
purchaseSchema.index({ date: 1 });
purchaseSchema.index({ paymentStatus: 1 });
purchaseSchema.index({ 'items.item': 1 });

module.exports = mongoose.model('Purchase', purchaseSchema);
