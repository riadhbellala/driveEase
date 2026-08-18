const supabase = require('../config/supabaseClient');

const createVehicle = async (data, agencyId) => {
  if (agencyId) {
    data.agency_id = agencyId;
  }
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

const getAllVehicles = async (agencyId) => {
  let query = supabase.from('vehicles');
  
  if (agencyId) {
    query = query
      .select('*')
      .is('deleted_at', null)
      .eq('agency_id', agencyId);
  } else {
    query = query
      .select('*, agencies!inner(website_enabled)')
      .is('deleted_at', null)
      .eq('agencies.website_enabled', true);
  }

  const { data: vehicles, error } = await query;
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
    .select('*, agencies!inner(website_enabled)')
    .eq('id', id)
    .is('deleted_at', null)
    .eq('agencies.website_enabled', true)
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

  let activeAgencies = new Set();
  const agencyIds = [...new Set((vehicles || []).map(v => v.agency_id))];
  
  if (agencyIds.length > 0) {
    const { data: agencies, error: agenciesError } = await supabase
      .from('agencies')
      .select('id')
      .in('id', agencyIds)
      .eq('website_enabled', true);
      
    if (!agenciesError && agencies) {
      activeAgencies = new Set(agencies.map(a => a.id));
    }
  }

  const filteredVehicles = (vehicles || []).filter(v => activeAgencies.has(v.agency_id));

  const vehiclesWithImages = await Promise.all(
    filteredVehicles.map(async (vehicle) => {
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
