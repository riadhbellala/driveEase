import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CarsList from './pages/CarsList';
import CarDetail from './pages/CarDetail';
import AdminAddVehicle from './pages/AdminAddVehicle';
import NotificationBell from './components/NotificationBell';
import RequireAuth from './components/RequireAuth';
import RequireAdmin from './components/RequireAdmin';
import MyBookings from './pages/MyBookings';
import AdminBookings from './pages/AdminBookings';
import AdminDashboard from './pages/AdminDashboard';

function BfCacheHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const handlePageShow = async (event) => {
      if (event.persisted) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/login', { replace: true });
        }
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, [navigate]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <BfCacheHandler />
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Global Header */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-blue-600">DriveEase</Link>
          <div className="flex items-center space-x-4">
            <Link to="/cars" className="text-gray-600 hover:text-gray-900">Cars</Link>
            <Link to="/my-bookings" className="text-gray-600 hover:text-gray-900">My Bookings</Link>
            <NotificationBell />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route element={<RequireAuth />}>
              <Route path="/cars" element={<CarsList />} />
              <Route path="/cars/:id" element={<CarDetail />} />
              <Route path="/my-bookings" element={<MyBookings />} />
              
              <Route element={<RequireAdmin />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/vehicles/new" element={<AdminAddVehicle />} />
                <Route path="/admin/bookings" element={<AdminBookings />} />
              </Route>
            </Route>
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
