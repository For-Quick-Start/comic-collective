require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const testRoutes = require(path.join(__dirname, 'routes/testRoutes'));
const userRoutes = require(path.join(__dirname, 'routes/userRoutes'));
const bookRoutes = require(path.join(__dirname, 'routes/bookRoutes'));

const app = express();
const PORT = process.env.PORT || 5001; // This is still useful for local dev

// --- Middleware ---
app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// Middleware to ensure DB connection for all API requests
app.use('/api', async (req, res, next) => {
  await connectDB();
  next();
});

// --- Routes ---
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api', testRoutes); // Move the more generic route to the end

// For local development, start the server
if (require.main === module) {
  connectDB().then(() => {
    app.listen(PORT, () => console.log(`Backend server is running on http://localhost:${PORT}`));
  });
}

module.exports = app;
