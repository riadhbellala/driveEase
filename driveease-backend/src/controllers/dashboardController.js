const dashboardService = require('../services/dashboardService');

const getDashboardStats = async (req, res) => {
  try {
    const agencyId = req.user?.agency_id;
    const stats = await dashboardService.getDashboardStats(agencyId);
    return res.status(200).json(stats);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { getDashboardStats };
