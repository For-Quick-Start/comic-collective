const mongoose = require('mongoose');

const pullItemSchema = mongoose.Schema({
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Book',
  },
  purchased: {
    type: Boolean,
    default: false,
  },
  pulled: {
    type: Boolean,
    default: false,
  },
  requested: {
    type: Boolean,
    default: false,
  },
});

module.exports = pullItemSchema;
