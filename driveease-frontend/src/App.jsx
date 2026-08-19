import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import carLogo from '../assets/logo.webp';
import { supabase } from './lib/supabaseClient';
import GradientButton from './components/ui/gradient-button';
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
import AdminVehiclesList from './pages/AdminVehiclesList';
import AdminEditVehicle from './pages/AdminEditVehicle';
import AdminCustomers from './pages/AdminCustomers';

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

function LogOutButton() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 text-xs font-semibold rounded-full border border-[#D8D4C8] text-[#0B0D10] hover:bg-[#0B0D10] hover:text-[#F7F5F0] transition-all font-body"
    >
      Log Out
    </button>
  );
}

function HeaderNav() {
  const [session, setSession] = useState(null);
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isHidden = ['/', '/login', '/register'].includes(location.pathname) || location.pathname.startsWith('/admin');
  if (isHidden) {
    return null;
  }

  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <header className="pointer-events-auto bg-white/40 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-full px-6 py-3 flex items-center justify-between w-full max-w-5xl transition-all">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center group shrink-0">
          <img src={carLogo} alt="Drivo Logo" className="h-9 w-auto object-contain transition-transform group-hover:scale-105" />
        </Link>

        {/* Navigation Pills */}
        <nav className="hidden md:flex items-center space-x-1 bg-white/30 backdrop-blur-md p-1.5 rounded-full shadow-inner border border-white/30">
          {[
            { to: '/', label: 'Home' },
            { to: '/cars', label: 'Cars Fleet' },
            { to: '/my-bookings', label: 'My Bookings' },
          ].map(({ to, label }) => {
            const isActive = to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`px-4 py-1.5 text-xs font-semibold rounded-full font-body transition-colors ${
                  isActive
                    ? 'bg-[#0B0D10] text-[#F7F5F0] shadow-md'
                    : 'text-[#0B0D10]/70 hover:text-[#0B0D10] hover:bg-white/50'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Auth / Action Area */}
        <div className="flex items-center space-x-3 shrink-0">
          {session ? (
            <>
              <NotificationBell />
              <LogOutButton />
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-5 py-2 text-xs font-semibold rounded-full border border-white/60 bg-white/40 text-[#0B0D10] hover:bg-white/80 transition-all font-body shadow-sm"
              >
                Log In
              </Link>
              <GradientButton
                onClick={() => window.location.href = '/register'}
                width="110px"
                height="36px"
              >
                Register
              </GradientButton>
            </>
          )}
        </div>
      </header>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <BfCacheHandler />
      <div className="min-h-screen bg-[#FAFAF9] flex flex-col font-body selection:bg-[#2955F5] selection:text-[#FAFAF9]">
        <HeaderNav />

        {/* Main Content */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/cars" element={<CarsList />} />
            <Route path="/cars/:id" element={<CarDetail />} />
            
            <Route element={<RequireAuth />}>
              <Route path="/my-bookings" element={<MyBookings />} />
              
              <Route element={<RequireAdmin />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/customers" element={<AdminCustomers />} />
                <Route path="/admin/vehicles" element={<AdminVehiclesList />} />
                <Route path="/admin/vehicles/new" element={<AdminAddVehicle />} />
                <Route path="/admin/vehicles/:id/edit" element={<AdminEditVehicle />} />
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
