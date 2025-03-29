const Joi = require('joi');

const schema = Joi.object({
  name: Joi.string().required(), // Item name (required)
  code: Joi.string().allow(''), // Item code (optional)
  barcode: Joi.string().allow(''), // Barcode (optional)
  description: Joi.string().allow(''), // Description (optional)
  category: Joi.alternatives().try(Joi.string(), Joi.object()), // Category ID or object (optional)
  type: Joi.string()
    .valid('product', 'service', 'digital', 'bundle')
    .default('product'), // Item type (optional, default 'product')
  costPrice: Joi.number().default(0), // Cost price (optional, default 0)
  salePrice: Joi.number().required(), // Sale price (required)
  taxRate: Joi.alternatives().try(Joi.string(), Joi.object(), Joi.number()), // Tax rate (optional)
  // Inventory fields
  quantity: Joi.number().default(0), // Quantity (optional, default 0)
  inventoryEnabled: Joi.boolean().default(false), // Inventory tracking (optional, default false)
  lowStockThreshold: Joi.number().default(5), // Low stock threshold (optional, default 5)
  // Unit of measurement
  unit: Joi.string()
    .valid('piece', 'kg', 'liter', 'meter', 'box', 'pack')
    .default('piece'), // Unit (optional, default 'piece')
  // Supplier information
  supplier: Joi.alternatives().try(Joi.string(), Joi.object()), // Supplier ID or object (optional)
  // Digital product fields
  isDigital: Joi.boolean().default(false), // Is digital (optional, default false)
  downloadUrl: Joi.string().allow(''), // Download URL (optional)
  // Images
  images: Joi.array() // Images array (optional)
    .items(
      Joi.object({
        id: Joi.string().required(), // Image ID (required)
        name: Joi.string().required(), // Image name (required)
        path: Joi.string().required(), // Image path (required)
        description: Joi.string().allow(''), // Description (optional)
        isPublic: Joi.boolean().default(true), // Visibility (optional, default true)
      })
    )
    .optional(),
  // Custom fields
  customFields: Joi.array() // Custom fields (optional)
    .items(
      Joi.object({
        fieldName: Joi.string().required(), // Field name (required)
        fieldValue: Joi.any(), // Field value (any type)
        fieldType: Joi.string()
          .valid('string', 'number', 'boolean', 'date')
          .default('string'), // Field type (optional, default 'string')
      })
    )
    .optional(),
  // Metadata
  removed: Joi.boolean().default(false), // Soft delete flag (optional, default false)
  enabled: Joi.boolean().default(true), // Enabled flag (optional, default true)
  createdBy: Joi.alternatives().try(Joi.string(), Joi.object()), // Creator ID or object (optional)
  updated: Joi.date(), // Last updated timestamp (optional)
  created: Joi.date(), // Creation timestamp (optional)
}).options({ stripUnknown: true }); // Non-strict mode to allow additional fields

module.exports = schema;