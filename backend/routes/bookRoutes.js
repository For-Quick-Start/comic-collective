const express = require('express');
const router = express.Router();
const { createBook, getBooks, getBookById, updateBook, deleteBook } = require('../controllers/bookController');
const { protect, employee } = require('../middleware/authMiddleware');

// All routes in this file will be protected and require an employee role
router.route('/').post(protect, employee, createBook).get(protect, getBooks); // getBooks is used by customers too
router.route('/:id')
    .get(protect, getBookById) // getBookById is used by employees and customers
    .put(protect, employee, updateBook)
    .delete(protect, employee, deleteBook);

module.exports = router;