const express = require('express');
const router = express.Router();

const verifySupabaseJwt = require('../middleware/verifySupabaseJwt');
const requireAdmin = require('../middleware/requireAdmin');
const {
  createBooking,
  getMyBookings,
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
  createStaffBooking,
} = require('../controllers/bookingController');

// POST / — any authenticated user can create a booking
router.post('/', verifySupabaseJwt, createBooking);

// GET / — fetch the authenticated user's bookings
router.get('/', verifySupabaseJwt, getMyBookings);

// PATCH /:id/cancel — cancel a booking
router.patch('/:id/cancel', verifySupabaseJwt, cancelBooking);

// Admin / Staff Routes
// POST /staff — agency staff can create approved bookings directly
router.post('/staff', verifySupabaseJwt, requireAdmin, createStaffBooking);
// GET /admin/all — fetch all bookings for admin dashboard
router.get('/admin/all', verifySupabaseJwt, requireAdmin, getAllBookings);

// PATCH /admin/:id/status — update booking status (approved, rejected, active, completed, cancelled)
router.patch('/admin/:id/status', verifySupabaseJwt, requireAdmin, updateBookingStatus);

module.exports = router;
