const mongoose = require('mongoose');
const Model = mongoose.model('Items');

const read = async (req, res) => {
  // Find document by id with necessary population
  const result = await Model.findOne({
    _id: req.params.id,
    removed: false,
  })
    .populate('createdBy', 'name')
    .populate('category', 'name')
    .populate('taxRate', 'taxName taxValue')
    .populate('supplier', 'name')
    .exec();

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
    message: 'Item retrieved successfully',
  });
};

module.exports = read;