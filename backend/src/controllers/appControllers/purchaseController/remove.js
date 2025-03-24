const mongoose = require('mongoose');

const Model = mongoose.model('Purchase');

const remove = async (req, res) => {
  const deletedPurchase = await Model.findOneAndUpdate(
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

  if (!deletedPurchase) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'Purchase not found',
    });
  }

  return res.status(200).json({
    success: true,
    result: deletedPurchase,
    message: 'Purchase deleted successfully',
  });
};

module.exports = remove;
