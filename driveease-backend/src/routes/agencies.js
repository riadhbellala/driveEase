const express = require('express');
const router = express.Router();

const verifySupabaseJwt = require('../middleware/verifySupabaseJwt');
const requireAdmin = require('../middleware/requireAdmin');
const agencyController = require('../controllers/agencyController');

router.post('/register', verifySupabaseJwt, agencyController.registerAgency);
router.get('/me', verifySupabaseJwt, requireAdmin, agencyController.getMyAgency);
router.patch('/website', verifySupabaseJwt, requireAdmin, agencyController.toggleWebsiteEnabled);

module.exports = router;
