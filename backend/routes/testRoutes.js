const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');

// Defines the route for GET /api/test
router.get('/test', testController.getTest);

module.exports = router;
