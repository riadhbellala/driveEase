const supabase = require('../config/supabaseClient');

const createVehicle = async (data) => {
  const { data: vehicle, error } = await supabase
    .from('vehicles')
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return vehicle;
};

const getVehicleImages = async (vehicleId) => {
  const { data: images, error } = await supabase
    .from('vehicle_images')
    .select('*')
    .eq('vehicle_id', vehicleId)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return images || [];
};

const getAllVehicles = async () => {
  const { data: vehicles, error } = await supabase
    .from('vehicles')
    .select('*')
    .is('deleted_at', null);
  if (error) throw error;

  const vehiclesWithImages = await Promise.all(
    vehicles.map(async (vehicle) => {
      const images = await getVehicleImages(vehicle.id);
      return { ...vehicle, images };
    })
  );

  return vehiclesWithImages;
};

const getVehicleById = async (id) => {
  const { data: vehicle, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single();
  if (error) throw error;

  const images = await getVehicleImages(id);
  return { ...vehicle, images };
};

const updateVehicle = async (id, data) => {
  const { data: vehicle, error } = await supabase
    .from('vehicles')
    .update(data)
    .eq('id', id)
    .is('deleted_at', null)
    .select()
    .single();
  if (error) throw error;
  return vehicle;
};

const softDeleteVehicle = async (id) => {
  const { data: vehicle, error } = await supabase
    .from('vehicles')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .is('deleted_at', null)
    .select()
    .single();
  if (error) throw error;
  return vehicle;
};

const addVehicleImage = async (vehicleId, storagePath, sortOrder) => {
  const { data: image, error } = await supabase
    .from('vehicle_images')
    .insert({
      vehicle_id: vehicleId,
      storage_path: storagePath,
      sort_order: sortOrder,
    })
    .select()
    .single();
  if (error) throw error;
  return image;
};

const getAvailableVehicles = async (startDate, endDate) => {
  const { data: vehicles, error } = await supabase.rpc('get_available_vehicles', {
    p_start_date: startDate,
    p_end_date: endDate,
  });
  if (error) throw error;

  const vehiclesWithImages = await Promise.all(
    (vehicles || []).map(async (vehicle) => {
      const images = await getVehicleImages(vehicle.id);
      return { ...vehicle, images };
    })
  );

  return vehiclesWithImages;
};

module.exports = {
  createVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  softDeleteVehicle,
  addVehicleImage,
  getVehicleImages,
  getAvailableVehicles,
};
