const path = require('path');
const fs = require('fs');
const asyncHandler = require('express-async-handler');
const Book = require('../models/bookModel');

const COVERS_DIR = path.join(__dirname, '../../frontend/public/covers');

// @desc    Upload a cover image for a book
// @route   POST /api/books/:id/upload-cover
// @access  Private/Employee
const uploadCover = asyncHandler(async (req, res) => {
  const bookId = req.params.id;
  const book = await Book.findById(bookId);

  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  if (!req.file) {
    res.status(400);
    throw new Error('Please provide an image file');
  }

  // if path to old cover was set, rename it for archiving rather than overwrite
  if (book.coverArt) {
    const oldPath = path.join(__dirname, '../../frontend/public', book.coverArt);
    if (fs.existsSync(oldPath)) {
      const timestamp = Math.floor(Date.now() / 1000);
      const extension = path.extname(oldPath);
      const newName = `${book._id}-${timestamp}${extension}`;
      const archivePath = path.join(COVERS_DIR, newName);
      try {
        fs.renameSync(oldPath, archivePath);
      } catch (renameErr) {
        // log error but don't fail the upload
        console.error(`Could not rename old cover art: ${renameErr.message}`);
      }
    }
  }

  const fileExtension = path.extname(req.file.originalname).toLowerCase();
  const newFilename = `${bookId}${fileExtension}`;
  const newPath = path.join(COVERS_DIR, newFilename);

  // move uploaded file from multer temp dir to final dir
  // use copy and unlink to avoid cross-device link errors
  try {
    fs.copyFileSync(req.file.path, newPath);
    fs.unlinkSync(req.file.path); // remove temp file
  } catch (err) {
    console.error('Error moving file:', err);
  }

  const newCoverArtUrl = `/covers/${newFilename}`;
  book.coverArt = newCoverArtUrl;
  await book.save();

  res.status(200).json({
    message: 'Image uploaded successfully',
    coverArt: newCoverArtUrl,
  });
});

module.exports = {
  uploadCover,
};
