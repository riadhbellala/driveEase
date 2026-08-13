import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Gauge, 
  Users, 
  Fuel, 
  ShieldCheck, 
  Sparkles,
  CalendarDays,
  Car,
  ChevronDown,
  ChevronUp,
  MapPin,
  Clock
} from 'lucide-react';
import GradientButton from '../components/ui/gradient-button';
import Footer from '../components/Footer';

function CarDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  // Accordion state
  const [activeTab, setActiveTab] = useState('specs'); // 'specs' or 'features'

  useEffect(() => {
    const fetchCar = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`http://localhost:4000/vehicles/${id}`);
        
        if (!response.ok) {
          throw new Error('Vehicle not found');
        }

        const data = await response.json();
        setCar(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center font-body">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#E8542E] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="font-display font-semibold text-[#0B0D10]/60">Preparing your vehicle...</p>
        </div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8 font-body">
        <div className="text-center bg-[#FAFAF9] p-12 rounded-[32px] border border-[#D8D4C8] shadow-sm max-w-md">
          <Car className="w-16 h-16 text-[#E8542E] mx-auto mb-6 opacity-80" />
          <h2 className="font-display font-bold text-2xl text-[#0B0D10] mb-2">Vehicle Not Found</h2>
          <p className="text-sm text-[#0B0D10]/60 mb-8">This vehicle might have been removed or is currently unavailable.</p>
          <Link to="/cars" className="px-8 py-3.5 bg-[#0B0D10] text-white rounded-full font-semibold text-sm hover:bg-[#E8542E] transition-colors inline-block font-display">
            Browse Fleet
          </Link>
        </div>
      </div>
    );
  }

  const dbImageUrl = (car.images && car.images.length > 0)
    ? supabase.storage.from('vehicle-images').getPublicUrl(car.images[0].storage_path).data.publicUrl
    : '/images/hero_sports.png';

  const galleryImages = [
    dbImageUrl,
    '/images/luxury_interior.png',
    '/images/luxury_wheel.png',
    '/images/luxury_back.png'
  ];

  const mainImageUrl = galleryImages[selectedImageIndex];

  // Calculate total days & price
  let totalDays = 0;
  let totalPrice = 0;
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end - start;
    totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (totalDays > 0) {
      totalPrice = totalDays * car.daily_price;
    }
  }

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingError(null);
    setBookingSuccess(null);
    
    if (!startDate || !endDate) {
      setBookingError('Please select both dates.');
      return;
    }

    if (totalDays <= 0) {
      setBookingError('Return date must be after pick-up.');
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/login');
      return;
    }

    try {
      setIsBooking(true);
      const res = await fetch('http://localhost:4000/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          vehicle_id: id,
          start_date: startDate,
          end_date: endDate
        })
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          throw new Error('Already booked for these dates.');
        }
        throw new Error(data.error || 'Failed to complete reservation.');
      }

      setBookingSuccess('Reservation confirmed!');
      setStartDate('');
      setEndDate('');
    } catch (err) {
      setBookingError(err.message);
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-body text-[#0B0D10] pb-24">
      
      {/* ─── BREADCRUMB ─── */}
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <Link 
          to="/cars" 
          className="inline-flex items-center space-x-2 text-sm font-medium text-[#0B0D10]/50 hover:text-[#0B0D10] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Fleet</span>
        </Link>
      </div>

      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">
          
          {/* ─── LEFT COLUMN: IMAGES (Sticky on Desktop) ─── */}
          <div className="w-full lg:w-[50%] lg:sticky lg:top-8 space-y-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative w-full aspect-[4/3] bg-[#FAFAF9] rounded-[24px] sm:rounded-[32px] overflow-hidden flex items-center justify-center border border-[#D8D4C8]/40"
            >
              <img 
                src={mainImageUrl} 
                alt={`${car.brand} ${car.model}`}
                className="w-[90%] h-[90%] object-contain drop-shadow-2xl mix-blend-multiply transition-opacity duration-300"
              />
            </motion.div>

            {/* Thumbnails */}
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {galleryImages.map((url, idx) => {
                const isSelected = selectedImageIndex === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-20 h-20 sm:w-24 sm:h-24 rounded-[16px] bg-[#FAFAF9] overflow-hidden transition-all shrink-0 border-2 flex items-center justify-center ${
                      isSelected ? 'border-[#E8542E] shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`Thumbnail ${idx + 1}`} className="w-[80%] h-[80%] object-contain mix-blend-multiply" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* ─── RIGHT COLUMN: DETAILS & BOOKING ─── */}
          <div className="w-full lg:w-[50%] pt-4 lg:pt-0">
            
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center space-x-2 mb-2 text-[#0B0D10]/60 text-sm font-medium">
                <span className="capitalize">{car.category || 'Luxury'}</span>
                <span>•</span>
                <span>{car.year}</span>
              </div>
              <h1 className="font-display font-bold text-4xl sm:text-5xl text-[#0B0D10] tracking-tight leading-tight mb-4">
                {car.brand} {car.model}
              </h1>
              <p className="text-[#0B0D10]/70 text-base leading-relaxed">
                {car.description || `Experience the perfect blend of performance and luxury. The ${car.brand} ${car.model} offers an unforgettable driving experience tailored for your journey.`}
              </p>
            </div>

            {/* Booking Form */}
            <div className="bg-[#FAFAF9] rounded-[24px] p-6 sm:p-8 border border-[#D8D4C8] mb-8">
              <div className="flex items-end justify-between mb-6 pb-6 border-b border-[#D8D4C8]/50">
                <div>
                  <span className="text-[#0B0D10]/50 text-sm font-medium mb-1 block">Daily Rate</span>
                  <div className="flex items-baseline space-x-1">
                    <span className="font-display font-bold text-3xl text-[#0B0D10]">${car.daily_price}</span>
                    <span className="text-[#0B0D10]/50 text-sm font-medium">/ day</span>
                  </div>
                </div>
                {car.status === 'rented' && (
                  <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                    Unavailable
                  </span>
                )}
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#0B0D10]/70 mb-2 uppercase tracking-wider">
                      Pick-up
                    </label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-white border border-[#D8D4C8] px-4 py-3 rounded-xl text-sm font-medium text-[#0B0D10] focus:border-[#E8542E] focus:ring-1 focus:ring-[#E8542E] outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#0B0D10]/70 mb-2 uppercase tracking-wider">
                      Return
                    </label>
                    <input
                      type="date"
                      required
                      min={startDate || new Date().toISOString().split('T')[0]}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-white border border-[#D8D4C8] px-4 py-3 rounded-xl text-sm font-medium text-[#0B0D10] focus:border-[#E8542E] focus:ring-1 focus:ring-[#E8542E] outline-none transition-all"
                    />
                  </div>
                </div>

                {totalDays > 0 && (
                  <div className="flex justify-between items-center py-4 text-sm font-medium">
                    <span className="text-[#0B0D10]/60">${car.daily_price} x {totalDays} days</span>
                    <span className="font-bold text-[#0B0D10] text-lg">${totalPrice}</span>
                  </div>
                )}

                {bookingError && (
                  <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl text-center">
                    {bookingError}
                  </div>
                )}
                {bookingSuccess && (
                  <div className="p-3 bg-green-50 text-green-700 text-sm font-medium rounded-xl text-center">
                    {bookingSuccess}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isBooking || car.status === 'rented'}
                  className="w-full py-4 bg-[#E8542E] hover:bg-[#D44723] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-base transition-colors shadow-sm"
                >
                  {isBooking ? 'Processing...' : car.status === 'rented' ? 'Not Available' : 'Reserve This Vehicle'}
                </button>
              </form>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 mb-10 pt-2">
              <div className="text-center space-y-2">
                <div className="mx-auto w-10 h-10 bg-[#FAFAF9] rounded-full flex items-center justify-center border border-[#D8D4C8]/50">
                  <ShieldCheck className="w-5 h-5 text-[#0B0D10]/70" />
                </div>
                <p className="text-xs font-medium text-[#0B0D10]/70 leading-tight">Fully<br/>Insured</p>
              </div>
              <div className="text-center space-y-2">
                <div className="mx-auto w-10 h-10 bg-[#FAFAF9] rounded-full flex items-center justify-center border border-[#D8D4C8]/50">
                  <Clock className="w-5 h-5 text-[#0B0D10]/70" />
                </div>
                <p className="text-xs font-medium text-[#0B0D10]/70 leading-tight">Cancel<br/>Anytime</p>
              </div>
              <div className="text-center space-y-2">
                <div className="mx-auto w-10 h-10 bg-[#FAFAF9] rounded-full flex items-center justify-center border border-[#D8D4C8]/50">
                  <Sparkles className="w-5 h-5 text-[#0B0D10]/70" />
                </div>
                <p className="text-xs font-medium text-[#0B0D10]/70 leading-tight">Clean &<br/>Ready</p>
              </div>
            </div>

            {/* Tabs for Details */}
            <div className="border border-[#D8D4C8] rounded-[24px] overflow-hidden">
              <div className="flex border-b border-[#D8D4C8]">
                <button 
                  onClick={() => setActiveTab('specs')}
                  className={`flex-1 py-4 text-sm font-semibold transition-colors ${activeTab === 'specs' ? 'bg-[#FAFAF9] text-[#0B0D10]' : 'bg-white text-[#0B0D10]/50 hover:text-[#0B0D10]'}`}
                >
                  Specifications
                </button>
                <div className="w-px bg-[#D8D4C8]"></div>
                <button 
                  onClick={() => setActiveTab('features')}
                  className={`flex-1 py-4 text-sm font-semibold transition-colors ${activeTab === 'features' ? 'bg-[#FAFAF9] text-[#0B0D10]' : 'bg-white text-[#0B0D10]/50 hover:text-[#0B0D10]'}`}
                >
                  Features
                </button>
              </div>
              
              <div className="p-6 bg-white min-h-[200px]">
                {activeTab === 'specs' && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="grid grid-cols-2 gap-y-6 gap-x-4"
                  >
                    <div>
                      <span className="text-xs text-[#0B0D10]/50 uppercase tracking-wider block mb-1">Transmission</span>
                      <div className="flex items-center space-x-2 text-[#0B0D10] font-medium">
                        <Gauge className="w-4 h-4 text-[#E8542E]" />
                        <span className="capitalize">{car.transmission || 'Automatic'}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-[#0B0D10]/50 uppercase tracking-wider block mb-1">Passengers</span>
                      <div className="flex items-center space-x-2 text-[#0B0D10] font-medium">
                        <Users className="w-4 h-4 text-[#E8542E]" />
                        <span>{car.seats || 4} Seats</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-[#0B0D10]/50 uppercase tracking-wider block mb-1">Fuel Type</span>
                      <div className="flex items-center space-x-2 text-[#0B0D10] font-medium">
                        <Fuel className="w-4 h-4 text-[#E8542E]" />
                        <span className="capitalize">{car.fuel_type || 'Petrol'}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-[#0B0D10]/50 uppercase tracking-wider block mb-1">Category</span>
                      <div className="flex items-center space-x-2 text-[#0B0D10] font-medium">
                        <Car className="w-4 h-4 text-[#E8542E]" />
                        <span className="capitalize">{car.category || 'Luxury'}</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'features' && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center space-x-3 text-sm font-medium text-[#0B0D10]">
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                      <span>24/7 Roadside Assistance</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm font-medium text-[#0B0D10]">
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                      <span>Free Delivery within 50km</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm font-medium text-[#0B0D10]">
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                      <span>Comprehensive Damage Waiver</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm font-medium text-[#0B0D10]">
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                      <span>Premium Audio System</span>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
      <div className="mt-24">
        <Footer />
      </div>
    </div>
  );
}

export default CarDetail;
