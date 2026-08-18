const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const verifySupabaseJwt = require('../middleware/verifySupabaseJwt');
const requireAdmin = require('../middleware/requireAdmin');

router.get('/', verifySupabaseJwt, requireAdmin, customerController.getAgencyCustomers);

module.exports = router;
