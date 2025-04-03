const Joi = require('joi');
const schema = Joi.object({
  client: Joi.alternatives().try(Joi.string(), Joi.object()).required(),
  number: Joi.number().required(),
  year: Joi.number().required(),
  status: Joi.string().required(),
  notes: Joi.string().allow(''),
  expiredDate: Joi.date().required(),
  date: Joi.date().required(),
  // array cannot be empty
  items: Joi.array()
    .items(
      Joi.object({
        _id: Joi.string().allow('').optional(),
        item: Joi.alternatives().try(Joi.string(), Joi.object()).optional(), // Add item field
        itemName: Joi.string().allow('').optional(), // Make itemName optional
        description: Joi.string().allow(''),
        quantity: Joi.number().required(),
        price: Joi.number().required(),
        total: Joi.number().required(),
      })
    )
    .required(),
  taxRate: Joi.alternatives().try(Joi.number(), Joi.string()).required(),
});

module.exports = schema;
