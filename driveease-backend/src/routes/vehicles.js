const express = require('express');
const vehicleController = require('../controllers/vehicleController');
const verifySupabaseJwt = require('../middleware/verifySupabaseJwt');
const requireAdmin = require('../middleware/requireAdmin');

const router = express.Router();

router.get('/', vehicleController.getAllVehicles);
router.get('/:id', vehicleController.getVehicleById);

// Protected routes (require valid JWT + admin role)
router.post('/', verifySupabaseJwt, requireAdmin, vehicleController.createVehicle);
router.post('/:id/images', verifySupabaseJwt, requireAdmin, vehicleController.addVehicleImage);
router.put('/:id', verifySupabaseJwt, requireAdmin, vehicleController.updateVehicle);
router.delete('/:id', verifySupabaseJwt, requireAdmin, vehicleController.softDeleteVehicle);

module.exports = router;
