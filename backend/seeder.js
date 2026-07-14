const mongoose = require('mongoose');
require('dotenv').config(); // To use environment variables from .env

const User = require('./models/userModel');
const connectDB = require('./config/db');

// Connect to the database
connectDB();

const createEmployee = async () => {
  try {
    // --- IMPORTANT: Change these details ---
    const employeeDetails = {
      name: 'Kent',
      email: 'kent@crimany.org',
      password: 'CC!54ComicCollective', // Make sure this meets your password criteria
      role: 'employee',
    };

    // Check if the user already exists
    const userExists = await User.findOne({ email: employeeDetails.email });
    if (userExists) {
      console.log('Employee user with this email already exists.');
      process.exit();
    }

    await User.create(employeeDetails);
    console.log('Employee user created successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

createEmployee();