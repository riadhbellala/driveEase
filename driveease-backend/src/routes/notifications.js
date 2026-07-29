const express = require('express');
const router = express.Router();
const supabase = require('../config/supabaseClient');
const verifySupabaseJwt = require('../middleware/verifySupabaseJwt');

// GET / - fetch notifications for the authenticated user
router.get('/', verifySupabaseJwt, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return res.json(data || []);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

module.exports = router;
