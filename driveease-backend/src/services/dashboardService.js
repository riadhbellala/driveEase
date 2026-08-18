const supabase = require('../config/supabaseClient');

const getDashboardStats = async (agencyId) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  let vehiclesQ = supabase.from('vehicles').select('*', { count: 'exact', head: true }).is('deleted_at', null);
  let availableCarsQ = supabase.from('vehicles').select('*', { count: 'exact', head: true }).is('deleted_at', null).eq('status', 'available');
  let rentedCarsQ = supabase.from('vehicles').select('*', { count: 'exact', head: true }).is('deleted_at', null).eq('status', 'rented');
  let activeRentalsQ = supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'active');
  let monthlyBookingsQ = supabase.from('bookings').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth);
  let monthlyRevenueQ = supabase.from('bookings').select('total_price').gte('created_at', startOfMonth).not('status', 'in', '("cancelled","rejected")');

  if (agencyId) {
    vehiclesQ = vehiclesQ.eq('agency_id', agencyId);
    availableCarsQ = availableCarsQ.eq('agency_id', agencyId);
    rentedCarsQ = rentedCarsQ.eq('agency_id', agencyId);
    activeRentalsQ = activeRentalsQ.eq('agency_id', agencyId);
    monthlyBookingsQ = monthlyBookingsQ.eq('agency_id', agencyId);
    monthlyRevenueQ = monthlyRevenueQ.eq('agency_id', agencyId);
  }

  const [
    totalCarsRes,
    availableCarsRes,
    rentedCarsRes,
    activeRentalsRes,
    monthlyBookingsRes,
    monthlyRevenueRes,
    newCustomersRes
  ] = await Promise.all([
    vehiclesQ,
    availableCarsQ,
    rentedCarsQ,
    activeRentalsQ,
    monthlyBookingsQ,
    monthlyRevenueQ,
    // newCustomers stays unscoped
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer').gte('created_at', startOfMonth)
  ]);

  const monthlyRevenue = (monthlyRevenueRes.data || []).reduce(
    (sum, item) => sum + (Number(item.total_price) || 0),
    0
  );

  return {
    totalCars: totalCarsRes.count || 0,
    availableCars: availableCarsRes.count || 0,
    rentedCars: rentedCarsRes.count || 0,
    activeRentals: activeRentalsRes.count || 0,
    monthlyBookings: monthlyBookingsRes.count || 0,
    monthlyRevenue: parseFloat(monthlyRevenue.toFixed(2)),
    newCustomers: newCustomersRes.count || 0,
  };
};

module.exports = { getDashboardStats };
