const agencyService = require('../services/agencyService');

const registerAgency = async (req, res) => {
  try {
    const { agency_name, agency_slug } = req.body;
    const userId = req.user.id;

    if (!agency_name || !agency_slug) {
      return res.status(400).json({ error: 'agency_name and agency_slug are required' });
    }

    const agency = await agencyService.registerAgency(userId, agency_name, agency_slug);
    return res.status(201).json(agency);

  } catch (error) {
    if (error.message === 'This account is already associated with an agency and cannot register a new one.') {
      return res.status(409).json({ error: error.message });
    }
    if (error.message === 'That agency name/slug is already taken.') {
      return res.status(409).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message });
  }
};

const getMyAgency = async (req, res) => {
  const agencyId = req.user?.agency_id;
  if (!agencyId) {
    return res.status(400).json({ error: 'No agency associated with this account' });
  }
  try {
    const agency = await agencyService.getMyAgency(agencyId);
    if (!agency) {
      return res.status(404).json({ error: 'Agency not found' });
    }
    return res.status(200).json(agency);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const toggleWebsiteEnabled = async (req, res) => {
  const agencyId = req.user?.agency_id;
  const { enabled } = req.body;
  
  if (!agencyId) {
    return res.status(400).json({ error: 'No agency associated with this account' });
  }
  if (typeof enabled !== 'boolean') {
    return res.status(400).json({ error: 'enabled boolean is required' });
  }
  
  try {
    const agency = await agencyService.toggleWebsiteEnabled(agencyId, enabled);
    return res.status(200).json(agency);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  registerAgency,
  getMyAgency,
  toggleWebsiteEnabled,
};
