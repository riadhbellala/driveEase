const supabase = require('../config/supabaseClient');

const verifySupabaseJwt = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_disabled')
      .eq('id', user.id)
      .single();

    if (profile?.is_disabled) {
      return res.status(401).json({ error: 'This account has been disabled.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = verifySupabaseJwt;
