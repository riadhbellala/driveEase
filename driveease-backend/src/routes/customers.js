const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const verifySupabaseJwt = require('../middleware/verifySupabaseJwt');
const requireAdmin = require('../middleware/requireAdmin');

router.get('/', verifySupabaseJwt, requireAdmin, customerController.getAllCustomers);
router.patch('/:id/disable', verifySupabaseJwt, requireAdmin, customerController.toggleCustomerDisabled);

module.exports = router;
