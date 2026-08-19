import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  SlidersHorizontal, 
  Users, 
  ShieldCheck, 
  Headphones, 
  Globe, 
  Sparkles,
  Fuel,
  Gauge,
  CalendarDays,
  Car,
  X,
  ChevronRight,
  Info
} from 'lucide-react';
import Footer from '../components/Footer';
import { API_URL } from '../config';

function CarsList() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [transmissionFilter, setTransmissionFilter] = useState('All');
  const [seatsFilter, setSeatsFilter] = useState('All');
  const [priceFilter, setPriceFilter] = useState('All');

  // Specs Modal State
  const [selectedCarSpecs, setSelectedCarSpecs] = useState(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_URL}/vehicles`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch vehicles: ${response.statusText}`);
        }

        const data = await response.json();
        setVehicles(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  const categoriesList = ['All', 'Luxury', 'VIP', 'Comfort', 'Economy', 'SUV', 'Sports'];

  const filteredVehicles = vehicles.filter((car) => {
    const matchesSearch =
      !searchQuery ||
      (car.brand && car.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (car.model && car.model.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = 
      categoryFilter === 'All' || 
      (car.category && car.category.toLowerCase() === categoryFilter.toLowerCase());

    const matchesTransmission = 
      transmissionFilter === 'All' || 
      (car.transmission && car.transmission.toLowerCase() === transmissionFilter.toLowerCase());

    const matchesSeats = 
      seatsFilter === 'All' || 
      (seatsFilter === '2' && car.seats === 2) ||
      (seatsFilter === '4' && car.seats === 4) ||
      (seatsFilter === '5' && car.seats === 5) ||
      (seatsFilter === '7+' && car.seats >= 7);

    let matchesPrice = true;
    if (priceFilter === 'under-150') matchesPrice = car.daily_price < 150;
    if (priceFilter === '150-300') matchesPrice = car.daily_price >= 150 && car.daily_price <= 300;
    if (priceFilter === '300-plus') matchesPrice = car.daily_price > 300;

    return matchesSearch && matchesCategory && matchesTransmission && matchesSeats && matchesPrice;
  });

  return (
    <div className="min-h-screen bg-[#FAFAF9] font-body text-[#0B0D10] flex flex-col">
      
      {/* ─── 1. HERO HEADER SECTION (MATCHING SCREENSHOT LUXURY COCKPIT HERO) ─── */}
      <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-8 pt-24 pb-6">
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative w-full rounded-[36px] overflow-hidden bg-[url('/images/luxury_interior.png')] bg-cover bg-center border border-[#D8D4C8]/60 shadow-2xl p-8 sm:p-12 md:p-16 flex flex-col justify-between min-h-[440px] md:min-h-[500px]"
        >
          {/* Subtle Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent z-0"></div>

          {/* Top Left Statement Content (Matching Screenshot Layout) */}
          <div className="relative z-10 max-w-2xl space-y-5">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20">
              <Sparkles className="w-4 h-4 text-[#E8542E]" />
              <span className="font-display font-semibold text-xs text-white uppercase tracking-wider">
                Drivo Exclusive Fleet
              </span>
            </div>

            <h1 className="font-display font-bold text-3xl sm:text-5xl lg:text-6xl text-white leading-[1.08] tracking-tight drop-shadow-md">
              Sustainable Transportation <br />
              for a <span className="text-[#E8542E]">Greener Tomorrow</span>
            </h1>

            <p className="font-body text-white/80 text-sm sm:text-base max-w-lg leading-relaxed drop-shadow">
              Solid-state performance, executive sedans, and high-end luxury rentals engineered for extraordinary journeys.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a 
                href="#fleet-grid" 
                className="px-7 py-3 rounded-full bg-white text-[#0B0D10] font-display font-bold text-xs uppercase tracking-wider hover:bg-[#E8542E] hover:text-white transition-all shadow-md transform hover:scale-105 active:scale-95"
              >
                Discover Cars
              </a>
              <a 
                href="#fleet-grid" 
                className="px-7 py-3 rounded-full bg-[#2955F5] text-white font-display font-bold text-xs uppercase tracking-wider hover:bg-[#1E40C6] transition-all shadow-md flex items-center space-x-2 transform hover:scale-105 active:scale-95"
              >
                <span>✦</span>
                <span>Browse Fleet</span>
              </a>
            </div>
          </div>

        </motion.div>

        {/* ─── 2. INLINE SEARCH & FILTER BAR (KEPT & INTEGRATED CLEANLY) ─── */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative z-20 max-w-[1200px] mx-auto -mt-10 px-2"
        >
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-4 shadow-2xl border border-[#D8D4C8] flex flex-col md:flex-row items-center justify-between gap-3">
            
            {/* Filter Search Input */}
            <div className="flex items-center space-x-3 px-3 py-2 border-b md:border-b-0 md:border-r border-[#D8D4C8]/60 w-full md:w-auto flex-1">
              <div className="w-10 h-10 rounded-full bg-[#F4F4F2] border border-[#D8D4C8] flex items-center justify-center text-[#0B0D10] shrink-0">
                <Search className="w-4 h-4 text-[#0B0D10]" />
              </div>
              <input
                type="text"
                placeholder="Search brand or model..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent font-body text-sm text-[#0B0D10] placeholder:text-[#0B0D10]/40 outline-none w-full font-medium"
              />
            </div>

            {/* Car Class Dropdown */}
            <div className="flex-1 w-full md:w-auto px-3 border-b md:border-b-0 md:border-r border-[#D8D4C8]/60">
              <label className="block text-[9px] font-bold uppercase tracking-wider text-[#0B0D10]/40 mb-0.5 font-display">Car Class</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-transparent font-body text-sm font-semibold text-[#0B0D10] outline-none cursor-pointer capitalize"
              >
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>{cat === 'All' ? 'All Classes' : cat}</option>
                ))}
              </select>
            </div>

            {/* Seats Dropdown */}
            <div className="flex-1 w-full md:w-auto px-3 border-b md:border-b-0 md:border-r border-[#D8D4C8]/60">
              <label className="block text-[9px] font-bold uppercase tracking-wider text-[#0B0D10]/40 mb-0.5 font-display">Seats</label>
              <select
                value={seatsFilter}
                onChange={(e) => setSeatsFilter(e.target.value)}
                className="w-full bg-transparent font-body text-sm font-semibold text-[#0B0D10] outline-none cursor-pointer"
              >
                <option value="All">Any Seats</option>
                <option value="2">2 Seats</option>
                <option value="4">4 Seats</option>
                <option value="5">5 Seats</option>
                <option value="7+">7+ Seats</option>
              </select>
            </div>

            {/* Price Range Dropdown */}
            <div className="flex-1 w-full md:w-auto px-3 border-b md:border-b-0 md:border-r border-[#D8D4C8]/60">
              <label className="block text-[9px] font-bold uppercase tracking-wider text-[#0B0D10]/40 mb-0.5 font-display">Price Range</label>
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="w-full bg-transparent font-body text-sm font-semibold text-[#0B0D10] outline-none cursor-pointer"
              >
                <option value="All">All Prices</option>
                <option value="under-150">Under $150/day</option>
                <option value="150-300">$150 - $300/day</option>
                <option value="300-plus">$300+/day</option>
              </select>
            </div>

            {/* Transmission Dropdown */}
            <div className="flex-1 w-full md:w-auto px-3">
              <label className="block text-[9px] font-bold uppercase tracking-wider text-[#0B0D10]/40 mb-0.5 font-display">Transmission</label>
              <select
                value={transmissionFilter}
                onChange={(e) => setTransmissionFilter(e.target.value)}
                className="w-full bg-transparent font-body text-sm font-semibold text-[#0B0D10] outline-none cursor-pointer capitalize"
              >
                <option value="All">All Transmission</option>
                <option value="automatic">Automatic</option>
                <option value="manual">Manual</option>
              </select>
            </div>

            {/* Reset / Search Action Button */}
            <button 
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('All');
                setTransmissionFilter('All');
                setSeatsFilter('All');
                setPriceFilter('All');
              }}
              className="w-full md:w-auto px-6 py-3 bg-[#0B0D10] hover:bg-[#E8542E] text-white font-display text-xs font-bold uppercase tracking-wider rounded-2xl transition-colors shrink-0 shadow-md"
            >
              Reset Filters
            </button>

          </div>
        </motion.div>
      </div>

      {/* ─── 3. MAIN SECTION TITLE (MATCHING SCREENSHOT "Enhancing Driver Experience") ─── */}
      <div id="fleet-grid" className="w-full max-w-[1360px] mx-auto px-4 sm:px-8 pt-16 pb-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-3"
        >
          <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-[#0B0D10] tracking-tight">
            Enhancing Driver Experience <br className="hidden sm:inline" />
            with Smart Tech
          </h2>
          <p className="font-body text-[#0B0D10]/60 text-sm max-w-lg mx-auto">
            Discover our studio collection of verified luxury rentals. Hand-picked performance and elegance.
          </p>
        </motion.div>
      </div>

      {/* ─── 4. CARS FLEET GRID (EXACT STUDIO CAR CARD AESTHETIC FROM SCREENSHOT) ─── */}
      <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-8 pb-20">
        {loading ? (
          <div className="py-24 text-center font-body text-[#0B0D10]/60">
            <div className="inline-block w-10 h-10 border-4 border-[#0B0D10] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="font-display font-bold text-sm uppercase tracking-wider">Loading Drivo Fleet...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center text-red-600 bg-red-50 rounded-3xl border border-red-200">
            Failed to load vehicles: {error}
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-[32px] border border-[#D8D4C8] p-8 max-w-xl mx-auto shadow-sm">
            <Car className="w-12 h-12 mx-auto text-[#0B0D10]/30 mb-3" />
            <h3 className="font-display font-bold text-lg text-[#0B0D10]">No cars match your criteria</h3>
            <p className="font-body text-sm text-[#0B0D10]/60 mt-1">
              Try adjusting your filter options above to browse available models.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('All');
                setTransmissionFilter('All');
                setSeatsFilter('All');
                setPriceFilter('All');
              }}
              className="mt-6 px-6 py-2.5 bg-[#0B0D10] text-white text-xs font-bold uppercase rounded-full hover:bg-[#E8542E] transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredVehicles.map((car, idx) => {
              const hasImage = car.images && car.images.length > 0;
              const imageUrl = hasImage
                ? supabase.storage.from('vehicle-images').getPublicUrl(car.images[0].storage_path).data.publicUrl
                : '/images/hero_sports.png';

              const monthlyEstimate = Math.round(car.daily_price * 22);

              return (
                <motion.div
                  key={car.id || idx}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: (idx % 4) * 0.08 }}
                  className="bg-[#E4E6E9] rounded-[36px] border border-[#D5D7DC] shadow-sm overflow-hidden p-8 flex flex-col justify-between h-[460px] sm:h-[480px] group relative hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  {/* TOP HEADER: BRAND, MODEL & PRICE (MATCHING SCREENSHOT LAYOUT) */}
                  <div className="text-center space-y-1 relative z-10">
                    <h3 className="font-display font-bold text-2xl sm:text-3xl text-[#0B0D10] tracking-tight group-hover:text-[#E8542E] transition-colors">
                      {car.brand} {car.model}
                    </h3>
                    <p className="font-body text-xs sm:text-sm text-[#0B0D10]/55 font-medium">
                      Starts at ${car.daily_price}/day <span className="opacity-80">or from ${monthlyEstimate.toLocaleString()}/mo</span>
                    </p>
                  </div>

                  {/* CENTER IMAGE: CRISP CAR PHOTO WITH DROP SHADOW */}
                  <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
                    <img 
                      src={imageUrl} 
                      alt={`${car.brand} ${car.model}`}
                      className="w-full max-h-[220px] object-contain filter drop-shadow-[0_18px_20px_rgba(0,0,0,0.18)] group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                  </div>

                  {/* BOTTOM ACTION BUTTONS: DARK PILL & WHITE PILL (EXACT MATCHING SCREENSHOT) */}
                  <div className="flex items-center justify-center space-x-3 relative z-10 pt-2">
                    <button
                      onClick={() => navigate(`/cars/${car.id}`)}
                      className="px-6 sm:px-8 py-3 rounded-full bg-[#181A1E] text-white font-display font-bold text-xs tracking-wider uppercase hover:bg-[#E8542E] transition-colors shadow-md active:scale-95"
                    >
                      Discover car
                    </button>
                    
                    <button
                      onClick={() => setSelectedCarSpecs(car)}
                      className="px-6 sm:px-8 py-3 rounded-full bg-white text-[#181A1E] font-display font-bold text-xs tracking-wider uppercase hover:bg-[#F0EFF4] transition-colors shadow-md border border-white/60 active:scale-95"
                    >
                      See specs
                    </button>
                  </div>

                </motion.div>
              );
            })}

            {/* SPECIAL SHOWCASE CARD (MATCHING 4TH CARD IN SCREENSHOT) */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-[url('/images/cta_road.png')] bg-cover bg-center rounded-[36px] border border-black/20 shadow-md overflow-hidden p-8 flex flex-col justify-end items-center text-center h-[460px] sm:h-[480px] relative group hover:shadow-2xl transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20"></div>

              <div className="relative z-10 space-y-4 pb-4">
                <h3 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight drop-shadow-md">
                  Our Cars for Sale & <br /> VIP Concierge
                </h3>
                <Link 
                  to="/my-bookings"
                  className="inline-block px-8 py-3 rounded-full bg-white text-[#0B0D10] font-display font-bold text-xs uppercase tracking-wider hover:bg-[#E8542E] hover:text-white transition-all shadow-xl active:scale-95"
                >
                  See full cars ↗
                </Link>
              </div>
            </motion.div>

          </div>
        )}
      </div>

      {/* ─── 5. BOTTOM FULL-WIDTH BANNER (MATCHING SCREENSHOT BOTTOM SECTION) ─── */}
      <div className="w-full bg-black text-white relative overflow-hidden py-20 px-6 sm:px-12 border-t border-white/10">
        <div className="absolute inset-0 z-0 opacity-40">
          <img 
            src="/images/luxury_wheel.png" 
            alt="EV Charging & Tech Detail" 
            className="w-full h-full object-cover object-center filter brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center space-x-2 bg-[#2955F5]/30 backdrop-blur-md px-4 py-1.5 rounded-full border border-[#2955F5]/50">
            <span className="font-display font-bold text-[10px] text-white uppercase tracking-widest">
              MADE BY YOU, FOR YOU
            </span>
          </div>

          <h2 className="font-display font-bold text-3xl sm:text-5xl md:text-6xl text-white tracking-tight leading-[1.1]">
            Recycling and Eco-Friendly <br className="hidden sm:inline" />
            Production — The Role of EV Factories
          </h2>

          <p className="font-body text-white/70 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Drivo sets the standard for high-performance sustainable luxury. 100% verified agencies, instant booking, and VIP concierge support.
          </p>
        </div>
      </div>

      {/* ─── QUICK SPECS MODAL OVERLAY ─── */}
      <AnimatePresence>
        {selectedCarSpecs && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[32px] max-w-xl w-full p-6 sm:p-8 space-y-6 border border-[#D8D4C8] shadow-2xl relative overflow-hidden"
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedCarSpecs(null)}
                className="absolute top-6 right-6 w-9 h-9 rounded-full bg-[#FAFAF9] border border-[#D8D4C8] flex items-center justify-center text-[#0B0D10] hover:bg-[#0B0D10] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <span className="font-display font-bold text-xs uppercase tracking-wider text-[#E8542E]">
                  Vehicle Specifications
                </span>
                <h3 className="font-display font-bold text-3xl text-[#0B0D10]">
                  {selectedCarSpecs.brand} {selectedCarSpecs.model}
                </h3>
              </div>

              {/* Car Image Preview */}
              <div className="h-48 bg-[#E4E6E9] rounded-2xl p-4 flex items-center justify-center border border-[#D5D7DC]">
                <img 
                  src={
                    selectedCarSpecs.images && selectedCarSpecs.images.length > 0
                      ? supabase.storage.from('vehicle-images').getPublicUrl(selectedCarSpecs.images[0].storage_path).data.publicUrl
                      : '/images/hero_sports.png'
                  } 
                  alt={selectedCarSpecs.model} 
                  className="max-h-full object-contain filter drop-shadow-md"
                />
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-body text-xs">
                <div className="bg-[#F4F4F2] p-3 rounded-xl border border-[#D8D4C8]/60">
                  <span className="text-[#0B0D10]/50 block text-[10px] font-bold uppercase">Daily Rate</span>
                  <span className="font-data font-bold text-base text-[#0B0D10]">${selectedCarSpecs.daily_price}/day</span>
                </div>
                <div className="bg-[#F4F4F2] p-3 rounded-xl border border-[#D8D4C8]/60">
                  <span className="text-[#0B0D10]/50 block text-[10px] font-bold uppercase">Class</span>
                  <span className="font-semibold text-sm capitalize text-[#0B0D10]">{selectedCarSpecs.category || 'Luxury'}</span>
                </div>
                <div className="bg-[#F4F4F2] p-3 rounded-xl border border-[#D8D4C8]/60">
                  <span className="text-[#0B0D10]/50 block text-[10px] font-bold uppercase">Transmission</span>
                  <span className="font-semibold text-sm capitalize text-[#0B0D10]">{selectedCarSpecs.transmission || 'Automatic'}</span>
                </div>
                <div className="bg-[#F4F4F2] p-3 rounded-xl border border-[#D8D4C8]/60">
                  <span className="text-[#0B0D10]/50 block text-[10px] font-bold uppercase">Fuel Type</span>
                  <span className="font-semibold text-sm capitalize text-[#0B0D10]">{selectedCarSpecs.fuel_type || 'Petrol'}</span>
                </div>
                <div className="bg-[#F4F4F2] p-3 rounded-xl border border-[#D8D4C8]/60">
                  <span className="text-[#0B0D10]/50 block text-[10px] font-bold uppercase">Seating</span>
                  <span className="font-semibold text-sm text-[#0B0D10]">{selectedCarSpecs.seats || 4} Seats</span>
                </div>
                <div className="bg-[#F4F4F2] p-3 rounded-xl border border-[#D8D4C8]/60">
                  <span className="text-[#0B0D10]/50 block text-[10px] font-bold uppercase">Model Year</span>
                  <span className="font-semibold text-sm text-[#0B0D10]">{selectedCarSpecs.year || 2026}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center space-x-3">
                <button
                  onClick={() => {
                    const id = selectedCarSpecs.id;
                    setSelectedCarSpecs(null);
                    navigate(`/cars/${id}`);
                  }}
                  className="w-full py-3.5 bg-[#0B0D10] hover:bg-[#E8542E] text-white font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-colors shadow-md flex items-center justify-center space-x-2"
                >
                  <span>Proceed to Booking</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

export default CarsList;
