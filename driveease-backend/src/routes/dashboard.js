const express = require('express');
const router = express.Router();
const verifySupabaseJwt = require('../middleware/verifySupabaseJwt');
const requireAdmin = require('../middleware/requireAdmin');
const { getDashboardStats } = require('../controllers/dashboardController');

// GET / — protected dashboard stats endpoint for admins
router.get('/', verifySupabaseJwt, requireAdmin, getDashboardStats);

module.exports = router;
