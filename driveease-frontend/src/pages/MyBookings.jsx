import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Car, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  XCircle, 
  CheckCircle2, 
  AlertCircle,
  Fuel,
  Gauge,
  DollarSign,
  Filter,
  RefreshCw,
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';
import GradientButton from '../components/ui/gradient-button';
import { Announcement, AnnouncementTag, AnnouncementTitle } from '../components/ui/announcement';
import Footer from '../components/Footer';
import { API_URL } from '../config';

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelingId, setCancelingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    let mounted = true;

    const fetchBookings = async (session) => {
      try {
        setLoading(true);
        setError(null);
        if (!session) {
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_URL}/bookings`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });
        
        if (!res.ok) {
          throw new Error('Failed to load your bookings');
        }

        const data = await res.json();
        if (mounted) {
          setBookings(data || []);
        }
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // Get current session and listen for changes
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && mounted) fetchBookings(session);
      else if (mounted) setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && mounted) fetchBookings(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking reservation?')) return;

    try {
      setCancelingId(bookingId);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`${API_URL}/bookings/${bookingId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to cancel booking');
      }

      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: data.status || 'cancelled' } : b))
      );
    } catch (err) {
      alert(err.message);
    } finally {
      setCancelingId(null);
    }
  };

  const getImage = (booking) => {
    const v = booking.vehicles;
    if (!v) return '/images/hero_sports.png';
    const images = v.vehicle_images || v.images;
    if (images && images.length > 0 && images[0].storage_path) {
      return supabase.storage.from('vehicle-images').getPublicUrl(images[0].storage_path).data.publicUrl;
    }
    return '/images/hero_sports.png';
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'approved':
      case 'active':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
          dot: 'bg-emerald-500',
          label: s === 'active' ? 'Active Rental' : 'Approved'
        };
      case 'pending':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200/80',
          dot: 'bg-amber-500 animate-pulse',
          label: 'Pending Approval'
        };
      case 'completed':
        return {
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
          dot: 'bg-indigo-500',
          label: 'Completed'
        };
      case 'cancelled':
      case 'rejected':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200/80',
          dot: 'bg-rose-500',
          label: s === 'rejected' ? 'Rejected' : 'Cancelled'
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
          label: status
        };
    }
  };

  const calculateDays = (start, end) => {
    if (!start || !end) return 1;
    const s = new Date(start);
    const e = new Date(end);
    const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Filters
  const filteredBookings = bookings.filter((b) => {
    if (statusFilter === 'All') return true;
    if (statusFilter === 'Active') return ['active', 'approved'].includes(b.status?.toLowerCase());
    if (statusFilter === 'Pending') return b.status?.toLowerCase() === 'pending';
    if (statusFilter === 'Completed') return b.status?.toLowerCase() === 'completed';
    if (statusFilter === 'Cancelled') return ['cancelled', 'rejected'].includes(b.status?.toLowerCase());
    return true;
  });

  const totalSpent = bookings
    .filter(b => !['cancelled', 'rejected'].includes(b.status?.toLowerCase()))
    .reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);

  const activeCount = bookings.filter(b => ['active', 'approved', 'pending'].includes(b.status?.toLowerCase())).length;

  return (
    <div className="min-h-screen bg-[#FAFAF9] font-body text-[#0B0D10] pt-24 pb-24 px-4 sm:px-8">
      <div className="max-w-[1140px] mx-auto space-y-8">
        
        {/* ─── PAGE HEADER ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative bg-[#F4F4F2] rounded-[32px] p-8 md:p-10 border border-[#D8D4C8]/60 overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm"
        >
          <div className="space-y-3 z-10">
            <Announcement themed className="bg-emerald-50 text-[#1A6340] border-emerald-200/80 hover:bg-emerald-100/60 transition-colors">
              <AnnouncementTag className="bg-[#1A6340] text-white font-bold">DriveEase Perks</AnnouncementTag>
              <AnnouncementTitle>
                24/7 Roadside Assistance & VIP Support included on active reservations
                <ArrowUpRight size={14} className="shrink-0 opacity-70" />
              </AnnouncementTitle>
            </Announcement>

            <h1 className="font-display font-bold text-3xl md:text-4xl text-[#0B0D10] tracking-tight">
              My Bookings & Reservations
            </h1>
            <p className="text-slate-500 text-sm max-w-lg">
              Track your vehicle rentals, check status updates, manage upcoming trips, or cancel pending requests.
            </p>
          </div>

          {/* Quick Actions / Link to Fleet */}
          <div className="z-10 shrink-0">
            <Link to="/cars">
              <GradientButton className="text-sm px-5 py-3 shadow-md">
                Browse Fleet & Book <ArrowRight size={15} className="ml-1" />
              </GradientButton>
            </Link>
          </div>
        </motion.div>

        {/* ─── SUMMARY STATS BAR ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 border border-[#D8D4C8]/50 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#1A6340] flex items-center justify-center font-bold">
              <Car size={22} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Total Reservations</p>
              <p className="font-display font-bold text-2xl text-[#0B0D10]">{bookings.length}</p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 border border-[#D8D4C8]/50 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock size={22} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Active & Pending Trips</p>
              <p className="font-display font-bold text-2xl text-[#0B0D10]">{activeCount}</p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 border border-[#D8D4C8]/50 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <DollarSign size={22} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Total Spent</p>
              <p className="font-display font-bold text-2xl text-[#0B0D10]">${totalSpent.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* ─── FILTER TABS ─── */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-b border-slate-200/80 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {['All', 'Active', 'Pending', 'Completed', 'Cancelled'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  statusFilter === tab
                    ? 'bg-[#0B0D10] text-white shadow-sm'
                    : 'bg-white/80 text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <p className="text-xs text-slate-400 font-medium">
            Showing {filteredBookings.length} {filteredBookings.length === 1 ? 'booking' : 'bookings'}
          </p>
        </div>

        {/* ─── BOOKINGS CONTENT AREA ─── */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-4 border-[#1A6340] border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 text-sm font-medium">Fetching your bookings...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-6 text-center space-y-2">
            <AlertCircle className="mx-auto text-rose-500" size={32} />
            <p className="font-bold text-base">Unable to load bookings</p>
            <p className="text-xs text-rose-600">{error}</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 backdrop-blur-md rounded-3xl p-12 border border-[#D8D4C8]/60 text-center space-y-5 shadow-sm"
          >
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Car size={32} />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="font-display font-bold text-xl text-[#0B0D10]">No bookings found</h3>
              <p className="text-xs text-slate-400">
                {statusFilter === 'All'
                  ? "You haven't made any vehicle reservations yet. Choose your favorite car from our luxury fleet!"
                  : `You have no ${statusFilter.toLowerCase()} bookings at the moment.`}
              </p>
            </div>
            <Link to="/cars" className="inline-block pt-2">
              <GradientButton className="text-xs px-6 py-2.5">
                Explore Vehicles <ChevronRight size={14} className="ml-1" />
              </GradientButton>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-5">
            <AnimatePresence>
              {filteredBookings.map((booking, index) => {
                const badge = getStatusBadge(booking.status);
                const vehicle = booking.vehicles || {};
                const carName = vehicle.brand ? `${vehicle.brand} ${vehicle.model}` : (booking.vehicle_brand ? `${booking.vehicle_brand} ${booking.vehicle_model}` : 'Rental Vehicle');
                const days = calculateDays(booking.start_date, booking.end_date);
                const canCancel = ['pending', 'approved'].includes((booking.status || '').toLowerCase());

                return (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="bg-white/90 backdrop-blur-xl rounded-3xl border border-[#D8D4C8]/60 p-6 shadow-sm hover:shadow-md transition-all group flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6"
                  >
                    {/* Left: Car Image & Info */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 flex-1 min-w-0">
                      {/* Car Thumbnail */}
                      <div className="w-full sm:w-40 h-28 rounded-2xl bg-[#F4F4F2] border border-slate-200/60 overflow-hidden shrink-0 flex items-center justify-center p-2 relative group-hover:bg-[#ECECE9] transition-colors">
                        <img
                          src={getImage(booking)}
                          alt={carName}
                          className="w-full h-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>

                      {/* Details */}
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-display font-bold text-xl text-[#0B0D10] truncate">
                            {carName}
                          </h3>
                          {vehicle.category && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                              {vehicle.category}
                            </span>
                          )}
                        </div>

                        {/* Dates & Duration */}
                        <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                          <span className="flex items-center gap-1.5 font-medium bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                            <Calendar size={13} className="text-[#1A6340]" />
                            {formatDate(booking.start_date)} ➔ {formatDate(booking.end_date)}
                          </span>
                          <span className="font-semibold text-slate-700 bg-emerald-50 text-[#1A6340] px-2.5 py-1 rounded-lg border border-emerald-100">
                            {days} {days === 1 ? 'Day' : 'Days'}
                          </span>
                        </div>

                        {/* Car Features Pills if available */}
                        {(vehicle.fuel_type || vehicle.transmission) && (
                          <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                            {vehicle.fuel_type && (
                              <span className="flex items-center gap-1">
                                <Fuel size={12} /> {vehicle.fuel_type}
                              </span>
                            )}
                            {vehicle.transmission && (
                              <span className="flex items-center gap-1">
                                <Gauge size={12} /> {vehicle.transmission}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Status, Price & Cancel Action */}
                    <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100 shrink-0 gap-4">
                      {/* Status Badge */}
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${badge.bg}`}>
                        <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                        {badge.label}
                      </span>

                      {/* Total Price */}
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-medium block uppercase tracking-wider">Total Price</span>
                        <span className="font-display font-bold text-2xl text-[#0B0D10]">
                          ${Number(booking.total_price || 0).toLocaleString()}
                        </span>
                      </div>

                      {/* Cancel Action */}
                      {canCancel && (
                        <button
                          onClick={() => handleCancel(booking.id)}
                          disabled={cancelingId === booking.id}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200/80 hover:bg-rose-100 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                        >
                          {cancelingId === booking.id ? (
                            <>
                              <RefreshCw size={13} className="animate-spin" /> Cancelling...
                            </>
                          ) : (
                            <>
                              <XCircle size={13} /> Cancel Reservation
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="mt-20">
        <Footer />
      </div>
    </div>
  );
}

export default MyBookings;
