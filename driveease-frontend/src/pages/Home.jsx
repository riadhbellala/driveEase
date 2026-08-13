import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import carLogo from '../assets/carlogo.png';
import { supabase } from '../lib/supabaseClient';
import { Search, CalendarDays, Key, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import MotionButton from '../components/ui/motion-button';
import GradientButton from '../components/ui/gradient-button';
import Footer from '../components/Footer';

function Home() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
        setIsAdmin(profile?.role === 'admin');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
        setIsAdmin(profile?.role === 'admin');
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // For interactive "How to Book" section
  const [activeBookingStep, setActiveBookingStep] = useState(0);

  const bookingSteps = [
    {
      id: '01',
      title: 'Browse the Collection',
      desc: 'Explore our curated fleet of luxury and performance vehicles to find your perfect match.',
      image: '/images/hero_suv.png'
    },
    {
      id: '02',
      title: 'Select Dates & Preferences',
      desc: 'Choose your rental period and specify any tailored options to elevate your experience.',
      image: '/images/hero_sedan.png'
    },
    {
      id: '03',
      title: 'Confirm & Drive',
      desc: 'Finalize your reservation securely. Your vehicle will be prepped and waiting for you.',
      image: '/images/hero_sports.png'
    }
  ];

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [transmissionFilter, setTransmissionFilter] = useState('All');
  const [fuelTypeFilter, setFuelTypeFilter] = useState('All');

  // Fetch featured cars from database for the homepage
  const [featuredCars, setFeaturedCars] = useState([]);
  const carouselRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    fetch('http://localhost:4000/vehicles')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setFeaturedCars(data);
        }
      })
      .catch(() => {});
  }, []);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -380, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 380, behavior: 'smooth' });
    }
  };

  const handleCarouselScroll = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      const maxScroll = scrollWidth - clientWidth;
      if (maxScroll > 0) {
        const ratio = scrollLeft / maxScroll;
        const index = Math.min(
          Math.floor(ratio * featuredCars.length),
          featuredCars.length - 1
        );
        setActiveSlide(index);
      }
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setError(null);

    if (!startDate || !endDate) {
      setError('Please select both start and end dates.');
      return;
    }

    if (endDate <= startDate) {
      setError('End date must be after start date.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:4000/vehicles/available?start_date=${startDate}&end_date=${endDate}`
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to fetch available vehicles');
      }

      const data = await res.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Dynamically populate categories from fetched results
  const categories = ['All', ...new Set((results || []).map((v) => v.category).filter(Boolean))];

  // Apply client-side filters to the fetched date-available vehicles
  const filteredResults = (results || []).filter((car) => {
    const searchString = `${car.brand} ${car.model}`.toLowerCase();
    const matchesSearch = !searchQuery || searchString.includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || car.category === categoryFilter;
    const matchesTransmission = transmissionFilter === 'All' || car.transmission === transmissionFilter;
    const matchesFuelType = fuelTypeFilter === 'All' || car.fuel_type === fuelTypeFilter;
    return matchesSearch && matchesCategory && matchesTransmission && matchesFuelType;
  });

  return (
    <div className="min-h-screen font-body flex flex-col bg-[#FAFAF9]">
      
      {/* HERO WRAPPER WITH BACKGROUND */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 0.8 }}
        className="relative w-full bg-[url('/images/luxury_interior.png')] bg-cover bg-center p-3 sm:p-6 md:p-8 flex flex-col items-center justify-center pt-6 pb-4"
      >
        {/* FLOATING MAIN WHITE CONTAINER CARD (MATCHING PHOTO LAYOUT) */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="bg-white/95 backdrop-blur-xl rounded-[32px] sm:rounded-[44px] shadow-2xl border border-white/60 max-w-[1240px] w-full p-6 sm:p-10 md:p-12 space-y-10 my-4 text-[#0B0D10]"
        >
        


        {/* INTERNAL HEADER NAVIGATION (RESTORED TOP BAR WITH NEW COLORS) */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 pb-4 border-b border-[#D8D4C8]">
          {/* Logo & Main Nav Pills */}
          <div className="flex items-center space-x-6 w-full lg:w-auto justify-between lg:justify-start">
            <Link to="/" className="flex items-center group">
              <img src={carLogo} alt="DriveEase Logo" className="h-10 w-auto object-contain transition-transform group-hover:scale-105" />
            </Link>

            {/* Nav Pills */}
            <nav className="flex items-center space-x-2">
              <Link
                to="/"
                className="px-5 py-2 text-xs font-semibold rounded-full bg-[#0B0D10] text-[#F7F5F0] transition-colors"
              >
                Home
              </Link>
              <Link
                to="/cars"
                className="px-5 py-2 text-xs font-medium rounded-full border border-[#D8D4C8] text-[#0B0D10]/80 hover:bg-[#D8D4C8]/30 transition-colors"
              >
                Cars
              </Link>
              <Link
                to="/my-bookings"
                className="px-5 py-2 text-xs font-medium rounded-full border border-[#D8D4C8] text-[#0B0D10]/80 hover:bg-[#D8D4C8]/30 transition-colors"
              >
                My Bookings
              </Link>
            </nav>
          </div>

          {/* Right Search Input & Auth Buttons */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
            <div className="relative flex-1 sm:w-56">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#0B0D10]/40 text-xs">
                🔍
              </span>
              <input
                type="text"
                placeholder="Search car..."
                onClick={() => navigate('/cars')}
                className="w-full pl-8 pr-4 py-2 bg-[#F7F5F0] border border-[#D8D4C8] rounded-full text-xs font-body text-[#0B0D10] focus:outline-none cursor-pointer"
              />
            </div>
            {session ? (
              <>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="px-5 py-2 text-xs font-semibold rounded-full bg-[#0B0D10] text-[#F7F5F0] hover:bg-[#E8542E] transition-colors shadow-sm flex items-center gap-1.5"
                  >
                    <span>🛡️</span> Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    setSession(null);
                    setIsAdmin(false);
                    navigate('/login');
                  }}
                  className="px-5 py-2 text-xs font-medium rounded-full border border-[#D8D4C8] text-[#0B0D10] hover:bg-[#D8D4C8]/30 transition-colors"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2 text-xs font-medium rounded-full border border-[#D8D4C8] text-[#0B0D10] hover:bg-[#D8D4C8]/30 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 text-xs font-semibold rounded-full bg-[#E8542E] text-[#F7F5F0] hover:bg-[#E8542E]/90 transition-colors shadow-sm"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>

        {/* HERO TOP GRID (EXACT 2-COLUMN LAYOUT FROM PHOTO) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
          
          {/* LEFT COLUMN: HUGE HEADLINE */}
          <div className="lg:col-span-7">
            <h1 className="font-display font-bold text-4xl sm:text-6xl md:text-7xl lg:text-7xl leading-[1.04] text-[#0B0D10] tracking-tight">
              Luxury cars <br />
              &amp; premium <br />
              <span className="text-[#E8542E]">rentals</span>
            </h1>
          </div>

          {/* RIGHT COLUMN: DESCRIPTION, METADATA, & BUTTONS */}
          <div className="lg:col-span-5 space-y-6 lg:pl-6">
            <p className="font-body text-[#0B0D10]/75 text-base sm:text-lg leading-relaxed">
              Our fleet immerses you in the beauty of performance and comfort. Enjoy your journey with unique luxury vehicle choices.
            </p>

            <div className="space-y-1.5 font-body text-xs text-[#0B0D10]/60">
              <div className="font-data font-semibold text-[#0B0D10]/40 uppercase tracking-widest">
                Since 2026
              </div>
              <div className="flex items-center space-x-2 font-medium text-[#0B0D10]">
                <span>📍 DriveEase</span>
              </div>
              <p className="text-[#0B0D10]/70">
                Premium fleet situated in prime spots with scenic views.
              </p>
            </div>

            {/* BUTTONS (MATCHING PHOTO STYLING) */}
            <div className="flex items-center space-x-3 pt-2">
              <a href="#availability-search">
                <MotionButton label="Book now" classes="w-48" />
              </a>
            </div>
          </div>
        </div>

        {/* AVAILABILITY SEARCH BAR FORM */}
        <div id="availability-search" className="w-full flex justify-center pt-8 pb-4">
          <div className="w-full max-w-[1200px] flex flex-col space-y-3">
            <form onSubmit={handleSearch} className="w-full bg-white border border-[#E5E2DA] rounded-[32px] md:rounded-full shadow-lg p-2 flex flex-col md:flex-row items-center justify-between divide-y md:divide-y-0 md:divide-x divide-[#E5E2DA]">
              
              {/* Search Input */}
              <div className="flex-1 flex items-center px-4 py-3 min-w-[220px] w-full md:w-auto">
                <div className="w-10 h-10 rounded-full border border-[#E5E2DA] flex items-center justify-center text-[#0B0D10]/50 mr-3 shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="4" y1="21" x2="4" y2="14"></line>
                    <line x1="4" y1="10" x2="4" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12" y2="3"></line>
                    <line x1="20" y1="21" x2="20" y2="16"></line>
                    <line x1="20" y1="12" x2="20" y2="3"></line>
                    <line x1="1" y1="14" x2="7" y2="14"></line>
                    <line x1="9" y1="8" x2="15" y2="8"></line>
                    <line x1="17" y1="16" x2="23" y2="16"></line>
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search brand or model..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-sm font-body text-[#0B0D10] focus:outline-none placeholder:text-[#0B0D10]/40 font-medium"
                />
              </div>

              {/* Dates (Start & End) */}
              <div className="flex flex-row items-center w-full md:w-auto">
                <div className="flex flex-col justify-center px-4 py-3 w-1/2 md:w-auto">
                  <label className="text-[9px] font-bold uppercase tracking-[0.08em] text-[#0B0D10]/40 font-body mb-0.5">Start Date</label>
                  <input
                    type="date"
                    min={today}
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-transparent text-sm font-semibold text-[#0B0D10] focus:outline-none cursor-pointer w-full"
                  />
                </div>
                <div className="h-10 w-[1px] bg-[#E5E2DA] hidden md:block mx-2"></div>
                <div className="flex flex-col justify-center px-4 py-3 w-1/2 md:w-auto border-l md:border-l-0 border-[#E5E2DA]">
                  <label className="text-[9px] font-bold uppercase tracking-[0.08em] text-[#0B0D10]/40 font-body mb-0.5">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-transparent text-sm font-semibold text-[#0B0D10] focus:outline-none cursor-pointer w-full"
                  />
                </div>
              </div>

              {/* Category Dropdown */}
              <div className="flex flex-col justify-center px-4 py-3 w-full md:w-auto min-w-[130px]">
                <label className="text-[9px] font-bold uppercase tracking-[0.08em] text-[#0B0D10]/40 font-body mb-0.5">Car Class</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-transparent text-sm font-semibold text-[#0B0D10] focus:outline-none cursor-pointer appearance-none outline-none capitalize w-full"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat === 'All' ? 'All Classes' : cat}</option>
                  ))}
                </select>
              </div>

              {/* Transmission Dropdown */}
              <div className="flex flex-col justify-center px-4 py-3 w-full md:w-auto min-w-[140px]">
                <label className="text-[9px] font-bold uppercase tracking-[0.08em] text-[#0B0D10]/40 font-body mb-0.5">Transmission</label>
                <select
                  value={transmissionFilter}
                  onChange={(e) => setTransmissionFilter(e.target.value)}
                  className="bg-transparent text-sm font-semibold text-[#0B0D10] focus:outline-none cursor-pointer appearance-none outline-none capitalize w-full"
                >
                  <option value="All">All Types</option>
                  <option value="automatic">Automatic</option>
                  <option value="manual">Manual</option>
                </select>
              </div>

              {/* Fuel Type Dropdown */}
              <div className="flex flex-col justify-center px-4 py-3 w-full md:w-auto min-w-[130px]">
                <label className="text-[9px] font-bold uppercase tracking-[0.08em] text-[#0B0D10]/40 font-body mb-0.5">Fuel Type</label>
                <select
                  value={fuelTypeFilter}
                  onChange={(e) => setFuelTypeFilter(e.target.value)}
                  className="bg-transparent text-sm font-semibold text-[#0B0D10] focus:outline-none cursor-pointer appearance-none outline-none capitalize w-full"
                >
                  <option value="All">All Types</option>
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="electric">Electric</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              {/* Search Button */}
              <div className="p-2 w-full md:w-auto flex shrink-0">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto px-8 py-3.5 bg-[#0B0D10] text-white text-sm font-bold rounded-full hover:bg-[#E8542E] transition-colors shadow-md disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </form>

            {error && (
              <div className="p-3 text-xs font-data text-red-600 bg-red-50 border border-red-200 rounded-xl max-w-xl text-center mx-auto">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* 3 SHOWCASE CARDS GRID (EXACT 1:1 LAYOUT FROM PHOTO) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
          
          {/* CARD 1 (LEFT): AVATAR STACK 50+ OVERLAY */}
          <div className="md:col-span-4 relative group overflow-hidden rounded-[28px] border border-[#D8D4C8] bg-[#F7F5F0] h-[300px] shadow-sm">
            <img
              src="/images/hero_sedan.png"
              alt="Executive Sedan"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {/* Top Left Avatar Badge Stack (Matching Photo) */}
            <div className="absolute top-4 left-4 flex items-center space-x-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/50 shadow-sm">
              <div className="flex -space-x-2">
                <span className="w-6 h-6 rounded-full bg-[#0B0D10] text-[10px] font-bold text-white flex items-center justify-center font-data">🚘</span>
                <span className="w-6 h-6 rounded-full bg-[#E8542E] text-[10px] font-bold text-white flex items-center justify-center font-data">⚡</span>
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-[10px] font-bold text-white flex items-center justify-center font-data">⭐</span>
              </div>
              <span className="font-data text-xs font-semibold text-[#0B0D10]">
                50+
              </span>
            </div>
          </div>

          {/* CARD 2 (CENTER): VIDEO/PLAY BUTTON OVERLAY */}
          <div className="md:col-span-4 relative group overflow-hidden rounded-[28px] border border-[#D8D4C8] bg-[#F7F5F0] h-[300px] shadow-sm flex items-center justify-center">
            <img
              src="/images/hero_sports.png"
              alt="Performance Sports"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {/* Center Circular Play Overlay Button (Matching Photo) */}
            <div className="relative z-10 w-16 h-16 rounded-full bg-white/90 backdrop-blur-md border border-white flex items-center justify-center text-[#0B0D10] text-xl font-bold shadow-xl group-hover:scale-110 transition-transform cursor-pointer">
              ▶
            </div>
          </div>

          {/* CARD 3 (RIGHT): TOP RIGHT CALLOUT TEXT */}
          <div className="md:col-span-4 relative group overflow-hidden rounded-[28px] border border-[#D8D4C8] bg-[#F7F5F0] h-[300px] shadow-sm flex flex-col justify-between p-6">
            <img
              src="/images/hero_suv.png"
              alt="Luxury SUV"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

            {/* Top Right Callout (Matching Photo: "Plus sur nos expériences ↗") */}
            <div className="relative z-10 text-right">
              <Link
                to="/cars"
                className="font-body text-xs font-semibold text-white bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 inline-flex items-center space-x-1 hover:bg-white hover:text-[#0B0D10] transition-colors"
              >
                <span>More on our fleet</span>
                <span>↗</span>
              </Link>
            </div>
          </div>

        </div>

        {/* SEARCH RESULTS SECTION */}
        {results !== null && (
          <div className="bg-[#F7F5F0] rounded-[28px] border border-[#D8D4C8] p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-[#D8D4C8] pb-4">
              <div>
                <h2 className="font-display font-bold text-2xl text-[#0B0D10]">
                  Available Vehicles
                </h2>
                <p className="font-data text-xs text-[#0B0D10]/60">
                  {startDate} — {endDate}
                </p>
              </div>
              <span className="font-data text-xs font-semibold px-3 py-1 rounded-full bg-[#0B0D10] text-[#F7F5F0]">
                {filteredResults.length} Matched
              </span>
            </div>

            {results.length === 0 ? (
              <div className="text-center py-10 text-[#0B0D10]/60 font-body text-sm">
                No vehicles available for these dates — please try different dates.
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="text-center py-10 text-[#0B0D10]/60 font-body text-sm">
                No vehicles match your selected filter criteria.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResults.map((car) => {
                  const hasImage = car.images && car.images.length > 0;
                  const imageUrl = hasImage
                    ? supabase.storage.from('vehicle-images').getPublicUrl(car.images[0].storage_path).data.publicUrl
                    : null;

                  return (
                    <Link
                      to={`/cars/${car.id}`}
                      key={car.id}
                      className="group bg-white border border-[#D8D4C8] rounded-[24px] overflow-hidden flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    >
                      <div className="h-48 relative overflow-hidden bg-gray-100">
                        {hasImage ? (
                          <img
                            src={imageUrl}
                            alt={`${car.brand} ${car.model}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 font-data text-xs">
                            No image
                          </div>
                        )}
                        <span className="absolute top-3 right-3 font-data text-xs font-bold px-2.5 py-1 rounded-full bg-white/90 text-[#0B0D10] backdrop-blur-md capitalize shadow-sm">
                          {car.category || 'Vehicle'}
                        </span>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <h3 className="font-display font-bold text-xl text-[#0B0D10]">
                            {car.brand} {car.model}
                          </h3>
                          <div className="flex items-center space-x-2 text-xs font-data text-[#0B0D10]/60 mt-1">
                            <span>Year: {car.year}</span>
                            <span>•</span>
                            <span className="capitalize">{car.transmission}</span>
                            <span>•</span>
                            <span className="capitalize">{car.fuel_type}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-[#D8D4C8]">
                          <div>
                            <span className="font-data text-xs text-[#0B0D10]/50 block uppercase">Daily Rate</span>
                            <span className="font-data font-bold text-lg text-[#0B0D10]">${car.daily_price}</span>
                          </div>
                          <span className="px-4 py-2 bg-[#0B0D10] text-white text-xs font-semibold rounded-full group-hover:bg-[#E8542E] transition-colors">
                            Book Now ↗
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        </motion.div>
      </motion.div>

      {/* ─── INFINITE BRAND MARQUEE (CENTERED FLOATING PILL) ─── */}
      <div className="w-full max-w-[1240px] mx-auto px-4 pt-8 pb-4 my-4">
        <div className="bg-white/80 backdrop-blur-md border border-[#D8D4C8] shadow-md rounded-full py-3.5 px-6 overflow-hidden">
          <style>{`
            @keyframes marquee-scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .marquee-track {
              animation: marquee-scroll 35s linear infinite;
            }
            .marquee-track:hover {
              animation-play-state: paused;
            }
          `}</style>

          {/* Faded-edge mask */}
          <div className="relative" style={{ maskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)' }}>
            <div className="flex items-center marquee-track whitespace-nowrap">
              {/* First set of brand logos */}
              {[
                '/logos/audi.svg', '/logos/bmw.svg', '/logos/fiat.svg',
                '/logos/mercedes.svg', '/logos/peugoet.svg', '/logos/volkasvagen.svg',
                '/logos/audi.svg', '/logos/bmw.svg', '/logos/fiat.svg',
                '/logos/mercedes.svg', '/logos/peugoet.svg', '/logos/volkasvagen.svg'
              ].map((logoPath, idx) => (
                <div key={`a-${idx}`} className="inline-flex items-center shrink-0 mx-6">
                  <img src={logoPath} alt="Brand Logo" className="h-8 md:h-10 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity duration-300" />
                </div>
              ))}
              {/* Duplicate set for seamless loop */}
              {[
                '/logos/audi.svg', '/logos/bmw.svg', '/logos/fiat.svg',
                '/logos/mercedes.svg', '/logos/peugoet.svg', '/logos/volkasvagen.svg',
                '/logos/audi.svg', '/logos/bmw.svg', '/logos/fiat.svg',
                '/logos/mercedes.svg', '/logos/peugoet.svg', '/logos/volkasvagen.svg'
              ].map((logoPath, idx) => (
                <div key={`b-${idx}`} className="inline-flex items-center shrink-0 mx-6" aria-hidden="true">
                  <img src={logoPath} alt="Brand Logo" className="h-8 md:h-10 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity duration-300" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* NEW CAROUSEL SECTION (BELOW HERO) — REAL CARS FROM DB */}
      <div className="w-full bg-[#FAFAF9] py-16">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7 }}
          className="max-w-[1400px] mx-auto px-4 sm:px-8 space-y-6"
        >
          <div className="flex items-center justify-between px-4">
            <div>
              <h2 className="font-display font-bold text-3xl md:text-4xl text-[#0B0D10]">
                Featured Fleet
              </h2>
              <p className="text-xs text-slate-500 font-body mt-1">Scroll or use arrows to discover our collection</p>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Carousel navigation arrow buttons */}
              <button
                onClick={scrollLeft}
                aria-label="Scroll left"
                className="w-10 h-10 rounded-full border border-[#D8D4C8] bg-white text-[#0B0D10] flex items-center justify-center hover:bg-[#E8542E] hover:text-white hover:border-[#E8542E] transition-all shadow-sm active:scale-95"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={scrollRight}
                aria-label="Scroll right"
                className="w-10 h-10 rounded-full border border-[#D8D4C8] bg-white text-[#0B0D10] flex items-center justify-center hover:bg-[#E8542E] hover:text-white hover:border-[#E8542E] transition-all shadow-sm active:scale-95"
              >
                <ChevronRight size={20} />
              </button>

              <Link
                to="/cars"
                className="font-display font-bold text-xs uppercase tracking-wider text-[#E8542E] hover:underline ml-2 hidden sm:inline-block"
              >
                View All ↗
              </Link>
            </div>
          </div>
          
          {/* Horizontal scrollable carousel container */}
          {featuredCars.length > 0 ? (
            <div 
              ref={carouselRef}
              onScroll={handleCarouselScroll}
              className="flex overflow-x-auto gap-6 px-4 py-4 scrollbar-none snap-x snap-mandatory scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {featuredCars.map((car, idx) => {
                const hasImage = car.images && car.images.length > 0;
                const imageUrl = hasImage
                  ? supabase.storage.from('vehicle-images').getPublicUrl(car.images[0].storage_path).data.publicUrl
                  : '/images/hero_sports.png';

                return (
                  <motion.div
                    key={car.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.05 }}
                    className="flex-none w-[290px] sm:w-[360px] md:w-[400px] snap-start group relative rounded-[24px] overflow-hidden h-[400px] md:h-[480px] border border-[#D8D4C8] bg-[#0B0D10] shadow-md cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                    onClick={() => navigate(`/cars/${car.id}`)}
                  >
                    <img
                      src={imageUrl}
                      alt={`${car.brand} ${car.model}`}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10"></div>

                    <div className="absolute top-5 left-5">
                      <span className="font-body font-semibold text-xs text-white/90 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 capitalize">
                        {car.category || 'Luxury'}
                      </span>
                    </div>

                    <div className="absolute bottom-6 left-6 right-6 space-y-4">
                      <div>
                        <h3 className="font-display font-bold text-2xl md:text-3xl text-white drop-shadow-md">
                          {car.brand} {car.model}
                        </h3>
                        <p className="font-body text-white/80 mt-1 text-sm font-medium">
                          From ${car.daily_price}/day • {car.year}
                        </p>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Link
                          to={`/cars/${car.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="px-6 py-2.5 bg-white text-[#0B0D10] font-body text-sm font-bold rounded-xl hover:bg-[#E8542E] hover:text-white transition-all shadow-sm"
                        >
                          View Details ↗
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            /* Fallback skeleton while loading */
            <div className="flex overflow-x-auto gap-6 px-4 py-4 scrollbar-none">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex-none w-[320px] h-[420px] rounded-[24px] bg-[#D8D4C8]/40 animate-pulse"></div>
              ))}
            </div>
          )}

          {/* DYNAMIC DOT INDICATORS */}
          {featuredCars.length > 0 && (
            <div className="flex items-center justify-center space-x-2 pt-2">
              {featuredCars.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (carouselRef.current) {
                      const cardWidth = 380;
                      carouselRef.current.scrollTo({ left: idx * cardWidth, behavior: 'smooth' });
                    }
                  }}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    activeSlide === idx 
                      ? 'w-8 bg-[#E8542E]' 
                      : 'w-2.5 bg-[#0B0D10]/20 hover:bg-[#0B0D10]/40'
                  }`}
                />
              ))}
            </div>
          )}

        </motion.div>
      </div>
      {/* ─── HOW TO BOOK (INTERACTIVE SPLIT LAYOUT) ─── */}
      <div className="w-full bg-[#FAFAF9] py-20 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7 }}
          className="max-w-[1240px] mx-auto px-4 sm:px-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Side: Interactive Editorial Image */}
            <div className="relative group rounded-[32px] overflow-hidden h-[500px] md:h-[600px] shadow-2xl border border-[#D8D4C8] bg-[#FAFAF9]">
              {bookingSteps.map((step, idx) => (
                <img 
                  key={step.id}
                  src={step.image} 
                  alt={step.title} 
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out ${
                    activeBookingStep === idx 
                      ? 'opacity-100 scale-100 translate-x-0' 
                      : 'opacity-0 scale-105 translate-x-4'
                  }`}
                />
              ))}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"></div>
              
              {/* Floating accent pill */}
              <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full border border-white/40 shadow-xl transition-transform duration-500 hover:scale-105">
                <span className="font-display font-semibold text-sm tracking-wide text-[#0B0D10] uppercase flex items-center space-x-2">
                  <span>Seamless Experience</span>
                  <span className="text-[#E8542E]">⚡</span>
                </span>
              </div>
            </div>

            {/* Right Side: Interactive Typographic Steps */}
            <div className="space-y-12 lg:pl-8">
              <div className="space-y-4">
                <h2 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-[#0B0D10] tracking-tight leading-[1.05]">
                  How to reserve <br />
                  <span className="text-[#E8542E]">your drive.</span>
                </h2>
                <p className="font-body text-[#0B0D10]/60 text-lg max-w-md">
                  A refined, effortless process designed to get you behind the wheel with zero friction.
                </p>
              </div>

              <div className="space-y-0 pt-4 relative">
                {/* Vertical connecting line indicator */}
                <div className="absolute left-[18px] top-[40px] bottom-[40px] w-[2px] bg-[#D8D4C8]/30 hidden md:block z-0"></div>
                
                {/* Animated active line indicator */}
                <div 
                  className="absolute left-[18px] w-[2px] bg-[#E8542E] hidden md:block z-10 transition-all duration-500 ease-out"
                  style={{ 
                    top: `${(activeBookingStep * 33.33) + 5}%`, 
                    height: '25%' 
                  }}
                ></div>

                {bookingSteps.map((step, idx) => {
                  const isActive = activeBookingStep === idx;
                  return (
                    <div 
                      key={step.id}
                      onMouseEnter={() => setActiveBookingStep(idx)}
                      onClick={() => setActiveBookingStep(idx)}
                      className={`relative z-20 flex items-start space-x-6 p-6 md:p-8 rounded-2xl cursor-pointer transition-all duration-500 ${
                        isActive 
                          ? 'bg-[#FAFAF9] border border-[#D8D4C8] shadow-sm translate-x-2' 
                          : 'hover:bg-[#FAFAF9]/50 border border-transparent'
                      }`}
                    >
                      <div className={`font-display font-bold text-3xl transition-colors duration-500 ${
                        isActive ? 'text-[#E8542E]' : 'text-[#0B0D10]/20'
                      }`}>
                        {step.id}
                      </div>
                      <div>
                        <h3 className={`font-display font-bold text-xl mb-2 transition-colors duration-500 ${
                          isActive ? 'text-[#0B0D10]' : 'text-[#0B0D10]/70'
                        }`}>
                          {step.title}
                        </h3>
                        <p className={`font-body transition-colors duration-500 ${
                          isActive ? 'text-[#0B0D10]/70' : 'text-[#0B0D10]/40'
                        }`}>
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 pl-6 md:pl-8">
                <GradientButton
                  onClick={() => {
                    document.getElementById('availability-search')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  width="200px"
                  height="48px"
                >
                  Start Your Journey
                </GradientButton>
              </div>
            </div>
            
          </div>
        </motion.div>
      </div>

      {/* ─── EXCLUSIVE OFFERS / PROMOTIONS (BENTO GRID) ─── */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.7 }}
        className="w-full bg-[#FAFAF9] py-16 pb-24"
      >
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8 space-y-6">
          
          {/* Main Large Banner */}
          <div className="relative w-full h-[400px] md:h-[480px] rounded-[32px] overflow-hidden group shadow-lg">
            <img src="/images/hero_suv.png" alt="Rewards" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
            
            {/* Slanted Badge */}
            <div className="absolute top-[25%] left-6 md:left-12 -translate-y-1/2">
              <div className="relative border-2 border-white px-5 py-3 -skew-x-[12deg] bg-black/10 backdrop-blur-sm">
                <div className="skew-x-[12deg] text-center">
                  <span className="block font-data font-bold text-[10px] uppercase text-white tracking-widest mb-1">Up To</span>
                  <span className="block font-display font-bold text-3xl md:text-5xl text-white leading-none">20%<br/>OFF</span>
                </div>
              </div>
            </div>

            {/* Content Bottom */}
            <div className="absolute bottom-8 left-6 md:left-12 max-w-xl">
              <h2 className="font-display font-bold text-3xl md:text-5xl text-white uppercase tracking-tight mb-3">
                DRIVEEASE ONE: TURN RENTALS INTO REWARDS
              </h2>
              <p className="font-body text-white/80 mb-6 text-sm md:text-base">
                Join DriveEase ONE now to unlock exclusive savings, priority booking, and premium upgrades on every reservation.
              </p>
              <button className="px-8 py-3 rounded-full border border-white text-white font-body text-sm font-semibold hover:bg-white hover:text-black transition-colors">
                Learn more
              </button>
            </div>
          </div>

          {/* Two Columns Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Promo Card 1 */}
            <div className="relative w-full h-[360px] md:h-[400px] rounded-[32px] overflow-hidden group shadow-lg">
              <img src="/images/hero_sedan.png" alt="Promo 1" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
              
              {/* Slanted Badge */}
              <div className="absolute top-[35%] left-6 md:left-8 -translate-y-1/2">
                <div className="relative border-2 border-white px-4 py-2 -skew-x-[12deg] bg-black/10 backdrop-blur-sm">
                  <div className="skew-x-[12deg] text-center">
                    <span className="block font-data font-bold text-[10px] uppercase text-white tracking-widest mb-1">Up To</span>
                    <span className="block font-display font-bold text-3xl md:text-4xl text-white leading-none">15%<br/>DISCOUNT</span>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-8 left-6 md:left-8 pr-6">
                <h3 className="font-display font-bold text-2xl md:text-3xl text-white uppercase tracking-tight mb-2">
                  START YOUR WEEK IN STYLE
                </h3>
                <p className="font-body text-white/80 mb-5 text-sm">Save on early week luxury rentals.</p>
                <button className="px-6 py-2.5 rounded-full border border-white text-white font-body text-xs font-semibold hover:bg-white hover:text-black transition-colors">
                  Book now
                </button>
              </div>
            </div>

            {/* Promo Card 2 */}
            <div className="relative w-full h-[360px] md:h-[400px] rounded-[32px] overflow-hidden group shadow-lg">
              <img src="/images/hero_sports.png" alt="Promo 2" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
              
              {/* Slanted Badge */}
              <div className="absolute top-[35%] left-6 md:left-8 -translate-y-1/2">
                <div className="relative border-2 border-white px-4 py-2 -skew-x-[12deg] bg-black/10 backdrop-blur-sm">
                  <div className="skew-x-[12deg] text-center">
                    <span className="block font-data font-bold text-[10px] uppercase text-white tracking-widest mb-1">Up To</span>
                    <span className="block font-display font-bold text-3xl md:text-4xl text-white leading-none">20%<br/>DISCOUNT</span>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-8 left-6 md:left-8 pr-6">
                <h3 className="font-display font-bold text-2xl md:text-3xl text-white uppercase tracking-tight mb-2">
                  SAVE ON LUXURY VEHICLES
                </h3>
                <p className="font-body text-white/80 mb-5 text-sm">Book now and drive first class.</p>
                <button className="px-6 py-2.5 rounded-full border border-white text-white font-body text-xs font-semibold hover:bg-white hover:text-black transition-colors">
                  Book now
                </button>
              </div>
            </div>
            
          </div>
        </div>
      </motion.div>

      {/* ─── TESTIMONIALS (FULL-WIDTH CINEMATIC) ─── */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.9 }}
        className="relative w-full h-[520px] md:h-[580px] overflow-hidden"
      >
        <img 
          src="/images/testimonial_bg.png" 
          alt="Customer Experience" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60"></div>

        <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 md:px-16 max-w-[960px] mx-auto text-center">
          <motion.blockquote
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="space-y-6"
          >
            <p className="font-display font-bold text-2xl md:text-4xl lg:text-5xl text-white leading-snug tracking-tight">
              DriveEase is the only rental company I've never had an issue with. Seriously… they've turned me into a lifelong client.
            </p>
            <cite className="block font-body text-white/70 text-sm md:text-base not-italic tracking-wide">
              — Sarah M., Paris
            </cite>
          </motion.blockquote>

          {/* Dot indicators */}
          <div className="flex items-center space-x-3 mt-10">
            <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
            <div className="w-2 h-2 rounded-full bg-white/40"></div>
            <div className="w-2 h-2 rounded-full bg-white/40"></div>
          </div>
        </div>

        {/* Nav arrows */}
        <div className="absolute bottom-8 right-8 flex items-center space-x-3 z-10">
          <button className="w-11 h-11 rounded-full border border-white/30 flex items-center justify-center text-white/60 hover:bg-white/10 hover:text-white transition-all">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
          </button>
          <button className="w-11 h-11 rounded-full border border-white/30 flex items-center justify-center text-white/60 hover:bg-white/10 hover:text-white transition-all">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>
      </motion.div>

      {/* ─── CTA BANNER (CINEMATIC ROAD) ─── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.7 }}
        className="w-full px-4 sm:px-8 py-16"
      >
        <div className="relative max-w-[1240px] mx-auto h-[360px] md:h-[420px] rounded-[32px] overflow-hidden group">
          <img 
            src="/images/cta_road.png" 
            alt="Open Road" 
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
          
          <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-16 max-w-lg">
            <h2 className="font-display font-bold text-3xl md:text-5xl text-white tracking-tight leading-tight mb-4">
              Your next journey <br/>starts here.
            </h2>
            <p className="font-body text-white/70 text-sm md:text-base mb-8">
              Premium vehicles. Effortless booking. Unforgettable drives along the world's most beautiful roads.
            </p>
            <div>
              <GradientButton
                onClick={() => navigate('/cars')}
                width="200px"
                height="52px"
              >
                Explore the Fleet
              </GradientButton>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── FOOTER ─── */}
      <Footer />
    </div>
  );
}

export default Home;
