import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

function CarsList() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [transmissionFilter, setTransmissionFilter] = useState('All');
  const [fuelTypeFilter, setFuelTypeFilter] = useState('All');

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('http://localhost:4000/vehicles');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch vehicles: ${response.statusText}`);
        }

        const data = await response.json();
        setVehicles(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">Error: {error}</div>;
  }

  if (!vehicles || vehicles.length === 0) {
    return <div className="p-8 text-center">No cars available yet</div>;
  }

  const categories = ['All', ...new Set(vehicles.map((v) => v.category).filter(Boolean))];

  const filteredVehicles = vehicles.filter((car) => {
    const matchesSearch =
      (car.brand && car.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (car.model && car.model.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'All' || car.category === categoryFilter;
    const matchesTransmission = transmissionFilter === 'All' || car.transmission === transmissionFilter;
    const matchesFuelType = fuelTypeFilter === 'All' || car.fuel_type === fuelTypeFilter;

    return matchesSearch && matchesCategory && matchesTransmission && matchesFuelType;
  });

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Cars List</h1>
      
      <div className="mb-6 bg-gray-50 p-4 rounded border flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            type="text"
            className="w-full border border-gray-300 p-2 rounded bg-white"
            placeholder="Brand or model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            className="w-full border border-gray-300 p-2 rounded bg-white"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Transmission</label>
          <select
            className="w-full border border-gray-300 p-2 rounded bg-white"
            value={transmissionFilter}
            onChange={(e) => setTransmissionFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="automatic">automatic</option>
            <option value="manual">manual</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
          <select
            className="w-full border border-gray-300 p-2 rounded bg-white"
            value={fuelTypeFilter}
            onChange={(e) => setFuelTypeFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="petrol">petrol</option>
            <option value="diesel">diesel</option>
            <option value="electric">electric</option>
            <option value="hybrid">hybrid</option>
          </select>
        </div>
      </div>

      {filteredVehicles.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No cars match your criteria.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredVehicles.map((car) => {
          const hasImage = car.images && car.images.length > 0;
          const imageUrl = hasImage
            ? supabase.storage.from('vehicle-images').getPublicUrl(car.images[0].storage_path).data.publicUrl
            : null;

          return (
            <Link to={`/cars/${car.id}`} key={car.id || car.brand + car.model} className="border p-4 rounded shadow-sm flex flex-col block hover:shadow-md transition-shadow">
              {hasImage ? (
                <img
                  src={imageUrl}
                  alt={`${car.brand} ${car.model}`}
                  className="w-full h-48 object-cover rounded mb-3"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 rounded mb-3 flex items-center justify-center text-gray-500 font-medium">
                  No image
                </div>
              )}
              <h2 className="text-xl font-semibold">{car.brand} {car.model}</h2>
              <p className="text-gray-600">Year: {car.year}</p>
              <p className="text-gray-800 font-medium">Daily Price: ${car.daily_price}</p>
            </Link>
          );
        })}
        </div>
      )}
    </div>
  );
}

export default CarsList;
