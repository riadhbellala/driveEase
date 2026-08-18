const supabase = require('../config/supabaseClient');

const getAgencyCustomers = async (agencyId) => {
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(`
      created_at,
      customer_id,
      walkin_name,
      walkin_phone,
      profiles ( full_name, phone )
    `)
    .eq('agency_id', agencyId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const customerMap = new Map();

  for (const booking of bookings || []) {
    let identityKey;
    let fullName;
    let phone;

    if (booking.customer_id) {
      identityKey = `user_${booking.customer_id}`;
      fullName = booking.profiles?.full_name || 'Unknown User';
      phone = booking.profiles?.phone || 'No phone';
    } else if (booking.walkin_phone) {
      identityKey = `walkin_${booking.walkin_phone}`;
      fullName = booking.walkin_name || 'Walk-in';
      phone = booking.walkin_phone;
    } else {
      // Fallback if neither exists
      identityKey = `unknown_${Math.random()}`;
      fullName = booking.walkin_name || 'Unknown';
      phone = 'No phone';
    }

    if (!customerMap.has(identityKey)) {
      customerMap.set(identityKey, {
        id: identityKey, // Used by frontend list key
        full_name: fullName,
        phone: phone,
        total_bookings: 1,
        most_recent_booking_date: booking.created_at,
      });
    } else {
      const existing = customerMap.get(identityKey);
      existing.total_bookings += 1;
      // Since ordered by created_at DESC, the first one seen is the most recent
    }
  }

  return Array.from(customerMap.values());
};

module.exports = {
  getAgencyCustomers,
};
