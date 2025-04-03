const Joi = require('joi');

const schema = Joi.object({
  supplier: Joi.alternatives().try(Joi.string(), Joi.object()).required(),
  number: Joi.number(),
  year: Joi.number(),
  status: Joi.string()
    .valid('draft', 'pending', 'approved', 'received', 'cancelled', 'on hold')
    .default('draft'),
  notes: Joi.string().allow(''),
  date: Joi.date().default(() => new Date()),
  expectedDeliveryDate: Joi.date(),
  purchaseOrderNumber: Joi.string().allow(''),
  items: Joi.array()
    .items(
      Joi.object({
        itemName: Joi.string().allow(''),  
        description: Joi.string().allow(''),
        quantity: Joi.number().min(1).required(),
        price: Joi.number().min(0).required(),
        total: Joi.number().min(0),
        taxRate: Joi.alternatives().try(Joi.string(), Joi.object()),
        discount: Joi.number().min(0).default(0),
      })
    )
    .min(1)
    .required(),
  taxRate: Joi.alternatives().try(Joi.number(), Joi.string(), Joi.object()),
  subTotal: Joi.number().min(0),
  taxTotal: Joi.number().min(0).default(0),
  discount: Joi.number().min(0).default(0),
  total: Joi.number().min(0),
  currency: Joi.string().uppercase().default('USD'),
  paymentTerms: Joi.string()
    .valid('Net 30', 'Net 60', 'Due on Receipt', 'Custom')
    .default('Net 30'),
  paymentStatus: Joi.string()
    .valid('unpaid', 'paid', 'partially')
    .default('unpaid'),
  shippingAddress: Joi.string().allow(''),
  billingAddress: Joi.string().allow(''),
  files: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().required(),
        name: Joi.string().required(),
        path: Joi.string().required(),
        description: Joi.string().allow(''),
        isPublic: Joi.boolean().default(true)
      })
    ),
  createdBy: Joi.alternatives().try(Joi.string(), Joi.object())
}).options({ stripUnknown: true });

module.exports = schema;