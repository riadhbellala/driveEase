import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelingId, setCancelingId] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch('http://localhost:4000/bookings', {
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

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      setCancelingId(bookingId);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const res = await fetch(`http://localhost:4000/bookings/${bookingId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to cancel booking');
      }
      
      // Update local state directly so UI reflects change immediately
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: data.status || 'cancelled' } : b))
      );
    } catch (err) {
      alert(err.message);
    } finally {
      setCancelingId(null);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading your bookings...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Bookings</h1>
      
      {bookings.length === 0 ? (
        <div className="text-center py-8 bg-white border rounded shadow-sm text-gray-500">
          You have no bookings yet.
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white p-4 border rounded shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <h2 className="text-lg font-semibold">
                  {booking.vehicles?.brand} {booking.vehicles?.model}
                </h2>
                <p className="text-sm text-gray-600">
                  {new Date(booking.start_date).toLocaleDateString()} to {new Date(booking.end_date).toLocaleDateString()}
                </p>
                <p className="text-sm font-medium mt-1">Total: ${booking.total_price}</p>
                <div className="mt-2 inline-block px-2 py-1 bg-gray-100 border text-xs font-medium rounded capitalize">
                  Status: {booking.status}
                </div>
              </div>
              
              {(booking.status === 'pending' || booking.status === 'approved') && (
                <div>
                  <button
                    onClick={() => handleCancel(booking.id)}
                    disabled={cancelingId === booking.id}
                    className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded font-medium disabled:opacity-50"
                  >
                    {cancelingId === booking.id ? 'Canceling...' : 'Cancel Booking'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyBookings;
