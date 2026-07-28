const path = require('path');
const asyncHandler = require('express-async-handler');
const Book = require('../models/bookModel');
const { Storage } = require('@google-cloud/storage');

// Setup Google Cloud Storage
const storage = new Storage();
const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);
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

  // If an old cover exists, archive it by renaming it in GCS
  if (book.coverArt) {
    try {
      const oldFileName = book.coverArt.split(`${bucket.name}/`)[1];
      const oldFile = bucket.file(oldFileName);
      const [exists] = await oldFile.exists();
      
      if (exists) {
      const timestamp = Math.floor(Date.now() / 1000);
        const extension = path.extname(oldFileName);
        const newName = `covers/${book._id}-${timestamp}${extension}`;
        await oldFile.copy(bucket.file(newName));
      }
    } catch (err) {
      console.error('Could not archive old cover art:', err.message);
    }
  }

  // Upload the new file to GCS, overwriting the old one
  const fileExtension = path.extname(req.file.originalname);
  const newFileName = `covers/${bookId}${fileExtension}`;
  const file = bucket.file(newFileName);
  const stream = file.createWriteStream({
    metadata: { contentType: req.file.mimetype },
    resumable: false,
  });
  stream.end(req.file.buffer);
  
  const newCoverArtUrl = `https://storage.googleapis.com/${bucket.name}/${newFileName}`;
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
