const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
const corsOptions = {
  origin: [
    'http://localhost:5173',           // web app local dev
    'http://localhost:5174',           // electron renderer local dev (adjust if different)
    'https://YOUR-VERCEL-DOMAIN.vercel.app',  // web app production (update once deployed)
    null                                // Electron packaged app (file:// origin)
  ],
  credentials: true
};

app.use(cors(corsOptions));
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

// Agencies Route
const agenciesRoute = require('./routes/agencies');
app.use('/agencies', agenciesRoute);

module.exports = app;
