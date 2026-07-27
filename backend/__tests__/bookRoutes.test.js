const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const bookRoutes = require('../routes/bookRoutes'); // Adjust path if needed
const Book = require('../models/bookModel'); // Adjust path if needed

// Create a minimal express app for testing
const app = express();
app.use(express.json());
app.use('/api/books', bookRoutes);

// Mock middleware for authentication
jest.mock('../middleware/authMiddleware', () => ({
  protect: (req, res, next) => next(),
  employee: (req, res, next) => next(),
}));


describe('Book API Routes', () => {

  it('POST /api/books - should create a new book', async () => {
    const newBook = {
      seriesTitle: 'Test Comic',
      issueNumber: 1,
      releaseDate: '2023-10-27T00:00:00.000Z',
      publisher: 'Test Publisher',
      inventory: 10,
    };

    const response = await request(app)
      .post('/api/books')
      .send(newBook)
      .expect('Content-Type', /json/)
      .expect(201);

    expect(response.body).toHaveProperty('_id');
    expect(response.body.seriesTitle).toBe('Test Comic');
  });

  it('GET /api/books - should return all books', async () => {
    // First, create a book to ensure the database is not empty
    await Book.create({
      seriesTitle: 'Another Comic',
      issueNumber: 1,
      releaseDate: new Date(),
      publisher: 'Another Publisher',
    });

    const response = await request(app)
      .get('/api/books')
      .expect(200);

    expect(response.body.length).toBe(1);
    expect(response.body[0].seriesTitle).toBe('Another Comic');
  });
});
