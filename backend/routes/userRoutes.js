const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  registerEmployee,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  resetPassword,
  resetMyPassword,
  getMe,
  addPullRequest,
  getUserPullList,
  getAllUsersPullList
} = require('../controllers/userController');
const { protect, employee, customer } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/me/reset-password', protect, resetMyPassword);
router.get('/pull-list', protect, getUserPullList);

// Employee only routes
router.post('/register-employee', protect, employee, registerEmployee);
router.get('/pull-list/all', protect, employee, getAllUsersPullList);
router.route('/')
    .get(protect, employee, getUsers);
router.route('/:id')
    .get(protect, employee, getUserById)
    .put(protect, employee, updateUser)
    .delete(protect, employee, deleteUser);
router.put('/:id/reset-password', protect, employee, resetPassword);

// Customer only routes
router.post('/me/pull-list', protect, customer, addPullRequest);

module.exports = router;
