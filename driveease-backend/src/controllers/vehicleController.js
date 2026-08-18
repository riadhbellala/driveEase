const vehicleService = require('../services/vehicleService');

const createVehicle = async (req, res) => {
  try {
    const agencyId = req.user?.agency_id;
    const vehicle = await vehicleService.createVehicle(req.body, agencyId);
    res.status(201).json(vehicle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllVehicles = async (req, res) => {
  try {
    const agencyId = req.user?.agency_id;
    const vehicles = await vehicleService.getAllVehicles(agencyId);
    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMyVehicles = async (req, res) => {
  const agencyId = req.user?.agency_id;
  if (!agencyId) {
    return res.status(400).json({ error: 'No agency associated with this account' });
  }
  try {
    const vehicles = await vehicleService.getAllVehicles(agencyId);
    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getVehicleById = async (req, res) => {
  try {
    const vehicle = await vehicleService.getVehicleById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    res.status(200).json(vehicle);
  } catch (error) {
    // Supabase raises PGRST116 if .single() finds no rows
    if (error.code === 'PGRST116') {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    res.status(500).json({ error: error.message });
  }
};

const updateVehicle = async (req, res) => {
  try {
    const vehicle = await vehicleService.updateVehicle(req.params.id, req.body);
    res.status(200).json(vehicle);
  } catch (error) {
    if (error.code === 'PGRST116') {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    res.status(500).json({ error: error.message });
  }
};

const softDeleteVehicle = async (req, res) => {
  try {
    const vehicle = await vehicleService.softDeleteVehicle(req.params.id);
    res.status(200).json({ message: 'Vehicle deleted successfully', vehicle });
  } catch (error) {
    if (error.code === 'PGRST116') {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    res.status(500).json({ error: error.message });
  }
};

const addVehicleImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { storage_path, sort_order } = req.body;
    const image = await vehicleService.addVehicleImage(id, storage_path, sort_order);
    res.status(201).json(image);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAvailableVehicles = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'start_date and end_date query parameters are required' });
    }
    const vehicles = await vehicleService.getAvailableVehicles(start_date, end_date);
    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createVehicle,
  getAllVehicles,
  getMyVehicles,
  getVehicleById,
  updateVehicle,
  softDeleteVehicle,
  addVehicleImage,
  getAvailableVehicles,
};
