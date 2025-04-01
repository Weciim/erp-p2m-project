const Joi = require('joi');

const schema = Joi.object({
  name: Joi.string().required(),
  code: Joi.string().required(),
  barcode: Joi.string().allow(''),
  description: Joi.string().allow(''),
  type: Joi.string().valid('product', 'service', 'digital', 'bundle').default('product'),
  category: Joi.alternatives().try(Joi.string(), Joi.object()),
  unit: Joi.string().valid('piece', 'kg', 'liter', 'meter', 'box', 'pack').default('piece'),
  costPrice: Joi.number().default(0),
  salePrice: Joi.number().required(),
  // taxRate: Joi.alternatives().try(Joi.string(), Joi.object(), Joi.number()),
  quantity: Joi.number().default(0),
  inventoryEnabled: Joi.boolean().default(false),
  lowStockThreshold: Joi.number().default(5),
  supplier: Joi.alternatives().try(Joi.string(), Joi.object()),
  isDigital: Joi.boolean().default(false),
  downloadUrl: Joi.string().allow(''),
  images: Joi.array()
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
  removed: Joi.boolean().default(false),
  enabled: Joi.boolean().default(true),
  createdBy: Joi.alternatives().try(Joi.string(), Joi.object()),
}).options({ stripUnknown: true });

module.exports = schema;
