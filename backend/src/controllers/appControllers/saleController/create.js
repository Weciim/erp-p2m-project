const mongoose = require('mongoose');
const Model = mongoose.model('Sale');
const { calculate } = require('@/helpers');
const { increaseBySettingKey } = require('@/middlewares/settings');
const schema = require('./schemaValidate');

const create = async (req, res) => {
  let body = req.body;

  const { error, value } = schema.validate(body);
  if (error) {
    const { details } = error;
    return res.status(400).json({
      success: false,
      result: null,
      message: details[0]?.message,
    });
  }

  const { items = [], taxRate = 0, discount = 0 } = value;
  let subTotal = 0;
  let taxTotal = 0;
  let total = 0;

  const updatedItems = items.map((item) => {
    const itemTotal = calculate.multiply(item.quantity, item.price);
    subTotal = calculate.add(subTotal, itemTotal);
    return {
      ...item,
      total: itemTotal,
    };
  });

  taxTotal = calculate.multiply(subTotal, taxRate / 100);
  total = calculate.add(subTotal, taxTotal);

  let paymentStatus = calculate.sub(total, discount) === 0 ? 'paid' : 'unpaid';

  body = {
    ...value,
    items: updatedItems,
    paymentStatus,
    createdBy: req.admin._id,
    subTotal,
    taxTotal,
    total,
  };

  const result = await new Model(body).save();

  const updateResult = await Model.findOneAndUpdate({ _id: result._id }, { new: true }).exec();

  increaseBySettingKey({
    settingKey: 'last_sale_number',
  });

  return res.status(200).json({
    success: true,
    result: updateResult,
    message: 'Sale created successfully',
  });
};

module.exports = create;
