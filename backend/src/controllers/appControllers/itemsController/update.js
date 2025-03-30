const mongoose = require('mongoose');
const Model = mongoose.model('Items');
const schema = require('./schemaValidate');

const update = async (req, res) => {
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

  // Find and update the document
  const result = await Model.findOneAndUpdate(
    { _id: req.params.id, removed: false },
    value,
    { new: true } // Return the updated document
  ).exec();

  if (!result) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'Item not found',
    });
  }

  return res.status(200).json({
    success: true,
    result,
    message: 'Item updated successfully',
  });
};

module.exports = update;