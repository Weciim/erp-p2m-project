const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  removed: {
    type: Boolean,
    default: false,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  parentCategory: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
  },
  color: {
    type: String,
    default: '#666',
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'Admin',
  },
  updated: {
    type: Date,
    default: Date.now,
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

categorySchema.plugin(require('mongoose-autopopulate'));

module.exports = mongoose.model('Category', categorySchema);
