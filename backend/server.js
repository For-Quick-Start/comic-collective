require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const testRoutes = require('./routes/testRoutes');
const userRoutes = require('./routes/userRoutes');
const bookRoutes = require('./routes/bookRoutes');

const app = express();
const PORT = process.env.PORT || 5001; // This is still useful for local dev

// --- Middleware ---
app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// --- Routes ---
app.use('/api', testRoutes);
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);

// This async function will be our new handler
const handler = async (req, res) => {
  // Ensure database connection
  await connectDB();
  // Delegate to the express app
  return app(req, res);
};

// For local development, we still want to start a standalone server
const startLocalServer = async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`Backend server is running on http://localhost:${PORT}`));
};

// Vercel will use the default export.
// For local dev, we check if the module is the main one being run.
if (process.env.VERCEL) {
  module.exports = handler;
} else {
  startLocalServer();
}
