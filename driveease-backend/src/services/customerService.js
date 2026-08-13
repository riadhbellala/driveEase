const supabase = require('../config/supabaseClient');

const getAllCustomers = async () => {
  const { data, error, status, statusText } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'customer')
    .order('created_at', { ascending: false });

  console.log('[DEBUG getAllCustomers]', { data, error, status, statusText });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const toggleCustomerDisabled = async (customerId, isDisabled) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ is_disabled: isDisabled })
    .eq('id', customerId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

module.exports = {
  getAllCustomers,
  toggleCustomerDisabled,
};
