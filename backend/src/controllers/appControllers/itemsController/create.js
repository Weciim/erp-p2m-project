const mongoose = require('mongoose');
const Model = mongoose.model('Items');
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

  // Set createdBy to current admin
  value.createdBy = req.admin._id;

  // Generate code if not provided
  if (!value.code) {
    const { last_item_number } = await increaseBySettingKey({
      settingKey: 'last_item_number',
    });
    value.code = `ITM-${(last_item_number + 1).toString().padStart(4, '0')}`;
  }

  // Create new item
  const result = await new Model(value).save();

  return res.status(200).json({
    success: true,
    result,
    message: 'Item created successfully',
  });
};

module.exports = create;