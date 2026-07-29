import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchAllBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch('http://localhost:4000/bookings/admin/all', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!res.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const data = await res.json();
      setBookings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllBookings();
  }, []);

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      setUpdatingId(bookingId);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`http://localhost:4000/bookings/admin/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ newStatus })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update status');
      }

      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: data.status || newStatus } : b))
      );
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading all bookings...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Manage All Bookings</h1>

      {bookings.length === 0 ? (
        <div className="text-center py-8 bg-white border rounded shadow-sm text-gray-500">
          No bookings found in the system.
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const customerName = booking.profiles?.full_name || booking.customer_id;
            const vehicleInfo = booking.vehicles
              ? `${booking.vehicles.brand} ${booking.vehicles.model}`
              : 'Unknown Vehicle';

            return (
              <div
                key={booking.id}
                className="bg-white p-4 border rounded shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4"
              >
                <div>
                  <h2 className="text-lg font-semibold">{vehicleInfo}</h2>
                  <p className="text-sm text-gray-600">Customer: <span className="font-medium">{customerName}</span></p>
                  <p className="text-sm text-gray-600">
                    Dates: {new Date(booking.start_date).toLocaleDateString()} to {new Date(booking.end_date).toLocaleDateString()}
                  </p>
                  <p className="text-sm font-medium mt-1">Total: ${booking.total_price}</p>
                  <div className="mt-2 inline-block px-2 py-1 bg-gray-100 border text-xs font-medium rounded capitalize">
                    Status: {booking.status}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {booking.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(booking.id, 'approved')}
                        disabled={updatingId === booking.id}
                        className="px-3 py-1.5 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(booking.id, 'rejected')}
                        disabled={updatingId === booking.id}
                        className="px-3 py-1.5 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {booking.status === 'approved' && (
                    <button
                      onClick={() => handleUpdateStatus(booking.id, 'active')}
                      disabled={updatingId === booking.id}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                      Mark Active
                    </button>
                  )}

                  {booking.status === 'active' && (
                    <button
                      onClick={() => handleUpdateStatus(booking.id, 'completed')}
                      disabled={updatingId === booking.id}
                      className="px-3 py-1.5 bg-purple-600 text-white rounded text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
                    >
                      Mark Completed
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AdminBookings;
