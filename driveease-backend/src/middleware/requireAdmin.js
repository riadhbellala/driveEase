const supabase = require('../config/supabaseClient');

const requireAdmin = async (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role, agency_id')
      .eq('id', req.user.id)
      .single();

    if (error || !profile || (profile.role !== 'agency_owner' && profile.role !== 'agency_staff')) {
      return res.status(403).json({ error: 'Agency staff or owner access required' });
    }

    req.user.agency_id = profile.agency_id;
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error checking admin status' });
  }
};

module.exports = requireAdmin;
