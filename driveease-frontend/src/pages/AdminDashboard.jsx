import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const res = await fetch('http://localhost:4000/dashboard', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (!res.ok) {
          throw new Error('Failed to fetch dashboard statistics');
        }

        const data = await res.json();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading dashboard statistics...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">Error: {error}</div>;
  }

  const statItems = [
    { label: 'Total Cars', value: stats?.totalCars ?? 0 },
    { label: 'Available Cars', value: stats?.availableCars ?? 0 },
    { label: 'Rented Cars', value: stats?.rentedCars ?? 0 },
    { label: 'Active Rentals', value: stats?.activeRentals ?? 0 },
    { label: 'Monthly Bookings', value: stats?.monthlyBookings ?? 0 },
    { label: 'Monthly Revenue', value: `$${stats?.monthlyRevenue ?? 0}` },
    { label: 'New Customers', value: stats?.newCustomers ?? 0 },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {statItems.map((item) => (
          <div key={item.label} className="bg-white p-6 rounded border shadow-sm flex flex-col justify-between">
            <span className="text-sm font-medium text-gray-500">{item.label}</span>
            <span className="text-3xl font-bold text-gray-900 mt-2">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;
