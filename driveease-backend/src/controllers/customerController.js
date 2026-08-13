const customerService = require('../services/customerService');

const getAllCustomers = async (req, res) => {
  try {
    const customers = await customerService.getAllCustomers();
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const toggleCustomerDisabled = async (req, res) => {
  try {
    const { id } = req.params;
    const { isDisabled } = req.body;
    
    if (typeof isDisabled !== 'boolean') {
      return res.status(400).json({ error: 'isDisabled must be a boolean' });
    }

    const updatedCustomer = await customerService.toggleCustomerDisabled(id, isDisabled);
    res.status(200).json(updatedCustomer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllCustomers,
  toggleCustomerDisabled,
};
