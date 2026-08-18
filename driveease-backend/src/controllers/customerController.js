const customerService = require('../services/customerService');

const getAgencyCustomers = async (req, res) => {
  try {
    const agencyId = req.user?.agency_id;
    const customers = await customerService.getAgencyCustomers(agencyId);
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAgencyCustomers,
};
