const path = require('path');
const asyncHandler = require('express-async-handler');
const Book = require('../models/bookModel');
const { uploadFileToGCS, bucket } = require('../utils/gcsUpload'); // Import bucket for archiving

console.log('uploadController: GCS_BUCKET_NAME:', process.env.GCS_BUCKET_NAME);
console.log('uploadController: GOOGLE_APPLICATION_CREDENTIALS status:', process.env.GOOGLE_APPLICATION_CREDENTIALS ? 'Loaded' : 'Not loaded');
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
  const newFileName = `covers/${bookId}${path.extname(req.file.originalname)}`;
  try {
    const newCoverArtUrl = await uploadFileToGCS(req.file.buffer, req.file.mimetype, newFileName);
    book.coverArt = newCoverArtUrl;
    await book.save();

    res.status(200).json({
      message: 'Image uploaded successfully',
      coverArt: newCoverArtUrl,
    });
  } catch (uploadError) {
    console.error('uploadController: Failed to upload cover art to GCS for existing book:', uploadError);
    res.status(500).json({ message: 'Failed to upload new cover art.' });
    return;
  }
});

module.exports = {
  uploadCover,
};
