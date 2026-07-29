const supabase = require('../config/supabaseClient');

const getDashboardStats = async () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [
    totalCarsRes,
    availableCarsRes,
    rentedCarsRes,
    activeRentalsRes,
    monthlyBookingsRes,
    monthlyRevenueRes,
    newCustomersRes
  ] = await Promise.all([
    // totalCars
    supabase.from('vehicles').select('*', { count: 'exact', head: true }).is('deleted_at', null),
    // availableCars
    supabase.from('vehicles').select('*', { count: 'exact', head: true }).is('deleted_at', null).eq('status', 'available'),
    // rentedCars
    supabase.from('vehicles').select('*', { count: 'exact', head: true }).is('deleted_at', null).eq('status', 'rented'),
    // activeRentals
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    // monthlyBookings
    supabase.from('bookings').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth),
    // monthlyRevenue
    supabase.from('bookings').select('total_price').gte('created_at', startOfMonth).not('status', 'in', '("cancelled","rejected")'),
    // newCustomers
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
