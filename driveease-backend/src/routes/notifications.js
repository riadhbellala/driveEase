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

    if (error) throw error;

    return res.json(data || []);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// PATCH /:id/read - mark a single notification as read
router.patch('/:id/read', verifySupabaseJwt, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', req.user.id) // security: users can only mark their own
      .select()
      .single();

    if (error) throw error;

    return res.json(data);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// PATCH /read-all - mark ALL notifications as read for the authenticated user
router.patch('/read-all', verifySupabaseJwt, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', req.user.id)
      .eq('is_read', false)
      .select();

    if (error) throw error;

    return res.json({ updated: data?.length || 0 });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return res.status(500).json({ error: 'Failed to mark all as read' });
  }
});

module.exports = router;
