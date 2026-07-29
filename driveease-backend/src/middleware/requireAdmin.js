const supabase = require('../config/supabaseClient');

const requireAdmin = async (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (error || !profile || profile.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error checking admin status' });
  }
};

module.exports = requireAdmin;
