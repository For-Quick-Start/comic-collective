const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Book = require('../models/bookModel');
const sendEmail = require('../utils/email');

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

  if (!user) {
    res.status(400).json({ message: 'Invalid user data' });
    return;
  }

  // Create verification token
  const verificationToken = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false }); // Save with token, skipping password validation

  // Send verification email
  const verificationURL = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
  const message = `Hi ${user.name},\nPlease click the link to verify your email address: ${verificationURL}\n\nIf you did not request this, please ignore this email.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Comic Collective - Verify Your Email',
      message,
    });

    res.status(201).json({ message: 'Registration successful! Please check your email to verify your account.' });
  } catch (err) {
    res.status(500).json({ message: 'There was an error sending the verification email. Please try again later.' });
  }
});

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  if (user.status === 'active' && user.isVerified) {
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else if (!user.isVerified) {
    res.status(401).json({ message: 'Please verify your email before logging in.' });
  } else if (user && user.status === 'disabled') {
    res.status(401).json({ message: 'Account is disabled' });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// @desc    Verify user email
// @route   POST /api/users/verify-email
// @access  Public
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // First, try to find the user by the hashed token, regardless of expiration or verification status initially.
  // This allows us to check if the user exists with this token, even if it's expired or they're already verified.
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
  });

  if (!user) {
    // If no user is found with this token at all, it's an invalid token.
    return res.status(400).json({ message: 'Token is invalid or has been used.' });
  }

  // If a user is found with this token
  if (user.isVerified) {
    // If the user is already verified, inform them. This handles double-clicks or retries after successful verification.
    return res.status(200).json({ message: 'Email is already verified!' });
  }

  if (user.emailVerificationExpires < Date.now()) {
    // If the token is found but expired, inform them.
    // Optionally, clear the expired token from the user document to prevent future attempts with it.
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false }); // Save changes to clear expired token
    return res.status(400).json({ message: 'Token has expired. Please request a new verification email.' });
  }

  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({ message: 'Email verified successfully!' });
});

// @desc    Forgot password
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    // Send a generic success response to prevent email enumeration
    return res.status(200).json({ message: 'If a user with that email exists, a password reset link has been sent.' });
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  const message = `Forgot your password? Submit a PUT request with your new password to: ${resetURL}.\nIf you didn't forget your password, please ignore this email.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });
    res.status(200).json({ message: 'If a user with that email exists, a password reset link has been sent.' });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(500).json({ message: 'There was an error sending the email. Try again later!' });
  }
});

// @desc    Reset password with token
// @route   PUT /api/users/reset-password/:token
// @access  Public
const resetPasswordWithToken = asyncHandler(async (req, res) => {
  // FIX: Use 'sha256' to match the hashing algorithm used in createPasswordResetToken
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } });

  if (!user) {
    return res.status(400).json({ message: 'Token is invalid or has expired' });
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

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Employee
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
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
    await user.deleteOne();
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
    // ensure book is not already in pull list
    const alreadyPulled = user.pullList.some(item => item.bookId.toString() === bookId);

    if (alreadyPulled) {
      return res.status(400).json({ message: 'Book already in pull list' });
    }

    user.pullList.push({ bookId, requested: true, pulled: false, purchased: false });
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
    // ensure book is in pull list
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
  // gather details of all books for all users' pull lists
  const users = await User.find({ 'pullList.0': { $exists: true } }) // get only non-empty pull lists
    .populate({
      path: 'pullList.bookId',
      model: 'Book'
    })
    .select('name pullList');

  if (users) {
    // flatten the array of pull lists 
    // into a single array of pull items
    // with user info for each item
    const allPulls = users.flatMap(user =>
      user.pullList.map(pull => ({
        ...pull.toObject(), // have to convert mongoose sub-document to object
        userId: user._id,
        userName: user.name,
      }))
    );
    res.json(allPulls);
  } else {
    res.json([]);
  }
});

// @desc    Mark a pull request as purchased
// @route   PUT /api/users/pull-list/:pullId/purchase
// @access  Private/Employee
const purchasePullRequest = asyncHandler(async (req, res) => {
  const { pullId } = req.params;

  // find pullId and store which user it belongs to
  const user = await User.findOne({ 'pullList._id': pullId });

  if (!user) {
    res.status(404);
    throw new Error('Pull item not found');
  }

  const pullItem = user.pullList.id(pullId);

  if (pullItem.purchased) {
    res.status(400);
    throw new Error('Item already purchased');
  }

  // find book and check inventory BEFORE marking as purchased
  const book = await Book.findById(pullItem.bookId);
  if (!book) {
    res.status(404);
    throw new Error('Associated book not found for this pull item.');
  }

  if (book.inventory < 1) {
    res.status(400);
    throw new Error(`Cannot purchase "${book.seriesTitle}": Not enough inventory.`);
  }

  // Now, proceed with updates
  book.inventory -= 1;
  await book.save();

  pullItem.purchased = true;
  await user.save();

  res.status(200).json({ message: 'Pull item marked as purchased' });
});

// @desc    Mark a pull request as pulled
// @route   PUT /api/users/pull-list/:pullId/pull
// @access  Private/Employee
const markPullAsPulled = asyncHandler(async (req, res) => {
  const { pullId } = req.params;

  // find pullId and store which user it belongs to
  const user = await User.findOne({ 'pullList._id': pullId });

  if (!user) {
    res.status(404);
    throw new Error('Pull item not found');
  }

  const pullItem = user.pullList.id(pullId);
  pullItem.pulled = true;
  await user.save();

  res.status(200).json({ message: 'Pull item marked as pulled' });
});

// @desc    Get recommendation tags based on user's pull list
// @route   GET /api/users/me/recommendation-tags
// @access  Private/Customer
const getRecommendationTags = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate({
    path: 'pullList.bookId',
    select: 'tags', // only selects 'tags' field for efficiency
    model: 'Book',
  });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const allTags = user.pullList.flatMap(item => item.bookId ? item.bookId.tags : []);
  const uniqueTags = [...new Set(allTags)];
  res.json(uniqueTags);
});

module.exports = { registerUser, loginUser, verifyEmail, forgotPassword, resetPasswordWithToken, registerEmployee, getUsers, getUserById, updateUser, deleteUser, resetPassword, resetMyPassword, getMe, addPullRequest, dropPullRequest, getUserPullList, getAllUsersPullList, purchasePullRequest, markPullAsPulled, getRecommendationTags };
