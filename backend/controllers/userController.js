const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const passwordIsValid = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// @desc    Register a new customer
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please add all fields' });
  }

  if (!passwordIsValid(password)) {
    return res.status(400).json({
      message:
        'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
    });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const user = await User.create({ name, email, password, role: 'customer' });

  if (user) {
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
});

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && user.status === 'active' && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else if (user && user.status === 'disabled') {
    res.status(401).json({ message: 'Account is disabled' });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// @desc    Register a new employee
// @route   POST /api/users/register-employee
// @access  Private/Employee
const registerEmployee = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please add all fields' });
  }

  if (!passwordIsValid(password)) {
    return res.status(400).json({
      message:
        'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
    });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const user = await User.create({ name, email, password, role: 'employee' });

  if (user) {
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Employee
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password');
  res.json(users);
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Employee
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user status
// @route   PUT /api/users/:id
// @access  Private/Employee
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.status = req.body.status || user.status;
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      status: updatedUser.status,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Private/Employee
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    await user.remove();
    res.json({ message: 'User removed' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Reset a user's password
// @route   PUT /api/users/:id/reset-password
// @access  Private/Employee
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const user = await User.findById(req.params.id);

  if (!passwordIsValid(password)) {
    return res.status(400).json({
      message:
        'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
    });
  }

  if (user) {
    user.password = password;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// @desc    Reset logged-in user's password
// @route   PUT /api/users/me/reset-password
// @access  Private
const resetMyPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  // The user ID comes from the protect middleware
  const user = await User.findById(req.user.id);

  if (!passwordIsValid(password)) {
    return res.status(400).json({
      message:
        'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
    });
  }

  if (user) {
    user.password = password;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// @desc    Get user profile
// @route   GET /api/users/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.status(200).json(user);
});

// @desc    Add a book to user's pull list
// @route   POST /api/users/me/pull-list
// @access  Private/Customer
const addPullRequest = asyncHandler(async (req, res) => {
  const { bookId } = req.body;
  const user = await User.findById(req.user.id);

  if (user) {
    // Check if the book is already in the pull list
    const alreadyPulled = user.pullList.some(item => item.bookId.toString() === bookId);

    if (alreadyPulled) {
      return res.status(400).json({ message: 'Book already in pull list' });
    }

    user.pullList.push({ bookId, purchased: false });
    await user.save();

    res.status(201).json(user.pullList);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});


// @desc    Remove a book from user's pull list
// @route   POST /api/users/me/pull-drop
// @access  Private/Customer
const dropPullRequest = asyncHandler(async (req, res) => {
  const { bookId } = req.body;
  const user = await User.findById(req.user.id);

  if (user) {
    // Check if book is in the pull list
    const alreadyPulled = user.pullList.some(item => item.bookId.toString() === bookId);

    if (!alreadyPulled) {
      return res.status(400).json({ message: 'Book not in pull list' });
    }

    user.pullList = user.pullList.filter(item => item.bookId.toString() !== bookId);
    await user.save();

    res.status(200).json(user.pullList);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});


// @desc    Get user pull list
// @route   GET /api/users/pull-list
// @access  Private
const getUserPullList = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate({
    path: 'pullList.bookId',
    model: 'Book',
  });

  if (user) {
    res.json(user.pullList);
  } else {
    res.status(404).send('User not found');
  }
});

// @desc    Get all pull lists from all users
// @route   GET /api/users/pull-list/all
// @access  Private/Employee
const getAllUsersPullList = asyncHandler(async (req, res) => {
  // Find all users and populate the book details in their pull lists.
  const users = await User.find({ 'pullList.0': { $exists: true } }) // Optimization: only get users with non-empty pull lists
    .populate({
      path: 'pullList.bookId',
      model: 'Book',
    })
    .select('pullList'); // Only select the pullList field

  if (users) {
    // Flatten the array of pull lists into a single array of pull items
    const allPulls = users.flatMap(user => user.pullList);
    res.json(allPulls);
  } else {
    // This case is unlikely as find() returns an empty array if no documents are found
    res.json([]);
  }
});

module.exports = { registerUser, loginUser, registerEmployee, getUsers, getUserById, updateUser, deleteUser, resetPassword, resetMyPassword, getMe, addPullRequest, dropPullRequest, getUserPullList, getAllUsersPullList };