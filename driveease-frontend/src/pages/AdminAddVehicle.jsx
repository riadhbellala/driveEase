import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const initialForm = {
  brand: '',
  model: '',
  year: '',
  registration_number: '',
  category: '',
  transmission: 'automatic',
  fuel_type: 'petrol',
  seats: '',
  daily_price: '',
  description: '',
};

function AdminAddVehicle() {
  const [formData, setFormData] = useState(initialForm);
  const [imageFiles, setImageFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError(null);
    setUploadStatus('');

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('Not authenticated. Please log in first.');
      }

      const payload = {
        ...formData,
        year: formData.year ? parseInt(formData.year, 10) : undefined,
        seats: formData.seats ? parseInt(formData.seats, 10) : undefined,
        daily_price: formData.daily_price ? parseFloat(formData.daily_price) : undefined,
      };

      // Step 1: Create vehicle row
      const response = await fetch('http://localhost:4000/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      const resData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(resData.error || `Error ${response.status}: ${response.statusText}`);
      }

      const vehicleId = resData.id;

      // Step 2: Upload images if any
      if (imageFiles.length > 0 && vehicleId) {
        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i];
          setUploadStatus(`Uploading image ${i + 1} of ${imageFiles.length}...`);

          const storagePath = `${vehicleId}/${file.name}`;
          const { data: storageData, error: uploadError } = await supabase.storage
            .from('vehicle-images')
            .upload(storagePath, file, { upsert: true });

          if (uploadError) {
            throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
          }

          // Step 3: Register image in backend API
          const imgResponse = await fetch(`http://localhost:4000/vehicles/${vehicleId}/images`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              storage_path: storageData.path,
              sort_order: i,
            }),
          });

          if (!imgResponse.ok) {
            const imgResData = await imgResponse.json().catch(() => ({}));
            throw new Error(imgResData.error || `Failed to record image metadata for ${file.name}`);
          }
        }
      }

      setMessage('Vehicle and images added successfully!');
      setFormData(initialForm);
      setImageFiles([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setUploadStatus('');
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Add New Vehicle (Admin)</h1>

      {message && <div className="p-3 mb-4 text-green-700 bg-green-100 rounded">{message}</div>}
      {error && <div className="p-3 mb-4 text-red-700 bg-red-100 rounded">{error}</div>}
      {uploadStatus && <div className="p-3 mb-4 text-blue-700 bg-blue-100 rounded">{uploadStatus}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Brand</label>
          <input
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Model</label>
          <input
            type="text"
            name="model"
            value={formData.model}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Year</label>
          <input
            type="number"
            name="year"
            value={formData.year}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Registration Number</label>
          <input
            type="text"
            name="registration_number"
            value={formData.registration_number}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Category</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Transmission</label>
          <select
            name="transmission"
            value={formData.transmission}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="automatic">automatic</option>
            <option value="manual">manual</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Fuel Type</label>
          <select
            name="fuel_type"
            value={formData.fuel_type}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="petrol">petrol</option>
            <option value="diesel">diesel</option>
            <option value="electric">electric</option>
            <option value="hybrid">hybrid</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Seats</label>
          <input
            type="number"
            name="seats"
            value={formData.seats}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Daily Price ($)</label>
          <input
            type="number"
            step="0.01"
            name="daily_price"
            value={formData.daily_price}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Vehicle Images</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="w-full border p-2 rounded"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-600 text-white rounded font-semibold disabled:opacity-50"
        >
          {loading ? (uploadStatus || 'Submitting...') : 'Add Vehicle'}
        </button>
      </form>
    </div>
  );
}

export default AdminAddVehicle;
