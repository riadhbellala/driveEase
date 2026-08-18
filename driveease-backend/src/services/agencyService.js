const supabase = require('../config/supabaseClient');

const registerAgency = async (userId, agencyName, agencySlug) => {
  // 1. Fetch current profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, agency_id')
    .eq('id', userId)
    .single();

  if (profileError || !profile) {
    throw new Error('User profile not found');
  }

  // 2. Check if already associated with an agency
  if (profile.role === 'agency_owner' || profile.role === 'agency_staff') {
    throw new Error('This account is already associated with an agency and cannot register a new one.');
  }

  // 3. Insert new agency
  const { data: agency, error: agencyError } = await supabase
    .from('agencies')
    .insert({
      name: agencyName,
      slug: agencySlug,
      website_enabled: false,
    })
    .select()
    .single();

  if (agencyError) {
    if (agencyError.code === '23505') { // unique constraint violation
      throw new Error('That agency name/slug is already taken.');
    }
    throw agencyError;
  }

  // 4. Update the profiles row for userId
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      role: 'agency_owner',
      agency_id: agency.id
    })
    .eq('id', userId);

  if (updateError) {
    throw updateError;
  }

  return agency;
};

const getMyAgency = async (agencyId) => {
  const { data: agency, error } = await supabase
    .from('agencies')
    .select('id, name, slug, website_enabled, created_at')
    .eq('id', agencyId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return agency;
};

const toggleWebsiteEnabled = async (agencyId, enabled) => {
  const { data: agency, error } = await supabase
    .from('agencies')
    .update({ website_enabled: enabled })
    .eq('id', agencyId)
    .select('id, name, slug, website_enabled, created_at')
    .single();

  if (error) throw error;
  return agency;
};

module.exports = {
  registerAgency,
  getMyAgency,
  toggleWebsiteEnabled,
};
