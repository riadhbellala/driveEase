const supabase = require('../config/supabaseClient');

const createBooking = async (customerId, vehicleId, startDate, endDate) => {
  // Fetch vehicle to get daily_price
  const { data: vehicle, error: vehicleError } = await supabase
    .from('vehicles')
    .select('daily_price, brand, model')
    .eq('id', vehicleId)
    .is('deleted_at', null)
    .single();

  if (vehicleError || !vehicle) {
    throw new Error(`Vehicle not found with id: ${vehicleId}`);
  }

  // Calculate total price
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMs = end - start;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 1) {
    throw new Error('End date must be after start date.');
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startNormalized = new Date(start);
  startNormalized.setHours(0, 0, 0, 0);

  if (startNormalized < today) {
    throw new Error('Start date cannot be in the past.');
  }

  const totalPrice = vehicle.daily_price * diffDays;

  // Insert booking
  const { data: booking, error: insertError } = await supabase
    .from('bookings')
    .insert({
      customer_id: customerId,
      vehicle_id: vehicleId,
      start_date: startDate,
      end_date: endDate,
      status: 'pending',
      total_price: totalPrice,
    })
    .select()
    .single();

  if (insertError) {
    if (insertError.code === '23P01') {
      throw new Error('This vehicle is already booked for the selected dates.');
    }
    throw insertError;
  }

  // Fire-and-forget notification — failure must not block the booking
  const notificationMessage =
    `Your booking request for ${vehicle.brand} ${vehicle.model} has been submitted and is pending approval.`;

  const { error: notifError } = await supabase
    .from('notifications')
    .insert({ user_id: customerId, message: notificationMessage });

  if (notifError) {
    console.error('Failed to insert booking notification:', notifError.message);
  }

  return booking;
};

const getMyBookings = async (customerId) => {
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(`
      *,
      vehicles (
        brand,
        model
      )
    `)
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }
  
  return bookings || [];
};

const cancelBooking = async (bookingId, customerId) => {
  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .single();

  if (fetchError || !booking) {
    throw new Error('Booking not found');
  }

  if (booking.customer_id !== customerId) {
    throw new Error('Not authorized to cancel this booking');
  }

  if (booking.status !== 'pending' && booking.status !== 'approved') {
    throw new Error('This booking cannot be cancelled');
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDate = new Date(booking.start_date);

  if (startDate < today) {
    throw new Error('Cannot cancel a booking that has already started');
  }

  const { data: updatedBooking, error: updateError } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId)
    .select()
    .single();

  if (updateError) {
    throw updateError;
  }

  // Non-blocking notification insert
  const notificationMessage = `Your booking for ${booking.start_date} to ${booking.end_date} has been cancelled.`;
  const { error: notifError } = await supabase
    .from('notifications')
    .insert({ user_id: customerId, message: notificationMessage });

  if (notifError) {
    console.error('Failed to insert cancellation notification:', notifError.message);
  }

  return updatedBooking;
};

const getAllBookings = async () => {
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(`
      *,
      vehicles (brand, model),
      profiles (full_name)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return bookings || [];
};

const updateBookingStatus = async (bookingId, newStatus) => {
  const { data: booking, error: updateError } = await supabase
    .from('bookings')
    .update({ status: newStatus })
    .eq('id', bookingId)
    .select(`
      *,
      vehicles (brand, model)
    `)
    .single();

  if (updateError || !booking) {
    throw updateError || new Error('Booking not found');
  }

  // Non-blocking notification insert
  const vehicleName = booking.vehicles
    ? `${booking.vehicles.brand} ${booking.vehicles.model}`
    : 'your vehicle';
  const notificationMessage = `Your booking for ${vehicleName} has been ${newStatus}.`;

  const { error: notifError } = await supabase
    .from('notifications')
    .insert({ user_id: booking.customer_id, message: notificationMessage });

  if (notifError) {
    console.error('Failed to insert status update notification:', notifError.message);
  }

  return booking;
};

module.exports = {
  createBooking,
  getMyBookings,
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
};
