const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const { createBook, getBooks, getBookById, updateBook, deleteBook } = require('../controllers/bookController');
const { uploadCover } = require('../controllers/uploadController');
const { protect, employee } = require('../middleware/authMiddleware');

// Setup multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

router.route('/')
    .post(protect, employee, upload.single('coverArtFile'), createBook)
    .get(protect, getBooks);

router.route('/:id')
    .get(protect, getBookById)
    .put(protect, employee, updateBook)
    .delete(protect, employee, deleteBook);

router.route('/:id/upload-cover').post(protect, employee, upload.single('coverArtFile'), uploadCover);

module.exports = router;
