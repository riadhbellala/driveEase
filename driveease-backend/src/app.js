const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health Check Route
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Vehicles Route
const vehiclesRoute = require('./routes/vehicles');
app.use('/vehicles', vehiclesRoute);

// Bookings Route
const bookingsRoute = require('./routes/bookings');
app.use('/bookings', bookingsRoute);

// Notifications Route
const notificationsRoute = require('./routes/notifications');
app.use('/notifications', notificationsRoute);

// Dashboard Route
const dashboardRoute = require('./routes/dashboard');
app.use('/dashboard', dashboardRoute);

// Customers Route
const customersRoute = require('./routes/customers');
app.use('/customers', customersRoute);

module.exports = app;
