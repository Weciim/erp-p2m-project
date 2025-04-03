const Joi = require('joi');

const schema = Joi.object({
  client: Joi.alternatives().try(Joi.string(), Joi.object()).required(),
  number: Joi.number().required(),
  year: Joi.number().required(),
  status: Joi.string()
    .valid('draft', 'pending', 'approved', 'delivered', 'cancelled', 'on hold')
    .required(),
  notes: Joi.string().allow(''),
  date: Joi.date().required(),
  expectedDeliveryDate: Joi.date(),
  salesOrderNumber: Joi.string().allow(''),
  items: Joi.array()
    .items(
      Joi.object({
        _id: Joi.string().allow('').optional(),
        item: Joi.alternatives().try(Joi.string(), Joi.object()).optional(), // Add item field as optional
        itemName: Joi.string().allow('').optional(), // Make itemName optional
        description: Joi.string().allow(''),
        quantity: Joi.number().required(),
        price: Joi.number().required(),
        total: Joi.number().required(),
        taxRate: Joi.alternatives().try(Joi.string(), Joi.object()).optional(),
      }).required()
    )
    .required(),
  taxRate: Joi.alternatives().try(Joi.number(), Joi.string()),
  subTotal: Joi.number(),
  taxTotal: Joi.number(),
  discount: Joi.number().default(0),
  total: Joi.number(),
  currency: Joi.string().uppercase(),
  paymentTerms: Joi.string().valid('Net 30', 'Net 60', 'Due on Receipt', 'Custom'),
  paymentStatus: Joi.string().valid('unpaid', 'paid', 'partially').default('unpaid'),
  shippingAddress: Joi.string().allow(''),
  billingAddress: Joi.string().allow(''),
  files: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().required(),
        name: Joi.string().required(),
        path: Joi.string().required(),
        description: Joi.string().allow(''),
        isPublic: Joi.boolean().default(true),
      })
    )
    .optional(),
  createdBy: Joi.alternatives().try(Joi.string(), Joi.object()),
});

module.exports = schema;