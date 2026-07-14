const Book = require('../models/bookModel');

// @desc    Create a new book
// @route   POST /api/books
// @access  Private/Employee
const createBook = async (req, res) => {
  const {
    seriesTitle,
    seriesStartDate,
    seriesEndDate,
    publisher,
    issueNumber,
    releaseDate,
    coverArt,
    tags,
  } = req.body;

  if (!seriesTitle || !seriesStartDate || !publisher || !issueNumber || !releaseDate) {
    return res.status(400).json({ message: 'Please fill out all required fields' });
  }

  const book = await Book.create({
    seriesTitle, seriesStartDate, seriesEndDate, publisher, issueNumber, releaseDate, coverArt, tags
  });

  res.status(201).json(book);
};

// @desc    Get all books
// @route   GET /api/books
// @access  Private/Employee
const getBooks = async (req, res) => {
  const booksWithPullCount = await Book.aggregate([
    {
      $lookup: {
        from: 'users', // The collection to join with
        localField: '_id', // Field from the input documents (Book)
        foreignField: 'pullList.bookId', // Field from the documents of the "from" collection (User)
        as: 'pulledByUsers', // Output array field name
      },
    },
    {
      $addFields: {
        pullCount: { $size: '$pulledByUsers' }, // Add a field with the size of the pulledByUsers array
      },
    },
    {
      $project: { pulledByUsers: 0 }, // Optionally remove the temporary array
    },
  ]);
  res.json(booksWithPullCount);
};

// @desc    Get book by ID
// @route   GET /api/books/:id
// @access  Private/Employee
const getBookById = async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (book) {
    res.json(book);
  } else {
    res.status(404).json({ message: 'Book not found' });
  }
};

// @desc    Update a book
// @route   PUT /api/books/:id
// @access  Private/Employee
const updateBook = async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (book) {
    const { seriesTitle, seriesStartDate, seriesEndDate, publisher, issueNumber, releaseDate, coverArt, tags } = req.body;

    book.seriesTitle = seriesTitle ?? book.seriesTitle;
    book.seriesStartDate = seriesStartDate ?? book.seriesStartDate;
    book.seriesEndDate = seriesEndDate; // Allow setting to null
    book.publisher = publisher ?? book.publisher;
    book.issueNumber = issueNumber ?? book.issueNumber;
    book.releaseDate = releaseDate ?? book.releaseDate;
    book.coverArt = coverArt ?? book.coverArt;
    book.tags = tags ?? book.tags;

    const updatedBook = await book.save();
    res.json(updatedBook);
  } else {
    res.status(404).json({ message: 'Book not found' });
  }
};

// @desc    Delete a book
// @route   DELETE /api/books/:id
// @access  Private/Employee
const deleteBook = async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (book) {
    await Book.findByIdAndDelete(req.params.id); // Use findByIdAndDelete on the model
    res.json({ message: 'Book removed' });
  } else {
    res.status(404).json({ message: 'Book not found' });
  }
};

module.exports = { createBook, getBooks, getBookById, updateBook, deleteBook };