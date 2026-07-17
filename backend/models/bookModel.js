const mongoose = require('mongoose');

const bookSchema = mongoose.Schema(
  {
    seriesTitle: {
      type: String,
      required: [true, 'Series title is required.'],
    },
    seriesStartDate: {
      type: Date,
      required: [true, 'Series start date is required.'],
    },
    seriesEndDate: {
      type: Date,
    },
    publisher: {
      type: String,
      required: [true, 'Release date is required.'],
    },
    issueNumber: {
      type: Number,
      required: [true, 'Release date is required.'],
    },
    releaseDate: {
      type: Date,
      required: [true, 'Release date is required.'],
    },
    coverArt: {
      type: String, // Path to the image file
    },
    cost: {
      type: Number,
    },
    tags: {
      type: [String],
    },
    inventory: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

module.exports = mongoose.model('Book', bookSchema);
