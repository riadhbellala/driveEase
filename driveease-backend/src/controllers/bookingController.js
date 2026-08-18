const bookingService = require('../services/bookingService');

const createBooking = async (req, res) => {
  const { vehicle_id, start_date, end_date } = req.body;
  const customerId = req.user.id;

  try {
    const booking = await bookingService.createBooking(customerId, vehicle_id, start_date, end_date);
    return res.status(201).json(booking);
  } catch (err) {
    if (err.message.startsWith('Vehicle not found')) {
      return res.status(404).json({ error: err.message });
    }
    if (err.message === 'This vehicle is already booked for the selected dates.') {
      return res.status(409).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
};

const createStaffBooking = async (req, res) => {
  const agencyId = req.user?.agency_id;
  const { vehicle_id, start_date, end_date, customer_id, walkin_name, walkin_phone } = req.body;

  if (!customer_id && !walkin_name) {
    return res.status(400).json({ error: 'Either a customer_id or a walkin_name must be provided.' });
  }

  try {
    const booking = await bookingService.createStaffBooking(
      agencyId,
      vehicle_id,
      start_date,
      end_date,
      { customerId: customer_id, walkinName: walkin_name, walkinPhone: walkin_phone }
    );
    return res.status(201).json(booking);
  } catch (err) {
    if (err.message.startsWith('Vehicle not found') || err.message === 'Vehicle does not belong to your agency') {
      return res.status(404).json({ error: err.message });
    }
    if (err.message === 'This vehicle is already booked for the selected dates.') {
      return res.status(409).json({ error: err.message });
    }
    return res.status(400).json({ error: err.message });
  }
};

const getMyBookings = async (req, res) => {
  const customerId = req.user.id;
  try {
    const bookings = await bookingService.getMyBookings(customerId);
    return res.status(200).json(bookings);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const cancelBooking = async (req, res) => {
  const bookingId = req.params.id;
  const customerId = req.user.id;

  try {
    const updatedBooking = await bookingService.cancelBooking(bookingId, customerId);
    return res.status(200).json(updatedBooking);
  } catch (err) {
    if (err.message === 'Booking not found') {
      return res.status(404).json({ error: err.message });
    }
    if (err.message === 'Not authorized to cancel this booking') {
      return res.status(403).json({ error: err.message });
    }
    if (
      err.message === 'This booking cannot be cancelled' ||
      err.message === 'Cannot cancel a booking that has already started'
    ) {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const agencyId = req.user?.agency_id;
    const bookings = await bookingService.getAllBookings(agencyId);
    return res.status(200).json(bookings);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const updateBookingStatus = async (req, res) => {
  const bookingId = req.params.id;
  const newStatus = req.body.newStatus || req.body.status;

  const validStatuses = ['approved', 'rejected', 'active', 'completed', 'cancelled'];
  if (!newStatus || !validStatuses.includes(newStatus)) {
    return res.status(400).json({
      error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
    });
  }

  try {
    const updatedBooking = await bookingService.updateBookingStatus(bookingId, newStatus);
    return res.status(200).json(updatedBooking);
  } catch (err) {
    if (err.message === 'Booking not found') {
      return res.status(404).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
  createStaffBooking,
};
