const asyncHandler = require('express-async-handler');
const Book = require('../models/bookModel');
const User = require('../models/userModel');
const mongoose = require('mongoose');
const path = require('path');
const { Storage } = require('@google-cloud/storage');

// Setup Google Cloud Storage
const storage = new Storage();
const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);
// @desc    Create a book
// @route   POST /api/books
// @access  Private/Employee
const createBook = asyncHandler(async (req, res) => {
  const { seriesTitle, seriesStartDate, seriesEndDate, publisher, issueNumber, releaseDate, coverArt, cost, tags, inventory } = req.body;
  
  if (!seriesTitle || !seriesStartDate || !publisher || !issueNumber || !releaseDate) { 
    res.status(400);
    throw new Error('Please add all required fields');
  }

  const book = await Book.create(req.body);

  if (req.file) {
    const fileExtension = path.extname(req.file.originalname);
    const fileName = `covers/${book._id}${fileExtension}`;
    const file = bucket.file(fileName);
    
    const stream = file.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
      },
      resumable: false,
    });
    
    stream.end(req.file.buffer);
    
    // Make the file public and get the URL
    const newCoverArtUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    book.coverArt = newCoverArtUrl;
    await book.save();
  }

  const createdBook = await Book.findById(book._id);

  if (createdBook) {
    res.status(201).json(createdBook);
  } else {
    res.status(400);
    throw new Error('Invalid book data');
  }
});

// @desc    Get all books with pull counts
// @route   GET /api/books
// @access  Private
const getBooks = asyncHandler(async (req, res) => {
  const books = await Book.find({}).lean();

  const pullCounts = await User.aggregate([
    { $unwind: '$pullList' },
    { $group: { _id: '$pullList.bookId', totalPulls: { $sum: 1 } } },
  ]);

  const pullMap = pullCounts.reduce((acc, pull) => {
    acc[pull._id] = pull.totalPulls;
    return acc;
  }, {});

  const booksWithPulls = books.map(book => ({
    ...book,
    totalPulls: pullMap[book._id.toString()] || 0,
  }));

  res.json(booksWithPulls);
});

// @desc    Get book by ID with pull count
// @route   GET /api/books/:id
// @access  Private/Employee
const getBookById = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id).lean();

  if (book) {
    const pullCountResult = await User.aggregate([
        { $unwind: '$pullList' },
        { $match: { 'pullList.bookId': new mongoose.Types.ObjectId(req.params.id) } },
        { $group: { _id: '$pullList.bookId', totalPulls: { $sum: 1 } } }
    ]);
    const totalPulls = pullCountResult.length > 0 ? pullCountResult[0].totalPulls : 0;
    book.totalPulls = totalPulls;
    res.json(book);
  } else {
    res.status(404);
    throw new Error('Book not found');
  }
});

// @desc    Update a book
// @route   PUT /api/books/:id
// @access  Private/Employee
const updateBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (book) {
    const updatedBook = await Book.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    res.json(updatedBook);
  } else {
    res.status(404);
    throw new Error('Book not found');
  }
});

// @desc    Delete a book
// @route   DELETE /api/books/:id
// @access  Private/Employee
const deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (book) {
    await book.deleteOne();
    res.json({ message: 'Book removed' });
  } else {
    res.status(404);
    throw new Error('Book not found');
  }
});

module.exports = {
  createBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
};
