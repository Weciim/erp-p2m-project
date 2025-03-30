const mongoose = require('mongoose');
const Model = mongoose.model('Items');

const paginatedList = async (req, res) => {
  const page = req.query.page || 1;
  const limit = parseInt(req.query.items) || 10;
  const skip = page * limit - limit;

  const { sortBy = 'created', sortValue = -1, filter, equal } = req.query;
  const searchQuery = req.query.q || '';

  // Build the query
  const query = {
    removed: false,
    ...(filter && equal && { [filter]: equal }),
    $or: [
      { name: { $regex: searchQuery, $options: 'i' } },
      { code: { $regex: searchQuery, $options: 'i' } },
      { barcode: { $regex: searchQuery, $options: 'i' } },
      { description: { $regex: searchQuery, $options: 'i' } },
    ],
  };

  // Query the database
  const resultsPromise = Model.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ [sortBy]: sortValue })
    .populate('category', 'name')
    .populate('taxRate', 'taxName')
    .populate('supplier', 'name')
    .populate('createdBy', 'name')
    .exec();

  // Count documents
  const countPromise = Model.countDocuments(query);

  // Execute both promises
  const [result, count] = await Promise.all([resultsPromise, countPromise]);
  const pages = Math.ceil(count / limit);

  return res.status(200).json({
    success: true,
    result,
    pagination: { page, pages, count },
    message: 'Items retrieved successfully',
  });
};

module.exports = paginatedList;