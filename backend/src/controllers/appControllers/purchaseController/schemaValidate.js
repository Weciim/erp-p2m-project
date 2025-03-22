const Joi = require('joi');

const schema = Joi.object({
  supplier: Joi.alternatives().try(Joi.string(), Joi.object()).required(), // Supplier can be a string (ID) or an object
  number: Joi.number().required(), // Purchase number (required)
  year: Joi.number().required(), // Year (required)
  status: Joi.string()
    .valid('draft', 'pending', 'sent', 'refunded', 'cancelled', 'on hold')
    .required(), // Status (required)
  notes: Joi.string().allow(''), // Notes (optional)
  date: Joi.date().required(), // Purchase date (required)
  expectedDeliveryDate: Joi.date(), // Expected delivery date (required)
  purchaseOrderNumber: Joi.string().allow(''), // Purchase order number (optional)
  items: Joi.array() // Items array (required)
    .items(
      Joi.object({
        _id: Joi.string().allow('').optional(), // Item ID (optional)
        itemName: Joi.string().required(), // Item name (required)
        description: Joi.string().allow(''), // Item description (optional)
        quantity: Joi.number().required(), // Item quantity (required)
        price: Joi.number().required(), // Item price (required)
        total: Joi.number().required(), // Item total (required)
        taxRate: Joi.alternatives().try(Joi.string(), Joi.object()).optional(), // Tax rate (optional)
      }).required()
    )
    .required(),
  taxRate: Joi.alternatives().try(Joi.number(), Joi.string()).required(), // Tax rate (required)
  subTotal: Joi.number(), // Subtotal (required)
  taxTotal: Joi.number(), // Tax total (required)
  discount: Joi.number().default(0), // Discount (optional, default 0)
  total: Joi.number(), // Total (required)
  currency: Joi.string().uppercase(), // Currency (required)
  paymentTerms: Joi.string().valid('Net 30', 'Net 60', 'Due on Receipt', 'Custom'), // Payment terms (required)
  paymentStatus: Joi.string().valid('unpaid', 'paid', 'partially').default('unpaid'), // Payment status (optional, default 'unpaid')
  shippingAddress: Joi.string().allow(''), // Shipping address (optional)
  billingAddress: Joi.string().allow(''), // Billing address (optional)
  files: Joi.array() // Files array (optional)
    .items(
      Joi.object({
        id: Joi.string().required(), // File ID (required)
        name: Joi.string().required(), // File name (required)
        path: Joi.string().required(), // File path (required)
        description: Joi.string().allow(''), // File description (optional)
        isPublic: Joi.boolean().default(true), // File visibility (optional, default true)
      })
    )
    .optional(),
  createdBy: Joi.alternatives().try(Joi.string(), Joi.object()), // Created by (required)
});

module.exports = schema;
