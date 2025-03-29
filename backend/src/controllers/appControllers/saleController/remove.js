const mongoose = require('mongoose');

const Model = mongoose.model('Sale');

const remove = async (req, res) => {
  const deletedSale = await Model.findOneAndUpdate(
    {
      _id: req.params.id,
      removed: false,
    },
    {
      $set: {
        removed: true,
      },
    }
  ).exec();

  if (!deletedSale) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'Sale not found',
    });
  }

  return res.status(200).json({
    success: true,
    result: deletedSale,
    message: 'Purchase deleted successfully',
  });
};

module.exports = remove;
