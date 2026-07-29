import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

function CarDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  useEffect(() => {
    const fetchCar = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`http://localhost:4000/vehicles/${id}`);
        
        if (!response.ok) {
          throw new Error('Car not found');
        }

        const data = await response.json();
        setCar(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (error || !car) {
    return <div className="p-8 text-center text-red-600">Car not found</div>;
  }

  const hasImages = car.images && car.images.length > 0;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{car.brand} {car.model}</h1>
      
      {/* Image Gallery */}
      <div className="mb-8 flex overflow-x-auto gap-4 pb-4">
        {hasImages ? (
          car.images.map((img) => {
            const imageUrl = supabase.storage
              .from('vehicle-images')
              .getPublicUrl(img.storage_path).data.publicUrl;
            return (
              <img
                key={img.id || img.storage_path}
                src={imageUrl}
                alt={`${car.brand} ${car.model}`}
                className="w-80 h-56 object-cover rounded shadow-md flex-shrink-0"
              />
            );
          })
        ) : (
          <div className="w-full h-64 bg-gray-200 rounded flex items-center justify-center text-gray-500 font-medium">
            No image
          </div>
        )}
      </div>

      {/* Details */}
      <div className="bg-white p-6 rounded shadow border">
        <h2 className="text-xl font-semibold mb-4">Vehicle Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="font-medium text-gray-600">Year:</span> {car.year}
          </div>
          <div>
            <span className="font-medium text-gray-600">Category:</span> {car.category}
          </div>
          <div>
            <span className="font-medium text-gray-600">Transmission:</span> {car.transmission}
          </div>
          <div>
            <span className="font-medium text-gray-600">Fuel Type:</span> {car.fuel_type}
          </div>
          <div>
            <span className="font-medium text-gray-600">Seats:</span> {car.seats}
          </div>
          <div>
            <span className="font-medium text-gray-600">Daily Price:</span> ${car.daily_price}
          </div>
          <div>
            <span className="font-medium text-gray-600">Status:</span> 
            <span className="ml-2 inline-block px-2 py-1 rounded text-sm bg-gray-100 border border-gray-300">
              {car.status || 'available'}
            </span>
          </div>
        </div>
        
        {car.description && (
          <div className="mt-6 border-t pt-4">
            <h3 className="text-lg font-medium mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-line">{car.description}</p>
          </div>
        )}
      </div>

      {/* Booking Section */}
      <div className="mt-8 bg-white p-6 rounded shadow border">
        <h2 className="text-xl font-semibold mb-4">Book this Vehicle</h2>
        
        {car.status === 'rented' || car.status === 'maintenance' ? (
          <div className="p-4 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded">
            This vehicle is currently unavailable.
          </div>
        ) : (
          <form onSubmit={async (e) => {
            e.preventDefault();
            setBookingError(null);
            setBookingSuccess(null);
            
            if (!startDate || !endDate) {
              setBookingError('Please select both start and end dates.');
              return;
            }

            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
              navigate('/login');
              return;
            }

            try {
              setIsBooking(true);
              const res = await fetch('http://localhost:4000/bookings', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                  vehicle_id: id,
                  start_date: startDate,
                  end_date: endDate
                })
              });

              const data = await res.json();

              if (!res.ok) {
                if (res.status === 409) {
                  throw new Error('This vehicle is already booked for the selected dates.');
                }
                throw new Error(data.error || 'Failed to request booking.');
              }

              setBookingSuccess(`Booking requested! Total: $${data.total_price}`);
              setStartDate('');
              setEndDate('');
            } catch (err) {
              setBookingError(err.message);
            } finally {
              setIsBooking(false);
            }
          }} className="space-y-4">
            
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full border border-gray-300 p-2 rounded"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  required
                  className="w-full border border-gray-300 p-2 rounded"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            {bookingError && (
              <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded">
                {bookingError}
              </div>
            )}
            
            {bookingSuccess && (
              <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded">
                {bookingSuccess}
              </div>
            )}

            <button
              type="submit"
              disabled={isBooking}
              className={`w-full p-2 text-white font-medium rounded ${
                isBooking ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isBooking ? 'Requesting Booking...' : 'Request Booking'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default CarDetail;
