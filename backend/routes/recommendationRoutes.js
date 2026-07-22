const express = require('express');
const { getRecommendations } = require('../controllers/recommendationController.js');
const { protect } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.route('/').post(protect, getRecommendations);

module.exports = router;
