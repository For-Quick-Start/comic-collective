const mongoose = require('mongoose');

const pullItemSchema = mongoose.Schema({
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Book', // This creates a reference to the 'Book' model
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
